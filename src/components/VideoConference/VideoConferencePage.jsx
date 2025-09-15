import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  Message
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

// Connect to your backend
const socket = io("https://boardstack.onrender.com");

export default function VideoConferencePage() {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const peerConnections = useRef({}); // { socketId: RTCPeerConnection }
  const [remoteStreams, setRemoteStreams] = useState([]); // [{id, stream}]
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [started, setStarted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Join room
    socket.emit("joinRoom", roomId);

    // Handle offers from others
    socket.on("offer", async ({ offer, from }) => {
      await createPeerConnection(from, false, offer);
    });

    // Handle answers
    socket.on("answer", async ({ answer, from }) => {
      await peerConnections.current[from]?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Handle ICE candidates
    socket.on("ice-candidate", ({ candidate, from }) => {
      const pc = peerConnections.current[from];
      if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
    });

    // Handle new chat messages
    socket.on("chat-message", (message) => {
      setChatMessages((prev) => [...prev, { direction: "incoming", content: message }]);
    });

    // Remove remote video on user leave
    socket.on("user-left", ({ socketId }) => {
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
        setRemoteStreams((prev) => prev.filter((s) => s.id !== socketId));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const createPeerConnection = async (socketId, isInitiator, remoteOffer = null) => {
    if (peerConnections.current[socketId]) return;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerConnections.current[socketId] = pc;

    // Add local tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => pc.addTrack(track, localStream.current));
    }

    // Receive remote tracks
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => [
        ...prev.filter((s) => s.id !== socketId),
        { id: socketId, stream: event.streams[0] },
      ]);
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate, to: socketId });
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer, to: socketId });
    } else if (remoteOffer) {
      await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer, to: socketId });
    }
  };

  const startCall = async () => {
    setStarted(true);
    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = localStream.current;
  };

  const toggleCamera = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);

      if (!videoTrack.enabled) {
        // Stop camera to turn off flash/LED
        videoTrack.stop();
      } else {
        // Re-enable camera
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          const newTrack = stream.getVideoTracks()[0];
          localStream.current.addTrack(newTrack);

          Object.values(peerConnections.current).forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) sender.replaceTrack(newTrack);
          });

          localVideoRef.current.srcObject = localStream.current;
        });
      }
    }
  };

  const toggleMic = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      replaceVideoTrack(screenTrack);
      screenTrack.onended = () => toggleScreenShare();
      setScreenSharing(true);
    } else {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const camTrack = camStream.getVideoTracks()[0];
      replaceVideoTrack(camTrack);
      setScreenSharing(false);
    }
  };

  const replaceVideoTrack = (newTrack) => {
    const oldTrack = localStream.current.getVideoTracks()[0];
    if (oldTrack) oldTrack.stop();

    localStream.current.removeTrack(oldTrack);
    localStream.current.addTrack(newTrack);

    Object.values(peerConnections.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(newTrack);
    });

    localVideoRef.current.srcObject = localStream.current;
  };

  const sendMessage = () => {
    if (chatInput.trim() !== "") {
      socket.emit("chat-message", { roomId, message: chatInput });
      setChatMessages((prev) => [...prev, { direction: "outgoing", content: chatInput }]);
      setChatInput("");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-3/4 p-4 flex flex-col">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <video ref={localVideoRef} autoPlay muted playsInline className="rounded-lg shadow w-full" />
          {remoteStreams.map((r) => (
            <video
              key={r.id}
              autoPlay
              playsInline
              className="rounded-lg shadow w-full"
              ref={(el) => { if (el) el.srcObject = r.stream; }}
            />
          ))}
        </div>

        {!started ? (
          <button
            onClick={startCall}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Start Video Call
          </button>
        ) : (
          <div className="flex gap-4 mt-2">
            <button onClick={toggleCamera} className="px-4 py-2 bg-gray-700 text-white rounded">
              {cameraOn ? "Camera Off" : "Camera On"}
            </button>
            <button onClick={toggleMic} className="px-4 py-2 bg-gray-700 text-white rounded">
              {micOn ? "Mic Off" : "Mic On"}
            </button>
            <button onClick={toggleScreenShare} className="px-4 py-2 bg-green-600 text-white rounded">
              {screenSharing ? "Stop Sharing" : "Share Screen"}
            </button>
          </div>
        )}
      </div>

      <div className="w-1/4 border-l border-gray-200 h-full flex flex-col bg-white">
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {chatMessages.map((msg, idx) => (
                <Message key={idx} model={{ message: msg.content, direction: msg.direction }} />
              ))}
            </MessageList>
            <MessageInput
              placeholder="Type message..."
              value={chatInput}
              onChange={(val) => setChatInput(val)}
              onSend={sendMessage}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}
