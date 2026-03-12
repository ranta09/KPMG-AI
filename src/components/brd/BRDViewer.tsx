"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, History, FileText, Download, Edit3, Check, X, Lock, Send, RotateCcw, Clock, Code, HardDrive, File as FileIcon, ChevronDown, ChevronUp, Play, Plus, UserPlus } from "lucide-react";
import { BRDRecord, BRDSections, BRDVersion } from "@/lib/brdStore";
import { getLoggedInUser } from "@/lib/auth";
import BRDRevisionModal from "./BRDRevisionModal";
import ReviewEmailModal from "./ReviewEmailModal";
import AssignDeveloperModal from "./AssignDeveloperModal";

interface BRDViewerProps {
    brd: BRDRecord;
    onStatusChange: (id: string, status: BRDRecord["status"], reviewerEmail?: string, developerEmail?: string) => void;
    onAddComment: (id: string, content: string, section?: string) => void;
    onSectionEdit: (id: string, sections: BRDSections) => void;
    onRequestMajorChange?: (id: string) => void;
}

type Tab = "document" | "history" | "comments";

const SECTIONS: { key: keyof BRDSections; label: string; icon: string }[] = [
    { key: "executiveSummary", label: "Executive Summary", icon: "📋" },
    { key: "businessContext", label: "Business Context", icon: "🏢" },
    { key: "scope", label: "Scope", icon: "🎯" },
    { key: "processFlow", label: "Process Flow", icon: "🔄" },
    { key: "techStackMapping", label: "Build Type Mapping", icon: "🗺️" },
    { key: "functionalRequirements", label: "Functional Requirements", icon: "✅" },
    { key: "nonFunctionalRequirements", label: "Non-Functional Requirements", icon: "⚙️" },
    { key: "acceptanceCriteria", label: "Acceptance Criteria", icon: "🏁" },
    { key: "risksAndAssumptions", label: "Risks & Assumptions", icon: "⚠️" },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
    "BRD Generated": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
    "BRD Review": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
    "Approved": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
    "Changes Requested": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300" },
    "Development": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
    "UAT": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
    "Production": { bg: "bg-[#00338D]/20", text: "text-[#00338D]", border: "border-[#00338D]/30" },
    "Archived": { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200" },
};

const TIMELINE_STAGES = [
    "BRD Generated",
    "BRD Review",
    "Approved",
    "Development",
    "UAT",
    "Production"
];

function getTimelineIndex(status: string) {
    if (status === "Generating BRD") return -1;
    if (status === "BRD Generated" || status === "Draft") return 0;
    if (status === "BRD Review" || status === "Changes Requested") return 1;
    if (status === "Approved") return 2;
    if (status === "Development") return 3;
    if (status === "UAT") return 4;
    if (status === "Production") return 5;
    return 0;
}

function EditableSection({ value, isLocked, sectionKey, onSave, onAddComment }: {
    value: string; isLocked: boolean; sectionKey: string; onSave: (v: string) => void; onAddComment?: (section: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const save = () => { onSave(draft); setEditing(false); };
    const cancel = () => { setDraft(value); setEditing(false); };

    return (
        <div className="group relative">
            {editing ? (
                <div>
                    <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-[#00338D] rounded-xl text-sm text-slate-700 outline-none resize-none bg-blue-50/30 focus:bg-white transition-all font-mono"
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00338D] text-white text-xs font-semibold rounded-lg interactive">
                            <Check size={13} /> Save
                        </button>
                        <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg interactive hover:bg-slate-50">
                            <X size={13} /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <pre className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100 print-content">{value}</pre>
                    <div className="absolute top-2 right-2 flex gap-2 no-print opacity-0 group-hover:opacity-100 transition-all">
                        {onAddComment && (
                            <button
                                onClick={() => onAddComment(sectionKey)}
                                title="Add comment to this section"
                                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#00338D] hover:border-[#00338D] transition-all interactive shadow-sm"
                            >
                                <MessageSquare size={13} />
                            </button>
                        )}
                        {!isLocked && (
                            <button
                                onClick={() => setEditing(true)}
                                title="Edit section"
                                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#00338D] hover:border-[#00338D] transition-all interactive shadow-sm"
                            >
                                <Edit3 size={13} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BRDViewer({ brd, onStatusChange, onAddComment, onSectionEdit, onRequestMajorChange }: BRDViewerProps) {
    const [tab, setTab] = useState<Tab>("document");
    const [commentInput, setCommentInput] = useState("");
    const [sections, setSections] = useState<BRDSections>(brd.sections);
    const [animKey, setAnimKey] = useState(0);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionMode, setRevisionMode] = useState<"regenerate" | "major">("major");
    const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
    const [showReviewEmailModal, setShowReviewEmailModal] = useState(false);
    const [showAssignDeveloperModal, setShowAssignDeveloperModal] = useState(false);
    const user = getLoggedInUser();
    const isProgramManager = user?.role === "program-manager";

    const handleExportPDF = () => {
        window.print();
    };

    const sc = STATUS_CONFIG[brd.status as keyof typeof STATUS_CONFIG] || { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200" };

    // Read-only logic: 
    // 1. Locked manually
    // 2. Beyond Approval
    // 3. For Program Managers: Already in "BRD Review"
    const isReadOnly = brd.isLocked ||
        ["Approved", "Development", "UAT", "Production", "Archived"].includes(brd.status) ||
        (isProgramManager && brd.status === "BRD Review");

    const handleSectionSave = (key: keyof BRDSections, value: string) => {
        const updated = { ...sections, [key]: value };
        setSections(updated);
        onSectionEdit(brd.id, updated);
    };

    const handleStatus = (status: BRDRecord["status"], reviewerEmail?: string, developerEmail?: string) => {
        setAnimKey(k => k + 1);
        onStatusChange(brd.id, status, reviewerEmail, developerEmail);
    };

    const submitComment = () => {
        if (!commentInput.trim()) return;
        onAddComment(brd.id, commentInput.trim());
        setCommentInput("");
    };

    const inDev = ["Development", "UAT", "Production"].includes(brd.status);

    return (
        <div className="flex-1 min-w-0 flex flex-col">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 20mm;
                        size: A4;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .brd-print-container, .brd-print-container * {
                        visibility: visible;
                    }
                    .brd-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-break-inside-avoid {
                        break-inside: avoid;
                    }
                    .print-heading {
                        font-size: 24pt !important;
                        color: #00338D !important;
                        margin-bottom: 20pt !important;
                        border-bottom: 2pt solid #00338D !important;
                        padding-bottom: 10pt !important;
                        text-align: center;
                    }
                    .print-section-title {
                        font-size: 16pt !important;
                        font-weight: bold !important;
                        color: #00338D !important;
                        margin-top: 25pt !important;
                        margin-bottom: 10pt !important;
                        border-left: 4pt solid #00A3E0 !important;
                        padding-left: 10pt !important;
                    }
                    .print-content {
                        font-size: 11pt !important;
                        line-height: 1.6 !important;
                        color: #334155 !important;
                        white-space: pre-wrap !important;
                        background: none !important;
                        border: none !important;
                        padding: 0 !important;
                    }
                    .print-metadata {
                        font-size: 10pt !important;
                        color: #64748B !important;
                        margin-bottom: 30pt !important;
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 1pt solid #E2E8F0 !important;
                        padding-bottom: 10pt !important;
                    }
                }
            `}</style>

            {/* Document Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4 shadow-sm no-print">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-xs text-slate-400 font-bold">{brd.id}</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono text-xs text-slate-400">{brd.version}</span>
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                                <motion.span
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                                />
                                {brd.status}
                            </span>
                            {brd.isLocked && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                                    <Lock size={10} /> Locked
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-1">{brd.projectName}</h1>
                        <p className="text-sm text-slate-500">
                            Created by {brd.createdBy} · Last updated {new Date(brd.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Action Buttons */}
                        {brd.status !== "Archived" && (
                            <div className="flex gap-2">
                                {!inDev ? (
                                    <>
                                        {(brd.status === "BRD Generated" || brd.status === "Changes Requested") && isProgramManager && (
                                            <button onClick={() => setShowReviewEmailModal(true)}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl transition-all interactive">
                                                <Send size={13} /> {brd.status === "Changes Requested" ? "Resend For Review" : "Send For Review"}
                                            </button>
                                        )}
                                        {!isProgramManager && brd.status === "BRD Review" && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleStatus("Changes Requested")}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl transition-all interactive">
                                                    <X size={13} /> Request Changes
                                                </button>
                                                <button onClick={() => handleStatus("Approved")}
                                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all interactive shadow-sm">
                                                    <Check size={13} /> Approve BRD
                                                </button>
                                            </div>
                                        )}
                                        {brd.status === "Approved" && isProgramManager && (
                                            <button onClick={() => setShowAssignDeveloperModal(true)}
                                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#00338D] text-white hover:bg-[#00266e] rounded-xl transition-all interactive shadow-sm">
                                                <UserPlus size={13} /> Assign Developer
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    onRequestMajorChange && (
                                        <div className="flex gap-2">
                                            {!isReadOnly && brd.status === "BRD Generated" && (
                                                <button onClick={() => setShowReviewEmailModal(true)}
                                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#00338D] text-white hover:bg-[#00266e] rounded-xl transition-all interactive shadow-sm">
                                                    <Send size={13} /> Send For Review
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setRevisionMode("regenerate"); setShowRevisionModal(true); }}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl transition-all interactive">
                                                <RotateCcw size={13} /> Regenerate BRD
                                            </button>
                                            <button
                                                onClick={() => { setRevisionMode("major"); setShowRevisionModal(true); }}
                                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-xl transition-all interactive shadow-sm">
                                                <Plus size={13} /> Request Major Revision
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all interactive ml-auto"
                        >
                            <Download size={13} /> Export PDF
                        </button>
                    </div>

                    {showRevisionModal && (
                        <BRDRevisionModal
                            brd={brd}
                            mode={revisionMode}
                            onClose={() => setShowRevisionModal(false)}
                        />
                    )}

                    {showReviewEmailModal && (
                        <ReviewEmailModal
                            onClose={() => setShowReviewEmailModal(false)}
                            onSend={(email) => {
                                handleStatus("BRD Review", email);
                                setShowReviewEmailModal(false);
                            }}
                        />
                    )}

                    {showAssignDeveloperModal && (
                        <AssignDeveloperModal
                            onClose={() => setShowAssignDeveloperModal(false)}
                            onAssign={(email) => {
                                handleStatus("Development", undefined, email);
                                setShowAssignDeveloperModal(false);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm relative w-full no-print">
                <div className="w-full relative pt-2">
                    {/* Background Track */}
                    <div className="absolute left-[7%] right-[7%] top-6 h-1 bg-slate-100 z-0 rounded-full" />
                    {/* Progress Track */}
                    <div
                        className="absolute left-[7%] top-6 h-1 bg-[#00A3E0] z-0 rounded-full transition-all duration-700"
                        style={{ width: `calc(${(Math.max(0, getTimelineIndex(brd.status)) / (TIMELINE_STAGES.length - 1)) * 86}%)` }}
                    />

                    {/* Stages */}
                    <div className="flex items-start justify-between relative z-10 w-full">
                        {TIMELINE_STAGES.map((stage, i) => {
                            const currentIndex = getTimelineIndex(brd.status);
                            const isActive = i === currentIndex;
                            const isPast = i < currentIndex;

                            return (
                                <div key={stage} className="flex flex-col items-center gap-2 flex-1 relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 shadow-sm ${isActive ? "bg-[#00338D] text-white scale-110" : isPast ? "bg-[#00A3E0] text-white" : "bg-slate-200 text-slate-400"}`}>
                                        {isPast ? <Check size={14} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                    </div>
                                    <span className={`text-[10px] leading-tight font-bold text-center w-full px-0.5 ${isActive ? "text-[#00338D]" : isPast ? "text-slate-700" : "text-slate-400"}`}>{stage}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-xl mb-0 px-4 no-print">
                {([
                    { id: "document", label: "Document", Icon: FileText },
                    { id: "history", label: "Version History", Icon: History, count: brd.versionHistory.length },
                    { id: "comments", label: "Comments", Icon: MessageSquare, count: brd.comments.length },
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all interactive ${tab === t.id ? "border-[#00338D] text-[#00338D]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <t.Icon size={15} /> {t.label}
                        {"count" in t && t.count > 0 && <span className="w-5 h-5 rounded-full bg-[#00338D]/10 text-[#00338D] text-[10px] font-bold flex items-center justify-center">{t.count}</span>}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {/* DOCUMENT TAB */}
                    {tab === "document" && (
                        <motion.div key="doc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 space-y-8 brd-print-container">

                            {/* Print-only formal header */}
                            <div className="hidden print:block">
                                <div className="print-heading">Business Requirement Document (BRD)</div>
                                <div className="print-metadata">
                                    <div>
                                        <p className="font-bold">Project: {brd.projectName}</p>
                                        <p>Document ID: {brd.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p>Version: {brd.version}</p>
                                        <p>Date: {new Date(brd.updatedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                                        <p>Owner: {brd.createdBy}</p>
                                    </div>
                                </div>
                            </div>

                            {/* User Input Section */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 print:bg-white print:border-none print:p-0">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <FileText size={16} className="text-[#00A3E0]" /> Form Input
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Document Title</p>
                                            <p className="text-sm font-semibold text-slate-800">{brd.input.projectName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Build Type Mapping</p>
                                            <p className="text-sm font-semibold text-slate-800">{brd.input.sapModule || "N/A"}</p>
                                        </div>

                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Raw Business Requirement</p>
                                            <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">{brd.input.problemStatement}</p>
                                        </div>
                                        {brd.input.uploadedFiles && brd.input.uploadedFiles.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Attached Material</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {brd.input.uploadedFiles.map(f => (
                                                        <div key={f} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600">
                                                            <FileIcon size={12} className="text-purple-600" /> {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Generated Sections */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Check size={16} className="text-emerald-500" /> Generated BRD Content
                                </h3>
                                {SECTIONS.map((sec, i) => (
                                    <motion.div
                                        key={sec.key}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        <div className="flex items-center gap-2 mb-3 print-section-title">
                                            <span className="text-lg no-print">{sec.icon}</span>
                                            <h3 className="font-bold text-slate-900 text-sm tracking-tight">{sec.label}</h3>
                                            <div className="flex-1 h-px bg-slate-100 ml-2 no-print" />
                                        </div>
                                        <EditableSection
                                            value={sections[sec.key]}
                                            isLocked={isReadOnly}
                                            sectionKey={sec.key}
                                            onSave={v => handleSectionSave(sec.key, v)}
                                            onAddComment={(!isReadOnly || brd.status === "BRD Review") ? (key) => {
                                                setTab("comments");
                                                setCommentInput(`Regarding ${sec.label}: `);
                                            } : undefined}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* VERSION HISTORY TAB */}
                    {tab === "history" && (
                        <motion.div key="hist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6">
                            <div className="space-y-4">
                                {brd.versionHistory.slice().reverse().map((v, i) => (
                                    <div key={i} className="flex flex-col border border-slate-100 rounded-xl overflow-hidden mb-4 last:mb-0 transition-all hover:border-[#00338D]/20">
                                        <div className="flex gap-4 p-4 items-center cursor-pointer hover:bg-slate-50/50" onClick={() => setExpandedVersion(expandedVersion === v.version ? null : v.version)}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-[#00338D] text-white" : "bg-slate-100 text-slate-500"}`}>
                                                {v.version.replace("v", "")}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-sm">{v.version}</span>
                                                        {i === 0 && <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00338D]/10 text-[#00338D] rounded-md">Latest</span>}
                                                    </div>
                                                    <button className="text-slate-400 hover:text-slate-600">
                                                        {expandedVersion === v.version ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    {new Date(v.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })} · by {v.createdBy}
                                                </p>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedVersion === v.version && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-slate-100 bg-slate-50/30 overflow-hidden"
                                                >
                                                    <div className="p-4 space-y-4">
                                                        <div className="bg-white rounded-lg border border-slate-200 p-3">
                                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-2">
                                                                <Clock size={12} className="text-blue-500" /> Version Change Summary
                                                            </p>
                                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{v.changeSummary}</p>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-white rounded-lg border border-slate-200 p-3">
                                                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Form Input used</p>
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <p className="text-[9px] text-slate-400">Project Title</p>
                                                                        <p className="text-xs font-semibold text-slate-700">{v.input?.projectName || brd.projectName}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] text-slate-400">Build Type</p>
                                                                        <p className="text-xs font-semibold text-slate-700">{v.input?.sapModule || brd.input.sapModule || "N/A"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] text-slate-400">Raw Requirement</p>
                                                                        <p className="text-xs text-slate-600 line-clamp-3 italic">"{v.input?.problemStatement || brd.input.problemStatement}"</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-white rounded-lg border border-slate-200 p-3">
                                                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-3">Sections Snapshots</p>
                                                                <div className="space-y-2">
                                                                    {SECTIONS.slice(0, 4).map(sec => (
                                                                        <div key={sec.key} className="flex items-center gap-2">
                                                                            <span className="text-xs opacity-60">{sec.icon}</span>
                                                                            <span className="text-[11px] text-slate-500 flex-1 truncate">{sec.label}</span>
                                                                            <Check size={10} className="text-emerald-500" />
                                                                        </div>
                                                                    ))}
                                                                    <div className="pt-1 text-center">
                                                                        <p className="text-[10px] text-[#00338D] font-bold hover:underline cursor-pointer">
                                                                            View Full Snapshot
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* COMMENTS TAB */}
                    {tab === "comments" && (
                        <motion.div key="comments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 flex flex-col gap-4">
                            {brd.comments.length === 0 ? (
                                <div className="py-12 text-center">
                                    <MessageSquare size={32} className="text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm">No comments yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mb-4">
                                    {brd.comments.map(c => (
                                        <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-7 h-7 rounded-full bg-[#00338D] text-white text-xs font-bold flex items-center justify-center">
                                                    {c.author.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-slate-800 text-sm">{c.author}</span>
                                                <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded font-mono">{c.role}</span>
                                                {c.section && <span className="text-[10px] text-[#00338D] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">§ {c.section}</span>}
                                                <span className="ml-auto text-[11px] text-slate-400">{new Date(c.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{c.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Comment */}
                            {!brd.isLocked && (
                                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                    <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Add Comment</p>
                                    <textarea
                                        value={commentInput}
                                        onChange={e => setCommentInput(e.target.value)}
                                        rows={3}
                                        placeholder="Share your feedback or ask a question..."
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] outline-none resize-none bg-white"
                                    />
                                    <button
                                        onClick={submitComment}
                                        disabled={!commentInput.trim()}
                                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#00338D] hover:bg-[#00266e] disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition-all interactive"
                                    >
                                        <Send size={13} /> Post Comment
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Permanent Print-Only Container (Hidden on Screen) */}
            <div className="hidden print:block brd-print-container p-6 space-y-8">
                <div className="print-heading">Business Requirement Document (BRD)</div>
                <div className="print-metadata">
                    <div>
                        <p className="font-bold">Project: {brd.projectName}</p>
                        <p>Document ID: {brd.id}</p>
                    </div>
                    <div className="text-right">
                        <p>Version: {brd.version}</p>
                        <p>Date: {new Date(brd.updatedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                        <p>Owner: {brd.createdBy}</p>
                    </div>
                </div>

                {/* Form Input Section for Print */}
                <div className="space-y-4 mb-8">
                    <h3 className="print-section-title">Form Input</h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Document Title</p>
                            <p className="text-sm font-semibold">{brd.input.projectName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Build Type Mapping</p>
                            <p className="text-sm font-semibold">{brd.input.sapModule || "N/A"}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Raw Business Requirement</p>
                        <p className="print-content">{brd.input.problemStatement}</p>
                    </div>
                </div>

                {/* Generated Sections for Print */}
                <div className="space-y-8">
                    <h3 className="print-section-title">Generated BRD Content</h3>
                    {SECTIONS.map((sec) => (
                        <div key={sec.key} className="print-break-inside-avoid">
                            <h3 className="print-section-title" style={{ marginTop: '15pt' }}>{sec.label}</h3>
                            <pre className="print-content">{sections[sec.key]}</pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
