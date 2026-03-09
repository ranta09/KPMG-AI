"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { BRD_AI_RESPONSES } from "@/lib/brdStore";

const PROMPTS = [
    { id: "improve-wording", label: "Improve Wording", icon: "✍️" },
    { id: "simplify-terms", label: "Simplify Technical Terms", icon: "🔍" },
    { id: "check-completeness", label: "Check Completeness", icon: "🔎" },
    { id: "suggest-kpis", label: "Suggest KPIs", icon: "📊" },
    { id: "identify-risks", label: "Identify Missing Risks", icon: "⚠️" },
];

export default function BRDAIPanel() {
    const [isOpen, setIsOpen] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [outputChunks, setOutputChunks] = useState<string[]>([]);
    const outputRef = useRef<HTMLDivElement>(null);

    const handlePrompt = async (promptId: string) => {
        if (isStreaming) return;
        setActivePrompt(promptId);
        setIsStreaming(true);
        setOutputChunks([]);

        const chunks = BRD_AI_RESPONSES[promptId] || ["✅ Analysis complete."];
        for (const chunk of chunks) {
            await new Promise(res => setTimeout(res, 100 + Math.random() * 180));
            setOutputChunks(prev => [...prev, chunk]);
        }
        setIsStreaming(false);
    };

    useEffect(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [outputChunks]);

    return (
        <div className="w-72 flex-shrink-0 flex flex-col gap-0">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-[#00338D] text-white rounded-t-2xl cursor-pointer interactive"
                onClick={() => setIsOpen(v => !v)}
            >
                <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <span className="font-bold text-sm">AI Assistant</span>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white border border-t-0 border-slate-200 rounded-b-2xl flex flex-col"
                    >
                        {/* Quick Prompts */}
                        <div className="p-4 border-b border-slate-100">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</p>
                            <div className="space-y-2">
                                {PROMPTS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePrompt(p.id)}
                                        disabled={isStreaming}
                                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all interactive ${activePrompt === p.id
                                            ? "bg-[#00338D] text-white shadow-sm"
                                            : "bg-slate-50 text-slate-700 hover:bg-[#00338D]/8 hover:text-[#00338D] border border-slate-200"
                                            } ${isStreaming ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                        <span className="text-base">{p.icon}</span>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Output Area */}
                        {(outputChunks.length > 0 || isStreaming) && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Output</p>
                                    {!isStreaming && (
                                        <button
                                            onClick={() => { setOutputChunks([]); setActivePrompt(null); }}
                                            className="p-1 text-slate-400 hover:text-[#00338D] rounded interactive"
                                        >
                                            <RefreshCw size={12} />
                                        </button>
                                    )}
                                </div>
                                <div
                                    ref={outputRef}
                                    className="mx-4 mb-4 bg-slate-900 rounded-xl p-3 text-[11px] font-mono text-slate-200 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed"
                                >
                                    {outputChunks.join("")}
                                    {isStreaming && <span className="inline-block w-1.5 h-3.5 bg-slate-300 animate-pulse ml-0.5 align-middle" />}
                                </div>
                            </div>
                        )}

                        {outputChunks.length === 0 && !isStreaming && (
                            <div className="p-4 text-center">
                                <p className="text-xs text-slate-400">Select a quick action above to get AI assistance on your BRD.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
