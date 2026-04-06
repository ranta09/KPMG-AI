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
    hiddenSections?: (keyof BRDSections)[];
}

export interface BRDSections {
    documentControl: string;
    executiveSummary: string;
    purposeAndScope: string;
    systemLandscape: string;
    businessProcessOverview: string;
    detailedBusinessProcess: string;
    businessRequirements: string;
    functionalRequirements: string;
    ricefwClassification: string;
    interfaceDesign: string;
    dataRequirements: string;
    securityAndAuthorization: string;
    reportingRequirements: string;
    errorHandling: string;
    performanceRequirements: string;
    testStrategy: string;
    transportManagement: string;
    openPoints: string;
    appendices: string;
}

export interface BRDInput {
    projectName: string;
    client: string;
    preparedBy: string;
    organization: string;
    clientReviewers: string;
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
    hiddenSections?: (keyof BRDSections)[];
    comments: BRDComment[];
    versionHistory: BRDVersion[];
    isLocked: boolean;
    reviewerEmail?: string;
    assignedDeveloperEmail?: string;
}

// ─── Premium BRD Section Generator ───────────────────────────────────────

interface MakeSectionsParams {
    input: BRDInput;
    title?: string;
    mainCategory?: string;
    subCategory?: string;
    version?: string;
}

export function makeSections(params: MakeSectionsParams): BRDSections {
    const { input, title, mainCategory, subCategory, version } = params;
    const pName = title || input.projectName;
    const tech = subCategory || input.sapModule || "the target platform";
    const techCategory = mainCategory || "Enterprise Technology";
    const ver = version || input.customVersion || "1.0";
    const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const obj = input.objective || "deliver a scalable, high-performance solution aligned with business objectives";
    const problem = input.problemStatement || "Current processes require modernisation to meet evolving business demands.";
    const currentProc = input.currentProcess || "Existing manual and semi-automated workflows across disparate systems.";
    const desired = input.desiredOutcome || "A fully integrated, automated solution delivering measurable operational improvements.";
    const stakeholders = input.stakeholders || "Executive Sponsor, Project Manager, Business Process Owners, IT Delivery Team";
    const kpis = input.kpis || "System availability > 99.9%, Process cycle time reduction > 40%, User adoption > 90%";
    const constraints = input.constraints || "Implementation to align with organisational strategy, budget, and regulatory requirements.";
    const client = input.client || "KPMG Client";
    const org = input.organization || "KPMG Global";
    const preparedBy = input.preparedBy || "KPMG Project Team";
    const reviewers = input.clientReviewers || "To be confirmed";
    const projectCode = input.projectCode || "PRJ-XXX";
    const uploadedFiles = input.uploadedFiles || [];

    const stakeholderList = stakeholders.split(",").map(s => s.trim()).filter(Boolean);
    const kpiList = kpis.split(",").map(s => s.trim()).filter(Boolean);

    return {
        documentControl:
`| Field | Value |
|---|---|
| Document Title | ${pName} — Business Requirements Document |
| Project Code | ${projectCode} |
| Version | ${ver} |
| Status | Draft |
| Date | ${dateStr} |
| Prepared By | ${preparedBy} |
| Organisation | ${org} |
| Client | ${client} |
| Client Reviewers | ${reviewers} |

**Distribution List:** All named stakeholders and project governance board members.

**Document Revision History:**
| Version | Date | Author | Change Description |
|---|---|---|---|
| ${ver} | ${dateStr} | ${preparedBy} | Initial draft — requirements captured from stakeholder workshops and discovery sessions. |`,

        executiveSummary:
`**${pName}**

${org}, in partnership with ${client}, is undertaking the ${pName} initiative to ${obj.toLowerCase()}. This Business Requirements Document (BRD) provides a comprehensive articulation of the business needs, functional expectations, technical constraints, and success criteria that will govern the solution design, development, and deployment lifecycle.

**Business Context:**
${problem} The current operational model is characterised by ${currentProc.toLowerCase()}. These inefficiencies directly impact process throughput, data integrity, and stakeholder confidence in reporting outputs.

**Strategic Intent:**
This initiative is positioned as a strategic enabler to ${desired.toLowerCase()}. The solution leverages ${tech} within the ${techCategory} ecosystem, aligning with the organisation's broader digital transformation roadmap.

**Expected Outcomes:**
${kpiList.map((k, i) => `${i + 1}. ${k}`).join("\n")}

**Key Stakeholders:** ${stakeholderList.join(", ")}

**Constraints & Boundaries:** ${constraints}`,

        purposeAndScope:
`**Purpose:**
The purpose of this document is to formally capture, structure, and validate the business requirements for the ${pName} initiative. It serves as the authoritative reference for all downstream activities including solution design, development, testing, and deployment. This BRD ensures alignment between business expectations and technical delivery, providing traceability from requirement through to acceptance.

**In Scope:**
- End-to-end process analysis and redesign for the identified business domain
- Solution architecture and implementation using ${tech} (${techCategory})
- Integration with existing enterprise systems and data sources as identified during discovery
- Data migration strategy, mapping, and validation for all in-scope master and transactional data
- Role-Based Access Control (RBAC) configuration aligned with organisational security policies
- User Acceptance Testing (UAT) support, training material development, and hypercare planning
- Reporting and analytics capabilities as defined in the Reporting Requirements section

**Out of Scope:**
- Business processes and systems not explicitly referenced in this document
- Infrastructure procurement or hardware provisioning (unless specified)
- Organisational change management beyond system training
- Third-party vendor contract negotiations

**Assumptions:**
- Stakeholder availability will be maintained throughout the project lifecycle for workshops, reviews, and sign-offs
- Existing system documentation and data dictionaries are current and accessible
- The target technical environment (${tech}) will be provisioned and accessible prior to the development phase
- ${constraints}`,

        systemLandscape:
`**Current State Architecture:**
The existing technology landscape comprises ${currentProc.toLowerCase()}. Key pain points include fragmented data flows, manual handoffs between systems, limited real-time visibility, and dependency on legacy interfaces that are approaching end-of-life or end-of-support.

**Proposed State Architecture:**
The target solution will be implemented on the ${tech} platform within the ${techCategory} stack. The proposed architecture introduces:

| Layer | Component | Description |
|---|---|---|
| Presentation | ${tech} UI / Portal | User-facing interface for process execution, approvals, and monitoring |
| Application | ${tech} Core Engine | Business logic, workflow orchestration, and rules processing |
| Integration | API / Middleware Layer | Real-time and batch integrations with upstream and downstream systems |
| Data | Operational Data Store | Centralised data repository with master data governance |
| Analytics | Reporting & Dashboards | Operational and strategic reporting for KPI monitoring |
| Security | IAM / RBAC | Role-based access control, encryption, and audit logging |

**Integration Touchpoints:**
- Core ERP / Financial Systems (master data synchronisation)
- Identity Provider (SSO / MFA authentication)
- Document Management System (attachments, approvals)
- Notification Services (email, in-app alerts)
- External Partner / Vendor Systems (as applicable)

**Technology Decisions:**
The selection of ${tech} is predicated on its alignment with the organisation's technology standards, scalability requirements, and the availability of skilled resources within the delivery team.`,

        businessProcessOverview:
`**Process Domain:** ${pName}

**Current State (As-Is):**
${currentProc} This process is characterised by high manual effort, limited auditability, and significant cycle time variability. Key pain points include: ${problem.toLowerCase()}

**Future State (To-Be):**
${desired} The redesigned process will leverage ${tech} to introduce automation at key decision points, enforce standardised workflows, and provide real-time visibility to all stakeholders.

**High-Level Process Flow:**

| Step | Phase | Actor | System | Description |
|---|---|---|---|---|
| 1 | Initiation | Business User | ${tech} | Process request is submitted with supporting data and documentation |
| 2 | Validation | System | ${tech} | Automated validation of completeness, business rules, and data integrity |
| 3 | Routing | System | Workflow Engine | Intelligent routing to appropriate approver(s) based on configurable rules |
| 4 | Approval | Approver | ${tech} | Review, approve, reject, or request clarification with full audit trail |
| 5 | Execution | System | ${tech} + Integrations | Automated processing, data synchronisation, and downstream system updates |
| 6 | Notification | System | Notification Service | Real-time alerts to stakeholders on status changes and exceptions |
| 7 | Reporting | Management | Analytics Dashboard | KPI monitoring, SLA tracking, and exception reporting |

**Process Metrics (Target):**
${kpiList.map(k => `- ${k}`).join("\n")}`,

        detailedBusinessProcess:
`**Detailed Process Specification — ${pName}**

**1. Process Initiation & Data Capture**
- Actor: Business User / Requestor
- System: ${tech}
- Description: The initiating user accesses the ${tech} interface and submits a structured request. The system enforces mandatory field validation, applies default values where applicable, and assigns a unique reference identifier. Supporting documents may be attached at this stage.
- Business Rules: All mandatory fields must be completed before submission. Duplicate detection logic prevents redundant entries.

**2. Automated Validation & Enrichment**
- Actor: System (automated)
- System: ${tech} Rules Engine
- Description: Upon submission, the system performs real-time validation including data type checks, cross-reference validation against master data, and business rule compliance. The system enriches the request with derived attributes (e.g., cost centre mapping, approval hierarchy determination).
- Exception Path: Validation failures are returned to the initiator with specific error messages and remediation guidance.

**3. Approval Workflow**
- Actor: Designated Approver(s)
- System: ${tech} Workflow Engine
- Description: The request is routed through a configurable multi-level approval workflow. Approval rules are based on organisational hierarchy, monetary thresholds, and business domain. Approvers receive notifications and can approve, reject, or escalate directly within the system.
- SLA: Approval actions must be completed within the defined SLA window. Automated escalation triggers if SLA is breached.

**4. Processing & System Integration**
- Actor: System (automated)
- System: ${tech} + Integration Layer
- Description: Upon final approval, the system executes the core business transaction. This includes posting to relevant financial or operational systems, triggering downstream integrations, updating master data records, and generating confirmation documents.
- Rollback: In the event of integration failure, the system implements compensating transactions and alerts the support team.

**5. Exception Handling & Resolution**
- Actor: Operations Support / Business User
- System: ${tech} Exception Console
- Description: Exceptions (validation failures, integration errors, SLA breaches) are captured in a centralised exception queue. Each exception is categorised by severity, assigned to the appropriate resolution team, and tracked through to closure.
- Escalation: Unresolved exceptions are escalated per the defined escalation matrix.

**6. Closure, Audit & Reporting**
- Actor: System / Management
- System: Analytics Dashboard
- Description: Completed transactions are archived with full audit trail. Management dashboards provide real-time visibility into process performance, exception rates, and KPI achievement. Period-end reports are generated automatically.`,

        businessRequirements:
`**Business Requirements — ${pName}**

| ID | Requirement | Priority | Rationale | Acceptance Criteria |
|---|---|---|---|---|
| BR-001 | The solution shall automate the end-to-end ${pName.toLowerCase()} process, eliminating manual handoffs and reducing cycle time. | Critical | ${problem} | Process cycle time reduced by ≥ 40% compared to current baseline. |
| BR-002 | The system shall enforce standardised business rules and approval hierarchies across all organisational units. | Critical | Ensures consistency, compliance, and auditability across regions and departments. | 100% of transactions routed through configured approval workflows. |
| BR-003 | Real-time visibility into process status, KPIs, and exceptions shall be available to all authorised stakeholders. | High | Enables data-driven decision making and proactive exception management. | Dashboards reflect real-time data with < 5 minute latency. |
| BR-004 | The solution shall integrate with existing enterprise systems to ensure data consistency and eliminate duplicate data entry. | Critical | Fragmented systems currently cause data discrepancies and reconciliation overhead. | Zero manual data re-entry across integrated systems. |
| BR-005 | The system shall support role-based access control aligned with the organisation's security and compliance policies. | Critical | Regulatory and audit requirements mandate granular access controls. | RBAC model reviewed and approved by Information Security. |
| BR-006 | The solution shall provide comprehensive audit trails for all transactions, approvals, and system changes. | High | Audit and compliance requirements demand full traceability. | All user actions logged with timestamp, user ID, and action detail. |
| BR-007 | The system shall be scalable to accommodate growth in transaction volumes and user base without performance degradation. | Medium | Organisation growth trajectory requires the platform to scale without re-architecture. | System maintains performance SLAs at 2x current transaction volume. |
| BR-008 | The solution shall support multi-language and multi-currency capabilities as required by the organisation's operating model. | Medium | Global operations require localisation support. | All supported locales validated during UAT. |`,

        functionalRequirements:
`**Functional Requirements — ${pName}**

| ID | Requirement | Module / Area | Testable Criteria |
|---|---|---|---|
| FR-001 | The system shall provide a structured input form with mandatory field validation, default values, and contextual help text for process initiation. | ${tech} — UI | Form submission blocked if mandatory fields are incomplete; error messages displayed inline. |
| FR-002 | The system shall implement configurable, multi-level approval workflows with support for parallel, sequential, and conditional routing. | Workflow Engine | Workflows execute correctly for all configured routing scenarios (verified via test cases). |
| FR-003 | The system shall send real-time notifications (email and in-app) to relevant stakeholders upon status changes, approvals, rejections, and exceptions. | Notification Service | Notifications delivered within 60 seconds of triggering event. |
| FR-004 | The system shall perform automated validation of submitted data against master data records, business rules, and configurable thresholds. | ${tech} — Rules Engine | Invalid submissions are rejected with specific, actionable error messages. |
| FR-005 | The system shall provide a searchable, filterable dashboard displaying all in-progress, completed, and exception transactions. | ${tech} — UI | Dashboard loads within 3 seconds; filters return accurate results. |
| FR-006 | The system shall generate and store PDF/printable documents for all completed transactions, including approval chains and timestamps. | Document Service | Generated documents match the approved template; all fields populated correctly. |
| FR-007 | The system shall expose RESTful APIs for integration with upstream and downstream enterprise systems. | Integration Layer | API contracts validated via automated integration tests; all endpoints return expected responses. |
| FR-008 | The system shall support bulk upload and processing of transactions via structured file import (CSV / Excel). | ${tech} — Bulk Processing | Files with up to 10,000 records processed within 5 minutes; validation errors reported per row. |
| FR-009 | The system shall maintain a complete, immutable audit log of all user actions, system events, and data changes. | Audit Module | Audit log entries verified for all CRUD operations; logs cannot be modified or deleted by users. |
| FR-010 | The system shall support single sign-on (SSO) via the organisation's identity provider and enforce multi-factor authentication (MFA) for privileged operations. | Security / IAM | SSO login successful; MFA prompted for admin and approval actions. |`,

        ricefwClassification:
`**RICEFW Classification — ${pName}**

| Type | ID | Description | Module | Complexity | Estimated Effort |
|---|---|---|---|---|---|
| Report | R-001 | Operational Status Dashboard — real-time KPI and exception monitoring | Analytics | Medium | 3–5 days |
| Report | R-002 | Period-End Summary Report — consolidated transaction and financial reconciliation | Analytics | High | 5–8 days |
| Report | R-003 | Audit Trail Report — comprehensive log of all user actions and system events | Audit Module | Medium | 3–5 days |
| Interface | I-001 | Core ERP Integration — master data synchronisation and transactional posting | Integration | High | 8–12 days |
| Interface | I-002 | Identity Provider Integration — SSO / MFA authentication flow | Security | Medium | 3–5 days |
| Interface | I-003 | Notification Service Integration — email and in-app alert delivery | Notification | Low | 2–3 days |
| Interface | I-004 | Document Management Integration — attachment storage and retrieval | DMS | Medium | 3–5 days |
| Conversion | C-001 | Historical Data Migration — legacy data extraction, transformation, and loading | Data Migration | High | 10–15 days |
| Enhancement | E-001 | Configurable Approval Workflow Engine — multi-level, rule-based routing | Workflow | High | 8–12 days |
| Enhancement | E-002 | Bulk Upload Processing — structured file import with row-level validation | ${tech} | Medium | 5–7 days |
| Form | F-001 | Process Initiation Form — structured input with validation and contextual help | ${tech} — UI | Medium | 3–5 days |
| Form | F-002 | Exception Resolution Form — categorisation, assignment, and resolution tracking | ${tech} — UI | Medium | 3–5 days |
| Workflow | W-001 | Multi-Level Approval Workflow — configurable routing with escalation and SLA monitoring | Workflow Engine | High | 8–12 days |

**Complexity Legend:** Low (< 3 days), Medium (3–7 days), High (8–15 days)`,

        interfaceDesign:
`**Interface Design — ${pName}**

**1. Integration Architecture**
The solution adopts an API-first integration strategy, leveraging RESTful services for synchronous operations and event-driven messaging for asynchronous processes. All integrations are mediated through a centralised integration layer to ensure governance, monitoring, and reusability.

**2. Interface Inventory**

| Interface ID | Direction | Source | Target | Protocol | Frequency | Data Format |
|---|---|---|---|---|---|---|
| INT-001 | Bidirectional | ${tech} | Core ERP | REST API | Real-time | JSON |
| INT-002 | Inbound | Identity Provider | ${tech} | SAML 2.0 / OIDC | On-demand | Token-based |
| INT-003 | Outbound | ${tech} | Email / Notification Service | REST / SMTP | Event-driven | JSON / HTML |
| INT-004 | Bidirectional | ${tech} | Document Management System | REST API | On-demand | Multipart / JSON |
| INT-005 | Outbound | ${tech} | Analytics Platform | REST / Event Stream | Near real-time | JSON |

**3. API Design Standards**
- All APIs shall conform to OpenAPI 3.0 specification
- Authentication: OAuth 2.0 / Bearer Token
- Rate limiting: Configurable per endpoint (default 1,000 requests/minute)
- Versioning: URI-based (e.g., /api/v1/resource)
- Error responses: RFC 7807 Problem Details format
- Pagination: Cursor-based for list endpoints

**4. Data Contract Management**
- Interface contracts shall be version-controlled and reviewed as part of the change management process
- Breaking changes require formal impact assessment and stakeholder approval
- Contract testing shall be automated as part of the CI/CD pipeline`,

        dataRequirements:
`**Data Requirements — ${pName}**

**1. Data Categories**

| Category | Description | Source | Volume (Est.) | Refresh Frequency |
|---|---|---|---|---|
| Master Data | Organisational hierarchies, user profiles, configuration parameters | Core ERP / HR System | 10,000–50,000 records | Daily / On-change |
| Transactional Data | Process records, approvals, status changes, financial postings | ${tech} | 1,000–10,000 records/month | Real-time |
| Reference Data | Code tables, dropdown values, business rules, thresholds | Configuration DB | 500–2,000 records | On-change |
| Historical Data | Legacy transaction records for migration | Legacy Systems | To be assessed during discovery | One-time migration |
| Audit Data | User actions, system events, data change logs | ${tech} Audit Module | Proportional to transactions | Real-time |

**2. Data Migration Strategy**
- **Extract:** Legacy data extraction using structured queries with full reconciliation counts
- **Transform:** Data cleansing, deduplication, format standardisation, and business rule application
- **Load:** Staged loading with validation checkpoints; rollback capability at each stage
- **Reconciliation:** Record counts, value totals, and sample-based spot checks post-migration

**3. Data Quality Requirements**
- All master data records must pass completeness and format validation prior to migration
- Duplicate detection and resolution process must be executed before go-live
- Data ownership and stewardship must be formally assigned for each data domain

**4. Data Retention & Archiving**
- Active transactional data retained for 24 months in the operational data store
- Archived data retained per the organisation's data retention policy (minimum 7 years)
- Audit log data retained indefinitely or per regulatory requirement`,

        securityAndAuthorization:
`**Security & Authorisation — ${pName}**

**1. Authentication**
- Single Sign-On (SSO) via the organisation's identity provider (SAML 2.0 / OIDC)
- Multi-Factor Authentication (MFA) enforced for all privileged operations (approvals, configuration changes, admin functions)
- Session timeout: 30 minutes of inactivity (configurable)
- Concurrent session policy: Single active session per user (configurable)

**2. Role-Based Access Control (RBAC)**

| Role | Access Level | Permissions |
|---|---|---|
| Business User / Requestor | Standard | Create, view own requests, upload documents, view status |
| Approver | Elevated | All Business User permissions + approve, reject, escalate assigned items |
| Operations Support | Elevated | View all transactions, manage exception queue, reassign workflow items |
| Report Viewer | Read-Only | View dashboards and reports; no transactional access |
| System Administrator | Privileged | User management, configuration, role assignment, audit log access |
| Super Administrator | Privileged | All permissions + system configuration, integration management |

**3. Data Protection**
- All data encrypted in transit (TLS 1.2+) and at rest (AES-256)
- Personally Identifiable Information (PII) masked in logs and non-production environments
- Database access restricted to application service accounts; no direct user access

**4. Compliance & Audit**
- All user actions logged with immutable audit trail (user ID, timestamp, action, before/after values)
- Access reviews conducted quarterly by Information Security
- Segregation of Duties (SoD) enforced — requestors cannot approve their own submissions
- Compliance with organisational security policies and applicable regulatory frameworks (GDPR, SOX, etc.)

**5. Vulnerability Management**
- Static Application Security Testing (SAST) integrated into CI/CD pipeline
- Dynamic Application Security Testing (DAST) conducted prior to each release
- Penetration testing conducted annually or upon major architectural changes`,

        reportingRequirements:
`**Reporting Requirements — ${pName}**

**1. Operational Dashboards**

| Dashboard | Audience | Refresh Rate | Key Metrics |
|---|---|---|---|
| Process Status Dashboard | Operations / Management | Real-time | Open items, in-progress, completed, exceptions by category |
| SLA Compliance Dashboard | Management | Hourly | SLA adherence %, breaches by category, average cycle time |
| Exception Management Dashboard | Operations Support | Real-time | Open exceptions by severity, ageing, resolution rate |

**2. Management Reports**

| Report | Frequency | Format | Distribution |
|---|---|---|---|
| Weekly Status Report | Weekly | PDF / Email | Project Sponsor, Steering Committee |
| Period-End Summary | Monthly | PDF / Dashboard | Finance, Operations, Management |
| Audit Trail Report | On-demand | PDF / CSV | Internal Audit, Compliance |
| User Activity Report | Monthly | Dashboard | System Administration, Security |

**3. Key Performance Indicators (KPIs)**

| KPI | Target | Measurement Method | Reporting Frequency |
|---|---|---|---|
${kpiList.map((k, i) => `| KPI-${String(i + 1).padStart(3, "0")} | ${k} | System-generated metric | Daily / Weekly |`).join("\n")}

**4. Analytics & Self-Service**
- Authorised users shall have the ability to create ad-hoc reports using pre-defined data models
- Export capabilities: PDF, Excel, CSV for all standard reports
- Drill-down functionality from summary dashboards to individual transaction detail`,

        errorHandling:
`**Error Handling & Exception Management — ${pName}**

**1. Error Classification**

| Severity | Category | Description | Response Time | Escalation |
|---|---|---|---|---|
| P1 — Critical | System Down | Complete service unavailability or data corruption risk | 15 minutes | Immediate — Incident Manager + On-call Engineer |
| P2 — High | Major Function Impaired | Core workflow blocked for multiple users; integration failure | 1 hour | Technical Lead + Operations Manager |
| P3 — Medium | Minor Function Impaired | Non-critical feature unavailable; workaround exists | 4 hours | Development Team |
| P4 — Low | Cosmetic / Enhancement | UI inconsistency, minor usability issue | Next sprint | Product Backlog |

**2. Error Handling Patterns**
- **Validation Errors:** Returned to the user inline with specific, actionable guidance. No system log entry required.
- **Business Rule Violations:** Logged as warnings; transaction blocked with clear explanation. Captured in exception queue if recurring.
- **Integration Failures:** Automatic retry with exponential backoff (3 attempts). Failed after retries → exception queue + alert to integration support.
- **System Errors:** Logged with full stack trace and correlation ID. User receives generic error message with reference ID for support.

**3. Monitoring & Alerting**
- Application health monitoring via centralised observability platform
- Automated alerts for: error rate spikes, response time degradation, integration failures, SLA breaches
- Alert channels: Email, Slack/Teams, PagerDuty (for P1/P2)
- Dashboard: Real-time error rate, top error categories, resolution metrics

**4. Logging Standards**
- Structured logging (JSON format) with correlation IDs across all services
- Log levels: DEBUG, INFO, WARN, ERROR, FATAL
- PII redacted from all log output
- Log retention: 90 days hot storage, 1 year cold archive`,

        performanceRequirements:
`**Performance Requirements — ${pName}**

**1. Availability**
| Metric | Target |
|---|---|
| System Availability | ≥ 99.9% (measured monthly, excluding planned maintenance) |
| Planned Maintenance Window | Weekends 02:00–06:00 local time (with 72-hour advance notice) |
| Recovery Time Objective (RTO) | ≤ 4 hours for P1 incidents |
| Recovery Point Objective (RPO) | ≤ 1 hour (maximum acceptable data loss) |

**2. Response Time**
| Operation | Target (95th Percentile) |
|---|---|
| Page / Screen Load | ≤ 2 seconds |
| Form Submission & Validation | ≤ 3 seconds |
| Search & Filtering | ≤ 2 seconds |
| Report Generation (standard) | ≤ 10 seconds |
| Report Generation (complex / large dataset) | ≤ 60 seconds |
| API Response (synchronous) | ≤ 500 milliseconds |

**3. Throughput & Scalability**
| Metric | Target |
|---|---|
| Concurrent Users | ≥ 500 without performance degradation |
| Transaction Processing | ≥ 100 transactions/minute |
| Bulk Upload Processing | 10,000 records within 5 minutes |
| Horizontal Scalability | Auto-scaling supported for compute and application tiers |

**4. Data Volume**
- The system shall support ≥ 5 years of transactional data without query performance degradation
- Database indexing and partitioning strategy to be defined during technical design
- Archive strategy for data older than 24 months to maintain operational performance`,

        testStrategy:
`**Test Strategy — ${pName}**

**1. Testing Phases**

| Phase | Scope | Owner | Entry Criteria | Exit Criteria |
|---|---|---|---|---|
| Unit Testing | Individual components and functions | Development Team | Code complete, code review passed | ≥ 90% code coverage, zero critical defects |
| System Integration Testing (SIT) | End-to-end process flows, integrations | QA Team | Unit testing passed, integration environment available | All integration scenarios pass, zero P1/P2 defects |
| User Acceptance Testing (UAT) | Business scenarios, usability, compliance | Business Users | SIT sign-off, UAT environment provisioned with representative data | All UAT scenarios pass, business sign-off obtained |
| Regression Testing | Impact of changes on existing functionality | QA Team | Change deployed, automated test suite updated | Regression suite pass rate ≥ 98% |
| Performance Testing | Load, stress, and endurance testing | Performance Engineer | Functional testing complete, performance environment provisioned | All performance targets met under expected and peak load |
| Security Testing | Vulnerability assessment, penetration testing | Security Team | Application deployed to secure test environment | Zero critical/high vulnerabilities, SAST/DAST reports reviewed |

**2. Test Data Management**
- Test data to be anonymised from production or synthetically generated
- No production PII shall be used in non-production environments
- Test data refresh strategy: Weekly for SIT, pre-cycle for UAT

**3. Defect Management**
- All defects logged in the project's defect management tool with severity, reproducibility, and environment details
- Defect triage: Daily during active testing phases
- P1 defects: Fix within 24 hours; P2: within 3 business days; P3: within sprint; P4: backlog

**4. UAT Sign-Off Criteria**
- 100% of agreed UAT scenarios executed
- Zero open P1 or P2 defects
- Formal sign-off from designated business approvers
- Training materials reviewed and approved by business stakeholders`,

        transportManagement:
`**Transport & Deployment Management — ${pName}**

**1. Environment Strategy**

| Environment | Purpose | Refresh Cycle | Access |
|---|---|---|---|
| Development (DEV) | Active development and unit testing | N/A (continuous) | Development Team |
| Quality Assurance (QA) | System integration testing and QA validation | Weekly from DEV | QA Team, Development Team |
| Staging / Pre-Production (STG) | UAT, performance testing, pre-go-live validation | On-demand from QA | Business Users, QA, Operations |
| Production (PROD) | Live business operations | Controlled releases only | All authorised end users |

**2. Deployment Process**
- All deployments follow the organisation's change management process
- Code promotion path: DEV → QA → STG → PROD (no environment skipping)
- Production deployments require: QA sign-off, UAT sign-off (where applicable), Change Advisory Board (CAB) approval
- Rollback plan documented and tested for every production deployment

**3. Release Management**
- Release cadence: Bi-weekly sprints with production deployment at sprint end (or as agreed)
- Hotfix process: Expedited path for P1 defects — DEV → QA → PROD (with post-deployment STG sync)
- Release notes: Published for every production deployment, distributed to stakeholders

**4. CI/CD Pipeline**
- Automated build, test, and deployment pipeline via the organisation's CI/CD tooling
- Pipeline gates: Linting, unit tests, SAST scan, SIT (automated), deployment approval
- Infrastructure as Code (IaC) for environment provisioning and configuration management
- Feature flags for controlled rollout of new functionality`,

        openPoints:
`**Open Points & Pending Decisions — ${pName}**

| # | Item | Owner | Priority | Target Resolution Date | Status |
|---|---|---|---|---|---|
| OP-001 | Confirmation of integration API specifications and access credentials for core ERP system | Technical Lead / ERP Team | High | TBD | Open |
| OP-002 | Finalisation of approval hierarchy rules and threshold values for workflow configuration | Business Process Owner | Critical | TBD | Open |
| OP-003 | User licence allocation and named user identification for ${tech} | IT Procurement / Vendor | Medium | TBD | Open |
| OP-004 | Data migration scope — confirmation of historical data cutoff date and record volumes | Data Migration Lead | High | TBD | Open |
| OP-005 | Security review and sign-off on RBAC model and data classification | Information Security | High | TBD | Open |
| OP-006 | Performance testing environment provisioning and capacity planning | Infrastructure Team | Medium | TBD | Open |
| OP-007 | UAT participant identification and availability confirmation | Business Stakeholders | Medium | TBD | Open |
| OP-008 | Go-live date confirmation and cutover weekend scheduling | Project Sponsor | Critical | TBD | Open |

**Note:** Open points are tracked in the project RAID log and reviewed weekly during project governance meetings.`,

        appendices:
`**Appendices — ${pName}**

**Appendix A: Glossary of Terms**

| Term | Definition |
|---|---|
| BRD | Business Requirements Document — formal specification of business needs |
| RBAC | Role-Based Access Control — security model assigning permissions by role |
| SIT | System Integration Testing — validation of end-to-end process flows |
| UAT | User Acceptance Testing — business validation of solution readiness |
| RICEFW | Reports, Interfaces, Conversions, Enhancements, Forms, Workflows |
| SLA | Service Level Agreement — agreed performance and availability targets |
| RTO | Recovery Time Objective — maximum acceptable downtime after failure |
| RPO | Recovery Point Objective — maximum acceptable data loss window |
| CI/CD | Continuous Integration / Continuous Deployment |
| SSO | Single Sign-On — unified authentication across systems |
| MFA | Multi-Factor Authentication — additional verification beyond password |

**Appendix B: Referenced Documents**
- Project Charter and Statement of Work
- Solution Architecture Document (to be produced during design phase)
- Technical Design Specification (to be produced during build phase)
- Test Plan and Test Cases (to be produced during testing phase)
- Training Plan and User Guides (to be produced during deployment phase)
${uploadedFiles.length > 0 ? `- Source Materials: ${uploadedFiles.join(", ")}` : ""}

**Appendix C: Assumptions & Dependencies**
- Stakeholder availability for workshops, reviews, and sign-off activities
- Technical environment provisioned and accessible per project timeline
- Third-party system teams available for integration development and testing
- ${constraints}

**Appendix D: KPMG Quality Standards**
This document has been prepared in accordance with KPMG's internal quality management framework and is subject to peer review prior to client distribution.`
    };
}

