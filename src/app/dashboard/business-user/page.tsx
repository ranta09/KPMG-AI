"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, RotateCcw, Plus, ArrowRight, Sparkles, UserCheck, Code, Play } from "lucide-react";
import Link from "next/link";
import { useBRDStore } from "@/lib/brdStore";

export default function BusinessUserDashboard() {
    const { brds } = useBRDStore();
    const [demoActive, setDemoActive] = useState(false);
    const [demoStep, setDemoStep] = useState(0);

    const approved = brds.filter(b => b.status === "Approved").length;
    const revisionRequired = brds.filter(b => b.status === "Revision Required").length;

    const statusConfig = {
        "Draft": { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", Icon: FileText },
        "Revision Required": { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", Icon: RotateCcw },
        "Approved": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", Icon: CheckCircle },
        "Archived": { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", Icon: FileText },
    } as Record<string, any>;

    const summaryCards = [
        { label: "Total BRDs", value: brds.length, icon: FileText, color: "text-[#00338D]", bg: "bg-[#00338D]/8" },
        { label: "Approved", value: approved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Revision", value: revisionRequired, icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
    ];

    const WORKFLOW_STAGES = ["Generated", "Review", "Approved", "In Development"];

    const getPipelineStage = (status: string) => {
        if (status === "Draft" || status === "Revision Required") return 0;
        if (status === "Approved") return 2;
        return 0;
    };

    const DEMO_STEPS = [
        { id: 1, title: "Create BRD", desc: "Define title & Build Type", icon: Plus },
        { id: 2, title: "AI Generation", desc: "Complete BRD auto-generated", icon: Sparkles },
        { id: 3, title: "Structured Review", desc: "Stakeholder review & comments", icon: FileText },
        { id: 4, title: "Approval", desc: "Sign-off for development", icon: UserCheck },
        { id: 5, title: "Orchestration", desc: "Agents build the solution", icon: Code },
    ];

    const startDemo = () => {
        if (demoActive) return;
        setDemoActive(true);
        setDemoStep(1);
        let currentStep = 1;

        const interval = setInterval(() => {
            currentStep++;
            if (currentStep > 5) {
                clearInterval(interval);
                setTimeout(() => {
                    setDemoActive(false);
                    setDemoStep(0);
                }, 3000);
            } else {
                setDemoStep(currentStep);
            }
        }, 1500);
    };

    return (
        <div className="py-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-900 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-52 opacity-30 pointer-events-none">
                    <div className="grid grid-cols-6 gap-4 h-full p-5">
                        {Array.from({ length: 36 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]/40" />)}
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-[#00338D] font-bold text-sm mb-1 uppercase tracking-wider">Business User Portal</p>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to your Workspace</h1>
                    <p className="text-slate-600 text-sm mt-1">Manage your business requirements and track BRD progress</p>
                    <div className="flex gap-4 mt-6">
                        <Link href="/dashboard/business-user/brd?new=true"
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#00338D] text-white font-bold text-sm rounded-xl hover:bg-[#001f5c] transition-all interactive shadow-md hover:shadow-lg">
                            <Plus size={15} /> Create New BRD
                        </Link>
                        <Link href="/dashboard/business-user/brd"
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:border-[#00338D] transition-all interactive shadow-sm">
                            <FileText size={15} /> View All BRDs
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div key={card.label}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#00338D]/30 transition-all group">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <Icon size={18} className={card.color} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{card.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Two Column Layout: Workflow Guide & BRD List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* How It Works Guide */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles size={18} className="text-[#00A3E0]" /> How It Works
                        </h2>
                        <button
                            onClick={startDemo}
                            disabled={demoActive}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all interactive border ${demoActive ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white text-[#00338D] border-[#00338D]/30 shadow-sm hover:border-[#00338D] hover:bg-[#00338D]/5'}`}
                        >
                            <Play size={12} fill={demoActive ? "#cbd5e1" : "currentColor"} /> Demo
                        </button>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-center space-y-6 relative">
                        {/* Connecting Line for timeline */}
                        <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-slate-100 -z-10" />

                        {DEMO_STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            const isPast = demoActive && demoStep > step.id;
                            const isCurrent = demoActive && demoStep === step.id;

                            return (
                                <div key={step.id} className="flex gap-4 relative group">
                                    <div className="relative">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isCurrent ? 'bg-[#00338D] border-[#00338D] shadow-[0_0_15px_rgba(0,51,141,0.4)] scale-110' : isPast ? 'bg-[#00338D] border-[#00338D]' : 'bg-white border-slate-200 group-hover:border-[#00338D]/40'}`}>
                                            {isPast ? (
                                                <CheckCircle size={14} className="text-white" />
                                            ) : (
                                                <Icon size={14} className={isCurrent ? 'text-white' : 'text-slate-400 group-hover:text-[#00338D]/60'} />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`flex-1 transition-all duration-300 ${isCurrent ? 'scale-105 origin-left' : ''}`}>
                                        <h3 className={`text-sm font-bold transition-colors ${isCurrent ? 'text-[#00338D]' : 'text-slate-800'}`}>
                                            Step {step.id}: {step.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Animated Video / Demo Pane */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-[#0a0f1c] rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col relative h-[500px]">

                    {/* Fake Browser Window Header */}
                    <div className="h-10 bg-[#1e293b] border-b border-slate-800 flex items-center px-4 gap-2 shrink-0">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="mx-auto bg-[#0f172a] text-slate-400 text-[10px] px-3 py-1 rounded-md font-mono flex items-center gap-2">
                            <Sparkles size={10} className="text-[#00A3E0]" /> kpmg-ai-platform.local
                        </div>
                    </div>

                    {/* Animation Player Content */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">

                        {!demoActive && demoStep === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#00A3E0]/10 flex items-center justify-center mb-4">
                                    <Play size={24} className="text-[#00A3E0] ml-1" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Interactive Workflow Demo</h3>
                                <p className="text-slate-400 text-sm mt-2 max-w-sm">Click the Demo button on the left to watch how a BRD travels from creation to development.</p>
                            </motion.div>
                        )}

                        {/* Step 1: Create BRD */}
                        {demoStep === 1 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-md bg-white rounded-xl p-6 shadow-2xl relative">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Sparkles size={16} className="text-[#00338D]" /> AI BRD Generator
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                                        <div className="h-10 w-full bg-slate-50 border border-slate-200 rounded px-3 flex items-center relative overflow-hidden">
                                            <motion.span
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 1, ease: "linear" }}
                                                className="text-sm font-mono text-slate-700 whitespace-nowrap overflow-hidden block border-r-2 border-[#00338D]">
                                                Implement global SAP S/4HANA rollout...
                                            </motion.span>
                                        </div>
                                    </div>
                                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 1 }} className="h-10 w-full bg-[#00338D] rounded flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                        Generate Requirements
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: AI Structuring */}
                        {demoStep === 2 && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00338D] to-[#00A3E0] animate-pulse" />
                                <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                                    <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                                    <Sparkles size={20} className="text-[#00A3E0]" />
                                </div>
                                <div className="space-y-4 flex-1">
                                    {[1, 2, 3].map((i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded text-[10px] bg-[#00A3E0]/20 text-[#00A3E0] flex items-center justify-center font-bold">✓</div>
                                                <div className="h-4 w-1/3 bg-slate-300 rounded" />
                                            </div>
                                            <div className="h-3 w-5/6 bg-slate-200 rounded ml-6" />
                                            <div className="h-3 w-4/6 bg-slate-200 rounded ml-6" />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Analyst Review */}
                        {demoStep === 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-white rounded-xl shadow-2xl flex border border-slate-200 overflow-hidden relative">
                                <div className="w-2/3 p-6 border-r border-slate-100 flex flex-col space-y-4">
                                    <div className="h-6 w-3/4 bg-slate-800 rounded mb-2" />
                                    <div className="h-3 w-full bg-slate-200 rounded" />
                                    <div className="h-3 w-full bg-slate-200 rounded" />
                                    <div className="h-3 w-5/6 bg-slate-200 rounded" />
                                    <div className="h-24 w-full bg-blue-50 border border-blue-100 rounded mt-4" />
                                </div>
                                <div className="w-1/3 p-4 bg-slate-50">
                                    <div className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Comments</div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">BA</div>
                                            <span className="font-bold text-slate-700">Analyst</span>
                                        </div>
                                        <p className="text-slate-600 text-xs text-balance">Looks good! The logic flows perfectly for the ERP integration. Approved.</p>
                                    </motion.div>
                                </div>

                                {/* Fake Cursor */}
                                <motion.div
                                    initial={{ top: "80%", left: "80%" }}
                                    animate={{ top: "40%", left: "60%" }}
                                    transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                                    className="absolute w-4 h-4 drop-shadow-md z-50">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.5 3L21 12L13.5 14.5L11 22L5.5 3Z" fill="black" stroke="white" strokeWidth="2" />
                                    </svg>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 4: Approval */}
                        {demoStep === 4 && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-2xl text-center border border-slate-200">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                    <UserCheck size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Admin Approval</h3>
                                <p className="text-sm text-slate-500 mb-6">BRD-001 has been reviewed and is ready for final sign-off.</p>
                                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> Approve & Deploy
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 5: Development */}
                        {demoStep === 5 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-[#0d1326] rounded-xl border border-slate-800 flex flex-col overflow-hidden font-mono text-sm relative">
                                <div className="p-4 bg-[#11182c] border-b border-slate-800 text-emerald-400 flex items-center gap-2 text-xs">
                                    <Code size={14} /> Agent Workspace
                                </div>
                                <div className="p-4 text-slate-300 space-y-2 relative h-full">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>&gt; Analyzing Approved BRD-001...</motion.div>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-blue-400">&gt; Generating backend models...</motion.div>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>&gt; Writing tests...</motion.div>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-emerald-400 flex items-center gap-2">
                                        <CheckCircle size={14} /> Build Successful
                                    </motion.div>

                                    {/* Scrolling code background */}
                                    <div className="absolute bottom-4 right-4 text-[10px] text-slate-700 opacity-50 space-y-1 pointer-events-none">
                                        <div>function initModule() {'{'}</div>
                                        <div>  return compile(req);</div>
                                        <div>{'}'}</div>
                                    </div>
                                </div>
                                {/* Success Toast overlay */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-full shadow-2xl font-sans font-bold text-sm flex items-center gap-2 border border-slate-200">
                                    <Sparkles size={14} className="text-[#00A3E0]" /> Solution Ready
                                </motion.div>
                            </motion.div>
                        )}

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
