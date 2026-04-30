import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    PageBreak,
    Header,
    Footer,
    ImageRun,
    ShadingType,
    TableOfContents,
    StyleLevel,
} from "docx";

// Minimal 1×1 white PNG — used as fallback for SVG ImageRun in docx v9
// (modern Word renders the SVG; old Word shows this placeholder)
const FALLBACK_PNG = Uint8Array.from(
    atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="),
    c => c.charCodeAt(0)
);

async function mermaidToSvgBytes(chart: string): Promise<{ svg: Uint8Array; png: Uint8Array } | null> {
    try {
        const m = (await import("mermaid")).default;
        // Use light boxes + dark text so Word renders correctly even without CSS class support
        m.initialize({
            startOnLoad: false,
            theme: "base",
            themeVariables: {
                primaryColor: "#003087",          // KPMG blue node fill
                primaryTextColor: "#ffffff",       // white label text
                primaryBorderColor: "#ffffff",
                lineColor: "#003087",
                secondaryColor: "#e8f0ff",
                tertiaryColor: "#f0f4ff",
                fontSize: "15px",
                background: "#ffffff",
                mainBkg: "#003087",
                nodeBorder: "#ffffff",
                clusterBkg: "#e8eeff",
                clusterBorder: "#003087",
                edgeLabelBackground: "#ffffff",
                labelColor: "#003087",
            },
        });
        const id = "wd" + Math.random().toString(36).slice(2);
        const { svg } = await m.render(id, chart);

        // Post-process SVG for Word compatibility
        // Word ignores <style> blocks, so we must inline critical styles
        let processed = svg;

        // 1. Extract CSS rules from embedded <style> block
        const styleMatch = processed.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const cssText = styleMatch ? styleMatch[1] : "";

        // 2. Build a simple class→fill map from the CSS
        const classFillMap: Record<string, string> = {};
        const cssRules = cssText.matchAll(/\.([^\s{,]+)[^{]*\{([^}]*)\}/g);
        for (const rule of cssRules) {
            const cls = rule[1];
            const fillMatch = rule[2].match(/fill\s*:\s*([^;!]+)/);
            if (fillMatch) classFillMap[cls] = fillMatch[1].trim();
        }

        // 3. Inline fill on rect/circle/polygon elements that use class-based fills
        processed = processed.replace(/<(rect|circle|polygon|path|ellipse)\b([^>]*?)>/g, (_m, tag, attrs) => {
            const clsMatch = attrs.match(/class="([^"]*)"/);
            if (!clsMatch) return _m;
            const classes = clsMatch[1].split(/\s+/);
            for (const cls of classes) {
                if (classFillMap[cls] && !attrs.includes("fill=")) {
                    return `<${tag}${attrs} fill="${classFillMap[cls]}">`;
                }
            }
            return _m;
        });

        // 4. Inline fill on <text> elements
        processed = processed.replace(/<text\b([^>]*?)>/g, (_m, attrs) => {
            if (attrs.includes("fill=")) return _m;
            const clsMatch = attrs.match(/class="([^"]*)"/);
            if (clsMatch) {
                const classes = clsMatch[1].split(/\s+/);
                for (const cls of classes) {
                    if (classFillMap[cls]) return `<text${attrs} fill="${classFillMap[cls]}">`;
                }
                // node labels default to white; edge labels to dark
                const isEdge = classes.some(c => c.includes("edge") || c.includes("label"));
                return `<text${attrs} fill="${isEdge ? "#003087" : "#ffffff"}">`;
            }
            return `<text${attrs} fill="#003087">`;
        });

        // 5. Inject white background rect immediately after opening <svg> tag
        processed = processed.replace(/(<svg\b[^>]*>)/, '$1<rect width="100%" height="100%" fill="#ffffff"/>');

        return { svg: new TextEncoder().encode(processed), png: FALLBACK_PNG };
    } catch { return null; }
}
import { saveAs } from "file-saver";
import { BRDRecord, BRDSections } from "./brdStore";

