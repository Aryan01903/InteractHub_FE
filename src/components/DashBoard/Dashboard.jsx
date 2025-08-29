import DashboardSidebar from "../common/DashboardSidebar"
import DashboardHeader from "../common/DashboardHeader"
import MemberListingTable from "./memberListingTable"
import { useState } from "react";
import axiosInstance from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
export default function Dashboard(){
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [loader, setLoader] = useState(false);
    const name = localStorage.getItem("name")
    const tenantName = localStorage.getItem("tenantName")

    const handleInvitation = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            const res = await axiosInstance.post("/auth/sendInvite", {
                email,
                role
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

    function cleanUp(){
        setEmail("");
        setRole("");
    }

    return(
        <div>
            <DashboardHeader />
            <div className="flex flex-1">
                <DashboardSidebar />
                <section className="flex-1 p-4 overflow-auto">
                    <div className="text-[#333333] m-8 mb-2 text-3xl">Hi, <span className="font-semibold">{name}</span></div>
                    <div className="ml-8 mt-4 text-[#333333]">
                        <h2 className="text-xl font-medium">Welcome To, </h2>
                        <h2 className="text-3xl ml-4 font-bold">{tenantName}</h2>
                    </div>
                    <div className="flex justify-center items-center"><MemberListingTable /></div>
                    <div className="mt-8 ml-8 text-[#333333] font-semibold text-xl">
                        <span>Invite Joinees: </span>
                        <div>
                            <form onSubmit={handleInvitation} className="flex items-center space-x-4">
                                <input
                                    type="email"
                                    placeholder="Enter email to send invitation"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-80 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                                />
    
                                <select
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-40 px-4 py-2 rounded-xl border bg-gradient-to-r from-[#f5f5f5] to-[#f3f3f3]"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select role</option>
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                </select>

                                <button
                                    className="w-28 h-10 bg-gradient-to-r from-[#48c4D3] to-[#3aabb7] hover:from-[#3aabb7] hover:to-[#48c4D3] text-white py-3 rounded-full text-lg font-semibold shadow-md flex items-center justify-center"
                                    type="submit"
                                    disabled={loader}
                                >
                                    {loader ? "Please Wait..." : "Submit"}
                                </button>
                            </form>

                        </div>
                    </div>
                </section>
            </div>
            <ToastContainer theme="dark"/>
        </div>


    )
}