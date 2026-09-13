"use client";

import { memo, useEffect, useRef } from "react";
import { Kbd } from "@/components/atoms/Kbd";

type ShortcutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ShortcutsModal = memo(function ShortcutsModal({
  isOpen,
  onClose,
}: ShortcutsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-fade-in no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#151622] border border-ink-700/90 rounded-2xl p-4 sm:p-6 shadow-2xl animate-fade-up overscroll-contain text-ink-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-ink-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div>
              <h2 id="shortcuts-dialog-title" className="text-sm font-bold text-ink-50 flex items-center gap-2">
                Keyboard Shortcuts
                <span className="text-[10px] font-mono text-ink-400 px-1.5 py-0.5 rounded bg-ink-800/80 border border-ink-700">
                  Cheat Sheet
                </span>
              </h2>
              <p className="text-[11px] text-ink-400">
                Speed up note-taking, formatting, and active recall with keybindings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-100 p-1.5 rounded-lg hover:bg-ink-800 transition-colors touch-manipulation"
            aria-label="Close keyboard shortcuts"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Grouped Shortcuts Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs min-h-0">
          {/* Group 1: Workstation & Navigation */}
          <div className="bg-[#12131b] border border-ink-800/80 rounded-xl p-3.5 flex flex-col space-y-2">
            <div className="flex items-center gap-1.5 pb-2 border-b border-ink-800 text-yellow-400 font-semibold text-[11px] uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Workstation &amp; Navigation</span>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Command Palette</span>
                <Kbd variant="highlight">Ctrl + K</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">New Note</span>
                <Kbd>Alt + N</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Save Draft</span>
                <Kbd>Ctrl + S</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Cycle View Mode</span>
                <Kbd>Ctrl + P</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Zoom In / Out</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl + =</Kbd>
                  <Kbd>Ctrl + -</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Reset Zoom</span>
                <Kbd>Ctrl + 0</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Undo / Redo</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl + Z</Kbd>
                  <Kbd>Ctrl + Y</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Close Modal / Speech</span>
                <Kbd>Esc</Kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-300">Toggle Shortcuts</span>
                <Kbd>?</Kbd>
              </div>
            </div>
          </div>

          {/* Group 2: Editor & Formatting */}
          <div className="bg-[#12131b] border border-ink-800/80 rounded-xl p-3.5 flex flex-col space-y-2">
            <div className="flex items-center gap-1.5 pb-2 border-b border-ink-800 text-yellow-400 font-semibold text-[11px] uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editor &amp; Markdown</span>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Bold / Italic</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl + B</Kbd>
                  <Kbd>Ctrl + I</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Strikethrough</span>
                <Kbd>Ctrl + Shift + X</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Heading 1 / 2 / 3</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl + 1</Kbd>
                  <Kbd>2</Kbd>
                  <Kbd>3</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Lists (Bullet / Number)</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl+Shift+8</Kbd>
                  <Kbd>7</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Code Block</span>
                <Kbd>Ctrl + Shift + `</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Blockquote</span>
                <Kbd>Ctrl + Shift + .</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Insert Link</span>
                <Kbd>Ctrl + Shift + L</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Horizontal Rule</span>
                <Kbd>Ctrl + Shift + -</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Find / Replace</span>
                <div className="flex gap-1">
                  <Kbd>Ctrl + F</Kbd>
                  <Kbd>Ctrl + H</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Move Line Up / Down</span>
                <div className="flex gap-1">
                  <Kbd>Alt + ↑</Kbd>
                  <Kbd>Alt + ↓</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-300">Indent / Outdent List</span>
                <div className="flex gap-1">
                  <Kbd>Tab</Kbd>
                  <Kbd>Shift + Tab</Kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Group 3: Active Recall & Study */}
          <div className="bg-[#12131b] border border-ink-800/80 rounded-xl p-3.5 flex flex-col space-y-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-1.5 pb-2 border-b border-ink-800 text-yellow-400 font-semibold text-[11px] uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Active Recall &amp; Study</span>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Generate Study Recap</span>
                <Kbd variant="highlight">Ctrl + Enter</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Flip Card / Reveal</span>
                <Kbd>Space / Enter</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Next / Previous Card</span>
                <Kbd>← / →</Kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-850/60">
                <span className="text-ink-300">Mark as Mastered</span>
                <div className="flex gap-1">
                  <Kbd variant="emerald">1</Kbd>
                  <Kbd variant="emerald">k</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-300">Mark as Needs Review</span>
                <div className="flex gap-1">
                  <Kbd variant="yellow">2</Kbd>
                  <Kbd variant="yellow">r</Kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-ink-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-ink-500 hidden sm:inline">
            Press <code className="text-yellow-400 font-mono">?</code> anywhere to open this dialog
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-200 text-xs font-medium transition-colors touch-manipulation ml-auto"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});
