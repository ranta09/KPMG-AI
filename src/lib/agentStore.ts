// ─── SAP AI Agent Ecosystem — Central Data Store ───────────────────────────

export type AgentStatus = "Active" | "Idle" | "Offline";
export type TaskStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type LogLevel = "info" | "warn" | "error" | "success";

export interface AgentTask {
    id: string;
    title: string;
    status: TaskStatus;
    progress: number; // 0-100
    createdAt: string;
    completedAt?: string;
    agentId: string;
}

export interface ExecutionLog {
    id: string;
    timestamp: string;
    level: LogLevel;
    message: string;
}

export interface ExecutionRecord {
    id: string;
    agentId: string;
    triggeredAt: string;
    completedAt: string;
    status: "completed" | "failed";
    input: string;
    output: string;
    duration: string;
}

export interface AgentCapability {
    label: string;
}

export interface AgentConfig {
    id: string;
    name: string;
    shortName: string;
    status: AgentStatus;
    purpose: string;
    capabilities: string[];
    buildTypes?: string[];
    projectContext: string;
    outputLabel: string;
    inputPlaceholder: string;
    inputLabel: string;
    color: string; // tailwind bg color class
    icon: string; // emoji or letter
}

export const AGENTS: AgentConfig[] = [
    {
        id: "requirement-analyst",
        name: "Requirement Analyst",
        shortName: "RA",
        status: "Active",
        purpose: "Interviews stakeholders and generates structured requirements from meeting transcripts.",
        capabilities: [
            "Accept meeting transcript (text input)",
            "Extract functional & non-functional requirements",
            "Identify Build Types (Web, SAP, RPA, etc.)",
            "Map requirements to standard business processes",
            "Generate structured BRD-ready specification",
            "Highlight missing information & raise clarifications",
            "Export to structured requirement document",
        ],
        buildTypes: ["Web Application", "SAP Fiori", "REST API", "RPA Bot", "Integration Workflow"],
        projectContext: "PRJ-001 – Global ERP Rollout",
        outputLabel: "Structured Requirement Document",
        inputLabel: "Paste Meeting Transcript",
        inputPlaceholder: "Paste your stakeholder meeting transcript, notes, or user story input here...",
        color: "bg-blue-600",
        icon: "RA",
    },
    {
        id: "brd-generator",
        name: "BRD Generator",
        shortName: "BG",
        status: "Active",
        purpose: "Transforms structured requirements into a comprehensive, procurement-ready Business Requirement Document.",
        capabilities: [
            "Pull structured input from Requirement Analyst",
            "Generate Executive Summary & Scope",
            "Map business processes to standard flows",
            "Build Acceptance Criteria & KPIs section",
            "Generate Risk & Dependency register",
            "Version control with BRD history",
            "Export as PDF or DOC format",
        ],
        projectContext: "PRJ-001 – Global ERP Rollout",
        outputLabel: "Business Requirement Document (BRD)",
        inputLabel: "Provide Structured Requirements",
        inputPlaceholder: "Paste the structured requirements output from the Requirement Analyst agent...",
        color: "bg-indigo-600",
        icon: "BG",
    },
    {
        id: "solution-architect",
        name: "Solution Architect",
        shortName: "SA",
        status: "Active",
        purpose: "Designs the full technical architecture including system landscape, integration patterns, and data flows.",
        capabilities: [
            "Define DEV / QAS / PRD system landscape",
            "Design integration architecture (PI/PO, CPI, REST)",
            "Generate data model structure",
            "Recommend custom vs. standard solution approach",
            "Create high-level architecture blueprint",
            "Identify performance & scalability risks",
            "Output architecture overview document",
        ],
        buildTypes: ["BASIS", "ABAP", "CPI", "PI/PO", "BTP", "React/Next.js", "Node.js"],
        projectContext: "PRJ-002 – S/4HANA Migration",
        outputLabel: "Architecture Blueprint",
        inputLabel: "Provide BRD or Scope Description",
        inputPlaceholder: "Describe the business scope or paste the approved BRD for architecture design...",
        color: "bg-violet-600",
        icon: "SA",
    },
    {
        id: "code-builder",
        name: "Code Builder",
        shortName: "CB",
        status: "Active",
        purpose: "Generates production-ready technical code including ABAP programs, CDS Views, Fiori components and OData services.",
        capabilities: [
            "Generate ABAP programs with best practices",
            "Create CDS Views with annotations",
            "Build Fiori UI5 XML view components",
            "Generate OData v2 / v4 services",
            "Create integration APIs for middleware",
            "Syntax-highlighted output with download",
            "Version tracking per generation",
        ],
        buildTypes: ["ABAP", "CDS", "Fiori", "OData", "BAPI", "React", "Next.js"],
        projectContext: "PRJ-002 – S/4HANA Migration",
        outputLabel: "ABAP / CDS / Fiori Code",
        inputLabel: "Describe the Technical Requirement",
        inputPlaceholder: "Describe the SAP technical object to generate (e.g. 'Create a CDS view for Sales Order with status filtering')...",
        color: "bg-cyan-600",
        icon: "CB",
    },
    {
        id: "test-orchestrator",
        name: "Test Orchestrator",
        shortName: "TO",
        status: "Idle",
        purpose: "Manages the full SAP testing lifecycle from test plan generation to defect tracking and UAT sign-off.",
        capabilities: [
            "Generate structured Test Plan document",
            "Create Unit, Integration & UAT test cases",
            "Build regression test suite from BRD",
            "Track test execution status per case",
            "Generate defect summary & risk report",
            "Export test documentation package",
        ],
        projectContext: "PRJ-003 – Finance Module Upgrade",
        outputLabel: "Test Plan & Test Cases Document",
        inputLabel: "Provide Functional Specification",
        inputPlaceholder: "Paste the functional specification or BRD to generate the test plan...",
        color: "bg-emerald-600",
        icon: "TO",
    },
    {
        id: "security-reviewer",
        name: "Security Reviewer",
        shortName: "SR",
        status: "Idle",
        purpose: "Analyzes SAP security posture — auditing ABAP code, authorization objects, and SoD conflicts.",
        capabilities: [
            "Analyze ABAP code for vulnerabilities",
            "Check authorization object assignments",
            "Validate SAP role configurations",
            "Detect Segregation of Duties (SoD) conflicts",
            "Highlight compliance gaps (SOX, GDPR)",
            "Output risk-rated security findings",
            "Generate recommended remediation steps",
        ],
        projectContext: "PRJ-001 – Global ERP Rollout",
        outputLabel: "Security Review Report (Risk-Rated)",
        inputLabel: "Paste ABAP Code or Role Configuration",
        inputPlaceholder: "Paste ABAP code, authorization object definitions, or role matrix for security review...",
        color: "bg-red-600",
        icon: "SR",
    },
    {
        id: "deployment-manager",
        name: "Deployment Manager",
        shortName: "DM",
        status: "Idle",
        purpose: "Manages SAP transport lifecycle across DEV → QAS → PRD ensuring safe, audited, and reversible deployments.",
        capabilities: [
            "Create and manage transport requests",
            "Track transport movement across landscapes",
            "Validate transport dependencies",
            "Generate deployment checklist",
            "Create rollback plan",
            "Output detailed deployment log",
            "Status tracking per transport object",
        ],
        projectContext: "PRJ-002 – S/4HANA Migration",
        outputLabel: "Deployment Plan & Transport Log",
        inputLabel: "Provide Transport Details",
        inputPlaceholder: "List the transport requests (e.g. DEVK900123) and target landscape for deployment planning...",
        color: "bg-orange-600",
        icon: "DM",
    },
    {
        id: "stakeholder-communicator",
        name: "Stakeholder Communicator",
        shortName: "SC",
        status: "Offline",
        purpose: "Translates complex SAP project data into stakeholder-friendly communications with adjustable tone and format.",
        capabilities: [
            "Generate weekly status reports",
            "Write executive summaries",
            "Draft meeting minutes from notes",
            "Create risk update communications",
            "Adjust tone: Executive / Technical / Business",
            "Convert technical output to business language",
            "Schedule and automate report delivery",
        ],
        projectContext: "PRJ-003 – Finance Module Upgrade",
        outputLabel: "Stakeholder Communication Document",
        inputLabel: "Provide Project Update Data",
        inputPlaceholder: "Paste project status, milestones, risks, and blockers to generate a stakeholder communication...",
        color: "bg-slate-600",
        icon: "SC",
    },
];

