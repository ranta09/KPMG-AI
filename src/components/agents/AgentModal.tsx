"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Download, Save, Check, Clock, FileText, Terminal, LayoutGrid } from "lucide-react";
import { AgentConfig, AgentTask, ExecutionRecord, EXECUTION_HISTORY } from "@/lib/agentStore";
import TaskQueue from "./TaskQueue";

interface AgentModalProps {
    agent: AgentConfig;
    tasks: AgentTask[];
    onClose: () => void;
    onCancelTask: (id: string) => void;
    onRetryTask: (id: string) => void;
    onAddTask: (agentId: string, title: string) => void;
}

type TabId = "overview" | "execution" | "history" | "logs";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", Icon: LayoutGrid },
    { id: "execution", label: "Execution", Icon: Play },
    { id: "history", label: "History", Icon: Clock },
    { id: "logs", label: "Logs", Icon: Terminal },
];

// Simulated output map per agent – chunked for streaming effect
const AGENT_OUTPUTS: Record<string, string[]> = {
    "requirement-analyst": [
        "🔍 Analyzing transcript...\n\n",
        "**STRUCTURED REQUIREMENT DOCUMENT**\n\n",
        "**Project:** PRJ-001 – Global ERP Rollout\n",
        "**Build Types Identified:** MM, SD, FI\n\n",
        "---\n\n",
        "**Business Objective:**\nStreamline procure-to-pay processes by leveraging SAP S/4HANA MM module with automated three-way matching.\n\n",
        "**Functional Requirements:**\n",
        "FR-001: System shall automatically match GR, PO, and Invoice within 24hrs.\n",
        "FR-002: Buyers must receive alerts for price variance > 5%.\n",
        "FR-003: Vendor portal integration required for real-time invoice status.\n\n",
        "**Non-Functional Requirements:**\n",
        "NFR-001: Processing time < 2 seconds per transaction.\n",
        "NFR-002: 99.9% uptime SLA required.\n\n",
        "**Risks:**\n",
        "⚠️ Incomplete GL account mapping from legacy system.\n",
        "⚠️ Vendor master data quality needs remediation prior to go-live.\n\n",
        "✅ **3 clarification questions generated for stakeholder review.**",
    ],
    "brd-generator": [
        "📄 Compiling Business Requirement Document...\n\n",
        "**BRD v2.0 — Global ERP Rollout**\n",
        "*Generated: March 4, 2026*\n\n",
        "---\n\n",
        "**1. EXECUTIVE SUMMARY**\nThis BRD defines the scope and requirements for implementing SAP S/4HANA to replace the legacy Oracle ERP system across 12 global business units.\n\n",
        "**2. SCOPE**\nIn Scope: Modules MM, SD, FI, CO. Out of Scope: HR, Payroll, Legacy Archive.\n\n",
        "**3. BUSINESS PROCESS FLOW**\nProcure-to-Pay → Order-to-Cash → Record-to-Report\n\n",
        "**4. BUILD TYPE MAPPING**\n- MM: Material Management & Procurement\n- SD: Sales & Distribution\n- FI/CO: Financial Accounting & Controlling\n\n",
        "**5. ACCEPTANCE CRITERIA**\nAll FR and NFR items verified in UAT.\nSign-off required from: Finance Lead, IT Lead, Business Owner.\n\n",
        "✅ **BRD generated — 48 pages. Ready for stakeholder review.**",
    ],
    "solution-architect": [
        "🏗️ Designing SAP Architecture Blueprint...\n\n",
        "**ARCHITECTURE OVERVIEW**\nS/4HANA On-Premise 2023 | 3-Tier: DEV → QAS → PRD\n\n",
        "**SYSTEM LANDSCAPE**\n```\nDEV (SID: D01) → QAS (SID: Q01) → PRD (SID: P01)\nClient: 100 | DB: HANA | OS: SLES 15\n```\n\n",
        "**INTEGRATION ARCHITECTURE**\nMiddleware: SAP Cloud Platform Integration (CPI)\nEndpoints: REST APIs + SOAP for legacy\nAuthentication: OAuth 2.0 + Basic Auth fallback\n\n",
        "**DATA FLOW**\nExternal Systems → CPI → S/4HANA Core\nBatch Jobs: Midnight delta loads via RFC\nReal-time: IDoc / Webhook triggers\n\n",
        "**SECURITY DESIGN**\nRole-based Authorization Objects\nSOD controls enforced at BASIS level\nEncryption: TLS 1.3 end-to-end\n\n",
        "✅ **Architecture blueprint v1.0 finalized. 6 components documented.**",
    ],
    "code-builder": [
        "💻 Generating SAP ABAP Code...\n\n",
        "```abap\nREPORT z_mm_grir_clearing.\n\n",
        "DATA: lt_ekpo TYPE TABLE OF ekpo,\n      ls_ekpo TYPE ekpo.\n\n",
        "START-OF-SELECTION.\n  SELECT * FROM ekpo INTO TABLE lt_ekpo\n    WHERE werks = '1000'\n      AND elikz = space.\n\n",
        "  LOOP AT lt_ekpo INTO ls_ekpo.\n    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'\n      EXPORTING\n        goodsmvt_header = VALUE #( pstng_date = sy-datum )\n      TABLES\n        goodsmvt_item = VALUE #( ( matnr = ls_ekpo-matnr ) ).\n  ENDLOOP.\n\n",
        "  WRITE: / 'GR/IR Clearing completed for plant 1000'.\n```\n\n",
        "✅ **ABAP report generated. Lines: 42. Complexity: Medium. Downloadable.**",
    ],
    "test-orchestrator": [
        "🧪 Generating Test Plan...\n\n",
        "**SAP TEST PLAN v1.0**\n\n",
        "**Unit Tests (12 cases):**\n",
        "UT-001: Verify PO creation with all mandatory fields\n",
        "UT-002: Test GR posting against PO\n",
        "UT-003: Validate invoice matching tolerance\n\n",
        "**Integration Tests (8 cases):**\n",
        "IT-001: End-to-end P2P flow – Requisition to Payment\n",
        "IT-002: SD to FI integration – Revenue postings\n\n",
        "**UAT Scripts (5 scenarios):**\n",
        "UAT-001: Business user creates and approves purchase requisition\n",
        "UAT-002: AP team processes vendor invoice\n\n",
        "✅ **25 test cases generated. Export ready.**",
    ],
    "security-reviewer": [
        "🔒 Running Security Analysis...\n\n",
        "**SECURITY REVIEW REPORT**\n\n",
        "**Risk Level: HIGH**\n\n",
        "**Finding 1 — CRITICAL:**\n",
        "Authorization object M_BEST_BSA not properly restricted.\nUsers in role ZMM_BUYER can post goods receipts without Purchase Order reference.\n",
        "→ **Fix:** Add restriction to movement type 101 only.\n\n",
        "**Finding 2 — HIGH:**\n",
        "SoD Conflict detected: User JSMITH has both FB60 (Invoice Entry) and F-53 (Payment) access.\n",
        "→ **Fix:** Split roles. Assign F-53 to Finance Approver role only.\n\n",
        "**Finding 3 — MEDIUM:**\n",
        "S_TCODE unrestricted in test role ZXX_TEST — not deactivated in production.\n\n",
        "✅ **3 findings reported. Compliance checklist generated.**",
    ],
    "deployment-manager": [
        "🚀 Generating Deployment Plan...\n\n",
        "**TRANSPORT REQUEST LOG**\n",
        "DEVK900123 → Approved for QAS\nDEVK900124 → Pending dependencies\nDEVK900125 → QAS validated ✅\n\n",
        "**DEPLOYMENT CHECKLIST:**\n",
        "☑ System backup verified (PRD)\n",
        "☑ Transport dependencies resolved\n",
        "☑ Down-time window confirmed: 02:00–04:00 AEST\n",
        "☐ Stakeholder sign-off pending\n",
        "☐ Basis team on standby\n\n",
        "**ROLLBACK PLAN:**\nIf critical failure occurs: Restore DB from 01:00 snapshot.\nRFC connections to be re-validated post-import.\n\n",
        "✅ **Deployment plan ready. 4 transports queued for PRD.**",
    ],
    "stakeholder-communicator": [
        "📢 Generating Stakeholder Report...\n\n",
        "**WEEKLY STATUS REPORT — Week 9, 2026**\n",
        "*Tone: Executive | Project: PRJ-001*\n\n",
        "---\n\n",
        "**SUMMARY**\nThe Global ERP Rollout progressed well this week. The requirements analysis phase is 85% complete with BRD v1.0 approved by the business steering committee.\n\n",
        "**RAG STATUS: 🟡 AMBER**\nReason: Vendor master data cleansing activity is behind schedule by 5 days.\n\n",
        "**KEY MILESTONES:**\n✅ BRD v1.0 signed off\n✅ Architecture blueprint approved\n🔄 Data migration strategy in progress\n\n",
        "**RISKS:**\n⚠️ Data quality risk – mitigation: dedicated data sprint week 10.\n\n",
        "✅ **Executive report generated. Ready to distribute to steering committee.**",
    ],
};

