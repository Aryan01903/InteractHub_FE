import Loader from "../common/Loader";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function WhiteboardListingTable({ data, loading, error }) {
  const navigate = useNavigate();

  const handleUpdate = (id) => {
    navigate(`/whiteboard/${id}`);
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-500 mb-3">{error}</p>}

      {loading ? (
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

WhiteboardListingTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

WhiteboardListingTable.defaultProps = {
  loading: false,
  error: null,
};
