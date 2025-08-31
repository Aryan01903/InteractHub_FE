import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import { FaEye } from "react-icons/fa";

export default function WhiteboardListingTable() {
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWhiteboards = async () => {
      setLoader(true);
      setError(null);

      try {
        const res = await axiosInstance.get("/whiteboard/get");

        // Sort by updatedAt (most recent first)
        const sorted = res.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setData(sorted);
      } catch (err) {
        setError("Failed to fetch whiteboards. Please try again.");
        console.error("Error fetching whiteboards:", err);
      } finally {
        setLoader(false);
      }
    };

    fetchWhiteboards();
  }, []);

  const handleUpdate = (id) => {
    navigate(`/whiteboard/${id}`);
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <h1 className="text-2xl font-semibold mb-4 text-center text-gray-700">
        Whiteboard Listing
      </h1>

      {loader ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto rounded-xl shadow-md">
            <table className="min-w-full bg-white border border-gray-200 rounded-xl">
              <thead className="bg-gradient-to-r from-[#48C4D3] to-[#3aabb7] text-white sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Created At</th>
                  <th className="py-3 px-4 text-left">Updated At</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((board, index) => (
                    <tr
                      key={board._id}
                      className={`hover:bg-gray-100 transition ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="py-3 px-4 border-b">{board.name}</td>
                      <td className="py-3 px-4 border-b">
                        {new Date(board.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {new Date(board.updatedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <button
                          onClick={() => handleUpdate(board._id)}
                          className="p-2 rounded-full bg-[#48C4D3] hover:bg-[#3aabb7] text-white transition"
                        >
                          <FaEye title="View Whiteboard" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No whiteboards available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
