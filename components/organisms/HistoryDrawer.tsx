"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HistoryItem, StudyStatus } from "@/lib/types";
import { NotebookItem } from "@/components/organisms/InkdropNavigation";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { toast } from "sonner";

type HistoryDrawerProps = {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onTogglePin?: (id: string) => void;
  onChangeStatus?: (id: string, status: StudyStatus) => void;
  onDuplicate?: (item: HistoryItem) => void;
  notebooks?: NotebookItem[];
};

function formatRelativeTime(ts: number) {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status?: StudyStatus) {
  switch (status) {
    case "dikuasai":
      return {
        label: "Mastered",
        cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    case "perlu-diulang":
      return {
        label: "Needs Review",
        cls: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
      };
    case "sedang-dipelajari":
      return {
        label: "In Progress",
        cls: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      };
    case "belum-direview":
    default:
      return {
        label: "Not Reviewed",
        cls: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      };
  }
}

export const HistoryDrawer = memo(function HistoryDrawer({
  isOpen,
  history,
  onClose,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  onTogglePin,
  onChangeStatus,
  onDuplicate,
  notebooks,
}: HistoryDrawerProps) {
  const [historySearch, setHistorySearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pinned" | "perlu-diulang" | "dikuasai" | "draft"
  >("all");
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [sortMode, setSortMode] = useState<"date" | "title">("date");
  const [activeNotebook, setActiveNotebook] = useState<string>("all");
  const listRef = useRef<HTMLDivElement>(null);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortMode === "title") {
        const ta = (a.title || a.preview.slice(0, 40)).toLowerCase();
        const tb = (b.title || b.preview.slice(0, 40)).toLowerCase();
        return ta.localeCompare(tb);
      }
      return b.timestamp - a.timestamp;
    });
  }, [history, sortMode]);

  const filteredHistory = useMemo(() => {
    let list = sortedHistory;

    // Filter tab
    if (activeFilter === "pinned") {
      list = list.filter((item) => item.pinned);
    } else if (activeFilter === "perlu-diulang") {
      list = list.filter((item) => item.status === "perlu-diulang");
    } else if (activeFilter === "dikuasai") {
      list = list.filter((item) => item.status === "dikuasai");
    } else if (activeFilter === "draft") {
      list = list.filter(
        (item) => item.result.quiz.length === 0 || item.status === "belum-direview"
      );
    }

    // Notebook filter
    if (activeNotebook !== "all") {
      list = list.filter((item) => item.notebook === activeNotebook);
    }

    // Search query
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.preview.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q) ||
          item.title?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [sortedHistory, activeFilter, activeNotebook, historySearch]);

  function handleClearAllClick() {
    setShowClearAllDialog(true);
  }

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filteredHistory.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusedIndex(filteredHistory.length - 1);
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        onSelectItem(filteredHistory[focusedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filteredHistory, focusedIndex, onSelectItem, onClose]
  );

  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredHistory.length, historySearch, activeFilter]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-ink-900 border-l border-ink-600 h-full p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] flex flex-col shadow-2xl animate-slide-left overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink-700/70">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div>
              <h2
                id="history-drawer-title"
                className="text-sm font-semibold text-ink-50 flex items-center gap-2"
              >
                <span>Notes History</span>
                <span className="text-[10px] bg-ink-800 text-ink-300 px-1.5 py-0.2 rounded border border-ink-700 font-mono">
                  {history.length}/50
                </span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-100 p-1.5 rounded hover:bg-ink-800 transition-colors touch-manipulation"
            aria-label="Close history"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        {history.length > 0 && (
          <div className="pt-3 pb-2 space-y-2">
            <div className="relative">
              <input
                type="search"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search note history…"
                className="w-full rounded-md border border-ink-600 bg-ink-800/90 px-3 py-1.5 text-xs text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-highlight"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-100 p-0.5"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center justify-between gap-1.5 pb-1">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-highlight/20 text-highlight border border-highlight/40 font-medium"
                    : "bg-ink-800 text-ink-400 hover:text-ink-200 border border-ink-700"
                }`}
              >
                All ({history.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("pinned")}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeFilter === "pinned"
                    ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-medium"
                    : "bg-ink-800 text-ink-400 hover:text-ink-200 border border-ink-700"
                }`}
              >
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Pinned ({history.filter((h) => h.pinned).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("perlu-diulang")}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  activeFilter === "perlu-diulang"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium"
                    : "bg-ink-800 text-ink-400 hover:text-ink-200 border border-ink-700"
                }`}
              >
                Needs Review ({history.filter((h) => h.status === "perlu-diulang").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("dikuasai")}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  activeFilter === "dikuasai"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium"
                    : "bg-ink-800 text-ink-400 hover:text-ink-200 border border-ink-700"
                }`}
              >
                Mastered ({history.filter((h) => h.status === "dikuasai").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("draft")}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  activeFilter === "draft"
                    ? "bg-ink-700 text-ink-100 border border-ink-500 font-medium"
                    : "bg-ink-800 text-ink-400 hover:text-ink-200 border border-ink-700"
                }`}
              >
                Draft ({history.filter((h) => h.result.quiz.length === 0).length})
              </button>
              </div>
              <button
                type="button"
                onClick={() => setSortMode((s) => s === "date" ? "title" : "date")}
                className="ml-auto flex-shrink-0 px-2 py-0.5 rounded text-[11px] text-ink-400 hover:text-ink-200 bg-ink-800 border border-ink-700 transition-colors"
                title={sortMode === "date" ? "Sort by date (newest first)" : "Sort by title (A-Z)"}
                aria-label="Toggle sort mode"
              >
                {sortMode === "date" ? "↕ Date" : "↕ Title"}
              </button>
              {notebooks && notebooks.length > 1 && (
                <select
                  value={activeNotebook}
                  onChange={(e) => setActiveNotebook(e.target.value)}
                  className="ml-1 px-1.5 py-0.5 rounded text-[11px] text-ink-400 bg-ink-800 border border-ink-700 cursor-pointer focus:outline-none focus:border-highlight/50"
                  title="Filter by notebook"
                  aria-label="Filter by notebook"
                >
                  <option value="all">All Notebooks</option>
                  {notebooks.map((nb) => (
                    <option key={nb.id} value={nb.id}>
                      {nb.label} ({history.filter((h) => h.notebook === nb.id).length})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* History Item List */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Notes"
          tabIndex={0}
          onKeyDown={handleListKeyDown}
          className="flex-1 overflow-y-auto py-2 space-y-2.5 pr-0.5 outline-none"
        >
          {history.length === 0 ? (
            <div className="text-center py-12 text-ink-400">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-ink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-ink-300">No saved notes yet</p>
              <p className="text-xs mt-1 text-ink-500">
                Notes and drafts you create will automatically appear here.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-ink-400">
              <p className="text-xs font-medium text-ink-300">
                No matching notes found
              </p>
              <button
                type="button"
                onClick={() => {
                  setHistorySearch("");
                  setActiveFilter("all");
                }}
                className="mt-2 text-xs text-highlight hover:underline"
              >
                Reset filter
              </button>
            </div>
          ) : (
            filteredHistory.map((item, index) => {
              const statusInfo = getStatusBadge(item.status);
              const isFocused = index === focusedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isFocused}
                  onClick={() => onSelectItem(item)}
                  className={`group cursor-pointer rounded-lg border p-3 hover:border-highlight/50 hover:bg-ink-800 transition-all active:scale-[0.99] touch-manipulation ${
                    item.pinned
                      ? "border-yellow-400/40 bg-ink-850/90 shadow-sm"
                      : "border-ink-700/80 bg-ink-800/70"
                  } ${isFocused ? "ring-1 ring-highlight/50 border-highlight/40" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-ink-400 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Pin Toggle */}
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(item.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            item.pinned
                              ? "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10"
                              : "text-ink-500 hover:text-ink-200 hover:bg-ink-700/50"
                          }`}
                          title={item.pinned ? "Unpin note" : "Pin to top"}
                          aria-label={item.pinned ? "Unpin note" : "Pin to top"}
                        >
                          <svg className="w-3.5 h-3.5" fill={item.pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      )}

                      <span className="font-mono text-[11px] text-highlight">
                        {formatRelativeTime(item.timestamp)}
                      </span>

                      {/* Status Selector Dropdown */}
                      {onChangeStatus ? (
                        <select
                          value={item.status || "belum-direview"}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            onChangeStatus(item.id, e.target.value as StudyStatus);
                          }}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border bg-ink-900 cursor-pointer focus:outline-none ${statusInfo.cls}`}
                          title="Change study status"
                        >
                          <option value="belum-direview">Not Reviewed</option>
                          <option value="sedang-dipelajari">In Progress</option>
                          <option value="perlu-diulang">Needs Review</option>
                          <option value="dikuasai">Mastered</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.result.quiz.length === 0 ? (
                        <span className="text-[10px] bg-ink-900 text-yellow-300 font-medium px-1.5 py-0.5 rounded border border-yellow-400/30">
                          Draft
                        </span>
                      ) : (
                        <span className="text-[10px] bg-ink-900 px-1.5 py-0.5 rounded text-ink-300 border border-ink-700">
                          {item.result.quiz.length} Q
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        className="text-ink-400 hover:text-rose-400 p-1 rounded hover:bg-ink-900/80 transition-colors"
                        title="Delete this note"
                        aria-label="Delete note"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      {onDuplicate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(item);
                          }}
                          className="text-ink-400 hover:text-highlight p-1 rounded hover:bg-ink-900/80 transition-colors"
                          title="Duplicate note"
                          aria-label="Duplicate note"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {item.title && (
                    <h4 className="text-xs font-semibold text-ink-100 group-hover:text-yellow-300 transition-colors truncate mb-1">
                      {item.title}
                    </h4>
                  )}
                  <p className="text-xs leading-relaxed text-ink-200 line-clamp-2 group-hover:text-ink-50 transition-colors mb-1.5">
                    {item.preview}
                  </p>
                  {(item.notebook || (item.tags && item.tags.length > 0)) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-400 flex-wrap pt-0.5">
                      {item.notebook && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-ink-900 border border-ink-700 text-ink-300">
                          {item.notebook}
                        </span>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[9px] px-1 py-0.2 rounded bg-ink-900/80 border border-ink-700/60 text-yellow-300/90"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-[9px] text-ink-500 font-mono">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-ink-600/70 flex items-center justify-between text-xs">
            <span className="text-ink-500 text-[11px]">Max. 50 local notes</span>
            <button
              type="button"
              onClick={handleClearAllClick}
              className="text-ink-400 hover:text-rose-400 transition-colors touch-manipulation font-medium"
            >
              Clear all history
            </button>
          </div>
        )}
      </div>

      {/* Modern Confirm Dialog for Deleting Single Note */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Note?"
        description={`Are you sure you want to delete "${itemToDelete?.title || "Untitled Note"}"? This action cannot be undone.`}
        confirmLabel="Delete Note"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (itemToDelete) {
            const title = itemToDelete.title || "Untitled Note";
            onDeleteItem(itemToDelete.id);
            toast.success(`Note "${title}" deleted`);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Modern Confirm Dialog for Clearing All History */}
      <ConfirmDialog
        isOpen={showClearAllDialog}
        title="Clear All Note History?"
        description={`Are you sure you want to delete all ${history.length} saved notes? This action cannot be undone.`}
        confirmLabel="Clear All Notes"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          onClearAll();
          setShowClearAllDialog(false);
        }}
        onCancel={() => setShowClearAllDialog(false)}
      />
    </div>
  );
});
