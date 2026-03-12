// ─── BRD Management Store ──────────────────────────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BRDStatus = "Generating BRD" | "BRD Generated" | "BRD Review" | "Changes Requested" | "Approved" | "Development" | "UAT" | "Production" | "Archived";

export interface BRDComment {
    id: string;
    author: string;
    role: string;
    content: string;
    timestamp: string;
    section?: string;
}

export interface BRDVersion {
    version: string;
    status: BRDStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    changeSummary: string;
    input: BRDInput;
    sections: BRDSections;
}

export interface BRDSections {
    executiveSummary: string;
    businessContext: string;
    scope: string;
    processFlow: string;
    techStackMapping: string;
    functionalRequirements: string;
    nonFunctionalRequirements: string;
    acceptanceCriteria: string;
    risksAndAssumptions: string;
}

export interface BRDInput {
    projectName: string;
    objective: string;
    problemStatement: string;
    currentProcess: string;
    desiredOutcome: string;
    stakeholders: string;
    kpis: string;
    constraints: string;
    projectCode?: string;
    customVersion?: string;
    sapModule?: string;
    uploadedFiles?: string[];
}

export interface BRDRecord {
    id: string;
    projectCode: string;
    projectName: string;
    version: string;
    status: BRDStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    input: BRDInput;
    sections: BRDSections;
    comments: BRDComment[];
    versionHistory: BRDVersion[];
    isLocked: boolean;
    reviewerEmail?: string;
    assignedDeveloperEmail?: string;
}

// ─── Mock Generated Sections ──────────────────────────────────────────────

function makeSections(projectName: string, objective: string): BRDSections {
    return {
        executiveSummary: `This Business Requirement Document outlines the functional and non-functional requirements for the ${projectName} initiative. The primary objective is to ${objective.toLowerCase()}. This document serves as the contractual baseline between the business stakeholders and the implementation team.`,

        businessContext: `The organisation is undertaking the ${projectName} to address critical operational inefficiencies and align with the digital transformation roadmap. Current systems are operating on legacy infrastructure, resulting in manual workarounds, data silos, and delayed decision-making. This initiative will replace the existing process landscape with an integrated SAP S/4HANA platform.`,

        scope: `**In Scope:**\n- End-to-end process digitisation across Finance (FI/CO), Procurement (MM), and Sales (SD) modules\n- Real-time reporting and analytics via SAP Analytics Cloud\n- Integration with existing CRM and third-party logistics systems\n\n**Out of Scope:**\n- HR / Payroll module implementation\n- Legacy system decommissioning (Phase 2)\n- Country-specific tax localisation beyond India GST`,

        processFlow: `**Current State (As-Is):**\nManual purchase requisitions → Email-based approvals → Manual PO creation → Paper-based GR → Manual invoice matching\n\n**Future State (To-Be):**\nAutomatic PR from MRP → Workflow-based digital approvals → Auto PO generation → GR confirmation via mobile app → 3-way match automation → Scheduled payment runs\n\n**Key Process Improvements:**\n- Eliminate 42 manual touchpoints\n- Reduce PO processing time from 5 days to 4 hours\n- Auto-archive all transaction documents`,

        techStackMapping: `| Component | Technology | Function |\n|---|---|---|\n| Frontend | React/Next.js web app | External vendor portal interface |\n| Backend | Node.js + OpenAPI | Secure API layer for vendor interactions |\n| Integration | SAP CPI iFlow | Syncing portal data with core ERP |\n| Identity | Okta / Entra ID | Vendor authentication |`,

        functionalRequirements: `FR-001: System shall support automated 3-way purchase order matching (PO / GR / Invoice) within 2 hours of invoice receipt.\nFR-002: Buyers shall receive automated email alerts for price variances exceeding 5% of PO value.\nFR-003: Workflow approval routing shall be configurable by business unit and spend threshold.\nFR-004: The system shall generate payment proposals for approved invoices on a scheduled daily basis.\nFR-005: All financial postings shall carry full audit trail with user, timestamp, and change reason.\nFR-006: Reporting module shall provide real-time cash flow position updated every 15 minutes.\nFR-007: Mobile-responsive interface required for field-based goods receipt confirmation.\nFR-008: Vendor portal integration shall allow real-time invoice status visibility to external suppliers.`,

        nonFunctionalRequirements: `NFR-001: System availability shall be 99.9% uptime (excluding planned maintenance windows).\nNFR-002: End-to-end transaction processing time shall not exceed 2 seconds under normal load.\nNFR-003: Platform shall support concurrent usage by up to 2,000 active users without performance degradation.\nNFR-004: All data transmissions shall be encrypted using TLS 1.3 end-to-end.\nNFR-005: Role-based access control (RBAC) shall be enforced at both application and database layers.\nNFR-006: Disaster recovery RPO: 1 hour; RTO: 4 hours.\nNFR-007: System shall comply with GDPR, SOX, and India DPDP Act data governance requirements.`,

        acceptanceCriteria: `AC-001: All 8 functional requirements passed in User Acceptance Testing with zero critical defects.\nAC-002: System performance benchmarks met under simulated peak load (2,000 concurrent users).\nAC-003: End-to-end P2P cycle completed without manual intervention in 3 consecutive UAT rounds.\nAC-004: Security penetration test completed with no High or Critical findings outstanding.\nAC-005: Sign-off obtained from: Finance Director, IT Director, Procurement Head, and Project Sponsor.\nAC-006: Training completion rate of ≥ 90% for all end-user groups before go-live.\nAC-007: Parallel run of 4 weeks with zero critical reconciliation breaks between old and new system.`,

        risksAndAssumptions: `**Risks:**\n⚠️ R-001 (HIGH): Legacy vendor master data quality is poor — 34% records have incomplete addresses. Mitigation: Dedicate data cleansing sprint in Week 3–4.\n⚠️ R-002 (MEDIUM): Key business SMEs flagged as unavailable during August due to year-end close. Mitigation: Reschedule UAT to September.\n⚠️ R-003 (LOW): Third-party logistics API documentation is outdated. Mitigation: Schedule API discovery workshop.\n\n**Assumptions:**\nA-001: SAP S/4HANA 2023 licence procured and available by project start date.\nA-002: Existing network infrastructure supports SAP HANA minimum bandwidth requirements.\nA-003: All business stakeholders will be available for requirement validation workshops.\nA-004: Data migration covers 3 years of historical transactional data only.`,
    };
}

