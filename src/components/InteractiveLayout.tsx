"use client";

import { useEffect, useState } from "react";

export default function InteractiveLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-[#F8FAFC] text-slate-900">{children}</div>;
    }

    return (
        <div className="min-h-screen animated-gradient text-slate-900 flex flex-col relative overflow-hidden">
            {/* Decorative background gradients (soft overlays) */}
            <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#00A3E0] opacity-5 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#00338D] opacity-5 blur-[120px] pointer-events-none" />

            <main className="flex-grow z-10 relative">
                {children}
            </main>
        </div>
    );
}
