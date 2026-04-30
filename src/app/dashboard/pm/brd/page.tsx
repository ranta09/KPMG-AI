"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Eye, FileText, Clock, CheckCircle, AlertCircle, RotateCcw, Archive, Loader2, Filter, ChevronDown, ChevronRight, Trash2, Code, TrendingUp, Users, Rocket, GitBranch, Calendar, ArrowRight, CornerDownRight } from "lucide-react";
import Link from "next/link";
import { getLoggedInUser } from "@/lib/auth";
import { BRDRecord, BRDStatus, useBRDStore } from "@/lib/brdStore";
import BRDCreateModal from "@/components/brd/BRDCreateModal";

const STATUS_CONFIG: Record<BRDStatus, { bg: string; text: string; border: string; dot: string; Icon: React.ElementType }> = {
    "Generating BRD": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", Icon: Loader2 },
    "BRD Generated": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle },
    "BRD Review": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500", Icon: Clock },
    "Changes Requested": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500", Icon: AlertCircle },
    "Approved": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-600", Icon: CheckCircle },
    "Development": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500", Icon: Code },
    "UAT": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500", Icon: AlertCircle },
    "Production": { bg: "bg-[#00338D]/10", text: "text-[#00338D]", border: "border-[#00338D]/20", dot: "bg-[#00338D]", Icon: Rocket },
    "Archived": { bg: "bg-slate-50", text: "text-slate-400", border: "border-slate-200", dot: "bg-slate-400", Icon: Archive },
};

const STATUS_PROGRESS: Record<BRDStatus, number> = {
    "Generating BRD": 10,
    "BRD Generated": 25,
    "BRD Review": 40,
    "Changes Requested": 40,
    "Approved": 60,
    "Development": 75,
    "UAT": 88,
    "Production": 100,
    "Archived": 100,
};

const ALL_STATUSES: BRDStatus[] = ["Generating BRD", "BRD Generated", "BRD Review", "Changes Requested", "Approved", "Development", "UAT", "Production", "Archived"];

