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

function parseSectionContent(content: string): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const lines = content.split("\n");

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Detect start of a markdown table (line starts with |)
        if (line.trim().startsWith("|")) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) {
                tableLines.push(lines[i]);
                i++;
            }
            const tableText = tableLines.join("\n");
            const parsed = parseMarkdownTable(tableText);
            if (parsed && parsed.length > 0) {
                elements.push(createTableFromData(parsed));
                elements.push(new Paragraph({ spacing: { after: 120 } }));
            }
            continue;
        }

        // Bold heading lines: **Text**
        if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
            const text = line.trim().replace(/\*\*/g, "");
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text,
                            bold: true,
                            color: KPMG_BLUE,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { before: 200, after: 80 },
                })
            );
            i++;
            continue;
        }

        // Lines containing **bold** segments mixed with normal text
        if (line.includes("**")) {
            const runs: TextRun[] = [];
            const parts = line.split(/(\*\*[^*]+\*\*)/);
            for (const part of parts) {
                if (part.startsWith("**") && part.endsWith("**")) {
                    runs.push(new TextRun({
                        text: part.replace(/\*\*/g, ""),
                        bold: true,
                        color: KPMG_DARK,
                        size: 20,
                        font: "Calibri",
                    }));
                } else {
                    runs.push(new TextRun({
                        text: part,
                        color: KPMG_GREY,
                        size: 20,
                        font: "Calibri",
                    }));
                }
            }
            elements.push(new Paragraph({ children: runs, spacing: { before: 60, after: 60 } }));
            i++;
            continue;
        }

        // Bullet points (- item)
        if (/^\s*[-•]\s/.test(line)) {
            const text = line.replace(/^\s*[-•]\s*/, "");
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `  \u2022  ${text}`,
                            color: KPMG_DARK,
                            size: 20,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { before: 30, after: 30 },
                    indent: { left: 360 },
                })
            );
            i++;
            continue;
        }

        // Numbered items (1. item, BR-001:, FR-001:, etc.)
        if (/^\s*(\d+\.|[A-Z]{2,}-\d+[:\s])/.test(line)) {
            const text = line.trim();
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text,
                            color: KPMG_DARK,
                            size: 20,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { before: 40, after: 40 },
                    indent: { left: 240 },
                })
            );
            i++;
            continue;
        }

        // Empty lines
        if (line.trim() === "") {
            elements.push(new Paragraph({ spacing: { before: 60, after: 60 } }));
            i++;
            continue;
        }

        // Regular paragraph
        elements.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: line,
                        color: KPMG_DARK,
                        size: 20,
                        font: "Calibri",
                    }),
                ],
                spacing: { before: 40, after: 40 },
            })
        );
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
        const parsed = parseSectionContent(sectionContent);
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
