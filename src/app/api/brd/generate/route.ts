import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Known BRDSections keys so we can map template headings back to them
const KNOWN_SECTION_KEYS = [
    "documentControl", "executiveSummary", "purposeAndScope", "systemLandscape",
    "businessProcessOverview", "detailedBusinessProcess", "businessRequirements",
    "functionalRequirements", "ricefwClassification", "interfaceDesign",
    "dataRequirements", "securityAndAuthorization", "reportingRequirements",
    "errorHandling", "performanceRequirements", "testStrategy",
    "transportManagement", "openPoints", "appendices",
];

export async function POST(req: NextRequest) {
    const { context, conversationHistory, rawMarkdown, templateSections, templateSectionKeys, useTemplateOnly } = await req.json();

    const conversationSummary = conversationHistory
        ?.slice(-8)
        .map((m: any) => `${m.role}: ${m.content}`)
        .join("\n") || "";

    let prompt: string;

    if (useTemplateOnly && rawMarkdown) {
        // ── Template-strict mode: fill the EXACT template as-is ──────────────
        prompt = `You are completing a Business Requirements Document template for a KPMG project.

STRICT RULES:
1. Use the EXACT template structure below — same headings, same order, same tables, same fields, same labels
2. Only fill in: empty fields, [placeholder] values, TBD/TBC items, and blank sections
3. Do NOT add any new headings, sections, or content that is not already in the template
4. Preserve ALL existing text that is already filled in the template
5. Use the gathered requirements to provide accurate, professional content

Requirements gathered from interview:
${JSON.stringify(context, null, 2)}

Interview conversation for context:
${conversationSummary}

THE TEMPLATE TO FILL IN:
---
${rawMarkdown}
---

Return a JSON object where:
- Keys are the camelCase section identifiers from this list (use the closest match for each template heading): ${KNOWN_SECTION_KEYS.join(", ")}
- Values are the COMPLETE filled content for each section, preserving the exact same formatting (tables, bullet lists, sub-headings) as in the template
- For template content that does not match any known section, include it in "appendices"
- Every value should be the COMPLETE section content — not a summary

Return ONLY the JSON object, no other text.`;

    } else {
        // ── Default mode: generate all 19 standard sections ──────────────────
        prompt = `Generate a comprehensive Business Requirements Document (BRD) for a KPMG project.

Gathered requirements:
${JSON.stringify(context, null, 2)}

Interview conversation:
${conversationSummary}

Generate a complete BRD as a JSON object with these 19 sections. Each value should be detailed markdown content (use tables, bullet lists, numbered lists where appropriate):

{
  "documentControl": "...",
  "executiveSummary": "...",
  "purposeAndScope": "...",
  "systemLandscape": "...",
  "businessProcessOverview": "...",
  "detailedBusinessProcess": "...",
  "businessRequirements": "...",
  "functionalRequirements": "...",
  "ricefwClassification": "...",
  "interfaceDesign": "...",
  "dataRequirements": "...",
  "securityAndAuthorization": "...",
  "reportingRequirements": "...",
  "errorHandling": "...",
  "performanceRequirements": "...",
  "testStrategy": "...",
  "transportManagement": "...",
  "openPoints": "...",
  "appendices": "..."
}

Make each section substantive, professional, and KPMG-quality. Return ONLY the JSON object.`;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 4000,
            response_format: { type: "json_object" },
        });

        const sections = JSON.parse(completion.choices[0].message.content || "{}");
        return NextResponse.json({ sections });
    } catch (error) {
        return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }
}
