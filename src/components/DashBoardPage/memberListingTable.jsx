import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Loader from "../common/Loader";
import {
  MdOutlineRememberMe,
  MdOutlineUpdate,
  MdEmail,
  MdDelete,
} from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";
import { toast } from "react-toastify";

/**
 * Robust date parser that supports:
 * - dd/mm/yyyy
 * - dd/mm/yyyy, HH:MM:SS
 * - ISO strings (YYYY-MM-DD or full ISO)
 * - JS Date objects / timestamps
 */
function parseDateFromString(dateStr) {
  if (!dateStr) return null;

  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }

  if (!isNaN(Number(dateStr))) {
    const d = new Date(Number(dateStr));
    return isNaN(d.getTime()) ? null : d;
  }

  const s = String(dateStr).trim();

  if (/\d{4}-\d{1,2}-\d{1,2}/.test(s) || s.includes("T")) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  const dateMatch = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);

  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);

    const timeMatch = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    const hours = timeMatch ? parseInt(timeMatch[1], 10) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const seconds = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

    const d = new Date(year, month - 1, day, hours, minutes, seconds);
    return isNaN(d.getTime()) ? null : d;
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function formatDateToShort(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRelativeTimeFromDate(date) {
  if (!date) return "";
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return "just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
}

export default function MemberListingTable() {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      setError("No token found!");
      setLoading(false);
      return;
    }

    axiosInstance
      .get("/auth/members", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const members = Array.isArray(response.data) ? response.data : [];
        setData(members);
        setFilteredData(members);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "An error occurred while fetching members"
        );
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!data) return;

    let filtered = [...data];

    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(lower) ||
          (m.email || "").toLowerCase().includes(lower)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (m) => String(m.role || "").toLowerCase() === roleFilter.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      const roleA = String(a.role || "").toLowerCase();
      const roleB = String(b.role || "").toLowerCase();
      if (roleA === "admin" && roleB !== "admin") return -1;
      if (roleA !== "admin" && roleB === "admin") return 1;

      const dateA = parseDateFromString(a.joinedIn);
      const dateB = parseDateFromString(b.joinedIn);
      if (dateA && dateB) return dateB - dateA;
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      return 0;
    });

    setFilteredData(filtered);
  }, [search, roleFilter, data]);

  const handleDelete = async (e, email) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      const res = await axiosInstance.delete("/auth/members/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { email },
      });

      if (res.data.message === "Member deleted successfully") {
        setData((prevData) => prevData.filter((member) => member.email !== email));
        toast.success("Member deleted successfully");
      } else {
        toast.error("Failed to delete member");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "An error occurred");
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="mt-8 p-6 bg-red-50 text-red-600 rounded-xl shadow-md text-center">
        {error}
      </div>
    );

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6 text-[#333333]">Community List</h2>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#48c4D3] focus:outline-none"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#48c4D3] focus:outline-none"
        >
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* No members */}
      {(!filteredData || filteredData.length === 0) && (
        <div className="p-6 bg-gray-50 text-gray-500 rounded-lg shadow-sm text-center">
          No members found matching your search/filter.
        </div>
      )}

      {/* Desktop Table */}
      {filteredData && filteredData.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 hidden md:block">
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
                    {userRole === "admin" && (
                      <th className="px-6 py-3 text-left font-medium border border-gray-300">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="text-gray-800">
                  {filteredData.map((member, index) => {
                    const parsed = parseDateFromString(member.joinedIn);
                    return (
                      <tr
                        key={member.email || `${member.name}-${index}`}
                        className={`transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100`}
                      >
                        <td className="px-6 py-3 text-sm border border-gray-300">
                          {member.name}
                        </td>
                        <td className="px-6 py-3 text-sm border border-gray-300">
                          {parsed ? (
                            <>
                              {formatDateToShort(parsed)}{" "}
                              <span className="text-gray-500 text-xs italic">
                                ({getRelativeTimeFromDate(parsed)})
                              </span>
                            </>
                          ) : (
                            member.joinedIn || "N/A"
                          )}
                        </td>
                        {userRole === "admin" && (
                          <td className="px-6 py-3 text-sm border border-gray-300">
                            {member.email}
                          </td>
                        )}
                        <td className="px-6 py-3 text-sm border border-gray-300">
                          {member.role}
                        </td>
                        {userRole === "admin" && (
                          <td className="px-6 py-3 text-sm border border-gray-300">
                            <button
                              onClick={(e) => handleDelete(e, member.email)}
                              className="text-red-500 hover:text-red-700 text-xl hover:scale-110 transition-transform"
                            >
                              <MdDelete />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {filteredData.map((member, index) => {
              const parsed = parseDateFromString(member.joinedIn);
              return (
                <div
                  key={member.email || `${member.name}-${index}`}
                  className="p-4 border rounded-lg shadow-sm bg-white"
                >
                  <div className="font-semibold text-lg">{member.name}</div>
                  <div className="text-sm text-gray-600">
                    Joined:{" "}
                    {parsed ? (
                      <>
                        {formatDateToShort(parsed)}{" "}
                        <span className="text-gray-500 italic">
                          ({getRelativeTimeFromDate(parsed)})
                        </span>
                      </>
                    ) : (
                      member.joinedIn || "N/A"
                    )}
                  </div>
                  {userRole === "admin" && (
                    <div className="text-sm text-gray-600">Email: {member.email}</div>
                  )}
                  <div className="text-sm text-gray-800">Role: {member.role}</div>
                  {userRole === "admin" && (
                    <button
                      onClick={(e) => handleDelete(e, member.email)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <MdDelete /> Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
