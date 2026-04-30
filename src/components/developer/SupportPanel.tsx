"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Brain, RefreshCw, BellRing, Activity, ShieldAlert, Zap, Clock, ChevronDown } from "lucide-react";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type IssueStatus = "incoming" | "diagnosing" | "fixing" | "resolved" | "escalated";

interface Issue {
    id: string; service: string; errorCode: string; message: string;
    stackTrace: string; severity: Severity; status: IssueStatus;
    timestamp: Date; thinking: string; fixApplied?: string;
    recommendation?: string; confidence?: number;
}

const MOCK_ISSUES = [
    { service: "Payment Gateway", errorCode: "ERR_CONNECTION_TIMEOUT", message: "DB connection pool exhausted after 30s", stackTrace: "at ConnectionPool.acquire() pool.js:142\nat PaymentService.process() payment.js:88", severity: "CRITICAL" as Severity },
    { service: "Auth Service", errorCode: "JWT_VERIFY_FAILED", message: "Token signature mismatch — key rotation issue", stackTrace: "at verify() jsonwebtoken/index.js:61\nat AuthMiddleware.check() auth.js:34", severity: "HIGH" as Severity },
    { service: "Notification Service", errorCode: "SMTP_503", message: "SMTP server unavailable — emails queued", stackTrace: "at SMTPTransport.send() nodemailer/smtp.js:201", severity: "MEDIUM" as Severity },
    { service: "Report Engine", errorCode: "HEAP_OOM", message: "Heap out of memory during PDF generation", stackTrace: "FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed", severity: "HIGH" as Severity },
    { service: "API Gateway", errorCode: "RATE_LIMIT_429", message: "1200 req/min threshold exceeded", stackTrace: "at RateLimiter.check() middleware/rate.js:77", severity: "LOW" as Severity },
];