// ─── Initial BRD Data ─────────────────────────────────────────────────────

const INPUT1: BRDInput = {
    projectName: "Global ERP Rollout",
    client: "KPMG Global Operations",
    preparedBy: "Ujjwal Gupta",
    organization: "KPMG Global",
    clientReviewers: "Jane Smith, Michael Brown",
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
    client: "KPMG Finance Services",
    preparedBy: "Ujjwal Gupta",
    organization: "KPMG Global",
    clientReviewers: "Sarah Lee",
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
    client: "KPMG IT Infrastructure",
    preparedBy: "Ujjwal Gupta",
    organization: "KPMG Global",
    clientReviewers: "IT Steering Committee",
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
    client: "KPMG Procurement",
    preparedBy: "Ujjwal Gupta",
    organization: "KPMG Global",
    clientReviewers: "AP Manager, Procurement Director",
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

const secs1 = makeSections({ input: INPUT1, mainCategory: "Modern Web & Mobile", subCategory: "React/Next.js web app" });
const secs2 = makeSections({ input: INPUT2, mainCategory: "SAP Business Technology Platform", subCategory: "SAPUI5 Fiori Elements" });
const secs3 = makeSections({ input: INPUT3, mainCategory: "SAP S/4HANA & Core", subCategory: "SAP S/4HANA" });
const secs4 = makeSections({ input: INPUT4, mainCategory: "Modern Web & Mobile", subCategory: "React/Next.js web app" });

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
    toggleSectionVisibility: (id: string, sectionKey: keyof BRDSections) => void;
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
                    updatedBrd.sections = makeSections({ input: newInput, subCategory: newInput.sapModule });
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
                    sections: makeSections({ input: newInput, subCategory: newInput.sapModule }),
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
            }),
            toggleSectionVisibility: (id, sectionKey) => set((state) => ({
                brds: state.brds.map((b) => {
                    if (b.id !== id) return b;
                    const hiddenSections = b.hiddenSections || [];
                    const isHidden = hiddenSections.includes(sectionKey);
                    return {
                        ...b,
                        hiddenSections: isHidden
                            ? hiddenSections.filter((s) => s !== sectionKey)
                            : [...hiddenSections, sectionKey],
                    };
                }),
            })),
        }),
        {
            name: "kpmg-brd-storage",
        }
    )
);
