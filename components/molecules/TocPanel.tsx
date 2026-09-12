"use client";

import { memo, useEffect } from "react";
import { TocEntry } from "@/lib/generateToc";

type TocPanelProps = {
  entries: TocEntry[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAnchor?: (anchorId: string) => void;
};

export const TocPanel = memo(function TocPanel({
  entries,
  isOpen,
  onClose,
  onSelectAnchor,
}: TocPanelProps) {
  if (!isOpen) return null;

  function handleItemClick(anchorId: string) {
    if (onSelectAnchor) {
      onSelectAnchor(anchorId);
    } else {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        onTouchStart={onClose}
      />

      {/* Floating TOC Card */}
      <div className="fixed top-24 right-4 sm:right-10 z-50 w-72 max-w-[calc(100vw-32px)] rounded-xl border border-ink-700/90 bg-[#161722]/98 p-3.5 shadow-2xl backdrop-blur-md transition-all animate-fade-in text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink-800">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-yellow-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h10M4 18h14"
              />
            </svg>
            <span className="font-semibold text-ink-100 uppercase tracking-wider text-[11px]">
              Table of Contents
            </span>
            <span className="text-[10px] bg-ink-800 text-ink-400 px-1.5 py-0.2 rounded border border-ink-700 font-mono">
              {entries.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-200 p-1 rounded hover:bg-ink-800 transition-colors"
            title="Close Outline"
            aria-label="Close Outline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      {entries.length === 0 ? (
        <div className="py-4 text-center text-ink-400">
          <p className="text-[11px] text-ink-300">No headings detected yet</p>
          <p className="text-[10px] text-ink-500 mt-1">
            Type <code className="text-highlight bg-ink-800 px-1 py-0.5 rounded font-mono"># Heading</code> in your notes to create navigation anchors.
          </p>
        </div>
      ) : (
        <ul className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {entries.map((item, idx) => {
            const indentClass =
              item.level === 1
                ? "font-medium text-ink-100 pl-1"
                : item.level === 2
                ? "pl-4 text-ink-300"
                : "pl-7 text-ink-400 text-[11px]";

            return (
              <li key={`${item.anchorId}-${idx}`}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item.anchorId)}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-ink-800 hover:text-highlight transition-colors truncate block ${indentClass}`}
                  title={item.text}
                >
                  <span className="text-ink-500 mr-1.5 font-mono text-[10px]">
                    {"#".repeat(item.level)}
                  </span>
                  {item.text}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </>
  );
});
