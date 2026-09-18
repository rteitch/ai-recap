"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { QuizItem, RecapResult, HistoryItem, RatingType, StudyStatus } from "@/lib/types";
import { FormattedText } from "@/components/atoms/FormattedText";
import { QuizCard } from "@/components/molecules/QuizCard";
import { SpeechControls } from "@/components/molecules/SpeechControls";
import { StudyStreakBadge } from "@/components/molecules/StudyStreakBadge";
import { OfflineBadge } from "@/components/molecules/OfflineBadge";
import { StorageIndicator } from "@/components/molecules/StorageIndicator";
import { cleanupOrphanedImages } from "@/lib/imageStorage";
import { NotesInput, NotesInputHandle } from "@/components/organisms/NotesInput";
import { FlashcardDeck } from "@/components/organisms/FlashcardDeck";
import { RetentionScorecard } from "@/components/organisms/RetentionScorecard";
import { ShortcutsModal } from "@/components/organisms/ShortcutsModal";
import { CommandPalette } from "@/components/organisms/CommandPalette";
import { InkdropNavigation, NavFilterType, NotebookItem, DEFAULT_NOTEBOOKS } from "@/components/organisms/InkdropNavigation";
import { InkdropNoteList } from "@/components/organisms/InkdropNoteList";
import { StudyCompanionPane } from "@/components/organisms/StudyCompanionPane";
import { ResizerDivider } from "@/components/atoms/ResizerDivider";
import { useResizablePanes } from "@/hooks/useResizablePanes";
import { STUDY_TEMPLATES } from "@/lib/templates";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useSpeech } from "@/hooks/useSpeech";
import { triggerHaptic } from "@/lib/haptics";
import { toast } from "sonner";
import {
  CustomApiConfig,
  DEFAULT_AI_CONFIG,
  loadCustomApiConfig,
  saveCustomApiConfig,
} from "@/lib/ai-config";
import { CustomApiModal } from "@/components/organisms/CustomApiModal";
import { AppearanceModal } from "@/components/organisms/AppearanceModal";
import { MenuBar } from "@/components/organisms/MenuBar";
import { BackupRestoreModal } from "@/components/organisms/BackupRestoreModal";
import { FindReplaceModal } from "@/components/organisms/FindReplaceModal";
import { MergeNotesModal } from "@/components/organisms/MergeNotesModal";
import { SimpleModeView } from "@/components/organisms/SimpleModeView";
import { useAppearance } from "@/hooks/useAppearance";
import { extractHashtags, normalizeTag } from "@/lib/tags";
import { ErrorBoundary } from "@/components/atoms/ErrorBoundary";


const SAMPLE_NOTE = `In classical thermodynamics and special relativity, mass-energy equivalence is defined by $E = mc^2$, where $c$ is the speed of light ($c \\approx 3 \\times 10^8\\text{ m/s}$). For quadratic algebra, roots of the polynomial equation $ax^2 + bx + c = 0$ are solved using:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
For ideal gases, thermodynamics relates pressure, volume, and temperature via the equation $PV = nRT$. Mastering these relationships requires active retrieval and spaced repetition.`;