const AGENT_LOGS: Record<string, string[]> = {
    "requirement-analyst": [
        "[2026-03-04T06:12:01Z] [INFO]  Agent initialized. Project context loaded: PRJ-001",
        "[2026-03-04T06:12:02Z] [INFO]  NLP pipeline started. Model: gpt-4-turbo-preview",
        "[2026-03-04T06:12:05Z] [INFO]  Transcript received. Length: 4,280 tokens",
        "[2026-03-04T06:12:06Z] [INFO]  Extracting functional requirements...",
        "[2026-03-04T06:12:09Z] [INFO]  Build type classifier running...",
        "[2026-03-04T06:12:11Z] [WARN]  Ambiguous requirement detected at line 42. Flagged for clarification.",
        "[2026-03-04T06:12:14Z] [INFO]  24 requirements extracted. 3 clarifications queued.",
        "[2026-03-04T06:12:15Z] [SUCCESS] Document generation complete.",
    ],
    "code-builder": [
        "[2026-03-04T04:30:00Z] [INFO]  Code Builder agent activated. Queue: 5 tasks",
        "[2026-03-04T04:30:01Z] [INFO]  Loading ABAP syntax model v3.2",
        "[2026-03-04T04:30:03Z] [INFO]  Context pulled from BRD v1.0 and functional spec.",
        "[2026-03-04T04:31:10Z] [INFO]  Generating: z_mm_grir_clearing.abap",
        "[2026-03-04T04:31:42Z] [WARN]  Authorization check missing in CALL FUNCTION. Auto-added.",
        "[2026-03-04T04:31:55Z] [INFO]  Code review passed. 42 lines. Complexity: Medium.",
        "[2026-03-04T04:32:00Z] [SUCCESS] File z_mm_grir_clearing.abap ready for download.",
    ],
};

