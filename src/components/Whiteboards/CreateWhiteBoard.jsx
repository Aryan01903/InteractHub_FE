import { useState } from "react";
import axiosInstance from "../api/axios";
import { toast, ToastContainer } from "react-toastify";

export default function CreateWhiteboard() {
  const [name, setName] = useState("");
  const [loader, setLoader] = useState(false);
  const [whiteboardCreated, setWhiteboardCreated] = useState(false);

  const handleCreateWhiteboard = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await axiosInstance.post("/whiteboard/create", { name });

      if (response.status === 201) {
        toast.success("✅ Whiteboard created successfully!");
        console.log("Whiteboard created successfully", response.data);
        setWhiteboardCreated(true);
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
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-[#333333] text-center">
        Create New Whiteboard
      </h2>

      <div className="mt-6 flex justify-center items-center">
        {whiteboardCreated ? (
          <p className="text-lg text-green-600 font-medium">
            🎉 Whiteboard created successfully!
          </p>
        ) : (
          <form
            onSubmit={handleCreateWhiteboard}
            className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl"
          >
            {/* Input Field */}
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

            {/* Submit Button */}
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
              {loader ? "Please Wait..." : "Submit"}
            </button>
          </form>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
