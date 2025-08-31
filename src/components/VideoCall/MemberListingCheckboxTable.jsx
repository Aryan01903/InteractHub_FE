import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../api/axios";

export default function MemberListingModal({ isOpen, onClose, onConfirm }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      try {
        const res = await axiosInstance.get("/auth/members");
        const formatted = res.data.map((m) => ({ ...m, selected: false }));
        setMembers(formatted);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen]);

  const toggleSelect = (id) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === id ? { ...m, selected: !m.selected } : m))
    );
  };

  const toggleSelectAll = (e) => {
    const checked = e.target.checked;
    setMembers((prev) => prev.map((m) => ({ ...m, selected: checked })));
  };

  const handleConfirm = () => {
    const selectedMembers = members.filter((m) => m.selected);
    onConfirm(selectedMembers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-3/4 md:w-1/2 max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Member Listing</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-gray-500">Loading members...</p>
          ) : (
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border-b">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={members.length > 0 && members.every((m) => m.selected)}
                    />
                  </th>
                  <th className="px-4 py-2 border-b">Name</th>
                  <th className="px-4 py-2 border-b">Email</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member._id}
                    className={`hover:bg-gray-50 ${member.selected ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-4 py-2 border-b">
                      <input
                        type="checkbox"
                        checked={member.selected}
                        onChange={() => toggleSelect(member._id)}
                      />
                    </td>
                    <td className="px-4 py-2 border-b">{member.name}</td>
                    <td className="px-4 py-2 border-b">{member.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-[#5aabb7] text-white hover:bg-[#3aabb7] hover:text-xl"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

MemberListingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
