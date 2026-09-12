"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type PaneType = "col1" | "col2" | "col4";

const DEFAULT_WIDTHS = {
  col1: 230,
  col2: 280,
  col4: 380,
};

const MIN_MAX_WIDTHS = {
  col1: { min: 170, max: 360 },
  col2: { min: 200, max: 450 },
  col4: { min: 280, max: 620 },
};

export function useResizablePanes() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTHS.col1);
  const [noteListWidth, setNoteListWidth] = useState<number>(DEFAULT_WIDTHS.col2);
  const [companionWidth, setCompanionWidth] = useState<number>(DEFAULT_WIDTHS.col4);
  const [activeResizer, setActiveResizer] = useState<PaneType | null>(null);

  // Load persisted widths from localStorage on mount
  useEffect(() => {
    try {
      const savedCol1 = localStorage.getItem("ai_recap_col1_w");
      if (savedCol1) {
        const val = Number(savedCol1);
        if (!isNaN(val) && val >= MIN_MAX_WIDTHS.col1.min && val <= MIN_MAX_WIDTHS.col1.max) {
          setSidebarWidth(val);
        }
      }

      const savedCol2 = localStorage.getItem("ai_recap_col2_w");
      if (savedCol2) {
        const val = Number(savedCol2);
        if (!isNaN(val) && val >= MIN_MAX_WIDTHS.col2.min && val <= MIN_MAX_WIDTHS.col2.max) {
          setNoteListWidth(val);
        }
      }

      const savedCol4 = localStorage.getItem("ai_recap_col4_w");
      if (savedCol4) {
        const val = Number(savedCol4);
        if (!isNaN(val) && val >= MIN_MAX_WIDTHS.col4.min && val <= MIN_MAX_WIDTHS.col4.max) {
          setCompanionWidth(val);
        }
      }
    } catch {
      // localStorage may not be available in private mode or SSR
    }
  }, []);

  const dragStateRef = useRef<{
    pane: PaneType;
    startX: number;
    startWidth: number;
  } | null>(null);

  const startResizing = useCallback((pane: PaneType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let startWidth = DEFAULT_WIDTHS[pane];
    if (pane === "col1") startWidth = sidebarWidth;
    else if (pane === "col2") startWidth = noteListWidth;
    else if (pane === "col4") startWidth = companionWidth;

    dragStateRef.current = {
      pane,
      startX: e.clientX,
      startWidth,
    };

    setActiveResizer(pane);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }, [sidebarWidth, noteListWidth, companionWidth]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragStateRef.current) return;
      const { pane, startX, startWidth } = dragStateRef.current;
      const delta = e.clientX - startX;

      if (pane === "col1") {
        const newW = Math.max(
          MIN_MAX_WIDTHS.col1.min,
          Math.min(MIN_MAX_WIDTHS.col1.max, startWidth + delta)
        );
        setSidebarWidth(newW);
      } else if (pane === "col2") {
        const newW = Math.max(
          MIN_MAX_WIDTHS.col2.min,
          Math.min(MIN_MAX_WIDTHS.col2.max, startWidth + delta)
        );
        setNoteListWidth(newW);
      } else if (pane === "col4") {
        // Dragging to left increases width of Col 4
        const newW = Math.max(
          MIN_MAX_WIDTHS.col4.min,
          Math.min(MIN_MAX_WIDTHS.col4.max, startWidth - delta)
        );
        setCompanionWidth(newW);
      }
    }

    function handleMouseUp() {
      if (!dragStateRef.current) return;
      const { pane } = dragStateRef.current;

      try {
        if (pane === "col1") {
          setSidebarWidth((w) => {
            localStorage.setItem("ai_recap_col1_w", String(w));
            return w;
          });
        } else if (pane === "col2") {
          setNoteListWidth((w) => {
            localStorage.setItem("ai_recap_col2_w", String(w));
            return w;
          });
        } else if (pane === "col4") {
          setCompanionWidth((w) => {
            localStorage.setItem("ai_recap_col4_w", String(w));
            return w;
          });
        }
      } catch {
        // Ignore
      }

      dragStateRef.current = null;
      setActiveResizer(null);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const resetWidth = useCallback((pane: PaneType) => {
    const def = DEFAULT_WIDTHS[pane];
    if (pane === "col1") {
      setSidebarWidth(def);
      try {
        localStorage.setItem("ai_recap_col1_w", String(def));
      } catch {}
    } else if (pane === "col2") {
      setNoteListWidth(def);
      try {
        localStorage.setItem("ai_recap_col2_w", String(def));
      } catch {}
    } else if (pane === "col4") {
      setCompanionWidth(def);
      try {
        localStorage.setItem("ai_recap_col4_w", String(def));
      } catch {}
    }
  }, []);

  return {
    sidebarWidth,
    noteListWidth,
    companionWidth,
    activeResizer,
    startResizing,
    resetWidth,
  };
}
