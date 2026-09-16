"use client";

import { memo, useState, useEffect, useRef } from "react";
import { QuizItem, RecapResult, RatingType, StudyStatus } from "@/lib/types";
import { FormattedText } from "@/components/atoms/FormattedText";
import { QuizCard } from "@/components/molecules/QuizCard";
import { FlashcardDeck } from "@/components/organisms/FlashcardDeck";
import { RetentionScorecard } from "@/components/organisms/RetentionScorecard";
import { SpeechControls } from "@/components/molecules/SpeechControls";

type StudyCompanionPaneProps = {
  result: RecapResult | null;
  loading: boolean;
  error: string | null;
  ratings: Record<number, RatingType>;
  onRate: (index: number, rating: RatingType) => void;
  quizViewMode: "list" | "card";
  onChangeQuizViewMode: (mode: "list" | "card") => void;
  activeCardIndex: number;
  onCardIndexChange: (idx: number) => void;
  isCardFlipped: boolean;
  onFlipCard: () => void;
  onResetQuiz?: () => void;
  onRetest?: (shuffle: boolean) => void;
  onRetestMissed?: () => void;
  onCopyMissed?: () => void;
  onRecap: () => void;
  onRegenerateQuiz?: (count: number) => void;
  isRegeneratingQuiz?: boolean;
  onClose?: () => void;
  isSpeaking: boolean;
  speechRate: 1.0 | 1.25 | 1.5;
  onToggleSpeech: () => void;
  onCycleSpeechRate: () => void;
  onCopySummary: () => void;
  copiedType: "summary" | "all" | null;
  onShare: () => void;
  onCopyShareLink: () => void;
  onPrint: () => void;
  dailyRemaining: number | null;
  notesLength: number;
  width?: number;
  studyStatus?: StudyStatus;
  onChangeStatus?: (status: StudyStatus) => void;
  reviewTimes?: Record<number, number>;
};

