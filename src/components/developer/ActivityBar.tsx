"use client";

import { AGENTS, AgentName, useDeveloperStore } from "@/lib/developerStore";
import { BRDRecord } from "@/lib/brdStore";
import AgentIcon from "./AgentIcon";
import { LogOut, Package2 } from "lucide-react";

interface Props {
    dark: boolean;
    activeBrd: BRDRecord | null;
    view: "pipeline" | "extensions";
    onViewChange: (v: "pipeline" | "extensions") => void;
    onLogout: () => void;
}

export default function ActivityBar({ dark, activeBrd, view, onViewChange, onLogout }: Props) {
    const store = useDeveloperStore();

    const bg          = dark ? "#333333" : "#e8e8e8";
    const border      = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
    const muted       = dark ? "#606060" : "#9a9a9a";
    const activeBg    = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
    const hoverBg     = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
    const tooltipBg   = dark ? "#3c3c3c" : "#ffffff";
    const tooltipText = dark ? "#cccccc" : "#1e1e1e";

    const stepStatus = (id: string) => {
        if (!activeBrd) return "idle";
        const o = store.getOutput(activeBrd.id, id as AgentName);
        if (o?.status === "accepted") return "done";
        if (o?.status === "running")  return "running";
        if (o?.status === "draft")    return "draft";
        return "idle";
    };

    const Tooltip = ({ label }: { label: string }) => (
        <span className="absolute left-full ml-2.5 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap z-50
                         opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg"
            style={{ background: tooltipBg, color: tooltipText, border: `1px solid ${border}` }}>
            {label}
        </span>
    );

    return (
        <div className="w-10 shrink-0 flex flex-col items-center pt-1 pb-2 gap-0.5"
            style={{ background: bg, borderRight: `1px solid ${border}` }}>

            {/* Pipeline agent icons */}
            {AGENTS.map(a => {
                const status    = stepStatus(a.id);
                const isActive  = store.activeAgent === a.id && view === "pipeline";
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
                        onClick={() => { store.setActiveAgent(a.id as AgentName); onViewChange("pipeline"); }}
                        className="relative w-8 h-8 rounded flex items-center justify-center transition-all group"
                        style={{ background: isActive ? activeBg : "transparent" }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hoverBg; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                        <AgentIcon name={a.iconName} size={15} color={iconColor} />

                        {isDone    && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        {isDraft   && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        {isRunning && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                        {isActive  && <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r" style={{ background: a.color }} />}

                        <Tooltip label={a.label} />
                    </button>
                );
            })}

            {/* Bottom: Extensions + Logout */}
            <div className="mt-auto flex flex-col items-center gap-0.5 pb-1">

                {/* Extensions / Plugins */}
                <button onClick={() => onViewChange(view === "extensions" ? "pipeline" : "extensions")}
                    className="relative w-8 h-8 rounded flex items-center justify-center transition-all group"
                    style={{
                        background: view === "extensions" ? activeBg : "transparent",
                        color: view === "extensions" ? "#a78bfa" : muted,
                    }}
                    onMouseEnter={e => { if (view !== "extensions") e.currentTarget.style.background = hoverBg; }}
                    onMouseLeave={e => { if (view !== "extensions") e.currentTarget.style.background = "transparent"; }}>
                    <Package2 size={15} />
                    {view === "extensions" && (
                        <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r bg-violet-400" />
                    )}
                    <Tooltip label="Extensions" />
                </button>

                {/* Logout */}
                <button onClick={onLogout}
                    className="relative w-8 h-8 rounded flex items-center justify-center transition-all group"
                    style={{ color: muted }}
                    onMouseEnter={e => { e.currentTarget.style.background = hoverBg; (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = muted; }}>
                    <LogOut size={14} />
                    <Tooltip label="Logout" />
                </button>
            </div>
        </div>
    );
}
