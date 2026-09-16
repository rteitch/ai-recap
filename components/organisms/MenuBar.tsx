"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { CustomApiConfig } from "@/lib/ai-config";

type ViewMode = "edit" | "split" | "preview";

export type MenuBarProps = {
  // Note state
  hasNotes: boolean;
  charCount: number;
  dailyRemaining: number | null;
  loading: boolean;
  customApiConfig?: CustomApiConfig;
  canUndo: boolean;
  canRedo: boolean;
  wordWrap: boolean;
  viewMode: ViewMode;
  showToc: boolean;
  isCompanionOpen: boolean;
  isSidebarOpen: boolean;
  isSoundEnabled: boolean;
  historyCount: number;

  // File
  onNewNote: () => void;
  onSaveDraft: () => void;
  onImportFile: () => void;
  onExportPdf: () => void;
  onClearNote: () => void;

  // Edit
  onUndo: () => void;
  onRedo: () => void;
  onSelectAll: () => void;
  onCopyAll: () => void;
  onToggleWordWrap: () => void;

  // Insert
  onBold: () => void;
  onItalic: () => void;
  onCode: () => void;
  onBulletList: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onOpenTemplates: () => void;
  onOpenFormulas: () => void;
  onOpenMermaid: () => void;
  onLoadSample: () => void;

  // View
  onSetViewMode: (mode: ViewMode) => void;
  onToggleToc: () => void;
  onToggleCompanion: () => void;
  onToggleSidebar: () => void;
  onToggleSound: () => void;

  // AI
  onRecap: () => void;
  onOpenHistory: () => void;

  // Settings
  onOpenSettings: () => void;
  onOpenAppearance: () => void;
  onOpenShortcuts: () => void;
};

type MenuId = "file" | "edit" | "insert" | "view" | "ai" | "settings" | null;

function Kbd({ keys }: { keys: string }) {
  return (
    <span className="ml-auto pl-4 font-mono text-[10px] text-ink-500 whitespace-nowrap">
      {keys}
    </span>
  );
}

function MenuDivider() {
  return <div className="my-0.5 h-px bg-ink-800" />;
}

type MenuItemProps = {
  label: string;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string;
  danger?: boolean;
};

