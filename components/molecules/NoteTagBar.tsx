"use client";

import { memo, useState, useRef, useEffect } from "react";
import { getTagDotColor, normalizeTag } from "@/lib/tags";

type NoteTagBarProps = {
  tags: string[];
  allTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onSelectTag?: (tag: string) => void;
};

export const NoteTagBar = memo(function NoteTagBar({
  tags,
  allTags,
  onAddTag,
  onRemoveTag,
  onSelectTag,
}: NoteTagBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTagButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePopover = () => {
    if (!isOpen && addTagButtonRef.current) {
      const rect = addTagButtonRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 6,
        left: Math.min(Math.max(8, rect.left), window.innerWidth - 240),
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setInputValue("");
    }
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInputValue("");
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setInputValue("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const cleanInput = normalizeTag(inputValue);

  // Filter existing workspace tags that are not yet on this note
  const availableTags = allTags
    .filter((t) => !tags.includes(t.toLowerCase()))
    .filter((t) => (cleanInput ? t.toLowerCase().includes(cleanInput) : true));

  const canCreateNew = cleanInput.length >= 2 && !tags.includes(cleanInput);

  function handleCreateOrSelect(tag: string) {
    const cleaned = normalizeTag(tag);
    if (cleaned) {
      onAddTag(cleaned);
      setInputValue("");
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5 flex-wrap min-w-0">
      {/* Tag Icon */}
      <div className="flex items-center gap-1 text-[11px] text-ink-400 flex-shrink-0">
        <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V5a2 2 0 012-2z" />
        </svg>
      </div>

      {/* Active Tags Chips */}
      {tags.map((tag) => {
        const dotColor = getTagDotColor(tag);
        return (
          <span
            key={tag}
            className="group/chip inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-ink-850 border border-ink-700/80 text-[10px] text-ink-200 hover:border-yellow-400/40 transition-all select-none"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
            <button
              type="button"
              onClick={() => onSelectTag?.(tag)}
              className="hover:text-yellow-300 transition-colors font-mono"
              title={`Filter by #${tag}`}
            >
              #{tag}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag);
              }}
              className="text-ink-400 hover:text-rose-400 p-0.5 rounded transition-colors ml-0.5"
              title={`Remove tag #${tag}`}
              aria-label={`Remove tag #${tag}`}
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        );
      })}

      {/* Add Tag Button */}
      <button
        ref={addTagButtonRef}
        type="button"
        onClick={togglePopover}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all border ${
          isOpen
            ? "bg-yellow-400/20 text-yellow-300 border-yellow-400/50"
            : "text-ink-400 hover:text-ink-100 bg-ink-850/60 hover:bg-ink-800 border-ink-700/60"
        }`}
        title="Add tag to note"
        aria-label="Add tag to note"
      >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        <span>Tag</span>
      </button>

      {/* Add / Create Tag Popover Dropdown (Fixed in viewport to bypass overflow clipping) */}
      {isOpen && popoverPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setInputValue("");
            }}
            onTouchStart={() => {
              setIsOpen(false);
              setInputValue("");
            }}
          />
          <div
            style={{
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
            }}
            className="fixed z-50 w-56 max-w-[calc(100vw-24px)] rounded-lg border border-ink-700 bg-app-surface/98 p-2 shadow-2xl backdrop-blur-md animate-fade-in space-y-1.5"
          >
            <div className="flex items-center justify-between pb-1 border-b border-ink-800 text-[11px] font-semibold text-ink-300">
              <span>Add or Create Tag</span>
              <span className="text-[9px] text-ink-500 font-mono">Esc to close</span>
            </div>

            {/* Tag Input */}
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-500 font-mono">#</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (canCreateNew) {
                      handleCreateOrSelect(cleanInput);
                    } else if (availableTags.length > 0) {
                      handleCreateOrSelect(availableTags[0]);
                    }
                  }
                }}
                placeholder="e.g. physics, exam..."
                className="w-full bg-ink-900 border border-ink-700 rounded pl-5 pr-2 py-1 text-xs text-ink-100 placeholder-ink-500 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            {/* Create New Tag Option */}
            {canCreateNew && (
              <button
                type="button"
                onClick={() => handleCreateOrSelect(cleanInput)}
                className="w-full text-left px-2 py-1.5 rounded bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 text-xs font-medium transition-colors flex items-center justify-between group"
              >
                <span className="truncate">Create &ldquo;#{cleanInput}&rdquo;</span>
                <span className="text-[9px] font-mono text-yellow-400/70 border border-yellow-400/30 px-1 rounded">
                  Enter
                </span>
              </button>
            )}

            {/* Existing Workspace Tags to Pick */}
            {availableTags.length > 0 && (
              <div className="space-y-0.5 pt-1">
                <div className="text-[10px] text-ink-500 font-medium px-1">Workspace tags</div>
                <div className="max-h-32 overflow-y-auto space-y-0.5 scrollbar-thin">
                  {availableTags.map((tag) => {
                    const dot = getTagDotColor(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleCreateOrSelect(tag)}
                        className="w-full text-left px-2 py-1 rounded text-xs text-ink-300 hover:text-ink-50 hover:bg-ink-800 transition-colors flex items-center gap-2"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                        <span className="truncate">#{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="pt-1 border-t border-ink-800/80 text-[10px] text-ink-500 italic px-1">
              Tip: Type <code className="text-yellow-400/80">#tag</code> in note to auto-tag
            </div>
          </div>
        </>
      )}
    </div>
  );
});
