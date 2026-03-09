"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { BUILD_AI_RESPONSES } from "@/lib/buildStore";

const PROMPTS = [
    { id: "explain-architecture", label: "Explain Architecture", icon: "🏗️" },
    { id: "suggest-improvements", label: "Suggest Improvements", icon: "💡" },
    { id: "estimate-effort", label: "Estimate Effort", icon: "⏱️" },
    { id: "predict-risks", label: "Predict Risks", icon: "⚠️" },
    { id: "cost-estimate", label: "Cost & Time Estimate", icon: "💰" },
];

export default function BuildAIPanel() {
    const [isOpen, setIsOpen] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [outputChunks, setOutputChunks] = useState<string[]>([]);
    const outputRef = useRef<HTMLDivElement>(null);

    const handlePrompt = async (id: string) => {
        if (isStreaming) return;
        setActivePrompt(id);
        setIsStreaming(true);
        setOutputChunks([]);
        const chunks = BUILD_AI_RESPONSES[id] || ["✅ Analysis complete."];
        for (const chunk of chunks) {
            await new Promise(r => setTimeout(r, 90 + Math.random() * 160));
            setOutputChunks(prev => [...prev, chunk]);
            if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
        setIsStreaming(false);
    };

    return (
        <div className="w-72 flex-shrink-0 flex flex-col">
            <div onClick={() => setIsOpen(v => !v)}
                className="flex items-center justify-between p-4 bg-[#00338D] text-white rounded-t-2xl cursor-pointer interactive">
                <div className="flex items-center gap-2">
                    <Sparkles size={15} />
                    <span className="font-bold text-sm">Build AI Assistant</span>
                </div>
                {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white border border-t-0 border-slate-200 rounded-b-2xl flex flex-col">
                        <div className="p-4 border-b border-slate-100">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</p>
                            <div className="space-y-2">
                                {PROMPTS.map(p => (
                                    <button key={p.id} onClick={() => handlePrompt(p.id)} disabled={isStreaming}
                                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all interactive ${activePrompt === p.id ? "bg-[#00338D] text-white" : "bg-slate-50 text-slate-700 hover:bg-[#00338D]/8 hover:text-[#00338D] border border-slate-200"} ${isStreaming ? "opacity-60 cursor-not-allowed" : ""}`}>
                                        <span className="text-base">{p.icon}</span>{p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {(outputChunks.length > 0 || isStreaming) && (
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Output</p>
                                    {!isStreaming && <button onClick={() => { setOutputChunks([]); setActivePrompt(null); }} className="p-1 text-slate-400 hover:text-[#00338D] rounded interactive"><RefreshCw size={12} /></button>}
                                </div>
                                <div ref={outputRef} className="mx-4 mb-4 bg-slate-900 rounded-xl p-3 text-[11px] font-mono text-slate-200 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                    {outputChunks.join("")}
                                    {isStreaming && <span className="inline-block w-1.5 h-3.5 bg-slate-300 animate-pulse ml-0.5 align-middle" />}
                                </div>
                            </div>
                        )}
                        {outputChunks.length === 0 && !isStreaming && (
                            <p className="p-4 text-xs text-slate-400 text-center">Select an action above for AI analysis of your build.</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
