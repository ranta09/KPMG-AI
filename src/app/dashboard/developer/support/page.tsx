"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, Brain, RefreshCw, BellRing, Activity, ShieldAlert, Zap, Clock, ChevronDown } from "lucide-react";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type IssueStatus = "incoming" | "diagnosing" | "fixing" | "resolved" | "escalated";

interface Issue {
    id: string;
    service: string;
    errorCode: string;
    message: string;
    stackTrace: string;
    severity: Severity;
    status: IssueStatus;
    timestamp: Date;
    thinking: string;
    fixApplied?: string;
    recommendation?: string;
    confidence?: number;
    resolvedAt?: Date;
}

const MOCK_ISSUES = [
    { service: "Payment Gateway", errorCode: "ERR_CONNECTION_TIMEOUT", message: "Database connection pool exhausted after 30s", stackTrace: "at ConnectionPool.acquire() pool.js:142\nat PaymentService.process() payment.js:88", severity: "CRITICAL" as Severity },
    { service: "Auth Service", errorCode: "JWT_VERIFY_FAILED", message: "Token signature verification failed — possible key rotation mismatch", stackTrace: "at verify() jsonwebtoken/index.js:61\nat AuthMiddleware.check() auth.js:34", severity: "HIGH" as Severity },
    { service: "Notification Service", errorCode: "SMTP_503", message: "SMTP server unavailable — emails queued", stackTrace: "at SMTPTransport.send() nodemailer/lib/smtp.js:201", severity: "MEDIUM" as Severity },
    { service: "Report Engine", errorCode: "HEAP_OOM", message: "JavaScript heap out of memory during PDF generation", stackTrace: "at PDFRenderer.render() pdf-engine.js:556\nFATAL ERROR: CALL_AND_RETRY_LAST Allocation failed", severity: "HIGH" as Severity },
    { service: "API Gateway", errorCode: "RATE_LIMIT_429", message: "Rate limiter tripped — 1200 req/min threshold exceeded", stackTrace: "at RateLimiter.check() middleware/rate.js:77", severity: "LOW" as Severity },
];

