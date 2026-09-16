"use client";

import { memo, useState, useEffect, useRef, useMemo } from "react";
import { HistoryItem } from "@/lib/types";
import { STUDY_TEMPLATES } from "@/lib/templates";
import { NotebookItem, NavFilterType } from "@/components/organisms/InkdropNavigation";
import { getTagDotColor } from "@/lib/tags";
import { Kbd } from "@/components/atoms/Kbd";

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  notebooks: NotebookItem[];
  allTags: string[];
  onSelectNote: (note: HistoryItem) => void;
  onNewNote: () => void;
  onRecap: () => void;
  onSaveDraft: () => void;
  onExportAnki: () => void;
  onDownloadTxt?: () => void;
  onExportPdf?: () => void;
  onShareNote?: () => void;
  onToggleCompanion: () => void;
  onApplyTemplate: (templateId: string) => void;
  onSelectFilter: (filter: NavFilterType) => void;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
  onOpenAppearance?: () => void;
  onOpenBackupRestore?: () => void;
  onClearNotes?: () => void;
};

type PaletteItem = {
  id: string;
  category: "notes" | "actions" | "templates" | "notebooks" | "tags";
  title: string;
  subtitle?: string;
  fullText?: string;
  shortcut?: string;
  dotColor?: string;
  onSelect: () => void;
};

