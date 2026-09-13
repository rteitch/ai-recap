"use client";

import { memo } from "react";
import { QuizItem, RatingType, StudyStatus } from "@/lib/types";

type RetentionScorecardProps = {
  quiz: QuizItem[];
  ratings: Record<number, RatingType>;
  fullQuizLength?: number;
  onRetest: (shuffle: boolean) => void;
  onRetestMissed: () => void;
  onResetFullQuiz: () => void;
  onCopyMissed: () => void;
  studyStatus?: StudyStatus;
  onUpdateStatus?: (status: StudyStatus) => void;
  reviewTimes?: Record<number, number>;
};

export const RetentionScorecard = memo(function RetentionScorecard({
  quiz,
  ratings,
  fullQuizLength,
  onRetest,
  onRetestMissed,
  onResetFullQuiz,
  onCopyMissed,
  studyStatus,
  onUpdateStatus,
  reviewTimes,
}: RetentionScorecardProps) {
  const reviewedCount = Object.keys(ratings).length;
  const knownCount = Object.values(ratings).filter((r) => r === "known").length;
  const missedCount = Object.values(ratings).filter((r) => r === "learning").length;
  const retentionPercent =
    quiz.length > 0 ? Math.round((knownCount / quiz.length) * 100) : 0;

  if (reviewedCount !== quiz.length || quiz.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-highlight/30 bg-highlight/10 p-4 text-center animate-fade-up">
      <p className="text-sm font-medium text-highlight flex items-center justify-center gap-1.5">
        <svg
          className="w-4 h-4 text-highlight flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>
          Self-test complete! Retention score: {retentionPercent}% ({knownCount}/{quiz.length} remembered)
        </span>
      </p>
      <p className="mt-1 text-xs text-ink-300">
        Reviewing again tomorrow will help lock these concepts into long-term memory.
      </p>

      {reviewTimes && Object.keys(reviewTimes).length > 0 && (() => {
        const totalTime = Object.values(reviewTimes).reduce((a, b) => a + b, 0);
        const avgTime = Math.round(totalTime / Object.keys(reviewTimes).length);
        const totalSec = Math.round(totalTime / 1000);
        const avgSec = (avgTime / 1000).toFixed(1);
        return (
          <p className="mt-1.5 text-[11px] text-ink-400 font-mono">
            Total review time: {totalSec}s &middot; Avg per question: {avgSec}s
          </p>
        );
      })()}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 no-print">
        {missedCount > 0 && (
          <>
            <button
              type="button"
              onClick={onRetestMissed}
              className="text-xs bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/40 rounded px-3 py-1.5 transition-colors touch-manipulation inline-flex items-center gap-1.5 font-medium"
              title="Test only the questions you need to review again"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
              <span>Retest Missed ({missedCount})</span>
            </button>
            <button
              type="button"
              onClick={onCopyMissed}
              className="text-xs bg-ink-800 hover:bg-ink-700 text-yellow-300/90 border border-yellow-400/30 rounded px-2.5 py-1.5 transition-colors touch-manipulation inline-flex items-center gap-1.5"
              title="Copy missed review questions to clipboard"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              <span>Copy Missed</span>
            </button>
          </>
        )}

        {/* Suggest Mastered if retention score >= 80% */}
        {onUpdateStatus && retentionPercent >= 80 && studyStatus !== "dikuasai" && (
          <button
            type="button"
            onClick={() => onUpdateStatus("dikuasai")}
            className="text-xs bg-emerald-400/15 hover:bg-emerald-400/25 text-emerald-300 border border-emerald-400/40 rounded px-2.5 py-1.5 transition-colors touch-manipulation inline-flex items-center gap-1.5 font-medium"
            title="Update note study status to Mastered"
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Mark Mastered</span>
          </button>
        )}

        {/* Suggest Needs Review if there were missed questions */}
        {onUpdateStatus && missedCount > 0 && studyStatus !== "perlu-diulang" && (
          <button
            type="button"
            onClick={() => onUpdateStatus("perlu-diulang")}
            className="text-xs bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/40 rounded px-2.5 py-1.5 transition-colors touch-manipulation inline-flex items-center gap-1.5 font-medium"
            title="Update note study status to Needs Review"
          >
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Mark Needs Review</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onRetest(false)}
          className="text-xs bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-600 rounded px-3 py-1.5 transition-colors touch-manipulation inline-flex items-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5 text-ink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Retest (All)</span>
        </button>

        <button
          type="button"
          onClick={() => onRetest(true)}
          className="text-xs bg-highlight/10 hover:bg-highlight/20 text-highlight border border-highlight/30 rounded px-3 py-1.5 transition-colors touch-manipulation inline-flex items-center gap-1.5 font-medium"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <span>Shuffle &amp; Retest</span>
        </button>

        {fullQuizLength && quiz.length < fullQuizLength && (
          <button
            type="button"
            onClick={onResetFullQuiz}
            className="text-xs text-ink-400 hover:text-ink-200 underline transition-colors touch-manipulation px-2 py-1.5"
          >
            Reset to all {fullQuizLength} questions
          </button>
        )}
      </div>
    </div>
  );
});
