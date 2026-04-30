"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, Bot, Sparkles, X, Upload, FileText, CheckCircle,
    AlertCircle, Loader2, RefreshCw, ChevronRight, Zap, ArrowRight
} from "lucide-react";
import { parseWordTemplate } from "@/lib/parseWordTemplate";
import { BRDSections } from "@/lib/brdStore";

interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
}

interface CapturedContext {
    title?: string;
    projectCode?: string;
    projectName?: string;
    solutionArea?: string;
    technology?: string;
    version?: string;
    preparedBy?: string;
    reviewers?: string;
    problem?: string;
    stakeholders?: string;
    requirements?: string;
    timeline?: string;
    readyToGenerate?: boolean;
}

interface BRDChatAssistantProps {
    onComplete: (data: any, refs: string[]) => void;
    onSwitchToForm: () => void;
    onClose: () => void;
    projectList: { code: string; name: string }[];
    buildTypes: Record<string, string[]>;
    existingBRDs: any[];
}

// Phase 1 — template decision. Phase 2 — requirements interview.
type ChatPhase = "template" | "gathering" | "ready";

export function BRDChatAssistant({ onComplete, onSwitchToForm, onClose, projectList, buildTypes, existingBRDs }: BRDChatAssistantProps) {
    const [phase, setPhase] = useState<ChatPhase>("gathering");
    const [messages, setMessages] = useState<Message[]>([{ id: "init", role: "assistant", content: "Hello! Let's get started on gathering the information for the BRD. What would you like to title this project?" }]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [context, setContext] = useState<CapturedContext>({});
    const [isGenerating, setIsGenerating] = useState(false);

    // Template state
    const [templateMode, setTemplateMode] = useState<"custom" | "default" | null>(null);
    const [templateSections, setTemplateSections] = useState<Partial<BRDSections> | null>(null);
    const [rawMarkdown, setRawMarkdown] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [templateSectionKeys, setTemplateSectionKeys] = useState<string[]>([]);

    // Placeholder modal
    const [showPlaceholderModal, setShowPlaceholderModal] = useState(false);
    const [placeholders, setPlaceholders] = useState<string[]>([]);
    const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isStreaming, phase]);

    const contextFields = [
        { key: "title" as const, label: "Title", icon: FileText },
        { key: "problem" as const, label: "Problem", icon: AlertCircle },
        { key: "stakeholders" as const, label: "Stakeholders", icon: CheckCircle },
        { key: "requirements" as const, label: "Requirements", icon: Zap },
        { key: "technology" as const, label: "Technology", icon: Sparkles },
        { key: "timeline" as const, label: "Timeline", icon: ChevronRight },
    ];

    const filledCount = contextFields.filter(f => !!context[f.key]).length;
    const readinessPercent = Math.round((filledCount / contextFields.length) * 100);

    const parseContextFromResponse = (text: string): CapturedContext | null => {
        const match = text.match(/<context>([\s\S]*?)<\/context>/);
        if (!match) return null;
        try { return JSON.parse(match[1]); } catch { return null; }
    };

    const stripContextTag = (text: string) => text.replace(/<context>[\s\S]*?<\/context>/, "").trim();

    // ── Template upload ──────────────────────────────────────────────────────────
    const handleFileUpload = async (file: File) => {
        setUploadLoading(true);
        try {
            const { sections, rawMarkdown: raw, fileName, sectionsFound, placeholders: ph } = await parseWordTemplate(file);
            setTemplateSections(sections);
            setRawMarkdown(raw);
            setUploadedFile(fileName);
            setTemplateSectionKeys(Object.keys(sections));
            setPlaceholders(ph);
            setPlaceholderValues(Object.fromEntries(ph.map(p => [p, ""])));
            if (ph.length > 0) setShowPlaceholderModal(true);
            setTemplateMode("custom");
        } catch {
            setUploadedFile(file.name);
            setTemplateMode("custom");
        } finally {
            setUploadLoading(false);
        }
    };

    const confirmTemplate = (mode: "custom" | "default") => {
        setTemplateMode(mode);
        setPhase("gathering");

        if (mode === "custom") {
            setMessages(prev => [...prev, { id: Math.random().toString(36).slice(2), role: "assistant", content: `Template received! I'll build the BRD using **only the sections in your template**.` }]);
        }
    };

    // ── AI chat ──────────────────────────────────────────────────────────────────
    const sendMessage = async (userText?: string) => {
        const text = (userText ?? input).trim();
        if (!text || isStreaming) return;

        const userMsg: Message = { id: Math.random().toString(36).slice(2), role: "user", content: text };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsStreaming(true);

        const assistantId = Math.random().toString(36).slice(2);
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

        const systemPrompt = templateMode === "custom" && templateSectionKeys.length > 0
            ? `You are a BRD requirements analyst at KPMG. The user has uploaded a template with these sections: ${templateSectionKeys.join(", ")}. Your job is to gather information needed to fill ONLY these sections — nothing else. Ask ONE focused question at a time. When you have enough info to fill all template sections, set readyToGenerate: true in the context block.

After each response, append:
<context>
{"title":"...","problem":"...","stakeholders":"...","requirements":"...","technology":"...","timeline":"...","readyToGenerate":false}
</context>
Keep responses to 2-3 sentences. Be professional and warm.`
            : `You are a BRD requirements analyst at KPMG. Gather information through a conversational interview. Ask ONE question at a time in this order: 1) Project title, 2) Project Code (e.g. PRJ-001), 3) Project Name, 4) Solution Area (e.g. SAP S/4HANA, Cloud, Web), 5) Primary Technology, 6) Version (default v1.0), 7) Prepared By (name & role), 8) Reviewers (ask for Name, Role for each reviewer — user can add multiple), 9) Business problem, 10) Stakeholders, 11) Functional requirements, 12) Timeline. When you have all key fields set readyToGenerate: true.

After each response, append:
<context>
{"title":"...","projectCode":"...","projectName":"...","solutionArea":"...","technology":"...","version":"...","preparedBy":"...","reviewers":"Name|Role, Name|Role","problem":"...","stakeholders":"...","requirements":"...","timeline":"...","readyToGenerate":false}
</context>
Keep responses to 2-3 sentences. Be professional and warm.`;

        try {
            abortRef.current = new AbortController();
            const res = await fetch("/api/brd/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                    systemPrompt,
                }),
                signal: abortRef.current.signal,
            });

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: true });
                setMessages(prev => prev.map(m => m.id === assistantId
                    ? { ...m, content: stripContextTag(fullText) }
                    : m));
            }

            const newCtx = parseContextFromResponse(fullText);
            if (newCtx) {
                setContext(prev => ({ ...prev, ...newCtx }));
                if (newCtx.readyToGenerate) setPhase("ready");
            }
        } catch (err: any) {
            if (err.name !== "AbortError") {
                setMessages(prev => prev.map(m => m.id === assistantId
                    ? { ...m, content: "Sorry, I encountered an error. Please try again." }
                    : m));
            }
        } finally {
            setIsStreaming(false);
        }
    };

    // ── Generate BRD ─────────────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (filledCount < 2) return;
        setIsGenerating(true);

        try {
            const res = await fetch("/api/brd/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
                    templateSections: templateMode === "custom" ? templateSections : null,
                    rawMarkdown: templateMode === "custom" ? rawMarkdown : null,
                    templateSectionKeys: templateMode === "custom" ? templateSectionKeys : null,
                    useTemplateOnly: templateMode === "custom",
                }),
            });

            const { sections } = await res.json();

            onComplete({
                title: context.title || "Untitled BRD",
                projectCode: context.projectCode || projectList[0]?.code || "PRJ-001",
                projectName: context.projectName || context.title || "AI Generated Project",
                version: context.version || "v1.0",
                mainCategory: context.solutionArea || context.technology?.split(" ")[0] || "General",
                subCategory: context.technology || "Custom",
                requirement: context.problem || context.requirements || "",
                preparedBy: context.preparedBy || "",
                reviewers: context.reviewers || "",
                templateSections: templateMode === "custom" ? templateSections : null,
                rawMarkdown: templateMode === "custom" ? rawMarkdown : null,
                aiGeneratedSections: sections,
                useTemplateOnly: templateMode === "custom",
            }, []);
        } catch {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        abortRef.current?.abort();
        setPhase("template");
        setMessages([{ id: "init", role: "assistant", content: "Hello! Let's get started on gathering the information for the BRD. What would you like to title this project?" }]);
        setContext({});
        setTemplateMode(null);
        setTemplateSections(null);
        setRawMarkdown(null);
        setUploadedFile(null);
        setTemplateSectionKeys([]);
        setInput("");
    };

    const renderMessage = (content: string) =>
        content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
                ? <strong key={i} className="font-bold text-[#00338D]">{part.slice(2, -2)}</strong>
                : <span key={i}>{part}</span>
        );

    const phaseLabel = phase === "template" ? "Awaiting Template" : phase === "gathering" ? "Gathering Requirements" : "Ready to Generate";
    const phaseDot = phase === "template" ? "bg-amber-500" : phase === "gathering" ? "bg-blue-500" : "bg-emerald-500";

    return (
        <>
            <div className="flex h-full overflow-hidden">

                {/* ── Main Panel ─────────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Header */}
                    <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#00338D] rounded-lg flex items-center justify-center">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">BRD Assistant</p>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${phaseDot} ${isStreaming ? "animate-pulse" : ""}`} />
                                    <p className="text-[10px] text-slate-500">{isStreaming ? "Thinking..." : phaseLabel}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Reset">
                                <RefreshCw size={14} />
                            </button>
                            <button onClick={onSwitchToForm} className="px-3 py-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
                                Manual Form
                            </button>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/30">

                        <AnimatePresence mode="wait">

                            {/* ── Phase 2 & 3: Chat ──────────────────────────── */}
                            {(phase === "gathering" || phase === "ready") && (
                                <motion.div key="chat-phase"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="p-4 space-y-4">

                                    {/* Template mode badge */}
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${templateMode === "custom"
                                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                        : "bg-[#00338D]/5 border border-[#00338D]/10 text-[#00338D]"}`}>
                                        <FileText size={12} />
                                        {templateMode === "custom"
                                            ? `Custom template: ${uploadedFile} (${templateSectionKeys.length} sections)`
                                            : ""}
                                    </div>

                                    {/* Messages */}
                                    <AnimatePresence initial={false}>
                                        {messages.map(msg => (
                                            <motion.div key={msg.id}
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                                                <div className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                                    {msg.role === "assistant" && (
                                                        <div className="w-7 h-7 rounded-lg bg-[#00338D] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Bot size={13} className="text-white" />
                                                        </div>
                                                    )}
                                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant"
                                                        ? "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
                                                        : "bg-[#00338D] text-white rounded-tr-none shadow-md shadow-[#00338D]/20"}`}>
                                                        {msg.role === "assistant" ? renderMessage(msg.content) : msg.content}
                                                        {msg.role === "assistant" && msg.content === "" && isStreaming && (
                                                            <span className="inline-flex gap-0.5 ml-1">
                                                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Ready CTA */}
                                    {phase === "ready" && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start">
                                            <div className="flex gap-2.5 max-w-[85%]">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Sparkles size={13} className="text-white" />
                                                </div>
                                                <div className="bg-white border border-emerald-200 rounded-2xl rounded-tl-none p-4 shadow-sm space-y-3">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        I have enough info to generate the BRD
                                                        {templateMode === "custom" ? ` using your template (${templateSectionKeys.length} sections only)` : " using the default KPMG template"}.
                                                    </p>
                                                    <button onClick={handleGenerate} disabled={isGenerating}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00338D] to-[#005CB9] text-white text-sm font-bold rounded-xl hover:from-[#00266e] hover:to-[#00338D] transition-all shadow-lg shadow-[#00338D]/25 disabled:opacity-60">
                                                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                        {isGenerating ? "Generating BRD..." : "Generate BRD"}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={bottomRef} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input bar — only visible in chat phase */}
                    {phase !== "template" && (
                        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    placeholder={isStreaming ? "AI is thinking..." : "Type your response... (Enter to send)"}
                                    disabled={isStreaming || isGenerating}
                                    rows={1}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-transparent outline-none transition-all resize-none max-h-32"
                                    style={{ minHeight: "44px" }}
                                />
                                <button onClick={() => sendMessage()} disabled={!input.trim() || isStreaming || isGenerating}
                                    className="p-2.5 bg-[#00338D] text-white rounded-xl hover:bg-[#001f5c] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md flex-shrink-0">
                                    <Send size={16} />
                                </button>
                            </div>
                            {(phase === "gathering" || phase === "ready") && filledCount >= 2 && (
                                <div className="flex justify-end mt-2">
                                    <button onClick={handleGenerate} disabled={isGenerating}
                                        className="text-[11px] font-bold text-[#00338D] hover:underline flex items-center gap-1 disabled:opacity-50">
                                        {isGenerating ? <Loader2 size={10} className="animate-spin" /> : null}
                                        Generate now →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Context Sidebar ─────────────────────────────────────────── */}
                <div className="w-52 border-l border-slate-200 bg-white flex flex-col flex-shrink-0">
                    <div className="px-4 py-3.5 border-b border-slate-200">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Context Captured</p>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#00338D" strokeWidth="4"
                                        strokeDasharray={`${2 * Math.PI * 20}`}
                                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - readinessPercent / 100)}`}
                                        className="transition-all duration-500" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#00338D]">{readinessPercent}%</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-700">{filledCount}/{contextFields.length} fields</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{phase === "ready" ? "Ready!" : "Gathering..."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Template info */}
                    <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Template</p>
                        {templateMode === null ? (
                            <p className="text-[10px] text-slate-400 italic">Not selected yet</p>
                        ) : templateMode === "custom" ? (
                            <div>
                                <p className="text-[10px] font-bold text-emerald-700 truncate">{uploadedFile}</p>
                                <p className="text-[9px] text-emerald-600">{templateSectionKeys.length} sections (strict)</p>
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold text-[#00338D]">Default KPMG (19 sections)</p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                        {contextFields.map(({ key, label, icon: Icon }) => {
                            const value = context[key];
                            return (
                                <div key={key} className={`rounded-xl p-2.5 border transition-all ${value ? "bg-[#00338D]/3 border-[#00338D]/10" : "bg-slate-50 border-slate-100"}`}>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Icon size={10} className={value ? "text-[#00338D]" : "text-slate-300"} />
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${value ? "text-[#00338D]" : "text-slate-400"}`}>{label}</span>
                                        {value && <CheckCircle size={9} className="text-emerald-500 ml-auto" />}
                                    </div>
                                    <p className="text-[10px] text-slate-600 line-clamp-2">{value || <span className="text-slate-300 italic">Pending</span>}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-3 border-t border-slate-100">
                        <button onClick={handleGenerate} disabled={isGenerating || filledCount < 2 || phase === "template"}
                            className="w-full py-2.5 bg-[#00338D] text-white text-[11px] font-bold rounded-xl hover:bg-[#001f5c] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-[#00338D]/10">
                            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {isGenerating ? "Generating..." : "Generate BRD"}
                        </button>
                        {filledCount < 2 && phase !== "template" && (
                            <p className="text-[9px] text-slate-400 text-center mt-1.5">Answer {2 - filledCount} more question{2 - filledCount !== 1 ? "s" : ""}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Placeholder Modal */}
            {showPlaceholderModal && createPortal(
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#00338D]/5 to-transparent">
                            <p className="text-sm font-bold text-slate-800">Template Placeholders Detected</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Fill in placeholder values from your template</p>
                        </div>
                        <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
                            {placeholders.map(p => (
                                <div key={p}>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">{p}</label>
                                    <input type="text" value={placeholderValues[p] ?? ""}
                                        onChange={e => setPlaceholderValues(prev => ({ ...prev, [p]: e.target.value }))}
                                        placeholder={`Enter ${p}...`}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00338D]/30" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
                            <button onClick={() => setShowPlaceholderModal(false)}
                                className="flex-1 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">Skip</button>
                            <button onClick={() => setShowPlaceholderModal(false)}
                                className="flex-1 py-2 text-sm font-bold text-white bg-[#00338D] rounded-xl hover:bg-[#00266e]">Apply</button>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}
