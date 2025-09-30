import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import DashboardHeader from "../common/DashboardHeader";
import DashboardSidebar from "../common/DashboardSidebar";
import CreateWhiteboard from "./CreateWhiteBoard";
import WhiteboardListingTable from "./WhiteboardListingTable";

export default function Whiteboard() {
  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // ← Sidebar toggle state

  const fetchWhiteboards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/whiteboard/get");
      const sorted = res.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setWhiteboards(sorted);
    } catch (err) {
      console.error("Error fetching whiteboards:", err);
      setError("Failed to fetch whiteboards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhiteboards();
  }, []);

  const handleWhiteboardCreated = (newBoard) => {
    setWhiteboards((prev) => [newBoard, ...prev]);
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <DashboardHeader setSidebarOpen={setSidebarOpen} />
      </header>

      {/* Sidebar + Content */}
      <div className="pt-[70px] flex h-full">
        {/* Sidebar */}
        <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto text-[#333333]">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight">
                Whiteboards Dashboard
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                Manage your whiteboards effortlessly — create, collaborate, and
                keep projects organized in one place.
              </p>
            </div>

            <div className="space-y-10">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-semibold mb-3">
                  Start a New Whiteboard
                </h2>
                <p className="text-gray-500 mb-6">
                  Kick off fresh ideas with a new board. Collaborate live with your team instantly.
                </p>
                <CreateWhiteboard onCreated={handleWhiteboardCreated} />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-semibold mb-3">
                  Your Existing Whiteboards
                </h2>
                <p className="text-gray-500 mb-6">
                  Continue where you left off. Access, update, and manage all your boards here.
                </p>
                <WhiteboardListingTable
                  data={whiteboards}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
