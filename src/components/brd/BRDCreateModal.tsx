"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, FileText, Sparkles, Mic, Video, File, Download, Eye } from "lucide-react";
import { BRDRecord, useBRDStore } from "@/lib/brdStore";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { BRDChatAssistant } from "./BRDChatAssistant";

interface BRDCreateModalProps {
    onClose: () => void;
    onCreated: (record: BRDRecord) => void;
}

const BUILD_TYPES: Record<string, string[]> = {
    "SAP S/4HANA & Core": ["S/4HANA Finance", "S/4HANA Sales", "S/4HANA Procurement", "S/4HANA Manufacturing", "Inventory Management", "EWM (Extended Warehouse Management)", "TM (Transportation Management)", "Central Finance", "Group Reporting", "BRIM", "TRM (Treasury)", "Asset Management"],
    "SAP Cloud LoB Solutions": ["SuccessFactors (HR)", "SAP Ariba (Procurement)", "SAP IBP (Supply Chain)", "SAP Fieldglass", "SAP Concur", "SAP Commerce Cloud", "SAP Sales Cloud", "SAP Service Cloud", "SAP Marketing Cloud", "SAP CDP"],
    "SAP Business Technology Platform": ["SAP Integration Suite (CPI)", "SAP Extension Suite", "SAP Analytics Cloud", "SAP HANA Cloud", "SAP Build Apps", "SAP Build Process Automation", "ABAP Cloud", "Fiori / UI5"],
    "Cloud Platforms (Hyperscalers)": ["AWS (EC2, S3, Lambda)", "Azure (VMs, Blob, Functions)", "Google Cloud (GCE, Cloud Run, GCS)", "PostgreSQL / MySQL", "MongoDB / DynamoDB", "Redis", "Cloud Security", "Identity & Access (IAM)"],
    "Modern Web & Mobile": ["Next.js", "React", "Angular", "Vue.js", "Svelte", "Flutter", "React Native", "iOS (Swift)", "Android (Kotlin / Java)", "PWA", "Tailwind CSS", "Bootstrap"],
    "Backend & API Services": ["Node.js (NestJS / Express)", "Python (FastAPI / Django)", "Java (Spring Boot)", ".NET Core / C#", "Go (Golang)", "Rust", "GraphQL API", "RESTful API", "gRPC", "WebSockets"],
    "AI, Machine Learning & GenAI": ["Azure OpenAI (GPT-4 / 3.5)", "Google Vertex AI (Gemini / Palm)", "AWS Bedrock (Claude / Llama)", "Hugging Face Models", "LangChain / LlamaIndex", "Vector DB (Pinecone / Weaviate)", "Custom LLM Training", "Computer Vision", "NLP / Speech-to-Text"],
    "Data & Advanced Analytics": ["Snowflake", "Databricks", "SAP Datasphere", "BigQuery", "AWS Redshift", "Power BI", "Tableau Dashboard", "Alteryx", "Informatica", "Kafka Stream Processing"],
    "Integration & Middleware": ["MuleSoft Anypoint", "Dell Boomi", "Kong API Gateway", "Apigee", "Azure Logic Apps", "AWS Step Functions", "RabbitMQ / ActiveMQ", "Apache Camel", "TIBCO"],
    "Automation & RPA": ["Automation Anywhere", "UiPath", "Blue Prism", "Power Automate (Desktop / Cloud)", "Python RPA Scripts", "Workato", "Zapier"],
    "Cyber Security & Identity": ["Microsoft Entra ID (Azure AD)", "Okta / Auth0", "Palo Alto Networks", "CrowdStrike", "Splunk", "Microsoft Sentinel", "HashiCorp Vault", "CyberArk", "Cloudflare"],
    "DevOps & Infrastructure": ["Kubernetes (EKS / AKS / GKE)", "Docker", "Terraform", "Ansile", "GitHub Actions", "GitLab CI", "Jenkins", "Prometheus / Grafana", "New Relic", "Infrastructure as Code"],
    "Non-SAP Enterprise Systems": ["Salesforce (CRM)", "ServiceNow (ITSM)", "Oracle Fusion Cloud", "Microsoft Dynamics 365", "Workday", "NetSuite", "Adobe Experience Manager", "Zendesk", "HubSpot"]
};

