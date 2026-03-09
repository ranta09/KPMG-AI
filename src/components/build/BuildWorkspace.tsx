"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download, Send, RotateCcw, CheckCircle, FileText,
    Code2, TestTube, Server, Boxes, Copy, Check
} from "lucide-react";
import { BuildRecord } from "@/lib/buildStore";

interface BuildWorkspaceProps {
    build: BuildRecord;
    onRebuild: () => void;
    onStatusChange: (status: BuildRecord["status"]) => void;
}

type Tab = "architecture" | "code" | "tests" | "api" | "deployment";

const STATUS_CONFIG = {
    "Draft Build": { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
    "Under Technical Review": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "Approved for Deployment": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "Deployed": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    "Archived": { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200" },
} as const;

function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative">
            <button onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-semibold rounded-lg interactive transition-colors">
                {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
            </button>
            <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {code}
            </pre>
        </div>
    );
}

export default function BuildWorkspace({ build, onRebuild, onStatusChange }: BuildWorkspaceProps) {
    const [tab, setTab] = useState<Tab>("architecture");
    const sc = STATUS_CONFIG[build.status];

    const tabs = [
        { id: "architecture" as Tab, label: "Architecture", Icon: Server },
        { id: "code" as Tab, label: "Generated Code", Icon: Code2 },
        { id: "tests" as Tab, label: "Test Plan", Icon: TestTube },
        { id: "api" as Tab, label: "API Structure", Icon: Boxes },
        { id: "deployment" as Tab, label: "Deployment", Icon: FileText },
    ];

    return (
        <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Build Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-xs text-[#00338D] font-bold">{build.id}</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono text-xs text-slate-400">{build.version}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00338D]/10 text-[#00338D] border border-[#00338D]/20 rounded-md">{build.buildType}</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">{build.customization.appName || build.brdTitle}</h2>
                        <p className="text-sm text-slate-500 mt-0.5">From: {build.brdTitle} · {build.brdId}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <motion.span key={build.status} initial={{ scale: 0.85 }} animate={{ scale: 1 }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                            {build.status}
                        </motion.span>
                        {build.status === "Under Technical Review" && (
                            <button onClick={() => onStatusChange("Approved for Deployment")}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl interactive hover:bg-emerald-700 transition-colors">
                                <CheckCircle size={13} /> Approve for Deploy
                            </button>
                        )}
                        <button onClick={() => onStatusChange("Under Technical Review")}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-blue-200 text-blue-700 rounded-xl interactive hover:bg-blue-50 transition-colors">
                            <Send size={13} /> Send to Developer
                        </button>
                        <button onClick={onRebuild}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-xl interactive hover:bg-slate-50 transition-colors">
                            <RotateCcw size={13} /> Rebuild
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-xl interactive hover:bg-slate-50 transition-colors">
                            <Download size={13} /> Export Bundle
                        </button>
                    </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
                    {build.artifact.techStack.slice(0, 6).map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-200">{t}</span>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-slate-200 rounded-t-xl">
                <div className="flex border-b border-slate-200 px-4">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-all interactive ${tab === t.id ? "border-[#00338D] text-[#00338D]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                            <t.Icon size={13} />{t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                    {tab === "architecture" && (
                        <motion.div key="arch" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    🏗️ Technical Architecture — {build.buildType}
                                </h3>
                                <pre className="whitespace-pre-wrap text-sm text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100 leading-relaxed font-sans">
                                    {build.artifact.architecture}
                                </pre>
                            </div>
                            {build.artifact.botLogic && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3">🤖 Bot Flow Diagram</h3>
                                    <div className="flex items-center gap-2 flex-wrap p-5 bg-slate-50 rounded-xl border border-slate-100">
                                        {build.artifact.botLogic.split("→").map((step, i, arr) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="px-3 py-1.5 bg-[#00338D] text-white text-xs font-semibold rounded-lg">{step.trim()}</span>
                                                {i < arr.length - 1 && <span className="text-slate-400 font-bold">→</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {tab === "code" && (
                        <motion.div key="code" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                💻 Generated Code — {build.buildType}
                                <span className="text-[10px] font-normal text-slate-400">(Read-only — download to modify)</span>
                            </h3>
                            <CodeBlock code={build.artifact.generatedCode} />
                        </motion.div>
                    )}

                    {tab === "tests" && (
                        <motion.div key="tests" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">🧪 Generated Test Plan</h3>
                            <pre className="whitespace-pre-wrap text-sm text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100 leading-relaxed font-sans">
                                {build.artifact.testPlan}
                            </pre>
                        </motion.div>
                    )}

                    {tab === "api" && (
                        <motion.div key="api" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">🔗 API / Integration Structure</h3>
                            <CodeBlock code={build.artifact.apiStructure} />
                        </motion.div>
                    )}

                    {tab === "deployment" && (
                        <motion.div key="deploy" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">🚀 Deployment Recommendation</h3>
                            <pre className="whitespace-pre-wrap text-sm text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100 leading-relaxed font-sans">
                                {build.artifact.deploymentRecommendation}
                            </pre>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
