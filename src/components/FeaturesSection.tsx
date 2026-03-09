"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import { FileText, Bot, Hammer, GitBranch, Shield, BarChart3, Users, Cpu } from "lucide-react";

const features = [
    {
        icon: <FileText className="w-7 h-7 text-blue-500" />,
        label: "BRD Management",
        title: "AI-Powered BRD Creation",
        description: "Generate structured Business Requirement Documents from a title, Build Type, and a text description. Upload audio, video, or documents as source material. Full version control, inline editing, comments, and approval workflow.",
    },
    {
        icon: <Bot className="w-7 h-7 text-[#00338D]" />,
        label: "Agent Ecosystem",
        title: "8 Enterprise AI Agents",
        description: "Purpose-built agents — Requirement Analyst, BRD Generator, Solution Architect, Code Builder, Test Orchestrator, Security Reviewer, Deployment Manager, and Stakeholder Communicator — each with live task queues, execution history, and streaming logs.",
    },
    {
        icon: <Hammer className="w-7 h-7 text-purple-500" />,
        label: "Build Orchestration",
        title: "Build from BRD",
        description: "Business Users approve a BRD and click Generate. The platform auto-orchestrates 5 agents to produce architecture docs, production-ready code, API specs, test plans, and deployment strategies — for 7 build types including REST APIs, SAP Fiori apps, and RPA bots.",
    },
    {
        icon: <GitBranch className="w-7 h-7 text-emerald-500" />,
        label: "Pipeline",
        title: "Project Pipeline",
        description: "Kanban-style pipeline board tracking every initiative from Idea through In Review, Approved, In Development, to Deployed. Full project management with status cards, owners, and progress indicators.",
    },
    {
        icon: <Shield className="w-7 h-7 text-amber-500" />,
        label: "Governance",
        title: "Enterprise Governance",
        description: "Role-based access control across Admin, Developer, Business Analyst, and Business User roles. Business Users cannot edit raw code. Every build, BRD change, and agent execution is logged with a full audit trail.",
    },
    {
        icon: <BarChart3 className="w-7 h-7 text-rose-500" />,
        label: "Analytics",
        title: "Business Analyst Dashboard",
        description: "Dedicated analyst workspace with project metrics, BRD coverage reporting, requirement quality scores, and stakeholder visibility — all in one premium enterprise-grade view.",
    },
    {
        icon: <Users className="w-7 h-7 text-cyan-500" />,
        label: "Access Control",
        title: "Admin Control Center",
        description: "Admin dashboard with pipeline overview, project management, role-based user access control, and a full agent audit view. Manage who sees what across the entire platform.",
    },
    {
        icon: <Cpu className="w-7 h-7 text-indigo-500" />,
        label: "Developer Hub",
        title: "Developer Workspace",
        description: "Developers receive AI-generated builds for review and validation. Agent control tower with live status, task queues, execution history, and streaming logs. Build pipeline from Business User to deployment.",
    },
];

export default function FeaturesSection() {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't clear if clicking the anchor link itself
            if (target.closest('a[href^="#feature-"]')) return;

            // Clear the hash to remove the :target CSS highlight
            if (window.location.hash.startsWith("#feature-")) {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    return (
        <section id="features" className="py-28 relative z-10 bg-transparent border-y border-slate-200/50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20">
                    <p className="text-sm font-bold text-[#00338D] uppercase tracking-widest mb-3">Platform Capabilities</p>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
                        Everything You Need to<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00338D] to-[#00A3E0]">Transform SAP at Enterprise Scale</span>
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        From capturing a business idea to deploying a working solution —
                        every step automated, governed, and AI-assisted.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feature, index) => (
                        <motion.div
                            id={`feature-${index}`}
                            key={index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.07 }}
                            className="scroll-mt-32 rounded-3xl target:ring-[4px] target:ring-[#00338D]/40 target:bg-slate-50/50 target:-translate-y-2 target:shadow-[0_0_40px_rgba(0,51,141,0.15)] transition-all duration-700">
                            <AnimatedCard className="p-6 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300 bg-white/50 backdrop-blur-md border-[0.5px] border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                                <div className="mb-4 p-3 rounded-xl bg-slate-50/80 inline-block border border-slate-200/50 shadow-sm">
                                    {feature.icon}
                                </div>
                                <span className="text-[10px] font-bold text-[#00338D] uppercase tracking-widest mb-1">{feature.label}</span>
                                <h3 className="text-base font-bold mb-2 text-slate-900 leading-snug">{feature.title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed flex-1">{feature.description}</p>
                            </AnimatedCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
