import { Layers, PenTool, Code2, GitPullRequest, FlaskConical, Rocket } from "lucide-react";

const MAP: Record<string, React.ElementType> = {
    Layers, PenTool, Code2, GitPullRequest, FlaskConical, Rocket,
};

export default function AgentIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
    const Icon = MAP[name];
    if (!Icon) return null;
    return <Icon size={size} color={color} />;
}
