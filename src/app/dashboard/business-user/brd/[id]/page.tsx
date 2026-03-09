"use client";

import { useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { BRDRecord, BRDSections, useBRDStore } from "@/lib/brdStore";
import BRDViewer from "@/components/brd/BRDViewer";
import BRDAIPanel from "@/components/brd/BRDAIPanel";

export default function BRDDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { brds, updateBRDStatus, addComment, updateSections, createMajorVersion } = useBRDStore();
    const brd = brds.find(b => b.id === id) ?? null;

    if (!brd) {
        return (
            <div className="py-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-64 gap-4">
                <FileText size={40} className="text-slate-200" />
                <p className="text-slate-500 font-medium">BRD not found</p>
                <Link href="/dashboard/business-user/brd" className="text-sm text-[#00338D] hover:underline font-semibold interactive">
                    ← Back to BRD Management
                </Link>
            </div>
        );
    }

    const handleStatusChange = (_id: string, status: BRDRecord["status"]) => {
        updateBRDStatus(_id, status);
    };

    const handleAddComment = (_id: string, content: string, section?: string) => {
        addComment(_id, { author: "Business User", role: "Business User", content, section });
    };

    const handleSectionEdit = (_id: string, sections: BRDSections) => {
        updateSections(_id, sections);
    };

    const handleRequestMajorChange = (_id: string) => {
        createMajorVersion(_id, router.push);
    };

    return (
        <div className="py-6 max-w-[1400px] mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-6">
                <Link href="/dashboard/business-user/brd"
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#00338D] font-medium transition-colors interactive">
                    <ArrowLeft size={15} /> BRD Management
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-semibold text-slate-800">{brd.id}</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-5 items-start">
                <BRDViewer brd={brd} onStatusChange={handleStatusChange} onAddComment={handleAddComment} onSectionEdit={handleSectionEdit} onRequestMajorChange={handleRequestMajorChange} />
                <BRDAIPanel />
            </motion.div>
        </div>
    );
}