function MenuItem({ label, onClick, shortcut, disabled, icon, badge, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? "text-rose-400 hover:bg-rose-900/30"
          : "text-ink-200 hover:bg-ink-800 hover:text-ink-50"
      }`}
    >
      {icon && <span className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center opacity-70">{icon}</span>}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-800 text-ink-400 border border-ink-700">
          {badge}
        </span>
      )}
      {shortcut && <Kbd keys={shortcut} />}
    </button>
  );
}

function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      {children}
    </div>
  );
}

const IconCheck = () => (
  <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

function CheckItem({ label, checked, onClick, shortcut }: { label: string; checked: boolean; onClick: () => void; shortcut?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] text-ink-200 hover:bg-ink-800 hover:text-ink-50 transition-colors"
    >
      <span className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
        {checked ? <IconCheck /> : <span className="w-3 h-3" />}
      </span>
      <span className="flex-1">{label}</span>
      {shortcut && <Kbd keys={shortcut} />}
    </button>
  );
}

export const MenuBar = memo(function MenuBar(props: MenuBarProps) {
  const {
    hasNotes, charCount, dailyRemaining, loading, customApiConfig,
    canUndo, canRedo, wordWrap, viewMode, showToc, isCompanionOpen,
    isSidebarOpen, isSoundEnabled, historyCount,
    onNewNote, onSaveDraft, onImportFile, onExportPdf, onClearNote,
    onUndo, onRedo, onSelectAll, onCopyAll, onToggleWordWrap,
    onBold, onItalic, onCode, onBulletList, onInsertLink, onInsertImage,
    onOpenTemplates, onOpenFormulas, onOpenMermaid, onLoadSample,
    onSetViewMode, onToggleToc, onToggleCompanion, onToggleSidebar, onToggleSound,
    onRecap, onOpenHistory,
    onOpenSettings, onOpenAppearance, onOpenShortcuts,
  } = props;

  const [activeMenu, setActiveMenu] = useState<MenuId>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => setActiveMenu(null), []);

  const toggle = useCallback((id: MenuId) => {
    setActiveMenu((curr) => (curr === id ? null : id));
  }, []);

  useEffect(() => {
    if (!activeMenu) return;
    function onPointerDown(e: PointerEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        closeAll();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [activeMenu, closeAll]);

  useEffect(() => {
    if (!activeMenu) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeMenu, closeAll]);

  function act(fn: () => void) {
    return () => { closeAll(); fn(); };
  }

  const menus: { id: NonNullable<MenuId>; label: string }[] = [
    { id: "file", label: "File" },
    { id: "edit", label: "Edit" },
    { id: "insert", label: "Insert" },
    { id: "view", label: "View" },
    { id: "ai", label: "AI" },
    { id: "settings", label: "Settings" },
  ];

  const dp = "absolute top-full left-0 mt-0.5 min-w-[210px] w-max max-w-[290px] z-[200] bg-app-surface border border-ink-700 rounded-xl shadow-2xl p-1.5 space-y-px animate-fade-in backdrop-blur-md";

  return (
    <div
      ref={barRef}
      className="hidden lg:flex h-7 items-stretch bg-app-card border-b border-ink-800/80 px-1 select-none flex-shrink-0 text-[12px]"
      role="menubar"
    >
      {menus.map(({ id, label }) => (
        <div key={id} className="relative">
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={activeMenu === id}
            onClick={() => toggle(id)}
            className={`px-3 h-full rounded-md transition-colors font-medium flex items-center gap-1 ${
              activeMenu === id
                ? "bg-ink-800 text-ink-50"
                : "text-ink-400 hover:text-ink-100 hover:bg-ink-800/60"
            }`}
          >
            {label}
            {id === "ai" && dailyRemaining !== null && (
              <span className="text-[9px] font-mono px-1 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                {dailyRemaining}/10
              </span>
            )}
          </button>

          {/* FILE */}
          {activeMenu === "file" && id === "file" && (
            <div className={dp} role="menu">
              <MenuItem label="New Note" onClick={act(onNewNote)} shortcut="Ctrl+N"
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" /></svg>} />
              <MenuItem label="Save Draft" onClick={act(onSaveDraft)} shortcut="Ctrl+S" disabled={!hasNotes}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2zM12 17v-6m0 6l-2-2m2 2l2-2" /></svg>} />
              <MenuDivider />
              <MenuItem label="Import File (.txt .md)" onClick={act(onImportFile)}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>} />
              <MenuItem label="Upload Image" onClick={act(onInsertImage)}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.8} /><circle cx="8.5" cy="8.5" r="1.5" strokeWidth={1.8} /><polyline points="21 15 16 10 5 21" strokeWidth={1.8} /></svg>} />
              <MenuDivider />
              <MenuItem label="Export / Print as PDF" onClick={act(onExportPdf)} disabled={!hasNotes}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>} />
              <MenuDivider />
              <MenuItem label="Discard Note" onClick={act(onClearNote)} disabled={!hasNotes} danger
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} />
            </div>
          )}

          {/* EDIT */}
          {activeMenu === "edit" && id === "edit" && (
            <div className={dp} role="menu">
              <MenuItem label="Undo" onClick={act(onUndo)} shortcut="Ctrl+Z" disabled={!canUndo}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l5-5m-5 5l5 5" /></svg>} />
              <MenuItem label="Redo" onClick={act(onRedo)} shortcut="Ctrl+Y" disabled={!canRedo}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5m5 5l-5 5" /></svg>} />
              <MenuDivider />
              <MenuItem label="Select All" onClick={act(onSelectAll)} shortcut="Ctrl+A" disabled={!hasNotes}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} strokeDasharray="2 2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" /></svg>} />
              <MenuItem label="Copy All" onClick={act(onCopyAll)} disabled={!hasNotes}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
              <MenuDivider />
              <CheckItem label="Word Wrap" checked={wordWrap} onClick={act(onToggleWordWrap)} />
            </div>
          )}

          {/* INSERT */}
          {activeMenu === "insert" && id === "insert" && (
            <div className={`${dp} min-w-[230px]`} role="menu">
              <MenuSection label="Formatting">
                <MenuItem label="Bold" onClick={act(onBold)} shortcut="Ctrl+B"
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>} />
                <MenuItem label="Italic" onClick={act(onItalic)} shortcut="Ctrl+I"
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m-2 0h4m2-16l4 16" /></svg>} />
                <MenuItem label="Inline Code" onClick={act(onCode)}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
              </MenuSection>
              <MenuDivider />
              <MenuSection label="Content">
                <MenuItem label="Bullet List" onClick={act(onBulletList)}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>} />
                <MenuItem label="Hyperlink" onClick={act(onInsertLink)}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
              </MenuSection>
              <MenuDivider />
              <MenuSection label="Advanced">
                <MenuItem label="LaTeX / Math Formula…" onClick={act(onOpenFormulas)}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h2l3 9 4-18 3 9h4" /></svg>} />
                <MenuItem label="Mermaid Diagram…" onClick={act(onOpenMermaid)}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>} />
                <MenuItem label="Note Template…" onClick={act(onOpenTemplates)}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>} />
                <MenuItem label="Load Demo Note" onClick={act(onLoadSample)}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
              </MenuSection>
            </div>
          )}

          {/* VIEW */}
          {activeMenu === "view" && id === "view" && (
            <div className={dp} role="menu">
              <MenuSection label="Editor Mode">
                <CheckItem label="Zen Edit" checked={viewMode === "edit"} onClick={act(() => onSetViewMode("edit"))} shortcut="Ctrl+P" />
                <CheckItem label="Split View" checked={viewMode === "split"} onClick={act(() => onSetViewMode("split"))} shortcut="Ctrl+P" />
                <CheckItem label="Full Preview" checked={viewMode === "preview"} onClick={act(() => onSetViewMode("preview"))} shortcut="Ctrl+P" />
              </MenuSection>
              <MenuDivider />
              <MenuSection label="Panels">
                <CheckItem label="Sidebar" checked={isSidebarOpen} onClick={act(onToggleSidebar)} />
                <CheckItem label="Table of Contents" checked={showToc} onClick={act(onToggleToc)} />
                <CheckItem label="AI Companion" checked={isCompanionOpen} onClick={act(onToggleCompanion)} />
              </MenuSection>
              <MenuDivider />
              <CheckItem label="Keyboard Sound (MX Black)" checked={isSoundEnabled} onClick={act(onToggleSound)} />
            </div>
          )}

          {/* AI */}
          {activeMenu === "ai" && id === "ai" && (
            <div className={dp} role="menu">
              <MenuItem
                label={loading ? "Generating Recap…" : "Generate AI Recap"}
                onClick={act(onRecap)}
                shortcut="Ctrl+Enter"
                disabled={loading || charCount < 40}
                badge={dailyRemaining !== null ? `${dailyRemaining}/10` : undefined}
                icon={<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
              />
              <MenuDivider />
              <MenuItem
                label={isCompanionOpen ? "Hide AI Companion" : "Show AI Companion"}
                onClick={act(onToggleCompanion)}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
              />
              <MenuItem
                label="Note History"
                onClick={act(onOpenHistory)}
                badge={historyCount > 0 ? String(historyCount) : undefined}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>
          )}

          {/* SETTINGS */}
          {activeMenu === "settings" && id === "settings" && (
            <div className={dp} role="menu">
              <MenuItem
                label={customApiConfig?.enabled ? `AI: ${customApiConfig.model || customApiConfig.provider}` : "AI Configuration"}
                onClick={act(onOpenSettings)}
                badge={customApiConfig?.enabled ? "Custom" : undefined}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
              <MenuItem
                label="Appearance & Typography"
                onClick={act(onOpenAppearance)}
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
              />
              <MenuDivider />
              <MenuItem
                label="Keyboard Shortcuts"
                onClick={act(onOpenShortcuts)}
                shortcut="?"
                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>
          )}
        </div>
      ))}

      {/* Right: status */}
      <div className="ml-auto flex items-center gap-3 pr-3 text-[11px] text-ink-500">
        {charCount > 0 && (
          <span className="font-mono">{charCount.toLocaleString()} chars</span>
        )}
        {customApiConfig?.enabled && (
          <span className="px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-400 text-[10px] font-mono border border-yellow-400/30">
            {customApiConfig.model || customApiConfig.provider}
          </span>
        )}
      </div>
    </div>
  );
});
