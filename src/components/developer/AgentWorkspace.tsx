"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, RefreshCw, Copy, Check, ArrowDown } from "lucide-react";
import { useDeveloperStore, AGENTS, AgentName } from "@/lib/developerStore";
import AgentIcon from "@/components/developer/AgentIcon";
import { BRDRecord } from "@/lib/brdStore";

interface Message {
    role: "user" | "agent";
    content: string;
    streaming?: boolean;
}

const ORDER: AgentName[] = ["architecture", "uiux", "codegen", "review", "qa", "deploy"];

export default function AgentWorkspace({ brd, dark }: { brd: BRDRecord; dark: boolean }) {
    const store = useDeveloperStore();
    const agent = store.activeAgent;
    const brdId = brd.id;
    const agentMeta = AGENTS.find(a => a.id === agent)!;
    const output = store.getOutput(brdId, agent);
    const isRunning = output?.status === "running";
    const isDraft = output?.status === "draft";
    const isAccepted = output?.status === "accepted";

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [showScroll, setShowScroll] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Theme
    const text        = dark ? "#e8e8e8"                   : "#111111";
    const muted       = dark ? "rgba(255,255,255,0.35)"    : "rgba(0,0,0,0.55)";
    const faint       = dark ? "rgba(255,255,255,0.05)"    : "rgba(0,0,0,0.04)";
    const borderColor = dark ? "rgba(255,255,255,0.09)"    : "rgba(0,0,0,0.10)";
    const bubbleBg    = dark ? "rgba(255,255,255,0.06)"    : "rgba(0,0,0,0.04)";
    const inputBg     = dark ? "rgba(255,255,255,0.05)"    : "rgba(0,0,0,0.04)";
    const codeBg      = dark ? "rgba(0,0,0,0.5)"           : "rgba(0,0,0,0.06)";
    const footerColor = dark ? "rgba(255,255,255,0.2)"     : "rgba(0,0,0,0.25)";

    // Reset chat when agent changes
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

    // Auto-scroll
    useEffect(() => {
        if (isRunning) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isRunning]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };

    const buildContext = () => {
        const brdContext = Object.entries(brd.sections).map(([k, v]) => v ? `### ${k}\n${v}` : "").filter(Boolean).join("\n\n");
        const prior = ORDER.slice(0, ORDER.indexOf(agent)).map(a => {
            const acc = store.getAccepted(brdId, a);
            return acc ? `### ${a.toUpperCase()} OUTPUT\n${acc}` : null;
        }).filter(Boolean).join("\n\n");
        return { brdContext, priorOutputs: prior };
    };

    const send = async (userMsg?: string) => {
        const msg = userMsg ?? input.trim();
        if (!msg || isRunning) return;
        setInput("");

        setMessages(prev => [...prev, { role: "user", content: msg }]);
        setMessages(prev => [...prev, { role: "agent", content: "", streaming: true }]);

        store.startRun(brdId, agent);
        const { brdContext, priorOutputs } = buildContext();

        const history = messages.map(m => `${m.role === "user" ? "Developer" : agentMeta.label}: ${m.content}`).join("\n\n");

        try {
            const res = await fetch(`/api/developer/${agent}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brdContext, priorOutputs, customInstructions: history ? `Previous conversation:\n${history}` : "", feedback: msg }),
            });
            const reader = res.body!.getReader();
            const dec = new TextDecoder();
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
        setCopied(id); setTimeout(() => setCopied(null), 1500);
    };

    const isEmpty = messages.length === 0;

    return (
        <div className="flex flex-col h-full" style={{ fontFamily: "inherit" }}>

            {/* Chat thread */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4">
                {isEmpty ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                            style={{ background: `${agentMeta.color}18`, border: `1px solid ${agentMeta.color}30` }}>
                            <AgentIcon name={agentMeta.iconName} size={22} color={agentMeta.color} />
                        </div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: text }}>{agentMeta.label} Agent</h3>
                        <p className="text-sm mb-6 leading-relaxed" style={{ color: muted }}>{agentMeta.desc}</p>
                        <div className="flex flex-col gap-2 w-full">
                            {[
                                `Generate ${agentMeta.label.toLowerCase()} for ${brd.projectName}`,
                                `Start fresh with the BRD requirements`,
                                `What does this agent do and what will it produce?`,
                            ].map(p => (
                                <button key={p} onClick={() => send(p)}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
                                    style={{ background: faint, border: `1px solid ${borderColor}`, color: muted }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = text; (e.currentTarget as HTMLButtonElement).style.background = bubbleBg; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = muted; (e.currentTarget as HTMLButtonElement).style.background = faint; }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-6 pb-4">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

                                    {msg.role === "agent" && (
                                        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
                                            style={{ background: `${agentMeta.color}18`, border: `1px solid ${agentMeta.color}30` }}>
                                            <AgentIcon name={agentMeta.iconName} size={14} color={agentMeta.color} />
                                        </div>
                                    )}

                                    <div className={`relative group max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                                        <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                                            style={msg.role === "user"
                                                ? { background: "#00338D", color: "#fff", borderRadius: "18px 18px 4px 18px" }
                                                : { background: bubbleBg, border: `1px solid ${borderColor}`, color: text, borderRadius: "4px 18px 18px 18px", fontFamily: "ui-monospace, monospace", fontSize: "12.5px" }}>
                                            {msg.content}
                                            {msg.streaming && <span className="inline-block w-2 h-3.5 bg-blue-400 animate-pulse ml-1 align-middle rounded-[2px]" />}
                                        </div>

                                        {msg.role === "agent" && !msg.streaming && msg.content && (
                                            <div className="flex items-center gap-2 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => copy(msg.content, `msg-${i}`)}
                                                    className="flex items-center gap-1 text-[11px] transition-colors"
                                                    style={{ color: muted }}
                                                    onMouseEnter={e => (e.currentTarget.style.color = text)}
                                                    onMouseLeave={e => (e.currentTarget.style.color = muted)}>
                                                    {copied === `msg-${i}` ? <><Check size={10} className="text-emerald-500" /> Copied</> : <><Copy size={10} /> Copy</>}
                                                </button>
                                                {i === messages.length - 1 && isDraft && (
                                                    <button onClick={() => store.acceptOutput(brdId, agent)}
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                                                        <CheckCircle2 size={10} /> Accept output →
                                                    </button>
                                                )}
                                                {i === messages.length - 1 && isAccepted && (
                                                    <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                                                        <CheckCircle2 size={10} /> Accepted
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                                            style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,51,141,0.1)", color: dark ? "#fff" : "#00338D", border: `1px solid ${borderColor}` }}>
                                            Dev
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={bottomRef} />
                    </div>
                )}

                {showScroll && (
                    <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="fixed bottom-24 right-8 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-all z-10"
                        style={{ background: bubbleBg, border: `1px solid ${borderColor}` }}>
                        <ArrowDown size={13} style={{ color: muted }} />
                    </button>
                )}
            </div>

            {/* Input bar */}
            <div className="shrink-0 px-4 pb-4">
                <div className="max-w-3xl mx-auto">
                    <div className="relative flex items-end gap-2 rounded-2xl px-4 py-3"
                        style={{ background: inputBg, border: `1px solid ${borderColor}` }}>
                        <textarea ref={inputRef} value={input}
                            onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                            placeholder={`Message ${agentMeta.label} agent… (Enter to send, Shift+Enter for newline)`}
                            disabled={isRunning}
                            rows={1}
                            className={`flex-1 bg-transparent text-sm focus:outline-none resize-none leading-relaxed disabled:opacity-40 ${dark ? "placeholder:text-white/30" : "placeholder:text-black/30"}`}
                            style={{ maxHeight: "160px", overflowY: "auto", color: text, caretColor: text }}
                        />
                        <button onClick={() => send()} disabled={!input.trim() || isRunning}
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                            style={{ background: input.trim() && !isRunning ? agentMeta.color : borderColor }}>
                            {isRunning
                                ? <RefreshCw size={13} className="text-white animate-spin" />
                                : <Send size={13} className="text-white" />}
                        </button>
                    </div>
                    <p className="text-center text-[10px] mt-2" style={{ color: footerColor }}>
                        {agentMeta.label} agent · BRD context + prior outputs auto-included
                    </p>
                </div>
            </div>
        </div>
    );
}
