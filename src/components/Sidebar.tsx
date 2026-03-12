"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser, getLoggedInUser } from "@/lib/auth";
import {
    Briefcase,
    BarChart,
    Code2,
    LineChart,
    LogOut,
    ChevronRight,
    X,
    LayoutDashboard,
    FolderOpen,
    Shield,
    KanbanSquare,
    Settings,
    Building2,
    Bot,
    FileText,
    Hammer,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
    { name: "BRD Management", path: "/dashboard/pm/brd", role: "program-manager", icon: <FileText size={20} /> },
    { name: "Business User", path: "/dashboard/business", role: "business-user", icon: <BarChart size={20} /> },
    { name: "Agents", path: "/dashboard/developer/agents", role: "developer", icon: <Bot size={20} /> },

    // Admin Routes
    { name: "Overview", path: "/dashboard/admin", role: "admin", icon: <LayoutDashboard size={20} /> },
    { name: "Projects", path: "/dashboard/admin/projects", role: "admin", icon: <FolderOpen size={20} /> },
    { name: "Pipeline", path: "/dashboard/admin/pipeline", role: "admin", icon: <KanbanSquare size={20} /> },
    { name: "Access Control", path: "/dashboard/admin/access", role: "admin", icon: <Shield size={20} /> },
    { name: "Settings", path: "#settings", role: "admin", icon: <Settings size={20} /> },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("User");

    useEffect(() => {
        const user = getLoggedInUser();
        if (user) {
            setUserRole(user.role);
            setUserName(user.username);
        }
    }, []);

    const handleLogout = () => {
        logoutUser();
        router.push("/");
    };

    const displayItems = userRole ? navItems.filter(item => item.role === userRole) : [];

    return (
        <motion.div
            animate={{ width: isCollapsed ? 88 : 280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full bg-white border-r border-slate-200 flex flex-col z-40 flex-shrink-0 relative"
        >
            {/* Brand & Toggle */}
            <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
                <Link href="/" className="flex items-center gap-3 interactive overflow-hidden">
                    <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-[#00338D] flex items-center justify-center text-white shadow-md shadow-[#00338D]/20">
                        <Building2 size={18} />
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap"
                        >
                            KPMG <span className="text-[#00338D] font-black">AI</span>
                        </motion.span>
                    )}
                </Link>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="interactive p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 absolute right-[-14px] top-6 bg-white border border-slate-200 shadow-sm z-50 text-[#00338D]"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <X size={16} />}
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {!isCollapsed && displayItems.length > 0 && (
                    <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Primary Navigation
                    </div>
                )}

                {displayItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`relative interactive group flex items-center gap-4 px-3 py-3 rounded-xl transition-all w-full ${isActive
                                ? "bg-blue-50/80 text-[#00338D] font-semibold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                }`}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00338D] rounded-r-md"
                                />
                            )}

                            <div className={`${isActive ? "text-[#00338D]" : "group-hover:text-[#00338D]"} transition-colors flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                                {item.icon}
                            </div>

                            {!isCollapsed && (
                                <span className="whitespace-nowrap truncate text-sm">
                                    {item.name}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-lg flex items-center">
                                    {item.name}
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[-4px] border-[6px] border-transparent border-r-slate-900 rounded-sm"></div>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer Profile */}
            <div className="p-4 border-t border-slate-100">
                {isCollapsed ? (
                    <button
                        onClick={handleLogout}
                        className="interactive w-full flex justify-center p-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all mt-auto"
                        title="Logout"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                    </button>
                ) : (
                    <div className="interactive flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-300 transition-all group cursor-pointer" onClick={handleLogout} title="Click to logout">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00338D] to-[#00A3E0] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden pr-2">
                                <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                                <p className="text-xs text-slate-500 capitalize truncate font-medium">
                                    {userRole === "program-manager" ? "Program Manager" : userRole === "business-user" ? "Business User" : userRole}
                                </p>
                            </div>
                        </div>
                        <div className="p-2 text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                            <LogOut size={16} />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