// ─── KPMG Brand Colours ──────────────────────────────────────────────────
const KPMG_BLUE = "00338D";
const KPMG_DARK = "1B1B1B";
const KPMG_GREY = "6D6E71";
const KPMG_LIGHT_GREY = "F5F5F5";
const KPMG_WHITE = "FFFFFF";

// ─── Section metadata matching BRDViewer SECTIONS array ──────────────────
const SECTION_META: { key: keyof BRDSections; label: string }[] = [
    { key: "documentControl", label: "1. Document Control" },
    { key: "executiveSummary", label: "2. Executive Summary" },
    { key: "purposeAndScope", label: "3. Purpose and Scope" },
    { key: "systemLandscape", label: "4. System Landscape" },
    { key: "businessProcessOverview", label: "5. Business Process Overview" },
    { key: "detailedBusinessProcess", label: "6. Detailed Business Process" },
    { key: "businessRequirements", label: "7. Business Requirements" },
    { key: "functionalRequirements", label: "8. Functional Requirements" },
    { key: "ricefwClassification", label: "9. RICEFW Classification" },
    { key: "interfaceDesign", label: "10. Interface Design" },
    { key: "dataRequirements", label: "11. Data Requirements" },
    { key: "securityAndAuthorization", label: "12. Security and Authorization" },
    { key: "reportingRequirements", label: "13. Reporting Requirements" },
    { key: "errorHandling", label: "14. Error Handling" },
    { key: "performanceRequirements", label: "15. Performance Requirements" },
    { key: "testStrategy", label: "16. Test Strategy" },
    { key: "transportManagement", label: "17. Transport Management" },
    { key: "openPoints", label: "18. Open Points" },
    { key: "appendices", label: "19. Appendices" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

function parseMarkdownTable(text: string): string[][] | null {
    const lines = text.split("\n").filter(l => l.trim().startsWith("|"));
    if (lines.length < 2) return null;
    // Filter out separator lines (|---|---|)
    const dataLines = lines.filter(l => !/^\|[\s\-|]+\|$/.test(l.trim()));
    return dataLines.map(line =>
        line.split("|").slice(1, -1).map(cell => cell.trim())
    );
}

function createTableFromData(rows: string[][]): Table {
    if (rows.length === 0) return new Table({ rows: [] });

    const isHeader = (idx: number) => idx === 0;

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows.map((cells, rowIdx) =>
            new TableRow({
                tableHeader: isHeader(rowIdx),
                children: cells.map(cell =>
                    new TableCell({
                        shading: isHeader(rowIdx)
                            ? { type: ShadingType.SOLID, color: KPMG_BLUE }
                            : rowIdx % 2 === 0
                                ? { type: ShadingType.SOLID, color: KPMG_LIGHT_GREY }
                                : undefined,
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: cell,
                                        bold: isHeader(rowIdx),
                                        color: isHeader(rowIdx) ? KPMG_WHITE : KPMG_DARK,
                                        size: 18,
                                        font: "Calibri",
                                    }),
                                ],
                                spacing: { before: 40, after: 40 },
                            }),
                        ],
                    })
                ),
            })
        ),
    });
}

function makeRuns(line: string): TextRun[] {
    if (!line.includes("**") && !line.includes("*")) {
        return [new TextRun({ text: line, color: KPMG_DARK, size: 20, font: "Calibri" })];
    }
    const runs: TextRun[] = [];
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
    for (const part of parts) {
        if (part.startsWith("**") && part.endsWith("**")) {
            runs.push(new TextRun({ text: part.slice(2, -2), bold: true, color: KPMG_DARK, size: 20, font: "Calibri" }));
        } else if (part.startsWith("*") && part.endsWith("*")) {
            runs.push(new TextRun({ text: part.slice(1, -1), italics: true, color: KPMG_GREY, size: 20, font: "Calibri" }));
        } else {
            runs.push(new TextRun({ text: part, color: KPMG_DARK, size: 20, font: "Calibri" }));
        }
    }
    return runs;
}

