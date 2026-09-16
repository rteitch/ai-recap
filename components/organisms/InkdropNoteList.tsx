"use client";

import { memo, useState, useMemo } from "react";
import { HistoryItem, StudyStatus } from "@/lib/types";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { NotebookDropdown } from "@/components/molecules/NotebookDropdown";
import { toast } from "sonner";

type InkdropNoteListProps = {
  items: HistoryItem[];
  activeNoteId: string | null;
  categoryTitle: string;
  onSelectNote: (item: HistoryItem) => void;
  onNewNote: () => void;
  onTogglePin: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onChangeStatus?: (id: string, status: StudyStatus) => void;
  notebooks?: { id: string; label: string }[];
  onMoveNotebook?: (noteId: string, notebookId: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  width?: number;
  hideHeader?: boolean;
  onSelectTag?: (tag: string) => void;
  onOpenCommandPalette?: () => void;
};

function formatRelativeTime(ts: number): string {
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

function extractTitle(notes: string, fallback: string): string {
  const trimmed = notes.trim();
  if (!trimmed) return "Untitled Note";
  const firstLine = trimmed.split("\n")[0].replace(/^[#\s*>-]+/, "").trim();
  return firstLine.slice(0, 50) || fallback;
}

function extractSnippet(notes: string): string {
  if (!notes) return "";
  const head = notes.slice(0, 400);
  const lines = head.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length > 1) {
    return lines.slice(1, 3).join(" ").replace(/^[#\s*>-]+/, "").slice(0, 90);
  }
  return (lines[0] || "").slice(0, 90);
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.trim();
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-highlight/30 text-ink-50 dark:text-highlight font-semibold rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const InkdropNoteList = memo(function InkdropNoteList({
  items,
  activeNoteId,
  categoryTitle,
  onSelectNote,
  onNewNote,
  onTogglePin,
  onDeleteNote,
  onChangeStatus,
  notebooks,
  onMoveNotebook,
  onToggleSidebar,
  isSidebarOpen,
  width,
  hideHeader,
  onSelectTag,
  onOpenCommandPalette,
}: InkdropNoteListProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<HistoryItem | null>(null);

  const sortedAndFiltered = useMemo(() => {
    let list = [...items].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.timestamp - a.timestamp;
    });

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.notes.toLowerCase().includes(q) ||
          item.preview.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
          (item.title && item.title.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, searchFilter]);

  type NoteGroup = {
    label: string;
    items: HistoryItem[];
  };

  const noteGroups = useMemo<NoteGroup[]>(() => {
    if (searchFilter.trim()) {
      return [{ label: `Search Results (${sortedAndFiltered.length})`, items: sortedAndFiltered }];
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7DaysAgo = startOfToday - 7 * 24 * 60 * 1000;
    const startOf30DaysAgo = startOfToday - 30 * 24 * 60 * 1000;

    const pinned: HistoryItem[] = [];
    const today: HistoryItem[] = [];
    const yesterday: HistoryItem[] = [];
    const past7Days: HistoryItem[] = [];
    const past30Days: HistoryItem[] = [];
    const older: HistoryItem[] = [];

    for (const item of sortedAndFiltered) {
      if (item.pinned) {
        pinned.push(item);
      } else if (item.timestamp >= startOfToday) {
        today.push(item);
      } else if (item.timestamp >= startOfYesterday) {
        yesterday.push(item);
      } else if (item.timestamp >= startOf7DaysAgo) {
        past7Days.push(item);
      } else if (item.timestamp >= startOf30DaysAgo) {
        past30Days.push(item);
      } else {
        older.push(item);
      }
    }

    const groups: NoteGroup[] = [];
    if (pinned.length > 0) groups.push({ label: "📌 Pinned", items: pinned });
    if (today.length > 0) groups.push({ label: "Today", items: today });
    if (yesterday.length > 0) groups.push({ label: "Yesterday", items: yesterday });
    if (past7Days.length > 0) groups.push({ label: "Previous 7 Days", items: past7Days });
    if (past30Days.length > 0) groups.push({ label: "Previous 30 Days", items: past30Days });
    if (older.length > 0) groups.push({ label: "Older", items: older });

    return groups;
  }, [sortedAndFiltered, searchFilter]);

  return (
    <section
      style={{ width: width ? `${width}px` : undefined }}
      className={`h-full flex flex-col bg-app-surface border-r border-ink-800/80 text-ink-200 select-none flex-shrink-0 transition-all duration-75 ${
        width ? "" : "w-full"
      }`}
    >
      {/* Column 2 Top Header */}
      {!hideHeader && (
        <div className="h-11 px-3 flex items-center justify-between border-b border-ink-800/80 bg-app-card">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className={`p-1 rounded text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 transition-colors ${
                  !isSidebarOpen ? "bg-ink-800 text-highlight" : ""
                }`}
                title={isSidebarOpen ? "Collapse Navigation Sidebar" : "Show Navigation Sidebar"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
            )}
            <h2 className="font-semibold text-xs sm:text-sm text-ink-100 truncate">
              {categoryTitle}
            </h2>
            <span className="text-[10px] font-mono text-ink-400 bg-ink-800 px-1.5 py-0.5 rounded">
              {sortedAndFiltered.length}
            </span>
          </div>

          {/* New Note Button */}
          <button
            type="button"
            onClick={onNewNote}
            className="px-2 py-1 rounded-md bg-highlight text-highlight-text hover:bg-highlight-hover transition-all font-semibold flex items-center gap-1 text-xs shadow-xs"
            title="Create New Note (Ctrl+N)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline text-[11px]">New</span>
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="p-2 border-b border-app-border bg-app-surface/50">
        <div className="relative">
          <svg
            className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search notes, formulas, tags..."
            className="w-full bg-app-card/90 border border-app-border rounded-lg pl-8 pr-14 py-1.5 text-xs text-ink-100 placeholder:text-ink-400 focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30 transition-all"
          />
          {searchFilter ? (
            <button
              type="button"
              onClick={() => setSearchFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-100 p-0.5 rounded transition-colors"
              title="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : onOpenCommandPalette ? (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-400 hover:text-ink-100 bg-ink-800 hover:bg-ink-700 px-1.5 py-0.5 rounded border border-ink-700/80 transition-colors"
              title="Open Command Palette (Ctrl+K)"
            >
              Ctrl+K
            </button>
          ) : null}
        </div>
      </div>

      {/* Note Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-ink-800/60 scrollbar-thin">
        {sortedAndFiltered.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-400 space-y-2">
            <svg className="w-8 h-8 text-ink-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>
              {searchFilter
                ? `No notes found matching "${searchFilter}"`
                : "No notes in this notebook."}
            </p>
            <button
              type="button"
              onClick={onNewNote}
              className="inline-block mt-2 text-xs font-semibold text-highlight hover:underline"
            >
              + Create First Note
            </button>
          </div>
        ) : (
          noteGroups.map((group) => (
            <div key={group.label} className="relative">
              {/* Group Sticky Header */}
              <div className="sticky top-0 z-10 px-3 py-1 bg-app-card/95 backdrop-blur-xs border-y border-ink-800/70 text-[10px] font-semibold uppercase tracking-wider text-ink-400 flex items-center justify-between">
                <span>{group.label}</span>
                <span className="font-mono text-[9px] opacity-70 bg-ink-800 px-1 py-0.2 rounded">
                  {group.items.length}
                </span>
              </div>

              <div className="divide-y divide-ink-800/40">
                {group.items.map((item) => {
                  const isActive = item.id === activeNoteId;
                  const title = item.title || extractTitle(item.notes, item.preview);
                  const snippet = item.preview || extractSnippet(item.notes);
                  const quizCount = item.result.quiz.length;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectNote(item)}
                      className={`group relative p-3 cursor-pointer transition-all ${
                        isActive
                          ? "bg-app-surface/90 border-l-[3px] border-highlight shadow-xs"
                          : "hover:bg-app-cardHover border-l-[3px] border-transparent"
                      }`}
                    >
                {/* Top Row: Title + Pin/Status */}
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {/* Interactive Status Dot / Trigger */}
                    {onChangeStatus ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const statusCycle: StudyStatus[] = [
                            "belum-direview",
                            "sedang-dipelajari",
                            "perlu-diulang",
                            "dikuasai",
                          ];
                          const currentIdx = statusCycle.indexOf(item.status || "belum-direview");
                          const nextStatus = statusCycle[(currentIdx + 1) % statusCycle.length];
                          onChangeStatus(item.id, nextStatus);
                          const statusLabels: Record<StudyStatus, string> = {
                            "belum-direview": "Not Reviewed",
                            "sedang-dipelajari": "In Progress",
                            "perlu-diulang": "Needs Review",
                            "dikuasai": "Mastered",
                          };
                          toast.success(`Status: "${statusLabels[nextStatus]}"`);
                        }}
                        className="p-0.5 rounded hover:bg-ink-700/60 transition-colors flex-shrink-0 cursor-pointer"
                        title={`Status: ${
                          item.status === "sedang-dipelajari"
                            ? "In Progress"
                            : item.status === "perlu-diulang"
                            ? "Needs Review"
                            : item.status === "dikuasai"
                            ? "Mastered"
                            : "Not Reviewed"
                        } (Click to cycle)`}
                        aria-label="Change study status"
                      >
                        {item.status === "sedang-dipelajari" && (
                          <span className="w-2 h-2 block rounded-full bg-sky-400 ring-2 ring-sky-400/20" />
                        )}
                        {item.status === "perlu-diulang" && (
                          <span className="w-2 h-2 block rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
                        )}
                        {item.status === "dikuasai" && (
                          <span className="w-2 h-2 block rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
                        )}
                        {(!item.status || item.status === "belum-direview") && (
                          <span className="w-2 h-2 block rounded-full bg-rose-400 ring-2 ring-rose-400/20" />
                        )}
                      </button>
                    ) : (
                      <>
                        {item.status === "sedang-dipelajari" && (
                          <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" title="In Progress" />
                        )}
                        {item.status === "perlu-diulang" && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Needs Review" />
                        )}
                        {item.status === "dikuasai" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Mastered" />
                        )}
                        {item.status === "belum-direview" && (
                          <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" title="Not Reviewed" />
                        )}
                      </>
                    )}

                    <h3
                      className={`text-xs font-semibold truncate ${
                        isActive ? "text-ink-50" : "text-ink-200 group-hover:text-ink-100"
                      }`}
                    >
                      {searchFilter ? highlightMatch(title, searchFilter) : title}
                    </h3>
                  </div>

                  {/* Actions: Pin & Delete */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(item.id);
                      }}
                      className={`p-1 rounded transition-all ${
                        item.pinned
                          ? "text-highlight opacity-100 hover:bg-highlight/15"
                          : "text-ink-400 opacity-0 group-hover:opacity-100 focus-within:opacity-100 hover:text-ink-100 hover:bg-ink-750"
                      }`}
                      title={item.pinned ? "Unpin note" : "Pin note to top"}
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(item);
                      }}
                      className="p-1 rounded text-ink-400 opacity-0 group-hover:opacity-100 focus-within:opacity-100 hover:text-rose-400 hover:bg-ink-750 transition-all"
                      title="Delete note"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Metadata Row: Timestamp + Quiz indicator + Notebook + Tags */}
                <div className="flex items-center gap-1.5 text-[11px] text-ink-400 mb-1 flex-wrap">
                  <span className="font-mono text-[10px]">{formatRelativeTime(item.timestamp)}</span>

                  {quizCount > 0 ? (
                    <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-highlight/15 text-ink-100 dark:text-highlight border border-highlight/30 font-medium">
                      {quizCount} questions
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-ink-800 text-ink-400 border border-ink-700">
                      draft
                    </span>
                  )}

                  {onMoveNotebook && notebooks && notebooks.length > 0 ? (
                    <NotebookDropdown
                      currentNotebookId={item.notebook || "Inbox"}
                      notebooks={notebooks}
                      onSelectNotebook={(nbId) => onMoveNotebook(item.id, nbId)}
                    />
                  ) : item.notebook ? (
                    <span className="text-[10px] text-ink-400 font-medium font-mono">
                      &bull; {item.notebook}
                    </span>
                  ) : null}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.tags.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTag?.(tag);
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-ink-800/90 hover:bg-ink-700 text-ink-300 hover:text-ink-50 font-mono transition-colors border border-ink-700/50"
                          title={`Filter notes by #${tag}`}
                        >
                          #{tag}
                        </button>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[9px] text-ink-500 font-mono">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Snippet preview */}
                <p className="text-[11px] text-ink-400 line-clamp-2 leading-relaxed">
                  {searchFilter ? highlightMatch(snippet, searchFilter) : snippet}
                </p>
                </div>
              );
            })}
          </div>
        </div>
      ))
    )}
      </div>

      {/* Modern Confirm Dialog for Note Deletion */}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="Delete Note?"
        description={`Are you sure you want to delete "${noteToDelete?.title || "Untitled Note"}"? This action cannot be undone.`}
        confirmLabel="Delete Note"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (noteToDelete) {
            const deletedTitle = noteToDelete.title || "Untitled Note";
            onDeleteNote(noteToDelete.id);
            toast.success(`Deleted note "${deletedTitle}"`);
            setNoteToDelete(null);
          }
        }}
        onCancel={() => setNoteToDelete(null)}
      />
    </section>
  );
});
