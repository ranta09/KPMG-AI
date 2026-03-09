"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
    Sparkles, CheckCircle, Loader2, ChevronDown, Monitor, Bot,
    Globe, Zap, GitBranch, BarChart2, Cpu, Play, ChevronRight
} from "lucide-react";
import { useBRDStore } from "@/lib/brdStore";
import {
    BuildType, BuildCustomization, BuildRecord, generateArtifact,
    ORCHESTRATION_STEPS,
} from "@/lib/buildStore";

type Stage = "configure" | "orchestrating" | "done";

interface BuildOrchestratorProps {
    onComplete: (record: BuildRecord) => void;
}

const BUILD_TYPES: { type: BuildType; icon: React.ElementType; desc: string }[] = [
    { type: "Web Application", icon: Globe, desc: "React/Next.js web app" },
    { type: "SAP Fiori App", icon: Monitor, desc: "SAPUI5 Fiori Elements" },
    { type: "REST API", icon: GitBranch, desc: "Node.js + OpenAPI" },
    { type: "Automation Bot", icon: Bot, desc: "Python RPA bot" },
    { type: "Integration Workflow", icon: Zap, desc: "SAP CPI iFlow" },
    { type: "Data Dashboard", icon: BarChart2, desc: "SAP Analytics Cloud" },
    { type: "RPA Bot", icon: Cpu, desc: "UiPath RPA bot" },
];

const AGENT_COLORS: Record<string, string> = {
    "BRD Generator": "bg-purple-500",
    "Solution Architect": "bg-[#00338D]",
    "Code Builder": "bg-emerald-600",
    "Test Orchestrator": "bg-amber-500",
};

const DB_TYPES = ["PostgreSQL", "MySQL", "SAP HANA", "MongoDB", "Azure SQL", "Oracle"];
const AUTH_TYPES = ["OAuth 2.0 (Azure AD)", "SAP SSO", "JWT + API Key", "SAML 2.0", "Basic Auth"];
const INTEGRATIONS = ["SAP S/4HANA", "SAP MM", "SAP SD", "SAP FI/CO", "MS Teams", "SharePoint", "Outlook"];