// ─── Initial BRD Data ─────────────────────────────────────────────────────

const secs1 = makeSections("Global ERP Rollout", "digitise the procure-to-pay and order-to-cash cycles across 12 global business units");
const secs2 = makeSections("Finance Module Upgrade", "upgrade the financial accounting module to support real-time IFRS reporting");
const secs3 = makeSections("S/4HANA Migration", "migrate all legacy SAP ECC systems to S/4HANA 2023 with zero data loss");
const secs4 = makeSections("Vendor Portal Integration", "provide vendors with a self-service portal for invoice submission and payment tracking");

const INPUT1: BRDInput = {
    projectName: "Global ERP Rollout",
    objective: "Digitise the procure-to-pay and order-to-cash cycles across 12 global business units",
    problemStatement: "Manual purchase processes cause 5-day delays in procurement cycles and result in frequent invoice mismatches.",
    currentProcess: "Paper-based requisitions, email approvals, manual PO creation, manual GR and invoice matching.",
    desiredOutcome: "Fully automated P2P and OTC processes with real-time financial visibility.",
    customVersion: "v2.1",
    stakeholders: "Finance Director, Procurement Head, IT Director, Regional Operations Managers",
    kpis: "PO processing time < 4 hours, Invoice match rate > 98%, System uptime > 99.9%",
    constraints: "Go-live must occur before Q1 financial year close. Budget cap of $4.2M.",
    projectCode: "PRJ-KPMG-001",
    sapModule: "React/Next.js web app",
};

const INPUT2: BRDInput = {
    projectName: "Finance Module Upgrade",
    objective: "Upgrade the financial accounting module to support real-time IFRS reporting",
    problemStatement: "Current FI module does not support IFRS 16 lease accounting, forcing manual adjustments at period end.",
    currentProcess: "Manual Excel-based IFRS adjustments uploaded to SAP ECC monthly.",
    desiredOutcome: "Automated IFRS 16 calculations and real-time lease liability reporting within SAP S/4HANA.",
    customVersion: "v1.2",
    stakeholders: "CFO, Financial Controller, External Auditors",
    kpis: "Period-end close reduced from 10 days to 3 days, zero manual IFRS adjustments",
    constraints: "Must be live before Q2 external audit. No changes to chart of accounts structure.",
    projectCode: "PRJ-KPMG-002",
    sapModule: "SAPUI5 Fiori Elements",
};

