"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    FileText, Clock, ChevronRight, CheckCircle2,
    AlertCircle, PlayCircle, Layers, Users,
    Search, Filter, MoreHorizontal
} from "lucide-react";
import { useBRDStore, BRDStatus } from "@/lib/brdStore";
import AnimatedCard from "@/components/AnimatedCard";
import { getLoggedInUser } from "@/lib/auth";

const STATUS_CONFIG: Record<BRDStatus, { icon: any, color: string, bg: string, ring: string }> = {
    "Generating BRD": { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
    "BRD Generated": { icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-100" },
    "BRD Review": { icon: AlertCircle, color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-100" },
    "Changes Requested": { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-100" },
    "Approved": { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    "Development": { icon: PlayCircle, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200" },
    "UAT": { icon: Clock, color: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-100" },
    "Production": { icon: CheckCircle2, color: "text-[#00338D]", bg: "bg-[#00338D]/10", ring: "ring-[#00338D]/20" },
    "Archived": { icon: FileText, color: "text-slate-400", bg: "bg-slate-50", ring: "ring-slate-200" },
};

export default function BusinessUserDashboard() {
    const { brds } = useBRDStore();
    const user = getLoggedInUser();

    // Filter BRDs assigned to this business user
    const assignedBrds = brds.filter(brd =>
        brd.reviewerEmail?.toLowerCase() === user?.username?.toLowerCase() ||
        brd.reviewerEmail?.toLowerCase() === user?.fullName?.toLowerCase() ||
        brd.reviewerEmail === "vikash" // Fallback for mock user
    );

    const stats = [
        { label: "Total Assignments", value: assignedBrds.length, icon: Layers, color: "indigo" },
        { label: "Pending Review", value: assignedBrds.filter(b => b.status === "BRD Review").length, icon: Clock, color: "purple" },
        { label: "Approved", value: assignedBrds.filter(b => b.status === "Approved").length, icon: CheckCircle2, color: "emerald" },
        { label: "Rejected/Changes", value: assignedBrds.filter(b => b.status === "Changes Requested").length, icon: AlertCircle, color: "rose" },
    ];

    return (
        <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Business Review Portal</h1>
                    <p className="text-slate-500 font-medium mt-1">Global enterprise requirement validation and approval.</p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00338D] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find BRD..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00338D]/10 focus:border-[#00338D]/30 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors shadow-sm interactive">
                        <Filter size={18} />
                    </button>
                </div>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <AnimatedCard className="p-4 bg-white border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 border border-${stat.color}-100`}>
                                <stat.icon size={20} />
                            </div>
                        </AnimatedCard>
                    </motion.div>
                ))}
            </div>

            {/* Content List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Initiatives</h2>
                    <span className="text-xs text-slate-400 font-medium">{assignedBrds.length} documents found</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {brds.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Layers size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-500 font-semibold text-lg">Inventory clear</p>
                            <p className="text-slate-400 text-sm mt-1">No BRDs currently require your attention.</p>
                        </div>
                    ) : (
                        assignedBrds.map((brd, idx) => {
                            const config = STATUS_CONFIG[brd.status] || STATUS_CONFIG["Archived"];
                            const StatusIcon = config.icon;

                            return (
                                <motion.div
                                    key={brd.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                >
                                    <Link href={`/dashboard/business/brd/${brd.id}`}>
                                        <AnimatedCard className="p-0 hover:border-[#00338D]/30 transition-all overflow-hidden group shadow-sm hover:shadow-md interactive bg-white border border-slate-100">
                                            <div className="flex flex-col md:flex-row items-stretch md:items-center py-4 px-5 gap-5">
                                                {/* Avatar/Icon column */}
                                                <div className={`w-12 h-12 rounded-2xl ${config.bg} ${config.color} border border-transparent group-hover:bg-transparent group-hover:border-current flex items-center justify-center flex-shrink-0 transition-all duration-300 ring-4 ${config.ring}`}>
                                                    <StatusIcon size={22} strokeWidth={2.5} />
                                                </div>

                                                {/* Main project info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono text-[10px] font-bold text-slate-400 tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded uppercase">{brd.id}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-tight ${config.bg} ${config.color}`}>
                                                            {brd.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#00338D] transition-colors">{brd.projectName}</h3>
                                                </div>

                                                {/* Metadata columns */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 items-center md:border-l border-slate-100 md:pl-8">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Version</p>
                                                        <p className="text-xs font-bold text-slate-700">{brd.version}</p>
                                                    </div>
                                                    <div className="hidden sm:block">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Last Update</p>
                                                        <p className="text-xs font-semibold text-slate-600 italic">
                                                            {new Date(brd.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="hidden lg:block">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Initiator</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-[#00338D]">
                                                                {brd.createdBy.charAt(0)}
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-700 truncate max-w-[80px]">{brd.createdBy}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pr-2">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-[#00338D] group-hover:bg-[#00338D]/5 transition-all">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimatedCard>
                                    </Link>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
