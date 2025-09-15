import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../common/DashboardSidebar";
import DashboardHeader from "../common/DashboardHeader";
import axiosInstance from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import MemberListingModal from "./MemberListingCheckboxTable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

export default function VideoConference() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(null);
  const [loader, setLoader] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        "/videoCall/get-video",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      toast.error("Failed to fetch video rooms");
    }
  };

  const role = localStorage.getItem("role")

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      const token = localStorage.getItem("token");
      const emails = selectedMembers.map((m) => m.email);

      const res = await axiosInstance.post(
        "/videoCall/create",
        {
          tenantId: localStorage.getItem("tenantId"),
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          emails,
          durationHours: 2,
          title,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        toast.success(res.data.message);
        fetchRooms();
        setTitle("");
        setScheduledAt(null);
        setSelectedMembers([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white">
        <DashboardHeader setSidebarOpen={setSidebarOpen} />
      </header>

      <div className="flex flex-1 pt-[70px]">
        <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
              Video Conference Rooms
            </h1>
            <p className="text-gray-600 mb-6">
              Create a new room or join any scheduled room below. Invitations will be sent automatically.
            </p>
            {role == "admin" && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Create New Room</h2>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                {/* Room Title */}
                <input
                  type="text"
                  placeholder="Room Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48c4D3] bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                />

                {/* Row with Date Picker and Invite Button */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <DatePicker
                    selected={scheduledAt}
                    onChange={(date) => setScheduledAt(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    placeholderText="Select date & time"
                    minDate={new Date()}
                    className="w-full md:w-auto flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48c4D3] bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3] md:mr-4"
                  />

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-3 rounded-xl bg-[#48c4D3] text-white hover:bg-[#3aabb7] font-medium shadow-md w-full md:w-auto"
                  >
                    Select Members to Invite ({selectedMembers.length})
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loader}
                  className={`w-32 h-11 bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] text-white rounded-full font-semibold shadow-md transition ${
                    loader
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-[#3aabb7] hover:to-[#48c4D3]"
                  }`}
                >
                  {loader ? "Creating..." : "Create Room"}
                </button>
              </form>
            </div>
            )}
            {/* Rooms Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => navigate(`/video-conference/${room.roomId}`)}
                    className="cursor-pointer bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-semibold mb-1">
                      {room?.title || "Untitled Room"}
                    </h3>
                    <p className="text-gray-500">
                      {room.scheduledAt
                        ? `Scheduled: ${new Date(room.scheduledAt).toLocaleString()}`
                        : "Starts Immediately"}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Created by: {room.createdByName || "Admin"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full">
                  No video rooms available.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Member Selection Modal */}
      <MemberListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(members) => {
          setSelectedMembers(members);
        }}
      />

      <ToastContainer theme="dark" />
    </div>
  );
}
