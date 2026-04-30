"use client";

import { BRDSections, BRDInput } from "./brdStore";

// ─── Section heading → BRDSections key mapping ───────────────────────────────
const SECTION_PATTERNS: { key: keyof BRDSections; patterns: RegExp[] }[] = [
    { key: "documentControl",        patterns: [/document\s*control/i, /doc\s*control/i] },
    { key: "executiveSummary",       patterns: [/executive\s*summary/i] },
    { key: "purposeAndScope",        patterns: [/purpose\s*(and|&)\s*scope/i, /^scope$/i] },
    { key: "systemLandscape",        patterns: [/system\s*landscape/i, /^landscape$/i, /^architecture$/i] },
    { key: "businessProcessOverview",patterns: [/business\s*process\s*overview/i, /process\s*overview/i] },
    { key: "detailedBusinessProcess",patterns: [/detailed\s*business\s*process/i, /detailed\s*process/i, /process\s*detail/i] },
    { key: "businessRequirements",   patterns: [/^business\s*requirements?$/i] },
    { key: "functionalRequirements", patterns: [/^functional\s*requirements?$/i] },
    { key: "ricefwClassification",   patterns: [/ricefw/i, /rice\s*fw/i] },
    { key: "interfaceDesign",        patterns: [/interface\s*design/i, /integration\s*design/i, /^interfaces?$/i] },
    { key: "dataRequirements",       patterns: [/^data\s*requirements?$/i, /data\s*design/i] },
    { key: "securityAndAuthorization",patterns: [/security\s*(and|&)\s*authoriz/i, /^security$/i, /access\s*control/i] },
    { key: "reportingRequirements",  patterns: [/reporting\s*requirements?/i, /^reporting$/i, /^reports?$/i] },
    { key: "errorHandling",          patterns: [/error\s*handling/i, /exception\s*handling/i] },
    { key: "performanceRequirements",patterns: [/performance\s*requirements?/i, /non[-\s]functional/i, /^nfr$/i] },
    { key: "testStrategy",           patterns: [/test\s*(strategy|plan|approach)/i, /^testing$/i] },
    { key: "transportManagement",    patterns: [/transport\s*management/i, /^deployment$/i, /release\s*management/i] },
    { key: "openPoints",             patterns: [/open\s*points?/i, /open\s*issues?/i, /risks?\s*(and|&)\s*assumptions?/i] },
    { key: "appendices",             patterns: [/^appendix$/i, /^appendices$/i, /^glossary$/i, /^references$/i] },
];

function matchSectionKey(line: string): keyof BRDSections | null {
    // Strip leading numbers/dots/hashes, e.g. "1.", "##", "1.2"
    const trimmed = line.trim().replace(/^[#\d\s.]+/, "").trim();
    for (const { key, patterns } of SECTION_PATTERNS) {
        for (const p of patterns) {
            if (p.test(trimmed)) return key;
        }
    }
    return null;
}

// ─── HTML → Markdown converter (preserves tables, bold, bullets) ──────────────
function htmlToMarkdown(html: string): string {
    return html
        // Tables → markdown
        .replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_: string, body: string) => {
            const rows: string[][] = [];
            const rowMatches = body.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
            for (const row of rowMatches) {
                const cells = (row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [])
                    .map((c: string) => c.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim());
                if (cells.length) rows.push(cells);
            }
            if (!rows.length) return "";
            const header = `| ${rows[0].join(" | ")} |`;
            const sep    = `| ${rows[0].map(() => "---").join(" | ")} |`;
            const body2  = rows.slice(1).map((r: string[]) => `| ${r.join(" | ")} |`).join("\n");
            return `\n${header}\n${sep}\n${body2}\n`;
        })
        // Headings
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n")
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n")
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n")
        .replace(/<h[4-6][^>]*>(.*?)<\/h[4-6]>/gi, "\n#### $1\n")
        // Bold / italic
        .replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, "**$2**")
        .replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, "*$2*")
        // Lists
        .replace(/<li[^>]*>(.*?)<\/li>/gi, "\n- $1")
        .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
        // Paragraphs / line breaks
        .replace(/<\/p>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<p[^>]*>/gi, "")
        // Strip remaining tags
        .replace(/<[^>]+>/g, "")
        // Decode entities
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
        // Clean up blank lines
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// ─── Extract sections from markdown text ──────────────────────────────────────
function extractSections(markdown: string): Partial<BRDSections> {
    const result: Partial<BRDSections> = {};
    const lines = markdown.split("\n");
    let currentKey: keyof BRDSections | null = null;
    const buffers: Partial<Record<keyof BRDSections, string[]>> = {};

    for (const line of lines) {
        const key = matchSectionKey(line);
        if (key) {
            currentKey = key;
            buffers[key] = buffers[key] || [];
        } else if (currentKey) {
            buffers[currentKey]!.push(line);
        }
    }

    for (const [key, lines] of Object.entries(buffers) as [keyof BRDSections, string[]][]) {
        const content = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
        if (content.length > 5) result[key] = content;
    }

    return result;
}

