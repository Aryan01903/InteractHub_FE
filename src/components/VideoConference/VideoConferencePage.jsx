import { useEffect, useRef, useState, memo } from "react";
import { useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  Message,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import PropTypes from 'prop-types';

const socket = io("https://boardstack.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});

const VideoGrid = memo(({ videoCount, localVideoRef, userName, cameraOn, screenSharing, remoteStreams, users, remoteVideoRefs }) => {
  const getGridClasses = (count) => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 md:grid-cols-2";
    if (count <= 9) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-3 md:grid-cols-4";
  };

  return (
    <div className={`grid ${getGridClasses(videoCount)} gap-4 flex-grow mb-4 overflow-y-auto`}>
      <div className="relative w-full h-full min-h-48 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!cameraOn && !screenSharing ? 'hidden' : ''}`}
        />
        <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded text-sm">
          {userName || "You"}
        </span>
        {!cameraOn && !screenSharing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.555-4.555c.617-.617.202-1.688-.698-1.688H5.143C4.243 3.757 3.828 4.828 4.445 5.445L9 10m6 0v6.75A2.25 2.25 0 0112.75 19h-1.5A2.25 2.25 0 019 16.75V10"
              />
            </svg>
          </div>
        )}
        {screenSharing && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
            SCREEN SHARING
          </div>
        )}
      </div>
      {remoteStreams.map((r) => (
        <div
          key={r.id}
          className="relative w-full h-full min-h-48 bg-gray-700 rounded-lg shadow-xl overflow-hidden"
        >
          <video
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${!r.stream.getVideoTracks().length ? 'hidden' : ''}`}
            ref={(el) => {
              if (el && !remoteVideoRefs.current[r.id]) {
                remoteVideoRefs.current[r.id] = el;
                el.srcObject = r.stream;
              }
            }}
          />
          <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded text-sm">
            {users[r.id] || r.id.substring(0, 4)}
          </span>
          {!r.stream.getVideoTracks().length && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.555-4.555c.617-.617.202-1.688-.698-1.688H5.143C4.243 3.757 3.828 4.828 4.445 5.445L9 10m6 0v6.75A2.25 2.25 0 0112.75 19h-1.5A2.25 2.25 0 019 16.75V10"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

VideoGrid.displayName = 'VideoGrid';

VideoGrid.propTypes = {
  videoCount: PropTypes.number.isRequired,
  localVideoRef: PropTypes.object.isRequired,
  userName: PropTypes.string.isRequired,
  cameraOn: PropTypes.bool.isRequired,
  screenSharing: PropTypes.bool.isRequired,
  remoteStreams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      stream: PropTypes.instanceOf(MediaStream).isRequired,
    })
  ).isRequired,
  users: PropTypes.object.isRequired,
  remoteVideoRefs: PropTypes.object.isRequired,
};

export default function VideoConferencePage() {
  const { roomId } = useParams();
  const location = useLocation();
  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const peerConnections = useRef({});
  const remoteVideoRefs = useRef({});
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [started, setStarted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState({});
  const [participantCount, setParticipantCount] = useState(1);
  const [showNamePrompt, setShowNamePrompt] = useState(true);

  useEffect(() => {
    console.log("Current URL:", location.pathname);
    console.log("Extracted roomId:", roomId);
    console.log("Environment variables:", {
      VITE_TURN_URL: import.meta.env.VITE_TURN_URL,
      VITE_TURN_USERNAME: import.meta.env.VITE_TURN_USERNAME,
      VITE_TURN_CREDENTIAL: import.meta.env.VITE_TURN_CREDENTIAL ? "[REDACTED]" : undefined,
      VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
    });
    if (!import.meta.env.VITE_TURN_URL || !import.meta.env.VITE_TURN_USERNAME || !import.meta.env.VITE_TURN_CREDENTIAL) {
      console.warn("TURN server variables missing. Using STUN-only.");
      setChatMessages((prev) => [
        ...prev,
        { direction: "system", content: "TURN server configuration missing. Using STUN-only." },
      ]);
    }
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setChatMessages((prev) => [
        ...prev,
        { direction: "system", content: `Connected as ${userName || socket.id.substring(0, 4)}` },
      ]);
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setChatMessages((prev) => [
        ...prev,
        { direction: "system", content: `Failed to connect: ${error.message}` },
      ]);
    });
    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [userName]);

  const handleNameSubmit = () => {
    if (userName.trim()) {
      setShowNamePrompt(false);
      socket.emit("set-name", { roomId, name: userName.trim() });
      setUsers((prev) => ({ ...prev, [socket.id]: userName.trim() }));
      console.log("Name set:", userName.trim());
    }
  };

  const replaceVideoTrack = async (newTrack) => {
    if (!localStream.current) {
      console.error("No local stream available");
      return;
    }
    console.log("Replacing video track:", newTrack ? `Track: ${newTrack.kind} (id: ${newTrack.id})` : "No track");
    const audioTracks = localStream.current.getAudioTracks() || [];
    if (newTrack) {
      localVideoRef.current.srcObject = new MediaStream([newTrack, ...audioTracks].filter(Boolean));
    } else {
      localVideoRef.current.srcObject = null; // Clear the video source
    }

    const existingVideoTrack = localStream.current.getVideoTracks()[0];
    if (existingVideoTrack) {
      localStream.current.removeTrack(existingVideoTrack);
      existingVideoTrack.stop();
    }
    if (newTrack) {
      localStream.current.addTrack(newTrack);
    }

    await Promise.all(
      Object.entries(peerConnections.current).map(async ([socketId, pc]) => {
        if (pc.signalingState === "closed") return;
        try {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender && newTrack) {
            await sender.replaceTrack(newTrack);
          } else if (newTrack) {
            pc.addTrack(newTrack, localStream.current);
          } else {
            const senderToRemove = pc.getSenders().find((s) => s.track?.kind === "video");
            if (senderToRemove) {
              pc.removeTrack(senderToRemove);
            }
          }
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { offer, to: socketId });
          console.log(`Renegotiated offer sent for ${socketId}`);
        } catch (err) {
          console.error(`Error replacing track for ${socketId}:`, err);
          setChatMessages((prev) => [
            ...prev,
            { direction: "system", content: `Error updating video for ${users[socketId] || socketId.substring(0, 4)}: ${err.message}` },
          ]);
        }
      })
    );

    setCameraOn(!!newTrack);
  };

  const startCall = async () => {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Local stream:", stream.id, stream.getTracks());
      if (!stream.getVideoTracks().length) {
        console.warn("No video track. Retrying with audio only.");
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: "No video track. Check camera permissions." },
        ]);
        stream.getTracks().forEach((track) => track.stop());
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      localStream.current = stream;
      localVideoRef.current.srcObject = stream;
      setStarted(true);
      setCameraOn(!!stream.getVideoTracks().length);
      setMicOn(!!stream.getAudioTracks().length);
      if (roomId) {
        socket.emit("joinRoom", roomId);
        console.log(`Joined room: ${roomId}`);
      } else {
        console.error("No roomId");
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: "Invalid room ID." },
        ]);
        alert("Invalid room ID.");
      }
    } catch (error) {
      console.error("Error accessing media:", error);
      setChatMessages((prev) => [
        ...prev,
        { direction: "system", content: `Failed to access camera/microphone: ${error.message}` },
      ]);
      alert("Could not start video call. Check permissions.");
    }
  };

  const createPeerConnection = async (socketId, isInitiator) => {
    if (peerConnections.current[socketId]) {
      console.log(`Peer connection for ${socketId} exists`);
      return peerConnections.current[socketId];
    }
    if (!localStream.current) {
      console.warn(`No local stream for ${socketId}`);
      return null;
    }

    let pc;
    try {
      const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
      if (
        import.meta.env.VITE_TURN_URL &&
        import.meta.env.VITE_TURN_USERNAME &&
        import.meta.env.VITE_TURN_CREDENTIAL
      ) {
        iceServers.push({
          urls: import.meta.env.VITE_TURN_URL,
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        });
      }
      pc = new RTCPeerConnection({ iceServers });
      peerConnections.current[socketId] = pc;
    } catch (error) {
      console.error(`Failed to create RTCPeerConnection for ${socketId}:`, error);
      setChatMessages((prev) => [
        ...prev,
        { direction: "system", content: `Failed to connect to ${users[socketId] || socketId.substring(0, 4)}: ${error.message}` },
      ]);
      return null;
    }

    localStream.current.getTracks().forEach((track) => {
      if (track.readyState === "live") {
        pc.addTrack(track, localStream.current);
      }
    });

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;
      setRemoteStreams((prev) => {
        if (prev.some((s) => s.id === socketId && s.stream.id === stream.id)) {
          return prev;
        }
        return [...prev.filter((s) => s.id !== socketId), { id: socketId, stream }];
      });
      if (!stream.getVideoTracks().length) {
        console.warn(`No video track from ${socketId}`);
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `${users[socketId] || socketId.substring(0, 4)} has no video.` },
        ]);
        if (remoteVideoRefs.current[socketId]) {
          remoteVideoRefs.current[socketId].srcObject = null; // Clear video feed
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, to: socketId });
      }
    };

    pc.onicecandidateerror = (event) => {
      console.error(`ICE candidate error for ${socketId}:`, event);
      setChatMessages((prev) => [
        ...prev,
        { direction: "system", content: `ICE issue with ${users[socketId] || socketId.substring(0, 4)}: ${event.errorText || event.errorCode}` },
      ]);
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${socketId}: ${pc.connectionState}`);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        pc.close();
        delete peerConnections.current[socketId];
        delete remoteVideoRefs.current[socketId];
        setRemoteStreams((prev) => prev.filter((s) => s.id !== socketId));
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `${users[socketId] || socketId.substring(0, 4)} left.` },
        ]);
        setParticipantCount((prev) => Math.max(1, prev - 1));
      } else if (pc.connectionState === "connected") {
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `Connected to ${users[socketId] || socketId.substring(0, 4)}.` },
        ]);
      }
    };

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { offer, to: socketId });
      } catch (error) {
        console.error(`Error creating offer for ${socketId}:`, error);
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `Failed to connect to ${users[socketId] || socketId.substring(0, 4)}: ${error.message}` },
        ]);
        pc.close();
        delete peerConnections.current[socketId];
        return null;
      }
    }

    return pc;
  };

  useEffect(() => {
    if (!roomId) {
      console.error("No roomId provided");
      setChatMessages((prev) => [
        ...prev,
        { direction: "system", content: "Invalid room ID." },
      ]);
      return;
    }

    socket.on("new-user", async ({ socketId, name }) => {
      if (socketId === socket.id) return;
      setUsers((prev) => ({ ...prev, [socketId]: name || socketId.substring(0, 4) }));
      setParticipantCount((prev) => prev + 1);
      await createPeerConnection(socketId, true);
    });

    socket.on("set-name", ({ socketId, name }) => {
      setUsers((prev) => ({ ...prev, [socketId]: name || socketId.substring(0, 4) }));
    });

    socket.on("offer", async ({ offer, from }) => {
      let pc = peerConnections.current[from];
      if (!pc) {
        pc = await createPeerConnection(from, false);
        if (!pc) return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      } catch (error) {
        console.error(`Error handling offer from ${from}:`, error);
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `Failed to process offer from ${users[from] || from.substring(0, 4)}: ${error.message}` },
        ]);
      }
    });

    socket.on("answer", async ({ answer, from }) => {
      const pc = peerConnections.current[from];
      if (!pc) {
        console.error(`No peer connection for ${from}`);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error(`Error handling answer from ${from}:`, error);
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `Failed to process answer from ${users[from] || from.substring(0, 4)}: ${error.message}` },
        ]);
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      let pc = peerConnections.current[from];
      if (!pc) {
        pc = await createPeerConnection(from, false);
        if (!pc) return;
      }
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error(`Error adding ICE candidate from ${from}:`, error);
          setChatMessages((prev) => [
            ...prev,
            { direction: "system", content: `Failed to add ICE candidate from ${users[from] || from.substring(0, 4)}: ${error.message}` },
          ]);
        }
      }
    });

    socket.on("chat-message", ({ message, sender, senderName }) => {
      setChatMessages((prev) => [
        ...prev,
        { direction: "incoming", content: message || "Empty message", sender, senderName: senderName || users[sender] || sender.substring(0, 4) },
      ]);
    });

    socket.on("user-left", ({ socketId }) => {
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
        delete remoteVideoRefs.current[socketId];
        setRemoteStreams((prev) => prev.filter((s) => s.id !== socketId));
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `${users[socketId] || socketId.substring(0, 4)} left.` },
        ]);
        setUsers((prev) => {
          const newUsers = { ...prev };
          delete newUsers[socketId];
          return newUsers;
        });
        setParticipantCount((prev) => Math.max(1, prev - 1));
      }
    });

    return () => {
      socket.off("new-user");
      socket.off("set-name");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");
      socket.off("user-left");
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      Object.keys(remoteVideoRefs.current).forEach((key) => delete remoteVideoRefs.current[key]);
      localStream.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId]);

  const toggleCamera = async () => {
    if (!localStream.current) return;

    if (cameraOn) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        await replaceVideoTrack(null);
      }
    } else {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const camTrack = camStream.getVideoTracks()[0];
        await replaceVideoTrack(camTrack);
      } catch (error) {
        console.error("Could not access camera:", error);
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `Failed to access camera: ${error.message}` },
        ]);
        alert("Camera permission denied.");
      }
    }
    setScreenSharing(false);
  };

  const toggleMic = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
      console.log(`Microphone ${audioTrack.enabled ? "unmuted" : "muted"}`);
    }
  };

  const toggleScreenShare = async () => {
    if (!localStream.current) return;

    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        await replaceVideoTrack(screenTrack);
        screenTrack.onended = () => {
          if (screenSharing) toggleScreenShare();
        };
        setScreenSharing(true);
        setCameraOn(true);
      } catch (error) {
        console.error("Error starting screen share:", error);
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `Failed to start screen sharing: ${error.message}` },
        ]);
        alert("Could not start screen sharing.");
      }
    } else {
      try {
        const currentVideoTrack = localStream.current.getVideoTracks()[0];
        if (currentVideoTrack) currentVideoTrack.stop();
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const camTrack = camStream.getVideoTracks()[0];
        await replaceVideoTrack(camTrack);
        setScreenSharing(false);
        setCameraOn(true);
      } catch (error) {
        console.error("Error reverting to camera:", error);
        setChatMessages((prev) => [
          ...prev,
          { direction: "system", content: `Failed to revert to camera: ${error.message}` },
        ]);
        await replaceVideoTrack(null);
        setScreenSharing(false);
        setCameraOn(false);
        alert("Could not revert to camera.");
      }
    }
  };

  const sendMessage = () => {
    if (chatInput.trim() !== "") {
      const message = chatInput.trim();
      socket.emit("chat-message", { roomId, message, sender: socket.id, senderName: userName });
      setChatMessages((prev) => [
        ...prev,
        { direction: "outgoing", content: message, sender: socket.id, senderName: userName },
      ]);
      setChatInput("");
      console.log("Sent chat message:", message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {showNamePrompt && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Enter Your Name</h2>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="w-full p-2 border rounded mb-4"
              onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
            />
            <button
              onClick={handleNameSubmit}
              disabled={!userName.trim()}
              className="w-full px-4 py-2 bg-[#3aabb7] text-white disabled:bg-gray-400 rounded-3xl"
            >
              Join Call
            </button>
          </div>
        </div>
      )}
      <div className="w-3/4 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Room: {roomId || "Unknown"}</h2>
          <span className="text-sm bg-blue-100 text-[#3aabb7] px-3 py-1 rounded-full">
            Participants: {participantCount}
          </span>
        </div>
        <VideoGrid
          videoCount={1 + remoteStreams.length}
          localVideoRef={localVideoRef}
          userName={userName}
          cameraOn={cameraOn}
          screenSharing={screenSharing}
          remoteStreams={remoteStreams}
          users={users}
          remoteVideoRefs={remoteVideoRefs}
        />
        <div className="flex justify-center items-center p-3 bg-white rounded-xl shadow-lg">
          {!started ? (
            <button
              onClick={startCall}
              className="px-6 py-3 bg-[#3aabb7] text-white font-semibold rounded-full hover:bg-[#2e8992] transition-colors shadow-md"
              disabled={showNamePrompt}
            >
              Start Video Call
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${
                  cameraOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
                } text-white transition-colors`}
                title={cameraOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {cameraOn ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.555-4.555c.617-.617.202-1.688-.698-1.688H5.143C4.243 3.757 3.828 4.828 4.445 5.445L9 10m6 0v6.75A2.25 2.25 0 0112.75 19h-1.5A2.25 2.25 0 019 16.75V10"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.555-4.555c.617-.617.202-1.688-.698-1.688H5.143C4.243 3.757 3.828 4.828 4.445 5.445L9 10m6 0v6.75A2.25 2.25 0 0112.75 19h-1.5A2.25 2.25 0 019 16.75V10m6 0a2.25 2.25 0 10-4.5 0M9 10a2.25 2.25 0 10-4.5 0M6 18L18 6"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full ${
                  micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
                } text-white transition-colors`}
                title={micOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micOn ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-14 0v-2a7 7 0 1114 0v2zM12 18a4 4 0 01-4-4V7a4 4 0 018 0v7a4 4 0 01-4 4zM12 21a9 9 0 009-9h-2a7 7 0 01-14 0H3a9 9 0 009 9z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-14 0v-2a7 7 0 1114 0v2zM12 18a4 4 0 01-4-4V7a4 4 0 018 0v7a4 4 0 01-4 4zM6 18L18 6"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${
                  screenSharing ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                } text-white transition-colors`}
                title={screenSharing ? "Stop Sharing Screen" : "Share Screen"}
              >
                {screenSharing ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 16l4-4-4-4m4 8V8M3 17h18M5 3v14h14V3H5z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L12 14.75m0 0L14.25 17m-2.25-2.25V5.25M3 17h18M5 3v14h14V3H5z"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="w-1/4 border-l border-gray-300 h-full flex flex-col bg-white">
        <MainContainer responsive>
          <ChatContainer>
            <MessageList>
              <MessageSeparator content={`Room Chat (${participantCount} participants)`} />
              {chatMessages.map((msg, idx) => (
                <Message
                  key={idx}
                  model={{
                    message: msg.content,
                    direction: msg.direction === "outgoing" ? "outgoing" : "incoming",
                    position: "single",
                    type: "text",
                  }}
                >
                  {msg.direction === "system" && <Message.Header sender="System" />}
                  {msg.direction === "incoming" && (
                    <Message.Header sender={msg.senderName || users[msg.sender] || msg.sender?.substring(0, 4) || "Unknown"} />
                  )}
                  {msg.direction === "outgoing" && <Message.Header sender={userName || "You"} />}
                </Message>
              ))}
            </MessageList>
            <MessageInput
              placeholder="Type message here..."
              value={chatInput}
              onChange={(val) => setChatInput(val)}
              onSend={sendMessage}
              attachButton={false}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}