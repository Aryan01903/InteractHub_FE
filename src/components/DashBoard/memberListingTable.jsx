import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Loader from "../common/Loader";
import { MdOutlineRememberMe, MdOutlineUpdate, MdEmail } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";

export default function MemberListingTable() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    useEffect(() => {
        if (!token) {
            setError("No token found!");
            setLoading(false);
            return;
        }

        axiosInstance
            .get("/auth/members", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(
                    err?.response?.data?.message ||
                        err.message ||
                        "An error occurred"
                );
                setLoading(false);
            });
    }, [token]);

    if (loading) return <Loader />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-semibold text-center mb-6 text-[#333333]">
                Community List
            </h2>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <div className="max-h-[400px] overflow-y-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium border border-gray-300">
                                    <MdOutlineRememberMe className="inline-block mr-2 text-gray-600" />
                                    Participant&apos;s Name
                                </th>
                                <th className="px-6 py-3 text-left font-medium border border-gray-300">
                                    <MdOutlineUpdate className="inline-block mr-2 text-gray-600" />
                                    Joined
                                </th>
                                {userRole === "admin" && (
                                    <th className="px-6 py-3 text-left font-medium border border-gray-300">
                                        <MdEmail className="inline-block mr-2 text-gray-600" />
                                        Email
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left font-medium border border-gray-300">
                                    <FaBriefcase className="inline-block mr-2 text-gray-600" />
                                    Role
                                </th>
                            </tr>
                        </thead>

                        <tbody className="text-gray-800">
                            {data?.map((member, index) => (
                                <tr
                                    key={member.name || `${member.name}-${index}`}
                                    className={`transition-colors ${
                                        index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                    } hover:bg-gray-100`}
                                >
                                    <td className="px-6 py-3 text-sm border border-gray-300">
                                        {member.name}
                                    </td>
                                    <td className="px-6 py-3 text-sm border border-gray-300">
                                        {member.joinedIn}
                                    </td>
                                    {userRole === "admin" && (
                                        <td className="px-6 py-3 text-sm border border-gray-300">
                                            {member.email}
                                        </td>
                                    )}
                                    <td className="px-6 py-3 text-sm border border-gray-300">
                                        {member.role}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
