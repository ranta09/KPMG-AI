"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBRDStore } from "@/lib/brdStore";
import { useDeveloperStore } from "@/lib/developerStore";
import { getLoggedInUser, logoutUser } from "@/lib/auth";
import { getUsers } from "@/lib/usersStore";
import { useRouter } from "next/navigation";
import ActivityBar      from "@/components/developer/ActivityBar";
import ExplorerPanel    from "@/components/developer/ExplorerPanel";
import EditorPanel      from "@/components/developer/EditorPanel";
import ChatPanel        from "@/components/developer/ChatPanel";
import SupportPanel     from "@/components/developer/SupportPanel";
import ExtensionsPanel  from "@/components/developer/ExtensionsPanel";
import { ChevronDown, Sun, Moon, HeartPulse } from "lucide-react";

type View = "pipeline" | "extensions" | "support";

export default function DeveloperPage() {
    const { brds } = useBRDStore();
    const store    = useDeveloperStore();
    const router   = useRouter();

    const [username,  setUsername]  = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [brdOpen,   setBrdOpen]   = useState(false);
    const [view,      setView]      = useState<View>("pipeline");
    const [dark, setDark] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("kpmg-dev-theme") === "dark";
    });

    const toggleTheme = () => setDark(v => {
        const next = !v;
        localStorage.setItem("kpmg-dev-theme", next ? "dark" : "light");
        return next;
    });

    useEffect(() => {
        const u = getLoggedInUser();
        if (u) {
            setUsername(u.username);
            const found = getUsers().find(user => user.name === u.username);
            if (found) setUserEmail(found.email);
        }
    }, []);

    const assignedBrds = brds.filter(b =>
        b.status === "Development" || (userEmail && b.assignedDeveloperEmail === userEmail)
    );
    const activeBrd = assignedBrds.find(b => b.id === store.activeBrdId) || assignedBrds[0] || null;

    useEffect(() => {
        if (activeBrd && !store.activeBrdId) store.setActiveBrd(activeBrd.id);
    }, [activeBrd, store]);

    const titleBg = dark ? "#3c3c3c" : "#f0f0f0";
    const border  = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
    const text    = dark ? "#d4d4d4" : "#1e1e1e";
    const muted   = dark ? "#808080" : "#6b7280";
    const inputBg = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const hoverBg = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
    const activeBg = dark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.09)";
    const dropBg  = dark ? "#252526" : "#ffffff";

    const handleLogout = () => { logoutUser(); router.push("/"); };

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden"
            style={{ background: dark ? "#1e1e1e" : "#ffffff", fontFamily: "inherit" }}>

            {/* ── Title bar ─────────────────────────────────────── */}
            <div className="h-8 shrink-0 flex items-center justify-between px-3 select-none"
                style={{ background: titleBg, borderBottom: `1px solid ${border}` }}>

                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-4 h-4 rounded bg-[#00338D] flex items-center justify-center shrink-0">
                            <span className="text-[7px] font-black text-white">K</span>
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: text }}>Developer</span>
                    </div>

                    <div className="w-px h-3 shrink-0" style={{ background: border }} />

                    {/* BRD dropdown */}
                    <div className="relative">
                        <button onClick={() => setBrdOpen(v => !v)}
                            className="flex items-center gap-1.5 px-2 h-5 rounded text-[11px] transition-all"
                            style={{ background: inputBg, color: text }}>
                            <span className="truncate max-w-[160px]">
                                {activeBrd ? activeBrd.projectName : "No BRD assigned"}
                            </span>
                            {activeBrd && (
                                <span className="font-mono text-[9px] shrink-0" style={{ color: muted }}>{activeBrd.id}</span>
                            )}
                            <ChevronDown size={9} style={{ color: muted }}
                                className={`shrink-0 transition-transform ${brdOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                            {brdOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                                    className="absolute top-full mt-1 left-0 min-w-[220px] rounded-lg overflow-hidden shadow-xl z-50"
                                    style={{ background: dropBg, border: `1px solid ${border}` }}>
                                    {assignedBrds.length === 0
                                        ? <p className="px-3 py-2.5 text-[11px]" style={{ color: muted }}>No BRDs in Development</p>
                                        : assignedBrds.map(b => (
                                            <button key={b.id}
                                                onClick={() => { store.setActiveBrd(b.id); setBrdOpen(false); }}
                                                className="w-full text-left px-3 py-2 transition-colors"
                                                style={{ background: b.id === store.activeBrdId ? activeBg : "transparent" }}
                                                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                                                onMouseLeave={e => (e.currentTarget.style.background = b.id === store.activeBrdId ? activeBg : "transparent")}>
                                                <p className="text-[11px] font-medium" style={{ color: text }}>{b.projectName}</p>
                                                <p className="text-[10px] font-mono" style={{ color: muted }}>{b.id} · v{b.version}</p>
                                            </button>
                                        ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: support + theme */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setView(v => v === "support" ? "pipeline" : "support")}
                        className="flex items-center gap-1 px-2 h-5 rounded text-[10px] transition-colors"
                        style={{
                            color: view === "support" ? "#f87171" : muted,
                            background: view === "support" ? "rgba(248,113,113,0.12)" : "transparent",
                        }}>
                        <HeartPulse size={10} /> Support
                    </button>
                    <button onClick={toggleTheme}
                        className="w-5 h-5 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ color: muted }}>
                        {dark ? <Sun size={11} /> : <Moon size={11} />}
                    </button>
                </div>
            </div>

            {/* ── IDE body ─────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Activity bar */}
                <ActivityBar
                    dark={dark}
                    activeBrd={activeBrd}
                    view={view === "support" ? "pipeline" : view as "pipeline" | "extensions"}
                    onViewChange={v => setView(v)}
                    onLogout={handleLogout}
                />

                {/* Explorer — hidden when showing extensions */}
                {view !== "extensions" && view !== "support" && (
                    <ExplorerPanel dark={dark} activeBrd={activeBrd} />
                )}

                {/* Main content */}
                <div className="flex flex-1 overflow-hidden">
                    {view === "support" ? (
                        <SupportPanel dark={dark} />
                    ) : view === "extensions" ? (
                        <ExtensionsPanel dark={dark} />
                    ) : activeBrd ? (
                        <>
                            <EditorPanel dark={dark} brd={activeBrd} />
                            <ChatPanel
                                key={`${activeBrd.id}-${store.activeAgent}`}
                                dark={dark}
                                brd={activeBrd}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2"
                            style={{ color: dark ? "#808080" : "#6b7280", background: dark ? "#1e1e1e" : "#ffffff" }}>
                            <p className="text-sm font-medium">No BRD in Development</p>
                            <p className="text-xs opacity-60">Ask your Program Manager to assign a BRD</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
