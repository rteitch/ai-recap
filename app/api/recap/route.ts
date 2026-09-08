import { NextRequest, NextResponse } from "next/server";

// EdgeOne Makers exposes an OpenAI-compatible model gateway. These three
// env vars are set in the Makers console (Project Settings -> Environment
// Variables) -- see .env.example for local development.
const GATEWAY_BASE_URL =
  process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.edgeone.link/v1";
const GATEWAY_MODEL = process.env.AI_GATEWAY_MODEL || "@makers/deepseek-v4-flash";

type QuizItem = { question: string; answer: string };

function extractJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model did not return valid JSON.");
    }
    return JSON.parse(raw.slice(start, end + 1));
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing AI_GATEWAY_API_KEY." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const notes: string | undefined = body?.notes;

  if (!notes || notes.trim().length < 40) {
    return NextResponse.json(
      { error: "Send at least a few sentences of notes to recap." },
      { status: 400 }
    );
  }

  const trimmedNotes = notes.slice(0, 6000);

  const systemPrompt = [
    "You turn a student's or developer's raw notes into a short study recap.",
    "Respond with ONLY a JSON object, no prose, no markdown fences, in this exact shape:",
    '{"summary": "<80 words or fewer>", "quiz": [{"question": "...", "answer": "..."}, ... exactly 4 items]}',
    "The summary should capture only the main ideas. Each quiz question should test understanding of one distinct idea from the notes, and each answer should be one or two sentences.",
  ].join(" ");

  try {
    const upstream = await fetch(`${GATEWAY_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GATEWAY_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: trimmedNotes },
        ],
      }),
    });

    if (!upstream.ok) {
      const errBody = await upstream.text();
      console.error("AI gateway error:", upstream.status, errBody);
      return NextResponse.json(
        { error: "The AI gateway rejected the request." },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "The model returned an empty response." },
        { status: 502 }
      );
    }

    const parsed = extractJson(content) as {
      summary?: string;
      quiz?: QuizItem[];
    };

    if (!parsed.summary || !Array.isArray(parsed.quiz)) {
      return NextResponse.json(
        { error: "The model response did not match the expected shape." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      summary: parsed.summary,
      quiz: parsed.quiz.slice(0, 4),
    });
  } catch (err) {
    console.error("Recap route failed:", err);
    return NextResponse.json(
      { error: "Could not reach the AI gateway. Try again in a moment." },
      { status: 500 }
    );
  }
}