export default function AgentModal({ agent, tasks, onClose, onCancelTask, onRetryTask, onAddTask }: AgentModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [input, setInput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [outputChunks, setOutputChunks] = useState<string[]>([]);
    const [isDone, setIsDone] = useState(false);
    const [history] = useState<ExecutionRecord[]>(EXECUTION_HISTORY[agent.id] || []);
    const [mounted, setMounted] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const logs = AGENT_LOGS[agent.id] || [
        `[2026-03-04T08:00:00Z] [INFO]  Agent ${agent.name} initialized.`,
        `[2026-03-04T08:00:01Z] [INFO]  Status: ${agent.status}`,
        `[2026-03-04T08:00:02Z] [INFO]  Project context: ${agent.projectContext}`,
        `[2026-03-04T08:00:03Z] [INFO]  Awaiting task assignment.`,
    ];

    // Stream output chunks
    const handleExecute = async () => {
        if (!input.trim()) return;
        setIsExecuting(true);
        setOutputChunks([]);
        setIsDone(false);
        setActiveTab("execution");

        const chunks = AGENT_OUTPUTS[agent.id] || ["✅ Task executed successfully."];

        // Add a task to the queue
        onAddTask(agent.id, input.slice(0, 60) + (input.length > 60 ? "..." : ""));
        setInput("");

        for (const chunk of chunks) {
            await new Promise(res => setTimeout(res, 120 + Math.random() * 200));
            setOutputChunks(prev => [...prev, chunk]);
        }

        setIsExecuting(false);
        setIsDone(true);
    };

    // Auto-scroll output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [outputChunks]);

    const statusColors: Record<string, string> = { Active: "text-emerald-600", Idle: "text-amber-600", Offline: "text-slate-500" };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-[#00338D] text-white flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                {agent.shortName}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">{agent.name}</h2>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span className={`text-xs font-semibold ${statusColors[agent.status] || "text-white"} bg-white/10 px-2 py-0.5 rounded-md`}>
                                        ● {agent.status}
                                    </span>
                                    <span className="text-xs text-blue-200 font-mono">{agent.projectContext}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors interactive">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 px-6 bg-slate-50 flex-shrink-0">
                        {TABS.map(tab => {
                            const Icon = tab.Icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all interactive ${activeTab === tab.id
                                        ? "border-[#00338D] text-[#00338D]"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <Icon size={15} />
                                    {tab.label}
                                    {tab.id === "execution" && tasks.filter(t => t.status === "running" || t.status === "queued").length > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-[#00338D] text-white text-[10px] font-bold flex items-center justify-center">
                                            {tasks.filter(t => t.status === "running" || t.status === "queued").length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* OVERVIEW */}
                        {activeTab === "overview" && (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <LayoutGrid size={15} className="text-[#00338D]" /> Purpose
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">{agent.purpose}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3">Capabilities</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {agent.capabilities.map((cap, i) => (
                                            <div key={i} className="flex items-start gap-2 p-3 bg-white border border-slate-200 rounded-lg">
                                                <Check size={14} className="text-[#00338D] mt-0.5 flex-shrink-0" />
                                                <span className="text-xs text-slate-600">{cap}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {agent.buildTypes && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-3">Build Types</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.buildTypes.map(mod => (
                                                <span key={mod} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#00338D]/8 text-[#00338D] border border-[#00338D]/15 tracking-wider">
                                                    {mod}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <p className="text-xs font-bold text-[#00338D] mb-1">Output Artifact</p>
                                    <p className="text-sm text-slate-700 flex items-center gap-2">
                                        <FileText size={14} className="text-[#00338D]" />
                                        {agent.outputLabel}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* EXECUTION */}
                        {activeTab === "execution" && (
                            <div className="p-6 space-y-5">
                                {/* Input Form */}
                                {!isExecuting && !isDone && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">{agent.inputLabel}</label>
                                        <textarea
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            rows={5}
                                            placeholder={agent.inputPlaceholder}
                                            className="w-full p-4 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none resize-none bg-slate-50 transition-all"
                                        />
                                        <div className="flex gap-3 mt-3">
                                            <button
                                                onClick={handleExecute}
                                                disabled={!input.trim()}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-[#00338D] hover:bg-[#00266e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-md interactive"
                                            >
                                                <Play size={15} /> Run Agent
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Streaming Output */}
                                {(outputChunks.length > 0 || isExecuting) && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Terminal size={15} className="text-[#00338D]" /> Output
                                                {isExecuting && <span className="text-xs text-amber-600 font-medium animate-pulse">● Generating...</span>}
                                                {isDone && <span className="text-xs text-emerald-600 font-medium">✅ Complete</span>}
                                            </h3>
                                            {isDone && (
                                                <div className="flex gap-2">
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 interactive">
                                                        <Download size={13} /> Download
                                                    </button>
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#00338D] rounded-lg hover:bg-[#00266e] interactive">
                                                        <Save size={13} /> Save to Project
                                                    </button>
                                                    <button
                                                        onClick={() => { setOutputChunks([]); setIsDone(false); }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 interactive"
                                                    >
                                                        New Run
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            ref={outputRef}
                                            className="bg-slate-900 text-slate-100 rounded-xl p-5 text-xs font-mono leading-relaxed h-72 overflow-y-auto whitespace-pre-wrap"
                                        >
                                            {outputChunks.join("")}
                                            {isExecuting && <span className="inline-block w-2 h-4 bg-slate-100 animate-pulse ml-0.5 align-middle" />}
                                        </div>
                                    </div>
                                )}

                                {/* Task Queue */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-4">Task Queue</h3>
                                    <TaskQueue tasks={tasks.filter(t => t.agentId === agent.id)} onCancel={onCancelTask} onRetry={onRetryTask} />
                                </div>
                            </div>
                        )}

                        {/* HISTORY */}
                        {activeTab === "history" && (
                            <div className="p-6">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-2xl">📋</div>
                                        <p className="text-slate-500 font-medium text-sm">No execution history yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {history.map((record, i) => (
                                            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs font-mono text-slate-400">{new Date(record.triggeredAt).toLocaleString("en-IN")}</p>
                                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{record.input}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${record.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{record.output}</p>
                                                <p className="text-[11px] text-slate-400 mt-2 font-mono">Duration: {record.duration}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LOGS */}
                        {activeTab === "logs" && (
                            <div className="p-6">
                                <div className="bg-slate-900 rounded-xl p-5 font-mono text-xs space-y-1.5 overflow-y-auto max-h-[60vh]">
                                    {logs.map((line, i) => {
                                        const isWarn = line.includes("[WARN]");
                                        const isError = line.includes("[ERROR]");
                                        const isSuccess = line.includes("[SUCCESS]");
                                        return (
                                            <div key={i} className={`${isWarn ? "text-amber-300" : isError ? "text-red-400" : isSuccess ? "text-emerald-400" : "text-slate-300"}`}>
                                                {line}
                                            </div>
                                        );
                                    })}
                                    <div className="text-slate-600 animate-pulse mt-2">▌</div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
