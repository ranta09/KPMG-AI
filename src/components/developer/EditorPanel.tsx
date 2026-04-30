"use client";

import { useRef, useEffect } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useDeveloperStore, AGENTS, AgentName } from "@/lib/developerStore";
import AgentIcon from "./AgentIcon";
import { BRDRecord } from "@/lib/brdStore";

interface Props {
    dark: boolean;
    brd: BRDRecord;
}

export default function EditorPanel({ dark, brd }: Props) {
    const store     = useDeveloperStore();
    const agent     = store.activeAgent;
    const output    = store.getOutput(brd.id, agent);
    const content   = output?.versions[output.versions.length - 1]?.content || "";
    const isRunning = output?.status === "running";
    const isDraft   = output?.status === "draft";
    const isAccepted = output?.status === "accepted";
    const agentMeta = AGENTS.find(a => a.id === agent)!;
    const contentRef = useRef<HTMLDivElement>(null);

    const editorBg   = dark ? "#1e1e1e" : "#ffffff";
    const tabBarBg   = dark ? "#2d2d2d" : "#ececec";
    const activeTabBg = dark ? "#1e1e1e" : "#ffffff";
    const text       = dark ? "#d4d4d4" : "#1e1e1e";
    const muted      = dark ? "#808080" : "#6b7280";
    const border     = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
    const lineNumCol = dark ? "#444444" : "#c8c8c8";
    const lineNumBg  = dark ? "#1e1e1e" : "#f9f9f9";

    useEffect(() => {
        if (isRunning && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [content, isRunning]);

    // Tabs: active agent + any that have output
    const tabs = AGENTS.filter(a => {
        const o = store.getOutput(brd.id, a.id);
        return a.id === agent || (o && o.versions.length > 0);
    });

    const lines = content.split("\n");

    const fileName = `${agentMeta.label.toLowerCase().replace(/ \//g, "-").replace(/ /g, "-")}.md`;

    return (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: editorBg }}>

            {/* Tab bar */}
            <div className="flex items-end shrink-0 overflow-x-auto"
                style={{ background: tabBarBg, borderBottom: `1px solid ${border}`, minHeight: "36px" }}>
                {tabs.map(a => {
                    const isActive = a.id === agent;
                    const o  = store.getOutput(brd.id, a.id);
                    const st = o?.status;
                    return (
                        <button key={a.id}
                            onClick={() => store.setActiveAgent(a.id as AgentName)}
                            className="relative flex items-center gap-1.5 px-4 py-2 text-[12px] shrink-0 transition-colors"
                            style={{
                                background:    isActive ? activeTabBg : "transparent",
                                color:         isActive ? text : muted,
                                borderTopColor:    isActive ? "#00338D" : "transparent",
                                borderTopWidth:    "1px",
                                borderTopStyle:    "solid",
                                borderRightColor:  border,
                                borderRightWidth:  "1px",
                                borderRightStyle:  "solid",
                                borderBottomColor: "transparent",
                                borderBottomWidth: "1px",
                                borderBottomStyle: "solid",
                                borderLeftColor:   "transparent",
                                borderLeftWidth:   "1px",
                                borderLeftStyle:   "solid",
                            }}>
                            <AgentIcon name={a.iconName} size={11} color={isActive ? a.color : muted} />
                            <span className="font-mono text-[11px]">
                                {a.label.toLowerCase().replace(/ \//g, "-").replace(/ /g, "-")}.md
                            </span>
                            {st === "draft"    && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" title="Draft — unsaved" />}
                            {st === "running"  && <Loader2 size={9} className="text-blue-400 animate-spin ml-0.5" />}
                            {st === "accepted" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />}
                        </button>
                    );
                })}
            </div>

            {/* Breadcrumb + action bar */}
            <div className="shrink-0 flex items-center gap-1.5 px-4 py-1 text-[11px]"
                style={{ background: editorBg, borderBottom: `1px solid ${border}` }}>
                <span className="font-mono text-blue-500">{brd.id}</span>
                <span style={{ color: muted }}>›</span>
                <span style={{ color: muted }}>{agentMeta.label.toLowerCase().replace(/ /g, "-")}</span>
                <span style={{ color: muted }}>›</span>
                <span style={{ color: text }}>{fileName}</span>

                {isRunning  && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>GENERATING…</span>}
                {isDraft    && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>DRAFT</span>}
                {isAccepted && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>ACCEPTED</span>}

                {isDraft && (
                    <button onClick={() => store.acceptOutput(brd.id, agent)}
                        className="ml-auto flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors"
                        style={{ background: "rgba(52,211,153,0.10)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                        <CheckCircle2 size={10} /> Accept output
                    </button>
                )}
                {isAccepted && (
                    <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#34d399" }}>
                        <CheckCircle2 size={10} /> Accepted
                    </span>
                )}
            </div>

            {/* Editor content */}
            {content ? (
                <div ref={contentRef} className="flex-1 overflow-auto">
                    <div className="flex" style={{ minHeight: "100%" }}>

                        {/* Line numbers */}
                        <div className="shrink-0 py-4 px-3 text-right select-none"
                            style={{
                                minWidth: "52px",
                                background: lineNumBg,
                                borderRight: `1px solid ${border}`,
                                color: lineNumCol,
                                fontFamily: "'ui-monospace','Cascadia Code','Fira Code',monospace",
                                fontSize: "12px",
                                lineHeight: "1.65",
                            }}>
                            {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
                        </div>

                        {/* Code content */}
                        <pre className="flex-1 py-4 px-6 leading-relaxed overflow-hidden"
                            style={{
                                color: text,
                                background: editorBg,
                                fontFamily: "'ui-monospace','Cascadia Code','Fira Code',monospace",
                                fontSize: "12.5px",
                                lineHeight: "1.65",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                minWidth: 0,
                            }}>
                            {content}
                            {isRunning && (
                                <span className="inline-block w-[2px] h-[14px] bg-blue-400 animate-pulse ml-0.5 align-middle rounded-sm" />
                            )}
                        </pre>
                    </div>
                </div>
            ) : (
                // Empty state
                <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: muted }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: `${agentMeta.color}12`, border: `1px solid ${agentMeta.color}25` }}>
                        <AgentIcon name={agentMeta.iconName} size={22} color={agentMeta.color} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold mb-1" style={{ color: text }}>{agentMeta.label} Agent</p>
                        <p className="text-[12px] max-w-xs leading-relaxed" style={{ color: muted }}>{agentMeta.desc}</p>
                    </div>
                    <p className="text-[11px] flex items-center gap-1.5" style={{ color: muted, opacity: 0.6 }}>
                        Start a conversation in the chat panel
                        <span style={{ color: agentMeta.color }}>→</span>
                    </p>
                </div>
            )}
        </div>
    );
}
