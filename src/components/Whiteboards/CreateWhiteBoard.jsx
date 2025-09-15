import { useState } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

export default function CreateWhiteboard({ onCreated }) {
  const [name, setName] = useState("");
  const [loader, setLoader] = useState(false);

  const handleCreateWhiteboard = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await axiosInstance.post("/whiteboard/create", { name });

      if (response.status === 201) {
        toast.success("✅ Whiteboard created successfully!");
        const newBoard = response.data;
        onCreated?.(newBoard);
        setName("");
      }
    } catch (err) {
      console.error("Error creating whiteboard:", err.message);
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateWhiteboard}
      className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl mx-auto"
    >
      <input
        type="text"
        placeholder="Enter a name for your whiteboard..."
        onChange={(e) => setName(e.target.value)}
        value={name}
        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 
                   bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3] 
                   focus:ring-2 focus:ring-[#48c4D3] focus:border-transparent
                   text-gray-700 placeholder-gray-400 transition"
        disabled={loader}
      />

      <button
        type="submit"
        disabled={loader || !name}
        className={`w-32 h-11 bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] 
                   hover:from-[#3aabb7] hover:to-[#48c4D3] text-white 
                   rounded-full text-lg font-semibold shadow-md 
                   flex items-center justify-center transition ${
                     loader || !name ? "opacity-70 cursor-not-allowed" : ""
                   }`}
      >
        {loader ? "Please Wait..." : "Create"}
      </button>
    </form>
  );
}

CreateWhiteboard.propTypes = {
  onCreated: PropTypes.func, 
};
