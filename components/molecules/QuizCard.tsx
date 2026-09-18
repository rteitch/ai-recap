"use client";

import { useState, memo } from "react";
import { QuizItem, RatingType } from "@/lib/types";
import { FormattedText } from "@/components/atoms/FormattedText";

type QuizCardProps = {
  item: QuizItem;
  index: number;
  isOpen: boolean;
  rating?: RatingType;
  onToggle: (index: number) => void;
  onRate: (index: number, rating: RatingType) => void;
};

export const QuizCard = memo(function QuizCard({
  item,
  index,
  isOpen,
  rating,
  onToggle,
  onRate,
}: QuizCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyQA(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`Q: ${item.question}\nA: ${item.answer}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore
    }
  }

  return (
    <li className="rounded-md bg-ink-800 overflow-hidden transition-all">
      <button
        type="button"
        id={`quiz-question-btn-${index}`}
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`quiz-answer-${index}`}
        className="w-full px-4 py-4 text-left text-sm text-ink-50 hover:text-highlight flex items-center justify-between gap-3 touch-manipulation transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {rating === "known" && (
            <span
              className="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300"
              title="Remembered"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          {rating === "learning" && (
            <span
              className="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300"
              title="Review again"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
          )}
          <span className="leading-snug">
            <FormattedText text={item.question} />
          </span>
        </div>
        <span className="text-xs text-ink-400 flex-shrink-0 no-print">
          {isOpen ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </button>

      {isOpen && (
        <div
          id={`quiz-answer-${index}`}
          role="region"
          aria-labelledby={`quiz-question-btn-${index}`}
          className="border-t border-ink-600/70 px-4 py-3 bg-ink-900/40"
        >
          <div className="text-sm leading-relaxed text-ink-200">
            <FormattedText text={item.answer} />
          </div>
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-ink-600/40 pt-2.5 text-xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-ink-400">Did you recall this?</span>
              <button
                type="button"
                onClick={handleCopyQA}
                className="text-ink-500 hover:text-ink-300 text-[11px] underline underline-offset-2 transition-colors touch-manipulation inline-flex items-center gap-1"
                title="Copy question and answer"
              >
                {copied && (
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{copied ? "Copied" : "Copy Q&A"}</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onRate(index, "known")}
                className={`rounded px-2.5 py-1.5 transition-all active:scale-95 touch-manipulation flex items-center gap-1.5 ${
                  rating === "known"
                    ? "bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/40"
                    : "bg-ink-800 text-ink-300 hover:text-ink-50 border border-ink-600"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Remembered</span>
              </button>
              <button
                type="button"
                onClick={() => onRate(index, "learning")}
                className={`rounded px-2.5 py-1.5 transition-all active:scale-95 touch-manipulation flex items-center gap-1.5 ${
                  rating === "learning"
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/40"
                    : "bg-ink-800 text-ink-300 hover:text-ink-50 border border-ink-600"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Review again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
});