export default function BuildOrchestrator({ onComplete }: BuildOrchestratorProps) {
    const { brds } = useBRDStore();
    const approvedBRDs = brds.filter(b => b.status === "Approved");
    const [stage, setStage] = useState<Stage>("configure");
    const [selectedBRDId, setSelectedBRDId] = useState(approvedBRDs[0]?.id ?? "");
    const [selectedType, setSelectedType] = useState<BuildType>("Web Application");
    const [currentStep, setCurrentStep] = useState(-1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [customization, setCustomization] = useState<BuildCustomization>({
        appName: "",
        themeColor: "#00338D",
        dbType: "PostgreSQL",
        authType: "OAuth 2.0 (Azure AD)",
        integrations: ["SAP S/4HANA"],
    });
    const logsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }, [logs]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toISOString()}] ${msg}`]);

    const handleGenerate = async () => {
        const brd = brds.find(b => b.id === selectedBRDId);
        if (!brd) return;

        setStage("orchestrating");
        setCurrentStep(0);
        setCompletedSteps([]);
        setLogs([]);

        addLog(`Starting Build Orchestration for "${brd.projectName}"`);
        addLog(`Build Type: ${selectedType}`);
        addLog(`Assigned to: 5-Agent Pipeline`);

        for (let i = 0; i < ORCHESTRATION_STEPS.length; i++) {
            const step = ORCHESTRATION_STEPS[i];
            setCurrentStep(i);
            addLog(`[AGENT:${step.agent}] ${step.description}`);
            await new Promise(r => setTimeout(r, step.duration));
            setCompletedSteps(prev => [...prev, i]);
            addLog(`[AGENT:${step.agent}] ✅ Step complete.`);
        }

        addLog("All agents completed. Compiling output artifacts...");
        await new Promise(r => setTimeout(r, 600));
        addLog("✅ Build generation complete!");

        const artifact = generateArtifact(selectedType, brd.projectName, customization);
        const now = new Date().toISOString();

        const record: BuildRecord = {
            id: `BUILD-${String(Math.floor(Math.random() * 900) + 100)}`,
            brdId: brd.id,
            brdTitle: brd.projectName,
            buildType: selectedType,
            version: "v1.0",
            status: "Under Technical Review",
            createdAt: now,
            updatedAt: now,
            customization: { ...customization, appName: customization.appName || brd.projectName },
            artifact,
            logs,
        };

        setStage("done");
        await new Promise(r => setTimeout(r, 400));
        onComplete(record);
    };

    const toggleIntegration = (integ: string) => {
        setCustomization(prev => ({
            ...prev,
            integrations: prev.integrations.includes(integ)
                ? prev.integrations.filter(i => i !== integ)
                : [...prev.integrations, integ],
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Configuration */}
            <div className="space-y-5">
                {/* BRD Selection */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00338D] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                        Select Approved BRD
                    </h3>
                    {approvedBRDs.length === 0 ? (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
                            ⚠️ No approved BRDs found. Please approve a BRD from the BRD Management section first.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {approvedBRDs.map(brd => (
                                <label key={brd.id}
                                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all interactive ${selectedBRDId === brd.id ? "border-[#00338D] bg-[#00338D]/5" : "border-slate-200 hover:border-[#00338D]/40"}`}>
                                    <input type="radio" name="brd" value={brd.id} checked={selectedBRDId === brd.id}
                                        onChange={() => setSelectedBRDId(brd.id)} className="hidden" />
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedBRDId === brd.id ? "border-[#00338D] bg-[#00338D]" : "border-slate-300"}`}>
                                        {selectedBRDId === brd.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800">{brd.projectName}</p>
                                        <p className="text-[11px] text-slate-400 font-mono">{brd.id} · {brd.version} · <span className="text-emerald-600 font-bold">Approved</span></p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Build Type */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00338D] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                        Select Build Type
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {BUILD_TYPES.map(({ type, icon: Icon, desc }) => (
                            <button key={type} onClick={() => setSelectedType(type)}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all interactive ${selectedType === type ? "border-[#00338D] bg-[#00338D]/5" : "border-slate-200 hover:border-[#00338D]/30"}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedType === type ? "bg-[#00338D] text-white" : "bg-slate-100 text-slate-500"}`}>
                                    <Icon size={15} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold ${selectedType === type ? "text-[#00338D]" : "text-slate-700"}`}>{type}</p>
                                    <p className="text-[10px] text-slate-400">{desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customization */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00338D] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                        Customisation <span className="text-xs font-normal text-slate-400">(optional)</span>
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Application Name</label>
                            <input value={customization.appName} onChange={e => setCustomization(p => ({ ...p, appName: e.target.value }))}
                                placeholder="Leave blank to use BRD project name"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Database</label>
                                <select value={customization.dbType} onChange={e => setCustomization(p => ({ ...p, dbType: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] outline-none">
                                    {DB_TYPES.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Authentication</label>
                                <select value={customization.authType} onChange={e => setCustomization(p => ({ ...p, authType: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] outline-none">
                                    {AUTH_TYPES.map(a => <option key={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Integrations</label>
                            <div className="flex flex-wrap gap-1.5">
                                {INTEGRATIONS.map(integ => (
                                    <button key={integ} onClick={() => toggleIntegration(integ)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all interactive ${customization.integrations.includes(integ) ? "bg-[#00338D] text-white border-[#00338D]" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#00338D]/40"}`}>
                                        {integ}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button onClick={handleGenerate} disabled={!selectedBRDId || stage !== "configure"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#00338D] hover:bg-[#00266e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md interactive text-sm">
                    <Sparkles size={16} /> Generate Solution <ChevronRight size={15} />
                </button>
            </div>

            {/* Right: Orchestration Progress */}
            <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Play size={15} className="text-[#00338D]" /> Agent Orchestration Pipeline
                    </h3>

                    <div className="space-y-3">
                        {ORCHESTRATION_STEPS.map((step, i) => {
                            const isDone = completedSteps.includes(i);
                            const isRunning = currentStep === i && stage === "orchestrating";
                            const isPending = stage === "configure" || (!isDone && !isRunning);

                            return (
                                <motion.div key={step.id}
                                    animate={{ opacity: isPending && stage === "orchestrating" ? 0.4 : 1 }}
                                    className="flex items-start gap-3">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isDone ? "bg-emerald-100" : isRunning ? "bg-[#00338D]/10" : "bg-slate-100"}`}>
                                        {isDone ? <CheckCircle size={14} className="text-emerald-600" />
                                            : isRunning ? <Loader2 size={14} className="text-[#00338D] animate-spin" />
                                                : <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-xs font-bold ${isDone ? "text-emerald-600" : isRunning ? "text-[#00338D]" : "text-slate-500"}`}>{step.label}</p>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${AGENT_COLORS[step.agent]} text-white`}>{step.agent}</span>
                                        </div>
                                        {isRunning && <p className="text-[11px] text-slate-400 mt-0.5 animate-pulse">{step.description}</p>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {stage === "done" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-600" />
                            <p className="text-xs font-bold text-emerald-700">All agents completed. Solution workspace ready!</p>
                        </motion.div>
                    )}
                </div>

                {/* Live Logs */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Cpu size={15} className="text-[#00338D]" /> Live Agent Logs
                    </h3>
                    <div ref={logsRef}
                        className="bg-slate-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] space-y-1">
                        {logs.length === 0 ? (
                            <p className="text-slate-600">Awaiting orchestration start...</p>
                        ) : logs.map((log, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={`${log.includes("✅") ? "text-emerald-400" : log.includes("AGENT:") ? "text-blue-300" : "text-slate-400"}`}>
                                {log}
                            </motion.div>
                        ))}
                        {stage === "orchestrating" && <div className="text-slate-500 animate-pulse">▌</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
