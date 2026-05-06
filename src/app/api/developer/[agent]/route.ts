import { OpenAI } from "openai";
import { NextRequest } from "next/server";

const SYSTEM_PROMPTS: Record<string, string> = {
    architecture: `You are a senior Solution Architect at KPMG. Given a BRD, produce:
1. **Tech Stack** — table of layers (Frontend/Backend/DB/Integration/Infra) with chosen tech + rationale
2. **System Architecture** — Mermaid graph TD diagram showing all components and data flows
3. **Component Inventory** — table: Component | Type | Responsibility | Tech
4. **Data Model** — key entities and relationships (Mermaid erDiagram)
5. **Integration Points** — APIs, events, queues
6. **Non-Functional Requirements** — performance, security, scalability decisions
Be specific. Use the BRD content to name real components.`,

    uiux: `You are a senior UI/UX Designer. Given a BRD and architecture, produce:
1. **Design Tokens** — JSON block: colors, typography, spacing, breakpoints
2. **Component Tree** — full list of UI components with props interface (TypeScript)
3. **Page Layouts** — for each major screen: describe layout, zones, interactions
4. **User Flows** — Mermaid flowchart for key user journeys
5. **Accessibility** — WCAG compliance notes
6. **Component Specs** — for top 5 components: state, variants, behaviour
Be specific to the project. Reference actual fields from the BRD.`,

    codegen: `You are an elite full-stack engineer. Given a BRD, architecture, and UI/UX specs, generate production-ready code.
Output as a file tree, then each file's full content in a code block with filename as comment on first line.
Include: React components (TypeScript, Tailwind), API routes (Next.js), TypeScript types, Zustand store, utility functions.
Code must be complete, functional, well-typed. No placeholders. Use real logic based on BRD requirements.`,

    review: `You are a Principal Engineer conducting a code review. Given code output from the Code Dev agent, produce:
1. **Executive Summary** — overall quality score (1-10) with justification
2. **Critical Issues** — security vulnerabilities, bugs (must fix)
3. **High Priority** — performance problems, bad patterns
4. **Medium Priority** — code quality, maintainability
5. **Low Priority** — style, naming
For each issue: File | Line | Issue | Severity | Fix (with corrected code snippet)
6. **Corrected Files** — provide fixed versions of files with critical issues`,

    qa: `You are a QA Lead. Given the BRD and generated code, produce a complete test suite:
1. **Test Plan** — scope, approach, environments
2. **Unit Tests** — Jest tests for all utility functions and hooks (full code)
3. **Component Tests** — React Testing Library for key components (full code)
4. **Integration Tests** — API route tests
5. **E2E Test Cases** — Cypress test descriptions for critical user flows
6. **Test Coverage Map** — table: Module | Coverage % | Missing Cases
Output actual runnable test code, not descriptions.`,

    deploy: `You are a DevOps Engineer at KPMG. Given the BRD and project, produce:
1. **Dockerfile** — multi-stage, optimised for Next.js production
2. **docker-compose.yml** — with all services (app, db, redis if needed)
3. **GitHub Actions CI/CD** — full pipeline: lint, test, build, deploy
4. **Environment Config** — .env.example with all required variables
5. **Kubernetes manifests** — Deployment, Service, Ingress (if needed)
6. **Deployment Runbook** — step-by-step production deploy guide
All config must reference the actual project and tech stack from the BRD.`,
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ agent: string }> }) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { agent } = await params;
    const { brdContext, priorOutputs, customInstructions, feedback } = await req.json();

    const systemPrompt = SYSTEM_PROMPTS[agent] || SYSTEM_PROMPTS.architecture;

    const userContent = [
        brdContext && `## BRD Content\n${brdContext}`,
        priorOutputs && `## Prior Agent Outputs\n${priorOutputs}`,
        customInstructions && `## Developer Instructions\n${customInstructions}`,
        feedback && `## Developer Feedback (re-run request)\n${feedback}`,
    ].filter(Boolean).join("\n\n");

    const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        stream: true,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
        ],
    });

    const enc = new TextEncoder();
    return new Response(
        new ReadableStream({
            async start(ctrl) {
                for await (const chunk of stream) {
                    const t = chunk.choices[0]?.delta?.content || "";
                    ctrl.enqueue(enc.encode(t));
                }
                ctrl.close();
            },
        }),
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
}
