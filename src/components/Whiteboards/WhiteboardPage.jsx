import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import Loader from "../common/Loader";
import { BiArrowBack } from "react-icons/bi";
import { MdUndo } from "react-icons/md";
import io from "socket.io-client";
import debounce from "lodash/debounce";
import throttle from "lodash/throttle";
import { v4 as uuidv4 } from "uuid";

export default function WhiteboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [whiteboard, setWhiteboard] = useState(null);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(null); // For Socket.IO errors
  const canvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const drawing = useRef(false);
  const prevPos = useRef(null);
  const currentStrokeId = useRef(null);
  const lastStrokeId = useRef(null);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("https://boardstack.onrender.com", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    const socket = socketRef.current;

    socket.emit("joinBoard", id);

    socket.on("connect", () => {
      console.log("Connected/Reconnected, joining board:", id);
      socket.emit("joinBoard", id);
      setConnectionError(null);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setConnectionError("Failed to connect to server. Retrying...");
    });

    socket.on("whiteboardUpdate", (data) => {
      console.log("Received whiteboardUpdate:", data);
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      ctx.strokeStyle = data.eraser ? "#FFF" : data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = data.eraser ? "destination-out" : "source-over";

      if (data.strokeId !== lastStrokeId.current || data.isNewStroke) {
        ctx.beginPath();
        ctx.moveTo(data.x0, data.y0);
      } else {
        ctx.moveTo(data.x0, data.y0);
      }
      ctx.lineTo(data.x1, data.y1);
      ctx.stroke();
      lastStrokeId.current = data.strokeId;
    });

    socket.on("initialWhiteboardState", ({ data }) => {
      console.log("Received initialWhiteboardState");
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveHistory();
      };
      img.src = data;
    });

    return () => socket.disconnect();
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoader(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/whiteboard/get/${id}`);
        setWhiteboard(res.data);
      } catch (err) {
        setError(`Failed to fetch whiteboard: ${err.message}`);
      } finally {
        setLoader(false);
      }
    })();
  }, [id]);

  const saveHistory = () => {
    const url = canvasRef.current.toDataURL();
    const newHist = history.slice(0, historyStep + 1);
    newHist.push(url);
    setHistory(newHist);
    setHistoryStep(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = history[historyStep - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryStep((hs) => hs - 1);
      };
    }
  };

  const debouncedSave = useCallback(
    debounce(async () => {
      if (!canvasRef.current) return;
      const data = canvasRef.current.toDataURL("image/png", 0.8);
      try {
        await axiosInstance.put(`/whiteboard/update/${id}`, { data });
        console.log("Auto-saved whiteboard");
      } catch (error) {
        console.error("Auto-save failed:", error.message);
      }
    }, 500),
    [id]
  );

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.type.startsWith("touch")) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: ((clientX - rect.left) * canvasRef.current.width) / rect.width,
      y: ((clientY - rect.top) * canvasRef.current.height) / rect.height,
    };
  };

  const drawCursor = (x, y) => {
    const cursorCtx = cursorCanvasRef.current.getContext("2d");
    cursorCtx.clearRect(0, 0, cursorCanvasRef.current.width, cursorCanvasRef.current.height);
    cursorCtx.strokeStyle = "rgba(0,0,0,0.5)";
    cursorCtx.lineWidth = 1;
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
    cursorCtx.stroke();
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? "#FFF" : brushColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    drawing.current = true;
    prevPos.current = pos;
    currentStrokeId.current = uuidv4();
    drawCursor(pos.x, pos.y);
  };

  const throttledEmit = useCallback(
    throttle((emitData) => {
      socketRef.current.emit("whiteboardUpdate", emitData);
      console.log("Emitted whiteboardUpdate:", emitData);
    }, 50),
    []
  );

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    drawCursor(pos.x, pos.y);
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    throttledEmit({
      boardId: id,
      data: {
        x0: prevPos.current.x,
        y0: prevPos.current.y,
        x1: pos.x,
        y1: pos.y,
        color: brushColor,
        size: brushSize,
        eraser: isEraser,
        strokeId: currentStrokeId.current,
        isNewStroke: prevPos.current.x === pos.x && prevPos.current.y === pos.y,
      },
    });

    prevPos.current = pos;
    debouncedSave();
  };

  const handleMouseUp = () => {
    if (drawing.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.closePath();
      saveHistory();
      drawing.current = false;
      currentStrokeId.current = null;
      const cursorCtx = cursorCanvasRef.current.getContext("2d");
      cursorCtx.clearRect(0, 0, cursorCanvasRef.current.width, cursorCanvasRef.current.height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!canvas || !cursorCanvas) return;

    canvas.width = cursorCanvas.width = 800;
    canvas.height = cursorCanvas.height = 600;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = ctx.lineJoin = "round";

    if (whiteboard?.data) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveHistory();
      };
      img.src = whiteboard.data;
    }
  }, [whiteboard]);

  return (
    <div className="p-6">
      {error && <p className="text-red-500 mb-3">{error}</p>}
      {connectionError && <p className="text-yellow-500 mb-3">{connectionError}</p>}
      <h1 className="text-5xl text-[#3aabb7] font-bold mb-6 text-center">✏️ Whiteboard</h1>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="flex gap-3 mb-4 justify-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-full shadow hover:bg-gray-600 transition">
              <BiArrowBack /> Back
            </button>
            <button
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className={`${
                historyStep <= 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              } flex items-center gap-2 px-4 py-2 rounded-full shadow transition`}
            >
              <MdUndo /> Undo
            </button>
            <button
              onClick={() => setIsEraser((v) => !v)}
              className={`${
                isEraser ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-600 text-white hover:bg-gray-700"
              } px-4 py-2 rounded-full shadow transition`}
            >
              {isEraser ? "🖌️ Brush" : "🧽 Eraser"}
            </button>
          </div>
          <div className="flex gap-4 mb-6 justify-center items-center">
            <div className="flex items-center gap-2">
              <label className="font-medium">✏️ Brush Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(+e.target.value)}
                className="w-32"
              />
              <span>{brushSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">🎨 Color:</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-10 h-10 rounded"
                disabled={isEraser}
              />
            </div>
          </div>
          <div className="relative mx-auto w-[800px] h-[600px] shadow-xl rounded-lg overflow-hidden border border-gray-300">
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 bg-white"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            />
            <canvas
              ref={cursorCanvasRef}
              className="absolute top-0 left-0"
              style={{
                touchAction: "none",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