const INPUT3: BRDInput = {
    projectName: "S/4HANA Migration",
    objective: "Migrate all legacy SAP ECC systems to S/4HANA 2023 with zero data loss",
    problemStatement: "SAP ECC 6.0 reaches end of maintenance in 2027. Business must migrate to avoid unsupported platform risk.",
    currentProcess: "Three separate ECC instances across APAC, EMEA, and Americas regions.",
    desiredOutcome: "Single consolidated S/4HANA instance with global process harmonisation.",
    customVersion: "v1.0",
    stakeholders: "CIO, Regional IT Heads, SAP Centre of Excellence",
    kpis: "Zero data loss, < 24hr cutover downtime, 100% process parity post-migration",
    constraints: "Migration must not impact year-end financial close. Americas region deferred to Phase 2.",
    projectCode: "PRJ-KPMG-003",
    sapModule: "SAP S/4HANA",
};

const INPUT4: BRDInput = {
    projectName: "Vendor Portal Integration",
    objective: "Provide vendors with a self-service portal for invoice submission and payment tracking",
    problemStatement: "Vendor enquiries about invoice status consume 40% of AP team's time. Manual portal updates cause errors.",
    currentProcess: "Vendors email AP team for status. AP manually checks SAP and replies.",
    desiredOutcome: "Vendors self-serve invoice status, submit invoices electronically, and receive automated payment notifications.",
    customVersion: "v1.0",
    stakeholders: "AP Manager, Procurement Director, 150+ Vendor Partners",
    kpis: "AP query volume reduced 80%, invoice processing time < 24hrs, vendor satisfaction > 4.5/5",
    constraints: "Must use existing SAP Fiori framework. No new middleware allowed.",
    projectCode: "PRJ-KPMG-004",
    sapModule: "React/Next.js web app",
};

