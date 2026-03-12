"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Eye, Download, FileText, Clock, CheckCircle, AlertCircle, RotateCcw, Archive, Loader2, Filter, ChevronDown, ChevronRight, CornerDownRight, Trash2, Code, Users, Rocket } from "lucide-react";
import Link from "next/link";
import { getLoggedInUser } from "@/lib/auth";
import { useEffect } from "react";
import { BRDRecord, BRDStatus, useBRDStore } from "@/lib/brdStore";
import BRDCreateModal from "@/components/brd/BRDCreateModal";

const STATUS_CONFIG: Record<BRDStatus, { bg: string; text: string; border: string; Icon: React.ElementType }> = {
    "Generating BRD": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", Icon: Loader2 },
    "BRD Generated": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", Icon: CheckCircle },
    "BRD Review": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", Icon: Clock },
    "Changes Requested": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300", Icon: AlertCircle },
    "Approved": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", Icon: CheckCircle },
    "Development": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300", Icon: Code },
    "UAT": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", Icon: AlertCircle },
    "Production": { bg: "bg-[#00338D]/20", text: "text-[#00338D]", border: "border-[#00338D]/30", Icon: CheckCircle },
    "Archived": { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", Icon: Archive },
};

const ALL_STATUSES: BRDStatus[] = ["Generating BRD", "BRD Generated", "BRD Review", "Approved", "Development", "UAT", "Production", "Archived"];

export default function BRDManagementPage() {
    const { brds, addBRD, deleteBRD, updateBRDStatus } = useBRDStore();
    const user = getLoggedInUser();
    const isProgramManager = user?.role === "program-manager";
    const [showCreate, setShowCreate] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const [statusFilter, setStatusFilter] = useState<BRDStatus | "All">("All");
    const [search, setSearch] = useState("");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [brdToDelete, setBrdToDelete] = useState<{ id: string; version?: string } | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("new") === "true") {
                setShowCreate(true);
            }
        }
    }, [search]);

    useEffect(() => {
        const generatingIds = brds.filter(b => b.status === "Generating BRD").map(b => b.id);
        if (generatingIds.length === 0) return;

        const timer = setTimeout(() => {
            generatingIds.forEach(id => updateBRDStatus(id, "BRD Generated"));
        }, 3000);

        return () => clearTimeout(timer);
    }, [brds, updateBRDStatus]);

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleCreated = (brd: BRDRecord) => {
        addBRD(brd);
        setShowCreate(false);
    };



    // Prevent hydration mismatch
    if (!isClient) return <div className="p-8 flex items-center justify-center"><Loader2 size={32} className="text-[#00338D] animate-spin" /></div>;

    const filtered = brds.filter(b => {
        const matchStatus = statusFilter === "All" || b.status === statusFilter;
        const matchSearch = b.projectName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });


    return (
        <div className="py-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 text-slate-900 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-52 opacity-30 pointer-events-none">
                    <div className="grid grid-cols-6 gap-4 h-full p-5">
                        {Array.from({ length: 36 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]/40" />)}
                    </div>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={20} className="text-[#00338D]" />
                            <p className="text-[#00338D] font-bold text-sm uppercase tracking-wider">Program Manager Portal</p>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Business Requirement Documents</h1>
                        <p className="text-slate-600 text-sm mt-1">AI-assisted BRD creation, review, and approval centre</p>

                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#00338D] text-white hover:bg-[#001f5c] font-bold text-sm rounded-xl transition-all interactive flex-shrink-0 shadow-md hover:shadow-lg">
                        <Plus size={16} /> Create New BRD
                    </button>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by project or BRD ID..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white" />
                </div>
                <div className="relative group min-w-[200px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Filter size={14} />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as BRDStatus | "All")}
                        className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:border-[#00338D]/50 transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-[#00338D] outline-none shadow-sm"
                    >
                        <option value="All">All Statuses</option>
                        {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={14} />
                    </div>
                </div>

            </motion.div>

            {/* Table */}
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
                            <tr>
                                <td colSpan={7} className="px-5 py-16 text-center">
                                    <AlertCircle size={32} className="text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm">No BRDs match your filters</p>
                                </td>
                            </tr>
                        ) : filtered.flatMap((brd, i) => {
                            const sc = STATUS_CONFIG[brd.status as BRDStatus] || { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", Icon: FileText };
                            const StatusIcon = sc.Icon;
                            const isExpanded = expandedRows.has(brd.id);

                            const parentRow = (
                                <motion.tr key={brd.id}
                                    onClick={(e) => toggleExpand(e, brd.id)}
                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer border-b border-slate-100">
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="text-slate-400 hover:text-[#00338D] transition-colors p-1"
                                                onClick={(e) => toggleExpand(e, brd.id)}
                                            >
                                                <ChevronRight size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                                            </button>
                                            <span className="font-mono text-sm font-bold text-[#00338D]">{brd.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className={`flex items-center gap-2 ${isExpanded ? "invisible" : ""}`}>
                                            <p className="font-semibold text-slate-800 text-sm">{brd.projectName}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`font-mono text-xs text-[#00338D] bg-[#00A3E0]/10 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-fit ${isExpanded ? "invisible" : ""}`}>
                                            {brd.version} <span className="text-[10px] text-slate-500 font-medium">(Latest)</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <motion.span whileHover={{ scale: 1.04 }}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border} ${isExpanded ? "invisible" : ""}`}>
                                            <StatusIcon size={11} className={brd.status === "Generating BRD" ? "animate-spin" : ""} />{brd.status}
                                        </motion.span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                        <span className={isExpanded ? "invisible" : ""}>
                                            {new Date(brd.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                        <span className={isExpanded ? "invisible" : ""}>
                                            {new Date(brd.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Link href={`/dashboard/pm/brd/${brd.id}`} className={isExpanded ? "invisible pointer-events-none" : ""}>
                                                <button onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center justify-center w-8 h-8 bg-[#00338D]/10 text-[#00338D] rounded-lg interactive hover:bg-[#00338D]/20 transition-colors"
                                                    title="View BRD">
                                                    <Eye size={14} />
                                                </button>
                                            </Link>
                                            {/* Delete only allowed for PM in Draft/Generated phases */}
                                            {((isProgramManager && ["Generating BRD", "BRD Generated"].includes(brd.status)) || (!isProgramManager && ["Generating BRD", "BRD Generated", "BRD Review"].includes(brd.status))) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBrdToDelete({ id: brd.id });
                                                    }}
                                                    className={`flex items-center justify-center w-8 h-8 bg-white border border-red-200 text-red-500 rounded-lg interactive hover:bg-red-50 hover:text-red-600 transition-colors ${isExpanded ? "invisible pointer-events-none" : ""}`}
                                                    title="Delete BRD"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );

                            if (!isExpanded || !brd.versionHistory || brd.versionHistory.length === 0) {
                                return [parentRow];
                            }

                            const renderChildRow = (version: BRDRecord["versionHistory"][0], j: number) => {
                                const isLatest = j === 0;
                                const computedStatus = isLatest ? brd.status : version.status;
                                const vSc = STATUS_CONFIG[computedStatus as BRDStatus] || { bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", Icon: FileText };
                                const StatusIcon = vSc.Icon;

                                return (
                                    <motion.tr key={`${brd.id}-${version.version}`}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="bg-slate-50/50 hover:bg-slate-100/50 transition-colors group">
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2 pl-8">
                                                <CornerDownRight size={14} className="text-slate-300" />
                                                <span className="font-mono text-sm font-bold text-slate-500">{brd.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-600 text-sm">{brd.projectName}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className="font-mono text-xs text-slate-600 bg-slate-200/50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-fit">
                                                {version.version}
                                                {isLatest && <span className="text-[10px] text-emerald-600 font-bold">(Latest)</span>}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${vSc.bg} ${vSc.text} ${vSc.border}`}>
                                                <StatusIcon size={11} className={computedStatus === "Generating BRD" ? "animate-spin" : ""} />{computedStatus}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(version.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                                        <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(version.updatedAt || version.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link href={`/dashboard/pm/brd/${brd.id}?v=${version.version}`}>
                                                    <button className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                                        title="View Version Map">
                                                        <Eye size={14} />
                                                    </button>
                                                </Link>
                                                {/* Delete only allowed for PM in Draft/Generated phases */}
                                                {((isProgramManager && ["Generating BRD", "BRD Generated"].includes(computedStatus)) || (!isProgramManager && ["Generating BRD", "BRD Generated", "BRD Review"].includes(computedStatus))) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBrdToDelete({ id: brd.id, version: version.version });
                                                        }}
                                                        className="flex items-center justify-center w-8 h-8 bg-white border border-red-100 text-red-400 rounded-lg hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all shadow-sm active:scale-95"
                                                        title="Delete Version"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            };

                            const childRows = brd.versionHistory.map((v, j) => renderChildRow(v, j));
                            return [parentRow, ...childRows];
                        })}
                    </tbody>
                </table>
            </motion.div>


            {showCreate && <BRDCreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
            }

            {/* Custom Delete Confirmation Modal */}
            {
                brdToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative">
                            <div className="flex items-center gap-3 text-red-600 mb-4 bg-red-50 w-fit p-3 rounded-full">
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
                )
            }
        </div >
    );
}
