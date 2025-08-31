import PropTypes from "prop-types";
import { useRef, useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import MemberListingModal from "./MemberListingCheckboxTable";
import axiosInstance from "../api/axios";
import DashboardHeader from "../common/DashboardHeader";
import DashboardSidebar from "../common/DashboardSidebar";

const socket = io("https://boardstack.onrender.com");

export default function VideoCall({ roomId }) {
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const localVideoRef = useRef();
  const peersRef = useRef([]);
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const role = localStorage.getItem("role");
  const tenantId = localStorage.getItem("tenantId");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      setStream(mediaStream);
      if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;

      socket.emit("joinRoom", roomId);

      socket.on("allParticipants", (participants) => {
        const peers = [];
        participants.forEach((participantID) => {
          const peer = createPeer(participantID, socket.id, mediaStream);
          peersRef.current.push({ peerID: participantID, peer });
          peers.push({ peerID: participantID, peer });
        });
        setPeers(peers);
        setCallStarted(true);
      });

      socket.on("userJoined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerID, mediaStream);
        peersRef.current.push({ peerID: payload.callerID, peer });
        setPeers((users) => [...users, { peerID: payload.callerID, peer }]);
        setCallStarted(true);
      });

      socket.on("receivingReturnedSignal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        if (item) item.peer.signal(payload.signal);
      });

      socket.on("userLeft", (id) => {
        const peerObj = peersRef.current.find((p) => p.peerID === id);
        if (peerObj) peerObj.peer.destroy();
        peersRef.current = peersRef.current.filter((p) => p.peerID !== id);
        setPeers((users) => users.filter((p) => p.peerID !== id));
      });

      socket.on("drawing", handleRemoteDrawing);
    });

    return () => {
      socket.disconnect();
      peersRef.current.forEach(({ peer }) => peer.destroy());
      peersRef.current = [];
      setPeers([]);
    };
  }, [roomId]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("sendingSignal", { userToSignal, callerID, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("returningSignal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const toggleCamera = () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    const newCameraState = !cameraOn;

    videoTrack.enabled = newCameraState;

    if (!newCameraState) {
      const capabilities = videoTrack.getCapabilities?.();
      if (capabilities?.torch) {
        videoTrack.applyConstraints({ advanced: [{ torch: false }] }).catch(console.error);
      }
    }

    setCameraOn(newCameraState);
  };

  const toggleAudio = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setAudioOn((prev) => !prev);
  };

  const toggleScreenShare = useCallback(async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        peersRef.current.forEach(({ peer }) => {
          const sender = peer._pc.getSenders().find((s) => s.track.kind === "video");
          sender.replaceTrack(screenTrack);
        });

        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        setScreenSharing(true);

        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (error) {
        console.error("Screen sharing error:", error);
      }
    } else {
      stopScreenShare();
    }
  }, [screenSharing]);

  const stopScreenShare = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      peersRef.current.forEach(({ peer }) => {
        const sender = peer._pc.getSenders().find((s) => s.track.kind === "video");
        sender.replaceTrack(track);
      });
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    setScreenSharing(false);
  };

  const startDrawing = ({ nativeEvent }) => {
    drawing.current = true;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    socket.emit("drawing", { offsetX, offsetY, type: "start" });
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing.current) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    socket.emit("drawing", { offsetX, offsetY, type: "draw" });
  };

  const stopDrawing = () => {
    drawing.current = false;
    socket.emit("drawing", { type: "stop" });
  };

  const handleRemoteDrawing = ({ offsetX, offsetY, type }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (type === "start") {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    } else if (type === "draw") {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (type === "stop") {
      ctx.closePath();
    }
  };

  const handleInviteConfirm = async (selectedMembers) => {
    setMembersModalOpen(false);

    if (role !== "admin") return alert("Only admins can create a call");

    try {
      await axiosInstance.post("/videoCall/create", {
        tenantId,
        emails: selectedMembers.map((m) => m.email),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        durationHours: 1,
      });
      alert("Invites sent!");
    } catch (err) {
      console.error("Error sending invites:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#333333]">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Video Call Room: {roomId}</h2>

          {role === "admin" && (
            <div className="mb-4 flex items-center gap-2">
              <label className="font-semibold">Schedule At:</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
          )}

          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setMembersModalOpen(true)}
              className="px-3 py-1 bg-[#3aabb7] text-white rounded"
            >
              Invite Members
            </button>
            <button
              onClick={toggleCamera}
              className="px-3 py-1 bg-[#3aabb7] text-white rounded"
            >
              {cameraOn ? "Camera Off" : "Camera On"}
            </button>
            <button
              onClick={toggleAudio}
              className="px-3 py-1 bg-[#3aabb7] text-white rounded"
            >
              {audioOn ? "Mute Audio" : "Unmute Audio"}
            </button>
            <button
              onClick={toggleScreenShare}
              className="px-3 py-1 bg-[#3aabb7] text-white rounded"
            >
              {screenSharing ? "Stop Sharing" : "Share Screen"}
            </button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <video
              ref={localVideoRef}
              muted
              autoPlay
              playsInline
              className="w-64 border border-[#3aabb7] rounded"
            />
            {peers.map(({ peerID, peer }) => (
              <Video key={peerID} peer={peer} />
            ))}
          </div>

          {!callStarted && <p className="mt-4">Waiting for others to join...</p>}

          <div className="mt-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="border border-[#3aabb7] rounded"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <p className="mt-2 text-sm text-gray-600">
              Use the whiteboard to draw collaboratively.
            </p>
          </div>
        </main>
      </div>

      <MemberListingModal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        onConfirm={handleInviteConfirm}
      />
    </div>
  );
}

// PropTypes
VideoCall.propTypes = {
  roomId: PropTypes.string.isRequired,
};

function Video({ peer }) {
  const ref = useRef();
  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [peer]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="w-64 border border-[#3aabb7] rounded"
    />
  );
}

// PropTypes for Video
Video.propTypes = {
  peer: PropTypes.object.isRequired,
};
