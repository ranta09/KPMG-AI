"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp, ClipboardList, Calendar, AlertTriangle, Users, BarChart3, RefreshCw } from "lucide-react";

interface ArtifactState {
    content: string | null;
    loading: boolean;
    error: boolean;
    ganttData?: { task: string; phase: string; startWeek: number; endWeek: number }[];
}

interface BRDArtifactsPanelProps {
    brdId: string;
    projectName: string;
    sections: Record<string, string>;
}

const ARTIFACTS = [
    { key: "engineeringPlan", label: "Engineering Plan", icon: ClipboardList, color: "text-[#00338D]", bg: "bg-[#00338D]/5", description: "Feature breakdown, architecture, implementation phases" },
    { key: "projectSchedule", label: "Project Schedule", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", description: "Timeline, milestones, task assignments" },
    { key: "ganttData", label: "Gantt Chart", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50", description: "Visual project timeline with phases" },
    { key: "riskAnalysis", label: "Risk Analysis", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", description: "Identified risks with mitigation strategies" },
    { key: "resourceRequirements", label: "Resource Requirements", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", description: "Team composition, technology stack, estimated costs" },
] as const;

type ArtifactKey = typeof ARTIFACTS[number]["key"];

export function BRDArtifactsPanel({ brdId, projectName, sections }: BRDArtifactsPanelProps) {
    const [artifacts, setArtifacts] = useState<Record<string, ArtifactState>>({});
    const [expanded, setExpanded] = useState<string | null>(null);

    const generateArtifact = async (artifactType: ArtifactKey) => {
        setArtifacts(prev => ({ ...prev, [artifactType]: { content: null, loading: true, error: false } }));
        setExpanded(artifactType);

        try {
            const res = await fetch("/api/brd/artifacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brdSections: sections, artifactType, projectName }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setArtifacts(prev => ({
                ...prev,
                [artifactType]: {
                    content: data.content,
                    loading: false,
                    error: false,
                    ganttData: data.data,
                }
            }));
        } catch {
            setArtifacts(prev => ({ ...prev, [artifactType]: { content: null, loading: false, error: true } }));
        }
    };

    const renderMarkdown = (content: string) => {
        const lines = content.split("\n");
        return lines.map((line, i) => {
            if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-1">{line.slice(4)}</h3>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-[#00338D] mt-5 mb-2 border-b border-[#00338D]/10 pb-1">{line.slice(3)}</h2>;
            if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.slice(2)}</h1>;
            if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-sm text-slate-600 ml-4 mb-0.5 list-disc">{line.slice(2)}</li>;
            if (line.startsWith("| ")) {
                const cells = line.split("|").filter(c => c.trim());
                const isHeader = lines[i + 1]?.includes("---");
                const isSeparator = line.includes("---");
                if (isSeparator) return null;
                return (
                    <tr key={i} className={isHeader ? "bg-[#00338D]/5" : "border-b border-slate-100 hover:bg-slate-50"}>
                        {cells.map((cell, j) => isHeader
                            ? <th key={j} className="px-3 py-2 text-left text-[11px] font-bold text-[#00338D] uppercase tracking-wider">{cell.trim()}</th>
                            : <td key={j} className="px-3 py-2 text-xs text-slate-600">{cell.trim()}</td>
                        )}
                    </tr>
                );
            }
            if (line.trim() === "") return <div key={i} className="h-2" />;
            if (/^\d+\.\s/.test(line)) return <li key={i} className="text-sm text-slate-600 ml-4 mb-0.5 list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
            return <p key={i} className="text-sm text-slate-600 leading-relaxed">{line}</p>;
        });
    };

    const renderGantt = (data: { task: string; phase: string; startWeek: number; endWeek: number }[]) => {
        if (!data || data.length === 0) return <p className="text-sm text-slate-400 italic">No Gantt data available.</p>;

        const maxWeek = Math.max(...data.map(d => d.endWeek), 12);
        const phases = [...new Set(data.map(d => d.phase))];
        const phaseColors = ["bg-[#00338D]", "bg-purple-500", "bg-indigo-500", "bg-emerald-500", "bg-orange-500"];

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    {/* Week header */}
                    <div className="flex mb-2 ml-40">
                        {Array.from({ length: maxWeek }, (_, i) => (
                            <div key={i} className="flex-1 text-center text-[9px] font-bold text-slate-400 border-l border-slate-100">
                                W{i + 1}
                            </div>
                        ))}
                    </div>

                    {phases.map((phase, pi) => {
                        const phaseTasks = data.filter(d => d.phase === phase);
                        const color = phaseColors[pi % phaseColors.length];

                        return (
                            <div key={phase} className="mb-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{phase}</p>
                                {phaseTasks.map((task, ti) => (
                                    <div key={ti} className="flex items-center mb-1">
                                        <div className="w-40 flex-shrink-0 pr-2">
                                            <p className="text-[10px] text-slate-600 truncate" title={task.task}>{task.task}</p>
                                        </div>
                                        <div className="flex-1 relative h-5 bg-slate-50 rounded border border-slate-100">
                                            <div
                                                className={`absolute h-full rounded ${color} opacity-80`}
                                                style={{
                                                    left: `${((task.startWeek - 1) / maxWeek) * 100}%`,
                                                    width: `${((task.endWeek - task.startWeek + 1) / maxWeek) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#00338D]/10 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-[#00338D]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Engineering Artifacts</h3>
                    <p className="text-[11px] text-slate-500">AI-generated from your BRD content. Click to generate each artifact.</p>
                </div>
            </div>

            {ARTIFACTS.map(({ key, label, icon: Icon, color, bg, description }) => {
                const state = artifacts[key];
                const isExpanded = expanded === key;
                const isGenerated = !!state?.content;

                return (
                    <div key={key} className={`border rounded-xl overflow-hidden transition-all ${isGenerated ? "border-slate-200 shadow-sm" : "border-dashed border-slate-200"}`}>
                        <div className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isGenerated ? "bg-white" : "bg-slate-50/30"}`}
                            onClick={() => isGenerated ? setExpanded(isExpanded ? null : key) : null}>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <Icon size={16} className={color} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-800">{label}</p>
                                        {isGenerated && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 uppercase tracking-wider">Generated</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500">{description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {state?.loading ? (
                                    <Loader2 size={16} className="text-[#00338D] animate-spin" />
                                ) : isGenerated ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); generateArtifact(key as ArtifactKey); }}
                                            className="p-1.5 text-slate-400 hover:text-[#00338D] hover:bg-[#00338D]/5 rounded-lg transition-all" title="Regenerate">
                                            <RefreshCw size={13} />
                                        </button>
                                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                    </div>
                                ) : (
                                    <button onClick={() => generateArtifact(key as ArtifactKey)}
                                        disabled={state?.loading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00338D] text-white text-[11px] font-bold rounded-lg hover:bg-[#001f5c] transition-all shadow-sm shadow-[#00338D]/10 disabled:opacity-50">
                                        <Sparkles size={11} /> Generate
                                    </button>
                                )}
                                {state?.error && (
                                    <button onClick={() => generateArtifact(key as ArtifactKey)}
                                        className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                                        <RefreshCw size={11} /> Retry
                                    </button>
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {isExpanded && isGenerated && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-slate-100">
                                    <div className="p-5 bg-white max-h-96 overflow-y-auto">
                                        {key === "ganttData" && state.ganttData
                                            ? renderGantt(state.ganttData)
                                            : <div className="space-y-0.5">
                                                {state.content && (() => {
                                                    const hasTable = state.content.includes("|");
                                                    if (hasTable) {
                                                        return <table className="w-full border border-slate-200 rounded-lg overflow-hidden text-xs">{renderMarkdown(state.content)}</table>;
                                                    }
                                                    return <>{renderMarkdown(state.content)}</>;
                                                })()}
                                            </div>
                                        }
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