const SEV: Record<Severity, { dot: string; badge: string }> = {
    CRITICAL: { dot: "bg-red-500",    badge: "text-red-400 bg-red-400/10 border-red-400/30" },
    HIGH:     { dot: "bg-orange-500", badge: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
    MEDIUM:   { dot: "bg-amber-500",  badge: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    LOW:      { dot: "bg-blue-500",   badge: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
};

function uid() { return "ISS-" + Math.random().toString(36).slice(2, 7).toUpperCase(); }

export default function SupportPanel({ dark }: { dark: boolean }) {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const processing = useRef(new Set<string>());

    const bg    = dark ? "#141414" : "#f7f7f7";
    const card  = dark ? "#1a1a1a" : "#ffffff";
    const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const text  = dark ? "#e8e8e8" : "#111111";
    const muted = dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)";

    const diagnose = useCallback(async (issue: Issue) => {
        if (processing.current.has(issue.id)) return;
        processing.current.add(issue.id);
        setIssues(p => p.map(x => x.id === issue.id ? { ...x, status: "diagnosing" } : x));
        await new Promise(r => setTimeout(r, 800));
        setIssues(p => p.map(x => x.id === issue.id ? { ...x, status: "fixing" } : x));
        try {
            const res = await fetch("/api/support/diagnose", {
                method: "POST", headers: { "Content-Type": "application/json" },
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
            const m = full.match(/\{[\s\S]*"canResolve"[\s\S]*\}/);
            if (m) {
                const r = JSON.parse(m[0]);
                const ok = r.canResolve && r.confidence >= 70;
                setIssues(p => p.map(x => x.id === issue.id ? { ...x, status: ok ? "resolved" : "escalated", confidence: r.confidence, fixApplied: r.fixApplied, recommendation: r.recommendation } : x));
            }
        } catch {
            setIssues(p => p.map(x => x.id === issue.id ? { ...x, status: "escalated", recommendation: "Agent error — investigate manually." } : x));
        }
        processing.current.delete(issue.id);
    }, []);

    useEffect(() => {
        let idx = 0;
        const add = () => {
            if (idx >= MOCK_ISSUES.length) return;
            const t = MOCK_ISSUES[idx++];
            const issue: Issue = { ...t, id: uid(), status: "incoming", timestamp: new Date(), thinking: "" };
            setIssues(p => [issue, ...p]);
            setTimeout(() => diagnose(issue), 1200);
            if (idx < MOCK_ISSUES.length) setTimeout(add, 6000);
        };
        setTimeout(add, 800);
    }, [diagnose]);

    const resolved = issues.filter(i => i.status === "resolved").length;
    const escalated = issues.filter(i => i.status === "escalated").length;
    const active = issues.filter(i => ["incoming","diagnosing","fixing"].includes(i.status)).length;

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: bg }}>
            {/* Stats bar */}
            <div className="shrink-0 flex items-center gap-6 px-5 py-3 border-b" style={{ borderColor: border }}>
                <div className="flex items-center gap-1.5"><Brain size={13} className="text-[#00338D]" /><span className="text-[12px] font-semibold" style={{ color: text }}>Production Support</span>{active > 0 && <span className="w-1.5 h-3 bg-red-400 animate-pulse rounded-[1px] ml-1 inline-block" />}</div>
                <div className="w-px h-4" style={{ background: border }} />
                {[
                    { label: "Total", value: issues.length, icon: Activity, c: muted },
                    { label: "Resolved", value: resolved, icon: CheckCircle2, c: "#34d399" },
                    { label: "Escalated", value: escalated, icon: BellRing, c: "#f87171" },
                    { label: "Active", value: active, icon: RefreshCw, c: "#60a5fa" },
                ].map(s => { const Icon = s.icon; return (
                    <div key={s.label} className="flex items-center gap-1.5">
                        <Icon size={12} style={{ color: s.c }} />
                        <span className="text-[11px] font-medium" style={{ color: muted }}>{s.label}</span>
                        <span className="text-[13px] font-bold" style={{ color: s.c }}>{s.value}</span>
                    </div>
                ); })}
            </div>

            {/* Escalation alerts */}
            <AnimatePresence>
                {issues.filter(i => i.status === "escalated").map(issue => (
                    <motion.div key={"e-" + issue.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mx-4 mt-3 flex items-start gap-3 rounded-xl p-3 border border-red-500/20 bg-red-500/5 shrink-0">
                        <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold text-red-400">Action Required — {issue.service}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: muted }}>{issue.recommendation}</p>
                        </div>
                        <span className="text-[10px] font-mono text-red-400/50 shrink-0 ml-auto">{issue.id}</span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Issue list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                <AnimatePresence>
                    {issues.map(issue => {
                        const sev = SEV[issue.severity];
                        const isOpen = expanded === issue.id;
                        const isWorking = ["diagnosing","fixing"].includes(issue.status);
                        return (
                            <motion.div key={issue.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl overflow-hidden border" style={{ background: card, borderColor: isOpen ? "#00338D55" : border }}>
                                <button onClick={() => setExpanded(isOpen ? null : issue.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${sev.dot} ${isWorking ? "animate-pulse" : ""}`} />
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${sev.badge}`}>{issue.severity}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold truncate" style={{ color: text }}>{issue.service} <span className="font-mono text-blue-400 text-[11px]">{issue.errorCode}</span></p>
                                        <p className="text-[11px] truncate mt-0.5" style={{ color: muted }}>{issue.message}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isWorking && <RefreshCw size={11} className="animate-spin text-blue-400" />}
                                        {issue.status === "resolved" && <CheckCircle2 size={12} className="text-emerald-400" />}
                                        {issue.status === "escalated" && <XCircle size={12} className="text-red-400" />}
                                        <span className="text-[10px] font-mono" style={{ color: muted }}>{issue.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        <ChevronDown size={12} style={{ color: muted }} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t" style={{ borderColor: border }}>
                                            <div className="p-4 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: muted }}>Stack Trace</p>
                                                    <pre className="text-[10px] bg-black/80 text-green-400 rounded-lg p-3 overflow-auto font-mono leading-relaxed whitespace-pre-wrap max-h-40">{issue.stackTrace}</pre>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1" style={{ color: muted }}>
                                                        <Brain size={10} /> Agent Analysis {isWorking && <RefreshCw size={9} className="animate-spin ml-1" />}
                                                    </p>
                                                    <div className="text-[10px] rounded-lg p-3 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-auto" style={{ background: dark ? "rgba(0,51,141,0.08)" : "rgba(0,51,141,0.04)", border: `1px solid rgba(0,51,141,0.15)`, color: muted }}>
                                                        {issue.thinking || <span className="italic opacity-50">Waiting for agent…</span>}
                                                    </div>
                                                    {issue.fixApplied && (
                                                        <div className={`mt-2 flex items-start gap-2 rounded-lg p-2.5 border ${issue.status === "resolved" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                                                            {issue.status === "resolved" ? <Zap size={11} className="text-emerald-400 shrink-0 mt-0.5" /> : <ShieldAlert size={11} className="text-red-400 shrink-0 mt-0.5" />}
                                                            <div>
                                                                <p className={`text-[11px] font-bold ${issue.status === "resolved" ? "text-emerald-400" : "text-red-400"}`}>{issue.status === "resolved" ? "Fix Applied" : "Could Not Resolve"}</p>
                                                                <p className="text-[10px] mt-0.5" style={{ color: muted }}>{issue.fixApplied}</p>
                                                                {issue.recommendation && <p className="text-[10px] mt-1" style={{ color: muted }}><span className="font-semibold">Rec:</span> {issue.recommendation}</p>}
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
                    <div className="flex flex-col items-center justify-center h-48" style={{ color: muted }}>
                        <Activity size={24} className="mb-2 opacity-30" />
                        <p className="text-sm">Monitoring production…</p>
                    </div>
                )}
            </div>
        </div>
    );
}
