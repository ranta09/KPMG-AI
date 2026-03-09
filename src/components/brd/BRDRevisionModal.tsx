"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { BRDRecord, BRDInput, useBRDStore } from "@/lib/brdStore";
import { useRouter } from "next/navigation";

interface BRDRevisionModalProps {
    brd: BRDRecord;
    onClose: () => void;
    mode?: "regenerate" | "major";
}

const BUILD_TYPES: Record<string, string[]> = {
    "Web Application": ["React/Next.js web app", "Angular App", "Vue.js App"],
    "SAP Fiori App": ["SAPUI5 Fiori Elements", "SAPUI5 Freestyle"],
    "REST API": ["Node.js + OpenAPI", "Python FastAPI", "Java Spring Boot"],
    "RPA Bot": ["UiPath RPA bot", "Automation Anywhere", "Python RPA bot", "Blue Prism"],
    "Integration Workflow": ["SAP CPI iFlow", "MuleSoft", "Azure Logic Apps"],
    "Data Dashboard": ["SAP Analytics Cloud", "Power BI", "Tableau Dashboard"]
};

export default function BRDRevisionModal({ brd, onClose, mode = "major" }: BRDRevisionModalProps) {
    const router = useRouter();
    const createMajorVersion = useBRDStore(state => state.createMajorVersion);

    // Find main category based on current subCategory
    const currentMainCategory = Object.keys(BUILD_TYPES).find(cat =>
        BUILD_TYPES[cat].includes(brd.input.sapModule || "")
    ) || "";

    const [form, setForm] = useState({
        title: brd.projectName,
        mainCategory: currentMainCategory,
        subCategory: brd.input.sapModule || "",
        requirement: brd.input.problemStatement,
    });

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setForm(prev => {
            const next = { ...prev, [key]: value };
            if (key === "mainCategory") next.subCategory = "";
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newInput: BRDInput = {
            ...brd.input,
            projectName: form.title,
            problemStatement: form.requirement,
            sapModule: form.subCategory,
        };

        useBRDStore.getState().updateCurrentVersion(brd.id, newInput);
        onClose();
    };

    const canSubmit = form.title.trim() && form.mainCategory && form.subCategory && form.requirement.trim();

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-amber-50/30">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={16} className="text-amber-600" />
                                <h2 className="text-base font-bold text-slate-900">Regenerate BRD</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                                    {mode === "major" ? "New Version" : "Current Version"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Update requirements to regenerate the BRD.</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors interactive text-slate-400">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex gap-3 items-start">
                        <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                            {mode === "major" ? (
                                <>Requesting a major revision will archive the current content (<strong>{brd.version}</strong>) and generate <strong>v{parseInt(brd.version.replace("v", "")) + 1}.0</strong> based on the new data provided below.</>
                            ) : (
                                <>Updating the current content (<strong>{brd.version}</strong>) will regenerate the sections based on the new data provided below.</>
                            )}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-5">
                            {/* Document Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={set("title")}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white transition-all"
                                />
                            </div>

                            {/* Build Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Main Category</label>
                                    <select
                                        value={form.mainCategory}
                                        onChange={set("mainCategory")}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {Object.keys(BUILD_TYPES).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Sub Category</label>
                                    <select
                                        value={form.subCategory}
                                        onChange={set("subCategory")}
                                        disabled={!form.mainCategory}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white disabled:bg-slate-50"
                                    >
                                        <option value="">Select Type</option>
                                        {form.mainCategory && BUILD_TYPES[form.mainCategory].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Raw Business Requirement */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Updated Business Requirement</label>
                                <textarea
                                    value={form.requirement}
                                    onChange={set("requirement")}
                                    required
                                    rows={6}
                                    placeholder="Explain the new requirements or changes needed..."
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none bg-slate-50 transition-all font-sans"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-3 p-6 pt-0">
                            <div className="flex gap-3">
                                {mode === "major" && (
                                    <button
                                        type="button"
                                        disabled={!canSubmit}
                                        onClick={() => {
                                            const newInput: BRDInput = {
                                                ...brd.input,
                                                projectName: form.title,
                                                problemStatement: form.requirement,
                                                sapModule: form.subCategory,
                                            };
                                            createMajorVersion(brd.id, router.push, newInput);
                                            onClose();
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm rounded-xl transition-all shadow-sm interactive"
                                    >
                                        Continue with same BRD
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md interactive"
                                >
                                    <Sparkles size={15} /> Regenerate BRD
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
