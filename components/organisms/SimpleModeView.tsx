"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import { RecapResult, RatingType } from "@/lib/types";
import { FormattedText } from "@/components/atoms/FormattedText";
import { CustomApiConfig } from "@/lib/ai-config";

type SimpleModeViewProps = {
  notes: string;
  onNotesChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  result: RecapResult | null;
  onRecap: () => void;
  onClear: () => void;
  onLoadSample?: () => void;
  dailyRemaining: number | null;
  customApiConfig: CustomApiConfig;
  recapMode: "brief" | "detailed";
  onSetRecapMode: (m: "brief" | "detailed") => void;
  quizCount: 3 | 5 | 10;
  onSetQuizCount: (n: 3 | 5 | 10) => void;
  ratings: Record<number, RatingType>;
  onRate: (index: number, rating: RatingType) => void;
  onSwitchToWorkstation: () => void;
  onOpenSettings: () => void;
  onOpenAppearance: () => void;
};

const LOADING_STEPS = [
  "Reading your notes…",
  "Extracting key concepts…",
  "Building active-recall questions…",
  "Finalizing your recap…",
];

export const SimpleModeView = memo(function SimpleModeView({
  notes,
  onNotesChange,
  loading,
  error,
  result,
  onRecap,
  onClear,
  onLoadSample,
  dailyRemaining,
  customApiConfig,
  recapMode,
  onSetRecapMode,
  quizCount,
  onSetQuizCount,
  ratings,
  onRate,
  onSwitchToWorkstation,
  onOpenSettings,
  onOpenAppearance,
}: SimpleModeViewProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [inputView, setInputView] = useState<"write" | "split" | "preview">("write");
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-detect math & diagrams
  const hasLatex = useMemo(() => /([$]{1,2}[^$]+[$]{1,2}|\\\(|\\\[)/.test(notes), [notes]);
  const hasMermaid = useMemo(() => /```mermaid[\s\S]*?```/i.test(notes), [notes]);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).filter(Boolean).length : 0;
  const isOverLimit = notes.length > 20000;

  // Loading step cycling
  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      loadingIntervalRef.current = setInterval(() => {
        setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
      }, 1800);
    } else {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    }
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [loading]);

  // Scroll to result on success
  useEffect(() => {
    if (result && !loading) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [result, loading]);

  const toggleQuiz = useCallback((idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  const handleCopySummary = useCallback(async () => {
    if (!result?.summary) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {}
  }, [result]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!loading && notes.trim().length >= 40) onRecap();
      }
    },
    [loading, notes, onRecap]
  );

  const usingCustom =
    customApiConfig.enabled && customApiConfig.provider !== "default";

  return (
    <div className="min-h-screen bg-app-bg text-ink-100 flex flex-col print:bg-white print:text-black">
      {/* Top bar: logo left, actions right */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-12 border-b border-app-border bg-app-sidebar/80 backdrop-blur-md flex-shrink-0 print:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src="/android-chrome-192x192.png"
            alt="AI Recap"
            width={22}
            height={22}
            className="rounded"
          />
          <span className="font-serif font-bold text-base text-ink-100 italic">AI Recap</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Recap Mode toggle */}
          <div className="hidden sm:flex items-center rounded-md border border-app-border overflow-hidden text-[11px]">
            {(["detailed", "brief"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSetRecapMode(m)}
                className={`px-2.5 py-1 font-semibold transition-colors capitalize ${
                  recapMode === m
                    ? "bg-highlight text-highlight-text"
                    : "text-ink-400 hover:text-ink-200 bg-app-card"
                }`}
                title={`Recap mode: ${m}`}
              >
                {m === "detailed" ? "Detail" : "Brief"}
              </button>
            ))}
          </div>

          {/* Quiz count toggle */}
          <div className="hidden sm:flex items-center rounded-md border border-app-border overflow-hidden text-[11px]">
            {([3, 5, 10] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onSetQuizCount(n)}
                className={`px-2 py-1 font-semibold font-mono transition-colors ${
                  quizCount === n
                    ? "bg-highlight text-highlight-text"
                    : "text-ink-400 hover:text-ink-200 bg-app-card"
                }`}
                title={`Quiz questions: ${n}`}
              >
                {n}Q
              </button>
            ))}
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
            title="AI Settings"
            aria-label="AI Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Appearance */}
          <button
            type="button"
            onClick={onOpenAppearance}
            className="p-1.5 rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
            title="Appearance"
            aria-label="Appearance"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>

          {/* Switch to Workstation */}
          <button
            type="button"
            onClick={onSwitchToWorkstation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-ink-300 hover:text-ink-50 hover:bg-ink-800 border border-app-border transition-colors"
            title="Switch to Workstation Mode (full editor + note library)"
            aria-label="Switch to Workstation Mode"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span className="hidden sm:inline">Workstation</span>
          </button>
        </div>
      </header>

      {/* Main content — centered */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl flex flex-col gap-6">

          {/* Hero header */}
          <div className="text-center space-y-2 pb-2">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/android-chrome-192x192.png"
                alt="AI Recap Logo"
                width={44}
                height={44}
                className="rounded-xl shadow-md"
              />
              <h1 className="font-serif text-3xl sm:text-4xl font-bold italic text-ink-50">
                AI Recap
              </h1>
            </div>
            <p className="text-sm text-ink-400 max-w-sm mx-auto leading-relaxed">
              Paste your notes, an article, or a meeting transcript. Get a short summary and
              questions to test whether it actually stuck.
            </p>
            {usingCustom && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-highlight/10 text-highlight border border-highlight/20 font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Custom AI: {customApiConfig.model || "custom"}
              </span>
            )}
          </div>

          {/* Note input section */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  htmlFor="simple-notes"
                  className="block text-sm font-semibold text-ink-300"
                >
                  Your notes
                </label>
                {hasLatex && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-fade-in"
                    title="KaTeX Math syntax detected ($ or $$)"
                  >
                    <span>∑</span> KaTeX Aktif
                  </span>
                )}
                {hasMermaid && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-fade-in"
                    title="Mermaid diagram code detected"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4" />
                    </svg>
                    Mermaid Aktif
                  </span>
                )}
              </div>

              {/* View Switcher: Tulis | Live Split | Pratinjau */}
              <div className="flex items-center rounded-lg border border-app-border bg-app-card p-0.5 text-xs select-none">
                <button
                  type="button"
                  onClick={() => setInputView("write")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    inputView === "write"
                      ? "bg-highlight text-highlight-text font-semibold shadow-xs"
                      : "text-ink-400 hover:text-ink-200"
                  }`}
                  title="Mode Tulis teks biasa"
                >
                  Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setInputView("split")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                    inputView === "split"
                      ? "bg-highlight text-highlight-text font-semibold shadow-xs"
                      : "text-ink-400 hover:text-ink-200"
                  }`}
                  title="Live Split: Tulis di atas, render rumus & diagram otomatis di bawah saat mengetik"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span>Live Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputView("preview")}
                  disabled={!notes.trim()}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    inputView === "preview"
                      ? "bg-highlight text-highlight-text font-semibold shadow-xs"
                      : "text-ink-400 hover:text-ink-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                  title="Pratinjau tampilan penuh"
                >
                  Pratinjau
                </button>
              </div>
            </div>

            {/* Input / Preview Area */}
            {inputView === "preview" ? (
              <div className="w-full rounded-xl border border-app-border bg-app-card px-5 py-4 text-sm leading-relaxed text-ink-100 min-h-[220px] max-h-[500px] overflow-y-auto space-y-2 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-app-border/60 text-xs text-ink-400 font-mono">
                  <span className="flex items-center gap-1.5 text-highlight font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Pratinjau Catatan Rendered (KaTeX & Mermaid)
                  </span>
                  <button
                    type="button"
                    onClick={() => setInputView("write")}
                    className="text-highlight hover:underline text-[11px]"
                  >
                    Edit kembali
                  </button>
                </div>
                <div className="pt-1">
                  <FormattedText text={notes || "*Belum ada catatan.*"} />
                </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  id="simple-notes"
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste anything you need to remember… Mendukung rumus KaTeX ($E=mc^2$) dan diagram ```mermaid..."
                  rows={inputView === "split" ? 7 : 10}
                  disabled={loading}
                  aria-label="Your notes to recap"
                  className={`w-full rounded-xl border px-4 py-3.5 text-sm leading-relaxed resize-none font-[inherit] transition-all bg-app-card text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 ${
                    isOverLimit
                      ? "border-red-500/60 focus:ring-red-500/30 focus:border-red-500"
                      : "border-app-border focus:ring-highlight/30 focus:border-highlight"
                  } disabled:opacity-60`}
                  style={{ minHeight: inputView === "split" ? "160px" : "200px" }}
                />
              </div>
            )}

            {/* Live Split Preview Box — Automatically updates as user types */}
            {inputView === "split" && (
              <div className="rounded-xl border border-app-border bg-app-card/80 p-4 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-ink-400 font-mono pb-2 border-b border-app-border/60">
                  <span className="flex items-center gap-1.5 text-highlight font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Pratinjau Otomatis (Live KaTeX & Mermaid)
                  </span>
                  <span className="text-[10px] text-ink-500">Terbaca otomatis saat mengetik</span>
                </div>
                <div className="text-sm leading-relaxed text-ink-100 max-h-[300px] overflow-y-auto pr-1">
                  {notes.trim() ? (
                    <FormattedText text={notes} />
                  ) : (
                    <p className="text-xs text-ink-500 italic py-2">
                      Ketik rumus seperti <code className="text-highlight font-mono">$E = mc^2$</code> atau diagram mermaid untuk melihat preview langsung.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer bar below textarea */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <span className={`text-xs tabular-nums ${isOverLimit ? "text-red-400" : "text-ink-500"}`}>
                  {wordCount.toLocaleString()} words
                  {isOverLimit && " — too long, will be trimmed"}
                </span>
                {notes.trim() ? (
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-xs text-ink-500 hover:text-red-400 transition-colors"
                    title="Clear notes"
                  >
                    Clear
                  </button>
                ) : onLoadSample ? (
                  <button
                    type="button"
                    onClick={onLoadSample}
                    className="text-xs text-ink-500 hover:text-highlight transition-colors"
                    title="Load contoh catatan dengan rumus KaTeX"
                  >
                    Contoh Catatan
                  </button>
                ) : null}
              </div>

              {/* Mobile mode toggles */}
              <div className="flex sm:hidden items-center gap-1.5">
                <div className="flex items-center rounded-md border border-app-border overflow-hidden text-[10px]">
                  {(["detailed", "brief"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onSetRecapMode(m)}
                      className={`px-2 py-0.5 font-semibold transition-colors capitalize ${
                        recapMode === m
                          ? "bg-highlight text-highlight-text"
                          : "text-ink-400 bg-app-card"
                      }`}
                    >
                      {m === "detailed" ? "D" : "B"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center rounded-md border border-app-border overflow-hidden text-[10px]">
                  {([3, 5, 10] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onSetQuizCount(n)}
                      className={`px-1.5 py-0.5 font-semibold font-mono transition-colors ${
                        quizCount === n
                          ? "bg-highlight text-highlight-text"
                          : "text-ink-400 bg-app-card"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onRecap}
                disabled={loading || notes.trim().length < 40}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-highlight text-highlight-text font-semibold text-sm shadow transition-all active:scale-95 hover:bg-highlight-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0"
                title={loading ? "Generating…" : "Ctrl+Enter to recap"}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Recapping…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Recap this</span>
                  </>
                )}
              </button>
            </div>

            {/* Daily quota hint */}
            {!usingCustom && dailyRemaining !== null && (
              <p className="text-[11px] text-ink-500 text-right tabular-nums">
                {dailyRemaining} / 10 recaps remaining today
              </p>
            )}
          </section>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4" aria-busy="true" aria-label="Generating recap">
              <div className="rounded-xl border border-highlight/25 bg-highlight/8 p-4 text-center space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-highlight/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-highlight animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-highlight uppercase tracking-wider font-mono">
                  Synthesizing AI Recap
                </p>
                <p className="text-xs text-ink-300 transition-all duration-300">
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-ink-800/60 rounded w-2/3" />
                <div className="h-3 bg-ink-800/40 rounded w-full" />
                <div className="h-3 bg-ink-800/40 rounded w-5/6" />
                <div className="h-3 bg-ink-800/30 rounded w-4/6" />
              </div>
            </div>
          )}

          {/* Result: Summary + Quiz */}
          {result && !loading && (
            <div ref={resultRef} className="space-y-5 pt-2">
              <hr className="border-app-border" />

              {/* Summary card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400 font-mono">
                    Summary
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-200 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-800"
                      title="Copy summary"
                    >
                      {copiedSummary ? (
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                      {copiedSummary ? "Copied!" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={onSwitchToWorkstation}
                      className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-highlight transition-colors px-1.5 py-0.5 rounded hover:bg-ink-800"
                      title="Open in Workstation for flashcards, retention scoring, and more"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Workstation
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-app-border bg-app-card px-4 py-3.5 text-sm leading-relaxed text-ink-200">
                  <FormattedText text={result.summary} />
                </div>
              </div>

              {/* Quiz questions */}
              {result.quiz && result.quiz.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400 font-mono">
                      Self-Test Questions{" "}
                      <span className="text-highlight font-mono normal-case ml-1">
                        ({result.quiz.length})
                      </span>
                    </h2>
                    {openIndices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOpenIndices([])}
                        className="text-[11px] text-ink-500 hover:text-ink-200 transition-colors"
                      >
                        Collapse all
                      </button>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {result.quiz.map((item, idx) => {
                      const isOpen = openIndices.includes(idx);
                      const rating = ratings[idx];
                      return (
                        <li
                          key={idx}
                          className="rounded-xl border border-app-border bg-app-card overflow-hidden transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => toggleQuiz(idx)}
                            aria-expanded={isOpen}
                            className="w-full px-4 py-3.5 text-left text-sm text-ink-100 hover:text-ink-50 flex items-center justify-between gap-3 transition-colors hover:bg-ink-800/30"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-highlight/15 border border-highlight/30 text-highlight text-[10px] font-bold font-mono flex items-center justify-center">
                                {idx + 1}
                              </span>
                              {rating === "known" && (
                                <span className="flex-shrink-0 text-emerald-400" title="Remembered">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              )}
                              {rating === "learning" && (
                                <span className="flex-shrink-0 text-amber-400" title="Review again">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </span>
                              )}
                              <span className="leading-snug text-sm">
                                <FormattedText text={item.question} />
                              </span>
                            </div>
                            <svg
                              className={`w-3.5 h-3.5 text-ink-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isOpen && (
                            <div className="border-t border-app-border px-4 py-3 bg-app-bg/40 space-y-3">
                              <div className="text-sm leading-relaxed text-ink-200">
                                <FormattedText text={item.answer} />
                              </div>
                              <div className="flex items-center gap-2 pt-1 border-t border-app-border/50">
                                <span className="text-[11px] text-ink-500">Did you recall this?</span>
                                <button
                                  type="button"
                                  onClick={() => onRate(idx, "known")}
                                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs transition-all active:scale-95 ${
                                    rating === "known"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                                      : "bg-ink-800 text-ink-400 hover:text-ink-100 border border-app-border"
                                  }`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Remembered
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRate(idx, "learning")}
                                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs transition-all active:scale-95 ${
                                    rating === "learning"
                                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold"
                                      : "bg-ink-800 text-ink-400 hover:text-ink-100 border border-app-border"
                                  }`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Review again
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {/* Score summary */}
                  {Object.keys(ratings).length > 0 && (
                    <div className="rounded-xl border border-app-border bg-app-card px-4 py-3 flex items-center justify-between text-sm">
                      <span className="text-ink-400">
                        <span className="text-emerald-400 font-bold">
                          {Object.values(ratings).filter((r) => r === "known").length}
                        </span>
                        <span className="text-ink-500"> / {result.quiz.length} remembered</span>
                      </span>
                      <button
                        type="button"
                        onClick={onSwitchToWorkstation}
                        className="text-xs text-highlight hover:underline font-medium"
                      >
                        Flashcards & full study tools →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Subtle footer promo to workstation */}
              <div className="text-center pt-2 pb-4">
                <p className="text-[11px] text-ink-600">
                  Want flashcard mode, retention scoring, note history & markdown editor?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToWorkstation}
                    className="text-highlight hover:underline font-medium"
                  >
                    Switch to Workstation mode
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Built with footer */}
      {!result && !loading && !error && (
        <footer className="text-center py-4 text-[11px] text-ink-700 print:hidden">
          Built with Next.js, deployed on Tencent EdgeOne Makers.
        </footer>
      )}
    </div>
  );
});