export const CommandPalette = memo(function CommandPalette({
  isOpen,
  onClose,
  history,
  notebooks,
  allTags,
  onSelectNote,
  onNewNote,
  onRecap,
  onSaveDraft,
  onExportAnki,
  onDownloadTxt,
  onExportPdf,
  onShareNote,
  onToggleCompanion,
  onApplyTemplate,
  onSelectFilter,
  onOpenSettings,
  onOpenShortcuts,
  onOpenAppearance,
  onOpenBackupRestore,
  onClearNotes,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Handle ESC and Arrow keys
  useEffect(() => {
    if (!isOpen) return;

    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Focus trap and initial focus when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusable).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
    );
    if (focusableArray.length) focusableArray[0].focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const first = focusableArray[0];
        const last = focusableArray[focusableArray.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Build items catalogue
  const allItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [];

    // 1. Actions
    items.push(
      {
        id: "act-new-note",
        category: "actions",
        title: "New Note",
        subtitle: "Create a fresh empty note in active notebook",
        shortcut: "Alt+N",
        onSelect: () => {
          onNewNote();
          onClose();
        },
      },
      {
        id: "act-recap",
        category: "actions",
        title: "Generate AI Recap & Quiz",
        subtitle: "Analyze current notes with AI companion",
        shortcut: "Ctrl+Enter",
        onSelect: () => {
          onRecap();
          onClose();
        },
      },
      {
        id: "act-save-draft",
        category: "actions",
        title: "Save Draft to Workstation",
        subtitle: "Store locally with 0 server retention",
        shortcut: "Ctrl+S",
        onSelect: () => {
          onSaveDraft();
          onClose();
        },
      },
      {
        id: "act-export-anki",
        category: "actions",
        title: "Export Flashcards to Anki (.tsv)",
        subtitle: "Download active recall cards with tags",
        onSelect: () => {
          onExportAnki();
          onClose();
        },
      }
    );

    if (onDownloadTxt) {
      items.push({
        id: "act-download-txt",
        category: "actions",
        title: "Download as Plain Text (.txt)",
        subtitle: "Export summary and quiz as text file",
        onSelect: () => {
          onDownloadTxt();
          onClose();
        },
      });
    }

    if (onExportPdf) {
      items.push({
        id: "act-export-pdf",
        category: "actions",
        title: "Export Note to PDF",
        subtitle: "Format and print markdown document",
        onSelect: () => {
          onExportPdf();
          onClose();
        },
      });
    }

    if (onShareNote) {
      items.push({
        id: "act-share",
        category: "actions",
        title: "Share Study Recap Link",
        subtitle: "Generate zero-token compressed URL",
        onSelect: () => {
          onShareNote();
          onClose();
        },
      });
    }

    items.push({
      id: "act-toggle-companion",
      category: "actions",
      title: "Toggle Study Companion Pane",
      subtitle: "Show/hide flashcards and summary scorecard",
      onSelect: () => {
        onToggleCompanion();
        onClose();
      },
    });

    if (onOpenSettings) {
      items.push({
        id: "act-settings",
        category: "actions",
        title: "Custom AI Gateway Settings",
        subtitle: "Configure API Key, custom endpoint, and model",
        onSelect: () => {
          onOpenSettings();
          onClose();
        },
      });
    }

    if (onOpenAppearance) {
      items.push({
        id: "act-appearance",
        category: "actions",
        title: "Appearance & Typography",
        subtitle: "Customize color themes, coding fonts, and reading text size",
        onSelect: () => {
          onOpenAppearance();
          onClose();
        },
      });
    }

    if (onOpenShortcuts) {
      items.push({
        id: "act-shortcuts",
        category: "actions",
        title: "Keyboard Shortcuts Cheat-sheet",
        subtitle: "View all hotkeys and commands",
        shortcut: "?",
        onSelect: () => {
          onOpenShortcuts();
          onClose();
        },
      });
    }

    if (onOpenBackupRestore) {
      items.push({
        id: "act-backup-restore",
        category: "actions",
        title: "Backup & Restore",
        subtitle: "Export or import all notes and settings",
        onSelect: () => {
          onOpenBackupRestore();
          onClose();
        },
      });
    }

    if (onClearNotes) {
      items.push({
        id: "act-clear-all",
        category: "actions",
        title: "Clear All Workstation Notes",
        subtitle: "Erase all saved history items",
        onSelect: () => {
          onClearNotes();
          onClose();
        },
      });
    }

    // 2. Study Templates
    STUDY_TEMPLATES.forEach((tmpl) => {
      items.push({
        id: `tmpl-${tmpl.id}`,
        category: "templates",
        title: `Template: ${tmpl.name}`,
        subtitle: tmpl.description,
        onSelect: () => {
          onApplyTemplate(tmpl.id);
          onClose();
        },
      });
    });

    // 3. Notebooks
    notebooks.forEach((nb) => {
      items.push({
        id: `nb-${nb.id}`,
        category: "notebooks",
        title: `Go to Notebook: ${nb.label}`,
        subtitle: `Filter notes in "${nb.label}"`,
        onSelect: () => {
          onSelectFilter({ type: "notebook", value: nb.id });
          onClose();
        },
      });
    });

    // 4. Tags
    allTags.forEach((tag) => {
      items.push({
        id: `tag-${tag}`,
        category: "tags",
        title: `Filter by Tag: #${tag}`,
        subtitle: `View all notes tagged #${tag}`,
        dotColor: getTagDotColor(tag),
        onSelect: () => {
          onSelectFilter({ type: "tag", value: tag });
          onClose();
        },
      });
    });

    // 5. Notes in History
    history.forEach((h) => {
      const noteTitle = h.title || h.preview.slice(0, 40) || "Untitled Note";
      const tagList = h.tags && h.tags.length > 0 ? h.tags.map((t) => `#${t}`).join(" ") : "";
      const fullText = (h.notes || "").toLowerCase();
      items.push({
        id: `note-${h.id}`,
        category: "notes",
        title: noteTitle,
        subtitle: `${h.notebook || "Inbox"} • ${h.preview.slice(0, 75)}${tagList ? ` • ${tagList}` : ""}`,
        fullText,
        onSelect: () => {
          onSelectNote(h);
          onClose();
        },
      });
    });

    return items;
  }, [
    history,
    notebooks,
    allTags,
    onNewNote,
    onRecap,
    onSaveDraft,
    onExportAnki,
    onExportPdf,
    onShareNote,
    onToggleCompanion,
    onOpenSettings,
    onOpenShortcuts,
    onClearNotes,
    onApplyTemplate,
    onSelectFilter,
    onSelectNote,
    onClose,
  ]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.fullText && item.fullText.includes(q))
    );
  }, [allItems, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>("[data-selected='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-black/80 backdrop-blur-xs animate-fade-in no-print select-none"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          const dialog = e.currentTarget;
          const focusable = dialog.querySelectorAll<HTMLElement>(
            'input, button, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
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
      }}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-ink-700 bg-app-surface shadow-2xl overflow-hidden animate-fade-up flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-800 bg-app-card">
          <svg className="w-4 h-4 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search note, or jump to notebook..."
            className="flex-1 bg-transparent text-sm text-ink-100 placeholder-ink-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-ink-500 hover:text-ink-200 text-xs px-1 rounded transition-colors"
            >
              Clear
            </button>
          )}
          <Kbd>Esc</Kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-ink-400 text-xs">
              <p className="text-ink-300 font-medium">No matching commands or notes found</p>
              <p className="text-[11px] text-ink-500 mt-1">Try searching by note title, hashtag, or action name.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-selected={isSelected}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? "bg-highlight/15 border border-highlight/40 text-ink-50"
                      : "hover:bg-ink-800/60 border border-transparent text-ink-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Category Icon */}
                    {item.category === "notes" ? (
                      <svg className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : item.category === "actions" ? (
                      <svg className="w-3.5 h-3.5 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : item.category === "templates" ? (
                      <svg className="w-3.5 h-3.5 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    ) : item.category === "notebooks" ? (
                      <svg className="w-3.5 h-3.5 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${item.dotColor || "bg-highlight"} flex-shrink-0`} />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium truncate ${isSelected ? "text-highlight" : "text-ink-100"}`}>
                          {item.title}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-ink-800 text-ink-500 font-mono">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[10px] text-ink-400 truncate mt-0.5 font-mono">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.shortcut ? (
                    <Kbd>{item.shortcut}</Kbd>
                  ) : isSelected ? (
                    <span className="text-[10px] font-mono text-highlight flex items-center gap-1 flex-shrink-0">
                      <span>Select</span>
                      <kbd className="px-1 py-0.5 bg-highlight/20 text-highlight rounded border border-highlight/40 text-[9px]">↵</kbd>
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-ink-800/80 bg-app-card flex items-center justify-between text-[10px] text-ink-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-ink-800 rounded border border-ink-700">↑</kbd>
              <kbd className="px-1 py-0.2 bg-ink-800 rounded border border-ink-700">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-ink-800 rounded border border-ink-700">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-ink-800 rounded border border-ink-700">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span className="text-ink-500 hidden sm:inline">AI Recap Workstation</span>
        </div>
      </div>
    </div>
  );
});
