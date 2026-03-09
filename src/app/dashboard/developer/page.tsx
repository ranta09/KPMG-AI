"use client";

import { motion } from "framer-motion";
import { Bot, GitBranch, Activity, CheckCircle2, Clock, Zap, ArrowRight, Terminal, Shield, BarChart3, Layers } from "lucide-react";
import Link from "next/link";

const AGENT_STATUS = [
    { name: "Code Builder", status: "Active", tasks: 3, color: "bg-emerald-500" },
    { name: "Test Orchestrator", status: "Running", tasks: 1, color: "bg-blue-400" },
    { name: "Solution Architect", status: "Idle", tasks: 0, color: "bg-slate-500" },
    { name: "Deployment Manager", status: "Idle", tasks: 0, color: "bg-slate-500" },
    { name: "Security Reviewer", status: "Active", tasks: 2, color: "bg-amber-400" },
];

const RECENT_BUILDS = [
    { id: "BUILD-042", project: "AP Automation BRD", type: "REST API", status: "Awaiting Review", time: "2m ago" },
    { id: "BUILD-039", project: "S/4HANA Migration", type: "Integration Workflow", status: "Approved", time: "1h ago" },
    { id: "BUILD-035", project: "Vendor Portal", type: "SAP Fiori App", status: "Deployed", time: "3h ago" },
];

