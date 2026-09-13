"use client";

import { useState, useMemo, useCallback, KeyboardEvent } from "react";

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  onReplace: (newText: string) => void;
}

export function FindReplaceModal({
  isOpen,
  onClose,
  text,
  onReplace,
}: FindReplaceModalProps) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const escapedSearch = useMemo(() => {
    // Escape regex special characters for literal search
    return searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }, [searchQuery]);

  const matches = useMemo(() => {
    if (!escapedSearch) return [] as { start: number; end: number }[];
    const flags = caseSensitive ? "g" : "gi";
    const regex = new RegExp(escapedSearch, flags);
    const result: { start: number; end: number }[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      result.push({ start: match.index, end: match.index + match[0].length });
      // Avoid zero‑length infinite loop
      if (match[0].length === 0) regex.lastIndex++;
    }
    return result;
  }, [text, escapedSearch, caseSensitive]);

  const currentMatch = matches[currentIndex] ?? null;

  const handleNext = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentIndex((i) => (i + 1) % matches.length);
  }, [matches.length]);

  const handlePrev = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentIndex((i) => (i - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const replaceAtCurrent = useCallback(() => {
    if (!currentMatch) return;
    const newText =
      text.slice(0, currentMatch.start) +
      replaceQuery +
      text.slice(currentMatch.end);
    onReplace(newText);
    // After replacement, reset index to start of next match
    setCurrentIndex(0);
  }, [currentMatch, replaceQuery, text, onReplace]);

  const replaceAll = useCallback(() => {
    if (!escapedSearch) return;
    const flags = caseSensitive ? "g" : "gi";
    const regex = new RegExp(escapedSearch, flags);
    const newText = text.replace(regex, replaceQuery);
    onReplace(newText);
    setCurrentIndex(0);
  }, [escapedSearch, caseSensitive, replaceQuery, text, onReplace]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Find and replace"
      className="fixed top-4 right-4 z-50 w-full max-w-sm bg-ink-900 border border-ink-600 rounded-xl p-4 shadow-2xl animate-fade-up overscroll-contain"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between pb-2 border-b border-ink-600/70">
        <h2 className="text-sm font-medium text-ink-50">Find & Replace</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-400 hover:text-ink-100 p-1 rounded hover:bg-ink-800 transition-colors touch-manipulation"
          aria-label="Close find & replace"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <label className="block text-xs text-ink-300 mb-1" htmlFor="find-input">
            Find
          </label>
          <input
            id="find-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full p-1 bg-ink-800 text-ink-50 border border-ink-600 rounded focus:outline-none focus:ring-1 focus:ring-highlight"
            placeholder="Search…"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-300 mb-1" htmlFor="replace-input">
            Replace
          </label>
          <input
            id="replace-input"
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="w-full p-1 bg-ink-800 text-ink-50 border border-ink-600 rounded focus:outline-none focus:ring-1 focus:ring-highlight"
            placeholder="Replace with…"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-ink-300">
          <button
            type="button"
            onClick={() => setCaseSensitive((c) => !c)}
            className="px-2 py-1 rounded bg-ink-800 hover:bg-ink-700"
          >
            {caseSensitive ? "Case Sensitive" : "Case Insensitive"}
          </button>
          <span>
            {matches.length === 0
              ? "0 of 0"
              : `${currentIndex + 1} of ${matches.length}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={matches.length === 0}
            className="flex-1 px-2 py-1 text-xs rounded bg-ink-800 hover:bg-ink-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={matches.length === 0}
            className="flex-1 px-2 py-1 text-xs rounded bg-ink-800 hover:bg-ink-700 disabled:opacity-50"
          >
            Next
          </button>
          <button
            type="button"
            onClick={replaceAtCurrent}
            disabled={!currentMatch}
            className="flex-1 px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={replaceAll}
            disabled={matches.length === 0}
            className="flex-1 px-2 py-1 text-xs rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
