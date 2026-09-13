"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ThemeId,
  EditorFontId,
  UIFontId,
  FontSizeId,
  CustomThemeConfig,
  AppearanceState,
  ThemeColors,
  THEME_PRESETS,
  DEFAULT_APPEARANCE,
  buildCustomThemeColors,
  applyThemeToDOM,
} from "@/lib/themes";

const APPEARANCE_STORAGE_KEY = "ai_recap_appearance_config";

export function useAppearance() {
  const [appearance, setAppearance] = useState<AppearanceState>(DEFAULT_APPEARANCE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved appearance on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(APPEARANCE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged: AppearanceState = {
          ...DEFAULT_APPEARANCE,
          ...parsed,
          customTheme: {
            ...DEFAULT_APPEARANCE.customTheme,
            ...(parsed.customTheme || {}),
          },
        };
        setAppearance(merged);

        // Apply immediately
        const colors =
          merged.themeId === "custom"
            ? buildCustomThemeColors(merged.customTheme)
            : THEME_PRESETS[merged.themeId] || THEME_PRESETS.inkdrop;
        applyThemeToDOM(colors, merged);
      } else {
        applyThemeToDOM(THEME_PRESETS.inkdrop, DEFAULT_APPEARANCE);
      }
    } catch {
      applyThemeToDOM(THEME_PRESETS.inkdrop, DEFAULT_APPEARANCE);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Compute active colors
  const activeColors: ThemeColors = useMemo(() => {
    if (appearance.themeId === "custom") {
      return buildCustomThemeColors(appearance.customTheme);
    }
    return THEME_PRESETS[appearance.themeId] || THEME_PRESETS.inkdrop;
  }, [appearance.themeId, appearance.customTheme]);

  // Persist and apply changes
  const updateAppearance = useCallback(
    (updater: (prev: AppearanceState) => AppearanceState) => {
      setAppearance((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore localStorage quota errors
        }
        const colors =
          next.themeId === "custom"
            ? buildCustomThemeColors(next.customTheme)
            : THEME_PRESETS[next.themeId] || THEME_PRESETS.inkdrop;
        applyThemeToDOM(colors, next);
        return next;
      });
    },
    []
  );

  const setTheme = useCallback(
    (themeId: ThemeId) => {
      updateAppearance((prev) => ({ ...prev, themeId }));
    },
    [updateAppearance]
  );

  const setCustomTheme = useCallback(
    (partial: Partial<CustomThemeConfig>) => {
      updateAppearance((prev) => ({
        ...prev,
        themeId: "custom",
        customTheme: {
          ...prev.customTheme,
          ...partial,
        },
      }));
    },
    [updateAppearance]
  );

  const setEditorFont = useCallback(
    (editorFont: EditorFontId) => {
      updateAppearance((prev) => ({ ...prev, editorFont }));
    },
    [updateAppearance]
  );

  const setUIFont = useCallback(
    (uiFont: UIFontId) => {
      updateAppearance((prev) => ({ ...prev, uiFont }));
    },
    [updateAppearance]
  );

  const setCustomSystemFont = useCallback(
    (customSystemFont: string) => {
      updateAppearance((prev) => ({
        ...prev,
        editorFont: "custom",
        customSystemFont,
      }));
    },
    [updateAppearance]
  );

  const setFontSize = useCallback(
    (fontSize: FontSizeId) => {
      updateAppearance((prev) => ({ ...prev, fontSize }));
    },
    [updateAppearance]
  );

  const resetAppearance = useCallback(() => {
    updateAppearance(() => DEFAULT_APPEARANCE);
  }, [updateAppearance]);

  return {
    appearance,
    activeColors,
    isLoaded,
    setTheme,
    setCustomTheme,
    setEditorFont,
    setUIFont,
    setCustomSystemFont,
    setFontSize,
    resetAppearance,
  };
}
