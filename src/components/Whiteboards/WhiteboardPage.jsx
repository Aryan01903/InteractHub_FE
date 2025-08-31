import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import Loader from "../common/Loader";
import { BiArrowBack } from "react-icons/bi";
import { MdUndo } from "react-icons/md";

export default function WhiteboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [whiteboard, setWhiteboard] = useState(null);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);

  // History handling
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Mouse drawing status (kept outside of React state to avoid re-renders)
  const drawing = useRef(false);

  // Fetch whiteboard data
  useEffect(() => {
    const fetchWhiteboardData = async () => {
      setLoader(true);
      setError(null);
      try {
        const whiteboardRes = await axiosInstance.get(`/whiteboard/get/${id}`);
        setWhiteboard(whiteboardRes.data);
      } catch (err) {
        setError(`Failed to fetch whiteboard data: ${err.message}`);
      } finally {
        setLoader(false);
      }
    };
    fetchWhiteboardData();
  }, [id]);

  // Save canvas state in history
  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const prevImage = new window.Image();
      prevImage.src = history[historyStep - 1];
      prevImage.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(prevImage, 0, 0);
        setHistoryStep(historyStep - 1);
      };
    }
  };

  // Update whiteboard on server
  const handleUpdateWhiteboard = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png", 0.7);
    try {
      await axiosInstance.put(`/whiteboard/update/${id}`, { data: imageData });
      alert("✅ Whiteboard updated successfully!");
    } catch (err) {
      setError(`Failed to update whiteboard: ${err.message}`);
    }
  };

  // Main canvas/drawing setup (no "drawing" state in deps!)
  useEffect(() => {
    const canvas = canvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!canvas || !cursorCanvas) return;
    const ctx = canvas.getContext("2d");
    const cursorCtx = cursorCanvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;
    cursorCanvas.width = 800;
    cursorCanvas.height = 600;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Load existing board image
    if (whiteboard && whiteboard.data) {
      const image = new window.Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        // Save initial state
        saveHistory();
      };
      image.src = whiteboard.data;
    }

    // Get mouse position relative to canvas
    const getMousePos = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) * canvas.width) / rect.width,
        y: ((event.clientY - rect.top) * canvas.height) / rect.height,
      };
    };

    // Draw cursor preview
    const drawCursor = (x, y) => {
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      cursorCtx.strokeStyle = "rgba(0,0,0,0.5)";
      cursorCtx.lineWidth = 1;
      cursorCtx.beginPath();
      cursorCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      cursorCtx.stroke();
    };

    // Mouse event handlers (no React state updates inside)
    const handleMouseDown = (e) => {
      const pos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = isEraser ? "#FFFFFF" : brushColor;
      ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
      drawing.current = true;
      drawCursor(pos.x, pos.y);
    };
    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      drawCursor(pos.x, pos.y);
      if (!drawing.current) return;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };
    const handleMouseUp = () => {
      if (drawing.current) {
        ctx.closePath();
        saveHistory();
      }
      drawing.current = false;
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    // Cursor movement for preview
    canvas.addEventListener("mouseenter", (e) => {
      const pos = getMousePos(e);
      drawCursor(pos.x, pos.y);
    });

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [whiteboard, brushSize, brushColor, isEraser]); // No "drawing" here!

  // UI Rendering remains unchanged
  return (
    <div className="p-6">
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <h1 className="text-5xl text-[#3aabb7] font-bold mb-6 text-center">
        ✏️ Whiteboard
      </h1>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-full shadow hover:bg-gray-600 transition"
            >
              <BiArrowBack /> Back
            </button>
            <button
              onClick={handleUpdateWhiteboard}
              className="px-4 py-2 bg-[#3aabb7] text-white rounded-full shadow hover:bg-[#48C4D3] transition"
            >
              💾 Save
            </button>
            <button
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow transition ${
                historyStep <= 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
            >
              <MdUndo /> Undo
            </button>
            <button
              onClick={() => setIsEraser((v) => !v)}
              className={`px-4 py-2 rounded-full shadow transition ${
                isEraser
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {isEraser ? "🖌️ Brush" : "🧽 Eraser"}
            </button>
          </div>
          <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
            <div className="flex items-center gap-2">
              <label className="font-medium">✏️ Brush Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
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
              width="800"
              height="600"
              className="absolute top-0 left-0 bg-white"
              style={{ touchAction: "none" }}
            />
            <canvas
              ref={cursorCanvasRef}
              width="800"
              height="600"
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
