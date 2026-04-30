"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, RefreshCw, Copy, Check } from "lucide-react";
import { useDeveloperStore, AGENTS, AgentName } from "@/lib/developerStore";
import AgentIcon from "./AgentIcon";
import { BRDRecord } from "@/lib/brdStore";

interface Message {
    role: "user" | "agent";
    content: string;
    streaming?: boolean;
}

const ORDER: AgentName[] = ["architecture", "uiux", "codegen", "review", "qa", "deploy"];

interface Props {
    dark: boolean;
    brd: BRDRecord;
}

export default function ChatPanel({ dark, brd }: Props) {
    const store     = useDeveloperStore();
    const agent     = store.activeAgent;
    const brdId     = brd.id;
    const agentMeta = AGENTS.find(a => a.id === agent)!;
    const output    = store.getOutput(brdId, agent);
    const isRunning  = output?.status === "running";
    const isDraft    = output?.status === "draft";
    const isAccepted = output?.status === "accepted";

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput]       = useState("");
    const [copied, setCopied]     = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef  = useRef<HTMLTextAreaElement>(null);

    const bg         = dark ? "#252526" : "#f8f8f8";
    const headerBg   = dark ? "#2c2c2c" : "#efefef";
    const text       = dark ? "#d4d4d4" : "#1e1e1e";
    const muted      = dark ? "#808080" : "#6b7280";
    const border     = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
    const agentBubble = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
    const inputBg    = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const hoverBg    = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
    const promptBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

    // Reset chat on agent/brd change
    useEffect(() => {
        setMessages([]);
        setInput("");
    }, [agent, brdId]);

    // Sync streaming content into last agent message
    useEffect(() => {
        const curVersion = output?.versions[output.versions.length - 1];
        if (!curVersion) return;
        setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "agent") {
                const updated = [...prev];
                updated[updated.length - 1] = { ...last, content: curVersion.content, streaming: isRunning };
                return updated;
            }
            return prev;
        });
    }, [output?.versions, isRunning]);

    // Auto-scroll during streaming
    useEffect(() => {
        if (isRunning) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isRunning]);

    const buildContext = () => {
        const brdContext = Object.entries(brd.sections)
            .map(([k, v]) => v ? `### ${k}\n${v}` : "")
            .filter(Boolean).join("\n\n");
        const priorOutputs = ORDER
            .slice(0, ORDER.indexOf(agent))
            .map(a => {
                const acc = store.getAccepted(brdId, a);
                return acc ? `### ${a.toUpperCase()} OUTPUT\n${acc}` : null;
            })
            .filter(Boolean).join("\n\n");
        return { brdContext, priorOutputs };
    };

    const send = async (userMsg?: string) => {
        const msg = userMsg ?? input.trim();
        if (!msg || isRunning) return;
        setInput("");
        if (inputRef.current) { inputRef.current.style.height = "auto"; }

        setMessages(prev => [...prev, { role: "user", content: msg }]);
        setMessages(prev => [...prev, { role: "agent", content: "", streaming: true }]);

        store.startRun(brdId, agent);
        const { brdContext, priorOutputs } = buildContext();
        const history = messages
            .map(m => `${m.role === "user" ? "Developer" : agentMeta.label}: ${m.content}`)
            .join("\n\n");

        try {
            const res = await fetch(`/api/developer/${agent}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brdContext,
                    priorOutputs,
                    customInstructions: history ? `Previous conversation:\n${history}` : "",
                    feedback: msg,
                }),
            });
            const reader = res.body!.getReader();
            const dec    = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                store.appendContent(brdId, agent, dec.decode(value));
            }
            store.finishRun(brdId, agent);
        } catch {
            store.finishRun(brdId, agent);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "agent", content: "Something went wrong. Please try again.", streaming: false };
                return updated;
            });
        }
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const copy = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    };

    const isEmpty = messages.length === 0;

    const quickPrompts = [
        `Generate ${agentMeta.label.toLowerCase()} for ${brd.projectName}`,
        `Start fresh with the BRD requirements`,
        `What will this agent produce?`,
    ];

    return (
        <div className="w-80 shrink-0 flex flex-col overflow-hidden"
            style={{ background: bg, borderLeft: `1px solid ${border}` }}>

            {/* Header */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-2"
                style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ background: `${agentMeta.color}18`, border: `1px solid ${agentMeta.color}30` }}>
                    <AgentIcon name={agentMeta.iconName} size={11} color={agentMeta.color} />
                </div>
                <span className="text-[12px] font-semibold flex-1 truncate" style={{ color: text }}>{agentMeta.label}</span>
                <span className="text-[10px] font-mono" style={{ color: muted }}>AI Agent</span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {isEmpty ? (
                    <div className="flex flex-col gap-2 pt-1">
                        <p className="text-[11px] leading-relaxed px-0.5 mb-1" style={{ color: muted }}>
                            {agentMeta.desc}
                        </p>
                        {quickPrompts.map(p => (
                            <button key={p} onClick={() => send(p)}
                                className="w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all"
                                style={{ background: promptBg, color: muted, border: `1px solid ${border}` }}
                                onMouseEnter={e => { e.currentTarget.style.color = text; e.currentTarget.style.background = hoverBg; }}
                                onMouseLeave={e => { e.currentTarget.style.color = muted; e.currentTarget.style.background = promptBg; }}>
                                {p}
                            </button>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

                                {msg.role === "agent" && (
                                    <div className="w-6 h-6 rounded shrink-0 flex items-center justify-center mt-0.5"
                                        style={{ background: `${agentMeta.color}18`, border: `1px solid ${agentMeta.color}28` }}>
                                        <AgentIcon name={agentMeta.iconName} size={11} color={agentMeta.color} />
                                    </div>
                                )}

                                <div className={`relative group max-w-[85%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                    <div className="rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap"
                                        style={msg.role === "user"
                                            ? { background: "#00338D", color: "#ffffff", borderRadius: "12px 12px 3px 12px" }
                                            : {
                                                background: agentBubble,
                                                border: `1px solid ${border}`,
                                                color: text,
                                                borderRadius: "3px 12px 12px 12px",
                                                fontFamily: "'ui-monospace','Cascadia Code',monospace",
                                                fontSize: "11px",
                                            }}>
                                        {msg.content || (msg.streaming ? "" : "…")}
                                        {msg.streaming && (
                                            <span className="inline-block w-[2px] h-[12px] bg-blue-400 animate-pulse ml-0.5 align-middle rounded-sm" />
                                        )}
                                    </div>

                                    {/* Hover actions */}
                                    {msg.role === "agent" && !msg.streaming && msg.content && (
                                        <div className="flex items-center gap-2 mt-1 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => copy(msg.content, `m-${i}`)}
                                                className="flex items-center gap-0.5 text-[10px] transition-colors"
                                                style={{ color: muted }}
                                                onMouseEnter={e => e.currentTarget.style.color = text}
                                                onMouseLeave={e => e.currentTarget.style.color = muted}>
                                                {copied === `m-${i}`
                                                    ? <><Check size={9} className="text-emerald-400" /> Copied</>
                                                    : <><Copy size={9} /> Copy</>}
                                            </button>
                                            {i === messages.length - 1 && isDraft && (
                                                <button onClick={() => store.acceptOutput(brdId, agent)}
                                                    className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                                    <CheckCircle2 size={9} /> Accept
                                                </button>
                                            )}
                                            {i === messages.length - 1 && isAccepted && (
                                                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400">
                                                    <CheckCircle2 size={9} /> Accepted
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {msg.role === "user" && (
                                    <div className="w-6 h-6 rounded shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5"
                                        style={{
                                            background: dark ? "rgba(255,255,255,0.10)" : "rgba(0,51,141,0.10)",
                                            color: dark ? "#ffffff" : "#00338D",
                                            border: `1px solid ${border}`,
                                        }}>
                                        You
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="shrink-0 p-3" style={{ borderTop: `1px solid ${border}` }}>
                <div className="rounded-xl px-3 py-2 flex items-end gap-2"
                    style={{ background: inputBg, border: `1px solid ${border}` }}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                        }}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder={`Ask ${agentMeta.label}…`}
                        disabled={isRunning}
                        rows={1}
                        className={`flex-1 bg-transparent text-[12px] focus:outline-none resize-none leading-relaxed disabled:opacity-40 ${dark ? "placeholder:text-white/25" : "placeholder:text-black/25"}`}
                        style={{ color: text, maxHeight: "100px", overflowY: "auto" }}
                    />
                    <button onClick={() => send()} disabled={!input.trim() || isRunning}
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                        style={{ background: input.trim() && !isRunning ? agentMeta.color : border }}>
                        {isRunning
                            ? <RefreshCw size={11} className="text-white animate-spin" />
                            : <Send size={11} className="text-white" />}
                    </button>
                </div>
                <p className="text-center text-[9px] mt-1.5"
                    style={{ color: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }}>
                    GPT-4o · BRD context auto-included
                </p>
            </div>
        </div>
    );
}
