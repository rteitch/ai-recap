"use client";

import { useState, useRef, useEffect, memo } from "react";

export type NotebookOption = {
  id: string;
  label: string;
  icon?: string;
};

type NotebookDropdownProps = {
  currentNotebookId: string;
  notebooks: NotebookOption[];
  onSelectNotebook: (notebookId: string) => void;
  disabled?: boolean;
};

function renderNotebookIcon(icon?: string) {
  switch (icon) {
    case "academic":
      return (
        <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      );
    case "rocket":
      return (
        <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case "inbox":
    default:
      return (
        <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      );
  }
}

export const NotebookDropdown = memo(function NotebookDropdown({
  currentNotebookId,
  notebooks,
  onSelectNotebook,
  disabled = false,
}: NotebookDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentNb =
    notebooks.find((nb) => nb.id === currentNotebookId) ||
    notebooks[0] || { id: "Inbox", label: "Inbox" };

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 208;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 16));
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < 180 ? Math.max(12, rect.top - 160) : rect.bottom + 4;
      setMenuPos({ top, left });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border transition-all ${
          isOpen
            ? "bg-[#202230] border-yellow-400/50 text-yellow-300 shadow-xs"
            : "bg-[#181924] border-ink-750 text-ink-300 hover:text-ink-100 hover:border-ink-600 hover:bg-[#1f202c]"
        }`}
        title={`Notebook: ${currentNb.label} (Click to change)`}
      >
        <span className="truncate max-w-[100px]">{currentNb.label}</span>
        <svg
          className={`w-2.5 h-2.5 text-ink-400 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180 text-yellow-400" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && menuPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
            className="fixed z-50 w-52 rounded-xl border border-ink-700/80 bg-[#161722]/98 p-1.5 shadow-2xl backdrop-blur-md animate-fade-in space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1 text-[10px] font-semibold text-yellow-400 border-b border-ink-800 mb-1 flex items-center justify-between">
              <span>Move Note to Notebook</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-ink-400 hover:text-ink-100 p-0.5 text-xs"
              >
                ✕
              </button>
            </div>

            {notebooks.map((nb) => {
              const isSelected = nb.id === currentNotebookId;
              return (
                <button
                  key={nb.id}
                  type="button"
                  onClick={() => {
                    onSelectNotebook(nb.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between gap-2 group text-xs ${
                    isSelected
                      ? "bg-yellow-400/15 text-yellow-300 font-semibold"
                      : "text-ink-200 hover:bg-ink-800 hover:text-ink-50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {renderNotebookIcon(nb.icon)}
                    <span className="truncate">{nb.label}</span>
                  </div>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});
