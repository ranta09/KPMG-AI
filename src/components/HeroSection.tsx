"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, CheckCircle, Hammer, FileText, GitBranch, Shield, BarChart3, Users, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth";

export default function HeroSection() {
    const router = useRouter();

    const handleLaunch = () => {
        const user = getLoggedInUser();
        router.push(user ? user.dashboardPath : "/login");
    };

    const floatingFeatures = [
        { id: 0, title: "AI BRD Creation", sub: "Auto-generated", icon: <FileText className="w-5 h-5 text-blue-600" />, bg: "bg-blue-100", pos: "top-[12%] left-[50%]", ySteps: [0, -15, 0], delay: 0 },         // Top
        { id: 1, title: "AI Agents", sub: "Live processing", icon: <Bot className="w-5 h-5 text-[#00338D]" />, bg: "bg-[#00338D]/10", pos: "top-[22%] left-[78%]", ySteps: [0, 15, 0], delay: 1 },              // Top-Right
        { id: 2, title: <span className="whitespace-nowrap">Build from BRD</span>, sub: "Orchestrated", icon: <Hammer className="w-5 h-5 text-purple-600" />, bg: "bg-purple-100", pos: "top-[50%] left-[88%]", ySteps: [0, -12, 0], delay: 2 },      // Right
        { id: 3, title: "Project Pipeline", sub: "Kanban board", icon: <GitBranch className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-100", pos: "top-[85%] left-[82%]", ySteps: [0, 12, 0], delay: 1.5 }, // Bottom-Right
        { id: 4, title: "Governance", sub: "Role-based access", icon: <Shield className="w-5 h-5 text-amber-600" />, bg: "bg-amber-100", pos: "top-[95%] left-[50%]", ySteps: [0, -15, 0], delay: 0.5 },    // Bottom
        { id: 5, title: "Analytics", sub: "Quality metrics", icon: <BarChart3 className="w-5 h-5 text-rose-600" />, bg: "bg-rose-100", pos: "top-[85%] left-[18%]", ySteps: [0, 10, 0], delay: 2.5 },       // Bottom-Left
        { id: 6, title: "Control Center", sub: "Admin overview", icon: <Users className="w-5 h-5 text-cyan-600" />, bg: "bg-cyan-100", pos: "top-[50%] left-[12%]", ySteps: [0, -10, 0], delay: 1.2 },      // Left
        { id: 7, title: "Developer Hub", sub: "Review & validate", icon: <Cpu className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-100", pos: "top-[22%] left-[22%]", ySteps: [0, 14, 0], delay: 0.8 },   // Top-Left
    ];

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-transparent">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#00A3E0]/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 text-center pointer-events-none">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm font-semibold text-[#00338D] border border-[#00338D]/15 bg-white/60 pointer-events-auto">
                    <span className="w-2 h-2 rounded-full bg-[#00A3E0] animate-pulse" />
                    KPMG AI Solution
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 pointer-events-auto leading-[1.1]">
                    From Business Idea<br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00338D] to-[#00A3E0]">
                        {" "}to Working Solution
                    </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-4 text-xl text-slate-600 mx-auto mb-10 leading-relaxed font-medium pointer-events-auto z-20 relative">
                    Complete AI-Native Platform for Every Stage of Product Development
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto z-20 relative">
                    <button
                        onClick={handleLaunch}
                        className="interactive group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-[#00338D] rounded-full hover:bg-[#001f5c] hover:shadow-[0_4px_24px_rgba(0,51,141,0.35)] transition-all duration-300">
                        Launch Platform <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a href="#features"
                        className="interactive inline-flex items-center gap-2 px-6 py-4 text-sm font-semibold text-slate-700 border border-slate-300 rounded-full hover:border-[#00338D] hover:text-[#00338D] transition-all duration-200 bg-white/50 backdrop-blur-sm">
                        See Features
                    </a>
                </motion.div>
            </div>

            {/* Floating Metric Cards (8 Features) */}
            {floatingFeatures.map((feat) => (
                <div key={feat.id} className={`absolute ${feat.pos} hidden md:block opacity-90 pointer-events-auto z-10 -translate-x-1/2 -translate-y-1/2`}>
                    <motion.a
                        href={`#feature-${feat.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, y: feat.ySteps }}
                        transition={{
                            opacity: { duration: 0.8, delay: 0.8 + feat.delay * 0.2 },
                            scale: { duration: 0.8, delay: 0.8 + feat.delay * 0.2 },
                            y: { duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: feat.delay }
                        }}
                        className="glass bg-white/50 backdrop-blur-md p-3.5 rounded-2xl flex items-center gap-3 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 hover:border-[#00338D]/40 transition-all cursor-pointer group interactive"
                    >
                        <div className={`w-9 h-9 rounded-full ${feat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                            {feat.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-[#00338D] transition-colors">{feat.title}</p>
                            <p className="text-xs text-slate-500">{feat.sub}</p>
                        </div>
                    </motion.a>
                </div>
            ))}
        </section>
    );
}