// ─── PDF text extraction (line-aware) ────────────────────────────────────────
async function extractPdfText(file: File): Promise<string> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
    ).toString();

    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Group items by Y position to reconstruct lines
        const lineMap = new Map<number, string[]>();
        for (const item of content.items as any[]) {
            if (!("str" in item)) continue;
            const y = Math.round(item.transform[5]);
            if (!lineMap.has(y)) lineMap.set(y, []);
            lineMap.get(y)!.push(item.str);
        }

        // Sort lines top-to-bottom (descending Y in PDF coords)
        const sortedLines = [...lineMap.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([, parts]) => parts.join(" ").trim())
            .filter(Boolean);

        pages.push(sortedLines.join("\n"));
    }

    return pages.join("\n\n");
}

// ─── Known placeholders injectProjectData already handles ────────────────────
const KNOWN_PLACEHOLDER_PATTERNS = [
    /^project\s*name$/i,
    /^project\s*code$/i,
    /^client$/i,
    /^organis?ation$/i,
    /^prepared\s*by$/i,
    /^version$/i,
    /^date$/i,
    /^stakeholders?$/i,
    /^objective$/i,
    /^kpis?$/i,
    /^constraints?$/i,
];

/**
 * Scans markdown for [Placeholder] patterns that are NOT handled by
 * injectProjectData — these require explicit user input.
 */
export function detectUnfilledPlaceholders(markdown: string): string[] {
    const matches = [...markdown.matchAll(/\[([^\]]{2,80})\]/g)];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const m of matches) {
        const inner = m[1].trim();
        const key = inner.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        if (!KNOWN_PLACEHOLDER_PATTERNS.some(p => p.test(inner))) {
            result.push(inner);
        }
    }
    return result;
}

// ─── Placeholder replacement ──────────────────────────────────────────────────
// Replaces common template placeholders with real project data.
export function injectProjectData(
    content: string,
    input: BRDInput,
    extra?: { title?: string; version?: string },
    customValues?: Record<string, string>,
): string {
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const replacements: [RegExp, string][] = [
        [/\[?\bproject\s*name\b\]?/gi,    input.projectName || extra?.title || ""],
        [/\[?\bproject\s*code\b\]?/gi,    input.projectCode || ""],
        [/\[?\bclient\b\]?/gi,            input.client || ""],
        [/\[?\borganis?ation\b\]?/gi,     input.organization || ""],
        [/\[?\bprepared\s*by\b\]?/gi,     input.preparedBy || ""],
        [/\[?\bversion\b\]?/gi,           extra?.version || input.customVersion || "1.0"],
        [/\[?\bdate\b\]?/gi,              date],
        [/\[?\bstakeholders?\b\]?/gi,     input.stakeholders || ""],
        [/\[?\bobjective\b\]?/gi,         input.objective || ""],
        [/\[?\bkpis?\b\]?/gi,             input.kpis || ""],
        [/\[?\bconstraints?\b\]?/gi,      input.constraints || ""],
        [/\bTBD\b/g,                      "To be confirmed"],
        [/\bTBC\b/g,                      "To be confirmed"],
        [/<[A-Z][^>]*>/g,                 ""],   // strip residual angle-bracket placeholders
    ];
    let out = content;
    for (const [pattern, value] of replacements) {
        if (value) out = out.replace(pattern, value);
    }
    // Apply custom user-supplied values for template-specific placeholders
    if (customValues) {
        for (const [key, value] of Object.entries(customValues)) {
            if (value.trim()) {
                const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                out = out.replace(new RegExp(`\\[${escaped}\\]`, "gi"), value);
            }
        }
    }
    return out;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function parseWordTemplate(file: File): Promise<{
    sections: Partial<BRDSections>;
    rawMarkdown: string;
    fileName: string;
    sectionsFound: number;
    placeholders: string[];
}> {
    const ext = file.name.split(".").pop()?.toLowerCase();
    let markdown = "";

    if (ext === "docx" || ext === "doc") {
        const mammoth = await import("mammoth");
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
        markdown = htmlToMarkdown(html);
    } else if (ext === "pdf") {
        markdown = await extractPdfText(file);
    } else {
        markdown = await file.text();
    }

    const sections = extractSections(markdown);
    const placeholders = detectUnfilledPlaceholders(markdown);
    return { sections, rawMarkdown: markdown, fileName: file.name, sectionsFound: Object.keys(sections).length, placeholders };
}
