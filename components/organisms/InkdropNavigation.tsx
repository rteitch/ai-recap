"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { StudyStatus } from "@/lib/types";
import { STUDY_TEMPLATES } from "@/lib/templates";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { CustomApiConfig } from "@/lib/ai-config";
import { getTagDotColor, normalizeTag } from "@/lib/tags";
import { toast } from "sonner";

export type NavFilterType =
  | { type: "all" }
  | { type: "templates" }
  | { type: "status"; value: StudyStatus }
  | { type: "notebook"; value: string }
  | { type: "tag"; value: string }
  | { type: "trash" };

export type NotebookItem = {
  id: string;
  label: string;
  icon?: string;
};

type InkdropNavigationProps = {
  activeFilter: NavFilterType;
  onSelectFilter: (filter: NavFilterType) => void;
  totalNotes: number;
  statusCounts: Record<StudyStatus, number>;
  notebookCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  onApplyTemplate: (templateId: string) => void;
  onClearAll: () => void;
  onOpenShortcuts?: () => void;
  onOpenSettings?: () => void;
  onOpenAppearance?: () => void;
  customApiConfig?: CustomApiConfig;
  onCloseMobile?: () => void;
  width?: number;
  hideHeader?: boolean;
  notebooks?: NotebookItem[];
  onAddNotebook?: (label: string) => void;
  onRenameNotebook?: (id: string, newLabel: string) => void;
  onDeleteNotebook?: (id: string) => void;
  onAddTag?: (tag: string) => void;
};

export const DEFAULT_NOTEBOOKS: NotebookItem[] = [
  { id: "Inbox", label: "Inbox", icon: "inbox" },
  { id: "Study", label: "Study & Research", icon: "academic" },
  { id: "Projects", label: "Projects & Ideas", icon: "rocket" },
];

const STATUS_ITEMS: { id: StudyStatus; label: string; color: string; border: string }[] = [
  { id: "sedang-dipelajari", label: "In Progress", color: "bg-sky-400", border: "border-sky-400/30" },
  { id: "perlu-diulang", label: "Needs Review", color: "bg-yellow-400", border: "border-yellow-400/30" },
  { id: "dikuasai", label: "Mastered", color: "bg-emerald-400", border: "border-emerald-400/30" },
  { id: "belum-direview", label: "Not Reviewed", color: "bg-rose-400", border: "border-rose-400/30" },
];