const SEV_CONFIG: Record<Severity, { color: string; bg: string; border: string; dot: string }> = {
    CRITICAL: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", dot: "bg-red-500" },
    HIGH:     { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", dot: "bg-orange-500" },
    MEDIUM:   { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", dot: "bg-amber-500" },
    LOW:      { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", dot: "bg-blue-500" },
};

const STATUS_LABEL: Record<IssueStatus, { label: string; color: string }> = {
    incoming:   { label: "Incoming", color: "text-slate-400" },
    diagnosing: { label: "Diagnosing…", color: "text-blue-400" },
    fixing:     { label: "Applying Fix…", color: "text-purple-400" },
    resolved:   { label: "Auto-Resolved", color: "text-emerald-400" },
    escalated:  { label: "Escalated", color: "text-red-400" },
};

function uid() { return "ISS-" + Math.random().toString(36).slice(2, 7).toUpperCase(); }

export default function SupportAgentPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, resolved: 0, escalated: 0 });
    const processing = useRef(new Set<string>());

    const diagnose = useCallback(async (issue: Issue) => {
        if (processing.current.has(issue.id)) return;
        processing.current.add(issue.id);

        setIssues(p => p.map(x => x.id === issue.id ? { ...x, status: "diagnosing" } : x));
        await new Promise(r => setTimeout(r, 800));
        setIssues(p => p.map(x => x.id === issue.id ? { ...x, status: "fixing" } : x));

        try {
            const res = await fetch("/api/support/diagnose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service: issue.service, errorCode: issue.errorCode, message: issue.message, stackTrace: issue.stackTrace }),
            });
            const reader = res.body!.getReader();
            const dec = new TextDecoder();
            let full = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                full += dec.decode(value);
                setIssues(p => p.map(x => x.id === issue.id ? { ...x, thinking: full } : x));
            }

            // Parse JSON block from end of response
            const jsonMatch = full.match(/\{[\s\S]*"canResolve"[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                const resolved = result.canResolve && result.confidence >= 70;
                setIssues(p => p.map(x => x.id === issue.id ? {
                    ...x,
                    status: resolved ? "resolved" : "escalated",
                    confidence: result.confidence,
                    fixApplied: result.fixApplied,
                    recommendation: result.recommendation,
                    resolvedAt: new Date(),
                } : x));
                setStats(s => ({ total: s.total, resolved: s.resolved + (resolved ? 1 : 0), escalated: s.escalated + (resolved ? 0 : 1) }));
            }
        } catch {
            setIssues(p => p.map(x => x.id === issue.id ? { ...x, status: "escalated", recommendation: "Agent encountered an error — please investigate manually." } : x));
        }
        processing.current.delete(issue.id);
    }, []);

    // Simulate incoming issues
    useEffect(() => {
        let idx = 0;
        const add = () => {
            if (idx >= MOCK_ISSUES.length) return;
            const template = MOCK_ISSUES[idx++];
            const newIssue: Issue = { ...template, id: uid(), status: "incoming", timestamp: new Date(), thinking: "" };
            setIssues(p => [newIssue, ...p]);
            setStats(s => ({ ...s, total: s.total + 1 }));
            setTimeout(() => diagnose(newIssue), 1200);
            if (idx < MOCK_ISSUES.length) setTimeout(add, 6000);
        };
        setTimeout(add, 1000);
    }, [diagnose]);

    const resolved = issues.filter(i => i.status === "resolved").length;
    const escalated = issues.filter(i => i.status === "escalated").length;
    const active = issues.filter(i => ["incoming","diagnosing","fixing"].includes(i.status)).length;

    return (
        <div className="py-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 mb-6 relative overflow-hidden shadow-sm">
                <div className="absolute right-0 top-0 h-full w-64 opacity-20 pointer-events-none">
                    <div className="grid grid-cols-8 gap-3 h-full p-6">
                        {Array.from({ length: 64 }).map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-red-400/60" />)}
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-[#00338D]" />
                    <span className="font-mono text-xs text-slate-500">support-agent@kpmg-prod ~</span>
                    {active > 0 && <span className="inline-block w-2 h-4 bg-red-500/70 animate-pulse ml-1 rounded-sm" />}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Production Support Agent</h1>
                <p className="text-sm text-slate-500">AI-powered issue detection · auto-resolution · smart escalation</p>
                <div className="flex gap-6 mt-6">
                    {[
                        { label: "Total Issues", value: issues.length, icon: Activity, color: "text-slate-700" },
                        { label: "Auto-Resolved", value: resolved, icon: CheckCircle2, color: "text-emerald-500" },
                        { label: "Escalated", value: escalated, icon: BellRing, color: "text-red-500" },
                        { label: "Active", value: active, icon: RefreshCw, color: "text-blue-500" },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="flex items-center gap-2">
                                <Icon size={15} className={s.color} />
                                <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                                <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Escalation Alerts */}
            <AnimatePresence>
                {issues.filter(i => i.status === "escalated").map(issue => (
                    <motion.div key={"esc-" + issue.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="mb-3 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                        <ShieldAlert size={18} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-700">Action Required — {issue.service}</p>
                            <p className="text-xs text-red-600 mt-0.5">{issue.message}</p>
                            <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Agent recommendation:</span> {issue.recommendation}</p>
                        </div>
                        <span className="ml-auto text-xs text-red-400 font-mono shrink-0">{issue.id}</span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Issue Feed */}
            <div className="space-y-3">
                <AnimatePresence>
                    {issues.map(issue => {
                        const sev = SEV_CONFIG[issue.severity];
                        const st = STATUS_LABEL[issue.status];
                        const isOpen = expanded === issue.id;
                        const isWorking = ["diagnosing","fixing"].includes(issue.status);
                        return (
                            <motion.div key={issue.id}
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${isOpen ? "border-[#00338D]/40" : "border-slate-200"}`}>
                                <button onClick={() => setExpanded(isOpen ? null : issue.id)}
                                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/50 transition-colors">
                                    {/* Severity dot */}
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sev.dot} ${isWorking ? "animate-pulse" : ""}`} />
                                    {/* Badge */}
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${sev.color} ${sev.bg} ${sev.border}`}>{issue.severity}</span>
                                    {/* Service + message */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{issue.service} <span className="font-mono text-[#00338D] ml-1">{issue.errorCode}</span></p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{issue.message}</p>
                                    </div>
                                    {/* Status */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {isWorking && <RefreshCw size={12} className="animate-spin text-blue-400" />}
                                        {issue.status === "resolved" && <CheckCircle2 size={13} className="text-emerald-500" />}
                                        {issue.status === "escalated" && <XCircle size={13} className="text-red-500" />}
                                        <span className={`text-xs font-bold ${st.color}`}>{st.label}</span>
                                        {issue.confidence !== undefined && (
                                            <span className="text-xs text-slate-400">{issue.confidence}% conf.</span>
                                        )}
                                        <Clock size={11} className="text-slate-300" />
                                        <span className="text-xs text-slate-400">{issue.timestamp.toLocaleTimeString()}</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </button>

                                {/* Expanded detail */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-slate-100">
                                            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                {/* Stack trace */}
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Stack Trace</p>
                                                    <pre className="text-xs bg-slate-950 text-green-400 rounded-lg p-3 overflow-auto font-mono leading-relaxed whitespace-pre-wrap">{issue.stackTrace}</pre>
                                                </div>
                                                {/* Agent thinking */}
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                                                        <Brain size={11} /> Agent Analysis
                                                        {isWorking && <RefreshCw size={10} className="animate-spin ml-1" />}
                                                    </p>
                                                    <div className="text-xs bg-[#00338D]/5 border border-[#00338D]/15 rounded-lg p-3 font-mono text-slate-700 min-h-[80px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-auto">
                                                        {issue.thinking || <span className="text-slate-400 italic">Waiting for agent…</span>}
                                                    </div>
                                                    {issue.fixApplied && (
                                                        <div className={`mt-3 flex items-start gap-2 rounded-lg p-3 ${issue.status === "resolved" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                                                            {issue.status === "resolved" ? <Zap size={13} className="text-emerald-600 mt-0.5 shrink-0" /> : <ShieldAlert size={13} className="text-red-500 mt-0.5 shrink-0" />}
                                                            <div>
                                                                <p className={`text-xs font-bold ${issue.status === "resolved" ? "text-emerald-700" : "text-red-700"}`}>
                                                                    {issue.status === "resolved" ? "Fix Applied" : "Could Not Resolve"}
                                                                </p>
                                                                <p className="text-xs text-slate-600 mt-0.5">{issue.fixApplied}</p>
                                                                {issue.recommendation && <p className="text-xs text-slate-500 mt-1"><span className="font-semibold">Recommendation:</span> {issue.recommendation}</p>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {issues.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <Activity size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Monitoring production… waiting for events</p>
                    </div>
                )}
            </div>
        </div>
    );
}
