import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../api/axios";

export default function MemberListingModal({ isOpen, onClose, onConfirm }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      setLoading(true);
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

  const allSelected = members.length > 0 && members.every((m) => m.selected);
  const someSelected = members.some((m) => m.selected) && !allSelected;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-2/3 max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-700">Member Listing</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-gray-500 text-center">Loading members...</p>
          ) : (
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border-b">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                    />
                  </th>
                  <th className="px-4 py-2 border-b">Name</th>
                  <th className="px-4 py-2 border-b">Email</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-500">
                      No members available
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member._id}
                      className={`hover:bg-gray-50 transition ${
                        member.selected ? "bg-blue-50" : ""
                      }`}
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
                  ))
                )}
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
            className="px-4 py-2 rounded-lg bg-[#48c4D3] text-white hover:bg-[#3aabb7]"
            disabled={members.every((m) => !m.selected)}
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
