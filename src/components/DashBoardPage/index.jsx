import DashboardSidebar from "../common/DashboardSidebar";
import DashboardHeader from "../common/DashboardHeader";
import MemberListingTable from "./memberListingTable";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast, ToastContainer } from "react-toastify";

export default function Dashboard() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);


  const userRole = localStorage.getItem("role");

  const handleInvitation = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        "/auth/invite",
        { email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        toast.success("Invitation sent successfully!");
      } else {
        toast.error("Failed to send invitation.");
      }
    } catch (error) {
      console.error("An Error Occurred", error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoader(false);
      cleanUp();
    }
  };

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      console.log("No token found!!!");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchUser();
  }, [token]);


  function cleanUp() {
    setEmail("");
    setRole("");
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <DashboardHeader setSidebarOpen={setSidebarOpen} />
      </header>

      {/* Sidebar and Content */}
      <div className="pt-[70px] flex h-full">
        {/* Sidebar */}
        <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto text-[#333333]">
            {user ? (
            <div className="mb-10">
              <h1 className="text-3xl font-bold">
                Welcome back, <span className="text-[#48c4D3]">{user?.name}</span>
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                You’re currently managing the workspace for{" "}
                <span className="font-semibold">{user?.tenantName}</span>.
              </p>
            </div>
            ) : (
              <p className="text-3xl">Loading user data...</p>
            )}
           {/* Team Members */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
              <p className="text-gray-500 mb-6">
                View and manage the members in your organization. Keep track of roles and access easily.
              </p>
              <div className="flex justify-center items-start">
                <MemberListingTable />
              </div>
            </div>

            {/* Invite Form */}
            {userRole === "admin" && (
              <div className="mt-10 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-semibold mb-3">Invite New Members</h2>
                <p className="text-gray-500 mb-6">
                  Send invitations to your team members and assign their roles right away.
                </p>

                <form onSubmit={handleInvitation} className="flex flex-wrap items-center gap-4">
                  <input
                    type="email"
                    placeholder="Enter member's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-[250px] px-4 py-2 rounded-xl border border-gray-300 bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3] focus:outline-none focus:ring-2 focus:ring-[#48c4D3]"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-44 px-4 py-2 rounded-xl border border-gray-300 bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3] focus:outline-none focus:ring-2 focus:ring-[#48c4D3]"
                  >
                    <option value="" disabled>Select role</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loader}
                    className="w-32 h-11 bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] text-white rounded-full text-lg font-semibold shadow-md flex items-center justify-center transition-all duration-200 hover:from-[#3aabb7] hover:to-[#48c4D3]"
                  >
                    {loader ? "Sending..." : "Invite"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastContainer theme="dark" />
    </div>
  );
}
