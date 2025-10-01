import { useState, useEffect, useRef, useReducer, useCallback } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
import axiosInstance from "../api/axios";
import { FaLink } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import DashboardSidebar from "../common/DashboardSidebar";
import DashboardHeader from "../common/DashboardHeader";
import { Loader } from "@chatscope/chat-ui-kit-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

function getFileIcon(type) {
  if (type?.startsWith("audio/")) return "🎵";
  if (type === "application/pdf") return "📄";
  return "📄";
}

function PreviewFile({ file, onRemove }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file.type?.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      return () => reader.abort();
    }
  }, [file]);

  return (
    <div className="flex items-center gap-2 mb-2 w-full max-w-[200px] sm:max-w-[300px]">
      {file.type?.startsWith("image/") && preview ? (
        <div className="relative">
          <img
            src={preview}
            alt={file.name}
            className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded"
            loading="lazy"
          />
          <button
            type="button"
            className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-sm bg-white rounded-full p-1"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
          >
            ✕
          </button>
        </div>
      ) : file.type === "application/pdf" ? (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getFileIcon(file.type)}</span>
          <a
            href={URL.createObjectURL(file)}
            download={file.name}
            className="text-blue-500 hover:underline truncate max-w-[120px] sm:max-w-[150px]"
            aria-label={`Download ${file.name}`}
            target="_main"
          >
            {file.name}
          </a>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 text-sm"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 border rounded p-2 bg-gray-100">
          <span className="text-2xl mr-1">{getFileIcon(file.type)}</span>
          {file.type?.startsWith("audio/") && (
            <audio controls src={URL.createObjectURL(file)} className="h-8" />
          )}
          <div className="truncate flex-1">{file.name}</div>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 text-sm"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

PreviewFile.propTypes = {
  file: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
};

const initialState = {
  messages: [],
  members: [],
  currentUser: {},
  newMessage: "",
  editingMessageId: null,
  selectedMessage: null,
  selectedFiles: [],
  showModal: false,
  status: {
    isSending: false,
    isDeleting: false,
    isUpdating: false,
    isLoadingUser: true,
  },
  unreadCount: 0,
  errorMessage: "",
  isTyping: new Set(),
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_MESSAGES": {
      return {
        ...state,
        messages: action.payload.reverse(),
        unreadCount: action.payload.filter(
          (m) => !m.readBy?.some((r) => r._id === state.currentUser._id)
        ).length,
      };
    }
    case "ADD_MESSAGE": {
      return {
        ...state,
        messages: [action.payload, ...state.messages],
        unreadCount:
          state.currentUser._id &&
          !action.payload.readBy?.some((r) => r._id === state.currentUser._id)
            ? state.unreadCount + 1
            : state.unreadCount,
      };
    }
    case "EDIT_MESSAGE": {
      return {
        ...state,
        messages: state.messages.map((m) =>
          m._id === action.payload._id ? action.payload : m
        ),
      };
    }
    case "DELETE_MESSAGE": {
      return {
        ...state,
        messages: state.messages.filter((m) => m._id !== action.payload),
        unreadCount: Math.max(
          0,
          state.unreadCount -
            (state.messages.find((m) => m._id === action.payload)?.readBy?.some(
              (r) => r._id === state.currentUser._id
            )
              ? 0
              : 1)
        ),
      };
    }
    case "SET_MEMBERS": {
      return { ...state, members: action.payload };
    }
    case "SET_CURRENT_USER": {
      return {
        ...state,
        currentUser: action.payload,
        status: { ...state.status, isLoadingUser: false },
      };
    }
    case "SET_NEW_MESSAGE": {
      return { ...state, newMessage: action.payload };
    }
    case "SET_EDITING_MESSAGE": {
      return {
        ...state,
        editingMessageId: action.payload.id,
        newMessage: action.payload.content,
        showModal: true,
      };
    }
    case "SET_SELECTED_MESSAGE": {
      return { ...state, selectedMessage: action.payload, showModal: true };
    }
    case "SET_SELECTED_FILES": {
      return { ...state, selectedFiles: action.payload };
    }
    case "SET_MODAL": {
      return {
        ...state,
        showModal: action.payload,
        selectedMessage: action.payload ? state.selectedMessage : null,
        editingMessageId: action.payload ? state.editingMessageId : null,
      };
    }
    case "SET_STATUS": {
      return { ...state, status: { ...state.status, ...action.payload } };
    }
    case "SET_ERROR": {
      return { ...state, errorMessage: action.payload };
    }
    case "ADD_TYPING": {
      return { ...state, isTyping: new Set([...state.isTyping, action.payload]) };
    }
    case "REMOVE_TYPING": {
      const newTyping = new Set(state.isTyping);
      newTyping.delete(action.payload);
      return { ...state, isTyping: newTyping };
    }
    case "SET_UNREAD_COUNT": {
      return { ...state, unreadCount: action.payload };
    }
    default: {
      return state;
    }
  }
}

