import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    const { brdSections, artifactType, projectName } = await req.json();

    const prompts: Record<string, string> = {
        engineeringPlan: `Based on this BRD for "${projectName}", generate a detailed Engineering Plan as markdown. Include: Feature Breakdown, Technical Architecture, Implementation Phases, Dependencies, and Technical Risks. Be specific and actionable.`,
        projectSchedule: `Based on this BRD for "${projectName}", generate a Project Schedule as markdown. Include: Timeline (in weeks), Milestones, Task breakdown by phase, Resource allocation, and Critical path. Format with clear tables.`,
        riskAnalysis: `Based on this BRD for "${projectName}", generate a Risk Analysis as markdown. Include a table with: Risk ID, Risk Description, Probability (H/M/L), Impact (H/M/L), Risk Score, Mitigation Strategy, and Owner. Cover technical, business, and delivery risks.`,
        resourceRequirements: `Based on this BRD for "${projectName}", generate Resource Requirements as markdown. Include: Team composition (roles, count, skills), Technology stack justification, Infrastructure requirements, and estimated costs. Format with tables.`,
        ganttData: `Based on this BRD for "${projectName}", generate a Gantt chart data as JSON. Return an array of tasks: [{"task": "Task Name", "phase": "Phase Name", "startWeek": 1, "endWeek": 3, "dependencies": []}]. Include all major implementation tasks across all phases. Return ONLY the JSON array.`,
    };

    const brdSummary = Object.entries(brdSections || {})
        .slice(0, 5)
        .map(([k, v]) => `${k}: ${String(v).slice(0, 300)}`)
        .join("\n\n");

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a senior KPMG technology consultant generating engineering artifacts from a BRD." },
                { role: "user", content: `${prompts[artifactType]}\n\nBRD Summary:\n${brdSummary}` }
            ],
            temperature: 0.3,
            max_tokens: 2000,
        });

        const content = completion.choices[0].message.content || "";

        if (artifactType === "ganttData") {
            try {
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                const data = JSON.parse(jsonMatch?.[0] || "[]");
                return NextResponse.json({ content, data });
            } catch {
                return NextResponse.json({ content, data: [] });
            }
        }

        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }
}
