"use client";

import { useState } from "react";
import Image from "next/image";

type QuizItem = {
  question: string;
  answer: string;
};

type RecapResult = {
  summary: string;
  quiz: QuizItem[];
};

export default function Home() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecapResult | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const wordCount = notes.trim().length === 0 ? 0 : notes.trim().split(/\s+/).length;

  async function handleRecap() {
    if (notes.trim().length < 40) {
      setError("Paste a bit more text first \u2014 at least a few sentences.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setOpenIndex(null);

    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong on the server.");
      }

      const data: RecapResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate a recap. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col px-4 py-10 sm:px-6 sm:py-16 pb-safe">
      <header className="mb-8 sm:mb-10 flex items-center gap-4">
        <Image
          src="/favicon.png"
          alt="AI Recap logo"
          width={64}
          height={64}
          className="rounded-xl flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16"
          priority
          unoptimized
        />
        <div>
          <p className="font-serif text-2xl sm:text-3xl italic text-ink-50">AI Recap</p>
          <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-ink-400">
            Paste your notes, an article, or a meeting transcript. Get a short
            summary and four questions to test whether it actually stuck.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <label htmlFor="notes" className="text-sm text-ink-200">
          Your notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste anything you need to remember…"
          rows={10}
          className="w-full resize-none rounded-md border border-ink-600 bg-ink-800 p-4 text-sm leading-relaxed text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-highlight"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400">{wordCount} words</span>
          <button
            onClick={handleRecap}
            disabled={loading}
            className="rounded-md bg-highlight px-5 py-2.5 text-sm font-medium text-ink-900 transition-opacity disabled:opacity-50 active:scale-95 touch-manipulation"
          >
            {loading ? "Reading\u2026" : "Recap this"}
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </section>

      {result && (
        <section className="mt-8 sm:mt-10 flex flex-col gap-6 sm:gap-8 animate-fade-up">
          <div className="border-l-2 border-highlight bg-ink-800 py-3 pl-4 pr-3 rounded-r-md">
            <p className="mb-1 text-xs text-ink-400">Summary</p>
            <p className="text-sm leading-relaxed text-ink-50">{result.summary}</p>
          </div>

          <div>
            <p className="mb-3 text-xs text-ink-400">
              Quick self-test — tap a question to reveal the answer
            </p>
            <ul className="flex flex-col gap-2">
              {result.quiz.map((item, i) => (
                <li key={i} className="rounded-md bg-ink-800">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full px-4 py-4 text-left text-sm text-ink-50 touch-manipulation"
                  >
                    {item.question}
                  </button>
                  {openIndex === i && (
                    <p className="border-t border-ink-600 px-4 py-3 text-sm leading-relaxed text-ink-200">
                      {item.answer}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <footer className="mt-auto pt-12 sm:pt-16 text-xs text-ink-400">
        Built with Next.js, deployed on Tencent EdgeOne Makers.
      </footer>
    </main>
  );
}