function Message({ msg, currentUser, setSelectedMessage, sidesheetOpen }) {
  const isCurrentUser = msg.sender?._id === currentUser._id;
  const timestamp = new Date(msg.updatedAt).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });
  const [imagePreviews, setImagePreviews] = useState({});

  useEffect(() => {
    if (msg.files?.length > 0) {
      msg.files.forEach((file) => {
        if (file.mimetype?.startsWith("image/")) {
          const img = new Image();
          img.src = `${import.meta.env.VITE_SOCKET_URL}/uploads/${file.filename}`;
          img.onload = () => {
            setImagePreviews((prev) => ({
              ...prev,
              [file.filename]: img.src,
            }));
          };
          img.onerror = () => console.error(`Failed to load image: ${file.filename}`);
        }
      });
    }
  }, [msg.files]);

  return (
    <div className={`message-container ${isCurrentUser ? "ml-auto" : "mr-auto"}`} data-message-id={msg._id}>
      <div className="relative">
        {msg.files?.length > 0 ? (
          <div className="mt-2 space-y-2">
            {msg.files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {file.mimetype?.startsWith("image/") && imagePreviews[file.filename] ? (
                  <a
                    href={`${import.meta.env.VITE_SOCKET_URL}/uploads/${file.filename}`}
                    download={file.filename}
                    className="relative inline-block"
                    aria-label={`Download ${file.filename}`}
                    target="_main"
                  >
                    <img
                      src={imagePreviews[file.filename]}
                      alt={file.filename}
                      className="h-32 w-32 sm:h-48 sm:w-48 object-cover rounded"
                      loading="lazy"
                    />
                  </a>
                ) : file.mimetype?.startsWith("audio/") ? (
                  <div className={`p-3 rounded-lg ${isCurrentUser ? "bg-blue-200" : "bg-yellow-100"}`}>
                    <audio
                      controls
                      src={`${import.meta.env.VITE_SOCKET_URL}/uploads/${file.filename}`}
                      className="h-8"
                    />
                    <div className="text-xs text-gray-600 mt-1 truncate">{file.filename}</div>
                  </div>
                ) : file.mimetype === "application/pdf" ? (
                  <div
                    className={`p-3 rounded-lg border ${
                      isCurrentUser ? "bg-blue-200 border-blue-300" : "bg-yellow-100 border-yellow-300"
                    } flex items-center gap-2 w-full max-w-[250px]`}
                  >
                    <span className="text-2xl flex-shrink-0">{getFileIcon(file.mimetype)}</span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`${import.meta.env.VITE_SOCKET_URL}/uploads/${file.filename}`}
                        download={file.filename}
                        className="text-blue-500 hover:underline block truncate text-sm"
                        aria-label={`Download ${file.filename}`}
                        target="_main"
                      >
                        {file.filename}
                      </a>
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                )}
              </div>
            ))}
          </div>
        ) : null}
        {msg.content && (
          <div
            className={`p-3 rounded-lg ${isCurrentUser ? "bg-blue-200 text-right" : "bg-yellow-100 text-left"}`}
          >
            <div className="text-xs mb-1 font-semibold">
              {isCurrentUser ? "You" : msg.sender?.name || "Unknown"}
            </div>
            <div>{msg.content}</div>
            <div className="text-xs text-gray-500 flex justify-between mt-1">
              <span>{timestamp}</span>
              <span>{msg.readBy?.some((r) => r._id === currentUser._id) ? "✓ Read" : "Unread"}</span>
            </div>
          </div>
        )}
        {isCurrentUser && !sidesheetOpen && (
          <button
            className="absolute top-2 right-2 cursor-pointer text-blue-800 hover:text-blue-900 z-10"
            onClick={() => setSelectedMessage(msg)}
            aria-label="Message options"
          >
            ⋮
          </button>
        )}
      </div>
    </div>
  );
}

