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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in no-print"
        onClick={onClose}
      >
      <div
        className="w-full max-w-md bg-ink-900 border border-ink-600 rounded-xl p-5 sm:p-6 shadow-2xl animate-fade-up overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-ink-600/70">
          <h2
            id="shortcuts-dialog-title"
            className="text-sm font-medium text-ink-50 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-highlight flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>Keyboard Shortcuts</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-100 p-1 rounded hover:bg-ink-800 transition-colors touch-manipulation"
            aria-label="Close keyboard shortcuts"
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

        <div className="py-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Command Palette (Search all)</span>
            <Kbd variant="highlight">Ctrl + K</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Generate study recap</span>
            <Kbd variant="highlight">Ctrl + Enter</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Save Draft</span>
            <Kbd>Ctrl + S</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">New Note</span>
            <Kbd>Alt + N</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Cycle editor mode (Edit/Split/Preview)</span>
            <Kbd>Ctrl + P</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Zoom in</span>
            <Kbd>Ctrl + =</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Zoom out</span>
            <Kbd>Ctrl + -</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Reset zoom</span>
            <Kbd>Ctrl + 0</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Undo / Redo</span>
            <div className="flex gap-1">
              <Kbd>Ctrl + Z</Kbd>
              <Kbd>Ctrl + Y</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Bold</span>
            <Kbd>Ctrl + B</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Italic</span>
            <Kbd>Ctrl + I</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Strikethrough</span>
            <Kbd>Ctrl + Shift + X</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Code Block</span>
            <Kbd>Ctrl + Shift + `</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Blockquote</span>
            <Kbd>Ctrl + Shift + .</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Horizontal Rule</span>
            <Kbd>Ctrl + Shift + -</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Insert Link</span>
            <Kbd>Ctrl + Shift + L</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Heading 1 / 2 / 3</span>
            <div className="flex gap-1">
              <Kbd>Ctrl + 1</Kbd>
              <Kbd>Ctrl + 2</Kbd>
              <Kbd>Ctrl + 3</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Bullet List</span>
            <Kbd>Ctrl + Shift + 8</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Numbered List</span>
            <Kbd>Ctrl + Shift + 7</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Find</span>
            <Kbd>Ctrl + F</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Find &amp; Replace</span>
            <Kbd>Ctrl + H</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Move Line Up / Down</span>
            <div className="flex gap-1">
              <Kbd>Alt + ↑</Kbd>
              <Kbd>Alt + ↓</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Tab indent / dedent list</span>
            <div className="flex gap-1">
              <Kbd>Tab</Kbd>
              <Kbd>Shift + Tab</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Flip card / Reveal answer</span>
            <Kbd>Space / Enter</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Next / Previous card</span>
            <Kbd>← / →</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Mark as Remembered</span>
            <div className="flex gap-1">
              <Kbd variant="emerald">1</Kbd>
              <Kbd variant="emerald">k</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Mark as Review again</span>
            <div className="flex gap-1">
              <Kbd variant="amber">2</Kbd>
              <Kbd variant="amber">r</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-ink-800/80">
            <span className="text-ink-300">Close modal / Stop speech</span>
            <Kbd>Esc</Kbd>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-ink-300">Toggle this cheat-sheet</span>
            <Kbd>?</Kbd>
          </div>
        </div>

        <div className="pt-3 border-t border-ink-600/70 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-ink-200 text-xs transition-colors touch-manipulation"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});