export const INITIAL_BRDS: BRDRecord[] = [
    {
        id: "BRD-001",
        projectCode: "PRJ-KPMG-001",
        projectName: "Global ERP Rollout",
        version: "v2.1",
        status: "Approved",
        createdAt: "2026-02-10T09:30:00Z",
        updatedAt: "2026-03-01T14:20:00Z",
        createdBy: "Ujjwal Gupta",
        isLocked: true,
        input: INPUT1,
        sections: secs1,
        reviewerEmail: "vikash",
        comments: [
            { id: "c1", author: "Jane Smith", role: "Business User", content: "Scope section updated to include GST localisation requirements for India entities.", timestamp: "2026-02-28T10:15:00Z", section: "scope" },
            { id: "c2", author: "Admin", role: "Admin", content: "BRD v2.1 formally approved by Steering Committee on 1 March 2026.", timestamp: "2026-03-01T14:20:00Z" },
        ],
        versionHistory: [
            { version: "v1.0", status: "BRD Generated", createdAt: "2026-02-10T09:30:00Z", updatedAt: "2026-02-10T09:30:00Z", createdBy: "Ujjwal Gupta", changeSummary: "Initial draft created from stakeholder workshop.", input: INPUT1, sections: secs1 },
            { version: "v2.0", status: "BRD Review", createdAt: "2026-02-20T11:00:00Z", updatedAt: "2026-02-20T11:00:00Z", createdBy: "Business User", changeSummary: "Added SAP module mapping and updated scope based on business user review.", input: INPUT1, sections: secs1 },
            { version: "v2.1", status: "Approved", createdAt: "2026-03-01T09:00:00Z", updatedAt: "2026-03-01T14:20:00Z", createdBy: "Ujjwal Gupta", changeSummary: "Incorporated India GST localisation requirements. Final version.", input: INPUT1, sections: secs1 },
        ],
    },
    {
        id: "BRD-002",
        projectCode: "PRJ-KPMG-002",
        projectName: "Finance Module Upgrade",
        version: "v1.2",
        status: "BRD Generated",
        createdAt: "2026-02-18T11:00:00Z",
        updatedAt: "2026-03-03T09:45:00Z",
        createdBy: "Ujjwal Gupta",
        isLocked: false,
        input: INPUT2,
        sections: secs2,
        comments: [
            { id: "c3", author: "Sarah Lee", role: "Business User", content: "Please clarify the reporting currency requirements — USD only or multi-currency?", timestamp: "2026-03-02T14:30:00Z", section: "functionalRequirements" },
        ],
        versionHistory: [
            { version: "v1.0", status: "Generating BRD", createdAt: "2026-02-18T11:00:00Z", updatedAt: "2026-02-18T11:00:00Z", createdBy: "Ujjwal Gupta", changeSummary: "Initial draft.", input: INPUT2, sections: secs2 },
            { version: "v1.2", status: "BRD Generated", createdAt: "2026-03-03T09:45:00Z", updatedAt: "2026-03-03T09:45:00Z", createdBy: "Ujjwal Gupta", changeSummary: "Updated acceptance criteria to include audit sign-off requirement.", input: INPUT2, sections: secs2 },
        ],
    },
    {
        id: "BRD-003",
        projectCode: "PRJ-KPMG-003",
        projectName: "S/4HANA Migration",
        version: "v1.0",
        status: "BRD Review",
        createdAt: "2026-03-01T08:00:00Z",
        updatedAt: "2026-03-03T16:00:00Z",
        createdBy: "Ujjwal Gupta",
        isLocked: false,
        input: INPUT3,
        sections: secs3,
        reviewerEmail: "vikash",
        comments: [
            { id: "c4", author: "Admin", role: "Admin", content: "Scope needs to clearly exclude Americas region. Please revise Section 2 (Scope).", timestamp: "2026-03-03T16:00:00Z", section: "scope" },
        ],
        versionHistory: [
            { version: "v1.0", status: "BRD Review", createdAt: "2026-03-01T08:00:00Z", updatedAt: "2026-03-03T16:00:00Z", createdBy: "Ujjwal Gupta", changeSummary: "Initial draft submitted for review.", input: INPUT3, sections: secs3 },
        ],
    },
    {
        id: "BRD-004",
        projectCode: "PRJ-KPMG-004",
        projectName: "Vendor Portal Integration",
        version: "v1.0",
        status: "BRD Generated",
        createdAt: "2026-03-04T07:00:00Z",
        updatedAt: "2026-03-04T07:00:00Z",
        createdBy: "Ujjwal Gupta",
        isLocked: false,
        input: INPUT4,
        sections: secs4,
        reviewerEmail: "vikash",
        comments: [],
        versionHistory: [
            { version: "v1.0", status: "BRD Generated", createdAt: "2026-03-04T07:00:00Z", updatedAt: "2026-03-04T07:00:00Z", createdBy: "Ujjwal Gupta", changeSummary: "Initial requirement gathering.", input: INPUT4, sections: secs4 },
        ],
    },
];

// ─── BRD AI Responses ─────────────────────────────────────────────────────