const PROJECT_LIST = [
    { code: "PRJ-KPMG-001", name: "Global ERP Rollout" },
    { code: "PRJ-KPMG-002", name: "Finance Module Upgrade" },
    { code: "PRJ-KPMG-003", name: "S/4HANA Migration" },
    { code: "PRJ-KPMG-004", name: "Vendor Portal Integration" },
    { code: "PRJ-KPMG-005", name: "Custom Web Dashboard" },
];

type Stage = "form" | "generating" | "done";

export default function BRDCreateModal({ onClose, onCreated }: BRDCreateModalProps) {
    const { brds } = useBRDStore();
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendation, setRecommendation] = useState<any>(null);
    const [showRecPreview, setShowRecPreview] = useState(false);
    const [stage] = useState<Stage>("form");
    const [interactionMode, setInteractionMode] = useState<"chat" | "form">("chat");
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({ audio: null, video: null, document: null });
    const [selectedRefBRDs, setSelectedRefBRDs] = useState<string[]>([]);
    const [referenceMode, setReferenceMode] = useState<"ai" | "existing">("ai");
    const [brdSearch, setBrdSearch] = useState("");
    const [form, setForm] = useState({
        title: "",
        projectCode: "",
        projectName: "",
        version: "v1.0",
        mainCategory: "",
        subCategory: "",
        requirement: "",
    });

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string) => {
        const value = typeof e === "string" ? e : e.target.value;
        setForm(prev => {
            const next = { ...prev, [key]: value };
            if (key === "mainCategory") next.subCategory = "";
            if (key === "projectCode") {
                const project = PROJECT_LIST.find(p => p.code === value);
                next.projectName = project ? project.name : "";
            }
            return next;
        });
    };

    const toggleRefBRD = (id: string) =>
        setSelectedRefBRDs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleFileChange = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setUploadedFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    };

    const handleGetRecommendation = async () => {
        if (!form.requirement.trim()) return;

        setIsRecommending(true);
        try {
            // Placeholder for the actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setRecommendation({
                title: `Recommended: ${form.subCategory || form.mainCategory} Structure`,
                description: `Optimized BRD format suggested based on your ${form.subCategory} requirements.`,
                structure: [
                    "Project Overview & Strategic Alignment",
                    "Stakeholder Matrix & Requirements",
                    "Process Performance Indicators (PPIs)",
                    "Target Functional Design",
                    "Data Governance & Migration Strategy",
                    "Security & Compliance Standards",
                    "Acceptance Criteria & Success Metrics"
                ]
            });
        } catch (error) {
            console.error("Failed to fetch recommendation:", error);
        } finally {
            setIsRecommending(false);
        }
    };

    const handleDownloadWord = () => {
        if (!recommendation) return;

        const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${recommendation.title}</title>
            <style>
                body { font-family: Calibri, sans-serif; line-height: 1.5; }
                h1 { color: #00338D; border-bottom: 2px solid #00338D; padding-bottom: 10px; }
                .description { color: #666; margin-bottom: 20px; font-style: italic; }
                .section { margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-left: 5px solid #00338D; }
                .num { font-weight: bold; color: #00338D; margin-right: 10px; }
            </style>
            </head>
            <body>
                <h1>${recommendation.title}</h1>
                <p class="description">${recommendation.description}</p>
                <div class="content">
                    ${recommendation.structure.map((s: string, i: number) => `
                        <div class="section">
                            <span class="num">${i + 1}.</span> ${s}
                        </div>
                    `).join('')}
                </div>
                <hr>
                <p style="font-size: 10px; color: #999;">Generated by KPMG BRD Generator AI Tool</p>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${form.title || 'Recommended_Structure'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const now = new Date().toISOString();
        const fileNames = Object.values(uploadedFiles).filter(Boolean).map(f => f!.name);

        const newBRD: BRDRecord = {
            id: `BRD-${String(Math.floor(Math.random() * 900) + 100)}`,
            projectCode: form.projectCode,
            projectName: form.projectName,
            version: form.version || "v1.0",
            status: "Generating BRD",
            createdAt: now,
            updatedAt: now,
            createdBy: "Ujjwal Gupta",
            isLocked: false,
            input: {
                projectName: form.projectName,
                projectCode: form.projectCode,
                customVersion: form.version,
                objective: form.requirement,
                problemStatement: form.requirement,
                currentProcess: "To be defined during discovery workshops.",
                desiredOutcome: "Fully optimised process replacing current manual approach.",
                stakeholders: "Key business sponsors and process owners",
                kpis: "Processing efficiency, error rate reduction, system availability > 99.9%",
                constraints: "Implementation to align with business strategy.",
                sapModule: form.subCategory,
                uploadedFiles: fileNames,
            },
            sections: {
                executiveSummary: `This Business Requirement Document was generated for the "${form.title}" initiative targeting the ${form.subCategory} (${form.mainCategory}) stack.`,
                businessContext: `The business has identified a requirement to leverage ${form.subCategory} capabilities to address the following:\n\n${form.requirement}`,
                scope: `**In Scope:**\n- Implementation of ${form.subCategory} to address the stated requirement\n- Integration with core backend systems\n- User acceptance testing\n- Training for end users`,
                processFlow: `**Current State:** Manual processes requiring improvement.\n\n**Future State:** Fully integrated ${form.subCategory} solution delivering the desired outcome.`,
                techStackMapping: `| Component | Technology | Function |\n|---|---|---|\n| Primary Stack | ${form.subCategory} | Core requirement delivery |\n| Category | ${form.mainCategory} | Solution architecture |`,
                functionalRequirements: `FR-001: System shall support end-to-end process automation.\nFR-002: Real-time reporting shall provide operational visibility.`,
                nonFunctionalRequirements: `NFR-001: System availability ≥ 99.9%.\nNFR-002: All data encrypted in transit and at rest.`,
                acceptanceCriteria: `AC-001: All functional requirements pass UAT.\nAC-002: Formal sign-off obtained from Business Sponsor.`,
                risksAndAssumptions: `**Key Risks:**\n⚠️ R-001: Stakeholder availability for workshops.\n\n**Assumptions:**\nA-001: ${form.subCategory} environments are available at start.`,
            },
            comments: [],
            versionHistory: [{
                version: form.version || "v1.0",
                status: "Generating BRD",
                createdAt: now,
                updatedAt: now,
                createdBy: "Ujjwal Gupta",
                changeSummary: `Initial draft generated by BRD Generator agent. Build Type: ${form.mainCategory} / ${form.subCategory}.`,
                input: {
                    projectName: form.projectName,
                    projectCode: form.projectCode,
                    customVersion: form.version,
                    objective: form.requirement,
                    problemStatement: form.requirement,
                    currentProcess: "To be defined during discovery workshops.",
                    desiredOutcome: "Fully optimised process replacing current manual approach.",
                    stakeholders: "Key business sponsors and process owners",
                    kpis: "Processing efficiency, error rate reduction, system availability > 99.9%",
                    constraints: "Implementation to align with business strategy.",
                    sapModule: form.subCategory,
                    uploadedFiles: fileNames,
                },
                sections: {} as any,
            }],
        };

        onCreated(newBRD);
        onClose();
    };

    const canSubmit = form.title.trim() && form.projectCode && form.mainCategory && form.subCategory && form.version.trim() && form.requirement.trim();

    return createPortal(
        <AnimatePresence>
            <motion.div
                key="brd-modal-backdrop"
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-xl h-[85vh] max-h-[720px] flex flex-col overflow-hidden border border-slate-200"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        {interactionMode === "chat" ? (
                            <BRDChatAssistant
                                projectList={PROJECT_LIST}
                                buildTypes={BUILD_TYPES}
                                existingBRDs={brds}
                                onSwitchToForm={() => setInteractionMode("form")}
                                onClose={onClose}
                                onComplete={(data, refs) => {
                                    setForm(data);
                                    setSelectedRefBRDs(refs);
                                    // Trigger submission logic
                                    const now = new Date().toISOString();
                                    const newBRD: BRDRecord = {
                                        id: `BRD-${String(Math.floor(Math.random() * 900) + 100)}`,
                                        projectCode: data.projectCode,
                                        projectName: data.projectName,
                                        version: data.version || "v1.0",
                                        status: "Generating BRD",
                                        createdAt: now,
                                        updatedAt: now,
                                        createdBy: "Ujjwal Gupta",
                                        isLocked: false,
                                        input: {
                                            projectName: data.projectName,
                                            projectCode: data.projectCode,
                                            customVersion: data.version,
                                            objective: data.requirement,
                                            problemStatement: data.requirement,
                                            currentProcess: "To be defined during discovery workshops.",
                                            desiredOutcome: "Fully optimised process replacing current manual approach.",
                                            stakeholders: "Key business sponsors and process owners",
                                            kpis: "Processing efficiency, error rate reduction, system availability > 99.9%",
                                            constraints: "Implementation to align with business strategy.",
                                            sapModule: data.subCategory,
                                            uploadedFiles: [],
                                        },
                                        sections: {
                                            executiveSummary: `This Business Requirement Document was generated for the "${data.title}" initiative targeting the ${data.subCategory} (${data.mainCategory}) stack.`,
                                            businessContext: `The business has identified a requirement to leverage ${data.subCategory} capabilities to address the following:\n\n${data.requirement}`,
                                            scope: `**In Scope:**\n- Implementation of ${data.subCategory} to address the stated requirement\n- Integration with core backend systems\n- User acceptance testing\n- Training for end users`,
                                            processFlow: `**Current State:** Manual processes requiring improvement.\n\n**Future State:** Fully integrated ${data.subCategory} solution delivering the desired outcome.`,
                                            techStackMapping: `| Component | Technology | Function |\n|---|---|---|\n| Primary Stack | ${data.subCategory} | Core requirement delivery |\n| Category | ${data.mainCategory} | Solution architecture |`,
                                            functionalRequirements: `FR-001: System shall support end-to-end process automation.\nFR-002: Real-time reporting shall provide operational visibility.`,
                                            nonFunctionalRequirements: `NFR-001: System availability ≥ 99.9%.\nNFR-002: All data encrypted in transit and at rest.`,
                                            acceptanceCriteria: `AC-001: All functional requirements pass UAT.\nAC-002: Formal sign-off obtained from Business Sponsor.`,
                                            risksAndAssumptions: `**Key Risks:**\n⚠️ R-001: Stakeholder availability for workshops.\n\n**Assumptions:**\nA-001: ${data.subCategory} environments are available at start.`,
                                        },
                                        comments: [],
                                        versionHistory: [{
                                            version: data.version || "v1.0",
                                            status: "Generating BRD",
                                            createdAt: now,
                                            updatedAt: now,
                                            createdBy: "Ujjwal Gupta",
                                            changeSummary: `Initial draft generated by BRD Generator agent via AI Chat.`,
                                            input: {
                                                projectName: data.projectName,
                                                projectCode: data.projectCode,
                                                customVersion: data.version,
                                                objective: data.requirement,
                                                problemStatement: data.requirement,
                                                currentProcess: "To be defined during discovery workshops.",
                                                desiredOutcome: "Fully optimised process replacing current manual approach.",
                                                stakeholders: "Key business sponsors and process owners",
                                                kpis: "Processing efficiency, error rate reduction, system availability > 99.9%",
                                                constraints: "Implementation to align with business strategy.",
                                                sapModule: data.subCategory,
                                                uploadedFiles: [],
                                            },
                                            sections: {} as any,
                                        }],
                                    };
                                    onCreated(newBRD);
                                    onClose();
                                }}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                                {/* Form Mode Header */}
                                <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-[#00338D]" />
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-800">BRD Generator</h3>
                                            <p className="text-[9px] text-slate-500 font-medium whitespace-nowrap">Create smart requirements</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setInteractionMode("chat")}
                                            className="px-3 py-1.5 bg-[#00338D] text-white rounded-lg text-[10px] font-bold hover:bg-[#00266e] transition-all flex items-center gap-1.5 shadow-sm interactive"
                                        >
                                            <Sparkles size={12} /> AI Chat
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-1" />
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors interactive text-slate-400"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
                                    <div className="p-6 space-y-5">
                                        {/* Document Title */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Document Title <span className="text-red-400">*</span></label>
                                            <input
                                                type="text"
                                                value={form.title}
                                                onChange={set("title")}
                                                required
                                                placeholder="e.g. AP Automation BRD"
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white transition-all placeholder:text-slate-400"
                                            />
                                        </div>

                                        {/* Project Selection */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <SearchableSelect
                                                label="Project Code"
                                                required
                                                options={PROJECT_LIST.map(p => ({ value: p.code, label: p.code }))}
                                                value={form.projectCode}
                                                onChange={set("projectCode")}
                                                placeholder="Select Project Code"
                                            />
                                            <SearchableSelect
                                                label="Project Name"
                                                required
                                                options={PROJECT_LIST.map(p => ({ value: p.code, label: p.name }))}
                                                value={form.projectCode}
                                                onChange={set("projectCode")}
                                                placeholder="Select Project Name"
                                            />
                                        </div>

                                        {/* Categorized Build Type Dropdowns */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <SearchableSelect
                                                label="Solution Area"
                                                required
                                                options={Object.keys(BUILD_TYPES).map(cat => ({ value: cat, label: cat }))}
                                                value={form.mainCategory}
                                                onChange={set("mainCategory")}
                                                placeholder="Select Solution Area"
                                            />
                                            <SearchableSelect
                                                label="Primary Technology"
                                                required
                                                disabled={!form.mainCategory}
                                                options={form.mainCategory ? (BUILD_TYPES[form.mainCategory]?.map(opt => ({ value: opt, label: opt })) || []) : []}
                                                value={form.subCategory}
                                                onChange={set("subCategory")}
                                                placeholder="Select Technology"
                                            />
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-nowrap">Version <span className="text-red-400">*</span></label>
                                                <input
                                                    type="text"
                                                    value={form.version}
                                                    onChange={set("version")}
                                                    required
                                                    placeholder="v1.0"
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none bg-white transition-all placeholder:text-slate-400 shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Business Requirement */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Requirement <span className="text-red-400">*</span></label>
                                            <textarea
                                                value={form.requirement}
                                                onChange={set("requirement")}
                                                required
                                                rows={5}
                                                placeholder="Describe the business requirement in detail. Include stakeholders, business process, expected outcomes..."
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#00338D] focus:border-[#00338D] outline-none resize-none bg-slate-50 transition-all placeholder:text-slate-400"
                                            />
                                        </div>

                                        {/* Source Material Upload */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Source Material <span className="text-slate-400 font-normal">(optional)</span>
                                            </label>
                                            <p className="text-[11px] text-slate-400 mb-3">Upload source files for AI to use during BRD generation</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { type: "audio", Icon: Mic, title: "Audio Recording", desc: "Upload audio for AI transcription", accept: ".mp3,.wav,.m4a,.ogg", color: "text-purple-600", bg: "bg-purple-50", activeBorder: "border-purple-400" },
                                                    { type: "video", Icon: Video, title: "Video Recording", desc: "Upload video for AI analysis", accept: ".mp4,.mov,.webm,.avi", color: "text-blue-600", bg: "bg-blue-50", activeBorder: "border-blue-400" },
                                                    { type: "document", Icon: File, title: "Document", desc: "Upload PDF, DOCX, or TXT files", accept: ".pdf,.docx,.doc,.txt,.md", color: "text-emerald-600", bg: "bg-emerald-50", activeBorder: "border-emerald-400" },
                                                ].map(({ type, Icon, title, desc, accept, color, bg, activeBorder }) => {
                                                    const file = uploadedFiles[type];
                                                    return (
                                                        <label key={type}
                                                            className={`flex flex-col items-center gap-2 p-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all interactive text-center group ${file ? `${activeBorder} ${bg}` : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                                }`}>
                                                            <div className={`w-9 h-9 rounded-xl ${file ? bg : "bg-slate-100 group-hover:bg-slate-200"} flex items-center justify-center transition-colors flex-shrink-0`}>
                                                                <Icon size={16} className={file ? color : "text-slate-400"} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-[11px] font-bold leading-tight ${file ? color : "text-slate-700"}`}>{title}</p>
                                                                {file ? (
                                                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[80px]">{file.name}</p>
                                                                ) : (
                                                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
                                                                )}
                                                            </div>
                                                            <input type="file" className="hidden" accept={accept} onChange={handleFileChange(type)} />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Reference / Recommendation Section Toggle */}
                                        <div className="pt-2">
                                            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setReferenceMode("ai")}
                                                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${referenceMode === "ai" ? "bg-white text-[#00338D] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                                >
                                                    <img src="/icons/tab-icon.png" alt="AI" className="w-3.5 h-3.5 object-contain" /> AI Recommendation
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setReferenceMode("existing")}
                                                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${referenceMode === "existing" ? "bg-white text-[#00338D] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                                >
                                                    <img src="/icons/tab-icon.png" alt="Existing" className="w-3.5 h-3.5 object-contain opacity-70" /> Existing BRDs
                                                </button>
                                            </div>

                                            {referenceMode === "ai" ? (
                                                <>
                                                    {!recommendation && !isRecommending && (
                                                        <button
                                                            type="button"
                                                            onClick={handleGetRecommendation}
                                                            disabled={!form.requirement.trim()}
                                                            className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-[#00338D] hover:bg-slate-50 transition-all group flex flex-col items-center gap-2 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <div className="w-12 h-12 bg-[#00338D]/5 rounded-full flex items-center justify-center text-[#00338D] group-hover:scale-110 transition-transform shadow-inner">
                                                                <Sparkles size={24} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700">Get Recommended Format</p>
                                                                <p className="text-[10px] text-slate-400 mt-1">AI will analyze your inputs to suggest the best BRD structure</p>
                                                            </div>
                                                        </button>
                                                    )}

                                                    {isRecommending && (
                                                        <div className="w-full p-8 border-2 border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center gap-3 border-dashed">
                                                            <div className="w-10 h-10 border-4 border-[#00338D]/10 border-t-[#00338D] rounded-full animate-spin" />
                                                            <p className="text-xs font-semibold text-slate-500 animate-pulse">Designing Recommended Structure...</p>
                                                        </div>
                                                    )}

                                                    {recommendation && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex items-center gap-3 p-3 bg-white border border-[#00338D]/30 rounded-xl shadow-sm relative group overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 w-2 h-full bg-[#00338D]/10" />

                                                            <div className="w-4 h-4 rounded bg-[#00338D] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#00338D]/20 relative z-10">
                                                                <Check size={10} className="text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 relative z-10">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-semibold text-slate-700 truncate">{recommendation.title.replace('Recommended: ', '')}</p>
                                                                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 uppercase tracking-tighter">AI OPTIMIZED</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <p className="text-[10px] text-[#00338D] font-mono font-bold">BRD-AI-REC</p>
                                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                    <div className="flex items-center gap-3">
                                                                        <button type="button" onClick={() => setShowRecPreview(true)} className="text-[9px] font-bold text-slate-400 hover:text-[#00338D] flex items-center gap-1 transition-colors">
                                                                            <Eye size={11} /> View Structure
                                                                        </button>
                                                                        <button type="button" onClick={handleDownloadWord} className="text-[9px] font-bold text-slate-400 hover:text-[#00338D] flex items-center gap-1 transition-colors">
                                                                            <Download size={11} /> Download Word
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => setRecommendation(null)} className="text-slate-300 hover:text-slate-500 transition-colors p-1 relative z-10">
                                                                <X size={14} />
                                                            </button>


                                                        </motion.div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={brdSearch}
                                                            onChange={(e) => setBrdSearch(e.target.value)}
                                                            placeholder="Search my BRDs..."
                                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#00338D] transition-all"
                                                        />
                                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                    </div>

                                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 select-none custom-scrollbar shadow-inner rounded-xl border border-slate-50 bg-slate-50/30 p-1">
                                                        {brds.filter(b =>
                                                            b.projectName.toLowerCase().includes(brdSearch.toLowerCase()) ||
                                                            b.id.toLowerCase().includes(brdSearch.toLowerCase())
                                                        ).length > 0 ? (
                                                            brds.filter(b =>
                                                                b.projectName.toLowerCase().includes(brdSearch.toLowerCase()) ||
                                                                b.id.toLowerCase().includes(brdSearch.toLowerCase())
                                                            ).map(brd => (
                                                                <label key={brd.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#00338D]/40 hover:bg-[#00338D]/5 transition-all group">
                                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${selectedRefBRDs.includes(brd.id) ? "bg-[#00338D] border-[#00338D]" : "border-slate-300 group-hover:border-[#00338D]/50"}`}>
                                                                        {selectedRefBRDs.includes(brd.id) && <Check size={10} className="text-white" />}
                                                                    </div>
                                                                    <input type="checkbox" className="hidden" checked={selectedRefBRDs.includes(brd.id)} onChange={() => toggleRefBRD(brd.id)} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between">
                                                                            <p className="text-xs font-semibold text-slate-700 truncate">{brd.projectName}</p>
                                                                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">{brd.version}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <p className="text-[10px] text-slate-400 font-mono">{brd.id}</p>
                                                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                            <p className="text-[10px] text-slate-400 truncate">{brd.input.sapModule}</p>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            ))
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                                                                <FileText size={24} className="text-slate-300 mb-2" />
                                                                <p className="text-xs font-semibold text-slate-500">{brds.length === 0 ? "No BRDs created yet" : "No matching BRDs found"}</p>
                                                                <p className="text-[10px] text-slate-400 mt-0.5">Choose from your existing BRDs to use as a style reference.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex gap-3 p-6 pt-0">
                                        <button type="button" onClick={onClose}
                                            className="px-5 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold text-sm rounded-xl transition-all interactive">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00338D] hover:bg-[#00266e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md interactive"
                                        >
                                            <Sparkles size={15} /> Generate BRD
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Recommendation Preview Modal */}
            <AnimatePresence key="recommendation-preview-presence">
                {showRecPreview && recommendation && (
                    <motion.div
                        key="preview-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[250] flex items-center justify-center p-6"
                        onClick={() => setShowRecPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-slate-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#00338D] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#00338D]/20">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{recommendation.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{recommendation.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowRecPreview(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="space-y-4">
                                    {recommendation.structure.map((item: string, idx: number) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-[#00338D]/10 text-[#00338D] flex items-center justify-center text-xs font-bold border border-[#00338D]/20 group-hover:bg-[#00338D] group-hover:text-white transition-all">
                                                    {idx + 1}
                                                </div>
                                                {idx !== recommendation.structure.length - 1 && (
                                                    <div className="w-0.5 h-full bg-slate-100 mt-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <h4 className="text-sm font-bold text-slate-800 mb-1">{item}</h4>
                                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Standard section covering ${item.toLowerCase()} optimized for ${form.subCategory || form.mainCategory} requirements.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                    <div className="text-[11px] text-emerald-800 font-bold">
                                        This structure is fully optimized and ready for BRD generation.
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
                                <button
                                    onClick={() => setShowRecPreview(false)}
                                    className="px-6 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-all"
                                >
                                    Close Preview
                                </button>
                                <button
                                    onClick={() => { handleDownloadWord(); setShowRecPreview(false); }}
                                    className="px-6 py-2 bg-[#00338D] text-white rounded-xl text-xs font-bold hover:bg-[#00266e] transition-all shadow-md flex items-center gap-2"
                                >
                                    <Download size={14} /> Download structure as Word
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>,
        document.body
    );
}
