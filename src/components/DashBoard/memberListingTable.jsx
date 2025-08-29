import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Loader from "../common/Loader";
import { MdOutlineRememberMe, MdOutlineUpdate, MdEmail } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";

export default function MemberListingTable() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (!token) {
            setError("No token found!");
            setLoading(false);
            return;
        }

        axiosInstance.get("/auth/members", {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then((response) => {
            setData(response.data);
            setLoading(false);
        })
        .catch((err) => {
            setError(err?.response?.data?.message || err.message || "An error occurred");
            setLoading(false);
        });
    }, [token]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-4xl font-semibold text-center mb-6 text-[#333333]">Community List</h2>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">
                            <MdOutlineRememberMe className="inline-block mr-2" /> Participant&apos;s Name
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">
                            <MdOutlineUpdate className="inline-block mr-2" /> Joined
                        </th>
                        {/* Conditionally render the email column */}
                        {userRole === 'admin' && (
                            <th className="px-4 py-2 text-left font-medium text-gray-700">
                                <MdEmail className="inline-block mr-2" /> Email
                            </th>
                        )}
                        <th className="px-4 py-2 text-left font-medium text-gray-700">
                            <FaBriefcase className="inline-block mr-2" /> Role
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((member, index) => (
                        <tr key={member.name || `${member.name}-${index}`} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-800">{member.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-800">{member.joinedIn}</td>
                            {/* Conditionally render the email column */}
                            {userRole === 'admin' && (
                                <td className="px-4 py-2 text-sm text-gray-800">{member.email}</td>
                            )}
                            <td className="px-4 py-2 text-sm text-gray-800">{member.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
