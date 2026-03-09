"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-red-100 text-center"
            >
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={32} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 mb-8">
                    You do not have the required permissions to view this enterprise module. Please contact your system administrator if you believe this is an error.
                </p>

                <Link href="/" className="inline-flex items-center justify-center gap-2 w-full bg-[#00338D] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#00266e] transition-colors">
                    <ArrowLeft size={18} />
                    Return to Homepage
                </Link>
            </motion.div>
        </div>
    );
}