export const InkdropNavigation = memo(function InkdropNavigation({
  activeFilter,
  onSelectFilter,
  totalNotes,
  statusCounts,
  notebookCounts,
  tagCounts,
  onApplyTemplate,
  onClearAll,
  onOpenShortcuts,
  onOpenSettings,
  onOpenAppearance,
  customApiConfig,
  onCloseMobile,
  width,
  hideHeader = false,
  notebooks = DEFAULT_NOTEBOOKS,
  onAddNotebook,
  onRenameNotebook,
  onDeleteNotebook,
  onAddTag,
}: InkdropNavigationProps) {
  const [notebooksCollapsed, setNotebooksCollapsed] = useState(false);
  const [statusCollapsed, setStatusCollapsed] = useState(false);
  const [tagsCollapsed, setTagsCollapsed] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [isAddingNotebook, setIsAddingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingNotebookName, setEditingNotebookName] = useState("");
  const [deletingNotebook, setDeletingNotebook] = useState<NotebookItem | null>(null);

  function isFilterActive(filter: NavFilterType): boolean {
    if (activeFilter.type !== filter.type) return false;
    if ("value" in activeFilter && "value" in filter) {
      return activeFilter.value === filter.value;
    }
    return true;
  }

  function handleFilterClick(filter: NavFilterType) {
    onSelectFilter(filter);
    if (onCloseMobile) onCloseMobile();
  }

  function handleClearClick() {
    setShowClearAllDialog(true);
  }

  const tagsList = Object.keys(tagCounts);

  return (
    <aside
      style={{ width: width ? `${width}px` : undefined }}
      className={`h-full flex flex-col bg-app-sidebar border-r border-ink-800/80 text-ink-200 select-none flex-shrink-0 text-[13px] transition-all duration-75 ${
        width ? "" : "w-full"
      }`}
    >
      {/* Top Header: App Branding & Settings */}
      <div className={`h-11 px-3.5 items-center justify-between border-b border-ink-800/80 bg-app-sidebar ${hideHeader ? "hidden sm:flex" : "flex"}`}>
        <div className="flex items-center gap-2">
          <Image
            src="/android-chrome-192x192.png"
            alt="AI Recap Logo"
            width={20}
            height={20}
            className="rounded-md flex-shrink-0"
          />
          <span className="font-serif font-bold text-sm text-ink-100 tracking-tight">
            AI Recap
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-800/80 text-ink-400 border border-ink-700/50">
            v2.1
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Shortcuts Button (?) */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="p-1 rounded text-ink-400 hover:text-ink-200 hover:bg-ink-800/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          {/* AI Settings Button (Gear) */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title={
                customApiConfig?.enabled
                  ? `AI Settings: ${customApiConfig.model || customApiConfig.provider}`
                  : "AI Model & API Settings"
              }
              className={`p-1 rounded transition-colors ${
                customApiConfig?.enabled
                  ? "text-yellow-400 hover:bg-ink-800"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/60"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {/* Appearance & Themes Button (Palette) */}
          {onOpenAppearance && (
            <button
              type="button"
              onClick={onOpenAppearance}
              title="Appearance & Typography"
              className="p-1 rounded text-ink-400 hover:text-ink-200 hover:bg-ink-800/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </button>
          )}

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/rteitch/ai-recap"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="p-1 rounded text-ink-400 hover:text-ink-200 hover:bg-ink-800/60 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded text-ink-400 hover:text-ink-200 hover:bg-ink-800"
              title="Close Navigation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tree Content */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-4 scrollbar-thin">
        {/* Core items: All Notes & Templates */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => handleFilterClick({ type: "all" })}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium transition-colors ${
              isFilterActive({ type: "all" })
                ? "bg-white/[0.08] text-ink-50 font-semibold border-l-2 border-yellow-400 pl-2"
                : "text-ink-200 hover:bg-ink-800/60 hover:text-ink-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>All Notes</span>
            </div>
            <span className="text-[11px] font-mono text-ink-400 bg-ink-800/80 px-1.5 py-0.5 rounded">
              {totalNotes}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium text-ink-200 hover:bg-ink-800/60 hover:text-ink-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Note Templates</span>
            </div>
            <span className="text-[11px] font-mono text-ink-400 bg-ink-800/80 px-1.5 py-0.5 rounded">
              {STUDY_TEMPLATES.length}
            </span>
          </button>
        </div>

        {/* Section: Notebooks with Add, Rename, and Delete */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            <span>Notebooks</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNotebook(true);
                  setNewNotebookName("");
                }}
                className="hover:text-yellow-400 p-0.5 transition-colors"
                title="Add New Notebook"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setNotebooksCollapsed(!notebooksCollapsed)}
                className="hover:text-ink-200 p-0.5"
                title={notebooksCollapsed ? "Expand" : "Collapse"}
              >
                <svg
                  className={`w-3 h-3 transform transition-transform ${
                    notebooksCollapsed ? "-rotate-90" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {!notebooksCollapsed && (
            <div className="space-y-0.5 mt-0.5">
              {/* Inline Add Notebook Input */}
              {isAddingNotebook && (
                <div className="px-2 py-1.5 bg-ink-900 border border-ink-700 rounded-md my-1 animate-fade-in">
                  <input
                    type="text"
                    value={newNotebookName}
                    onChange={(e) => setNewNotebookName(e.target.value)}
                    placeholder="New notebook name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (newNotebookName.trim() && onAddNotebook) {
                          onAddNotebook(newNotebookName.trim());
                        }
                        setIsAddingNotebook(false);
                      } else if (e.key === "Escape") {
                        setIsAddingNotebook(false);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-ink-100 placeholder-ink-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-1.5 mt-1 pt-1 border-t border-ink-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setIsAddingNotebook(false)}
                      className="px-1.5 py-0.5 text-ink-400 hover:text-ink-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (newNotebookName.trim() && onAddNotebook) {
                          onAddNotebook(newNotebookName.trim());
                        }
                        setIsAddingNotebook(false);
                      }}
                      className="px-2 py-0.5 bg-yellow-400 text-stone-950 font-bold rounded hover:bg-yellow-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {notebooks.map((nb) => {
                const count = notebookCounts[nb.id] || 0;
                const active = isFilterActive({ type: "notebook", value: nb.id });
                const isEditing = editingNotebookId === nb.id;

                if (isEditing) {
                  return (
                    <div key={nb.id} className="px-2 py-1.5 bg-ink-900 border border-yellow-400/50 rounded-md my-1">
                      <input
                        type="text"
                        value={editingNotebookName}
                        onChange={(e) => setEditingNotebookName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editingNotebookName.trim() && onRenameNotebook) {
                              onRenameNotebook(nb.id, editingNotebookName.trim());
                            }
                            setEditingNotebookId(null);
                          } else if (e.key === "Escape") {
                            setEditingNotebookId(null);
                          }
                        }}
                        className="w-full bg-transparent text-xs text-ink-100 focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-1.5 mt-1 pt-1 border-t border-ink-800 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setEditingNotebookId(null)}
                          className="px-1.5 py-0.5 text-ink-400 hover:text-ink-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingNotebookName.trim() && onRenameNotebook) {
                              onRenameNotebook(nb.id, editingNotebookName.trim());
                            }
                            setEditingNotebookId(null);
                          }}
                          className="px-2 py-0.5 bg-yellow-400 text-stone-950 font-bold rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={nb.id}
                    className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                      active
                        ? "bg-white/[0.08] text-ink-50 font-semibold border-l-2 border-yellow-400 pl-2"
                        : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleFilterClick({ type: "notebook", value: nb.id })}
                      className="flex items-center gap-2 truncate flex-1 text-left"
                    >
                      {nb.icon === "inbox" && (
                        <svg className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      )}
                      {nb.icon === "academic" && (
                        <svg className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                        </svg>
                      )}
                      {nb.icon === "rocket" && (
                        <svg className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      {!nb.icon && (
                        <svg className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      )}
                      <span className="truncate">{nb.label}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Notebook Rename & Delete Actions */}
                      {nb.id !== "Inbox" && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNotebookId(nb.id);
                              setEditingNotebookName(nb.label);
                            }}
                            className="p-1 rounded text-ink-400 hover:text-yellow-300 hover:bg-ink-800"
                            title="Rename Notebook"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {onDeleteNotebook && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingNotebook(nb);
                              }}
                              className="p-1 rounded text-ink-400 hover:text-rose-400 hover:bg-ink-800"
                              title="Delete Notebook"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                      {count > 0 && (
                        <span className="text-[11px] font-mono text-ink-400 bg-ink-800/80 px-1.5 py-0.5 rounded">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Study Status */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            <span>Study Status</span>
            <button
              type="button"
              onClick={() => setStatusCollapsed(!statusCollapsed)}
              className="hover:text-ink-200 p-0.5"
              title={statusCollapsed ? "Expand" : "Collapse"}
            >
              <svg
                className={`w-3 h-3 transform transition-transform ${
                  statusCollapsed ? "-rotate-90" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {!statusCollapsed && (
            <div className="space-y-0.5 mt-0.5">
              {STATUS_ITEMS.map((st) => {
                const count = statusCounts[st.id] || 0;
                const active = isFilterActive({ type: "status", value: st.id });
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleFilterClick({ type: "status", value: st.id })}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                      active
                        ? "bg-white/[0.08] text-ink-50 font-semibold border-l-2 border-yellow-400 pl-2"
                        : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${st.color} flex-shrink-0`} />
                      <span className="truncate">{st.label}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-[11px] font-mono text-ink-400 bg-ink-800/80 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Tags */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            <div className="flex items-center gap-1.5">
              <span>Tags</span>
              {onAddTag && (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="p-0.5 hover:text-yellow-400 text-ink-500 hover:bg-ink-800 rounded transition-colors"
                  title="Create New Tag"
                  aria-label="Create New Tag"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setTagsCollapsed(!tagsCollapsed)}
              className="hover:text-ink-200 p-0.5"
              title={tagsCollapsed ? "Expand" : "Collapse"}
            >
              <svg
                className={`w-3 h-3 transform transition-transform ${
                  tagsCollapsed ? "-rotate-90" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Add Tag Inline Form */}
          {isAddingTag && (
            <div className="px-2 py-1.5 bg-ink-900 border border-yellow-400/50 rounded-md my-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="tag-name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const clean = normalizeTag(newTagName);
                    if (clean && onAddTag) {
                      onAddTag(clean);
                      setNewTagName("");
                      setIsAddingTag(false);
                    }
                  } else if (e.key === "Escape") {
                    setIsAddingTag(false);
                    setNewTagName("");
                  }
                }}
                className="w-full bg-transparent text-xs text-ink-100 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-1.5 mt-1 pt-1 border-t border-ink-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTag(false);
                    setNewTagName("");
                  }}
                  className="px-1.5 py-0.5 text-ink-400 hover:text-ink-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const clean = normalizeTag(newTagName);
                    if (clean && onAddTag) {
                      onAddTag(clean);
                      setNewTagName("");
                      setIsAddingTag(false);
                    }
                  }}
                  className="px-2 py-0.5 bg-yellow-400 text-stone-950 font-bold rounded"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {!tagsCollapsed && (
            <div className="space-y-0.5 mt-0.5">
              {tagsList.length === 0 ? (
                <div className="px-2.5 py-1 text-[11px] text-ink-500 italic">
                  No tags yet
                </div>
              ) : (
                tagsList.map((tag) => {
                  const count = tagCounts[tag];
                  const active = isFilterActive({ type: "tag", value: tag });
                  const dotColor = getTagDotColor(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleFilterClick({ type: "tag", value: tag })}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                        active
                          ? "bg-white/[0.08] text-ink-50 font-semibold border-l-2 border-yellow-400 pl-2"
                          : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                        <span className="truncate">#{tag}</span>
                      </div>
                      <span className="text-[11px] font-mono text-ink-400 bg-ink-800/80 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Trash / Reset */}
      <div className="p-2 border-t border-ink-800/80 bg-app-bg">
        <button
          type="button"
          onClick={handleClearClick}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-ink-400 hover:text-rose-400 hover:bg-ink-800/60 transition-colors"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="truncate">Clear History</span>
        </button>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            className="w-full max-w-md bg-ink-900 border border-ink-700 rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-ink-800">
              <div className="flex items-center gap-2">
                <span className="text-highlight">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <h3 className="text-sm font-semibold text-ink-100">Choose Note Template</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-ink-400 hover:text-ink-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {STUDY_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    onApplyTemplate(tmpl.id);
                    setShowTemplateModal(false);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full text-left p-3 rounded-lg border border-ink-800 hover:border-highlight/60 bg-ink-850 hover:bg-ink-800 transition-all group"
                >
                  <div className="font-semibold text-xs text-ink-100 group-hover:text-highlight">
                    {tmpl.name}
                  </div>
                  <div className="text-[11px] text-ink-400 mt-0.5 line-clamp-2">
                    {tmpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirm Dialog for Notebook Deletion */}
      <ConfirmDialog
        isOpen={!!deletingNotebook}
        title={`Delete Notebook "${deletingNotebook?.label}"?`}
        description="All notes inside this notebook will be safely moved to Inbox. This action cannot be undone."
        confirmLabel="Delete Notebook"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deletingNotebook && onDeleteNotebook) {
            onDeleteNotebook(deletingNotebook.id);
            toast.success(`Notebook "${deletingNotebook.label}" deleted`);
          }
          setDeletingNotebook(null);
        }}
        onCancel={() => setDeletingNotebook(null)}
      />

      {/* Modern Confirm Dialog for Clear All Notes */}
      <ConfirmDialog
        isOpen={showClearAllDialog}
        title="Clear All History & Notes?"
        description="This will permanently delete all saved notes and study history. This action cannot be undone."
        confirmLabel="Clear Everything"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (onClearAll) {
            onClearAll();
            toast.success("All notes and history have been cleared");
          }
          setShowClearAllDialog(false);
        }}
        onCancel={() => setShowClearAllDialog(false)}
      />
    </aside>
  );
});
