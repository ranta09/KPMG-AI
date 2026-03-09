"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, Hammer, Rocket, Bot, GitMerge } from "lucide-react";

const steps = [
    {
        icon: <FileText className="w-6 h-6" />,
        color: "text-blue-600",
        bg: "bg-blue-100",
        border: "border-blue-200",
        num: "01",
        title: "Create BRD",
        desc: "Business users describe their requirement — optionally uploading audio, video, or documents. The AI generates a complete, structured BRD across 9 sections using the BRD Generator agent.",
    },
    {
        icon: <Bot className="w-6 h-6" />,
        color: "text-[#00338D]",
        bg: "bg-[#00338D]/10",
        border: "border-[#00338D]/20",
        num: "02",
        title: "AI Agent Review",
        desc: "The Requirement Analyst agent validates the BRD for completeness, identifies gaps, maps to Build Types, and surfaces risks. Stakeholders comment and request revisions inline.",
    },
    {
        icon: <CheckCircle className="w-6 h-6" />,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        border: "border-emerald-200",
        num: "03",
        title: "BRD Approved",
        desc: "Business sponsors review the final BRD and click Approve. The document is locked, versioned, and forwarded to the Build Orchestration pipeline automatically.",
    },
    {
        icon: <Hammer className="w-6 h-6" />,
        color: "text-purple-600",
        bg: "bg-purple-100",
        border: "border-purple-200",
        num: "04",
        title: "Build Orchestration",
        desc: "Select a build type (Web App, REST API, SAP Fiori, Bot, RPA, etc.). Five agents run sequentially — Solution Architect, Code Builder, Test Orchestrator — producing architecture docs, code, test plans, and deployment strategy.",
    },
    {
        icon: <GitMerge className="w-6 h-6" />,
        color: "text-amber-600",
        bg: "bg-amber-100",
        border: "border-amber-200",
        num: "05",
        title: "Developer Validation",
        desc: "The generated solution is sent to the Developer workspace for review. Developers inspect code, architecture, and the test plan. Business users see only high-level customisation options — raw code is governed.",
    },
    {
        icon: <Rocket className="w-6 h-6" />,
        color: "text-rose-600",
        bg: "bg-rose-100",
        border: "border-rose-200",
        num: "06",
        title: "Deploy",
        desc: "The approved build is deployed following the AI-generated blue-green deployment strategy. Every step is logged in the admin audit trail and tracked in the pipeline board.",
    },
];

export default function HowItWorksSection() {
    return (
        <section className="py-28 relative z-10 bg-transparent">
            <div className="container mx-auto px-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20">
                    <p className="text-sm font-bold text-[#00338D] uppercase tracking-widest mb-3">End-to-End Workflow</p>
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 text-slate-900">How It Works</h2>
                    <p className="text-slate-600 max-w-xl mx-auto text-lg leading-relaxed">
                        Six governed steps from business requirement to production deployment — all AI-orchestrated.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ delay: idx * 0.1, duration: 0.55 }}
                            className="relative bg-white/50 backdrop-blur-md rounded-2xl border-[0.5px] border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6 hover:shadow-[0_8px_32px_rgba(0,51,141,0.08)] hover:border-[#00338D]/25 transition-all duration-300 group overflow-hidden">
                            {/* Step number watermark */}
                            <span className="absolute top-4 right-5 text-5xl font-black text-slate-100 select-none leading-none group-hover:text-[#00338D]/10 transition-colors">{step.num}</span>

                            <div className={`w-11 h-11 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center ${step.color} mb-4 relative z-10`}>
                                {step.icon}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-2 relative z-10">{step.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
