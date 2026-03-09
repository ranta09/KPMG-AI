"use client";

import { motion } from "framer-motion";
import AnimatedCard from "@/components/AnimatedCard";
import { Edit3, CheckSquare, Save, Eye } from "lucide-react";

export default function AnalystDashboard() {
    return (
        <div className="py-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900">PDD Refinement</h1>
                    <p className="text-slate-500">Review, edit, and approve AI-generated documentation.</p>
                </div>
                <div className="flex gap-3">
                    <button className="interactive flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm transition-colors">
                        <Eye size={16} /> Preview
                    </button>
                    <button className="interactive flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                        <CheckSquare size={16} /> Approve Final
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Editor Area */}
                <AnimatedCard className="lg:col-span-3 p-1 min-h-[600px] flex flex-col bg-white">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-mono text-[#00338D]">PDD-2026</span>
                            <span className="text-slate-400">/</span>
                            <span className="font-medium">CRM Integration</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> AI Generated</span>
                            <span>Last edited 5m ago</span>
                            <Save size={14} className="cursor-pointer hover:text-[#00338D] interactive" />
                        </div>
                    </div>

                    <div className="p-8 prose max-w-none flex-1 overflow-y-auto interactive text-slate-700">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Business Objective</h2>
                        <p className="mb-6 focus:outline-none focus:ring-2 focus:ring-[#00338D]/20 rounded p-2 transition-all hover:bg-slate-50" contentEditable suppressContentEditableWarning>
                            The primary objective of this project is to integrate the new Salesforce CRM with the existing legacy inventory system. This will enable real-time tracking of stock availability directly from the sales dashboard, reducing manual checks by 40%.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Functional Requirements</h2>
                        <ul className="list-disc pl-5 space-y-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#00338D]/20 hover:bg-slate-50 rounded p-2 transition-all" contentEditable suppressContentEditableWarning>
                            <li>The system must sync inventory counts every 5 minutes.</li>
                            <li>Sales reps must see a "Low Stock" warning when quantity &lt; 10.</li>
                            <li>A fallback mechanism should be implemented in case the legacy API is down.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. AI Insights & Architecture</h2>
                        <div className="p-4 rounded-xl border border-[#00A3E0]/30 bg-[#00A3E0]/5">
                            <p className="text-sm text-[#00338D] mb-3">🤖 AI Suggestion: We recommend implementing a Redis caching layer to handle the high volume of dashboard read requests without overloading the legacy database.</p>
                            <button className="text-xs bg-white border border-[#00A3E0]/30 hover:bg-[#00338D]/5 text-[#00338D] px-3 py-1.5 rounded transition-colors interactive font-medium">
                                Add to requirements
                            </button>
                        </div>
                    </div>
                </AnimatedCard>

                {/* Sidebar Tools */}
                <div className="space-y-6">
                    <AnimatedCard className="p-5 bg-white">
                        <h3 className="font-medium mb-4 flex items-center gap-2 text-sm text-slate-800">
                            <Edit3 size={16} className="text-[#00A3E0]" /> Sections
                        </h3>
                        <div className="space-y-1.5">
                            {['Business Objective', 'Functional Requirements', 'Non-Functional', 'Security', 'Data Flow'].map((item, i) => (
                                <div key={i} className="interactive text-xs p-2 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                    {i + 1}. {item}
                                </div>
                            ))}
                        </div>
                    </AnimatedCard>
                </div>
            </div>
        </div>
    );
}