export const BRD_AI_RESPONSES: Record<string, string[]> = {
    "improve-wording": [
        "✍️ Analysing document language...\n\n",
        "**Wording Improvements Identified:**\n\n",
        "**Section: Executive Summary**\n",
        "→ *'digitise'* → *'digitally transform'* (more executive-appropriate)\n",
        "→ Split run-on sentence at paragraph 2 for improved readability.\n\n",
        "**Section: Functional Requirements**\n",
        "→ FR-001: Replace *'within 2 hours'* with *'within a 2-hour SLA window'* for contractual precision.\n",
        "→ FR-007: Clarify *'mobile-responsive'* — specify iOS/Android minimum OS versions.\n\n",
        "✅ **8 wording suggestions generated. Apply individually or in bulk.**",
    ],
    "simplify-terms": [
        "🔍 Scanning for technical jargon...\n\n",
        "**Plain Language Suggestions:**\n\n",
        "• *3-way match* → **'Automatic verification of purchase order, delivery, and invoice'**\n",
        "• *IDoc* → **'SAP standard data transfer format'**\n",
        "• *RPO / RTO* → **'Maximum data loss window / Maximum downtime allowed'**\n",
        "• *RBAC* → **'User permission controls based on job role'**\n",
        "• *CPI (Cloud Platform Integration)* → **'SAP's cloud-based data connection service'**\n\n",
        "✅ **5 technical terms simplified for executive audience.**",
    ],
    "check-completeness": [
        "🔎 Running requirement completeness check...\n\n",
        "**Completeness Score: 82 / 100**\n\n",
        "**Missing Items Detected:**\n",
        "❌ No data migration strategy referenced in scope.\n",
        "❌ Training plan and cutover strategy not mentioned in AC.\n",
        "⚠️ FR-003 (Workflow approval) lacks mention of mobile approval capability.\n",
        "⚠️ NFR section does not specify browser compatibility requirements.\n\n",
        "**Recommendations:**\n",
        "→ Add AC-008: Cutover plan approved by IT Director.\n",
        "→ Add NFR-008: System shall support Chrome 120+, Edge 120+, Safari 17+.\n\n",
        "✅ **Completeness check done. 4 actions recommended.**",
    ],
    "suggest-kpis": [
        "📊 Generating KPI suggestions based on document context...\n\n",
        "**Recommended KPIs:**\n\n",
        "| KPI | Target | Measurement Frequency |\n",
        "|---|---|---|\n",
        "| PO Processing Time | < 4 hours | Daily |\n",
        "| Invoice Match Rate | > 98% | Weekly |\n",
        "| Period-End Close Duration | < 3 days | Monthly |\n",
        "| System Availability | > 99.9% | Real-time |\n",
        "| User Adoption Rate | > 90% in Month 1 | Monthly |\n",
        "| AP Query Volume Reduction | > 80% | Monthly |\n\n",
        "✅ **6 KPIs suggested. Add to Acceptance Criteria section.**",
    ],
    "identify-risks": [
        "⚠️ Scanning document for risk coverage gaps...\n\n",
        "**Risks Already Documented:** 3\n\n",
        "**Unaddressed Risks Identified:**\n",
        "🔴 R-NEW-001 (HIGH): No fallback plan if vendor portal integration API is unavailable at go-live.\n",
        "🟠 R-NEW-002 (MEDIUM): Change management plan not referenced — end-user resistance risk.\n",
        "🟠 R-NEW-003 (MEDIUM): Parallel run period not defined — increases reconciliation risk.\n",
        "🟡 R-NEW-004 (LOW): No mention of SAP licence contingency if additional named users required.\n\n",
        "✅ **4 new risks identified. Add to Risks & Assumptions section.**",
    ],
};

interface BRDStore {
    brds: BRDRecord[];
    addBRD: (brd: BRDRecord) => void;
    updateBRDStatus: (id: string, status: BRDStatus, reviewerEmail?: string, developerEmail?: string) => void;
    deleteBRD: (id: string) => void;
    deleteVersion: (id: string, version: string) => void;
    addComment: (id: string, comment: Omit<BRDComment, "id" | "timestamp">) => void;
    updateSections: (id: string, sections: BRDSections) => void;
    createMajorVersion: (id: string, routerPush?: (url: string) => void, newInput?: BRDInput) => void;
    updateCurrentVersion: (id: string, newInput: BRDInput) => void;
}