export default function Home() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecapResult | null>(null);
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [ratings, setRatings] = useState<Record<number, RatingType>>({});
  const [copiedType, setCopiedType] = useState<"summary" | "all" | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notebooks, setNotebooks] = useState<NotebookItem[]>(DEFAULT_NOTEBOOKS);
  const [quizViewMode, setQuizViewMode] = useState<"list" | "card">("list");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showCustomApiModal, setShowCustomApiModal] = useState(false);
  const [reviewTimes, setReviewTimes] = useState<Record<number, number>>({});
  const cardOpenedAtRef = useRef<number>(Date.now());
  const [showBackupRestoreModal, setShowBackupRestoreModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showMergeNotes, setShowMergeNotes] = useState(false);
  const [customApiConfig, setCustomApiConfig] = useState<CustomApiConfig>(DEFAULT_AI_CONFIG);
  const [isOnline, setIsOnline] = useState(true);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [recapMode, setRecapMode] = useState<'brief' | 'detailed'>('detailed');
  const [quizCount, setQuizCount] = useState<3 | 5 | 10>(5);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const showAppearanceModalRef = useRef(showAppearanceModal);
  showAppearanceModalRef.current = showAppearanceModal;

  // App mode: "simple" (clean centered UI) | "workstation" (full IDE)
  // Lazy initializer reads from localStorage so preference persists across sessions.
  // showModePicker = true only for brand-new users who have never chosen a mode.
  const [appMode, setAppMode] = useState<"simple" | "workstation">(() => {
    if (typeof window === "undefined") return "simple";
    try {
      const saved = localStorage.getItem("ai_recap_app_mode");
      if (saved === "workstation" || saved === "simple") return saved;
      // Returning user with history but no mode saved → default workstation
      const hasHistory = localStorage.getItem("ai_recap_history");
      if (hasHistory) {
        const parsed = JSON.parse(hasHistory);
        if (Array.isArray(parsed) && parsed.length > 0) return "workstation";
      }
    } catch {}
    return "simple"; // placeholder until picker is shown
  });

  // Show mode picker only when user has never explicitly chosen a mode
  const [showModePicker, setShowModePicker] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("ai_recap_app_mode");
      if (saved === "workstation" || saved === "simple") return false; // already chose
      // Returning user with history — no need to ask
      const hasHistory = localStorage.getItem("ai_recap_history");
      if (hasHistory) {
        const parsed = JSON.parse(hasHistory);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {}
    return true; // first-time visitor → show picker
  });

  const handlePickMode = useCallback((mode: "simple" | "workstation") => {
    setAppMode(mode);
    setShowModePicker(false);
    try { localStorage.setItem("ai_recap_app_mode", mode); } catch {}
  }, []);

  const handleSwitchToWorkstation = useCallback(() => {
    setAppMode("workstation");
    setShowModePicker(false);
    try { localStorage.setItem("ai_recap_app_mode", "workstation"); } catch {}
  }, []);

  const handleSwitchToSimple = useCallback(() => {
    setAppMode("simple");
    setShowModePicker(false);
    try { localStorage.setItem("ai_recap_app_mode", "simple"); } catch {}
  }, []);

  // Appearance & Typography engine
  const {
    appearance,
    activeColors,
    setTheme,
    setCustomTheme,
    setEditorFont,
    setUIFont,
    setCustomSystemFont,
    setFontSize,
    resetAppearance,
  } = useAppearance();

  // Inkdrop Workstation State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<NavFilterType>({ type: "all" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [mobileNavTab, setMobileNavTab] = useState<"nav" | "notes">("notes");
  const [isCompanionOpen, setIsCompanionOpen] = useState(true);
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;
  const showShortcutsRef = useRef(showShortcuts);
  showShortcutsRef.current = showShortcuts;
  const isCommandPaletteOpenRef = useRef(isCommandPaletteOpen);
  isCommandPaletteOpenRef.current = isCommandPaletteOpen;

  // MenuBar editor state (synced from notesInputRef on each menu action)
  const [menuBarEditorState, setMenuBarEditorState] = useState({
    canUndo: false, canRedo: false, wordWrap: false,
    viewMode: "edit" as "edit" | "split" | "preview",
    showToc: false, isSoundEnabled: false, charCount: 0,
  });

  const {
    sidebarWidth,
    noteListWidth,
    companionWidth,
    activeResizer,
    startResizing,
    resetWidth,
  } = useResizablePanes();

  const resultRef = useRef<HTMLElement>(null);
  const fullQuizRef = useRef<QuizItem[] | null>(null);
  const notesDataRef = useRef(notes);
  notesDataRef.current = notes;
  const resultDataRef = useRef(result);
  resultDataRef.current = result;
  const activeNoteIdRef = useRef(activeNoteId);
  activeNoteIdRef.current = activeNoteId;
  const historySyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notesInputRef = useRef<NotesInputHandle>(null);
  const syncMenuBarState = useCallback(() => {
    const s = notesInputRef.current?.getState();
    if (s) setMenuBarEditorState(s);
  }, []);


  const { studyStreak, recordStudyActivity } = useStudyStreak();
  const { isSpeaking, speechRate, toggleSpeech, cycleSpeechRate, stopSpeech } =
    useSpeech(result?.summary);

  // Refs for stable useEffect deps — avoids re-registering global listeners on every state toggle
  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;
  const isCardFlippedRef = useRef(isCardFlipped);
  isCardFlippedRef.current = isCardFlipped;
  const activeCardIndexRef = useRef(activeCardIndex);
  activeCardIndexRef.current = activeCardIndex;
  const handleNewNoteRef = useRef<() => void>(() => {});
  const handleSaveDraftRef = useRef<() => void>(() => {});

  // Restore state from localStorage & check shared URL hash
  useEffect(() => {
    if (typeof navigator !== "undefined" && !!navigator.share) {
      setCanShare(true);
    }
    try {
      const saved = localStorage.getItem("ai_recap_saved_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.result) {
          setResult(parsed.result);
          if (Array.isArray(parsed.result.quiz)) {
            fullQuizRef.current = parsed.result.quiz;
          }
        }
        if (parsed.ratings) setRatings(parsed.ratings);
        if (parsed.recapMode) setRecapMode(parsed.recapMode);
        if (parsed.quizCount) setQuizCount(parsed.quizCount);
      }
    } catch {
      // Ignore
    }

    try {
      const savedNotebooks = localStorage.getItem("ai_recap_notebooks");
      if (savedNotebooks) {
        const parsed = JSON.parse(savedNotebooks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotebooks(parsed);
        }
      }
    } catch {
      // Ignore
    }

    try {
      const savedCustomApi = loadCustomApiConfig();
      setCustomApiConfig(savedCustomApi);
    } catch {
      // Ignore
    }

    try {
      const savedHistory = localStorage.getItem("ai_recap_history");
      const hasOnboarded = localStorage.getItem("ai_recap_has_onboarded");
      const savedActiveNoteId = localStorage.getItem("ai_recap_active_note_id");

      if (savedHistory && JSON.parse(savedHistory).length > 0) {
        const parsed: HistoryItem[] = JSON.parse(savedHistory);
        setHistory(parsed);
        const targetNote = (savedActiveNoteId && parsed.find((h) => h.id === savedActiveNoteId)) || parsed[0];
        if (targetNote) {
          setActiveNoteId(targetNote.id);
          setNotes(targetNote.notes);
          setResult(targetNote.result);
          if (targetNote.result?.quiz) {
            fullQuizRef.current = targetNote.result.quiz;
          }
          updateStorage(targetNote.notes, targetNote.result, {});
        }
      } else if (!hasOnboarded) {
        const defaultSample: HistoryItem = {
          id: "sample-inkdrop-1",
          timestamp: Date.now() - 3600 * 1000 * 2,
          preview: "In classical thermodynamics and special relativity, mass-energy equivalence is defined by $E = mc^2$…",
          notes: SAMPLE_NOTE,
          result: {
            summary: "Mass-energy equivalence principle ($E=mc^2$), the quadratic formula, and the ideal gas state equation ($PV=nRT$). These foundational concepts bridge special relativity with classical thermodynamics.",
            quiz: [
              {
                question: "What is Einstein's mass-energy equivalence formula and what is the speed of light constant $c$?",
                answer: "The mass-energy equivalence formula is $E = mc^2$, where the speed of light in vacuum is $c \\approx 3 \\times 10^8\\text{ m/s}$."
              },
              {
                question: "Write down the quadratic formula used to find the roots of $ax^2 + bx + c = 0$!",
                answer: "The roots of the quadratic equation are given by: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$"
              },
              {
                question: "State the variables in the ideal gas equation $PV = nRT$ along with their standard SI units!",
                answer: "$P$ is pressure (Pascals), $V$ is volume ($m^3$), $n$ is amount of substance (moles), $R \\approx 8.314\\text{ J/(mol}\\cdot\\text{K)}$ is the ideal gas constant, and $T$ is absolute temperature (Kelvin)."
              }
            ]
          },
          status: "sedang-dipelajari",
          pinned: true,
          notebook: "Study",
          tags: ["physics", "math", "study"],
          title: "Thermodynamics & Special Relativity ($E=mc^2$)"
        };
        setHistory([defaultSample]);
        setActiveNoteId(defaultSample.id);
        setNotes(defaultSample.notes);
        setResult(defaultSample.result);
        fullQuizRef.current = defaultSample.result.quiz;
        try {
          localStorage.setItem("ai_recap_history", JSON.stringify([defaultSample]));
          localStorage.setItem("ai_recap_active_note_id", defaultSample.id);
          localStorage.setItem("ai_recap_has_onboarded", "true");
        } catch {}
      } else {
        setActiveNoteId(null);
        setNotes("");
        setResult(null);
        fullQuizRef.current = null;
      }
    } catch {
      // Ignore
    }

    try {
      const today = new Date().toISOString().slice(0, 10);
      const quotaSaved = localStorage.getItem("ai_recap_daily_quota");
      if (quotaSaved) {
        const parsed = JSON.parse(quotaSaved);
        if (parsed.date === today && typeof parsed.remaining === "number") {
          const used = Math.max(0, (parsed.maxQuota || 5) - parsed.remaining);
          setDailyRemaining(Math.max(0, 10 - used));
        } else {
          setDailyRemaining(10);
        }
      } else {
        setDailyRemaining(10);
      }
    } catch {
      setDailyRemaining(10);
    }

    // Check shared recap URL hash
    if (typeof window !== "undefined" && window.location.hash.startsWith("#recap=")) {
      try {
        const payload = window.location.hash.slice(7);
        const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(payload))));
        const parsed = JSON.parse(jsonStr);
        if (
          parsed &&
          typeof parsed.result?.summary === "string" &&
          Array.isArray(parsed.result.quiz) &&
          parsed.result.quiz.length > 0 &&
          parsed.result.quiz.length <= 8
        ) {
          const cleanSummary = String(parsed.result.summary).slice(0, 1000);
          const cleanQuiz = parsed.result.quiz
            .slice(0, 6)
            .filter(
              (q: unknown): q is QuizItem =>
                typeof (q as QuizItem)?.question === "string" &&
                typeof (q as QuizItem)?.answer === "string"
            )
            .map((q: QuizItem) => ({
              question: String(q.question).slice(0, 400),
              answer: String(q.answer).slice(0, 1000),
            }));

          if (cleanQuiz.length > 0) {
            const sanitizedResult = { summary: cleanSummary, quiz: cleanQuiz };
            setResult(sanitizedResult);
            fullQuizRef.current = cleanQuiz;
            if (typeof parsed.notes === "string") {
              setNotes(
                parsed.notes
                  .slice(0, 20000)
                  .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
                  .replace(/javascript\s*:/gi, "")
                  .replace(/\son\w+\s*=/gi, " ")
              );
            }
            toast.success("Loaded shared study recap (0 AI tokens used)");
        setSrMessage("Shared recap loaded successfully");

            try {
              window.history.replaceState(null, "", window.location.pathname);
            } catch {
              // Ignore
            }

            setTimeout(() => {
              resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
          }
        }
      } catch {
        // Ignore malformed hash
      }
    }

    // On tablet & mobile (< 1280px), start with companion closed so editor is focused
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setIsCompanionOpen(false);
    }
  }, []);

  // Network connectivity listener
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Lock scroll when modals/overlay drawers are open
  useEffect(() => {
    const isOverlayOpen =
      isCommandPaletteOpen ||
      showAppearanceModal ||
      showShortcuts ||
      isMobileNavOpen ||
      (isCompanionOpen && typeof window !== "undefined" && window.innerWidth < 1280);

    if (isOverlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCommandPaletteOpen, showAppearanceModal, showShortcuts, isMobileNavOpen, isCompanionOpen]);

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveDraftRef.current();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setShowFindReplace((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowFindReplace(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        notesInputRef.current?.undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        notesInputRef.current?.redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(150, prev + 10));
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(80, prev - 10));
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoomLevel(100);
        return;
      }

      if (e.key === "Escape") {
        if (isCommandPaletteOpenRef.current) {
          setIsCommandPaletteOpen(false);
        } else if (showAppearanceModalRef.current) {
          setShowAppearanceModal(false);
        } else if (showShortcutsRef.current) {
          setShowShortcuts(false);
        } else if (isSpeakingRef.current) {
          stopSpeech();
        }
      } else if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "n") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        handleNewNoteRef.current();
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const root = document.querySelector(".inkdrop-editor-root");
    if (root) {
      (root as HTMLElement).style.zoom = `${zoomLevel}%`;
    }
  }, [zoomLevel]);

  // Multi-tab storage sync
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "ai_recap_saved_state" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.notes !== undefined) {
            setNotes((prev) => (prev !== parsed.notes ? parsed.notes : prev));
          }
          if (parsed.result !== undefined) {
            setResult((prev) =>
              prev?.summary !== parsed.result?.summary ? parsed.result : prev
            );
          }
          if (parsed.ratings !== undefined) {
            setRatings((prev) =>
              Object.keys(prev).length !== Object.keys(parsed.ratings).length
                ? parsed.ratings
                : prev
            );
          }
        } catch {
          // Ignore
        }
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // localStorage size warning
  useEffect(() => {
    const warnedRef = { current: false };
    const interval = setInterval(async () => {
      if (warnedRef.current || !navigator.storage?.estimate) return;
      try {
        const { usage, quota } = await navigator.storage.estimate();
        if (!usage || !quota) return;
        const pct = (usage / quota) * 100;
        const usedMB = (usage / 1024 / 1024).toFixed(1);
        const totalMB = (quota / 1024 / 1024).toFixed(0);
        if (pct > 95) {
          warnedRef.current = true;
          toast.error(`Storage critically full! (${usedMB}MB/${totalMB}MB). Delete old notes now.`, { duration: 10000 });
        } else if (pct > 80) {
          warnedRef.current = true;
          toast.warning(`Storage almost full (${usedMB}MB/${totalMB}MB). Consider deleting old notes.`, { duration: 8000 });
        }
      } catch { /* ignore */ }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Debounced draft auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (notes || result) {
          localStorage.setItem(
            "ai_recap_saved_state",
            JSON.stringify({ notes, result, ratings })
          );
        }
      } catch {
        // Ignore
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [notes, result, ratings]);

function updateStorage(
      newNotes: string,
      newResult: RecapResult | null,
      newRatings: Record<number, RatingType> = {}
    ) {
      try {
        if (!newNotes && !newResult) {
          localStorage.removeItem("ai_recap_saved_state");
        } else {
          localStorage.setItem(
            "ai_recap_saved_state",
            JSON.stringify({ notes: newNotes, result: newResult, ratings: newRatings, recapMode, quizCount })
          );
        }
      } catch {
        // Ignore
      }
    }


  const handleClear = useCallback(() => {
    stopSpeech();
    setNotes("");
    setResult(null);
    setError(null);
    setOpenIndices([]);
    setRatings({});
    updateStorage("", null);
  }, [stopSpeech]);

  const toggleIndex = useCallback((index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const handleToggleAll = useCallback(() => {
    if (!result) return;
    if (openIndices.length === result.quiz.length) {
      setOpenIndices([]);
    } else {
      setOpenIndices(result.quiz.map((_, i) => i));
    }
  }, [result, openIndices]);

  // Stable handleRate reference for 120 FPS typing
  const handleRate = useCallback(
    (index: number, rating: RatingType) => {
      triggerHaptic(12);
      const elapsed = Math.round(Date.now() - cardOpenedAtRef.current);
      setReviewTimes((prev) => ({ ...prev, [index]: (prev[index] || 0) + elapsed }));
      setRatings((prev) => {
        const updated: Record<number, RatingType> = { ...prev };
        if (updated[index] === rating) {
          delete updated[index];
        } else {
          updated[index] = rating;
        }
        updateStorage(notesDataRef.current, resultDataRef.current, updated);
        return updated;
      });
      recordStudyActivity();
    },
    [recordStudyActivity]
  );

  useEffect(() => {
    cardOpenedAtRef.current = Date.now();
  }, [activeCardIndex]);

  // Flashcard keyboard navigation — uses refs so the listener never re-registers during card use
  useEffect(() => {
    if (quizViewMode !== "card" || !result) return;
    const maxIndex = result.quiz.length - 1;

    function handleCardKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        triggerHaptic(15);
        setIsCardFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        triggerHaptic(8);
        setIsCardFlipped(false);
        setActiveCardIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        triggerHaptic(8);
        setIsCardFlipped(false);
        setActiveCardIndex((prev) => Math.min(maxIndex, prev + 1));
      } else if (isCardFlippedRef.current && (e.key === "1" || e.key === "k")) {
        e.preventDefault();
        handleRate(activeCardIndexRef.current, "known");
      } else if (isCardFlippedRef.current && (e.key === "2" || e.key === "r")) {
        e.preventDefault();
        handleRate(activeCardIndexRef.current, "learning");
      }
    }
    window.addEventListener("keydown", handleCardKeyDown);
    return () => window.removeEventListener("keydown", handleCardKeyDown);
  }, [quizViewMode, result, handleRate]);

  // Export handlers
  const handleCopySummary = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopiedType("summary");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Ignore
    }
  }, [result]);

  async function handleCopyAll() {
    if (!result) return;
    const formatted = [
      "## Summary",
      result.summary,
      "",
      "## Self-Test Quiz",
      ...result.quiz.map((q, i) => `${i + 1}. **${q.question}**\n   - ${q.answer}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedType("all");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Ignore
    }
  }

  function handleDownloadMarkdown() {
    if (!result) return;
    const formatted = [
      "# AI Recap",
      "",
      "## Summary",
      result.summary,
      "",
      "## Self-Test Quiz",
      ...result.quiz.map((q, i) => `${i + 1}. **${q.question}**\n   - Answer: ${q.answer}\n`),
      "",
      "---",
      "_Generated with AI Recap (ai-recap.rth.my.id)_",
    ].join("\n");

    const blob = new Blob([formatted], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-recap-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadTxt() {
    if (!result) return;
    const formatted = [
      "AI RECAP",
      "========",
      "",
      "SUMMARY",
      "-------",
      result.summary,
      "",
      "SELF-TEST QUIZ",
      "--------------",
      ...result.quiz.map((q, i) => `${i + 1}. ${q.question}\n   Answer: ${q.answer}\n`),
      "",
      "---",
      "Generated with AI Recap (ai-recap.rth.my.id)",
    ].join("\n");

    const blob = new Blob([formatted], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-recap-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportAnki() {
    if (!result || result.quiz.length === 0) return;
    const tsvLines = result.quiz.map((q) => {
      const front = q.question.replace(/\t/g, " ").replace(/\r?\n/g, " ");
      const back = q.answer.replace(/\t/g, " ").replace(/\r?\n/g, "<br>");
      return `${front}\t${back}`;
    });
    const ankiTags = ["ai-recap", ...(activeNote?.tags || [])].join(" ");
    const content = `#separator:tab\n#html:true\n#tags:${ankiTags}\n${tsvLines.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-recap-anki-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleCopyMissed = useCallback(async () => {
    if (!result) return;
    const missed = result.quiz.filter((_, idx) => ratings[idx] === "learning");
    if (missed.length === 0) return;
    const formatted = [
      "## Review Items (AI Recap)",
      ...missed.map((q, i) => `${i + 1}. **${q.question}**\n   - Answer: ${q.answer}`),
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(formatted);
      toast.success(`Copied ${missed.length} review item${missed.length > 1 ? "s" : ""} to clipboard!`);
    } catch {
      // Ignore
    }
  }, [result, ratings]);

  const handleRetest = useCallback((shuffle = false) => {
    if (!result) return;
    setRatings({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    const baseQuiz = fullQuizRef.current || result.quiz;
    if (baseQuiz.length === 0) {
      toast.error("No quiz questions available. Please generate a recap first.");
      return;
    }
    if (shuffle) {
      const shuffled = [...baseQuiz];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const updated = { ...result, quiz: shuffled };
      setResult(updated);
      updateStorage(notes, updated, {});
    } else {
      const updated = { ...result, quiz: baseQuiz };
      setResult(updated);
      updateStorage(notes, updated, {});
    }
  }, [result, notes]);

  const handleRetestMissed = useCallback(() => {
    if (!result) return;
    if (!fullQuizRef.current) {
      fullQuizRef.current = result.quiz;
    }
    const missed = result.quiz.filter((_, idx) => ratings[idx] === "learning");
    if (missed.length === 0) return;
    setRatings({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    const updated = { ...result, quiz: missed };
    setResult(updated);
    updateStorage(notes, updated, {});
  }, [result, ratings, notes]);

  const handleResetFullQuiz = useCallback(() => {
    if (!result || !fullQuizRef.current) return;
    setRatings({});
    setReviewTimes({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    const updated = { ...result, quiz: fullQuizRef.current };
    setResult(updated);
    updateStorage(notes, updated, {});
  }, [result, notes]);

  // Memoized counts for Column 1
  const statusCounts = useMemo(() => {
    const counts: Record<StudyStatus, number> = {
      "sedang-dipelajari": 0,
      "perlu-diulang": 0,
      "dikuasai": 0,
      "belum-direview": 0,
    };
    history.forEach((item) => {
      const s = item.status || "sedang-dipelajari";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [history]);

  const notebookCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notebooks.forEach((nb) => {
      counts[nb.id] = 0;
    });
    history.forEach((item) => {
      const nb = item.notebook || "Inbox";
      counts[nb] = (counts[nb] || 0) + 1;
    });
    return counts;
  }, [history, notebooks]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return counts;
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (activeFilter.type === "all") return history;
    if (activeFilter.type === "templates") return history;
    if (activeFilter.type === "status") {
      return history.filter((item) => (item.status || "sedang-dipelajari") === activeFilter.value);
    }
    if (activeFilter.type === "notebook") {
      return history.filter((item) => (item.notebook || "Inbox") === activeFilter.value);
    }
    if (activeFilter.type === "tag") {
      return history.filter((item) => item.tags?.includes(activeFilter.value));
    }
    if (activeFilter.type === "trash") {
      return [];
    }
    return history;
  }, [history, activeFilter]);

  const categoryTitle = useMemo(() => {
    if (activeFilter.type === "all") return "All Notes";
    if (activeFilter.type === "templates") return "Note Templates";
    if (activeFilter.type === "notebook") {
      const found = notebooks.find((n) => n.id === activeFilter.value);
      return found ? found.label : `Notebook: ${activeFilter.value}`;
    }
    if (activeFilter.type === "status") {
      switch (activeFilter.value) {
        case "sedang-dipelajari": return "In Progress";
        case "perlu-diulang": return "Needs Review";
        case "dikuasai": return "Mastered";
        case "belum-direview": return "Not Reviewed";
      }
    }
    if (activeFilter.type === "tag") return `#${activeFilter.value}`;
    return "Notes";
  }, [activeFilter, notebooks]);

  const activeNote = useMemo(() => {
    return history.find((h) => h.id === activeNoteId) || null;
  }, [history, activeNoteId]);

  const handleSaveCustomApiConfig = useCallback((newConfig: CustomApiConfig) => {
    setCustomApiConfig(newConfig);
    saveCustomApiConfig(newConfig);
  }, []);

  const saveToHistory = useCallback((savedNotes: string, savedResult: RecapResult) => {
    try {
      const previewText =
        savedResult.summary.slice(0, 95) +
        (savedResult.summary.length > 95 ? "…" : "");
      const firstLine = savedNotes.trim().split("\n")[0].replace(/^[#\s*>-]+/, "").trim();
      const extractedTitle = firstLine.slice(0, 50) || "Untitled Note";
      const currentNoteId = activeNoteIdRef.current;
      const extractedContentTags = extractHashtags(savedNotes);

      const newItem: HistoryItem = {
        id: currentNoteId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        preview: previewText,
        notes: savedNotes,
        result: savedResult,
        status: "sedang-dipelajari",
        pinned: false,
        notebook: "Inbox",
        tags: extractedContentTags.length > 0 ? extractedContentTags : [],
        title: extractedTitle,
      };
      setActiveNoteId(newItem.id);
      setHistory((prev) => {
        const existingItem = prev.find((p) => p.id === newItem.id);
        const activeFilterValue = activeFilterRef.current;
        const resolvedTags =
          existingItem?.tags && existingItem.tags.length > 0
            ? Array.from(new Set([...existingItem.tags, ...extractedContentTags]))
            : extractedContentTags.length > 0
            ? extractedContentTags
            : activeFilterValue.type === "tag"
            ? [activeFilterValue.value]
            : [];
        const resolvedItem: HistoryItem = {
          ...newItem,
          status: existingItem?.status || newItem.status,
          pinned: existingItem?.pinned ?? false,
          notebook: existingItem?.notebook || (activeFilterValue.type === "notebook" ? activeFilterValue.value : "Inbox"),
          tags: resolvedTags,
        };
        const filtered = prev.filter((p) => p.id !== resolvedItem.id && p.notes.trim() !== savedNotes.trim());
        const updated = [resolvedItem, ...filtered].slice(0, 50);
        try {
          localStorage.setItem("ai_recap_history", JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    } catch {
      // Ignore
    }
  }, [activeNoteId]);

  const handleRegenerateQuiz = useCallback(async () => {
    if (!result || !notes.trim()) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error("You appear to be offline. Check internet connection.");
      return;
    }

    setIsRegeneratingQuiz(true);
    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          customConfig: customApiConfig,
          quizCount,
          action: "regenerate_quiz",
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to regenerate questions.");
      }

      const data = await res.json();
      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        const updatedResult = { ...result, quiz: data.quiz };
        setResult(updatedResult);
        fullQuizRef.current = data.quiz;
        setRatings({});
        setOpenIndices([]);
        setActiveCardIndex(0);
        setIsCardFlipped(false);
        updateStorage(notes, updatedResult, {});
        saveToHistory(notes, updatedResult);
        toast.success(`Generated ${data.quiz.length} fresh self-test questions!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not regenerate quiz.");
    } finally {
      setIsRegeneratingQuiz(false);
    }
  }, [result, notes, customApiConfig, saveToHistory]);

  const handleSelectNote = useCallback((item: HistoryItem) => {
    stopSpeech();
    setActiveNoteId(item.id);
    setNotes(item.notes);
    setResult(item.result);
    fullQuizRef.current = item.result.quiz;
    setRatings({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    setQuizViewMode("list");
    setError(null);
    updateStorage(item.notes, item.result, {});
  }, [stopSpeech]);

  const handleNewNote = useCallback(() => {
    stopSpeech();
    const currentNotebook =
      activeFilter.type === "notebook" ? activeFilter.value : "Inbox";
    const initialTags = activeFilter.type === "tag" ? [activeFilter.value] : [];
    const newId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultResult: RecapResult = {
      summary: "Draft note created locally. Use AI Recap to generate a summary.",
      quiz: [],
    };
    const newDraftItem: HistoryItem = {
      id: newId,
      timestamp: Date.now(),
      preview: "Empty draft note...",
      notes: activeFilter.type === "tag" ? `# Untitled Note\n\n#${activeFilter.value} ` : "",
      result: defaultResult,
      status: "belum-direview",
      pinned: false,
      notebook: currentNotebook,
      tags: initialTags,
      title: "Untitled Note",
    };

    setActiveNoteId(newId);
    setNotes(newDraftItem.notes);
    setResult(defaultResult);
    fullQuizRef.current = defaultResult.quiz;
    setRatings({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    setError(null);

    setHistory((prev) => {
      const updated = [newDraftItem, ...prev];
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    updateStorage(newDraftItem.notes, defaultResult, {});
  }, [activeFilter, stopSpeech]);
  handleNewNoteRef.current = handleNewNote;

  const flushActiveNoteToHistory = useCallback((currentNoteId: string | null, currentNotes: string) => {
    if (!currentNoteId) return;
    if (currentNoteId !== activeNoteIdRef.current) return;

    const firstLine = currentNotes.trim().split("\n")[0]?.replace(/^[#\s*>-]+/, "").trim();
    const extractedTitle = firstLine ? firstLine.slice(0, 50) : "Untitled Note";
    const preview = currentNotes.trim().slice(0, 100) || "Empty draft note...";
    const contentTags = extractHashtags(currentNotes);

    setHistory((prev) => {
      const exists = prev.some((p) => p.id === currentNoteId);
      if (!exists) return prev;
      const updated = prev.map((item) => {
        if (item.id !== currentNoteId) return item;
        const currentTags = item.tags || [];
        const mergedTags = Array.from(new Set([...currentTags, ...contentTags]));
        return {
          ...item,
          notes: currentNotes,
          title: extractedTitle,
          preview,
          tags: mergedTags,
          status: item.status || "sedang-dipelajari",
          timestamp: Date.now(),
        };
      });
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const handleAddTag = useCallback((newTag: string) => {
    const clean = normalizeTag(newTag);
    if (!clean || !activeNoteId) return;

    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== activeNoteId) return item;
        const currentTags = item.tags || [];
        if (currentTags.includes(clean)) return item;
        return {
          ...item,
          tags: [...currentTags, clean],
        };
      });
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Added tag: #${clean}`);
  }, [activeNoteId]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const clean = normalizeTag(tagToRemove);
    if (!clean || !activeNoteId) return;

    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== activeNoteId) return item;
        const currentTags = item.tags || [];
        return {
          ...item,
          tags: currentTags.filter((t) => t.toLowerCase() !== clean),
        };
      });
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Strip hashtag symbol `#tag` from current note text to avoid auto-restoring on next keystroke
    setNotes((prevNotes) => {
      const regex = new RegExp(`(^|\\s)#${clean}(?=\\s|$|[.,!?;:])`, "gi");
      return prevNotes.replace(regex, `$1${clean}`);
    });

    toast.success(`Removed tag: #${clean}`);
  }, [activeNoteId]);

  const handleCreateTagFromSidebar = useCallback((tagName: string) => {
    const clean = normalizeTag(tagName);
    if (!clean) return;
    setActiveFilter({ type: "tag", value: clean });

    const newId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    const defaultResult: RecapResult = {
      summary: "Draft note created locally. Use AI Recap to generate a summary.",
      quiz: [],
    };
    const newDraftItem: HistoryItem = {
      id: newId,
      timestamp: Date.now(),
      preview: "Empty draft note...",
      notes: `# ${capitalized}\n\n#${clean} `,
      result: defaultResult,
      status: "belum-direview",
      pinned: false,
      notebook: "Inbox",
      tags: [clean],
      title: capitalized,
    };

    setActiveNoteId(newId);
    setNotes(newDraftItem.notes);
    setResult(null);
    fullQuizRef.current = null;
    setRatings({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    setError(null);

    setHistory((prev) => {
      const updated = [newDraftItem, ...prev];
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Created tag #${clean}`);
  }, []);

  // Sync draft to history on tab unload so no keystrokes are lost
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (historySyncTimerRef.current) {
        clearTimeout(historySyncTimerRef.current);
      }
      if (activeNoteIdRef.current && notesDataRef.current) {
        flushActiveNoteToHistory(activeNoteIdRef.current, notesDataRef.current);
        updateStorage(notesDataRef.current, resultDataRef.current, {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (historySyncTimerRef.current) {
        clearTimeout(historySyncTimerRef.current);
      }
    };
  }, [flushActiveNoteToHistory]);

  // Keep activeNoteId continuously synchronized to localStorage
  useEffect(() => {
    try {
      if (activeNoteId) {
        localStorage.setItem("ai_recap_active_note_id", activeNoteId);
      } else {
        localStorage.removeItem("ai_recap_active_note_id");
      }
    } catch {}
  }, [activeNoteId]);

  const handleNotesChange = useCallback(
    (val: string) => {
      setNotes(val);
      if (error) setError(null);

      // Debounced sync to history (350ms) to ensure 60fps+ fluid typing
      if (activeNoteId) {
        if (historySyncTimerRef.current) {
          clearTimeout(historySyncTimerRef.current);
        }
        historySyncTimerRef.current = setTimeout(() => {
          flushActiveNoteToHistory(activeNoteId, val);
          updateStorage(val, resultDataRef.current, {});
        }, 350);
      }
    },
    [activeNoteId, error, flushActiveNoteToHistory]
  );

  const handleMoveNotebook = useCallback((noteId: string, notebookId: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === noteId ? { ...item, notebook: notebookId } : item
      );
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Moved note to "${notebookId}"`);
  }, []);

  const handleAddNotebook = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const newNb: NotebookItem = {
      id: trimmed.toLowerCase().replace(/\s+/g, "-"),
      label: trimmed,
    };
    setNotebooks((prev) => {
      if (prev.some((n) => n.id === newNb.id)) return prev;
      const updated = [...prev, newNb];
      try {
        localStorage.setItem("ai_recap_notebooks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Notebook "${trimmed}" created!`);
  }, []);

  const handleRenameNotebook = useCallback((id: string, newLabel: string) => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    setNotebooks((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, label: trimmed } : n));
      try {
        localStorage.setItem("ai_recap_notebooks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Notebook renamed to "${trimmed}"`);
  }, []);

  const handleDeleteNotebook = useCallback((id: string) => {
    if (id === "Inbox") return;
    setNotebooks((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem("ai_recap_notebooks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.notebook === id ? { ...item, notebook: "Inbox" } : item
      );
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (activeFilter.type === "notebook" && activeFilter.value === id) {
      setActiveFilter({ type: "all" });
    }
  }, [activeFilter]);

  const handleApplyTemplate = useCallback((templateId: string) => {
    const tmpl = STUDY_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    stopSpeech();
    const currentNotebook =
      activeFilter.type === "notebook" ? activeFilter.value : "Inbox";
    const newId = `template-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultResult: RecapResult = {
      summary: `Template: ${tmpl.name}. Use AI Recap to generate a summary.`,
      quiz: [],
    };
    const newTemplateItem: HistoryItem = {
      id: newId,
      timestamp: Date.now(),
      preview: `[Template] ${tmpl.name}…`,
      notes: tmpl.content,
      result: defaultResult,
      status: "belum-direview",
      pinned: false,
      notebook: currentNotebook,
      tags: ["template", tmpl.iconType],
      title: tmpl.name,
    };

    setActiveNoteId(newId);
    setNotes(tmpl.content);
    setResult(defaultResult);
    fullQuizRef.current = defaultResult.quiz;
    setError(null);
    setRatings({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);

    setHistory((prev) => {
      const updated = [newTemplateItem, ...prev];
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    updateStorage(tmpl.content, defaultResult, {});
    toast.success(`Applied "${tmpl.name}" template`);
  }, [activeFilter, stopSpeech]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    handleSelectNote(item);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, [handleSelectNote]);

  function handleDeleteHistoryItem(id: string) {
    if (historySyncTimerRef.current) {
      clearTimeout(historySyncTimerRef.current);
      historySyncTimerRef.current = null;
    }

    const deletedItem = history.find((item) => item.id === id);
    let remaining: HistoryItem[] = [];
    setHistory((prev) => {
      remaining = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(remaining));
      } catch {
        // Ignore
      }
      return remaining;
    });

    if (deletedItem) {
      const remainingTexts = remaining.map((item) => item.notes || "").filter(Boolean);
      cleanupOrphanedImages(remainingTexts).catch(() => {});
    }

    // If the deleted note was currently active, switch to next note or clear editor cleanly
    if (activeNoteIdRef.current === id) {
      if (remaining.length > 0) {
        const nextNote = remaining[0];
        setActiveNoteId(nextNote.id);
        setNotes(nextNote.notes);
        setResult(nextNote.result);
        fullQuizRef.current = nextNote.result?.quiz || null;
        setRatings({});
        setOpenIndices([]);
        setActiveCardIndex(0);
        setIsCardFlipped(false);
        setError(null);
        updateStorage(nextNote.notes, nextNote.result, {});
      } else {
        setActiveNoteId(null);
        setNotes("");
        setResult(null);
        fullQuizRef.current = null;
        setRatings({});
        setOpenIndices([]);
        setActiveCardIndex(0);
        setIsCardFlipped(false);
        setError(null);
        updateStorage("", null, {});
      }
    }
  }

  function handleDuplicateHistoryItem(item: HistoryItem) {
    const newId = crypto.randomUUID();
    const newTimestamp = Date.now();
    const duplicateItem: HistoryItem = {
      ...item,
      id: newId,
      timestamp: newTimestamp,
      title: item.title ? `${item.title} (copy)` : "Untitled Note (copy)",
      pinned: false,
    };
    setHistory((prev) => {
      const updated = [duplicateItem, ...prev];
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    toast.success("Note duplicated");
  }

  const handleClearAllHistory = useCallback(() => {
    if (historySyncTimerRef.current) {
      clearTimeout(historySyncTimerRef.current);
      historySyncTimerRef.current = null;
    }
    setHistory([]);
    setActiveNoteId(null);
    setNotes("");
    setResult(null);
    fullQuizRef.current = null;
    setRatings({});
    setOpenIndices([]);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    setError(null);
    try {
      localStorage.removeItem("ai_recap_history");
      localStorage.removeItem("ai_recap_saved_state");
    } catch {
      // Ignore
    }
    cleanupOrphanedImages([]).catch(() => {});
    toast.success("All notes cleared");
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      );
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const handleChangeStatus = useCallback((id: string, status: StudyStatus) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, status } : item
      );
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const handleSaveDraft = useCallback(() => {
    if (!notes.trim()) return;
    const firstLine = notes.trim().split("\n")[0].replace(/^[#\s*>-]+/, "").trim();
    const draftId = activeNoteId || `draft-${Date.now()}`;

    setHistory((prev) => {
      const existingItem = prev.find((h) => h.id === draftId);
      const draftItem: HistoryItem = {
        id: draftId,
        timestamp: Date.now(),
        preview: `[Draft] ${notes.trim().slice(0, 90)}${notes.trim().length > 90 ? "…" : ""}`,
        notes,
        result: result || {
          summary: "Note saved locally as a draft. Not yet recapped with AI.",
          quiz: [],
        },
        status: existingItem?.status || "belum-direview",
        pinned: existingItem?.pinned ?? false,
        notebook: existingItem?.notebook || "Inbox",
        tags: existingItem?.tags || ["draft"],
        title: firstLine.slice(0, 50) || "Untitled Note",
      };
      setActiveNoteId(draftId);
      const filtered = prev.filter((p) => p.id !== draftId);
      const updated = [draftItem, ...filtered].slice(0, 50);
      try {
        localStorage.setItem("ai_recap_history", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    toast.success("Note saved to Inkdrop history (0 AI tokens)");
  }, [notes, result, activeNoteId]);

  useEffect(() => {
    handleSaveDraftRef.current = handleSaveDraft;
  }, [handleSaveDraft]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportNoteMarkdown = useCallback(() => {
    if (!notes.trim()) {
      toast.info("No active note to export");
      return;
    }
    const currentItem = history.find((h) => h.id === activeNoteId);
    const title =
      currentItem?.title ||
      notes.trim().split("\n")[0].replace(/^[#\s*>-]+/, "").slice(0, 40).trim() ||
      "Note";
    const dateStr = new Date(currentItem?.timestamp || Date.now()).toISOString();
    const notebook = currentItem?.notebook || "Inbox";
    const tags = currentItem?.tags || [];

    const yamlFrontmatter = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `notebook: ${JSON.stringify(notebook)}`,
      `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`,
      `date: ${JSON.stringify(dateStr)}`,
      "---",
      "",
      notes.trim(),
      "",
    ].join("\n");

    const blob = new Blob([yamlFrontmatter], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const sanitizedTitle =
      title.replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_").toLowerCase() || "note";
    a.download = `${sanitizedTitle}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Note exported as Markdown (.md)");
  }, [notes, history, activeNoteId]);

  const handleCopyShareLink = useCallback(async () => {
    if (!result) return;
    try {
      const truncatedQuiz = result.quiz
        .slice(0, 6)
        .map((q) => ({
          question: String(q.question).slice(0, 300),
          answer: String(q.answer).slice(0, 500),
        }));
      const truncatedResult = {
        summary: String(result.summary).slice(0, 1000),
        quiz: truncatedQuiz,
      };
      const shareNotes = notes
        .slice(0, 500)
        .replace(/!\[[^\]]*\]\(image:\d+\)/g, "[image]")
        .trim();
      const payload = {
        notes: shareNotes,
        result: truncatedResult,
      };
      const encoded = encodeURIComponent(
        btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
      );
      const shareUrl = `${window.location.origin}${window.location.pathname}#recap=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied! Openable anywhere with 0 AI tokens.");
    } catch {
      // Fallback
    }
  }, [result, notes]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "AI Recap — Study Summary & Self-Test",
          text: `Summary:\n${result.summary}\n\nGenerated with AI Recap (ai-recap.rth.my.id)`,
          url: "https://ai-recap.rth.my.id",
        });
      } catch {
        handleCopyShareLink();
      }
    } else {
      handleCopyShareLink();
    }
  }, [result, handleCopyShareLink]);

  const handleRecap = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("You appear to be offline. Please check your internet connection.");
      return;
    }

    if (notes.trim().length < 40) {
      setError("Paste a bit more text first \u2014 at least a few sentences (min 40 characters).");
      return;
    }

    stopSpeech();
    setLoading(true);
    setError(null);
    setResult(null);
    setOpenIndices([]);
    setRatings({});
    setSrMessage("Generating AI recap, please wait...");

    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes,
            customConfig: customApiConfig,
            recapMode,
            quizCount,
          }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong on the server.");
      }

      const data: RecapResult = await res.json();
      setResult(data);
      setIsCompanionOpen(true);
      fullQuizRef.current = data.quiz;
      updateStorage(notes, data, {});
      saveToHistory(notes, data);
      recordStudyActivity();
      setSrMessage(`Recap generated. Summary and ${data.quiz.length} questions ready.`);

      const remainingHeader = res.headers.get("X-Daily-Remaining");
      if (remainingHeader !== null) {
        const rem = parseInt(remainingHeader, 10);
        if (!isNaN(rem)) {
          setDailyRemaining(rem);
          try {
            const today = new Date().toISOString().slice(0, 10);
            localStorage.setItem(
              "ai_recap_daily_quota",
              JSON.stringify({ date: today, remaining: rem, maxQuota: 10 })
            );
          } catch {
            // Ignore
          }
        }
      }

      if (typeof document !== "undefined") {
        (document.activeElement as HTMLElement)?.blur();
      }
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      if (
        err instanceof TypeError &&
        (err.message.toLowerCase().includes("fetch") ||
          err.message.toLowerCase().includes("network"))
      ) {
        setError(
          "Network connection was interrupted. Please check your internet signal and try again."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Could not generate a recap. Try again."
        );
        setSrMessage("Recap failed. " + (err instanceof Error ? err.message : "Please try again."));
      }
    } finally {
      setLoading(false);
    }
  }, [notes, customApiConfig, stopSpeech, saveToHistory, recordStudyActivity]);

  const reviewedCount = Object.keys(ratings).length;
  const knownCount = Object.values(ratings).filter((r) => r === "known").length;

  // === Stable callback references for memo'd child components (prevents re-render on keystroke) ===
  const handleFlipCard = useCallback(() => setIsCardFlipped((f) => !f), []);
  const handleCloseCompanion = useCallback(() => setIsCompanionOpen(false), []);
  const handleOpenShortcuts = useCallback(() => setShowShortcuts(true), []);
  const handleOpenSettings = useCallback(() => setShowCustomApiModal(true), []);
  const handleOpenAppearance = useCallback(() => setShowAppearanceModal(true), []);
  const handleOpenCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []);
  const handleLoadSample = useCallback(() => { setNotes(SAMPLE_NOTE); setError(null); }, []);
  const handleOpenHistory = useCallback(() => {
    setActiveFilter({ type: "all" });
    setIsMobileNavOpen(true);
    setMobileNavTab("notes");
  }, []);
  const handleToggleCompanion = useCallback(() => setIsCompanionOpen((v) => !v), []);
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), []);
  const handleSelectTag = useCallback((tag: string) => setActiveFilter({ type: "tag", value: tag }), []);
  const handleNotesInputStatus = useCallback((newStatus: StudyStatus) => {
    if (activeNoteIdRef.current) {
      handleChangeStatus(activeNoteIdRef.current, newStatus);
    }
  }, [handleChangeStatus]);
  const handleNotesInputMoveNotebook = useCallback((nbId: string) => {
    if (activeNoteIdRef.current) {
      handleMoveNotebook(activeNoteIdRef.current, nbId);
    }
  }, [handleMoveNotebook]);
  const handleCloseMobileNav = useCallback(() => setIsMobileNavOpen(false), []);

  // Mobile-specific callbacks (wrap with mobile nav close)
  const handleMobileSelectNote = useCallback((item: HistoryItem) => {
    handleSelectNote(item);
    setIsMobileNavOpen(false);
  }, [handleSelectNote]);
  const handleMobileNewNote = useCallback(() => {
    handleNewNote();
    setIsMobileNavOpen(false);
  }, [handleNewNote]);
  const handleMobileSelectTag = useCallback((tag: string) => {
    setActiveFilter({ type: "tag", value: tag });
    setIsMobileNavOpen(false);
  }, []);
  const handleMobileOpenCommandPalette = useCallback(() => {
    setIsMobileNavOpen(false);
    setIsCommandPaletteOpen(true);
  }, []);
  const handleMobileSelectFilter = useCallback((filter: NavFilterType) => {
    setActiveFilter(filter);
    setMobileNavTab("notes");
  }, []);
  const handleMobileApplyTemplate = useCallback((templateId: string) => {
    handleApplyTemplate(templateId);
    setIsMobileNavOpen(false);
  }, [handleApplyTemplate]);
  const handleMobileOpenShortcuts = useCallback(() => {
    setIsMobileNavOpen(false);
    setShowShortcuts(true);
  }, []);
  const handleMobileOpenSettings = useCallback(() => {
    setIsMobileNavOpen(false);
    setShowCustomApiModal(true);
  }, []);
  const handleMobileOpenAppearance = useCallback(() => {
    setIsMobileNavOpen(false);
    setShowAppearanceModal(true);
  }, []);
  const handleMobileAddTag = useCallback((tag: string) => {
    handleCreateTagFromSidebar(tag);
    setIsMobileNavOpen(false);
  }, [handleCreateTagFromSidebar]);
  // === End stable callback references ===

  const [srMessage, setSrMessage] = useState("");

  return (
    <ErrorBoundary draftText={notes} fallbackTitle="Workstation Fault Isolated">
      {/* ── MODE PICKER SPLASH (first-time users only) ── */}
      {showModePicker && (
        <div className="fixed inset-0 z-[9999] bg-app-bg flex flex-col items-center justify-center px-4 py-10 overflow-y-auto">
          {/* Logo + greeting */}
          <div className="text-center mb-8 space-y-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src="/android-chrome-192x192.png"
                alt="AI Recap"
                width={48}
                height={48}
                className="rounded-xl shadow-lg"
              />
              <h1 className="font-serif text-3xl sm:text-4xl font-bold italic text-ink-50">AI Recap</h1>
            </div>
            <p className="text-sm text-ink-400 max-w-xs mx-auto leading-relaxed">
              Choose your preferred layout before getting started.
            </p>
            <p className="text-xs text-ink-600">
              You can switch between modes anytime from the top bar or Settings.
            </p>
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {/* Simple Mode Card */}
            <button
              type="button"
              onClick={() => handlePickMode("simple")}
              className="group text-left rounded-2xl border-2 border-app-border bg-app-card hover:border-highlight hover:bg-highlight/5 transition-all p-6 space-y-4 focus:outline-none focus:ring-2 focus:ring-highlight active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-highlight/15 border border-highlight/30 flex items-center justify-center text-highlight flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink-50 group-hover:text-highlight transition-colors">Simple Mode</h2>
                  <p className="text-xs text-ink-500">Fast & distraction-free</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-ink-300">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Paste notes → one-click AI Recap
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Summary & self-test questions inline below
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Optimized for quick study & mobile reading
                </li>
                <li className="flex items-start gap-2 text-ink-500">
                  <svg className="w-4 h-4 text-ink-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Minimal: no sidebars, flashcards, or complex editor
                </li>
              </ul>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-highlight text-highlight-text text-xs font-bold group-hover:bg-highlight-hover transition-colors">
                  Start with Simple
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>

            {/* Workstation Mode Card */}
            <button
              type="button"
              onClick={() => handlePickMode("workstation")}
              className="group text-left rounded-2xl border-2 border-app-border bg-app-card hover:border-highlight hover:bg-highlight/5 transition-all p-6 space-y-4 focus:outline-none focus:ring-2 focus:ring-highlight active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-800 border border-ink-700 flex items-center justify-center text-ink-300 group-hover:text-highlight group-hover:bg-highlight/15 group-hover:border-highlight/30 flex-shrink-0 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink-50 group-hover:text-highlight transition-colors">Workstation Mode</h2>
                  <p className="text-xs text-ink-500">Full study IDE & workspace</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-ink-300">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Markdown editor + live KaTeX split preview
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Note library, notebooks & tag organization
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Flashcards, retention score & study history
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  LaTeX math, Mermaid diagrams & PDF/MD export
                </li>
              </ul>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-800 text-ink-200 text-xs font-bold border border-ink-700 group-hover:bg-highlight group-hover:text-highlight-text group-hover:border-highlight transition-colors">
                  Start with Workstation
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          </div>

          <p className="mt-6 text-[11px] text-ink-700 text-center">
            Built with Next.js · Deployed on Tencent EdgeOne Makers
          </p>
        </div>
      )}

      {/* ── SIMPLE MODE ── */}
      {!showModePicker && appMode === "simple" && (
        <>
          <SimpleModeView
            notes={notes}
            onNotesChange={handleNotesChange}
            loading={loading}
            error={error}
            result={result}
            onRecap={handleRecap}
            onClear={handleClear}
            onLoadSample={handleLoadSample}
            dailyRemaining={dailyRemaining}
            customApiConfig={customApiConfig}
            recapMode={recapMode}
            onSetRecapMode={setRecapMode}
            quizCount={quizCount}
            onSetQuizCount={setQuizCount}
            ratings={ratings}
            onRate={handleRate}
            onSwitchToWorkstation={handleSwitchToWorkstation}
            onOpenSettings={handleOpenSettings}
            onOpenAppearance={handleOpenAppearance}
          />
          {/* Modals still need to be available in simple mode */}
          <CustomApiModal
            isOpen={showCustomApiModal}
            onClose={() => setShowCustomApiModal(false)}
            config={customApiConfig}
            onSave={handleSaveCustomApiConfig}
          />
          <AppearanceModal
            isOpen={showAppearanceModal}
            onClose={() => setShowAppearanceModal(false)}
            appearance={appearance}
            activeColors={activeColors}
            onSelectTheme={setTheme}
            onUpdateCustomTheme={setCustomTheme}
            onSelectEditorFont={setEditorFont}
            onSelectUIFont={setUIFont}
            onSetCustomSystemFont={setCustomSystemFont}
            onSelectFontSize={setFontSize}
            onReset={resetAppearance}
          />
        </>
      )}

      {/* ── WORKSTATION MODE ── */}
      {!showModePicker && appMode === "workstation" && (
      <div className="h-[100dvh] w-screen flex flex-col bg-app-bg text-ink-100 overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:text-black">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{srMessage}</div>
      {/* Mobile Top App Bar (< lg) */}
      <header className="lg:hidden h-11 px-3 flex items-center justify-between border-b border-ink-800/80 bg-app-sidebar flex-shrink-0 select-none print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="p-1 rounded-md text-ink-300 hover:text-ink-50 hover:bg-ink-800 transition-colors"
            title="Open Navigation & Notes"
            aria-label="Open Navigation & Notes"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <Image
            src="/android-chrome-192x192.png"
            alt="AI Recap Logo"
            width={20}
            height={20}
            className="rounded"
          />
          <span className="font-serif font-bold text-sm text-ink-100">AI Recap</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNewNote}
            className="px-2 py-1 rounded bg-highlight text-highlight-text text-xs font-semibold hover:bg-highlight-hover transition-colors flex items-center gap-1 shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New</span>
          </button>
          <StudyStreakBadge streak={studyStreak} />
          <OfflineBadge isOnline={isOnline} />
          <StorageIndicator />
          {/* Recap Mode — pill toggle */}
          <div className="flex items-center rounded-md border border-ink-700 overflow-hidden flex-shrink-0">
            {(["detailed", "brief"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setRecapMode(mode)}
                className={`px-2 py-0.5 text-[10px] font-semibold transition-colors capitalize ${
                  recapMode === mode
                    ? "bg-highlight text-highlight-text font-semibold"
                    : "text-ink-400 hover:text-ink-200 bg-ink-900"
                }`}
                title={`Recap Mode: ${mode}`}
              >
                {mode === "detailed" ? "Detail" : "Brief"}
              </button>
            ))}
          </div>
          {/* Quiz Count — pill toggle */}
          <div className="flex items-center rounded-md border border-ink-700 overflow-hidden flex-shrink-0">
            {([3, 5, 10] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuizCount(count)}
                className={`px-1.5 py-0.5 text-[10px] font-semibold font-mono transition-colors ${
                  quizCount === count
                    ? "bg-highlight text-highlight-text font-semibold"
                    : "text-ink-400 hover:text-ink-200 bg-ink-900"
                }`}
                title={`Quiz Questions: ${count}`}
              >
                {count}
              </button>
            ))}
          </div>
          {/* Switch to Simple Mode */}
          <button
            type="button"
            onClick={handleSwitchToSimple}
            className="p-1.5 rounded text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors flex-shrink-0"
            title="Switch to Simple Mode"
            aria-label="Switch to Simple Mode"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Inkdrop Workstation 4-Column Body */}
      <div className="flex-1 flex overflow-hidden relative print:hidden">
        {/* Column 1: Navigation Sidebar (Desktop) */}
        <div
          className={`hidden lg:flex flex-shrink-0 h-full transition-all duration-75 ${
            isSidebarOpen ? "" : "w-0 overflow-hidden border-none"
          }`}
          style={{ width: isSidebarOpen ? `${sidebarWidth}px` : 0 }}
        >
          <InkdropNavigation
            width={sidebarWidth}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            totalNotes={history.length}
            statusCounts={statusCounts}
            notebookCounts={notebookCounts}
            tagCounts={tagCounts}
            notebooks={notebooks}
            onAddNotebook={handleAddNotebook}
            onRenameNotebook={handleRenameNotebook}
            onDeleteNotebook={handleDeleteNotebook}
            onApplyTemplate={handleApplyTemplate}
            onClearAll={handleClearAllHistory}
            onOpenShortcuts={handleOpenShortcuts}
            onOpenSettings={handleOpenSettings}
            onOpenAppearance={handleOpenAppearance}
            customApiConfig={customApiConfig}
            onAddTag={handleCreateTagFromSidebar}
          />
        </div>

        {/* Resizer Divider between Col 1 and Col 2 */}
        {isSidebarOpen && (
          <div className="hidden lg:flex h-full">
            <ResizerDivider
              onMouseDown={(e) => startResizing("col1", e)}
              onDoubleClick={() => resetWidth("col1")}
              isActive={activeResizer === "col1"}
            />
          </div>
        )}

        {/* Mobile Slide-Over Drawer for Nav + Note List */}
        {isMobileNavOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex lg:hidden bg-black/75 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <div
              className="flex flex-col sm:flex-row h-full w-[88vw] max-w-sm sm:max-w-none sm:w-[560px] shadow-2xl animate-slide-right overflow-hidden bg-app-sidebar border-r border-ink-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Phone Tab Switcher (< sm) with SVG Icons */}
              <div className="sm:hidden h-11 px-2.5 bg-app-bg border-b border-ink-800/80 flex items-center justify-between gap-2 flex-shrink-0">
                <div className="inline-flex rounded-md bg-ink-900 p-0.5 border border-ink-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setMobileNavTab("nav")}
                    className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
                      mobileNavTab === "nav"
                        ? "bg-highlight text-highlight-text font-semibold shadow-xs"
                        : "text-ink-400 hover:text-ink-200"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span>Categories</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileNavTab("notes")}
                    className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
                      mobileNavTab === "notes"
                        ? "bg-highlight text-highlight-text font-semibold shadow-xs"
                        : "text-ink-400 hover:text-ink-200"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Notes ({filteredHistory.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1 rounded text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
                    title="Close Menu"
                    aria-label="Close Menu"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Navigation Pane */}
              <div
                className={`h-full flex-col ${
                  mobileNavTab === "nav" ? "flex flex-1" : "hidden sm:flex sm:w-64 sm:border-r sm:border-ink-800"
                }`}
              >
                <InkdropNavigation
                  hideHeader={true}
                  activeFilter={activeFilter}
                  onSelectFilter={handleMobileSelectFilter}
                  totalNotes={history.length}
                  statusCounts={statusCounts}
                  notebookCounts={notebookCounts}
                  tagCounts={tagCounts}
                  notebooks={notebooks}
                  onAddNotebook={handleAddNotebook}
                  onRenameNotebook={handleRenameNotebook}
                  onDeleteNotebook={handleDeleteNotebook}
                  onApplyTemplate={handleMobileApplyTemplate}
                  onClearAll={handleClearAllHistory}
                  onOpenShortcuts={handleMobileOpenShortcuts}
                  onOpenSettings={handleMobileOpenSettings}
                  onOpenAppearance={handleMobileOpenAppearance}
                  customApiConfig={customApiConfig}
                  onCloseMobile={handleCloseMobileNav}
                  onAddTag={handleMobileAddTag}
                />
              </div>

              {/* Note List Pane */}
              <div
                className={`h-full flex-col ${
                  mobileNavTab === "notes" ? "flex flex-1" : "hidden sm:flex sm:flex-1"
                }`}
              >
                <InkdropNoteList
                  hideHeader={true}
                  items={filteredHistory}
                  activeNoteId={activeNoteId}
                  categoryTitle={categoryTitle}
                  onSelectNote={handleMobileSelectNote}
                  onNewNote={handleMobileNewNote}
                  onTogglePin={handleTogglePin}
                  onDeleteNote={handleDeleteHistoryItem}
                  onChangeStatus={handleChangeStatus}
                  notebooks={notebooks}
                  onMoveNotebook={handleMoveNotebook}
                  onSelectTag={handleMobileSelectTag}
                  onOpenCommandPalette={handleMobileOpenCommandPalette}
                />
              </div>
            </div>
          </div>
        )}

        {/* Column 2: Note List (Desktop / Tablet) */}
        <div
          className="hidden sm:flex flex-shrink-0 h-full"
          style={{ width: `${noteListWidth}px` }}
        >
          <InkdropNoteList
            width={noteListWidth}
            items={filteredHistory}
            activeNoteId={activeNoteId}
            categoryTitle={categoryTitle}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
            onTogglePin={handleTogglePin}
            onDeleteNote={handleDeleteHistoryItem}
            onChangeStatus={handleChangeStatus}
            notebooks={notebooks}
            onMoveNotebook={handleMoveNotebook}
            onToggleSidebar={handleToggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onSelectTag={handleSelectTag}
            onOpenCommandPalette={handleOpenCommandPalette}
          />
        </div>

        {/* Resizer Divider between Col 2 and Col 3 */}
        <div className="hidden sm:flex h-full">
          <ResizerDivider
            onMouseDown={(e) => startResizing("col2", e)}
            onDoubleClick={() => resetWidth("col2")}
            isActive={activeResizer === "col2"}
          />
        </div>

        {/* Column 3: Center Editor Canvas */}
        <main className="flex-1 h-full flex flex-col min-w-[280px] bg-app-bg overflow-hidden select-text">
          {/* Desktop MenuBar — File | Edit | Insert | View | AI | Settings */}
          <MenuBar
            hasNotes={notes.trim().length > 0}
            charCount={notes.length}
            dailyRemaining={dailyRemaining}
            loading={loading}
            customApiConfig={customApiConfig}
            canUndo={menuBarEditorState.canUndo}
            canRedo={menuBarEditorState.canRedo}
            wordWrap={menuBarEditorState.wordWrap}
            viewMode={menuBarEditorState.viewMode}
            showToc={menuBarEditorState.showToc}
            isCompanionOpen={isCompanionOpen}
            isSidebarOpen={isSidebarOpen}
            isSoundEnabled={menuBarEditorState.isSoundEnabled}
            historyCount={history.length}
            // File
            onNewNote={handleNewNote}
            onSaveDraft={handleSaveDraft}
            onImportFile={() => { syncMenuBarState(); notesInputRef.current?.openFilePicker(); }}
            onExportPdf={handlePrint}
            onExportMarkdown={handleExportNoteMarkdown}
            onClearNote={handleClear}
            // Edit
            onUndo={() => { syncMenuBarState(); notesInputRef.current?.undo(); }}
            onRedo={() => { syncMenuBarState(); notesInputRef.current?.redo(); }}
            onSelectAll={() => { syncMenuBarState(); notesInputRef.current?.selectAll(); }}
            onCopyAll={() => { syncMenuBarState(); notesInputRef.current?.copyAll(); }}
            onToggleWordWrap={() => { notesInputRef.current?.toggleWordWrap(); syncMenuBarState(); }}
            // Insert
            onBold={() => { syncMenuBarState(); notesInputRef.current?.bold(); }}
            onItalic={() => { syncMenuBarState(); notesInputRef.current?.italic(); }}
            onCode={() => { syncMenuBarState(); notesInputRef.current?.code(); }}
            onBulletList={() => { syncMenuBarState(); notesInputRef.current?.bulletList(); }}
            onInsertLink={() => { syncMenuBarState(); notesInputRef.current?.insertLink(); }}
            onInsertImage={() => { syncMenuBarState(); notesInputRef.current?.openImagePicker(); }}
            onOpenTemplates={() => { syncMenuBarState(); notesInputRef.current?.openTemplates(); }}
            onOpenFormulas={() => { syncMenuBarState(); notesInputRef.current?.openFormulas(); }}
            onOpenMermaid={() => { syncMenuBarState(); notesInputRef.current?.openMermaid(); }}
            onLoadSample={handleLoadSample}
            // View
            onSetViewMode={(mode) => { notesInputRef.current?.setViewMode(mode); syncMenuBarState(); }}
            onToggleToc={() => { notesInputRef.current?.toggleToc(); syncMenuBarState(); }}
            onToggleCompanion={handleToggleCompanion}
            onToggleSidebar={handleToggleSidebar}
            onToggleSound={() => { notesInputRef.current?.toggleSound(); syncMenuBarState(); }}
            // AI
            onRecap={handleRecap}
            onOpenHistory={handleOpenHistory}
            // Settings
            onOpenSettings={handleOpenSettings}
            onOpenAppearance={handleOpenAppearance}
            onOpenShortcuts={handleOpenShortcuts}
            onSwitchToSimple={handleSwitchToSimple}
          />
          <NotesInput
            ref={notesInputRef}
            notes={notes}
            loading={loading}
            error={error}
            dailyRemaining={dailyRemaining}
            historyCount={history.length}
            hasResult={!!result}
            onNotesChange={handleNotesChange}
            onSubmit={handleRecap}
            onClear={handleClear}
            onLoadSample={handleLoadSample}
            onOpenHistory={handleOpenHistory}
            onSaveDraft={handleSaveDraft}
            isCompanionOpen={isCompanionOpen}
            onToggleCompanion={handleToggleCompanion}
            studyStatus={activeNote?.status || "sedang-dipelajari"}
            onChangeStatus={handleNotesInputStatus}
            currentNotebookId={activeNote?.notebook || "Inbox"}
            notebooks={notebooks}
            onMoveNotebook={handleNotesInputMoveNotebook}
            onExportPdf={handlePrint}
            onOpenSettings={handleOpenSettings}
            onOpenAppearance={handleOpenAppearance}
            customApiConfig={customApiConfig}
            tags={activeNote?.tags || []}
            allTags={Object.keys(tagCounts)}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onSelectTag={handleSelectTag}
            onSwitchToSimple={handleSwitchToSimple}
          />
        </main>

        {/* Desktop Docked Column 4 (>= xl): Resizer & Study Companion */}
        {isCompanionOpen && (
          <div className="hidden xl:flex h-full flex-shrink-0">
            <ResizerDivider
              onMouseDown={(e) => startResizing("col4", e)}
              onDoubleClick={() => resetWidth("col4")}
              isActive={activeResizer === "col4"}
            />
            <StudyCompanionPane
              width={companionWidth}
              result={result}
              loading={loading}
              error={error}
              ratings={ratings}
              onRate={handleRate}
              quizViewMode={quizViewMode}
              onChangeQuizViewMode={setQuizViewMode}
              activeCardIndex={activeCardIndex}
              onCardIndexChange={setActiveCardIndex}
              isCardFlipped={isCardFlipped}
              onFlipCard={handleFlipCard}
              onResetQuiz={handleResetFullQuiz}
              onRetest={handleRetest}
              onRetestMissed={handleRetestMissed}
              onCopyMissed={handleCopyMissed}
              onRecap={handleRecap}
              onRegenerateQuiz={handleRegenerateQuiz}
              isRegeneratingQuiz={isRegeneratingQuiz}
              onClose={handleCloseCompanion}
              isSpeaking={isSpeaking}
              speechRate={speechRate}
              onToggleSpeech={toggleSpeech}
              onCycleSpeechRate={cycleSpeechRate}
              onCopySummary={handleCopySummary}
              copiedType={copiedType}
              onShare={handleShare}
              onCopyShareLink={handleCopyShareLink}
              onPrint={handlePrint}
              dailyRemaining={dailyRemaining}
              notesLength={notes.trim().length}
              studyStatus={activeNote?.status || "sedang-dipelajari"}
              onChangeStatus={handleNotesInputStatus}
              reviewTimes={reviewTimes}
            />
          </div>
        )}

        {/* Mobile / Tablet Slide-Over Drawer (< xl) */}
        {isCompanionOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex justify-end xl:hidden bg-black/70 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsCompanionOpen(false)}
          >
            <div
              className="w-full sm:w-[420px] h-full shadow-2xl animate-slide-left overflow-hidden flex flex-col bg-app-sidebar"
              onClick={(e) => e.stopPropagation()}
            >
              <StudyCompanionPane
                result={result}
                loading={loading}
                error={error}
                ratings={ratings}
                onRate={handleRate}
                quizViewMode={quizViewMode}
                onChangeQuizViewMode={setQuizViewMode}
                activeCardIndex={activeCardIndex}
                onCardIndexChange={setActiveCardIndex}
                isCardFlipped={isCardFlipped}
                onFlipCard={handleFlipCard}
                onResetQuiz={handleResetFullQuiz}
                onRetest={handleRetest}
                onRetestMissed={handleRetestMissed}
                onCopyMissed={handleCopyMissed}
                onRecap={handleRecap}
                onRegenerateQuiz={handleRegenerateQuiz}
                isRegeneratingQuiz={isRegeneratingQuiz}
                onClose={handleCloseCompanion}
                isSpeaking={isSpeaking}
                speechRate={speechRate}
                onToggleSpeech={toggleSpeech}
                onCycleSpeechRate={cycleSpeechRate}
                onCopySummary={handleCopySummary}
                copiedType={copiedType}
                onShare={handleShare}
                onCopyShareLink={handleCopyShareLink}
                onPrint={handlePrint}
                dailyRemaining={dailyRemaining}
                notesLength={notes.trim().length}
                studyStatus={activeNote?.status || "sedang-dipelajari"}
                onChangeStatus={handleNotesInputStatus}
                reviewTimes={reviewTimes}
              />
            </div>
          </div>
        )}
      </div>

      {/* Complete Printable Study Sheet (Visible only on Print/PDF) */}
      <div className="hidden print:block space-y-6 pt-2 p-8 bg-white text-black min-h-screen">
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl font-bold text-black tracking-tight">
              {activeNote?.title || "Study Note"}
            </h1>
            <span className="text-xs font-mono text-gray-600 uppercase px-2 py-0.5 border border-gray-300 rounded">
              {activeNote?.status === "dikuasai"
                ? "Mastered"
                : activeNote?.status === "perlu-diulang"
                ? "Needs Review"
                : activeNote?.status === "belum-direview"
                ? "Not Reviewed"
                : "In Progress"}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1" suppressHydrationWarning>
            AI Recap &bull; Exported Study Document &bull; {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Note Content (Markdown, Math formulas, Mermaid diagrams) */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-gray-700 border-b border-gray-200 pb-1">
            Note Content
          </h2>
          <div className="text-sm leading-relaxed text-black print:text-black">
            <FormattedText text={notes || "No content."} />
          </div>
        </div>

        {/* AI Recap Section (if generated) */}
        {result && (
          <div className="space-y-5 pt-4 border-t-2 border-gray-300 break-before-auto">
            <div className="border-l-4 border-black pl-4 py-1">
              <h2 className="text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                AI Summary & Key Takeaways
              </h2>
              <div className="text-sm leading-relaxed text-black">
                <FormattedText text={result.summary} />
              </div>
            </div>

            {result.quiz && result.quiz.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-wider font-bold text-gray-700 mb-3">
                  Self-Test Questions &amp; Answers ({result.quiz.length} Items)
                </h2>
                <ol className="space-y-4">
                  {result.quiz.map((item, idx) => (
                    <li
                      key={idx}
                      className="break-inside-avoid page-break-inside-avoid rounded-md border border-gray-300 p-4 bg-white"
                    >
                      <div className="font-semibold text-sm text-black mb-2 flex items-start gap-2">
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                          Q{idx + 1}
                        </span>
                        <div className="flex-1 leading-snug">
                          <FormattedText text={item.question} />
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 bg-gray-50/80 p-3 rounded border border-gray-200 mt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                          Answer / Explanation:
                        </span>
                        <div className="leading-relaxed">
                          <FormattedText text={item.answer} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 text-[11px] text-gray-500 text-center">
          Generated with AI Recap &mdash; Active Recall &amp; Spaced Repetition &bull; https://ai-recap.rth.my.id
        </div>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        history={history}
        notebooks={notebooks}
        allTags={Object.keys(tagCounts)}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onRecap={handleRecap}
        onSaveDraft={handleSaveDraft}
        onExportAnki={handleExportAnki}
        onDownloadTxt={handleDownloadTxt}
        onExportPdf={handlePrint}
        onShareNote={handleShare}
        onToggleCompanion={() => setIsCompanionOpen((v) => !v)}
        onApplyTemplate={handleApplyTemplate}
        onSelectFilter={(f) => setActiveFilter(f)}
        onOpenSettings={() => setShowCustomApiModal(true)}
        onOpenAppearance={() => setShowAppearanceModal(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onOpenBackupRestore={() => setShowBackupRestoreModal(true)}
        onClearNotes={handleClearAllHistory}
      />

      {/* Shortcuts Modal (Atomic Organism) */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Custom AI API Configuration Modal */}
      <CustomApiModal
        isOpen={showCustomApiModal}
        onClose={() => setShowCustomApiModal(false)}
        config={customApiConfig}
        onSave={handleSaveCustomApiConfig}
      />

      {/* Theme & Typography Appearance Modal */}
      <AppearanceModal
        isOpen={showAppearanceModal}
        onClose={() => setShowAppearanceModal(false)}
        appearance={appearance}
        activeColors={activeColors}
        onSelectTheme={setTheme}
        onUpdateCustomTheme={setCustomTheme}
        onSelectEditorFont={setEditorFont}
        onSelectUIFont={setUIFont}
        onSetCustomSystemFont={setCustomSystemFont}
        onSelectFontSize={setFontSize}
        onReset={resetAppearance}
      />

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={showBackupRestoreModal}
        onClose={() => setShowBackupRestoreModal(false)}
      />
      <FindReplaceModal
        isOpen={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        text={notes}
        onReplace={(newText) => {
          setNotes(newText);
          updateStorage(newText, result, ratings);
        }}
      />
      <MergeNotesModal
        isOpen={showMergeNotes}
        onClose={() => setShowMergeNotes(false)}
        notes={history}
        currentNoteId={activeNoteId || ""}
        onMerge={(sourceId, targetId, sep) => {
          const source = history.find((n) => n.id === sourceId);
          const target = history.find((n) => n.id === targetId);
          if (!source || !target) return;
          const merged = target.notes + sep + source.notes;
          setNotes(merged);
          const newHistory = history.map((n) =>
            n.id === targetId ? { ...n, notes: merged, preview: merged.slice(0, 200) } : n
          ).filter((n) => n.id !== sourceId);
          setHistory(newHistory);
          localStorage.setItem("ai_recap_history", JSON.stringify(newHistory));
          setActiveNoteId(targetId);
          updateStorage(merged, target.result, {});
          toast.success("Notes merged successfully!");
        }}
      />
      </div>
      )} {/* end appMode === "workstation" */}
    </ErrorBoundary>
  );
}
