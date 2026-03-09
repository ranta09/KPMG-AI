"use client";

import { motion } from "framer-motion";
import { AgentConfig, AgentTask } from "@/lib/agentStore";
import { Clock, Zap, WifiOff, ChevronRight } from "lucide-react";

interface AgentCardProps {
    agent: AgentConfig;
    tasks: AgentTask[];
    onClick: () => void;
    index: number;
}

const statusConfig = {
    Active: { label: "Active", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", Icon: Zap },
    Idle: { label: "Idle", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", Icon: Clock },
    Offline: { label: "Offline", bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400", Icon: WifiOff },
};

export default function AgentCard({ agent, tasks, onClick, index }: AgentCardProps) {
    const sc = statusConfig[agent.status];
    const StatusIcon = sc.Icon;
    const queued = tasks.filter(t => t.status === "queued").length;
    const running = tasks.filter(t => t.status === "running").length;
    const totalQueued = queued + running;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 22 }}
            onClick={onClick}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-[#00338D]/8 hover:border-[#00338D]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
            {/* Top accent bar for Active agents */}
            {agent.status === "Active" && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00338D] to-[#00A3E0] rounded-t-2xl" />
            )}

            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${agent.color} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                        {agent.shortName}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-[#00338D] transition-colors">
                            {agent.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{agent.projectContext}</p>
                    </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-[#00338D] transition-colors mt-1 flex-shrink-0" />
            </div>

            {/* Purpose */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-5 min-h-[32px]">
                {agent.purpose}
            </p>

            {/* Capabilities Count */}
            <div className="flex flex-wrap gap-1.5 mb-5">
                {agent.buildTypes?.slice(0, 4).map(mod => (
                    <span key={mod} className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#00338D]/8 text-[#00338D] border border-[#00338D]/15">
                        {mod}
                    </span>
                ))}
                {!agent.buildTypes && (
                    <span className="text-[10px] font-medium text-slate-400">{agent.capabilities.length} capabilities</span>
                )}
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${agent.status === "Active" ? "animate-pulse" : ""}`} />
                    <StatusIcon size={11} />
                    {sc.label}
                </div>

                {/* Task Queue Count */}
                {totalQueued > 0 ? (
                    <div className="flex items-center gap-1.5">
                        {running > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#00338D] border border-blue-100">
                                {running} running
                            </span>
                        )}
                        {queued > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {queued} queued
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-[11px] text-slate-400 font-medium">No tasks queued</span>
                )}
            </div>
        </motion.div>
    );
}