export const useBRDStore = create<BRDStore>()(
    persist(
        (set) => ({
            brds: [],
            addBRD: (brd) => set((state) => ({ brds: [brd, ...state.brds] })),
            updateBRDStatus: (id, status, reviewerEmail, developerEmail) => set((state) => ({
                brds: state.brds.map(b => {
                    if (b.id !== id) return b;
                    const now = new Date().toISOString();
                    return {
                        ...b,
                        status,
                        reviewerEmail: reviewerEmail || b.reviewerEmail,
                        assignedDeveloperEmail: developerEmail || b.assignedDeveloperEmail,
                        updatedAt: now,
                        versionHistory: b.versionHistory.length > 0
                            ? [
                                { ...b.versionHistory[0], status, updatedAt: now },
                                ...b.versionHistory.slice(1)
                            ]
                            : []
                    };
                })
            })),
            deleteBRD: (id) => set((state) => ({
                brds: state.brds.filter(b => b.id !== id)
            })),
            deleteVersion: (id, versionStr) => set((state) => {
                const brd = state.brds.find(b => b.id === id);
                if (!brd) return state;

                const newHistory = brd.versionHistory.filter(v => v.version !== versionStr);

                // If no versions left, delete the entire BRD
                if (newHistory.length === 0) {
                    return { brds: state.brds.filter(b => b.id !== id) };
                }

                // If the deleted version was the current one, promote the next recent one
                if (brd.version === versionStr) {
                    const nextRecent = newHistory[0];
                    return {
                        brds: state.brds.map(b => b.id === id ? {
                            ...b,
                            version: nextRecent.version,
                            status: nextRecent.status,
                            updatedAt: nextRecent.updatedAt,
                            versionHistory: newHistory
                        } : b)
                    };
                }

                // Otherwise just update the history
                return {
                    brds: state.brds.map(b => b.id === id ? {
                        ...b,
                        versionHistory: newHistory
                    } : b)
                };
            }),
            addComment: (id, comment) => set((state) => ({
                brds: state.brds.map(b => b.id === id ? {
                    ...b,
                    comments: [...b.comments, {
                        ...comment,
                        id: `C${Date.now()}`,
                        timestamp: new Date().toISOString()
                    }],
                    updatedAt: new Date().toISOString()
                } : b)
            })),
            updateSections: (id, sections) => set((state) => ({
                brds: state.brds.map(b => b.id === id ? {
                    ...b,
                    sections,
                    updatedAt: new Date().toISOString(),
                    versionHistory: b.versionHistory.map((v, idx) =>
                        idx === 0 ? { ...v, sections: { ...sections }, updatedAt: new Date().toISOString() } : v
                    )
                } : b)
            })),
            createMajorVersion: (id, routerPush, newInput) => set((state) => {
                const b = state.brds.find(brd => brd.id === id);
                if (!b) return state;

                // Calculate new major version
                const match = b.version.match(/v(\d+)\./);
                const major = match ? parseInt(match[1], 10) : 1;
                const newVersion = `v${major + 1}.0`;
                const now = new Date().toISOString();

                const updatedBrd: BRDRecord = {
                    ...b,
                    version: newVersion,
                    status: "BRD Review",
                    updatedAt: now,
                    isLocked: false,
                    versionHistory: [
                        {
                            version: newVersion,
                            status: "BRD Review",
                            createdAt: now,
                            updatedAt: now,
                            createdBy: "Ujjwal Gupta",
                            changeSummary: newInput ? `Major revision with updated requirements. Transitioned to ${newVersion}.` : `Major revision requested. Transitioned to ${newVersion}.`,
                            input: { ...b.input },
                            sections: { ...b.sections }
                        },
                        ...b.versionHistory
                    ]
                };

                if (newInput) {
                    updatedBrd.input = { ...newInput };
                    updatedBrd.projectName = newInput.projectName;
                    updatedBrd.projectCode = newInput.projectCode || b.projectCode;
                    // Mock re-generation of sections
                    updatedBrd.sections = makeSections(newInput.projectName, newInput.problemStatement);
                    updatedBrd.status = "Generating BRD";
                    // After short delay, set to Generated
                    setTimeout(() => {
                        useBRDStore.getState().updateBRDStatus(id, "BRD Generated");
                    }, 2000);
                }

                if (routerPush) {
                    setTimeout(() => routerPush(`/dashboard/pm/brd/${b.id}`), 100);
                }

                return {
                    brds: state.brds.map(brd => brd.id === b.id ? updatedBrd : brd)
                };
            }),
            updateCurrentVersion: (id, newInput) => set((state) => {
                const b = state.brds.find(brd => brd.id === id);
                if (!b) return state;

                const now = new Date().toISOString();
                const updatedBrd: BRDRecord = {
                    ...b,
                    projectName: newInput.projectName,
                    projectCode: newInput.projectCode || b.projectCode,
                    input: { ...newInput },
                    sections: makeSections(newInput.projectName, newInput.problemStatement),
                    updatedAt: now,
                    status: "Generating BRD",
                    versionHistory: b.versionHistory.map((v, idx) =>
                        idx === 0 ? {
                            ...v,
                            status: "Generating BRD" as const,
                            updatedAt: now,
                            input: { ...newInput },
                            changeSummary: "Requirements updated for current version."
                        } : v
                    )
                };

                setTimeout(() => {
                    useBRDStore.getState().updateBRDStatus(id, "BRD Generated");
                }, 2000);

                return {
                    brds: state.brds.map(brd => brd.id === id ? updatedBrd : brd)
                };
            })
        }),
        {
            name: "kpmg-brd-storage",
        }
    )
);