async function parseSectionContent(content: string): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];
    // Strip leading heading (same as BRDViewer)
    const text = content.replace(/^#+\s[^\n]*\n?/, "").replace(/^\*\*[^*]+\*\*\n?/, "");
    const lines = text.split("\n");
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // ── Mermaid block → render as PNG image ─────────────────────────
        if (trimmed.startsWith("```mermaid")) {
            i++;
            const chartLines: string[] = [];
            while (i < lines.length && !lines[i].trim().startsWith("```")) { chartLines.push(lines[i]); i++; }
            i++;
            const result = await mermaidToSvgBytes(chartLines.join("\n"));
            if (result) {
                elements.push(new Paragraph({
                    children: [new ImageRun({
                        type: "svg",
                        data: result.svg,
                        transformation: { width: 620, height: 360 },
                        fallback: { type: "png", data: result.png },
                    })],
                    spacing: { before: 160, after: 160 },
                }));
            } else {
                elements.push(new Paragraph({ children: [new TextRun({ text: "[Diagram]", italics: true, color: KPMG_GREY, size: 18, font: "Calibri" })], spacing: { before: 80, after: 80 } }));
            }
            continue;
        }

        // ── Generic code fence — skip ────────────────────────────────────
        if (trimmed.startsWith("```")) {
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) i++;
            i++;
            continue;
        }

        // ── Markdown table ───────────────────────────────────────────────
        if (trimmed.startsWith("|")) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) { tableLines.push(lines[i]); i++; }
            const parsed = parseMarkdownTable(tableLines.join("\n"));
            if (parsed?.length) {
                elements.push(createTableFromData(parsed));
                elements.push(new Paragraph({ spacing: { after: 120 } }));
            }
            continue;
        }

        // ── ## heading ───────────────────────────────────────────────────
        if (/^##\s/.test(trimmed)) {
            elements.push(new Paragraph({
                children: [new TextRun({ text: trimmed.replace(/^##\s*/, ""), bold: true, color: KPMG_BLUE, size: 22, font: "Calibri" })],
                spacing: { before: 240, after: 80 },
            }));
            i++; continue;
        }

        // ── ### subheading ───────────────────────────────────────────────
        if (/^###\s/.test(trimmed)) {
            elements.push(new Paragraph({
                children: [new TextRun({ text: trimmed.replace(/^###\s*/, ""), bold: true, color: KPMG_GREY, size: 20, font: "Calibri" })],
                spacing: { before: 160, after: 60 },
            }));
            i++; continue;
        }

        // ── **Bold heading** (full line) ─────────────────────────────────
        if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
            elements.push(new Paragraph({
                children: [new TextRun({ text: trimmed.replace(/\*\*/g, ""), bold: true, color: KPMG_BLUE, size: 22, font: "Calibri" })],
                spacing: { before: 200, after: 80 },
            }));
            i++; continue;
        }

        // ── Horizontal rule ──────────────────────────────────────────────
        if (/^---+$/.test(trimmed)) {
            elements.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" } }, spacing: { before: 80, after: 80 } }));
            i++; continue;
        }

        // ── Bullet point ─────────────────────────────────────────────────
        if (/^\s*[-•]\s/.test(line)) {
            const btext = line.replace(/^\s*[-•]\s*/, "");
            elements.push(new Paragraph({
                children: [new TextRun({ text: `\u2022  `, bold: true, color: KPMG_BLUE, size: 20, font: "Calibri" }), ...makeRuns(btext)],
                spacing: { before: 30, after: 30 },
                indent: { left: 360 },
            }));
            i++; continue;
        }

        // ── Numbered list ────────────────────────────────────────────────
        if (/^\s*\d+\.\s/.test(line)) {
            const match = line.match(/^\s*(\d+\.)\s*(.*)/);
            if (match) {
                elements.push(new Paragraph({
                    children: [new TextRun({ text: `${match[1]}  `, bold: true, color: KPMG_BLUE, size: 20, font: "Calibri" }), ...makeRuns(match[2])],
                    spacing: { before: 40, after: 40 },
                    indent: { left: 360 },
                }));
            }
            i++; continue;
        }

        // ── Empty line ───────────────────────────────────────────────────
        if (trimmed === "") {
            elements.push(new Paragraph({ spacing: { before: 60, after: 60 } }));
            i++; continue;
        }

        // ── Regular paragraph with inline bold/italic ────────────────────
        elements.push(new Paragraph({ children: makeRuns(line), spacing: { before: 40, after: 40 } }));
        i++;
    }

    return elements;
}

// ─── Main Export Function ────────────────────────────────────────────────

export async function exportBRDToWord(brd: BRDRecord): Promise<void> {
    const sections = brd.sections;
    const hiddenSections = brd.hiddenSections || [];
    const visibleSections = SECTION_META.filter(s => !hiddenSections.includes(s.key));
    const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    // ── Cover Page ───────────────────────────────────────────────────────
    const coverPageChildren: Paragraph[] = [
        // Spacer
        new Paragraph({ spacing: { before: 1200 } }),
        // KPMG branding line
        new Paragraph({
            children: [
                new TextRun({
                    text: "KPMG",
                    bold: true,
                    color: KPMG_BLUE,
                    size: 56,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        // Divider text
        new Paragraph({
            children: [
                new TextRun({
                    text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                    color: KPMG_BLUE,
                    size: 20,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        // Document title
        new Paragraph({
            children: [
                new TextRun({
                    text: "Business Requirements Document",
                    bold: true,
                    color: KPMG_DARK,
                    size: 44,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
        }),
        // (BRD)
        new Paragraph({
            children: [
                new TextRun({
                    text: "(BRD)",
                    color: KPMG_GREY,
                    size: 28,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        // Project Name
        new Paragraph({
            children: [
                new TextRun({
                    text: brd.projectName,
                    bold: true,
                    color: KPMG_BLUE,
                    size: 36,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        // Divider
        new Paragraph({
            children: [
                new TextRun({
                    text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                    color: KPMG_BLUE,
                    size: 20,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        // Metadata
        new Paragraph({
            children: [
                new TextRun({ text: "Project Code: ", bold: true, color: KPMG_GREY, size: 22, font: "Calibri" }),
                new TextRun({ text: brd.projectCode, color: KPMG_DARK, size: 22, font: "Calibri" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Version: ", bold: true, color: KPMG_GREY, size: 22, font: "Calibri" }),
                new TextRun({ text: brd.version, color: KPMG_DARK, size: 22, font: "Calibri" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Status: ", bold: true, color: KPMG_GREY, size: 22, font: "Calibri" }),
                new TextRun({ text: brd.status, color: KPMG_DARK, size: 22, font: "Calibri" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Date: ", bold: true, color: KPMG_GREY, size: 22, font: "Calibri" }),
                new TextRun({ text: dateStr, color: KPMG_DARK, size: 22, font: "Calibri" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Prepared By: ", bold: true, color: KPMG_GREY, size: 22, font: "Calibri" }),
                new TextRun({ text: brd.input.preparedBy || brd.createdBy, color: KPMG_DARK, size: 22, font: "Calibri" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Organisation: ", bold: true, color: KPMG_GREY, size: 22, font: "Calibri" }),
                new TextRun({ text: brd.input.organization || "KPMG Global", color: KPMG_DARK, size: 22, font: "Calibri" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        // Confidentiality notice
        new Paragraph({
            children: [
                new TextRun({
                    text: "CONFIDENTIAL",
                    bold: true,
                    color: KPMG_BLUE,
                    size: 18,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: "This document contains proprietary information intended solely for the use of the named recipient(s). Unauthorised distribution, reproduction, or disclosure is strictly prohibited.",
                    italics: true,
                    color: KPMG_GREY,
                    size: 16,
                    font: "Calibri",
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
    ];

    // ── Table of Contents placeholder ────────────────────────────────────
    const tocChildren: (Paragraph | Table)[] = [
        new Paragraph({
            children: [
                new TextRun({
                    text: "Table of Contents",
                    bold: true,
                    color: KPMG_BLUE,
                    size: 32,
                    font: "Calibri",
                }),
            ],
            spacing: { before: 200, after: 300 },
        }),
    ];

    // Generate a manual TOC listing
    for (const sec of visibleSections) {
        tocChildren.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: sec.label,
                        color: KPMG_DARK,
                        size: 22,
                        font: "Calibri",
                    }),
                ],
                spacing: { before: 60, after: 60 },
                indent: { left: 240 },
            })
        );
    }

    // ── BRD Content Sections ─────────────────────────────────────────────
    const contentChildren: (Paragraph | Table)[] = [];

    for (const sec of visibleSections) {
        const sectionContent = sections[sec.key];
        if (!sectionContent) continue;

        // Section heading
        contentChildren.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: sec.label,
                        bold: true,
                        color: KPMG_BLUE,
                        size: 28,
                        font: "Calibri",
                    }),
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
                border: {
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: KPMG_BLUE },
                },
            })
        );

        // Parse and add content
        const parsed = await parseSectionContent(sectionContent);
        contentChildren.push(...parsed);

        // Section spacing
        contentChildren.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // ── Reviewer Table ───────────────────────────────────────────────────
    contentChildren.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: "20. Reviewer Sign-Off",
                    bold: true,
                    color: KPMG_BLUE,
                    size: 28,
                    font: "Calibri",
                }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: KPMG_BLUE },
            },
        })
    );

    const reviewerRows = [
        ["#", "Reviewer", "Role", "Date Reviewed", "Signature"],
        ["1", brd.input.clientReviewers?.split(",")[0]?.trim() || "", "", "", ""],
        ["2", brd.input.clientReviewers?.split(",")[1]?.trim() || "", "", "", ""],
        ["3", "", "", "", ""],
    ];
    contentChildren.push(createTableFromData(reviewerRows));

    // ── Build Document ───────────────────────────────────────────────────
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 20,
                        color: KPMG_DARK,
                    },
                },
                heading1: {
                    run: {
                        font: "Calibri",
                        size: 28,
                        bold: true,
                        color: KPMG_BLUE,
                    },
                },
                heading2: {
                    run: {
                        font: "Calibri",
                        size: 24,
                        bold: true,
                        color: KPMG_BLUE,
                    },
                },
            },
        },
        sections: [
            // Cover page
            {
                properties: {},
                children: coverPageChildren,
            },
            // Table of Contents
            {
                properties: {},
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `KPMG  |  ${brd.projectName}  |  ${brd.version}`,
                                        color: KPMG_GREY,
                                        size: 16,
                                        font: "Calibri",
                                        italics: true,
                                    }),
                                ],
                                alignment: AlignmentType.RIGHT,
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `CONFIDENTIAL  |  ${brd.input.organization || "KPMG Global"}  |  Business Requirements Document`,
                                        color: KPMG_GREY,
                                        size: 14,
                                        font: "Calibri",
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                },
                children: tocChildren,
            },
            // Main content
            {
                properties: {},
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `KPMG  |  ${brd.projectName}  |  ${brd.version}`,
                                        color: KPMG_GREY,
                                        size: 16,
                                        font: "Calibri",
                                        italics: true,
                                    }),
                                ],
                                alignment: AlignmentType.RIGHT,
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `CONFIDENTIAL  |  ${brd.input.organization || "KPMG Global"}  |  Business Requirements Document`,
                                        color: KPMG_GREY,
                                        size: 14,
                                        font: "Calibri",
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                },
                children: contentChildren,
            },
        ],
    });

    // ── Generate and Download ────────────────────────────────────────────
    const blob = await Packer.toBlob(doc);
    const fileName = `BRD_${brd.projectName.replace(/[^a-zA-Z0-9]/g, "_")}_${brd.version}_${new Date().toISOString().split("T")[0]}.docx`;
    saveAs(blob, fileName);
}
