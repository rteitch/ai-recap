"use client";

import { memo } from "react";

type WelcomeBannerProps = {
  onLoadSample: () => void;
  onOpenTemplates: () => void;
  onInsertMermaid: () => void;
  onDismiss?: () => void;
};

export const WelcomeBanner = memo(function WelcomeBanner({
  onLoadSample,
  onOpenTemplates,
  onInsertMermaid,
  onDismiss,
}: WelcomeBannerProps) {
  return (
    <div className="m-3 sm:m-4 p-4 sm:p-5 rounded-xl border border-yellow-400/20 bg-gradient-to-br from-[#1c1d29] to-[#14151e] shadow-xl text-ink-100 relative group animate-fade-in">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 text-ink-500 hover:text-ink-200 p-1 rounded-md hover:bg-ink-800 transition-colors"
          title="Dismiss guide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm sm:text-base text-ink-50">
              Welcome to AI Recap Workstation
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-semibold">
              Beginner Guide
            </span>
          </div>
          <p className="text-xs text-ink-300 leading-relaxed max-w-xl">
            Turn your study materials and formulas into concise summaries, flashcards, and active-recall tests with 1 click.
          </p>
        </div>
      </div>

      {/* 3 Step Onboarding Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-ink-800/80 text-xs">
        <div className="p-2.5 rounded-lg bg-ink-900/60 border border-ink-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-yellow-400 font-semibold text-[11px]">
            <span className="w-4 h-4 rounded-full bg-yellow-400/20 flex items-center justify-center text-[10px]">1</span>
            <span>Write or Import</span>
          </div>
          <p className="text-[11px] text-ink-400 leading-normal">
            Type notes, drop files (.md/.txt), or use LaTeX math (<code className="text-yellow-400 font-mono">\</code>) and Mermaid diagrams.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-ink-900/60 border border-ink-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
            <span className="w-4 h-4 rounded-full bg-sky-400/20 flex items-center justify-center text-[10px]">2</span>
            <span>Click AI Recap</span>
          </div>
          <p className="text-[11px] text-ink-400 leading-normal">
            Hit the yellow <strong className="text-ink-200 font-medium">AI Recap</strong> button (or Ctrl+Enter) to generate your core concepts.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-ink-900/60 border border-ink-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <span className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center text-[10px]">3</span>
            <span>Active Recall Test</span>
          </div>
          <p className="text-[11px] text-ink-400 leading-normal">
            Flip interactive Flashcards in the companion pane to test memory and master topics.
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <button
          type="button"
          onClick={onLoadSample}
          className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span>Load Sample ($E=mc^2$)</span>
        </button>

        <button
          type="button"
          onClick={onOpenTemplates}
          className="px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-200 hover:text-ink-50 font-medium text-xs border border-ink-700/80 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span>Choose Note Template</span>
        </button>

        <button
          type="button"
          onClick={onInsertMermaid}
          className="px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-200 hover:text-ink-50 font-medium text-xs border border-ink-700/80 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span>Insert Mermaid Diagram</span>
        </button>
      </div>
    </div>
  );
});
