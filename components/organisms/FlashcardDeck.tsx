"use client";

import { memo, useRef, useState } from "react";
import { QuizItem, RatingType } from "@/lib/types";
import { FormattedText } from "@/components/atoms/FormattedText";
import { triggerHaptic } from "@/lib/haptics";

type FlashcardDeckProps = {
  quiz: QuizItem[];
  activeCardIndex: number;
  isCardFlipped: boolean;
  ratings: Record<number, RatingType>;
  onSelectCard: (index: number) => void;
  onFlipCard: () => void;
  onPrevCard: () => void;
  onNextCard: () => void;
  onRate: (index: number, rating: RatingType) => void;
};

export const FlashcardDeck = memo(function FlashcardDeck({
  quiz,
  activeCardIndex,
  isCardFlipped,
  ratings,
  onSelectCard,
  onFlipCard,
  onPrevCard,
  onNextCard,
  onRate,
}: FlashcardDeckProps) {
  const touchStartX = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const currentItem = quiz[activeCardIndex];

  if (!currentItem) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress & Card Dots */}
      <div className="flex items-center justify-between text-xs text-ink-400">
        <span className="font-mono text-[11px]">
          Card {activeCardIndex + 1} of {quiz.length}
        </span>
        <div className="flex items-center gap-1.5">
          {quiz.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => onSelectCard(dotIdx)}
              className={`h-1.5 rounded-full transition-all touch-manipulation ${
                dotIdx === activeCardIndex
                  ? "w-6 bg-highlight"
                  : ratings[dotIdx] === "known"
                  ? "w-2 bg-emerald-400/80"
                  : ratings[dotIdx] === "learning"
                  ? "w-2 bg-amber-500/80"
                  : "w-2 bg-ink-600"
              }`}
              aria-label={`Go to card ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Focus Card */}
      <div
        tabIndex={0}
        role="button"
        aria-label={isCardFlipped ? "Card answer" : "Card question"}
        onClick={() => {
          triggerHaptic(12);
          onFlipCard();
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          setSwipeOffset(0);
        }}
        onTouchMove={(e) => {
          if (touchStartX.current === null) return;
          const diffX = e.touches[0].clientX - touchStartX.current;
          setSwipeOffset(diffX * 0.4);
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const diffX = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          setSwipeOffset(0);
          if (Math.abs(diffX) > 30) {
            if (diffX < 0) {
              if (activeCardIndex < quiz.length - 1) {
                triggerHaptic(8);
                onNextCard();
              }
            } else {
              if (activeCardIndex > 0) {
                triggerHaptic(8);
                onPrevCard();
              }
            }
          }
        }}
        className="group relative min-h-[220px] rounded-lg border border-ink-600 bg-ink-800 p-6 sm:p-7 flex flex-col justify-between cursor-pointer hover:border-highlight/50 transition-all active:scale-[0.99] touch-manipulation shadow-lg focus:outline-none focus:ring-2 focus:ring-highlight select-none"
        style={{ transform: `translateX(${swipeOffset}px)`, transition: swipeOffset === 0 ? "transform 0.25s ease-out" : "none" }}
      >
        <div>
          <div className="flex items-center justify-between text-xs text-ink-400 mb-3">
            <span className="uppercase tracking-wider text-[10px] font-semibold text-highlight/90">
              {isCardFlipped ? "Answer" : "Question"}
            </span>
            <span className="text-[11px] text-ink-400 group-hover:text-ink-200 transition-colors">
              {isCardFlipped ? "Click or Space to flip back" : "Click or Space to reveal"}
            </span>
          </div>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="text-base sm:text-lg leading-relaxed text-ink-50 select-text"
          >
            <FormattedText
              text={isCardFlipped ? currentItem.answer : currentItem.question}
            />
          </div>
        </div>

        {/* Rating / Prompt on flipped card */}
        {isCardFlipped ? (
          <div
            className="mt-6 pt-4 border-t border-ink-600/60 flex flex-wrap items-center justify-between gap-2.5 no-print"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-ink-400">Did you recall this?</span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => onRate(activeCardIndex, "known")}
                className={`rounded px-3 py-1.5 transition-all active:scale-95 touch-manipulation flex items-center gap-1.5 ${
                  ratings[activeCardIndex] === "known"
                    ? "bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/40"
                    : "bg-ink-900 text-ink-300 hover:text-ink-50 border border-ink-600"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Remembered</span>
              </button>
              <button
                type="button"
                onClick={() => onRate(activeCardIndex, "learning")}
                className={`rounded px-3 py-1.5 transition-all active:scale-95 touch-manipulation flex items-center gap-1.5 ${
                  ratings[activeCardIndex] === "learning"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/40"
                    : "bg-ink-900 text-ink-300 hover:text-ink-50 border border-ink-600"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Review again</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between text-xs text-ink-400">
            <span>Press Space to reveal answer</span>
            {ratings[activeCardIndex] && (
              <span
                className={`text-[11px] font-medium inline-flex items-center gap-1 ${
                  ratings[activeCardIndex] === "known"
                    ? "text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {ratings[activeCardIndex] === "known" ? (
                  <>
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Remembered</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Review again</span>
                  </>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Navigation Prev/Next */}
      <div className="flex items-center justify-between pt-1 no-print">
        <button
          type="button"
          disabled={activeCardIndex === 0}
          onClick={() => {
            triggerHaptic(8);
            onPrevCard();
          }}
          className="rounded-md border border-ink-600 bg-ink-800 px-3.5 py-1.5 text-xs text-ink-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center gap-1"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <span className="hidden sm:inline text-[11px] text-ink-400 font-mono">
          Space to flip &bull; ← / → to navigate &bull; 1 / 2 to rate
        </span>
        <span className="sm:hidden text-[11px] text-ink-400 font-mono">
          Swipe or tap to navigate
        </span>

        <button
          type="button"
          disabled={activeCardIndex === quiz.length - 1}
          onClick={() => {
            triggerHaptic(8);
            onNextCard();
          }}
          className="rounded-md border border-ink-600 bg-ink-800 px-3.5 py-1.5 text-xs text-ink-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center gap-1"
        >
          <span>Next</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
});
