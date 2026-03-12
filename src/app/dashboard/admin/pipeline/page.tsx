"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Filter, Search, ChevronRight, CornerDownRight, Eye, CheckCircle, Clock, AlertCircle, RotateCcw, Archive, FileText, Loader2, Trash2, Code } from "lucide-react";
import Link from "next/link";
import { useBRDStore, BRDStatus } from "@/lib/brdStore";

const STATUS_CONFIG: Record<BRDStatus, { bg: string; text: string; border: string; Icon: React.ElementType }> = {
    "Generating BRD": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", Icon: Loader2 },
    "BRD Generated": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", Icon: CheckCircle },
    "BRD Review": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", Icon: Clock },
    "Changes Requested": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300", Icon: RotateCcw },
    "Approved": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", Icon: CheckCircle },
    "Development": { bg: "bg-[#00338D]/10", text: "text-[#00338D]", border: "border-[#00338D]/20", Icon: Code },
    "UAT": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", Icon: AlertCircle },
    "Production": { bg: "bg-[#00338D]/20", text: "text-[#00338D]", border: "border-[#00338D]/30", Icon: CheckCircle },
    "Archived": { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", Icon: Archive },
};

export default function PipelinePage() {
    const { brds, deleteBRD } = useBRDStore();
    const [isClient, setIsClient] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [brdToDelete, setBrdToDelete] = useState<{ id: string; version?: string } | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (!isClient) return <div className="p-8 flex items-center justify-center min-h-screen"><Loader2 size={32} className="text-[#00338D] animate-spin" /></div>;

    const filtered = brds.filter(b =>
        b.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-6 max-w-7xl mx-auto">
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">Strategic Pipeline</h1>
                    <p className="text-slate-500">Track and manage BRD lifecycles across the enterprise.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00338D] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-72 focus:outline-none focus:border-[#00338D] focus:ring-1 focus:ring-[#00338D] transition-all bg-white shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="interactive flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-sm shadow-sm font-semibold">
                        <Filter size={18} className="text-[#00338D]" /> Filter
                    </button>
                    <Link href="/dashboard/pm/brd">
                        <button className="interactive flex items-center gap-2 px-5 py-2.5 bg-[#00338D] border border-transparent rounded-xl hover:bg-[#00266e] text-white transition-colors text-sm shadow-md font-bold">
                            <Plus size={18} /> New BRD
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Hierarchical Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
                <div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">BRD ID & Versions</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Project Name</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Latest Version</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Created At</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Update</th>
                                <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                <FileText size={24} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-slate-900 font-bold mb-1">No BRDs Found</h3>
                                            <p className="text-slate-500 text-sm">Your search did not match any active projects in the pipeline.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.flatMap((brd) => {
                                const sc = STATUS_CONFIG[brd.status as BRDStatus] || { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", Icon: FileText };
                                const StatusIcon = sc.Icon;
                                const isExpanded = expandedRows.has(brd.id);

                                const parentRow = (
                                    <motion.tr
                                        key={brd.id}
                                        onClick={(e) => toggleExpand(e, brd.id)}
                                        className="hover:bg-slate-50/80 transition-all group cursor-pointer border-b border-slate-100/50"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded-lg transition-colors ${isExpanded ? "bg-[#00338D]/10 text-[#00338D]" : "text-slate-400 group-hover:text-slate-600"}`}>
                                                    <ChevronRight size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                                                </div>
                                                <span className="font-mono text-sm font-bold text-[#00338D] tracking-tight">{brd.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className={`font-bold text-slate-900 text-sm ${isExpanded ? "invisible" : ""}`}>
                                                {brd.projectName}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`font-mono text-xs text-[#00338D] bg-[#00A3E0]/10 px-2.5 py-1 rounded-lg font-bold border border-[#00A3E0]/20 flex items-center gap-1.5 w-fit ${isExpanded ? "invisible" : ""}`}>
                                                {brd.version} <span className="text-[10px] text-slate-400 font-medium">Latest</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm ${sc.bg} ${sc.text} ${sc.border} ${isExpanded ? "invisible" : ""}`}>
                                                <StatusIcon size={12} className={brd.status === "Generating BRD" ? "animate-spin" : ""} />
                                                {brd.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-medium text-slate-500 whitespace-nowrap">
                                            <span className={isExpanded ? "invisible" : ""}>
                                                {new Date(brd.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-medium text-slate-500 whitespace-nowrap">
                                            <span className={isExpanded ? "invisible" : ""}>
                                                {new Date(brd.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/dashboard/pm/brd/${brd.id}`} className={isExpanded ? "invisible pointer-events-none" : ""}>
                                                    <button onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center w-8 h-8 font-bold bg-[#00338D]/10 text-[#00338D] rounded-xl hover:bg-[#00338D]/20 transition-all shadow-sm active:scale-95 text-xs" title="Open BRD">
                                                        <Eye size={14} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBrdToDelete({ id: brd.id });
                                                    }}
                                                    className="inline-flex items-center justify-center w-8 h-8 font-bold bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm active:scale-95 text-xs"
                                                    title="Delete BRD"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );

                                if (!isExpanded || !brd.versionHistory || brd.versionHistory.length === 0) {
                                    return [parentRow];
                                }

                                const historyRows = brd.versionHistory.map((version, j) => {
                                    const vSc = STATUS_CONFIG[version.status as BRDStatus] || { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", Icon: FileText };
                                    const StatusIcon = vSc.Icon;
                                    const isLatest = j === 0;
                                    return (
                                        <motion.tr
                                            key={`${brd.id}-${version.version}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-slate-50/40 hover:bg-slate-100/60 transition-colors group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3 pl-8">
                                                    <CornerDownRight size={16} className="text-slate-300" />
                                                    <span className="font-mono text-sm font-bold text-slate-500 tracking-tight">{brd.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-600 text-sm">{brd.projectName}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs text-slate-600 bg-slate-200/50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 w-fit">
                                                    {version.version}
                                                    {isLatest && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded border border-emerald-200/50">Latest</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm ${vSc.bg} ${vSc.text} ${vSc.border}`}>
                                                    <StatusIcon size={12} className={version.status === "Generating BRD" ? "animate-spin" : ""} />
                                                    {version.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-400 whitespace-nowrap">
                                                {new Date(version.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-400 whitespace-nowrap">
                                                {new Date(version.updatedAt || version.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/dashboard/pm/brd/${brd.id}?v=${version.version}`}>
                                                        <button onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center w-8 h-8 font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-[#00338D] hover:text-[#00338D] transition-all shadow-sm active:scale-95 text-xs" title="View Version Map">
                                                            <Eye size={14} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBrdToDelete({ id: brd.id, version: version.version });
                                                        }} className="inline-flex items-center justify-center w-8 h-8 font-bold bg-white border border-red-100 text-red-400 rounded-xl hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all shadow-sm active:scale-95 text-xs" title="Delete Version">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                });

                                return [parentRow, ...historyRows];
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Showing {filtered.length} Enterprise Projects</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-bold text-slate-400 cursor-not-allowed border border-transparent">Prev</button>
                        <button className="px-3 py-1.5 text-xs font-bold bg-[#00338D] text-white rounded-lg shadow-sm">1</button>
                        <button className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">Next</button>
                    </div>
                </div>
            </motion.div>

            {/* Custom Delete Confirmation Modal */}
            {brdToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative">
                        <div className="flex items-center gap-3 text-red-600 mb-4 bg-red-50 w-fit p-3 rounded-2xl">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Document</h3>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-slate-700">{brdToDelete.id}</span>
                            {brdToDelete.version && <> <span className="text-slate-500 font-normal">(Version {brdToDelete.version})</span></>}?
                            This action is permanent and cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setBrdToDelete(null)} className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={() => {
                                if (brdToDelete.version) {
                                    useBRDStore.getState().deleteVersion(brdToDelete.id, brdToDelete.version);
                                } else {
                                    deleteBRD(brdToDelete.id);
                                }
                                setBrdToDelete(null);
                            }} className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 active:scale-95">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
