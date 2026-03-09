"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, Zap, Clock, WifiOff, Filter } from "lucide-react";
import { AGENTS, INITIAL_TASKS, AgentTask, AgentConfig } from "@/lib/agentStore";
import AgentCard from "@/components/agents/AgentCard";
import AgentModal from "@/components/agents/AgentModal";

type StatusFilter = "All" | "Active" | "Idle" | "Offline";

export default function AgentsPage() {
    const [tasks, setTasks] = useState<AgentTask[]>(INITIAL_TASKS);
    const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

    const handleCancelTask = useCallback((id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" as const, progress: 0 } : t));
    }, []);

    const handleRetryTask = useCallback((id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "queued" as const, progress: 0 } : t));
    }, []);

    const handleAddTask = useCallback((agentId: string, title: string) => {
        const newTask: AgentTask = {
            id: `t-${Date.now()}`,
            title,
            status: "running",
            progress: 0,
            agentId,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [newTask, ...prev]);

        // Simulate task progression to complete
        const steps = [25, 50, 75, 100];
        steps.forEach((prog, i) => {
            setTimeout(() => {
                setTasks(prev => prev.map(t => t.id === newTask.id
                    ? { ...t, progress: prog, status: prog === 100 ? "completed" as const : "running" as const }
                    : t
                ));
            }, (i + 1) * 2000);
        });
    }, []);

    const filteredAgents = AGENTS.filter(a => statusFilter === "All" || a.status === statusFilter);

    // Summary counts
    const activeCount = AGENTS.filter(a => a.status === "Active").length;
    const idleCount = AGENTS.filter(a => a.status === "Idle").length;
    const offlineCount = AGENTS.filter(a => a.status === "Offline").length;
    const totalQueued = tasks.filter(t => t.status === "queued" || t.status === "running").length;

    return (
        <div className="py-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-900 to-[#00338D] rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden"
            >
                {/* Decorative dots */}
                <div className="absolute right-0 top-0 h-full w-64 opacity-10 pointer-events-none">
                    <div className="grid grid-cols-8 gap-4 h-full p-4">
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">SAP AI Agent Ecosystem</h1>
                            <p className="text-blue-200/80 text-sm">Enterprise transformation control tower — Requirement to Deployment</p>
                        </div>
                    </div>

                    {/* System Health Bar */}
                    <div className="flex gap-6 mt-5 pt-5 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm font-semibold text-emerald-300">{activeCount} Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-sm font-semibold text-amber-200">{idleCount} Idle</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-500" />
                            <span className="text-sm text-slate-400">{offlineCount} Offline</span>
                        </div>
                        <div className="ml-auto text-sm font-semibold text-blue-200">
                            {totalQueued} tasks in queue
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filter Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-6"
            >
                <Filter size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500 font-medium mr-1">Filter:</span>
                {(["All", "Active", "Idle", "Offline"] as StatusFilter[]).map(f => {
                    const icons = { All: Bot, Active: Zap, Idle: Clock, Offline: WifiOff };
                    const Icon = icons[f];
                    return (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all interactive ${statusFilter === f
                                ? "bg-[#00338D] text-white shadow-sm"
                                : "bg-white border border-slate-200 text-slate-600 hover:border-[#00338D] hover:text-[#00338D]"
                                }`}
                        >
                            <Icon size={12} /> {f}
                        </button>
                    );
                })}
                <span className="ml-auto text-sm text-slate-400">{filteredAgents.length} agents shown</span>
            </motion.div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredAgents.map((agent, index) => (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        tasks={tasks.filter(t => t.agentId === agent.id)}
                        onClick={() => setSelectedAgent(agent)}
                        index={index}
                    />
                ))}
            </div>

            {/* Agent Pipeline Flow */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
                <h2 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Bot size={16} className="text-[#00338D]" /> SAP Transformation Lifecycle
                </h2>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {AGENTS.map((agent, i) => (
                        <div key={agent.id} className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => setSelectedAgent(agent)}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all interactive hover:-translate-y-0.5 ${agent.status === "Active"
                                    ? "bg-[#00338D]/5 border-[#00338D]/20 hover:border-[#00338D]"
                                    : agent.status === "Idle"
                                        ? "bg-amber-50 border-amber-100 hover:border-amber-400"
                                        : "bg-slate-50 border-slate-200 hover:border-slate-400"
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg ${agent.color} flex items-center justify-center text-white font-bold text-xs mb-1.5 shadow-sm`}>
                                    {agent.shortName}
                                </div>
                                <p className="text-[10px] font-semibold text-slate-700 text-center whitespace-nowrap max-w-[72px] leading-tight">
                                    {agent.name.split(" ")[0]}
                                </p>
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${agent.status === "Active" ? "bg-emerald-500 animate-pulse" : agent.status === "Idle" ? "bg-amber-400" : "bg-slate-300"}`} />
                            </button>
                            {i < AGENTS.length - 1 && (
                                <div className="w-6 h-px bg-slate-200 flex-shrink-0 relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-r-0 border-b-4 border-l-4 border-transparent border-l-slate-300 w-0 h-0" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Agent Modal */}
            {selectedAgent && (
                <AgentModal
                    agent={selectedAgent}
                    tasks={tasks.filter(t => t.agentId === selectedAgent.id)}
                    onClose={() => setSelectedAgent(null)}
                    onCancelTask={handleCancelTask}
                    onRetryTask={handleRetryTask}
                    onAddTask={handleAddTask}
                />
            )}
        </div>
    );
}
