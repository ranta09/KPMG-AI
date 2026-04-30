"use client";

import { useDeveloperStore, AGENTS, AgentName } from "@/lib/developerStore";
import AgentIcon from "./AgentIcon";
import { BRDRecord } from "@/lib/brdStore";
import { LogOut, Sun, Moon, GitBranch, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
    dark: boolean;
    activeBrd: BRDRecord | null;
    username: string;
    onLogout: () => void;
    onThemeToggle: () => void;
}

export default function StatusBar({ dark, activeBrd, username, onLogout, onThemeToggle }: Props) {
    const store     = useDeveloperStore();
    const agent     = store.activeAgent;
    const agentMeta = AGENTS.find(a => a.id === agent);
    const output    = activeBrd ? store.getOutput(activeBrd.id, agent) : undefined;
    const status    = output?.status || "idle";

    const statusDot: Record<string, string> = {
        idle:     "rgba(255,255,255,0.35)",
        running:  "#60a5fa",
        draft:    "#fbbf24",
        accepted: "#34d399",
    };
    const statusLabel: Record<string, string> = {
        idle: "Idle", running: "Generating…", draft: "Draft", accepted: "Accepted",
    };

    return (
        <div className="h-6 shrink-0 flex items-center px-3 gap-0 select-none overflow-hidden"
            style={{ background: "#00338D", color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>

            {/* Left section */}
            <div className="flex items-center gap-0 h-full">

                {/* Git-like branch indicator */}
                <div className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors cursor-default">
                    <GitBranch size={11} />
                    <span className="font-mono">main</span>
                </div>

                {activeBrd && (
                    <>
                        <div className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors cursor-default">
                            <span className="font-mono opacity-70">{activeBrd.id}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors cursor-default max-w-[160px]">
                            <span className="truncate opacity-80">{activeBrd.projectName}</span>
                        </div>
                    </>
                )}

                {agentMeta && (
                    <div className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors cursor-default">
                        <AgentIcon name={agentMeta.iconName} size={10} color="rgba(255,255,255,0.7)" />
                        <span className="opacity-80">{agentMeta.label}</span>
                    </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-1 px-2 h-full">
                    {status === "running"
                        ? <Loader2 size={9} className="animate-spin" style={{ color: statusDot.running }} />
                        : <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusDot[status] || statusDot.idle }} />}
                    <span className="font-medium" style={{ color: statusDot[status] || statusDot.idle }}>
                        {statusLabel[status] || "Idle"}
                    </span>
                </div>
            </div>

            {/* Right section */}
            <div className="ml-auto flex items-center gap-0 h-full">
                <div className="flex items-center gap-1 px-2 h-full opacity-60 cursor-default">
                    <span className="font-mono">GPT-4o</span>
                </div>

                <button onClick={onThemeToggle}
                    className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100">
                    {dark ? <Sun size={11} /> : <Moon size={11} />}
                    <span>{dark ? "Light" : "Dark"}</span>
                </button>

                <div className="flex items-center gap-1 px-2 h-full opacity-70 cursor-default">
                    <span className="font-mono">{username}</span>
                </div>

                <button onClick={onLogout}
                    className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100">
                    <LogOut size={10} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