export default function BRDManagementPage() {
    const { brds, addBRD, deleteBRD, updateBRDStatus } = useBRDStore();
    const user = getLoggedInUser();
    const isProgramManager = user?.role === "program-manager";
    const [showCreate, setShowCreate] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [statusFilter, setStatusFilter] = useState<BRDStatus | "All">("All");
    const [search, setSearch] = useState("");
    const [brdToDelete, setBrdToDelete] = useState<{ id: string; version?: string } | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => { setIsClient(true); }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("new") === "true") setShowCreate(true);
        }
    }, []);

    useEffect(() => {
        const generatingIds = brds.filter(b => b.status === "Generating BRD").map(b => b.id);
        if (generatingIds.length === 0) return;
        const timer = setTimeout(() => {
            generatingIds.forEach(id => updateBRDStatus(id, "BRD Generated"));
        }, 3000);
        return () => clearTimeout(timer);
    }, [brds, updateBRDStatus]);

    const handleCreated = (brd: BRDRecord) => {
        addBRD(brd);
        setShowCreate(false);
    };

    if (!isClient) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <Loader2 size={32} className="text-[#00338D] animate-spin" />
        </div>
    );

    const filtered = brds.filter(b => {
        const matchStatus = statusFilter === "All" || b.status === statusFilter;
        const matchSearch = b.projectName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    // Stats
    const stats = {
        total: brds.length,
        inReview: brds.filter(b => b.status === "BRD Review").length,
        approved: brds.filter(b => b.status === "Approved").length,
        inDev: brds.filter(b => b.status === "Development").length,
        production: brds.filter(b => b.status === "Production").length,
    };

    return (
        <div className="py-6 max-w-7xl mx-auto space-y-6">

            {/* Hero Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-[#00338D] to-[#001f5c] rounded-2xl p-8 text-white overflow-hidden shadow-xl shadow-[#00338D]/20">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute right-24 bottom-0 w-48 h-48 bg-[#00A3E0] rounded-full translate-y-1/2" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                <FileText size={16} className="text-white" />
                            </div>
                            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Program Manager Portal</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">BRD Generator</h1>
                        <p className="text-white/60 text-sm">AI-powered requirements gathering, review and approval platform</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#00338D] hover:bg-white/90 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl flex-shrink-0 group">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
                        Create New BRD
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: "Total BRDs", value: stats.total, icon: FileText, color: "text-[#00338D]", bg: "bg-[#00338D]/5", border: "border-[#00338D]/10" },
                    { label: "In Review", value: stats.inReview, icon: Clock, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
                    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { label: "In Development", value: stats.inDev, icon: Code, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                    { label: "In Production", value: stats.production, icon: Rocket, color: "text-[#00338D]", bg: "bg-[#00338D]/5", border: "border-[#00338D]/10" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
                        className={`bg-white border ${stat.border} rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <stat.icon size={18} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by project name or BRD ID..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white shadow-sm" />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as BRDStatus | "All")}
                        className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-[#00338D]/50 transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-[#00338D] outline-none shadow-sm">
                        <option value="All">All Statuses</option>
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {/* View toggle */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    {(["grid", "list"] as const).map(mode => (
                        <button key={mode} onClick={() => setViewMode(mode)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? "bg-white text-[#00338D] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                            {mode === "grid" ? "Cards" : "Table"}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-slate-400 font-medium ml-auto">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</span>
            </motion.div>

            {/* BRD Grid */}
            {viewMode === "grid" ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filtered.length === 0 ? (
                            <motion.div className="col-span-3 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText size={28} className="text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-semibold">No BRDs match your filters</p>
                                <p className="text-slate-400 text-sm mt-1">Try adjusting the search or status filter</p>
                            </motion.div>
                        ) : filtered.map((brd, i) => {
                            const sc = STATUS_CONFIG[brd.status as BRDStatus] || STATUS_CONFIG["Archived"];
                            const StatusIcon = sc.Icon;
                            const progress = STATUS_PROGRESS[brd.status as BRDStatus] || 0;
                            const canDelete = isProgramManager && ["Generating BRD", "BRD Generated"].includes(brd.status);

                            return (
                                <motion.div key={brd.id}
                                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-[#00338D]/20 transition-all group flex flex-col gap-4">

                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-[11px] text-[#00338D] font-bold mb-1">{brd.id}</p>
                                            <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{brd.projectName}</h3>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border flex-shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                                            <StatusIcon size={10} className={brd.status === "Generating BRD" ? "animate-spin" : ""} />
                                            {brd.status}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progress</span>
                                            <span className="text-[10px] font-bold text-slate-600">{progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: i * 0.04 + 0.2, duration: 0.6, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-[#00338D] to-[#00A3E0] rounded-full" />
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-50 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Version</p>
                                            <p className="text-xs font-bold text-slate-700 font-mono">{brd.version}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Updated</p>
                                            <p className="text-xs font-bold text-slate-700">{new Date(brd.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                                        </div>
                                    </div>

                                    {/* Versions pill */}
                                    {brd.versionHistory?.length > 1 && (
                                        <div className="flex items-center gap-1.5">
                                            <GitBranch size={11} className="text-slate-400" />
                                            <span className="text-[10px] text-slate-500 font-medium">{brd.versionHistory.length} versions</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
                                        <Link href={`/dashboard/pm/brd/${brd.id}`} className="flex-1">
                                            <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00338D] text-white text-xs font-bold rounded-lg hover:bg-[#001f5c] transition-colors group-hover:shadow-md shadow-[#00338D]/10">
                                                Open BRD <ArrowRight size={12} />
                                            </button>
                                        </Link>
                                        {canDelete && (
                                            <button onClick={() => setBrdToDelete({ id: brd.id })}
                                                className="w-9 h-9 flex items-center justify-center border border-red-100 text-red-400 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                /* Table / List view */
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {["BRD ID", "Project Name", "Version", "Status", "Created", "Last Updated"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                ))}
                                <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-16 text-center">
                                    <FileText size={32} className="text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm">No BRDs match your filters</p>
                                </td></tr>
                            ) : filtered.flatMap((brd, i) => {
                                const sc = STATUS_CONFIG[brd.status as BRDStatus] || STATUS_CONFIG["Archived"];
                                const StatusIcon = sc.Icon;
                                const canDelete = isProgramManager && ["Generating BRD", "BRD Generated"].includes(brd.status);
                                const isExpanded = expandedRows.has(brd.id);
                                const toggleExpand = () => setExpandedRows(prev => {
                                    const next = new Set(prev);
                                    next.has(brd.id) ? next.delete(brd.id) : next.add(brd.id);
                                    return next;
                                });

                                const rows = [
                                    /* Parent row */
                                    <motion.tr key={brd.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                        className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={toggleExpand}>
                                        <td className="px-5 py-4" colSpan={7}>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight size={15} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                                                <span className="font-mono text-sm font-bold text-[#00338D]">{brd.id}</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ];

                                if (isExpanded) {
                                    /* Latest version row */
                                    rows.push(
                                        <motion.tr key={`${brd.id}-latest`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                            className="bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 pl-5">
                                                    <CornerDownRight size={14} className="text-slate-300 flex-shrink-0" />
                                                    <span className="font-mono text-sm font-bold text-[#00338D]">{brd.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-slate-800 text-sm">{brd.projectName}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-xs text-[#00338D] bg-[#00A3E0]/10 px-2 py-0.5 rounded-md font-bold">
                                                    {brd.version} <span className="text-emerald-600">(Latest)</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                    <StatusIcon size={11} className={brd.status === "Generating BRD" ? "animate-spin" : ""} />{brd.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-500">
                                                {new Date(brd.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-500">
                                                {new Date(brd.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link href={`/dashboard/pm/brd/${brd.id}`}>
                                                        <button className="flex items-center justify-center w-8 h-8 bg-[#00338D]/10 text-[#00338D] rounded-lg hover:bg-[#00338D]/20 transition-colors">
                                                            <Eye size={14} />
                                                        </button>
                                                    </Link>
                                                    {canDelete && (
                                                        <button onClick={e => { e.stopPropagation(); setBrdToDelete({ id: brd.id }); }}
                                                            className="flex items-center justify-center w-8 h-8 bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );

                                    /* Previous versions */
                                    brd.versionHistory?.slice(0, -1).forEach((v, vi) => {
                                        const vsc = STATUS_CONFIG[v.status as BRDStatus] || STATUS_CONFIG["Archived"];
                                        const VIcon = vsc.Icon;
                                        rows.push(
                                            <motion.tr key={`${brd.id}-v${vi}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: vi * 0.03 }}
                                                className="bg-slate-50/30 hover:bg-slate-100/40 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5 pl-5">
                                                        <CornerDownRight size={14} className="text-slate-200 flex-shrink-0" />
                                                        <span className="font-mono text-xs font-semibold text-slate-400">{brd.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3"><p className="text-xs text-slate-400">{brd.projectName}</p></td>
                                                <td className="px-5 py-3">
                                                    <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{v.version}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${vsc.bg} ${vsc.text} ${vsc.border} opacity-70`}>
                                                        <VIcon size={10} />{v.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-xs text-slate-400">{new Date(v.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                                                <td className="px-5 py-3 text-xs text-slate-400">{new Date(v.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                                                <td className="px-5 py-3" />
                                            </motion.tr>
                                        );
                                    });
                                }

                                return rows;
                            })}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {showCreate && <BRDCreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

            {/* Delete Confirmation */}
            {brdToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                            <Trash2 size={20} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Document</h3>
                        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-slate-700">{brdToDelete.id}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setBrdToDelete(null)} className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors border border-slate-200">Cancel</button>
                            <button onClick={() => { deleteBRD(brdToDelete.id); setBrdToDelete(null); }}
                                className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
