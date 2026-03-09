"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { Shield, Search, UserPlus, ShieldAlert, ShieldCheck, UserX, Database, Users } from "lucide-react";
import { UserRecord, getUsers, approveUser, rejectUser, deleteUser, RoleType, StatusType } from "@/lib/usersStore";

const RoleBadge = ({ role }: { role: string }) => {
    switch (role) {
        case "admin":
            return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 flex items-center gap-1 rounded-md text-xs font-semibold"><ShieldCheck size={12} /> Admin</span>;
        case "developer":
            return <span className="bg-blue-100 text-[#00338D] border border-blue-200 px-2.5 py-1 flex items-center gap-1 rounded-md text-xs font-semibold"><Database size={12} /> Developer</span>;
        case "analyst":
            return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 flex items-center gap-1 rounded-md text-xs font-semibold"><ShieldAlert size={12} /> Analyst</span>;
        case "business":
            return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 flex items-center gap-1 rounded-md text-xs font-semibold"><UserPlus size={12} /> Biz User</span>;
        default:
            return <span className="capitalize">{role}</span>;
    }
};

const StatusBadge = ({ status }: { status: string }) => {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
            ${status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
            ${status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' : ''}
            ${status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
        `}>
            <span className={`w-1.5 h-1.5 rounded-full 
                ${status === 'Approved' ? 'bg-emerald-500' : ''}
                ${status === 'Rejected' ? 'bg-red-500' : ''}
                ${status === 'Pending' ? 'bg-amber-500' : ''}
            `}></span>
            {status}
        </span>
    );
};

export default function AccessControlPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setUsers(getUsers());
        setIsLoaded(true);
    }, []);

    const handleApprove = (id: string) => {
        const updated = approveUser(id);
        if (updated) setUsers(getUsers()); // refresh list
    };

    const handleReject = (id: string) => {
        const updated = rejectUser(id);
        if (updated) setUsers(getUsers());
    };

    const filteredUsers = users.filter(u => {
        const matchesTab = activeTab === "All" || u.status === activeTab;
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const stats = {
        total: users.length,
        pending: users.filter(u => u.status === "Pending").length,
        approved: users.filter(u => u.status === "Approved").length,
        rejected: users.filter(u => u.status === "Rejected").length,
    };

    if (!isLoaded) return <div className="p-8 text-center text-slate-500">Loading Access Control...</div>;

    return (
        <div className="py-6 max-w-7xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900 flex items-center gap-3">
                        <Shield className="text-[#00338D]" size={28} /> Access Control & Approvals
                    </h1>
                    <p className="text-slate-500">Manage user identities, RBAC roles, and approve new platform registration requests.</p>
                </div>
            </motion.div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AnimatedCard className="bg-white border border-slate-200 p-5 w-full flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm text-slate-500 font-medium tracking-wide uppercase mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-[#00338D] rounded-xl"><Users size={24} /></div>
                </AnimatedCard>
                <AnimatedCard className="bg-white border border-slate-200 p-5 w-full flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm text-amber-600 font-medium tracking-wide uppercase mb-1">Pending Approvals</p>
                        <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl relative">
                        <UserPlus size={24} />
                        {stats.pending > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-ping"></span>}
                        {stats.pending > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></span>}
                    </div>
                </AnimatedCard>
                <AnimatedCard className="bg-white border border-slate-200 p-5 w-full flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm text-emerald-600 font-medium tracking-wide uppercase mb-1">Approved</p>
                        <p className="text-3xl font-bold text-emerald-700">{stats.approved}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={24} /></div>
                </AnimatedCard>
                <AnimatedCard className="bg-white border border-slate-200 p-5 w-full flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm text-red-500 font-medium tracking-wide uppercase mb-1">Rejected</p>
                        <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-500 rounded-xl"><UserX size={24} /></div>
                </AnimatedCard>
            </div>

            <AnimatedCard className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* Controls & Tabs */}
                <div className="border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex px-4 pt-4 sm:pt-0 gap-6">
                        {(["Pending", "All", "Approved", "Rejected"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 pt-4 text-sm font-semibold border-b-2 transition-colors interactive flex items-center gap-2 ${activeTab === tab ? 'border-[#00338D] text-[#00338D]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                            >
                                {tab}
                                {tab === "Pending" && stats.pending > 0 && (
                                    <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-md">{stats.pending}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-3 relative w-full sm:w-auto min-w-[300px]">
                        <div className="absolute inset-y-0 left-4 sm:left-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00338D] outline-none text-slate-900 bg-white text-sm"
                            placeholder="Search by name, email, or User ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID & Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name & Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-mono font-medium text-slate-500 text-sm">{user.id}</div>
                                        <div className="text-xs text-slate-400 mt-1">{new Date(user.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-slate-900">{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col items-start gap-1">
                                            <StatusBadge status={user.status} />
                                            {user.status === "Approved" && user.approvedBy && (
                                                <span className="text-[10px] text-slate-400">by {user.approvedBy}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {user.status === "Pending" ? (
                                                <>
                                                    <button onClick={() => handleApprove(user.id)} className="interactive px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md font-semibold text-xs transition-colors shadow-sm">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleReject(user.id)} className="interactive px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-md font-semibold text-xs transition-colors shadow-sm">
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                                    <button onClick={() => setUsers(getUsers().filter(u => u.id !== user.id).map(u => ({ ...u })))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete User">
                                                        <UserX size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-lg font-medium text-slate-900">No users found</p>
                                            <p className="text-slate-500 text-sm pt-1">Try adjusting your search terms or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </AnimatedCard>
        </div>
    );
}