// Default task queues
export const INITIAL_TASKS: AgentTask[] = [
    // Requirement Analyst – 3 tasks
    { id: "t1", title: "Analyze Q1 Scope Meeting Transcript", status: "running", progress: 62, agentId: "requirement-analyst", createdAt: "2026-03-04T06:00:00Z" },
    { id: "t2", title: "Extract MM Module Requirements – PRJ-001", status: "queued", progress: 0, agentId: "requirement-analyst", createdAt: "2026-03-04T07:15:00Z" },
    { id: "t3", title: "Generate Clarification Questions for FI Team", status: "queued", progress: 0, agentId: "requirement-analyst", createdAt: "2026-03-04T08:30:00Z" },

    // BRD Generator – 1 task
    { id: "t4", title: "Generate BRD v2.1 from Approved Requirements", status: "queued", progress: 0, agentId: "brd-generator", createdAt: "2026-03-04T09:00:00Z" },

    // Solution Architect – 2 tasks
    { id: "t5", title: "Design Integration Architecture – CPI Layer", status: "running", progress: 35, agentId: "solution-architect", createdAt: "2026-03-04T05:45:00Z" },
    { id: "t6", title: "Build Data Model for SD–FI Integration", status: "queued", progress: 0, agentId: "solution-architect", createdAt: "2026-03-04T08:00:00Z" },

    // Code Builder – 5 tasks
    { id: "t7", title: "Generate ABAP BAdI for MM Invoice Exit", status: "running", progress: 80, agentId: "code-builder", createdAt: "2026-03-04T04:30:00Z" },
    { id: "t8", title: "Create CDS View: Sales Order Header", status: "queued", progress: 0, agentId: "code-builder", createdAt: "2026-03-04T06:45:00Z" },
    { id: "t9", title: "Build Fiori Tile – Requisition Approval", status: "queued", progress: 0, agentId: "code-builder", createdAt: "2026-03-04T07:00:00Z" },
    { id: "t10", title: "Generate OData Service for Financial Postings", status: "queued", progress: 0, agentId: "code-builder", createdAt: "2026-03-04T07:30:00Z" },
    { id: "t11", title: "Create BAPI Wrapper for Vendor Master", status: "queued", progress: 0, agentId: "code-builder", createdAt: "2026-03-04T08:00:00Z" },
];

