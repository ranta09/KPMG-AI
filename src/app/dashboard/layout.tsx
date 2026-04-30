"use client";
import Sidebar from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isIDE = pathname.startsWith("/dashboard/developer");

    if (isIDE) return <>{children}</>;

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative">
                <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[#00A3E0]/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 max-w-7xl mx-auto">{children}</div>
            </main>
            <Chatbot />
        </div>
    );
}
