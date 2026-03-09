"use client";

import { AgentTask } from "@/lib/agentStore";
import { X, RefreshCw } from "lucide-react";

interface TaskQueueProps {
    tasks: AgentTask[];
    onCancel: (id: string) => void;
    onRetry: (id: string) => void;
}

const statusConfig = {
    queued: { label: "Queued", bg: "bg-slate-100", text: "text-slate-600" },
    running: { label: "Running", bg: "bg-blue-50", text: "text-blue-700" },
    completed: { label: "Done", bg: "bg-emerald-50", text: "text-emerald-700" },
    failed: { label: "Failed", bg: "bg-red-50", text: "text-red-700" },
    cancelled: { label: "Cancelled", bg: "bg-slate-100", text: "text-slate-400" },
};

export default function TaskQueue({ tasks, onCancel, onRetry }: TaskQueueProps) {
    const grouped = {
        running: tasks.filter(t => t.status === "running"),
        queued: tasks.filter(t => t.status === "queued"),
        completed: tasks.filter(t => t.status === "completed" || t.status === "failed" || t.status === "cancelled"),
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                    <span className="text-2xl">📭</span>
                </div>
                <p className="text-slate-500 font-medium text-sm">No tasks in queue</p>
                <p className="text-slate-400 text-xs mt-1">Use the Execution tab to trigger a new task</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Running */}
            {grouped.running.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Running
                    </h4>
                    <div className="space-y-3">
                        {grouped.running.map(task => (
                            <TaskItem key={task.id} task={task} onCancel={onCancel} onRetry={onRetry} />
                        ))}
                    </div>
                </div>
            )}

            {/* Queued */}
            {grouped.queued.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400" /> Queued
                    </h4>
                    <div className="space-y-3">
                        {grouped.queued.map(task => (
                            <TaskItem key={task.id} task={task} onCancel={onCancel} onRetry={onRetry} />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed / Failed */}
            {grouped.completed.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
                    </h4>
                    <div className="space-y-3">
                        {grouped.completed.map(task => (
                            <TaskItem key={task.id} task={task} onCancel={onCancel} onRetry={onRetry} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function TaskItem({ task, onCancel, onRetry }: { task: AgentTask; onCancel: (id: string) => void; onRetry: (id: string) => void; }) {
    const sc = statusConfig[task.status];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-slate-800 flex-1 pr-2">{task.title}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    {(task.status === "queued" || task.status === "running") && (
                        <button onClick={() => onCancel(task.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors interactive">
                            <X size={13} />
                        </button>
                    )}
                    {task.status === "failed" && (
                        <button onClick={() => onRetry(task.id)} className="p-1 text-slate-400 hover:text-[#00338D] hover:bg-blue-50 rounded-md transition-colors interactive">
                            <RefreshCw size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress bar for running tasks */}
            {task.status === "running" && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div
                        className="bg-[#00338D] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                    />
                </div>
            )}

            <p className="text-[11px] text-slate-400 mt-2 font-mono">
                {new Date(task.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
            </p>
        </div>
    );
}