// Default execution history
export const EXECUTION_HISTORY: Record<string, ExecutionRecord[]> = {
    "requirement-analyst": [
        { id: "h1", agentId: "requirement-analyst", triggeredAt: "2026-03-03T14:20:00Z", completedAt: "2026-03-03T14:23:15Z", status: "completed", input: "Kickoff meeting transcript – Scope Definition", output: "Generated 24 functional requirements across MM, SD modules.", duration: "3m 15s" },
        { id: "h2", agentId: "requirement-analyst", triggeredAt: "2026-03-02T10:05:00Z", completedAt: "2026-03-02T10:07:48Z", status: "completed", input: "FI Workshop Transcript – Period End Closing", output: "Extracted 18 requirements. 3 clarifications raised.", duration: "2m 48s" },
    ],
    "brd-generator": [
        { id: "h3", agentId: "brd-generator", triggeredAt: "2026-03-03T15:00:00Z", completedAt: "2026-03-03T15:04:30Z", status: "completed", input: "Approved requirements v1.0", output: "BRD v1.0 generated – 42 pages. Exported to PDF.", duration: "4m 30s" },
    ],
    "solution-architect": [
        { id: "h4", agentId: "solution-architect", triggeredAt: "2026-03-03T09:30:00Z", completedAt: "2026-03-03T09:36:10Z", status: "completed", input: "BRD v1.0 – Full scope", output: "Architecture blueprint v1.0 created. CPI middleware recommended.", duration: "6m 10s" },
    ],
    "code-builder": [
        { id: "h5", agentId: "code-builder", triggeredAt: "2026-03-03T11:00:00Z", completedAt: "2026-03-03T11:02:50Z", status: "completed", input: "CDS view request – Purchase Order", output: "CDS View I_PurchaseOrder generated with 12 fields.", duration: "2m 50s" },
        { id: "h6", agentId: "code-builder", triggeredAt: "2026-03-02T16:40:00Z", completedAt: "2026-03-02T16:41:20Z", status: "failed", input: "ABAP Report for GR/IR Clearing", output: "Error: Insufficient context for SAP system version.", duration: "1m 20s" },
    ],
    "test-orchestrator": [],
    "security-reviewer": [],
    "deployment-manager": [],
    "stakeholder-communicator": [],
};
