"use client";

import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { Activity, ShieldCheck, Plus, Clock, KanbanSquare, CheckCircle, Lightbulb, PlayCircle, Rocket, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useBRDStore, BRDStatus } from "@/lib/brdStore";



import { ArrowRight } from "lucide-react";

const PriorityBadge = ({ priority }: { priority: "CRITICAL" | "HIGH" | "MEDIUM" }) => {
    switch (priority) {
        case "CRITICAL": return <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">Critical</span>;
        case "HIGH": return <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">High</span>;
        case "MEDIUM": return <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-[#00338D] border border-blue-100">Medium</span>;
    }
};

const STAGES = ["BRD Generated", "BRD Review", "Approved", "Development", "UAT", "Production"];

const getStageIndex = (status: BRDStatus): number => {
    switch (status) {
        case "Generating BRD": return 0;
        case "BRD Generated": return 0;
        case "BRD Review": return 1;
        case "Approved": return 2;
        case "Development": return 3;
        case "UAT": return 4;
        case "Production": return 5;
        default: return 0;
    }
};

export default function AdminDashboard() {
    const { brds } = useBRDStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);



    if (!isClient) return <div className="p-8 flex items-center justify-center min-h-screen"><Loader2 size={32} className="text-[#00338D] animate-spin" /></div>;

    const stats = [
        { title: "Total BRDs", val: brds.length.toString(), icon: <Lightbulb size={20} className="text-slate-600" />, change: "+5 this week" },
        { title: "BRD Review", val: brds.filter(b => b.status === "BRD Review").length.toString(), icon: <Clock size={20} className="text-amber-600" />, change: "Awaiting BA" },
        { title: "Approved", val: brds.filter(b => b.status === "Approved").length.toString(), icon: <CheckCircle size={20} className="text-emerald-600" />, change: "Ready for Dev" },
        { title: "In Development", val: brds.filter(b => b.status === "Development").length.toString(), icon: <PlayCircle size={20} className="text-[#00338D]" />, change: "Active Sprints" },
        { title: "Deployed", val: brds.filter(b => b.status === "Production").length.toString(), icon: <Rocket size={20} className="text-purple-600" />, change: "Since Q1" },
    ];
    return (
        <div className="py-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 mb-10 text-slate-900 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
                {/* Animated Neural Network Background */}
                <div className="absolute top-0 right-0 w-[600px] h-full overflow-hidden pointer-events-none opacity-60">
                    <svg viewBox="0 0 600 200" className="w-full h-full absolute top-1/2 -translate-y-1/2 right-[-50px]">
                        {/* Connecting Lines */}
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                            d="M450 50 L520 120 L480 170 L380 140 L350 70 Z M450 50 L380 140 M520 120 L350 70 M600 80 L520 120 M700 150 L480 170 M300 10 L350 70"
                            fill="none"
                            stroke="rgba(0,51,141,0.15)"
                            strokeWidth="1.5"
                        />

                        {/* Glowing Nodes */}
                        {[
                            { cx: 450, cy: 50, r: 4 },
                            { cx: 520, cy: 120, r: 5 },
                            { cx: 480, cy: 170, r: 3 },
                            { cx: 380, cy: 140, r: 4 },
                            { cx: 350, cy: 70, r: 5 },
                            { cx: 600, cy: 80, r: 3 },
                            { cx: 300, cy: 10, r: 2 }
                        ].map((node, i) => (
                            <motion.circle
                                key={i}
                                cx={node.cx}
                                cy={node.cy}
                                r={node.r}
                                fill="#00338D"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.6, 1, 0.6]
                                }}
                                transition={{
                                    duration: 3 + (i % 2),
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                                className="drop-shadow-[0_0_8px_rgba(0,51,141,0.4)]"
                            />
                        ))}
                    </svg>
                    <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#00A3E0]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome Back, Admin</h1>
                        <p className="text-slate-600 text-sm md:text-base">Here is your strategic enterprise overview for today.</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="interactive flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all text-sm font-semibold text-slate-700 shadow-sm hover:border-[#00338D]">
                            <ShieldCheck size={16} /> Assign Role
                        </button>
                        <button className="interactive flex items-center gap-2 px-5 py-2.5 bg-[#00338D] text-white hover:bg-[#00266e] rounded-xl transition-all text-sm shadow-md hover:shadow-lg font-bold">
                            <Plus size={16} /> Create Project
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Pipeline Summary Cards */}
            <div className="mb-6 px-1">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    <KanbanSquare size={20} className="text-[#00338D]" /> Pipeline Overview
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <AnimatedCard key={i} className="p-5 bg-white border border-slate-200 hover:border-[#00338D] transition-colors duration-200">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">{stat.icon}</div>
                        </div>
                        <h3 className="text-3xl font-bold mb-1 text-slate-900">{stat.val}</h3>
                        <p className="text-xs font-semibold text-slate-700 mb-1">{stat.title}</p>
                        <p className="text-[10px] text-slate-500">{stat.change}</p>
                    </AnimatedCard>
                ))}
            </div>

            {/* Lower Split View: Activity Log & Active Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Activity Log */}
                <AnimatedCard className="p-6 bg-white border border-slate-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Clock size={20} className="text-[#00338D]" /> Recent Activity
                        </h2>
                        <button className="text-sm text-[#00338D] font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { user: "Sarah Jenkins", action: "moved to Development", target: "PL-004", time: "10 mins ago", initials: "SJ", color: "bg-emerald-500" },
                            { user: "Michael Chen", action: "approved requirement", target: "PL-008", time: "32 mins ago", initials: "MC", color: "bg-[#00338D]" },
                            { user: "System Admin", action: "modified permissions", target: "Global Settings", time: "2 hours ago", initials: "SA", color: "bg-purple-500" },
                            { user: "Robert Wilson", action: "submitted new idea", target: "PL-012 CRM", time: "Yesterday", initials: "RW", color: "bg-[#00A3E0]" },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${log.color} flex-shrink-0`}>
                                    {log.initials}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-800">
                                        <span className="font-semibold">{log.user}</span> {log.action} <span className="font-medium text-slate-900">{log.target}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </AnimatedCard>

                {/* System Alerts & Approvals */}
                <AnimatedCard className="p-6 bg-white border border-slate-200 lg:col-span-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Activity size={20} className="text-red-500" /> Pending Actions
                        </h2>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Access Request</span>
                                <span className="text-xs text-amber-600 font-medium">2h ago</span>
                            </div>
                            <p className="text-sm text-amber-900 mb-3">David Smith requested <span className="font-semibold">Developer</span> access to PL-001.</p>
                            <div className="flex gap-2">
                                <button className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">Approve</button>
                                <button className="flex-1 py-1.5 bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-medium rounded-lg transition-colors">Deny</button>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">PDD Review</span>
                                <span className="text-xs text-slate-500 font-medium">Yesterday</span>
                            </div>
                            <p className="text-sm text-slate-700 mb-3">PL-008 is ready for final Admin sign-off.</p>
                            <button className="w-full py-1.5 bg-white border border-slate-300 hover:border-[#00338D] hover:text-[#00338D] text-slate-700 text-xs font-medium rounded-lg transition-colors">Review Document</button>
                        </div>
                    </div>
                </AnimatedCard>

                {/* Active Projects Grid (Dot Visualization) */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                            Strategic Projects
                        </h2>
                        <Link href="/dashboard/admin/pipeline">
                            <button className="group flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#00338D] transition-colors relative">
                                <span>Go to Pipeline</span>
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00338D] transition-all group-hover:w-full"></span>
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brds.slice(0, 6).map((project, index) => {
                            const currentStage = getStageIndex(project.status as BRDStatus);
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                                    className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-[#00338D]/5 hover:border-[#00338D] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                                >
                                    {/* Top Row: ID & Priority */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-slate-400 tracking-wider font-mono">
                                            {project.id}
                                        </span>
                                        <PriorityBadge priority="HIGH" />
                                    </div>

                                    {/* Title & Desc */}
                                    <div className="mb-8 items-start">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-[#00338D] transition-colors line-clamp-1">
                                            {project.projectName}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[40px]">
                                            Core enterprise requirements for {project.projectName} module upgrade and digital transformation.
                                        </p>
                                    </div>

                                    {/* Dots Progress */}
                                    <div className="flex justify-between items-center mb-8 relative mt-auto px-1">
                                        {STAGES.map((stage, i) => {
                                            const isCompleted = i < currentStage;
                                            const isCurrent = i === currentStage;

                                            return (
                                                <div key={i} className="relative group/dot flex flex-col items-center">
                                                    {/* Tooltip on Hover */}
                                                    <div className="absolute bottom-6 opacity-0 group-hover/dot:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                                        {stage}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                                    </div>

                                                    {/* Dot Container */}
                                                    <div className="w-4 h-4 flex items-center justify-center">
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: (index * 0.1) + (i * 0.08), type: "spring", stiffness: 300 }}
                                                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover/dot:scale-150 ${isCompleted ? "bg-[#00338D]" :
                                                                isCurrent ? "bg-[#00338D] ring-[3px] ring-[#00338D]/20 animate-pulse relative z-10 scale-125" :
                                                                    "bg-slate-200"
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer Metadata row */}
                                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-5 border-t border-slate-100">
                                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold px-2 py-1 bg-slate-50 rounded text-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00338D] animate-pulse"></div>
                                            {project.status}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{project.version}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
