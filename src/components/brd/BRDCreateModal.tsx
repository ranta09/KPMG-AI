"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, FileText, Sparkles, Mic, Video, File } from "lucide-react";
import { BRDRecord, useBRDStore } from "@/lib/brdStore";

interface BRDCreateModalProps {
    onClose: () => void;
    onCreated: (record: BRDRecord) => void;
}

const BUILD_TYPES: Record<string, string[]> = {
    "Web Application": ["React/Next.js web app", "Angular App", "Vue.js App"],
    "SAP Fiori App": ["SAPUI5 Fiori Elements", "SAPUI5 Freestyle"],
    "REST API": ["Node.js + OpenAPI", "Python FastAPI", "Java Spring Boot"],
    "RPA Bot": ["UiPath RPA bot", "Automation Anywhere", "Python RPA bot", "Blue Prism"],
    "Integration Workflow": ["SAP CPI iFlow", "MuleSoft", "Azure Logic Apps"],
    "Data Dashboard": ["SAP Analytics Cloud", "Power BI", "Tableau Dashboard"]
};

type Stage = "form" | "generating" | "done";

const PREDEFINED_TEMPLATES = [
    { id: "T-001", title: "Global ERP Rollout", desc: "Standard format for multi-country ERP implementations.", version: "v2.1", status: "Approved" },
    { id: "T-002", title: "Finance Module Upgrade", desc: "Focused template for FI/CO transitions and enhancements.", version: "v1.2", status: "BRD Generated" },
    { id: "T-003", title: "S/4HANA Migration", desc: "Comprehensive structure for Brownfield/Greenfield migrations.", version: "v1.0", status: "Revision Required" },
    { id: "T-004", title: "Vendor Portal Integration", desc: "Interface definitions and security requirements for portals.", version: "v1.0", status: "BRD Generated" },
];