const STATUS_MAP = {
    "Awaiting Review": { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    "Approved": { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    "Deployed": { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
};

const SYSTEM_HEALTH = [
    { label: "API Gateway", value: "99.98%", icon: Zap, ok: true },
    { label: "Agent Pipeline", value: "Operational", icon: Activity, ok: true },
    { label: "Build Queue", value: "6 jobs", icon: Layers, ok: true },
    { label: "Security Scan", value: "2 alerts", icon: Shield, ok: false },
];

export default function DeveloperDashboard() {
    return (
        <div className="py-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute right-0 top-0 h-full w-72 opacity-30 pointer-events-none">
                    <div className="grid grid-cols-8 gap-3 h-full p-6">
                        {Array.from({ length: 64 }).map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-[#00A3E0]/40" />)}
                    </div>
                </div>
                {/* Terminal blink cursor */}
                <div className="flex items-center gap-2 mb-3">
                    <Terminal size={16} className="text-[#00338D]" />
                    <span className="font-mono text-xs text-slate-500">developer@kpmg-sap ~</span>
                    <span className="inline-block w-2 h-4 bg-[#00338D]/60 animate-pulse ml-1 align-middle rounded-sm" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Developer Workspace</h1>
                <p className="text-sm text-slate-600">AI Agent control centre · Build pipeline · System health</p>

                <div className="flex flex-wrap gap-4 mt-6">
                    <Link href="/dashboard/developer/agents">
                        <motion.button whileHover={{ scale: 1.03 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#00338D] text-white hover:bg-[#001f5c] font-bold text-sm rounded-xl transition-all interactive shadow-md hover:shadow-lg">
                            <Bot size={15} /> Open Agent Control Tower <ArrowRight size={14} />
                        </motion.button>
                    </Link>
                    <motion.button whileHover={{ scale: 1.03 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-[#00338D] font-semibold text-sm rounded-xl transition-all interactive shadow-sm">
                        <GitBranch size={15} /> View Build Queue
                    </motion.button>
                </div>
            </motion.div>

            {/* System Health Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {SYSTEM_HEALTH.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <motion.div key={item.label}
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className="bg-white border-slate-200 rounded-2xl p-4 border shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: item.ok ? "rgba(74,222,128,0.10)" : "rgba(251,191,36,0.10)" }}>
                                    <Icon size={15} className={item.ok ? "text-emerald-400" : "text-amber-400"} />
                                </div>
                                <div className={`w-2 h-2 rounded-full ${item.ok ? "bg-emerald-500" : "bg-amber-500"} shadow-[0_0_6px_rgba(74,222,128,0.6)]`} />
                            </div>
                            <p className="text-xs font-medium mb-1 text-slate-400">{item.label}</p>
                            <p className="text-sm font-bold" style={{ color: item.ok ? "#4ade80" : "#fbbf24" }}>{item.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Agent Status Panel */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white border-slate-200 rounded-2xl overflow-hidden border shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                            <Bot size={15} className="text-[#00338D]" /> AI Agent Status
                        </h2>
                        <Link href="/dashboard/developer/agents"
                            className="flex items-center gap-1 text-xs font-bold interactive transition-colors text-[#00338D] hover:text-[#00A3E0]">
                            Manage Agents <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100/10">
                        {AGENT_STATUS.map((agent, i) => (
                            <motion.div key={agent.name}
                                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                                className="flex items-center justify-between px-6 py-4 transition-all group interactive hover:bg-slate-50/50 hover:border-[#00338D]/30 border-b border-transparent last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${agent.color} ${agent.status !== "Idle" ? "shadow-[0_0_8px_currentColor]" : ""}`} />
                                    <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {agent.tasks > 0 && (
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#00338D]/10 text-[#00338D] border border-[#00338D]/20">
                                            {agent.tasks} task{agent.tasks > 1 ? "s" : ""}
                                        </span>
                                    )}
                                    <span className={`text-xs font-bold ${agent.status === "Active" ? "text-emerald-500" : agent.status === "Running" ? "text-blue-500" : "text-slate-500"}`}>{agent.status}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Column */}
                <div className="space-y-5">
                    {/* Build Pipeline Summary */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white border-slate-200 rounded-2xl p-5 border shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <BarChart3 size={14} className="text-[#00338D]" /> Build Pipeline
                        </h3>
                        {[
                            { label: "Awaiting Review", count: 3, color: "bg-blue-500" },
                            { label: "Approved", count: 5, color: "bg-emerald-500" },
                            { label: "Deployed", count: 12, color: "bg-purple-500" },
                        ].map(row => (
                            <div key={row.label} className="flex items-center gap-3 mb-3 last:mb-0">
                                <div className={`w-2 h-2 rounded-full ${row.color}`} />
                                <p className="text-xs flex-1 text-slate-500 font-medium">{row.label}</p>
                                <p className="text-sm font-bold text-slate-900">{row.count}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        className="bg-white border-slate-200 rounded-2xl p-5 border shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Activity size={14} className="text-[#00338D]" /> This Sprint
                        </h3>
                        {[
                            { label: "Tests Passed", value: "94%", icon: CheckCircle2, ok: true },
                            { label: "Avg Build Time", value: "4.2 min", icon: Clock, ok: true },
                            { label: "Deployments", value: "7 this week", icon: Zap, ok: true },
                        ].map(stat => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex items-center gap-3 mb-3 last:mb-0">
                                    <Icon size={13} className={stat.ok ? "text-emerald-500" : "text-amber-500"} />
                                    <p className="text-xs flex-1 text-slate-500 font-medium">{stat.label}</p>
                                    <p className="text-xs font-bold text-slate-900">{stat.value}</p>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Recent Builds */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="mt-6 bg-white border-slate-200 rounded-2xl overflow-hidden border shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                        <GitBranch size={15} className="text-[#00338D]" /> Recent Builds Awaiting Developer Review
                    </h2>
                </div>
                <div className="divide-y divide-slate-100/10">
                    {RECENT_BUILDS.map((build, i) => {
                        const sc = STATUS_MAP[build.status as keyof typeof STATUS_MAP];
                        return (
                            <motion.div key={build.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.06 }}
                                className="flex items-center justify-between px-6 py-4 transition-all interactive group hover:bg-slate-50/50 hover:border-[#00338D]/30 border-b border-transparent last:border-0">
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs font-bold text-[#00338D]">{build.id}</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{build.project}</p>
                                        <p className="text-xs mt-0.5 text-slate-500">{build.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${sc.text} ${sc.bg} ${sc.border}`}>{build.status}</span>
                                    <span className="text-xs text-slate-400 font-medium">{build.time}</span>
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#00338D]" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
