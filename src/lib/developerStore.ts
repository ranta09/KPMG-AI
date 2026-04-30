"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AgentName = "architecture" | "uiux" | "codegen" | "review" | "qa" | "deploy";
export type AgentStatus = "idle" | "running" | "draft" | "accepted";

export interface OutputVersion {
    content: string;
    timestamp: string;
    feedback?: string;
}

export interface AgentOutput {
    versions: OutputVersion[];
    accepted: number | null;
    status: AgentStatus;
}

export interface FileEntry {
    name: string;
    content: string;
}

export interface BRDArtifacts {
    brdId: string;
    customInstructions: Partial<Record<AgentName, string>>;
    outputs: Partial<Record<AgentName, AgentOutput>>;
    files: FileEntry[];
    pipelineStage: AgentName;
}

interface DevStore {
    artifacts: Record<string, BRDArtifacts>;
    activeBrdId: string | null;
    activeAgent: AgentName;
    setActiveBrd: (id: string) => void;
    setActiveAgent: (a: AgentName) => void;
    setInstruction: (brdId: string, agent: AgentName, val: string) => void;
    startRun: (brdId: string, agent: AgentName) => void;
    appendContent: (brdId: string, agent: AgentName, chunk: string) => void;
    finishRun: (brdId: string, agent: AgentName) => void;
    editVersion: (brdId: string, agent: AgentName, vIdx: number, content: string) => void;
    rerunWithFeedback: (brdId: string, agent: AgentName, feedback: string) => void;
    acceptOutput: (brdId: string, agent: AgentName) => void;
    setFiles: (brdId: string, files: FileEntry[]) => void;
    getOutput: (brdId: string, agent: AgentName) => AgentOutput | undefined;
    getAccepted: (brdId: string, agent: AgentName) => string | null;
}

const blank = (): AgentOutput => ({ versions: [], accepted: null, status: "idle" });

function ensureArtifact(artifacts: Record<string, BRDArtifacts>, brdId: string): BRDArtifacts {
    if (!artifacts[brdId]) {
        artifacts[brdId] = { brdId, customInstructions: {}, outputs: {}, files: [], pipelineStage: "architecture" };
    }
    return artifacts[brdId];
}

export const useDeveloperStore = create<DevStore>()(
    persist(
        (set, get) => ({
            artifacts: {},
            activeBrdId: null,
            activeAgent: "architecture",
            setActiveBrd: (id) => set({ activeBrdId: id }),
            setActiveAgent: (a) => set({ activeAgent: a }),
            setInstruction: (brdId, agent, val) =>
                set(s => { const a = { ...s.artifacts }; ensureArtifact(a, brdId).customInstructions[agent] = val; return { artifacts: a }; }),
            startRun: (brdId, agent) =>
                set(s => {
                    const a = { ...s.artifacts };
                    const art = ensureArtifact(a, brdId);
                    const out = art.outputs[agent] || blank();
                    out.versions = [...out.versions, { content: "", timestamp: new Date().toISOString() }];
                    out.status = "running";
                    art.outputs[agent] = out;
                    return { artifacts: a };
                }),
            appendContent: (brdId, agent, chunk) =>
                set(s => {
                    const a = { ...s.artifacts };
                    const out = a[brdId]?.outputs[agent];
                    if (!out || !out.versions.length) return s;
                    out.versions[out.versions.length - 1].content += chunk;
                    return { artifacts: a };
                }),
            finishRun: (brdId, agent) =>
                set(s => { const a = { ...s.artifacts }; const out = a[brdId]?.outputs[agent]; if (out) out.status = "draft"; return { artifacts: a }; }),
            editVersion: (brdId, agent, vIdx, content) =>
                set(s => { const a = { ...s.artifacts }; const out = a[brdId]?.outputs[agent]; if (out?.versions[vIdx]) out.versions[vIdx].content = content; return { artifacts: a }; }),
            rerunWithFeedback: (brdId, agent, feedback) =>
                set(s => {
                    const a = { ...s.artifacts };
                    const out = a[brdId]?.outputs[agent];
                    if (out?.versions.length) out.versions[out.versions.length - 1].feedback = feedback;
                    return { artifacts: a };
                }),
            acceptOutput: (brdId, agent) =>
                set(s => {
                    const a = { ...s.artifacts };
                    const art = ensureArtifact(a, brdId);
                    const out = art.outputs[agent];
                    if (out) { out.accepted = out.versions.length - 1; out.status = "accepted"; }
                    const ORDER: AgentName[] = ["architecture","uiux","codegen","review","qa","deploy"];
                    const next = ORDER[ORDER.indexOf(agent) + 1];
                    if (next) art.pipelineStage = next;
                    return { artifacts: a };
                }),
            setFiles: (brdId, files) =>
                set(s => { const a = { ...s.artifacts }; ensureArtifact(a, brdId).files = files; return { artifacts: a }; }),
            getOutput: (brdId, agent) => get().artifacts[brdId]?.outputs[agent],
            getAccepted: (brdId, agent) => {
                const out = get().artifacts[brdId]?.outputs[agent];
                if (!out || out.accepted === null) return null;
                return out.versions[out.accepted]?.content ?? null;
            },
        }),
        { name: "kpmg-developer-store" }
    )
);

export const AGENTS: { id: AgentName; label: string; iconName: string; color: string; glow: string; desc: string }[] = [
    { id: "architecture", label: "Architecture", iconName: "Layers",          color: "#3b82f6", glow: "rgba(59,130,246,0.3)", desc: "System design, tech stack, ERD, sequence diagrams" },
    { id: "uiux",         label: "UI/UX Design", iconName: "PenTool",         color: "#a855f7", glow: "rgba(168,85,247,0.3)", desc: "Component specs, wireframes, design tokens" },
    { id: "codegen",      label: "Code Dev",     iconName: "Code2",           color: "#22c55e", glow: "rgba(34,197,94,0.3)",  desc: "Full source code generation" },
    { id: "review",       label: "Code Review",  iconName: "GitPullRequest",  color: "#f59e0b", glow: "rgba(245,158,11,0.3)", desc: "Security, performance, best practices" },
    { id: "qa",           label: "QA Testing",   iconName: "FlaskConical",    color: "#06b6d4", glow: "rgba(6,182,212,0.3)",  desc: "Test suites, coverage, edge cases" },
    { id: "deploy",       label: "Deployment",   iconName: "Rocket",          color: "#f97316", glow: "rgba(249,115,22,0.3)", desc: "Dockerfile, CI/CD, infra config" },
];