export const StudyCompanionPane = memo(function StudyCompanionPane({
  result,
  loading,
  error,
  ratings,
  onRate,
  quizViewMode,
  onChangeQuizViewMode,
  activeCardIndex,
  onCardIndexChange,
  isCardFlipped,
  onFlipCard,
  onResetQuiz,
  onRetest,
  onRetestMissed,
  onCopyMissed,
  onRecap,
  onRegenerateQuiz,
  isRegeneratingQuiz = false,
  onClose,
  isSpeaking,
  speechRate,
  onToggleSpeech,
  onCycleSpeechRate,
  onCopySummary,
  copiedType,
  onShare,
  onCopyShareLink,
  onPrint,
  dailyRemaining,
  notesLength,
  width,
  studyStatus,
  onChangeStatus,
  reviewTimes,
}: StudyCompanionPaneProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [selectedRegenCount, setSelectedRegenCount] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ai_recap_quiz_count");
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 3 && parsed <= 12) {
            return parsed;
          }
        }
      } catch {}
    }
    return 4;
  });
  const [showRegenMenu, setShowRegenMenu] = useState(false);
  const regenMenuRef = useRef<HTMLDivElement>(null);

  const LOADING_STEPS = [
    "Analyzing note structure & formulas...",
    "Extracting core concepts & key takeaways...",
    "Formulating active-recall quiz questions...",
    "Polishing interactive flashcards...",
  ];

  // Cycling loading step indicator
  useEffect(() => {
    if (!loading) {
      setLoadingStepIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [loading]);

  // Click outside to dismiss regenerate question count menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (regenMenuRef.current && !regenMenuRef.current.contains(e.target as Node)) {
        setShowRegenMenu(false);
      }
    }
    if (showRegenMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showRegenMenu]);

  function handleToggleQuestion(idx: number) {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  function handleExpandAll() {
    if (!result) return;
    if (openIndices.length === result.quiz.length) {
      setOpenIndices([]);
    } else {
      setOpenIndices(result.quiz.map((_, i) => i));
    }
  }

  const reviewedCount = Object.keys(ratings).length;
  const knownCount = Object.values(ratings).filter((r) => r === "known").length;

  return (
    <aside
      style={{ width: width ? `${width}px` : undefined }}
      className={`h-full flex flex-col bg-app-sidebar border-l border-ink-800/80 text-ink-100 flex-shrink-0 select-none transition-all duration-75 ${
        width ? "" : "w-full"
      }`}
    >
      {/* Pane Top Header */}
      <div className="h-11 px-3.5 flex items-center justify-between border-b border-ink-800/80 bg-app-bg">
        <div className="flex items-center gap-2">
          <span className={`text-highlight ${loading ? "animate-spin" : ""}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
          <h2 className="font-semibold text-xs sm:text-sm text-ink-100 tracking-tight">
            AI Study Companion
          </h2>
          {loading && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-highlight/15 text-highlight border border-highlight/30 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-highlight animate-ping" />
              Recapping...
            </span>
          )}
          {result && !loading && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-highlight/15 text-highlight border border-highlight/30">
              {result.quiz.length} Questions
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {dailyRemaining !== null && (
            <span className="text-[10px] font-mono text-ink-400 bg-ink-800/80 px-1.5 py-0.5 rounded border border-ink-700/50">
              {dailyRemaining}/10
            </span>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
              title="Collapse Companion Panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Pane Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin select-text">
        {/* Error Notification */}
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Enhanced AI Synthesis Loading State */}
        {loading && (
          <div className="space-y-4 py-2" aria-busy="true">
            {/* Glowing AI Card with Cycling Steps */}
            <div className="p-4 rounded-xl bg-highlight/10 border border-highlight/30 text-center space-y-2.5 shadow-sm">
              <div className="w-10 h-10 mx-auto rounded-full bg-highlight/15 border border-highlight/30 flex items-center justify-center text-highlight">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-highlight uppercase tracking-wider font-mono">
                  Synthesizing AI Recap
                </h3>
                <p className="text-xs text-ink-200 font-medium transition-all duration-300">
                  {LOADING_STEPS[loadingStepIndex]}
                </p>
              </div>
            </div>

            {/* Shimmer Skeleton Cards */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-ink-850/80 border border-ink-800 space-y-2.5 relative overflow-hidden">
                <div className="h-3 w-28 bg-ink-700/60 rounded" />
                <div className="h-3 w-full bg-ink-700/40 rounded" />
                <div className="h-3 w-5/6 bg-ink-700/40 rounded" />
                <div className="h-3 w-4/6 bg-ink-700/40 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-32 bg-ink-700/60 rounded px-1" />
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-ink-850/70 border border-ink-800 p-3 space-y-2">
                    <div className="h-2.5 w-3/4 bg-ink-700/50 rounded" />
                    <div className="h-2 w-1/2 bg-ink-700/30 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty / Ready State */}
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center text-center py-10 px-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-highlight/10 border border-highlight/20 flex items-center justify-center text-highlight shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            <div className="space-y-1 max-w-xs">
              <h3 className="font-semibold text-sm text-ink-100">Study Companion Ready</h3>
              <p className="text-xs text-ink-400 leading-relaxed">
                Extract concept summaries, active recall quizzes, and interactive flashcards from your notes.
              </p>
            </div>

            <button
              type="button"
              onClick={onRecap}
              disabled={notesLength < 40}
              className="w-full max-w-xs py-2 px-4 rounded-lg bg-highlight text-ink-950 font-semibold text-xs hover:bg-highlight/90 transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span>{notesLength < 40 ? "Write min. 40 characters" : "Start AI Recap"}</span>
            </button>

            {/* Feature Pills with SVG Icons */}
            <div className="grid grid-cols-1 gap-2 w-full pt-2 text-left">
              <div className="p-2.5 rounded-md bg-ink-850/60 border border-ink-800 text-[11px] text-ink-300 flex items-center gap-2">
                <span className="text-sky-400 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <span>Core Summary & Text-to-Speech</span>
              </div>
              <div className="p-2.5 rounded-md bg-ink-850/60 border border-ink-800 text-[11px] text-ink-300 flex items-center gap-2">
                <span className="text-highlight flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    <circle cx="12" cy="12" r="5" strokeWidth={2} />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <span>Active Recall Quiz & Scorecard</span>
              </div>
              <div className="p-2.5 rounded-md bg-ink-850/60 border border-ink-800 text-[11px] text-ink-300 flex items-center gap-2">
                <span className="text-emerald-400 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="14" height="15" rx="2" strokeWidth={1.75} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 3h12a2 2 0 012 2v13" />
                  </svg>
                </span>
                <span>Interactive 3D Flashcard Deck</span>
              </div>
            </div>
          </div>
        )}

        {/* Result: Core Summary & Self-Test */}
        {result && !loading && (
          <>
            {/* Core Summary Card */}
            <div className="rounded-lg border border-ink-700/70 bg-ink-850/90 p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-ink-750">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-300 font-mono">
                    Summary
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <SpeechControls
                    isSpeaking={isSpeaking}
                    speechRate={speechRate}
                    onToggleSpeech={onToggleSpeech}
                    onCycleRate={onCycleSpeechRate}
                  />
                  <button
                    type="button"
                    onClick={onCopySummary}
                    className="text-[11px] text-ink-400 hover:text-ink-100 px-1.5 py-0.5 rounded hover:bg-ink-750 transition-colors inline-flex items-center gap-1"
                  >
                    {copiedType === "summary" ? (
                      <>
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <span>Copy</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-ink-100">
                <FormattedText text={result.summary} />
              </div>
            </div>

            {/* Active Recall Self-Test */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-300 font-mono">
                    Self-Test ({result.quiz.length})
                  </span>
                  {reviewedCount > 0 && (
                    <span className="text-[11px] text-highlight font-mono">
                      &bull; {knownCount}/{result.quiz.length} understood
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Regenerate Quiz with Question Count Picker */}
                  {onRegenerateQuiz && (
                    <div className="relative inline-flex items-center" ref={regenMenuRef}>
                      <div className="inline-flex items-center rounded-md bg-ink-900 border border-ink-750 overflow-hidden text-[11px]">
                        <button
                          type="button"
                          disabled={isRegeneratingQuiz}
                          onClick={() => onRegenerateQuiz(selectedRegenCount)}
                          className="px-2 py-0.5 text-highlight hover:text-highlight-hover hover:bg-ink-800 font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                          title={`Regenerate ${selectedRegenCount} new questions`}
                        >
                          <svg
                            className={`w-3 h-3 ${isRegeneratingQuiz ? "animate-spin text-highlight" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>{isRegeneratingQuiz ? "Regenerating..." : `Regen (${selectedRegenCount})`}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isRegeneratingQuiz}
                          onClick={() => setShowRegenMenu((v) => !v)}
                          className="px-1 py-0.5 border-l border-ink-750 text-ink-400 hover:text-ink-200 hover:bg-ink-800 transition-colors"
                          title="Choose number of questions to regenerate"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {showRegenMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowRegenMenu(false)}
                            onTouchStart={() => setShowRegenMenu(false)}
                          />
                          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-ink-700/80 bg-app-surface/98 p-1.5 shadow-2xl backdrop-blur-md animate-fade-in text-xs space-y-0.5">
                            <div className="px-2 py-1 text-[10px] font-mono text-highlight font-semibold border-b border-ink-800 mb-0.5">
                              Question Count
                            </div>
                            {[
                              { count: 4, label: "4 Questions", desc: "Quick (Default)" },
                              { count: 6, label: "6 Questions", desc: "Standard" },
                              { count: 8, label: "8 Questions", desc: "Deep Practice" },
                              { count: 10, label: "10 Questions", desc: "Exam Drill" },
                            ].map((opt) => (
                              <button
                                key={opt.count}
                                type="button"
                                onClick={() => {
                                  setSelectedRegenCount(opt.count);
                                  try {
                                    localStorage.setItem("ai_recap_quiz_count", opt.count.toString());
                                  } catch {}
                                  setShowRegenMenu(false);
                                  onRegenerateQuiz(opt.count);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                                  selectedRegenCount === opt.count
                                    ? "bg-highlight/15 text-highlight font-semibold"
                                    : "text-ink-200 hover:bg-ink-800 hover:text-ink-50"
                                }`}
                              >
                                <span>{opt.label}</span>
                                <span className="text-[10px] text-ink-400 font-mono">{opt.desc}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* View Mode Switcher: List vs Cards (Inkdrop Matte Style) */}
                  <div className="inline-flex rounded-md bg-ink-900 p-0.5 border border-ink-700/60 text-[10px]">
                    <button
                      type="button"
                      onClick={() => onChangeQuizViewMode("list")}
                      className={`px-2 py-0.5 rounded transition-all ${
                        quizViewMode === "list"
                          ? "bg-ink-700 text-ink-100 font-semibold shadow-xs border border-ink-600/40"
                          : "text-ink-400 hover:text-ink-200"
                      }`}
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeQuizViewMode("card")}
                      className={`px-2 py-0.5 rounded transition-all ${
                        quizViewMode === "card"
                          ? "bg-ink-700 text-ink-100 font-semibold shadow-xs border border-ink-600/40"
                          : "text-ink-400 hover:text-ink-200"
                      }`}
                    >
                      Cards
                    </button>
                  </div>
                </div>
              </div>

              {/* Notice when regenerating questions */}
              {isRegeneratingQuiz && (
                <div className="p-2.5 rounded-lg bg-highlight/10 border border-highlight/30 text-highlight text-xs flex items-center justify-center gap-2 animate-pulse font-mono">
                  <svg className="w-3.5 h-3.5 animate-spin text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generating {selectedRegenCount} new questions...</span>
                </div>
              )}

              {quizViewMode === "list" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleExpandAll}
                      className="text-[10px] text-ink-400 hover:text-ink-200"
                    >
                      {openIndices.length === result.quiz.length ? "Collapse All" : "Expand All Answers"}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {result.quiz.map((item, idx) => (
                      <QuizCard
                        key={idx}
                        item={item}
                        index={idx}
                        isOpen={openIndices.includes(idx)}
                        rating={ratings[idx]}
                        onToggle={handleToggleQuestion}
                        onRate={onRate}
                      />
                    ))}
                  </ul>
                </div>
              ) : (
                <FlashcardDeck
                  quiz={result.quiz}
                  activeCardIndex={activeCardIndex}
                  isCardFlipped={isCardFlipped}
                  ratings={ratings}
                  onSelectCard={onCardIndexChange}
                  onFlipCard={onFlipCard}
                  onPrevCard={() =>
                    onCardIndexChange(
                      activeCardIndex > 0 ? activeCardIndex - 1 : result.quiz.length - 1
                    )
                  }
                  onNextCard={() =>
                    onCardIndexChange(
                      activeCardIndex < result.quiz.length - 1 ? activeCardIndex + 1 : 0
                    )
                  }
                  onRate={onRate}
                />
              )}
            </div>

            {/* Retention Scorecard */}
            {reviewedCount > 0 && (
              <RetentionScorecard
                quiz={result.quiz}
                ratings={ratings}
                onRetest={onRetest || (() => {})}
                onRetestMissed={onRetestMissed || (() => {})}
                onResetFullQuiz={onResetQuiz || (() => {})}
                onCopyMissed={onCopyMissed || (() => {})}
                studyStatus={studyStatus}
                onUpdateStatus={onChangeStatus}
                reviewTimes={reviewTimes}
              />
            )}

          </>
        )}
      </div>

      {/* Pane Bottom Footer Bar: Export & Print Actions */}
      {result && !loading && (
        <div className="h-11 px-3 border-t border-ink-800/80 bg-app-bg flex items-center justify-between gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onShare}
            className="flex-1 py-1.5 px-2.5 rounded-md bg-ink-850 hover:bg-ink-800 border border-ink-700/60 text-ink-300 hover:text-ink-100 flex items-center justify-center gap-1.5 transition-colors text-xs font-medium"
            title="Share study recap or copy share link"
          >
            <svg className="w-3.5 h-3.5 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="flex-1 py-1.5 px-2.5 rounded-md bg-ink-850 hover:bg-ink-800 border border-ink-700/60 text-ink-300 hover:text-ink-100 flex items-center justify-center gap-1.5 transition-colors text-xs font-medium"
            title="Print study sheet or save PDF"
          >
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print / PDF</span>
          </button>
        </div>
      )}
    </aside>
  );
});