export default function BRDCreateModal({ onClose, onCreated }: BRDCreateModalProps) {
    const { brds } = useBRDStore();
    const [stage] = useState<Stage>("form");
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({ audio: null, video: null, document: null });
    const [selectedRefBRDs, setSelectedRefBRDs] = useState<string[]>([]);
    const [referenceTab, setReferenceTab] = useState<"templates" | "my-brds">("templates");
    const [form, setForm] = useState({
        title: "",
        mainCategory: "",
        subCategory: "",
        requirement: "",
    });

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setForm(prev => {
            const next = { ...prev, [key]: value };
            if (key === "mainCategory") next.subCategory = "";
            return next;
        });
    };

    const toggleRefBRD = (id: string) =>
        setSelectedRefBRDs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleFileChange = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setUploadedFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    };

    const handleViewTemplate = (id: string) => {
        // Mock opening a PDF
        alert(`Opening ${id} template format... (PDF Viewer Placeholder)`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const now = new Date().toISOString();
        const fileNames = Object.values(uploadedFiles).filter(Boolean).map(f => f!.name);

        const newBRD: BRDRecord = {
            id: `BRD-${String(Math.floor(Math.random() * 900) + 100)}`,
            projectName: form.title,
            version: "v1.0",
            status: "Generating BRD",
            createdAt: now,
            updatedAt: now,
            createdBy: "Business User",
            isLocked: false,
            input: {
                projectName: form.title,
                objective: form.requirement,
                problemStatement: form.requirement,
                currentProcess: "To be defined during discovery workshops.",
                desiredOutcome: "Fully optimised process replacing current manual approach.",
                stakeholders: "Key business sponsors and process owners",
                kpis: "Processing efficiency, error rate reduction, system availability > 99.9%",
                constraints: "Implementation to align with business strategy.",
                sapModule: form.subCategory,
                uploadedFiles: fileNames,
            },
            sections: {
                executiveSummary: `This Business Requirement Document was generated for the "${form.title}" initiative targeting the ${form.subCategory} (${form.mainCategory}) stack.`,
                businessContext: `The business has identified a requirement to leverage ${form.subCategory} capabilities to address the following:\n\n${form.requirement}`,
                scope: `**In Scope:**\n- Implementation of ${form.subCategory} to address the stated requirement\n- Integration with core backend systems\n- User acceptance testing\n- Training for end users`,
                processFlow: `**Current State:** Manual processes requiring improvement.\n\n**Future State:** Fully integrated ${form.subCategory} solution delivering the desired outcome.`,
                techStackMapping: `| Component | Technology | Function |\n|---|---|---|\n| Primary Stack | ${form.subCategory} | Core requirement delivery |\n| Category | ${form.mainCategory} | Solution architecture |`,
                functionalRequirements: `FR-001: System shall support end-to-end process automation.\nFR-002: Real-time reporting shall provide operational visibility.`,
                nonFunctionalRequirements: `NFR-001: System availability ≥ 99.9%.\nNFR-002: All data encrypted in transit and at rest.`,
                acceptanceCriteria: `AC-001: All functional requirements pass UAT.\nAC-002: Formal sign-off obtained from Business Sponsor.`,
                risksAndAssumptions: `**Key Risks:**\n⚠️ R-001: Stakeholder availability for workshops.\n\n**Assumptions:**\nA-001: ${form.subCategory} environments are available at start.`,
            },
            comments: [],
            versionHistory: [{
                version: "v1.0",
                createdAt: now,
                createdBy: "Business User",
                changeSummary: `Initial draft generated by BRD Generator agent. Build Type: ${form.mainCategory} / ${form.subCategory}.`,
                sections: {} as never,
            }],
        };

        onCreated(newBRD);
        onClose();
    };

    const canSubmit = form.title.trim() && form.mainCategory && form.subCategory && form.requirement.trim();

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-slate-200 flex-shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={16} className="text-[#00338D]" />
                                <h2 className="text-base font-bold text-slate-900">BRD Generator</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00338D]/10 text-[#00338D] rounded-full border border-[#00338D]/20">AI-powered</span>
                            </div>
                            <p className="text-xs text-slate-500">Business requirement document creation</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors interactive text-slate-400">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-5">



                            {/* Document Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Document Title <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={set("title")}
                                    required
                                    placeholder="e.g. AP Automation BRD"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white transition-all placeholder:text-slate-400"
                                />
                            </div>

                            {/* Categorized Build Type Dropdowns */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 text-nowrap">Main Category <span className="text-red-400">*</span></label>
                                    <select
                                        value={form.mainCategory}
                                        onChange={set("mainCategory")}
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white transition-all"
                                    >
                                        <option value="">Select Category</option>
                                        {Object.keys(BUILD_TYPES).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 text-nowrap">Sub Category <span className="text-red-400">*</span></label>
                                    <select
                                        value={form.subCategory}
                                        onChange={set("subCategory")}
                                        required
                                        disabled={!form.mainCategory}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <option value="">Select Type</option>
                                        {form.mainCategory && BUILD_TYPES[form.mainCategory].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Business Requirement */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Requirement <span className="text-red-400">*</span></label>
                                <textarea
                                    value={form.requirement}
                                    onChange={set("requirement")}
                                    required
                                    rows={5}
                                    placeholder="Describe the business requirement in detail. Include stakeholders, business process, expected outcomes..."
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none resize-none bg-slate-50 transition-all placeholder:text-slate-400"
                                />
                            </div>

                            {/* Source Material Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Source Material <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <p className="text-[11px] text-slate-400 mb-3">Upload source files for AI to use during BRD generation</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { type: "audio", Icon: Mic, title: "Audio Recording", desc: "Upload audio for AI transcription", accept: ".mp3,.wav,.m4a,.ogg", color: "text-purple-600", bg: "bg-purple-50", activeBorder: "border-purple-400" },
                                        { type: "video", Icon: Video, title: "Video Recording", desc: "Upload video for AI analysis", accept: ".mp4,.mov,.webm,.avi", color: "text-blue-600", bg: "bg-blue-50", activeBorder: "border-blue-400" },
                                        { type: "document", Icon: File, title: "Document", desc: "Upload PDF, DOCX, or TXT files", accept: ".pdf,.docx,.doc,.txt,.md", color: "text-emerald-600", bg: "bg-emerald-50", activeBorder: "border-emerald-400" },
                                    ].map(({ type, Icon, title, desc, accept, color, bg, activeBorder }) => {
                                        const file = uploadedFiles[type];
                                        return (
                                            <label key={type}
                                                className={`flex flex-col items-center gap-2 p-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all interactive text-center group ${file ? `${activeBorder} ${bg}` : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                    }`}>
                                                <div className={`w-9 h-9 rounded-xl ${file ? bg : "bg-slate-100 group-hover:bg-slate-200"} flex items-center justify-center transition-colors flex-shrink-0`}>
                                                    <Icon size={16} className={file ? color : "text-slate-400"} />
                                                </div>
                                                <div>
                                                    <p className={`text-[11px] font-bold leading-tight ${file ? color : "text-slate-700"}`}>{title}</p>
                                                    {file ? (
                                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[80px]">{file.name}</p>
                                                    ) : (
                                                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
                                                    )}
                                                </div>
                                                <input type="file" className="hidden" accept={accept} onChange={handleFileChange(type)} />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Reference BRDs with Tabs */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Reference BRDs <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <p className="text-[11px] text-slate-400 mb-3">Select existing BRDs to use as style/structure reference</p>

                                {/* Tab Switcher */}
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-3 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setReferenceTab("templates")}
                                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${referenceTab === "templates" ? "bg-white text-[#00338D] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Predefined Templates
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReferenceTab("my-brds")}
                                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${referenceTab === "my-brds" ? "bg-white text-[#00338D] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        My BRDs
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                    {referenceTab === "templates" ? (
                                        PREDEFINED_TEMPLATES.map(template => (
                                            <div key={template.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-[#00338D]/40 transition-all group">
                                                <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${selectedRefBRDs.includes(template.id) ? "bg-[#00338D] border-[#00338D]" : "border-slate-300 group-hover:border-[#00338D]/50"}`}>
                                                        {selectedRefBRDs.includes(template.id) && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={selectedRefBRDs.includes(template.id)} onChange={() => toggleRefBRD(template.id)} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-semibold text-slate-700 truncate">{template.title}</p>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase">{template.status}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{template.desc}</p>
                                                    </div>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewTemplate(template.id)}
                                                    className="px-2.5 py-1 text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-[#00338D] transition-all whitespace-nowrap"
                                                >
                                                    View Format
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        brds.length > 0 ? (
                                            brds.map(brd => (
                                                <label key={brd.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-[#00338D]/40 transition-all interactive group">
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${selectedRefBRDs.includes(brd.id) ? "bg-[#00338D] border-[#00338D]" : "border-slate-300 group-hover:border-[#00338D]/50"}`}>
                                                        {selectedRefBRDs.includes(brd.id) && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={selectedRefBRDs.includes(brd.id)} onChange={() => toggleRefBRD(brd.id)} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-slate-700 truncate">{brd.projectName}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">{brd.id} · {brd.version} · {brd.status}</p>
                                                    </div>
                                                </label>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl">
                                                <FileText size={24} className="text-slate-300 mb-2" />
                                                <p className="text-xs font-semibold text-slate-500">No BRDs created yet</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Your generated BRDs will appear here as references.</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 pt-0">
                            <button type="button" onClick={onClose}
                                className="px-5 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold text-sm rounded-xl transition-all interactive">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00338D] hover:bg-[#00266e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md interactive"
                            >
                                <Sparkles size={15} /> Generate BRD
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