Message.propTypes = {
  msg: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  setSelectedMessage: PropTypes.func.isRequired,
  sidesheetOpen: PropTypes.bool.isRequired,
};

function MessageInput({ state, dispatch, handleSend, handleFileSelect, handleKeyPress, handleDrop, handleDragOver, handleDragEnter, handleDragLeave, dropAreaRef, handleTyping }) {
  return (
    <div
      className="message-input-container"
      ref={dropAreaRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {state.selectedFiles.length > 0 && (
        <div className="mb-2 space-y-2">
          {state.selectedFiles.map((file, idx) => (
            <PreviewFile
              key={idx}
              file={file}
              onRemove={() => dispatch({ type: "SET_SELECTED_FILES", payload: state.selectedFiles.filter((_, i) => i !== idx) })}
            />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={state.newMessage}
          onChange={(e) => {
            dispatch({ type: "SET_NEW_MESSAGE", payload: e.target.value });
            handleTyping();
          }}
          onKeyDown={handleKeyPress}
          disabled={state.status.isSending || state.status.isUpdating || state.status.isDeleting}
          aria-label="Message input"
        />
        <input
          type="file"
          className="hidden"
          id="fileInput"
          multiple
          accept={["image/jpeg", "image/jpg", "image/png", "audio/mpeg", "application/pdf"].join(",")}
          onChange={handleFileSelect}
        />
        <button
          onClick={() => document.getElementById("fileInput").click()}
          className="bg-green-500 text-white px-3 rounded disabled:opacity-50 hover:bg-green-600"
          disabled={state.status.isSending || state.status.isUpdating || state.status.isDeleting}
          title="Attach file"
          aria-label="Attach file"
        >
          <FaLink />
        </button>
        <button
          onClick={handleSend}
          disabled={state.status.isSending || state.status.isUpdating || state.status.isDeleting || (!state.newMessage.trim() && !state.selectedFiles.length)}
          className="bg-[#3aabb7] text-white px-3 sm:px-4 py-2 rounded disabled:opacity-50 hover:bg-[#2d8790] text-sm sm:text-base"
          title={state.status.isSending || state.status.isUpdating ? "Sending..." : state.editingMessageId ? "Update" : "Send"}
          aria-label={state.editingMessageId ? "Update message" : "Send message"}
        >
          {state.status.isSending || state.status.isUpdating ? "Sending..." : state.editingMessageId ? "Update" : "Send"}
        </button>
      </div>
    </div>
  );
}

MessageInput.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  handleSend: PropTypes.func.isRequired,
  handleFileSelect: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  handleDrop: PropTypes.func.isRequired,
  handleDragOver: PropTypes.func.isRequired,
  handleDragEnter: PropTypes.func.isRequired,
  handleDragLeave: PropTypes.func.isRequired,
  dropAreaRef: PropTypes.object.isRequired,
  handleTyping: PropTypes.func.isRequired,
};

function MembersPanel({ members, currentUser, sidesheetOpen, setSidesheetOpen }) {
  const sortedMembers = members.sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (b.role === "admin" && a.role !== "admin") return 1;
    return 0;
  });

  return (
    <div className={`members-panel ${sidesheetOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Members ({sortedMembers.length})</h3>
          <button
            onClick={() => setSidesheetOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close members panel"
          >
            ✕
          </button>
        </div>
        <ul className="space-y-2">
          {sortedMembers.map((member) => (
            <li key={member._id} className="p-2 hover:bg-gray-100 rounded">
              <div className="font-semibold text-sm sm:text-base">{member.name || "Unknown"}</div>
              {currentUser.role === "admin" && member.email && (
                <div className="text-xs text-gray-600">{member.email}</div>
              )}
              <div className="text-xs text-gray-500">{member._id === currentUser._id ? "You" : member.role === "admin" ? "Admin" : "Member"}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

MembersPanel.propTypes = {
  members: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  sidesheetOpen: PropTypes.bool.isRequired,
  setSidesheetOpen: PropTypes.func.isRequired,
};

function MessageOptionsModal({ state, dispatch, handleOptionSelect, getReadByNames, modalRef }) {
  return (
    state.showModal &&
    state.selectedMessage && (
      <div className="modal" aria-modal="true" role="dialog">
        <div ref={modalRef} className="modal-content space-y-4">
          <h3 className="text-lg font-semibold">Message Options</h3>
          {state.selectedMessage.sender?._id === state.currentUser._id && (
            <div className="space-y-2">
              <button
                onClick={() => handleOptionSelect("edit")}
                className="w-full bg-[#3aabb7] text-white py-2 rounded disabled:opacity-50 hover:bg-[#2d8790] text-sm sm:text-base"
                disabled={state.status.isSending || state.status.isUpdating || state.status.isDeleting}
                aria-label="Edit message"
              >
                Edit
              </button>
              <button
                onClick={() => handleOptionSelect("delete")}
                className="w-full bg-red-500 text-white py-2 rounded disabled:opacity-50 hover:bg-red-600 text-sm sm:text-base"
                disabled={state.status.isSending || state.status.isUpdating || state.status.isDeleting}
                aria-label="Delete message"
              >
                {state.status.isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
          <div className="text-sm">
            <p className="font-semibold">Read by:</p>
            <ul className="list-disc pl-5">
              {getReadByNames(state.selectedMessage.readBy).length > 0 ? (
                getReadByNames(state.selectedMessage.readBy).map((reader) => (
                  <li key={reader._id} className="text-sm">{reader.name}</li>
                ))
              ) : (
                <li className="text-sm">No one has read this message yet</li>
              )}
            </ul>
          </div>
          <button
            onClick={() => dispatch({ type: "SET_MODAL", payload: false })}
            className="w-full bg-gray-300 py-2 rounded hover:bg-gray-400 text-sm sm:text-base"
            aria-label="Cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  );
}

MessageOptionsModal.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  handleOptionSelect: PropTypes.func.isRequired,
  getReadByNames: PropTypes.func.isRequired,
  modalRef: PropTypes.object.isRequired,
};

function ChatWithOthers() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidesheetOpen, setSidesheetOpen] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dropAreaRef = useRef(null);
  const observerRef = useRef(null);
  const modalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isSendingRef = useRef(false);

  const token = localStorage.getItem("token") || "";
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "audio/mpeg", "application/pdf"];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const fetchMessages = useCallback(async () => {
    if (!state.currentUser._id) return;
    try {
      const res = await axiosInstance.get("/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch({ type: "SET_MESSAGES", payload: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error("Error fetching messages:", err.response?.data || err.message);
      dispatch({
        type: "SET_ERROR",
        payload: err.response?.status === 404 ? "No messages found." : "Failed to load messages.",
      });
    }
  }, [token, state.currentUser._id]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        dispatch({ type: "SET_STATUS", payload: { isLoadingUser: true } });
        const userRes = await axiosInstance.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: "SET_CURRENT_USER", payload: userRes.data?.user || {} });
      } catch (err) {
        console.error("Error fetching user details:", err.response?.data || err.message);
        dispatch({
          type: "SET_ERROR",
          payload: err.response?.status === 401 ? "Unauthorized. Please log in again." : "Failed to load user profile.",
        });
      }
    };

    const fetchMembers = async () => {
      try {
        const membersRes = await axiosInstance.get("/auth/members", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const membersData = Array.isArray(membersRes.data) ? membersRes.data : [];
        if (state.currentUser._id && !membersData.some((m) => m._id === state.currentUser._id)) {
          membersData.push(state.currentUser);
        }
        dispatch({
          type: "SET_MEMBERS",
          payload: membersData.sort((a, b) => (a.role === "admin" && b.role !== "admin" ? -1 : b.role === "admin" && a.role !== "admin" ? 1 : 0)),
        });
      } catch (err) {
        console.error("Error fetching members:", err.response?.data || err.message);
        dispatch({ type: "SET_ERROR", payload: "Failed to load members list." });
      }
    };

    if (token) {
      fetchUserDetails();
      if (state.currentUser._id) {
        fetchMembers();
      }
    } else {
      dispatch({ type: "SET_ERROR", payload: "No authentication token found. Please log in." });
    }
  }, [token, state.currentUser._id]);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      dispatch({ type: "SET_ERROR", payload: `Failed to connect to chat server: ${err.message}.` });
    });

    socketRef.current.on("error", ({ error }) => {
      console.error("Socket error:", error);
      dispatch({ type: "SET_ERROR", payload: error || "Socket error occurred." });
    });

    socketRef.current.on("newMessage", (msg) => {
      dispatch({ type: "ADD_MESSAGE", payload: msg });
    });

    socketRef.current.on("messageEdited", (editedMsg) => {
      dispatch({ type: "EDIT_MESSAGE", payload: editedMsg });
    });

    socketRef.current.on("messageDeleted", ({ messageId }) => {
      dispatch({ type: "DELETE_MESSAGE", payload: messageId });
    });

    socketRef.current.on("messageRead", (message) => {
      if (message.readBy?.some((r) => r._id === state.currentUser._id)) {
        dispatch({ type: "EDIT_MESSAGE", payload: message });
        dispatch({
          type: "SET_UNREAD_COUNT",
          payload: state.messages.filter((m) => !m.readBy?.some((r) => r._id === state.currentUser._id)).length,
        });
      }
    });

    socketRef.current.on("userTyping", ({ userId, name }) => {
      dispatch({ type: "ADD_TYPING", payload: `${userId}:${name}` });
    });

    socketRef.current.on("userStopTyping", ({ userId }) => {
      dispatch({ type: "REMOVE_TYPING", payload: `${userId}` });
    });

    return () => {
      socketRef.current?.off();
      socketRef.current?.disconnect();
    };
  }, [token, state.currentUser._id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!state.currentUser._id || !state.messages.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const message = state.messages.find((m) => m._id === messageId);
            if (message && !message.readBy?.some((r) => r._id === state.currentUser._id)) {
              try {
                await axiosInstance.put(`/messages/${messageId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
                socketRef.current.emit("markAsRead", messageId);
              } catch (err) {
                console.error("Error marking message as read:", err.response?.data || err.message);
                dispatch({ type: "SET_ERROR", payload: "Failed to mark message as read." });
              }
            }
          }
        });
      },
      { threshold: 0.8 }
    );

    document.querySelectorAll(".message-container").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [state.messages, state.currentUser._id, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        dispatch({ type: "SET_MODAL", payload: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (state.errorMessage) {
      const timeout = setTimeout(() => dispatch({ type: "SET_ERROR", payload: "" }), 5000);
      return () => clearTimeout(timeout);
    }
  }, [state.errorMessage]);

  const handleTyping = useCallback(() => {
    if (!typingTimeoutRef.current && state.currentUser._id) {
      socketRef.current.emit("typing");
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stopTyping");
        typingTimeoutRef.current = null;
      }, 3000);
    }
  }, [state.currentUser._id]);

  const handleSend = useCallback(async () => {
    if (isSendingRef.current || (!state.newMessage.trim() && !state.selectedFiles.length)) return;

    isSendingRef.current = true;
    dispatch({ type: "SET_STATUS", payload: { isSending: true, isUpdating: !!state.editingMessageId } });
    dispatch({ type: "SET_ERROR", payload: "" });

    try {
      const formData = new FormData();
      if (state.newMessage.trim()) formData.append("content", state.newMessage);
      state.selectedFiles.forEach((file) => formData.append("files", file));

      if (state.editingMessageId) {
        const res = await axiosInstance.put(
          `/messages/${state.editingMessageId}`,
          { content: state.newMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        socketRef.current.emit("editMessage", res.data);
        dispatch({ type: "EDIT_MESSAGE", payload: res.data });
        dispatch({ type: "SET_EDITING_MESSAGE", payload: { id: null, content: "" } });
      } else {
        const res = await axiosInstance.post("/messages", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        dispatch({ type: "ADD_MESSAGE", payload: res.data });
      }
      dispatch({ type: "SET_NEW_MESSAGE", payload: "" });
      dispatch({ type: "SET_SELECTED_FILES", payload: [] });
      await fetchMessages();
    } catch (err) {
      console.error("Send failed:", err.response?.data || err.message);
      dispatch({
        type: "SET_ERROR",
        payload:
          err.response?.status === 400
            ? err.response.data.error
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : "Failed to send message. Please try again.",
      });
    } finally {
      isSendingRef.current = false;
      dispatch({ type: "SET_STATUS", payload: { isSending: false, isUpdating: false } });
    }
  }, [state.newMessage, state.selectedFiles, state.editingMessageId, token, fetchMessages]);

  const handleDelete = async (id) => {
    dispatch({ type: "SET_STATUS", payload: { isDeleting: true } });
    dispatch({ type: "SET_ERROR", payload: "" });
    try {
      await axiosInstance.delete(`/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      socketRef.current.emit("deleteMessage", { messageId: id });
      await fetchMessages();
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      dispatch({
        type: "SET_ERROR",
        payload: err.response?.status === 404 ? "Message not found." : "Failed to delete message.",
      });
    } finally {
      dispatch({ type: "SET_STATUS", payload: { isDeleting: false } });
    }
  };

  const startEdit = (msg) => {
    dispatch({
      type: "SET_EDITING_MESSAGE",
      payload: { id: msg._id, content: msg.content?.includes("Link: ") ? "" : msg.content || "" },
    });
  };

  const handleOptionSelect = (option) => {
    if (option === "delete" && state.selectedMessage) {
      handleDelete(state.selectedMessage._id);
    } else if (option === "edit" && state.selectedMessage) {
      startEdit(state.selectedMessage);
    }
    dispatch({ type: "SET_MODAL", payload: false });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => allowedFileTypes.includes(file.type) && file.size <= maxFileSize);
    if (validFiles.length !== files.length) {
      dispatch({ type: "SET_ERROR", payload: "Some files were rejected (unsupported type or too large)." });
    }
    dispatch({ type: "SET_SELECTED_FILES", payload: [...state.selectedFiles, ...validFiles] });
    e.target.value = "";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter((file) => allowedFileTypes.includes(file.type) && file.size <= maxFileSize);
    if (validFiles.length !== files.length) {
      dispatch({ type: "SET_ERROR", payload: "Some files were rejected (unsupported type or too large)." });
    }
    dispatch({ type: "SET_SELECTED_FILES", payload: [...state.selectedFiles, ...validFiles] });
    dropAreaRef.current.classList.remove("ring-2", "ring-blue-500");
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDragEnter = () => dropAreaRef.current?.classList.add("ring-2", "ring-blue-500");
  const handleDragLeave = () => dropAreaRef.current?.classList.remove("ring-2", "ring-blue-500");

  const getReadByNames = (readBy) => {
    if (!Array.isArray(readBy)) return [];
    const allUsers = [state.currentUser, ...state.members].filter((user) => user._id);
    return readBy
      .map((reader) => {
        const user = allUsers.find((u) => u._id === reader._id);
        return user && user._id !== state.currentUser._id ? { name: user.name, _id: reader._id } : null;
      })
      .filter(Boolean);
  };

  return (
    <>
      <style>
        {`
          :root {
            --header-height: 64px;
            --tenant-header-height: 64px;
            --error-message-height: ${state.errorMessage ? "48px" : "0px"};
            --message-input-height: 80px;
          }

          html, body {
            height: 100%;
            margin: 0;
            overflow: hidden;
          }

          header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: var(--header-height);
            z-index: 1000;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .sidebar {
            position: fixed;
            top: var(--header-height);
            left: 0;
            height: calc(100vh - var(--header-height));
            z-index: 1010;
            transition: transform 0.3s ease-in-out;
          }

          main {
            margin-top: var(--header-height);
            height: calc(100vh - var(--header-height));
            overflow: hidden;
            margin-left: 0;
            transition: margin-left 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
          }

          .chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            flex: 1;
          }

          .tenant-header {
            padding: 1rem;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 30;
          }

          .error-message {
            padding: 0.5rem;
            background: #fee2e2;
            color: #b91c1c;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: var(--tenant-header-height);
            z-index: 25;
          }

          .message-list {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            height: calc(100vh - var(--header-height) - var(--tenant-header-height) - var(--error-message-height) - var(--message-input-height));
          }

          .message-list::-webkit-scrollbar {
            width: 6px;
          }

          .message-list::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          .message-list::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }

          .message-list::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          .message-list {
            scrollbar-width: thin;
            scrollbar-color: #888 #f1f1f1;
          }

          .message-container {
            max-width: 80%;
            margin-bottom: 1rem;
          }

          @media (min-width: 640px) {
            .message-container {
              max-width: 60%;
            }
          }

          @media (min-width: 1024px) {
            .message-container {
              max-width: 50%;
            }
          }

          .message-container > div {
            position: relative;
          }

          .message-input-container {
            position: sticky;
            bottom: 0;
            background: white;
            z-index: 20;
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
          }

          .members-panel {
            position: fixed;
            top: var(--header-height);
            right: 0;
            height: calc(100vh - var(--header-height));
            background: white;
            border-left: 1px solid #e5e7eb;
            transition: transform 0.3s ease-in-out;
            z-index: 40;
            width: 100%;
            max-width: 80%;
          }

          @media (min-width: 640px) {
            .members-panel {
              max-width: 20rem;
            }
          }

          .sidebar-open .members-panel {
            transform: translateX(100%);
          }

          .modal {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1050;
          }

          .modal-content {
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 90%;
            max-height: 80vh;
            overflow-y: auto;
          }

          @media (min-width: 640px) {
            .modal-content {
              max-width: 400px;
            }
          }
        `}
      </style>

      <div className="h-screen overflow-hidden flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <DashboardHeader setSidebarOpen={setSidebarOpen} />
        </header>

        <div className="flex flex-1">
          <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} className="sidebar" />

          <main className={`flex-1 bg-gray-50 main-content ${sidebarOpen ? "lg:ml-64" : ""}`}>
            <div className="chat-container">
              <div className="tenant-header">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">{state.currentUser.tenantName || "Default Tenant"}</h2>
                <button
                  onClick={() => setSidesheetOpen(!sidesheetOpen)}
                  className="bg-[#3aabb7] text-white p-2 rounded-full hover:bg-[#2d8790]"
                  title="Toggle members panel"
                  aria-label="Toggle members panel"
                >
                  <FiUsers size={20} />
                </button>
              </div>

              {state.errorMessage && (
                <div className="error-message">
                  <span className="text-sm">{state.errorMessage}</span>
                  <button
                    onClick={() => dispatch({ type: "SET_ERROR", payload: "" })}
                    className="ml-2 text-red-900 hover:underline text-sm"
                    aria-label="Dismiss error"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {state.status.isLoadingUser ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader />
                </div>
              ) : (
                <div className="message-list">
                  {state.isTyping.size > 0 && (
                    <div className="text-sm text-gray-500 italic bg-gray-100 p-2 rounded mb-2">
                      {Array.from(state.isTyping)
                        .map((entry) => entry.split(":")[1])
                        .join(", ")}{" "}
                      {state.isTyping.size > 1 ? "are" : "is"} typing...
                    </div>
                  )}
                  {state.messages.map((msg) => (
                    <Message
                      key={msg._id}
                      msg={msg}
                      currentUser={state.currentUser}
                      setSelectedMessage={(msg) => dispatch({ type: "SET_SELECTED_MESSAGE", payload: msg })}
                      sidesheetOpen={sidesheetOpen}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              <MessageInput
                state={state}
                dispatch={dispatch}
                handleSend={handleSend}
                handleFileSelect={handleFileSelect}
                handleKeyPress={handleKeyPress}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleDragEnter={handleDragEnter}
                handleDragLeave={handleDragLeave}
                dropAreaRef={dropAreaRef}
                handleTyping={handleTyping}
              />
            </div>

            <MembersPanel
              members={state.members}
              currentUser={state.currentUser}
              sidesheetOpen={sidesheetOpen}
              setSidesheetOpen={setSidesheetOpen}
            />
          </main>
        </div>

        <MessageOptionsModal
          state={state}
          dispatch={dispatch}
          handleOptionSelect={handleOptionSelect}
          getReadByNames={getReadByNames}
          modalRef={modalRef}
        />
      </div>
    </>
  );
}

export default ChatWithOthers;