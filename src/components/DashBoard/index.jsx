import DashboardSidebar from "../common/DashboardSidebar";
import DashboardHeader from "../common/DashboardHeader";
import MemberListingTable from "./memberListingTable";
import { useState } from "react";
import axiosInstance from "../api/axios";
import { toast, ToastContainer } from "react-toastify";

export default function Dashboard() {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [loader, setLoader] = useState(false);

    const name = localStorage.getItem("name");
    const tenantName = localStorage.getItem("tenantName");
    const userRole = localStorage.getItem("role")

    const handleInvitation = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            const res = await axiosInstance.post("/auth/sendInvite", {
                email,
                role,
            });

            if (res.status === 200) {
                toast.success("Invitation sent!!!");
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

    function cleanUp() {
        setEmail("");
        setRole("");
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <DashboardHeader />

            <div className="flex flex-1">
                {/* Sidebar */}
                <DashboardSidebar />

                {/* Main Section */}
                <section className="flex-1 p-6 overflow-auto">
                    {/* Greeting */}
                    <div className="text-[#333333] mb-6">
                        <h1 className="text-3xl font-semibold">
                            Hi, <span className="font-bold">{name}</span>
                        </h1>
                        <div className="mt-3">
                            <h2 className="text-xl font-medium">
                                Welcome To,
                            </h2>
                            <h2 className="text-3xl ml-2 font-extrabold">
                                {tenantName}
                            </h2>
                        </div>
                    </div>

                    {/* Members Table */}
                    <div className="flex justify-center items-start mt-6">
                        <MemberListingTable />
                    </div>

                    {/* Invite Section */}
                    {userRole==="admin" && (
                    <div className="mt-10 text-[#333333]">
                        <h3 className="font-semibold text-2xl mb-4">
                            Invite Joinees
                        </h3>

                        <form
                            onSubmit={handleInvitation}
                            className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-xl shadow-md"
                        >
                            <input
                                type="email"
                                placeholder="Enter email to send invitation"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 min-w-[250px] px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#48c4D3] bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                            />

                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-44 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#48c4D3] bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                            >
                                <option value="" disabled>
                                    Select role
                                </option>
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                            </select>

                            <button
                                className="w-32 h-11 bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] hover:from-[#3aabb7] hover:to-[#48c4D3] text-white rounded-full text-lg font-semibold shadow-md transition-all duration-200 flex items-center justify-center"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? "Please Wait..." : "Submit"}
                            </button>
                        </form>
                    </div>
                    )}
                </section>
            </div>

            {/* Toasts */}
            <ToastContainer theme="dark" />
        </div>
    );
}
