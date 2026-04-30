import { OpenAI } from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    const { service, errorCode, message, stackTrace } = await req.json();

    const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        stream: true,
        messages: [
            {
                role: "system",
                content: `You are an elite production support AI agent. Given a production error, you:
1. Diagnose the root cause
2. Attempt an automated fix (retry, cache flush, config rollback, service restart, connection reset)
3. Return a structured JSON at the END of your response after your thinking steps.

Format your response as:
- Step-by-step thinking (plain text, prefix each line with "> ")
- Then a final JSON block: {"canResolve":bool,"confidence":0-100,"fixApplied":"description","recommendation":"next steps if escalated"}`,
            },
            {
                role: "user",
                content: `Service: ${service}\nError Code: ${errorCode}\nMessage: ${message}\nStack: ${stackTrace}`,
            },
        ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const text = chunk.choices[0]?.delta?.content || "";
                controller.enqueue(encoder.encode(text));
            }
            controller.close();
        },
    });

    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
