"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, FileText, FolderOpen, Folder } from "lucide-react";
import { useDeveloperStore, AGENTS, AgentName } from "@/lib/developerStore";
import AgentIcon from "./AgentIcon";
import { BRDRecord } from "@/lib/brdStore";

const ORDER = ["architecture", "uiux", "codegen", "review", "qa", "deploy"] as const;

interface Props {
    dark: boolean;
    activeBrd: BRDRecord | null;
}

export default function ExplorerPanel({ dark, activeBrd }: Props) {
    const store = useDeveloperStore();
    const [pipelineOpen, setPipelineOpen] = useState(true);
    const [contextOpen, setContextOpen]   = useState(false);

    const bg       = dark ? "#252526" : "#f3f3f3";
    const headerBg = dark ? "#2c2c2c" : "#e8e8e8";
    const text     = dark ? "#cccccc" : "#1e1e1e";
    const muted    = dark ? "#777777" : "#6b7280";
    const border   = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
    const hoverBg  = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const activeBg = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const stepStatus = (id: string) => {
        if (!activeBrd) return "idle";
        const o = store.getOutput(activeBrd.id, id as AgentName);
        if (o?.status === "accepted") return "done";
        if (o?.status === "running")  return "running";
        if (o?.status === "draft")    return "draft";
        return "idle";
    };

    const doneCount = ORDER.filter(id => stepStatus(id) === "done").length;

    const SectionHeader = ({ label, open, onToggle, right }: { label: string; open: boolean; onToggle: () => void; right?: React.ReactNode }) => (
        <button onClick={onToggle}
            className="w-full flex items-center gap-1 px-2 py-1 text-left transition-colors"
            style={{ background: headerBg }}>
            {open
                ? <ChevronDown size={10} style={{ color: muted }} />
                : <ChevronRight size={10} style={{ color: muted }} />}
            <span className="text-[10px] font-semibold uppercase tracking-widest flex-1" style={{ color: muted }}>{label}</span>
            {right}
        </button>
    );

    return (
        <div className="w-52 shrink-0 flex flex-col overflow-hidden select-none"
            style={{ background: bg, borderRight: `1px solid ${border}` }}>

            {/* Panel title */}
            <div className="px-3 py-2 flex items-center"
                style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: muted }}>Explorer</span>
            </div>

            {/* PIPELINE */}
            <div>
                <SectionHeader label="Pipeline" open={pipelineOpen} onToggle={() => setPipelineOpen(v => !v)}
                    right={activeBrd && (
                        <span className="text-[10px] font-mono" style={{ color: muted }}>{doneCount}/{ORDER.length}</span>
                    )} />

                {pipelineOpen && (
                    <div className="py-0.5">
                        {AGENTS.map(a => {
                            const status    = stepStatus(a.id);
                            const isActive  = store.activeAgent === a.id;
                            const isDone    = status === "done";
                            const isRunning = status === "running";
                            const isDraft   = status === "draft";

                            const iconColor = isDone    ? "#34d399"
                                           : isRunning ? "#60a5fa"
                                           : isDraft   ? "#fbbf24"
                                           : isActive  ? a.color
                                           : muted;

                            return (
                                <button key={a.id}
                                    onClick={() => store.setActiveAgent(a.id as AgentName)}
                                    className="w-full flex items-center gap-2 pl-5 pr-3 py-1 text-left transition-colors"
                                    style={{ background: isActive ? activeBg : "transparent" }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hoverBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isActive ? activeBg : "transparent"; }}>
                                    <AgentIcon name={a.iconName} size={12} color={iconColor} />
                                    <span className="text-[12px] flex-1 truncate" style={{ color: isActive ? text : muted }}>
                                        {a.label.toLowerCase().replace(/ /g, "-")}.md
                                    </span>
                                    {isDone    && <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />}
                                    {isDraft   && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                                    {isRunning && <Loader2 size={10} className="text-blue-400 animate-spin shrink-0" />}
                                </button>
                            );
                        })}

                        {/* Progress bar */}
                        {activeBrd && (
                            <div className="mx-4 mt-2 mb-1">
                                <div className="h-[2px] rounded-full overflow-hidden"
                                    style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.round((doneCount / ORDER.length) * 100)}%` }} />
                                </div>
                                <p className="text-[9px] mt-1 font-mono" style={{ color: muted }}>{doneCount} of {ORDER.length} complete</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BRD CONTEXT */}
            {activeBrd && (
                <div style={{ borderTop: `1px solid ${border}` }}>
                    <SectionHeader label="BRD Context" open={contextOpen} onToggle={() => setContextOpen(v => !v)} />

                    {contextOpen && (
                        <div className="py-0.5 max-h-72 overflow-y-auto">
                            {/* BRD meta */}
                            <div className="pl-5 pr-3 py-1.5">
                                <div className="flex items-center gap-2">
                                    <FolderOpen size={11} style={{ color: "#60a5fa" }} />
                                    <span className="text-[11px] font-mono text-blue-500 truncate">{activeBrd.id}</span>
                                </div>
                                <p className="text-[11px] font-medium truncate mt-0.5 pl-[19px]" style={{ color: text }}>{activeBrd.projectName}</p>
                                <p className="text-[10px] pl-[19px]" style={{ color: muted }}>v{activeBrd.version} · {activeBrd.status}</p>
                            </div>

                            {/* BRD sections as files */}
                            {Object.entries(activeBrd.sections)
                                .filter(([, v]) => v)
                                .map(([key]) => (
                                    <div key={key}
                                        className="flex items-center gap-2 pl-8 pr-3 py-0.5 transition-colors cursor-default"
                                        style={{ color: muted }}
                                        onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                        <FileText size={10} style={{ color: muted }} className="shrink-0" />
                                        <span className="text-[11px] truncate capitalize">
                                            {key.replace(/([A-Z])/g, "-$1").toLowerCase()}.md
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
