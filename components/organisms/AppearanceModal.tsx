"use client";

import { memo, useState } from "react";
import {
  ThemeId,
  EditorFontId,
  UIFontId,
  FontSizeId,
  AppearanceState,
  ThemeColors,
  THEME_PRESETS,
  EDITOR_FONTS,
  UI_FONTS,
  FONT_SIZES,
  CustomThemeConfig,
} from "@/lib/themes";

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appearance: AppearanceState;
  activeColors: ThemeColors;
  onSelectTheme: (themeId: ThemeId) => void;
  onUpdateCustomTheme: (config: Partial<CustomThemeConfig>) => void;
  onSelectEditorFont: (fontId: EditorFontId) => void;
  onSelectUIFont: (fontId: UIFontId) => void;
  onSetCustomSystemFont: (font: string) => void;
  onSelectFontSize: (size: FontSizeId) => void;
  onReset: () => void;
}

export const AppearanceModal = memo(function AppearanceModal({
  isOpen,
  onClose,
  appearance,
  activeColors,
  onSelectTheme,
  onUpdateCustomTheme,
  onSelectEditorFont,
  onSelectUIFont,
  onSetCustomSystemFont,
  onSelectFontSize,
  onReset,
}: AppearanceModalProps) {
  const [activeTab, setActiveTab] = useState<"themes" | "typography">("themes");

  if (!isOpen) return null;

  const presetList = Object.values(THEME_PRESETS);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appearance-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-ink-900 border border-ink-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-ink-100 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-highlight/15 border border-highlight/30 flex items-center justify-center text-highlight">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <div>
              <h2 id="appearance-modal-title" className="text-base font-bold text-ink-50">
                Appearance &amp; Typography
              </h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Customize study color palettes, coding typography, and readability settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-ink-400 hover:text-ink-200 hover:bg-ink-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-ink-800/80 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("themes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "themes"
                ? "bg-highlight text-highlight-text font-bold shadow-sm"
                : "text-ink-400 hover:text-ink-200 hover:bg-ink-800"
            }`}
          >
            Color Themes ({presetList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "typography"
                ? "bg-highlight text-highlight-text font-bold shadow-sm"
                : "text-ink-400 hover:text-ink-200 hover:bg-ink-800"
            }`}
          >
            Typography &amp; Fonts
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-thin">
          {activeTab === "themes" ? (
            <div className="space-y-5">
              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presetList.map((preset) => {
                  const isSelected = appearance.themeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectTheme(preset.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
                        isSelected
                          ? "border-highlight bg-ink-800/90 shadow-md ring-1 ring-highlight/50"
                          : "border-ink-800 bg-ink-950/60 hover:bg-ink-800/40 hover:border-ink-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <span className="text-xs font-bold text-ink-100 block">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-ink-400">
                            {preset.isDark ? "Dark Scheme" : "Light Paper"}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-highlight text-highlight-text flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Swatch chips */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className="w-5 h-5 rounded-md border border-ink-700 flex-shrink-0"
                          style={{ backgroundColor: preset.bgApp }}
                          title="App Background"
                        />
                        <span
                          className="w-5 h-5 rounded-md border border-ink-700 flex-shrink-0"
                          style={{ backgroundColor: preset.bgSurface }}
                          title="Surface Card"
                        />
                        <span
                          className="w-5 h-5 rounded-md border border-ink-700 flex-shrink-0"
                          style={{ backgroundColor: preset.ink100 }}
                          title="Text Ink"
                        />
                        <span
                          className="w-5 h-5 rounded-md border border-ink-700 flex-shrink-0 ml-auto"
                          style={{ backgroundColor: preset.highlight }}
                          title="Accent Highlight"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Theme Color Builder (when custom selected) */}
              {appearance.themeId === "custom" && (
                <div className="p-4 rounded-xl border border-highlight/40 bg-ink-950 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-highlight uppercase tracking-wider">
                      Custom Theme Color Builder
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-300">
                      <span>Dark Mode</span>
                      <input
                        type="checkbox"
                        checked={appearance.customTheme.isDark}
                        onChange={(e) => onUpdateCustomTheme({ isDark: e.target.checked })}
                        className="rounded border-ink-600 text-highlight focus:ring-0"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-ink-400 block font-medium">
                        Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={appearance.customTheme.bgApp}
                          onChange={(e) => onUpdateCustomTheme({ bgApp: e.target.value })}
                          className="w-8 h-8 rounded border border-ink-700 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-xs text-ink-300">
                          {appearance.customTheme.bgApp}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-ink-400 block font-medium">
                        Sidebar
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={appearance.customTheme.bgSidebar}
                          onChange={(e) => onUpdateCustomTheme({ bgSidebar: e.target.value })}
                          className="w-8 h-8 rounded border border-ink-700 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-xs text-ink-300">
                          {appearance.customTheme.bgSidebar}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-ink-400 block font-medium">
                        Card / Surface
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={appearance.customTheme.bgSurface}
                          onChange={(e) => onUpdateCustomTheme({ bgSurface: e.target.value })}
                          className="w-8 h-8 rounded border border-ink-700 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-xs text-ink-300">
                          {appearance.customTheme.bgSurface}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-ink-400 block font-medium">
                        Highlight Accent
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={appearance.customTheme.highlight}
                          onChange={(e) => onUpdateCustomTheme({ highlight: e.target.value })}
                          className="w-8 h-8 rounded border border-ink-700 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-xs text-ink-300">
                          {appearance.customTheme.highlight}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Editor Code Font */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-ink-200 uppercase tracking-wider block">
                    Editor &amp; Markdown Code Font
                  </label>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Controls code blocks, monospace formulas, and the live Markdown editor.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EDITOR_FONTS.map((font) => {
                    const isSelected = appearance.editorFont === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => onSelectEditorFont(font.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-highlight bg-ink-800/90 ring-1 ring-highlight/50 shadow-sm"
                            : "border-ink-800 bg-ink-950/60 hover:bg-ink-800/40 hover:border-ink-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ink-100">{font.name}</span>
                          {isSelected && (
                            <span className="text-highlight text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] text-ink-400 mt-0.5 mb-2">
                          {font.description}
                        </span>
                        <div
                          className="text-xs text-highlight bg-ink-900/90 px-2 py-1 rounded border border-ink-700/50"
                          style={{ fontFamily: font.family }}
                        >
                          const recall = (n) =&gt; n &gt;= 0.85;
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom system font input */}
                {appearance.editorFont === "custom" && (
                  <div className="p-3 rounded-xl border border-ink-700 bg-ink-950/80 space-y-2">
                    <label className="text-xs font-medium text-ink-300 block">
                      Local Installed System Font Name
                    </label>
                    <input
                      type="text"
                      value={appearance.customSystemFont}
                      onChange={(e) => onSetCustomSystemFont(e.target.value)}
                      placeholder="e.g. Cascadia Code, SF Pro, Consolas, Menlo"
                      className="w-full px-3 py-1.5 text-xs bg-ink-900 border border-ink-700 rounded-lg text-ink-100 focus:outline-none focus:border-highlight"
                    />
                    <span className="text-[10px] text-ink-500 block">
                      Zero browser memory overhead. Uses any font already installed on your operating system.
                    </span>
                  </div>
                )}
              </div>

              {/* UI & Reading Font */}
              <div className="space-y-3 pt-4 border-t border-ink-800/80">
                <div>
                  <label className="text-xs font-bold text-ink-200 uppercase tracking-wider block">
                    UI &amp; Study Reading Font
                  </label>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Controls interface elements, flashcards, summaries, and reading readability.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {UI_FONTS.map((font) => {
                    const isSelected = appearance.uiFont === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => onSelectUIFont(font.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-highlight bg-ink-800/90 ring-1 ring-highlight/50 shadow-sm"
                            : "border-ink-800 bg-ink-950/60 hover:bg-ink-800/40 hover:border-ink-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ink-100">{font.name}</span>
                          {isSelected && (
                            <span className="text-highlight text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] text-ink-400 mt-0.5 mb-2">
                          {font.description}
                        </span>
                        <div
                          className="text-xs text-ink-100 bg-ink-900/90 px-2 py-1 rounded border border-ink-700/50"
                          style={{ fontFamily: font.family }}
                        >
                          Active Recall: 4 quiz cards mastered
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-2 pt-4 border-t border-ink-800/80">
                <label className="text-xs font-bold text-ink-200 uppercase tracking-wider block">
                  Interface &amp; Editor Text Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_SIZES.map((size) => {
                    const isSelected = appearance.fontSize === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => onSelectFontSize(size.id)}
                        className={`py-2 px-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-highlight bg-highlight text-highlight-text font-bold shadow-sm"
                            : "border-ink-800 bg-ink-950/60 text-ink-300 hover:bg-ink-800/50 hover:text-ink-100"
                        }`}
                      >
                        <span className="text-xs block">{size.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">{size.size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-ink-800 flex-shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-ink-400 hover:text-ink-200 transition-colors"
          >
            Reset to Inkdrop Default
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-highlight hover:bg-highlight-hover text-highlight-text font-bold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});
