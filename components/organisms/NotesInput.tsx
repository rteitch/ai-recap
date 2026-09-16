"use client";

import { memo, useRef, useState, useMemo, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { countWords } from "@/lib/wordCount";
import { FormattedText } from "@/components/atoms/FormattedText";
import { STUDY_TEMPLATES, StudyTemplate } from "@/lib/templates";
import { LATEX_SUGGESTIONS, LatexSuggestion } from "@/lib/latexAutocomplete";
import { SLASH_COMMANDS, SlashCommand } from "@/lib/slashCommands";
import { generateToc, TocEntry } from "@/lib/generateToc";
import { TocPanel } from "@/components/molecules/TocPanel";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";
import { StudyStatus } from "@/lib/types";
import { StudyStatusDropdown } from "@/components/molecules/StudyStatusDropdown";
import { WelcomeBanner } from "@/components/molecules/WelcomeBanner";
import { MERMAID_TEMPLATES, MermaidCategory } from "@/lib/mermaidTemplates";
import { CustomApiConfig } from "@/lib/ai-config";
import { NoteTagBar } from "@/components/molecules/NoteTagBar";
import { NotebookDropdown, NotebookOption } from "@/components/molecules/NotebookDropdown";
import { toast } from "sonner";
import { storeImage, hasStorageSpace } from "@/lib/imageStorage";

type NotesInputProps = {
  notes: string;
  loading: boolean;
  error: string | null;
  dailyRemaining: number | null;
  historyCount: number;
  hasResult: boolean;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onLoadSample: () => void;
  onOpenHistory: () => void;
  onSaveDraft?: () => void;
  isCompanionOpen?: boolean;
  onToggleCompanion?: () => void;
  studyStatus?: StudyStatus;
  onChangeStatus?: (status: StudyStatus) => void;
  currentNotebookId?: string;
  notebooks?: NotebookOption[];
  onMoveNotebook?: (notebookId: string) => void;
  onExportPdf?: () => void;
  onOpenSettings?: () => void;
  onOpenAppearance?: () => void;
  customApiConfig?: CustomApiConfig;
  tags?: string[];
  allTags?: string[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  onSelectTag?: (tag: string) => void;
};

function renderTemplateIcon(iconType: StudyTemplate["iconType"]) {
  switch (iconType) {
    case "math":
      return (
        <svg className="w-4 h-4 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      );
    case "cornell":
      return (
        <svg className="w-4 h-4 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "lecture":
      return (
        <svg className="w-4 h-4 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "meeting":
      return (
        <svg className="w-4 h-4 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case "mermaid":
      return (
        <svg className="w-4 h-4 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      );
  }
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All (60+)" },
  { id: "math", label: "Fractions & Roots" },
  { id: "calculus", label: "Calculus" },
  { id: "physics", label: "Physics" },
  { id: "algebra", label: "Algebra" },
  { id: "matrix", label: "Matrix" },
  { id: "trigonometry", label: "Trigonometry" },
  { id: "greek", label: "Greek" },
  { id: "logic", label: "Logic & Sets" },
  { id: "symbol", label: "Symbols" },
];

export type NotesInputHandle = {
  undo: () => void;
  redo: () => void;
  // MenuBar integration
  bold: () => void;
  italic: () => void;
  code: () => void;
  bulletList: () => void;
  insertLink: () => void;
  openImagePicker: () => void;
  openFilePicker: () => void;
  openTemplates: () => void;
  openFormulas: () => void;
  openMermaid: () => void;
  selectAll: () => void;
  copyAll: () => void;
  toggleWordWrap: () => void;
  setViewMode: (mode: "edit" | "split" | "preview") => void;
  toggleToc: () => void;
  toggleSound: () => void;
  // State readers
  getState: () => {
    canUndo: boolean;
    canRedo: boolean;
    wordWrap: boolean;
    viewMode: "edit" | "split" | "preview";
    showToc: boolean;
    isSoundEnabled: boolean;
    charCount: number;
  };
};

const NotesInputInner = forwardRef<NotesInputHandle, NotesInputProps>(function NotesInput({
  notes,
  loading,
  error,
  dailyRemaining,
  historyCount,
  hasResult,
  onNotesChange,
  onSubmit,
  onClear,
  onLoadSample,
  onOpenHistory,
  onSaveDraft,
  isCompanionOpen,
  onToggleCompanion,
  studyStatus,
  onChangeStatus,
  currentNotebookId,
  notebooks,
  onMoveNotebook,
  onExportPdf,
  onOpenSettings,
  onOpenAppearance,
  customApiConfig,
  tags,
  allTags,
  onAddTag,
  onRemoveTag,
  onSelectTag,
}: NotesInputProps, ref: React.Ref<NotesInputHandle>) {
  // --- 1. DOM & Timer Refs (Declared first, before any helper or effect) ---
  const activeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const measureMirrorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const templateButtonRef = useRef<HTMLButtonElement>(null);
  const formulaButtonRef = useRef<HTMLButtonElement>(null);
  const mermaidButtonRef = useRef<HTMLButtonElement>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);
  const undoDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotRef = useRef(notes);

  // --- 2. View & UI State ---
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const [textareaInnerWidth, setTextareaInnerWidth] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastEdited, setLastEdited] = useState<Date | null>(null);

  // --- 3. Unified Mutually-Exclusive Toolbar Menu State ---
  const [activeMenu, setActiveMenu] = useState<"template" | "formula" | "mermaid" | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  // --- 4. Modal / Filter / Search State ---
  const [pendingTemplate, setPendingTemplate] = useState<StudyTemplate | null>(null);
  const [formulaSearch, setFormulaSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mermaidCategory, setMermaidCategory] = useState<MermaidCategory>("All");
  const [mermaidSearch, setMermaidSearch] = useState("");

  // --- 5. Undo / Redo Stacks ---
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
    // Formatting
    bold: () => wrapSelection("**", "**"),
    italic: () => wrapSelection("*", "*"),
    code: () => wrapSelection("`", "`"),
    bulletList: () => {
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const before = notes.slice(0, pos);
      const after = notes.slice(pos);
      const prefix = before.endsWith("\n") || before.length === 0 ? "" : "\n";
      const newNotes = before + prefix + "- " + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = pos + prefix.length + 2;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
    },
    insertLink: () => {
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const end = TA.selectionEnd ?? 0;
      const selected = notes.slice(pos, end);
      const before = notes.slice(0, pos);
      const after = notes.slice(end);
      const linkText = selected || "link text";
      const newNotes = before + `[${linkText}](url)` + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const urlStart = pos + linkText.length + 3;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(urlStart, urlStart + 3); setCursorPosition(urlStart); }, 0);
    },
    openImagePicker: () => imageInputRef.current?.click(),
    openFilePicker: () => fileInputRef.current?.click(),
    openTemplates: () => toggleMenu("template"),
    openFormulas: () => toggleMenu("formula"),
    openMermaid: () => toggleMenu("mermaid"),
    selectAll: handleSelectAll,
    copyAll: handleCopyAll,
    toggleWordWrap: () => setWordWrap((w) => !w),
    setViewMode: (mode: "edit" | "split" | "preview") => setViewMode(mode),
    toggleToc: () => setShowToc((v) => !v),
    toggleSound,
    // State readers
    getState: () => ({
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      wordWrap,
      viewMode,
      showToc,
      isSoundEnabled,
      charCount: notes.length,
    }),
  }));

  // --- 6. Editor Cursor & Autocomplete State ---
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);
  const [slashDismissed, setSlashDismissed] = useState(false);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);

  // Active cursor Line and Column for bottom status bar
  const { cursorLine, cursorCol } = useMemo(() => {
    const textBefore = notes.slice(0, cursorPosition);
    const lines = textBefore.split("\n");
    return {
      cursorLine: lines.length,
      cursorCol: lines[lines.length - 1].length + 1,
    };
  }, [notes, cursorPosition]);

  // --- 7. Keyboard Sound Hook ---
  const { isSoundEnabled, toggleSound, playKeyPress, playKeyRelease } = useKeyboardSound();

  // --- 8. Menu Toggle & Close Callbacks ---
  const toggleMenu = useCallback((menu: "template" | "formula" | "mermaid") => {
    setActiveMenu((curr) => {
      if (curr === menu) {
        setMenuPos(null);
        return null;
      }
      const btnRef =
        menu === "template"
          ? templateButtonRef.current
          : menu === "formula"
          ? formulaButtonRef.current
          : mermaidButtonRef.current;
      if (btnRef) {
        const rect = btnRef.getBoundingClientRect();
        const menuWidth = menu === "template" ? 288 : Math.min(384, window.innerWidth - 32);
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 16));
        setMenuPos({ top: rect.bottom + 6, left });
      } else {
        setMenuPos({ top: 60, left: Math.max(12, Math.floor((window.innerWidth - 320) / 2)) });
      }
      return menu;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setActiveMenu(null);
    setMenuPos(null);
  }, []);

  function handleInsertMermaid(code?: string, name = "Diagram") {
    closeMenu();
    const diagramCode =
      code ||
      `\`\`\`mermaid
flowchart TD
    A[Study Topic] --> B[Core Concept 1]
    A --> C[Core Concept 2]
    B --> D[Formula: $E=mc^2$]
    C --> E[Active Recall Test]
\`\`\``;

    const textarea = activeTextareaRef.current;
    if (!textarea) {
      const newNotes = notes ? `${notes}\n\n${diagramCode}\n` : diagramCode;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      setViewMode("split");
      toast.success(`Inserted Mermaid: ${name}`);
      return;
    }
    const start = textarea.selectionStart ?? notes.length;
    const end = textarea.selectionEnd ?? notes.length;
    const before = notes.slice(0, start);
    const after = notes.slice(end);
    const needsNewlineBefore = before.length > 0 && !before.endsWith("\n\n");
    const prefix = needsNewlineBefore ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const insertion = `${prefix}${diagramCode}\n\n`;
    const newNotes = before + insertion + after;
    onNotesChange(newNotes);
    recordUndo(newNotes);
    setViewMode("split");
    toast.success(`Inserted Mermaid: ${name}`);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 30);
  }

  const tocEntries = useMemo(() => generateToc(notes), [notes]);

  const slashTrigger = useMemo(() => {
    if (cursorPosition < 0 || cursorPosition > notes.length) return null;
    const textBefore = notes.slice(0, cursorPosition);
    const lastLineBreak = textBefore.lastIndexOf("\n");
    const lineText = lastLineBreak === -1 ? textBefore : textBefore.slice(lastLineBreak + 1);
    const slashMatch = lineText.match(/^\/([a-zA-Z0-9]*)$/);
    if (!slashMatch) return null;
    return {
      query: slashMatch[1],
      matchStart: lastLineBreak === -1 ? 0 : lastLineBreak + 1,
      matchEnd: cursorPosition,
    };
  }, [notes, cursorPosition]);

  const slashCommandState = useMemo(() => {
    if (slashDismissed) return null;
    return slashTrigger;
  }, [slashDismissed, slashTrigger]);

  useEffect(() => {
    setSlashDismissed(false);
  }, [notes, cursorPosition]);

  const filteredSlashCommands = useMemo(() => {
    if (!slashCommandState) return [];
    const q = slashCommandState.query.toLowerCase().trim();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [slashCommandState]);

  const filteredMermaidTemplates = useMemo(() => {
    let list = MERMAID_TEMPLATES;
    if (mermaidCategory !== "All") {
      list = list.filter((item) => item.category === mermaidCategory);
    }
    if (mermaidSearch.trim()) {
      const q = mermaidSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [mermaidCategory, mermaidSearch]);

  // Debounced undo recording to eliminate typing lag and unnecessary re-renders
  const recordUndo = useCallback((newText: string) => {
    if (newText === lastSnapshotRef.current) return;
    if (undoDebounceTimerRef.current) {
      clearTimeout(undoDebounceTimerRef.current);
    }
    undoDebounceTimerRef.current = setTimeout(() => {
      setUndoStack((prev) => [...prev.slice(-30), lastSnapshotRef.current]);
      setRedoStack([]);
      lastSnapshotRef.current = newText;
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (undoDebounceTimerRef.current) {
        clearTimeout(undoDebounceTimerRef.current);
      }
    };
  }, []);

  function handleUndo() {
    if (undoDebounceTimerRef.current) {
      clearTimeout(undoDebounceTimerRef.current);
      undoDebounceTimerRef.current = null;
    }
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev.slice(-30), notes]);
    lastSnapshotRef.current = previous;
    onNotesChange(previous);
  }

  function handleRedo() {
    if (undoDebounceTimerRef.current) {
      clearTimeout(undoDebounceTimerRef.current);
      undoDebounceTimerRef.current = null;
    }
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev.slice(-30), notes]);
    lastSnapshotRef.current = next;
    onNotesChange(next);
  }

  function fallbackCopyText(text: string): boolean {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      return success;
    } catch {
      return false;
    }
  }

  function handleCopyAll() {
    if (!notes) return;
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(notes)
        .then(() => {
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2000);
        })
        .catch(() => {
          const ok = fallbackCopyText(notes);
          if (ok) {
            setCopiedToast(true);
            setTimeout(() => setCopiedToast(false), 2000);
          }
        });
    } else {
      const ok = fallbackCopyText(notes);
      if (ok) {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      }
    }
  }

  function handleSelectAll() {
    if (viewMode === "preview") {
      setViewMode("edit");
    }
    setTimeout(() => {
      const ta = activeTextareaRef.current;
      if (ta) {
        ta.focus();
        ta.select();
      }
    }, 50);
  }

  function wrapSelection(prefix: string, suffix: string) {
    const TA = activeTextareaRef.current;
    if (!TA) return;
    const pos = TA.selectionStart ?? 0;
    const end = TA.selectionEnd ?? 0;
    const selected = notes.slice(pos, end);
    const before = notes.slice(0, pos);
    const after = notes.slice(end);
    if (selected) {
      const newNotes = before + prefix + selected + suffix + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      setTimeout(() => {
        TA.focus();
        TA.setSelectionRange(pos + prefix.length, end + prefix.length);
        setCursorPosition(end + prefix.length);
      }, 0);
    } else {
      const placeholder = "text";
      const newNotes = before + prefix + placeholder + suffix + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = pos + prefix.length;
      setTimeout(() => {
        TA.focus();
        TA.setSelectionRange(newPos, newPos + placeholder.length);
        setCursorPosition(newPos);
      }, 0);
    }
  }

  const charCount = notes.length;
  const needsMoreChars = charCount > 0 && charCount < 40;
  const isOverLimit = charCount > 20000;
  const wordCount = useMemo(() => countWords(notes), [notes]);
  const estimatedReadMins = useMemo(
    () => Math.max(1, Math.round(wordCount / 200)),
    [wordCount]
  );

  // Close toolbar popups on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu]);

  // Clean up clear confirmation timer
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  function handleClearClick() {
    if (!confirmClear) {
      setConfirmClear(true);
      clearTimerRef.current = setTimeout(() => {
        setConfirmClear(false);
      }, 3000);
      return;
    }
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setConfirmClear(false);
    onClear();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Please select a text file under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        onNotesChange(content);
        toast.success(`Imported "${file.name}"`);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read the selected file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (
      !file.type.startsWith("text/") &&
      !file.name.endsWith(".txt") &&
      !file.name.endsWith(".md")
    ) {
      toast.error("Please drop a plain text (.txt) or markdown (.md) file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Please drop a file under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        onNotesChange(content);
        toast.success(`Imported "${file.name}"`);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read the dropped file.");
    };
    reader.readAsText(file);
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported (PNG, JPG, GIF, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maximum image size is 10 MB");
      return;
    }
    const hasSpace = await hasStorageSpace(file.size);
    if (!hasSpace) {
      toast.error("Storage is almost full. Please delete some images first.");
      return;
    }
    try {
      const meta = await storeImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "");
      const markdown = `![${alt}](image:${meta.id})`;
      const textarea = activeTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? notes.length;
        const end = textarea.selectionEnd ?? notes.length;
        const before = notes.slice(0, start);
        const after = notes.slice(end);
        const needsNewline = before.length > 0 && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
        onNotesChange(`${before}${needsNewline}${markdown}${after}`);
      } else {
        onNotesChange(notes ? `${notes}\n\n${markdown}` : markdown);
      }
      toast.success(`Image "${file.name}" uploaded successfully`);
    } catch {
      toast.error("Failed to save image");
    }
  }

  function handleImageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  }

  function handlePaste(e: React.ClipboardEvent) {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      const imageFile = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (imageFile) {
        e.preventDefault();
        handleImageUpload(imageFile);
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    const hasImage = Array.from(e.dataTransfer.items).some(
      (i) => i.kind === "file" && i.type.startsWith("image/")
    );
    if (hasImage) {
      e.dataTransfer.dropEffect = "copy";
    }
  }

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const imageFile = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("image/")
    );
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  }

  function handleTemplateClick(template: StudyTemplate) {
    closeMenu();
    if (notes.trim().length > 40) {
      setPendingTemplate(template);
    } else {
      onNotesChange(template.content);
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      setViewMode(isMobile ? "preview" : "split");
    }
  }

  function handleInsertFormula(snippet: string) {
    closeMenu();
    const textarea = activeTextareaRef.current;
    if (!textarea) {
      const formattedSnippet = snippet.startsWith("$") ? snippet : `$${snippet}$`;
      onNotesChange(notes ? `${notes}\n\n${formattedSnippet}` : formattedSnippet);
      return;
    }

    const start = textarea.selectionStart ?? notes.length;
    const end = textarea.selectionEnd ?? notes.length;
    const before = notes.slice(0, start);
    const after = notes.slice(end);

    // Check if cursor is already inside math delimiters ($...$ or $$...$$)
    const dollarsBefore = (before.match(/(?<!\\)\$/g) || []).length;
    const isInsideMath = dollarsBefore % 2 === 1;

    // Check if block snippet (e.g. matrix or piecewise cases)
    const isBlockSnippet = snippet.includes("\\begin{matrix}") || snippet.includes("\\begin{cases}");
    const formattedSnippet = isInsideMath
      ? snippet
      : isBlockSnippet
      ? `$$${snippet}$$`
      : `$${snippet}$`;

    const needsSpaceBefore = before.length > 0 && !/[\s\n$]$/.test(before);
    const prefix = needsSpaceBefore ? " " : "";
    const insertion = `${prefix}${formattedSnippet} `;
    const newNotes = before + insertion + after;

    onNotesChange(newNotes);

    // If on desktop/tablet and in edit mode, switch to split mode so user immediately sees live KaTeX render
    if (typeof window !== "undefined" && window.innerWidth >= 640 && viewMode === "edit") {
      setViewMode("split");
    }

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  }

  const latexTrigger = useMemo(() => {
    if (cursorPosition <= 0 || cursorPosition > notes.length) return null;
    const textBefore = notes.slice(0, cursorPosition);
    const match = textBefore.match(/\\([a-zA-Z]+)$/);
    if (!match) return null;
    return {
      query: match[1],
      matchStart: cursorPosition - match[0].length,
      matchEnd: cursorPosition,
    };
  }, [notes, cursorPosition]);

  const activeSuggestions = useMemo(() => {
    if (!latexTrigger) return [];
    const q = latexTrigger.query.toLowerCase();
    return LATEX_SUGGESTIONS.filter((s) => {
      const cmdName = s.command.slice(1).toLowerCase();
      return (
        cmdName.startsWith(q) ||
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }).slice(0, 6);
  }, [latexTrigger]);

  function applyLatexSuggestion(sugg: LatexSuggestion) {
    if (!latexTrigger) return;
    const before = notes.slice(0, latexTrigger.matchStart);
    const after = notes.slice(latexTrigger.matchEnd);

    // Check if trigger was already inside math delimiters ($...$)
    const dollarsBefore = (before.match(/(?<!\\)\$/g) || []).length;
    const isInsideMath = dollarsBefore % 2 === 1;

    const formattedSnippet = isInsideMath ? sugg.snippet : `$${sugg.snippet}$`;
    const newNotes = before + formattedSnippet + after;
    onNotesChange(newNotes);

    // If on desktop/tablet and in edit mode, switch to split mode so user sees live KaTeX render
    if (typeof window !== "undefined" && window.innerWidth >= 640 && viewMode === "edit") {
      setViewMode("split");
    }

    setTimeout(() => {
      const ta = activeTextareaRef.current;
      if (ta) {
        ta.focus();
        const newPos = latexTrigger.matchStart + formattedSnippet.length;
        ta.setSelectionRange(newPos, newPos);
        setCursorPosition(newPos);
      }
    }, 10);
  }

  function applySlashCommand(cmd: SlashCommand) {
    if (!slashCommandState) return;
    const before = notes.slice(0, slashCommandState.matchStart);
    const after = notes.slice(slashCommandState.matchEnd);
    const newNotes = before + cmd.insertText + after;
    onNotesChange(newNotes);
    setSlashDismissed(true);

    setTimeout(() => {
      const ta = activeTextareaRef.current;
      if (ta) {
        ta.focus();
        const newPos = slashCommandState.matchStart + cmd.insertText.length;
        ta.setSelectionRange(newPos, newPos);
        setCursorPosition(newPos);
      }
    }, 10);
  }

  function handleCursorMove(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const target = e.currentTarget;
    const pos = target.selectionStart ?? 0;
    setCursorPosition(pos);
  }

  function handleSelectAnchor(anchorId: string) {
    if (viewMode === "edit") {
      const ta = activeTextareaRef.current;
      if (ta) {
        const lines = notes.split("\n");
        let charOffset = 0;
        let foundOffset = -1;
        for (const line of lines) {
          const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
          if (match) {
            const text = match[2].trim();
            const hId = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-");
            if (hId === anchorId || hId.startsWith(anchorId) || anchorId.startsWith(hId)) {
              foundOffset = charOffset;
              break;
            }
          }
          charOffset += line.length + 1;
        }

        if (foundOffset !== -1) {
          ta.focus();
          ta.setSelectionRange(foundOffset, foundOffset);
          setCursorPosition(foundOffset);
          const lineIndex = notes.slice(0, foundOffset).split("\n").length - 1;
          ta.scrollTop = Math.max(0, lineIndex * 24 - 40);
        }
      }
    } else {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setShowToc(false);
  }

  const lastKeySoundTimeRef = useRef(0);

  function handleBeforeInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const inputEvent = e.nativeEvent as InputEvent;
    if (!inputEvent) return;

    const now = Date.now();
    // Throttle to avoid double-playing if desktop keydown already played within the last 45ms
    if (now - lastKeySoundTimeRef.current < 45) return;

    const inputType = inputEvent.inputType;
    const data = inputEvent.data;

    let key = "";
    if (inputType === "insertLineBreak" || inputType === "insertParagraph" || data === "\n") {
      key = "enter";
    } else if (
      inputType === "deleteContentBackward" ||
      inputType === "deleteContentForward" ||
      inputType === "deleteWordBackward" ||
      inputType === "deleteByCut"
    ) {
      key = "backspace";
    } else if (data === " ") {
      key = " ";
    } else if (data && data.length > 0) {
      key = data[0];
    } else if (inputType === "insertText" || inputType === "insertCompositionText") {
      key = "generic";
    }

    if (key) {
      lastKeySoundTimeRef.current = now;
      playKeyPress(key);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!e.repeat && e.key && e.key !== "Unidentified") {
      lastKeySoundTimeRef.current = Date.now();
      playKeyPress(e.key);
    }

    if (slashCommandState && filteredSlashCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSlashIndex((prev) => (prev + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSlashIndex((prev) => (prev - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySlashCommand(filteredSlashCommands[selectedSlashIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashDismissed(true);
        return;
      }
    }

    if (activeSuggestions.length > 0) {
      if (e.key === "Tab" || e.key === "Enter") {
        if (activeSuggestions[activeSuggestionIndex]) {
          e.preventDefault();
          applyLatexSuggestion(activeSuggestions[activeSuggestionIndex]);
          return;
        }
      } else if (e.key === "ArrowRight") {
        if (activeSuggestionIndex < activeSuggestions.length - 1) {
          e.preventDefault();
          setActiveSuggestionIndex((i) => i + 1);
          return;
        }
      } else if (e.key === "ArrowLeft") {
        if (activeSuggestionIndex > 0) {
          e.preventDefault();
          setActiveSuggestionIndex((i) => i - 1);
          return;
        }
      } else if (e.key === "Escape") {
        setCursorPosition(0);
        return;
      }
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
      if (e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else {
        e.preventDefault();
        handleUndo();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
      e.preventDefault();
      handleRedo();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!loading && charCount >= 40) {
        onSubmit();
      }
    }

    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const nextNewline = notes.indexOf("\n", pos);
      const lineEnd = nextNewline === -1 ? notes.length : nextNewline;
      const currentLine = notes.slice(lineStart, lineEnd);

      if (e.key === "ArrowUp" && lineStart > 0) {
        const prevLineEnd = lineStart;
        const prevLineStart = notes.lastIndexOf("\n", prevLineEnd - 2) + 1;
        const prevLine = notes.slice(prevLineStart, prevLineEnd);
        const before = notes.slice(0, prevLineStart);
        const after = notes.slice(lineEnd);
        const newNotes = before + currentLine + "\n" + prevLine + after;
        onNotesChange(newNotes);
        recordUndo(newNotes);
        const newPos = pos - prevLine.length - 1;
        setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
      } else if (e.key === "ArrowDown" && lineEnd < notes.length) {
        const nextLineEnd = notes.indexOf("\n", lineEnd + 1);
        const nextLineEndSafe = nextLineEnd === -1 ? notes.length : nextLineEnd;
        const nextLine = notes.slice(lineEnd + 1, nextLineEndSafe);
        const before = notes.slice(0, lineStart);
        const after = notes.slice(nextLineEndSafe);
        const newNotes = before + nextLine + "\n" + currentLine + after;
        onNotesChange(newNotes);
        recordUndo(newNotes);
        const newPos = pos + nextLine.length + 1;
        setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
      e.preventDefault();
      setViewMode((prev) => {
        if (prev === "edit") return "split";
        if (prev === "split") return "preview";
        return "edit";
      });
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      wrapSelection("**", "**");
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "i" || e.key === "I")) {
      e.preventDefault();
      wrapSelection("*", "*");
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "3") {
      e.preventDefault();
      const hashes = "#".repeat(parseInt(e.key));
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const currentLine = notes.slice(lineStart);
      const cleanLine = currentLine.replace(/^#{1,3}\s*/, "");
      const before = notes.slice(0, lineStart);
      const after = notes.slice(lineStart + currentLine.length);
      const newNotes = before + hashes + " " + cleanLine + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = lineStart + hashes.length + 1;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "x" || e.key === "X")) {
      e.preventDefault();
      wrapSelection("~~", "~~");
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const end = TA.selectionEnd ?? 0;
      const selected = notes.slice(pos, end);
      const before = notes.slice(0, pos);
      const after = notes.slice(end);
      const linkText = selected || "text";
      const newNotes = before + `[${linkText}](url)` + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const urlStart = pos + linkText.length + 3;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(urlStart, urlStart + 3); setCursorPosition(urlStart); }, 0);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "7" || e.key === "&")) {
      e.preventDefault();
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const before = notes.slice(0, lineStart);
      const after = notes.slice(pos);
      const newNotes = before + "1. " + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = lineStart + 3;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "8" || e.key === "*")) {
      e.preventDefault();
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const before = notes.slice(0, lineStart);
      const after = notes.slice(pos);
      const newNotes = before + "- " + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = lineStart + 2;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "`" || e.key === "~")) {
      e.preventDefault();
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const end = TA.selectionEnd ?? 0;
      const selected = notes.slice(pos, end);
      const before = notes.slice(0, pos);
      const after = notes.slice(end);
      const prefix = before.endsWith("\n") || before.length === 0 ? "" : "\n";
      if (selected) {
        const newNotes = before + prefix + "```\n" + selected + "\n```" + after;
        onNotesChange(newNotes);
        recordUndo(newNotes);
        const newPos = pos + prefix.length + 4;
        const newEnd = newPos + selected.length;
        setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newEnd); setCursorPosition(newPos); }, 0);
      } else {
        const placeholder = "code";
        const newNotes = before + prefix + "```\n" + placeholder + "\n```" + after;
        onNotesChange(newNotes);
        recordUndo(newNotes);
        const newPos = pos + prefix.length + 4;
        setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos + placeholder.length); setCursorPosition(newPos); }, 0);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "." || e.key === ">")) {
      e.preventDefault();
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const before = notes.slice(0, lineStart);
      const after = notes.slice(pos);
      const newNotes = before + "> " + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = lineStart + 2;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "-" || e.key === "_")) {
      e.preventDefault();
      const TA = activeTextareaRef.current;
      if (!TA) return;
      const pos = TA.selectionStart ?? 0;
      const before = notes.slice(0, pos);
      const after = notes.slice(pos);
      const prefix = before.endsWith("\n") || before.length === 0 ? "" : "\n";
      const newNotes = before + prefix + "---\n" + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = pos + prefix.length + 4;
      setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
      return;
    }

    const textarea = activeTextareaRef.current;
    if (!textarea) return;

    const TA = textarea;
    const pos = TA.selectionStart ?? 0;
    const end = TA.selectionEnd ?? 0;
    const hasSelection = pos !== end;
    const charBefore = pos > 0 ? notes[pos - 1] : "";
    const charAtCursor = pos < notes.length ? notes[pos] : "";

    const OPEN_TO_CLOSE: Record<string, string> = {
      "(": ")",
      "[": "]",
      "`": "`",
      $: "$",
    };
    const CLOSING_CHARS = new Set([")", "]", "}", "`", "$"]);

    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !slashCommandState && activeSuggestions.length === 0) {
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const currentLine = notes.slice(lineStart, pos);
      const headingMatch = currentLine.match(/^(#{1,3})\s+/);
      if (headingMatch) {
        e.preventDefault();
        const prefix = headingMatch[1] + " ";
        const before = notes.slice(0, pos);
        const after = notes.slice(pos);
        const newNotes = before + "\n" + prefix + after;
        const newPos = pos + 1 + prefix.length;
        onNotesChange(newNotes);
        recordUndo(newNotes);
        setTimeout(() => {
          TA.focus();
          TA.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
        }, 0);
        return;
      }
    }

    // Wrap Selection: $ + selected text → $selection$
    if (e.key === "$" && hasSelection) {
      e.preventDefault();
      const selected = notes.slice(pos, end);
      const before = notes.slice(0, pos);
      const after = notes.slice(end);
      const insert = `$${selected}$`;
      const newNotes = before + insert + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      setTimeout(() => {
        TA.focus();
        TA.setSelectionRange(pos + insert.length, pos + insert.length);
        setCursorPosition(pos + insert.length);
      }, 0);
      return;
    }

    // Smart Step-Over: cursor before closing char → skip it
    if (CLOSING_CHARS.has(e.key) && !hasSelection && charAtCursor === e.key) {
      e.preventDefault();
      const newPos = pos + 1;
      onNotesChange(notes);
      setTimeout(() => {
        TA.focus();
        TA.setSelectionRange(newPos, newPos);
        setCursorPosition(newPos);
      }, 0);
      return;
    }

    // Auto-Pairing: (, [, `, $ → insert open+close, cursor between
    const PAIRS: Record<string, string> = { "(": "(", "[": "[", "`": "`", $: "$" };
    if (PAIRS[e.key] && !hasSelection) {
      if (e.key === "$" && charAtCursor === "$") return;
      if (e.key === "$" && pos > 0 && /\w/.test(charBefore) && charBefore !== " ") return;

      e.preventDefault();
      const closeChar = OPEN_TO_CLOSE[e.key] ?? e.key;
      const before = notes.slice(0, pos);
      const after = notes.slice(pos);
      const newNotes = before + e.key + closeChar + after;
      onNotesChange(newNotes);
      recordUndo(newNotes);
      const newPos = pos + 1;
      setTimeout(() => {
        TA.focus();
        TA.setSelectionRange(newPos, newPos);
        setCursorPosition(newPos);
      }, 0);
      return;
    }

    // Tab Indentation: context-aware for lists
    if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const currentLine = notes.slice(lineStart, pos);
      const isListItem = /^(\s*)([-*]|\d+\.)\s/.test(currentLine);
      const before = notes.slice(0, pos);
      const after = notes.slice(pos);
      let newNotes: string;
      let newPos: number;
      if (isListItem) {
        newNotes = before.slice(0, lineStart) + "  " + notes.slice(lineStart);
        newPos = pos + 2;
      } else {
        newNotes = before + "  " + after;
        newPos = pos + 2;
      }
      onNotesChange(newNotes);
      recordUndo(newNotes);
      setTimeout(() => {
        TA.focus();
        TA.setSelectionRange(newPos, newPos);
        setCursorPosition(newPos);
      }, 0);
      return;
    }

    // Shift+Tab: dedent list items
    if (e.key === "Tab" && e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const lineStart = notes.lastIndexOf("\n", pos - 1) + 1;
      const linePrefix = notes.slice(lineStart, lineStart + 2);
      if (linePrefix === "  ") {
        const newNotes = notes.slice(0, lineStart) + notes.slice(lineStart + 2);
        const newPos = Math.max(lineStart, pos - 2);
        onNotesChange(newNotes);
        recordUndo(newNotes);
        setTimeout(() => {
          TA.focus();
          TA.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
        }, 0);
      }
      return;
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    playKeyRelease(e.key);
    handleCursorMove(e);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    recordUndo(val);
    onNotesChange(val);
    setCursorPosition(e.target.selectionStart ?? 0);
    setSaveStatus("unsaved");
    setLastEdited(new Date());
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setSaveStatus("saved"), 1200);
  }

  const effectiveMode = viewMode;

  const formulaMenuFiltered = useMemo(() => {
    let list = LATEX_SUGGESTIONS;
    if (selectedCategory !== "all") {
      list = list.filter((item) => item.category === selectedCategory);
    }
    if (formulaSearch.trim()) {
      const q = formulaSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.command.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, formulaSearch]);

  const noteLines = useMemo(() => {
    return notes ? notes.split("\n") : [""];
  }, [notes]);

  // Sync textarea inner content width for exact word-wrap line break calculation
  useEffect(() => {
    const el = activeTextareaRef.current;
    if (!el) return;
    const updateWidth = () => {
      // clientWidth automatically excludes scrollbar width, minus 32px for p-4 (16px left + 16px right)
      setTextareaInnerWidth(Math.max(0, el.clientWidth - 32));
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewMode, effectiveMode]);

  // Measure rendered line heights from typography mirror when wordWrap is enabled
  useEffect(() => {
    if (!wordWrap) {
      setLineHeights([]);
      return;
    }
    if (!measureMirrorRef.current) return;
    const children = measureMirrorRef.current.children;
    const heights: number[] = new Array(children.length);
    for (let i = 0; i < children.length; i++) {
      const h = (children[i] as HTMLElement).getBoundingClientRect().height;
      heights[i] = Math.max(Math.round(h), 24);
    }
    setLineHeights(heights);
  }, [notes, wordWrap, textareaInnerWidth]);

  return (
    <div className="inkdrop-editor-root flex-1 h-full flex flex-col min-w-0 bg-app-bg select-text">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt,.md,.text"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageInputChange}
      />

      {/* SINGLE UNIFIED WORKSTATION TOOLBAR */}
      <div className="h-11 px-3 flex items-center justify-between border-b border-ink-800/80 bg-app-card text-xs select-none flex-shrink-0 gap-2">
        {/* Left: View Mode Segmented Switcher & Tool Dropdowns */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 overflow-x-auto scrollbar-none py-1 flex-1">
          {/* Segmented View Mode (Inkdrop SVG Icon-Only Switcher) */}
          <div className="inline-flex items-center rounded-lg bg-ink-900/90 p-0.5 border border-ink-700/60 flex-shrink-0">
            {/* Mode 1: Edit (Pen) */}
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                effectiveMode === "edit"
                  ? "bg-ink-700 text-ink-50 shadow-xs border border-ink-600/40"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/40"
              }`}
              title="Zen Edit Mode (1-Pane) - Ctrl+P"
              aria-label="Edit Mode"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <g transform="rotate(-45 12 12)">
                  <rect x="9.5" y="3" width="5" height="7" rx="2" />
                  <path d="M9.5 4.2H8.2c-.4 0-.7.3-.7.7v4.2c0 .4.3.7.7.7h1.3v-1H8.6V5.3h.9v-1.1z" />
                  <rect x="10" y="11.5" width="4" height="6.5" rx="0.75" />
                  <path d="M10.8 19h2.4l-1.2 3z" />
                </g>
              </svg>
            </button>

            {/* Mode 2: Split (Editor + Preview) - Visible on tablet/desktop */}
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden sm:flex w-7 h-7 items-center justify-center rounded-md transition-all ${
                effectiveMode === "split"
                  ? "bg-ink-700 text-ink-50 shadow-xs border border-ink-600/40"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/40"
              }`}
              title="Split View (Editor & KaTeX Preview) - Ctrl+P"
              aria-label="Split View"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
                <line x1="12" y1="3.5" x2="12" y2="20.5" />
              </svg>
            </button>

            {/* Mode 3: Preview (Eye) */}
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                effectiveMode === "preview"
                  ? "bg-ink-700 text-ink-50 shadow-xs border border-ink-600/40"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/40"
              }`}
              title="Full KaTeX & Markdown Preview - Ctrl+P"
              aria-label="Full Preview"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.5-6.5 10-6.5 10 6.5 10 6.5-3.5 6.5-10 6.5-10-6.5-10-6.5z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          {/* Undo & Redo History buttons */}
          <div className="inline-flex items-center rounded-lg bg-ink-900/90 p-0.5 border border-ink-700/60 flex-shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l5-5m-5 5l5 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
              aria-label="Redo"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5m5 5l-5 5" />
              </svg>
            </button>
          </div>

          {/* Word Wrap Toggle */}
          <div className="inline-flex items-center rounded-lg bg-ink-900/90 p-0.5 border border-ink-700/60 flex-shrink-0">
            <button
              type="button"
              onClick={() => setWordWrap((w) => !w)}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                wordWrap
                  ? "bg-highlight/15 text-highlight border border-highlight/40"
                  : "text-ink-400 hover:text-ink-100 hover:bg-ink-800/60"
              }`}
              title={wordWrap ? "Disable Word Wrap" : "Enable Word Wrap"}
              aria-label="Toggle Word Wrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h10a3 3 0 010 6h-1m0 0l2-2m-2 2l2 2M4 18h4" />
              </svg>
            </button>
          </div>

          <div className="h-3.5 w-px bg-ink-800/80 hidden sm:block flex-shrink-0" />

          <div className="inline-flex items-center rounded-lg bg-ink-900/90 p-0.5 border border-ink-700/60 flex-shrink-0">
            <button
              type="button"
              onClick={() => wrapSelection("**", "**")}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 transition-all"
              title="Bold (Ctrl+B)"
              aria-label="Bold"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("*", "*")}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 transition-all"
              title="Italic (Ctrl+I)"
              aria-label="Italic"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m-2 0h4m2-16l4 16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("`", "`")}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 transition-all"
              title="Inline Code"
              aria-label="Inline Code"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const TA = activeTextareaRef.current;
                if (!TA) return;
                const pos = TA.selectionStart ?? 0;
                const before = notes.slice(0, pos);
                const after = notes.slice(pos);
                const prefix = before.endsWith("\n") || before.length === 0 ? "" : "\n";
                const newNotes = before + prefix + "- " + after;
                onNotesChange(newNotes);
                recordUndo(newNotes);
                const newPos = pos + prefix.length + 2;
                setTimeout(() => { TA.focus(); TA.setSelectionRange(newPos, newPos); setCursorPosition(newPos); }, 0);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 transition-all"
              title="Bullet List"
              aria-label="Bullet List"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const TA = activeTextareaRef.current;
                if (!TA) return;
                const pos = TA.selectionStart ?? 0;
                const end = TA.selectionEnd ?? 0;
                const selected = notes.slice(pos, end);
                const before = notes.slice(0, pos);
                const after = notes.slice(end);
                const linkText = selected || "link text";
                const newNotes = before + `[${linkText}](url)` + after;
                onNotesChange(newNotes);
                recordUndo(newNotes);
                const urlStart = pos + linkText.length + 3;
                setTimeout(() => { TA.focus(); TA.setSelectionRange(urlStart, urlStart + 3); setCursorPosition(urlStart); }, 0);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800/60 transition-all"
              title="Insert Link"
              aria-label="Insert Link"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </div>

          {/* Group 4: Insert Tools */}
          <div className="inline-flex items-center gap-1 flex-shrink-0">
            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors border text-ink-300 hover:text-ink-100 bg-ink-850 hover:bg-ink-800 border-ink-700/60 flex-shrink-0"
              title="Upload image (PNG, JPG, GIF, WebP)"
              aria-label="Upload Image"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={1.8} />
                <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={1.8} />
                <polyline points="21 15 16 10 5 21" strokeWidth={1.8} />
              </svg>
            </button>

            {/* Note Templates Dropdown (Layout SVG Icon - DISTINCT from sample note!) */}
            <div className="relative flex-shrink-0">
              <button
                ref={templateButtonRef}
                type="button"
                onClick={() => toggleMenu("template")}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors border ${
                  activeMenu === "template"
                    ? "bg-highlight/15 text-highlight border-highlight/40"
                    : "text-ink-300 hover:text-ink-100 bg-ink-850 hover:bg-ink-800 border-ink-700/60"
                }`}
                title="Study Note Templates"
                aria-label="Note Templates"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </button>

              {activeMenu === "template" && menuPos && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={closeMenu}
                    onTouchStart={closeMenu}
                  />
                  <div
                    style={{
                      top: `${menuPos.top}px`,
                      left: `${menuPos.left}px`,
                    }}
                    className="fixed z-50 w-72 max-w-[calc(100vw-24px)] rounded-xl border border-ink-700 bg-app-surface/98 p-2 shadow-2xl backdrop-blur-md animate-fade-in space-y-1"
                  >
                    <div className="px-2 py-1 text-[11px] font-semibold text-highlight border-b border-ink-800 mb-1 flex items-center justify-between">
                      <span>Study Note Templates</span>
                      <button
                        type="button"
                        onClick={closeMenu}
                        className="text-ink-400 hover:text-ink-100 p-0.5 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    {STUDY_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleTemplateClick(tmpl)}
                        className="w-full text-left p-2 rounded-lg hover:bg-ink-800 transition-colors group flex items-start gap-2.5"
                      >
                        <span className="mt-0.5 flex-shrink-0">{renderTemplateIcon(tmpl.iconType)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs text-ink-100 group-hover:text-highlight">
                            {tmpl.name}
                          </div>
                          <div className="text-[10px] text-ink-400 line-clamp-1">{tmpl.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Formula Autocomplete Dropdown (Math Symbol SVG Icon - DISTINCT from raw text \) */}
            <div className="relative flex-shrink-0">
              <button
                ref={formulaButtonRef}
                type="button"
                onClick={() => toggleMenu("formula")}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors border ${
                  activeMenu === "formula"
                    ? "bg-highlight/15 text-highlight border-highlight/40"
                    : "text-ink-300 hover:text-ink-100 bg-ink-850 hover:bg-ink-800 border-ink-700/60"
                }`}
                title="LaTeX Math Formulas (\)"
                aria-label="LaTeX Math Formulas"
              >
                <svg className="w-3.5 h-3.5 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h2l3 9 4-18 3 9h4" />
                </svg>
              </button>

              {activeMenu === "formula" && menuPos && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={closeMenu}
                    onTouchStart={closeMenu}
                  />
                  <div
                    style={{
                      top: `${menuPos.top}px`,
                      left: `${menuPos.left}px`,
                    }}
                    className="fixed z-50 w-80 sm:w-96 max-w-[calc(100vw-24px)] max-h-[75vh] overflow-y-auto rounded-xl border border-ink-700 bg-app-surface/98 p-3 shadow-2xl backdrop-blur-md animate-fade-in space-y-2"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-ink-800">
                      <span className="text-xs font-semibold text-ink-100 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h2l3 9 4-18 3 9h4" />
                        </svg>
                        LaTeX Math Formulas
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-ink-400 font-mono">KaTeX Ready</span>
                        <button
                          type="button"
                          onClick={closeMenu}
                          className="text-ink-400 hover:text-ink-100 p-0.5 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={formulaSearch}
                      onChange={(e) => setFormulaSearch(e.target.value)}
                      placeholder="Search formula (e.g. integral, square root, matrix)..."
                      className="w-full bg-ink-850 border border-ink-700/80 rounded-md px-2.5 py-1 text-xs text-ink-100 placeholder-ink-500 focus:outline-none focus:border-highlight"
                    />

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                      {CATEGORY_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedCategory(tab.id)}
                          className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] transition-colors ${
                            selectedCategory === tab.id
                              ? "bg-highlight text-highlight-text font-bold"
                              : "bg-ink-800 text-ink-400 hover:text-ink-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
                      {formulaMenuFiltered.map((item) => (
                        <button
                          key={item.command}
                          type="button"
                          onClick={() => handleInsertFormula(item.snippet)}
                          className="w-full text-left p-1.5 rounded-md hover:bg-ink-800 transition-colors flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <code className="text-xs font-mono text-highlight group-hover:underline">
                              {item.command}
                            </code>
                            <div className="text-[11px] text-ink-300 truncate">{item.label}</div>
                          </div>
                          <span className="text-[9px] uppercase px-1 rounded bg-ink-800 text-ink-400 font-mono border border-ink-700">
                            {item.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mermaid Diagram Templates Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                ref={mermaidButtonRef}
                type="button"
                onClick={() => toggleMenu("mermaid")}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors border flex-shrink-0 ${
                  activeMenu === "mermaid"
                    ? "bg-highlight/15 text-highlight border-highlight/40"
                    : "text-ink-300 hover:text-highlight bg-ink-850 hover:bg-ink-800 border-ink-700/60"
                }`}
                title="Mermaid Diagram Templates (Flowchart, Sequence, Mindmap, ERD, Class, Gantt, etc.)"
                aria-label="Mermaid Diagram Templates"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </button>

              {activeMenu === "mermaid" && menuPos && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={closeMenu}
                    onTouchStart={closeMenu}
                  />
                  <div
                    style={{
                      top: `${menuPos.top}px`,
                      left: `${menuPos.left}px`,
                    }}
                    className="fixed z-50 w-96 max-w-[calc(100vw-24px)] rounded-xl border border-ink-700/90 bg-app-surface/98 p-2.5 shadow-2xl backdrop-blur-md animate-fade-in space-y-2"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-ink-800">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                        <span className="text-xs font-semibold text-highlight">Mermaid Diagram Gallery</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ink-800 text-ink-400 border border-ink-750">
                          {MERMAID_TEMPLATES.length} templates
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={closeMenu}
                        className="text-ink-400 hover:text-ink-100 p-0.5 text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="Search diagram templates (flowchart, mindmap, erd...)"
                      value={mermaidSearch}
                      onChange={(e) => setMermaidSearch(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-ink-900 border border-ink-700 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-highlight"
                    />

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 text-[10px]">
                      {(["All", "Flow", "Architecture", "Concept", "Timeline & Data"] as MermaidCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setMermaidCategory(cat)}
                          className={`px-2 py-0.5 rounded-md font-mono whitespace-nowrap transition-colors ${
                            mermaidCategory === cat
                              ? "bg-highlight text-highlight-text font-bold"
                              : "bg-ink-850 text-ink-300 hover:bg-ink-800 hover:text-ink-100 border border-ink-750"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Template List */}
                    <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
                      {filteredMermaidTemplates.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleInsertMermaid(tmpl.code, tmpl.name)}
                          className="w-full text-left p-2 rounded-lg hover:bg-ink-800 transition-colors group flex items-start justify-between gap-2 border border-transparent hover:border-ink-700"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs text-ink-100 group-hover:text-highlight truncate">
                              {tmpl.name}
                            </div>
                            <div className="text-[10px] text-ink-400 line-clamp-1 mt-0.5">
                              {tmpl.description}
                            </div>
                          </div>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-ink-850 text-ink-400 font-mono border border-ink-750 flex-shrink-0">
                            {tmpl.category}
                          </span>
                        </button>
                      ))}
                      {filteredMermaidTemplates.length === 0 && (
                        <div className="py-4 text-center text-xs text-ink-500">
                          No diagram templates found matching &quot;{mermaidSearch}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* DIVIDER */}
          <div className="h-3.5 w-px bg-ink-800/80 hidden sm:block flex-shrink-0" />

          {/* Group 5: Document Outline / TOC */}
          <div className="inline-flex items-center gap-1 flex-shrink-0">
            {/* Outline / TOC Toggle */}
            <button
              type="button"
              onClick={() => setShowToc((v) => !v)}
              className={`relative w-7 h-7 flex items-center justify-center rounded-md transition-colors border flex-shrink-0 ${
                showToc
                  ? "bg-highlight/15 text-highlight border-highlight/40"
                  : "text-ink-300 hover:text-ink-100 bg-ink-850 hover:bg-ink-800 border-ink-700/60"
              }`}
              title="Table of Contents"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
              </svg>
              {tocEntries.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-highlight text-highlight-text text-[9px] font-bold rounded-full flex items-center justify-center font-mono shadow-xs">
                  {tocEntries.length}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Right: Sound Toggle + Action Buttons + AI Recap */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ml-auto pl-1">
          {/* Cherry MX Black Keyboard Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            suppressHydrationWarning
            className={`relative w-7 h-7 flex items-center justify-center rounded-md transition-all border flex-shrink-0 ${
              isSoundEnabled
                ? "bg-highlight/15 text-highlight border-highlight/40"
                : "text-ink-400 hover:text-ink-200 bg-ink-850 hover:bg-ink-800 border-ink-700/60"
            }`}
            title={isSoundEnabled ? "Cherry MX Black Sound Active (Click to Mute)" : "Enable Cherry MX Black Sound"}
            aria-label="Keyboard Sound Switch"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM7 9h.01M11 9h.01M15 9h.01M7 12h.01M11 12h.01M15 12h.01M9 15h6" />
            </svg>
            {isSoundEnabled && (
              <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-highlight shadow-[0_0_6px_var(--highlight)]" />
            )}
          </button>

          {/* AI Recap Action Button (Theme Highlight, Never Cut Off) */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || charCount < 40}
            className="h-7 px-2.5 rounded-md bg-highlight hover:bg-highlight-hover text-highlight-text font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
            title="Generate AI Recap & Self-Test (Ctrl+Enter)"
          >
            <span className="flex items-center gap-1.5">
              {!loading && (
                <svg className="w-3.5 h-3.5 fill-current text-highlight-text flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              )}
              <span>{loading ? "Recapping…" : "AI Recap"}</span>
            </span>
            {dailyRemaining !== null && (
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/20 text-highlight-text font-bold">
                {dailyRemaining}/10
              </span>
            )}
          </button>

          {/* Toggle Right Companion Panel — chat bubble icon */}
          {onToggleCompanion && (
            <button
              type="button"
              onClick={onToggleCompanion}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors border flex-shrink-0 ${
                isCompanionOpen
                  ? "bg-highlight/15 text-highlight border-highlight/40"
                  : "text-ink-400 hover:text-ink-100 bg-ink-850 border-ink-700/60"
              }`}
              title={isCompanionOpen ? "Collapse AI Companion Panel" : "Open AI Companion Panel"}
              aria-label="Toggle AI Companion"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* SUB-HEADER / NOTE METADATA STRIP WITH NOTEBOOK, STUDY STATUS & TAGS */}
      <div className="h-9 px-3 border-b border-ink-800/60 bg-app-card text-[11px] text-ink-500 flex items-center justify-between select-none flex-shrink-0 gap-2 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-w-0 flex-1 flex-nowrap">
          {/* Notebook Dropdown */}
          {notebooks && notebooks.length > 0 && onMoveNotebook && (
            <>
              <NotebookDropdown
                currentNotebookId={currentNotebookId || "Inbox"}
                notebooks={notebooks}
                onSelectNotebook={onMoveNotebook}
              />
              <span className="text-ink-700 flex-shrink-0">&bull;</span>
            </>
          )}

          {studyStatus && onChangeStatus && (
            <>
              <StudyStatusDropdown
                status={studyStatus}
                onChangeStatus={onChangeStatus}
              />
              <span className="text-ink-700 flex-shrink-0">&bull;</span>
            </>
          )}

          {/* Interactive Note Tag Bar */}
          {onAddTag && onRemoveTag && (
            <NoteTagBar
              tags={tags || []}
              allTags={allTags || []}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onSelectTag={onSelectTag}
            />
          )}

          <span className="text-ink-700 hidden sm:inline flex-shrink-0">&bull;</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] text-ink-400 flex-shrink-0" title="Automatic storage status">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === "unsaved" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span>{saveStatus === "unsaved" ? "Unsaved" : "Saved"}</span>
          </span>
        </div>

        <span className="hidden sm:inline text-[10px] font-mono text-ink-500 flex-shrink-0" suppressHydrationWarning>
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* TOC Panel Floating Overlay */}
      {showToc && (
        <TocPanel
          isOpen={showToc}
          entries={tocEntries}
          onClose={() => setShowToc(false)}
          onSelectAnchor={handleSelectAnchor}
        />
      )}

      {/* Latex Autocomplete Strip */}
      {activeSuggestions.length > 0 && (
        <div className="px-4 py-1 bg-ink-900 border-b border-highlight/40 flex items-center gap-2 text-xs font-mono animate-fade-in shadow-inner">
          <span className="text-highlight font-semibold">\ {latexTrigger?.query}:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
            {activeSuggestions.map((sugg, i) => (
              <button
                key={sugg.command}
                type="button"
                onClick={() => applyLatexSuggestion(sugg)}
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 text-[11px] ${
                  i === activeSuggestionIndex
                    ? "bg-highlight text-ink-900 font-bold"
                    : "bg-ink-800 text-ink-300 hover:text-ink-100"
                }`}
              >
                <span>{sugg.command}</span>
                <span className="text-[9px] opacity-75">{sugg.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Docked Slash Command Strip */}
      {slashCommandState && filteredSlashCommands.length > 0 && (
        <div className="px-4 py-1.5 bg-ink-900 border-b border-highlight/50 flex items-center justify-between text-xs font-mono animate-fade-in shadow-inner">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <span className="text-highlight font-semibold">/{slashCommandState.query}:</span>
            {filteredSlashCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySlashCommand(cmd);
                }}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                  idx === selectedSlashIndex
                    ? "bg-highlight text-ink-900 font-bold"
                    : "bg-ink-800 text-ink-300 hover:text-ink-100"
                }`}
              >
                <span>{cmd.label}</span>
                <span className="text-[9px] opacity-75">{cmd.category}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSlashDismissed(true)}
            className="text-[10px] text-ink-400 hover:text-ink-200 ml-2 inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Esc</span>
          </button>
        </div>
      )}

      {/* FULL-HEIGHT EDITOR CANVAS */}
      <div
        className={`flex-1 min-h-0 flex flex-col overflow-hidden transition-all ${
          isDragging ? "bg-ink-850/95 ring-2 ring-highlight/40" : "bg-app-bg"
        }`}
      >
        {/* Onboarding Guide for Beginners when Notes are Empty */}
        {!notes.trim() && showWelcome && (
          <WelcomeBanner
            onLoadSample={onLoadSample}
            onOpenTemplates={() => toggleMenu("template")}
            onInsertMermaid={handleInsertMermaid}
            onDismiss={() => setShowWelcome(false)}
          />
        )}
        {/* Offscreen Typography Mirror for Word-Wrap Line Height Calculation */}
        <div
          ref={measureMirrorRef}
          aria-hidden="true"
          className="invisible absolute pointer-events-none -z-50 overflow-hidden"
          style={{
            position: "fixed",
            top: -99999,
            left: -99999,
            width: textareaInnerWidth > 0 ? `${textareaInnerWidth}px` : "auto",
            fontFamily: "var(--font-editor, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
            fontSize: "14px",
            lineHeight: "24px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            overflowWrap: "break-word",
            visibility: "hidden",
          }}
        >
          {noteLines.map((line, idx) => (
            <div key={idx} style={{ minHeight: "24px", lineHeight: "24px" }}>
              {line.length > 0 ? line : "\u00A0"}
            </div>
          ))}
        </div>

        {effectiveMode === "split" ? (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink-800/80 overflow-hidden">
            {/* Left: Textarea with Line Numbers */}
            <div className="flex-1 min-h-0 flex overflow-hidden">
              <div
                ref={lineNumbersRef}
                onWheel={(e) => {
                  if (activeTextareaRef.current) activeTextareaRef.current.scrollTop += e.deltaY;
                }}
                className="hidden sm:block w-11 select-none text-right font-mono text-xs bg-app-card border-r border-ink-850 overflow-hidden flex-shrink-0"
                style={{
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  paddingRight: "8px",
                  fontFamily: "var(--font-editor, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
                }}
              >
                {noteLines.map((_, i) => {
                  const isCurrentLine = cursorLine === i + 1;
                  const h = wordWrap && lineHeights[i] ? lineHeights[i] : 24;
                  return (
                    <div
                      key={i}
                      style={{
                        height: `${h}px`,
                        lineHeight: "24px",
                        fontSize: "14px",
                      }}
                      className={`transition-colors duration-75 ${
                        isCurrentLine
                          ? "text-highlight font-bold"
                          : "text-ink-600 hover:text-ink-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <textarea
                id="notes"
                ref={activeTextareaRef}
                value={notes}
                onChange={handleTextareaChange}
                onBeforeInput={handleBeforeInput}
                onKeyUp={handleKeyUp}
                onClick={handleCursorMove}
                onPaste={handlePaste}
                onDragOver={(e) => {
                  e.preventDefault();
                  const hasImage = Array.from(e.dataTransfer.items).some(
                    (i) => i.kind === "file" && i.type.startsWith("image/")
                  );
                  if (hasImage) {
                    e.dataTransfer.dropEffect = "copy";
                  } else {
                    setIsDragging(true);
                  }
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  const hasImage = Array.from(e.dataTransfer.files).some((f) =>
                    f.type.startsWith("image/")
                  );
                  if (hasImage) {
                    handleImageDrop(e);
                  } else {
                    handleDrop(e);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Write notes, math & science formulas ($E=mc^2$), or type / for blocks… (Ctrl+Enter to recap)"
                className="inkdrop-editor flex-1 h-full resize-none font-mono text-ink-50 placeholder:text-ink-500 bg-transparent focus:outline-none overflow-y-auto scrollbar-thin select-text"
                style={{
                  padding: "16px",
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontFamily: "var(--font-editor, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
                  whiteSpace: wordWrap ? "pre-wrap" : "pre",
                  overflowWrap: wordWrap ? "break-word" : "normal",
                  wordBreak: wordWrap ? "break-all" : undefined,
                }}
                onScroll={(e) => {
                  if (lineNumbersRef.current) {
                    lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
                  }
                }}
              />
            </div>

            {/* Right: Live KaTeX Preview */}
            <div className="flex-1 min-h-0 p-4 overflow-y-auto scrollbar-thin bg-app-surface/50 select-text">
              <div className="text-[10px] font-mono text-ink-400 uppercase tracking-wider mb-2 border-b border-ink-800/60 pb-1 flex items-center justify-between">
                <span>Live KaTeX Preview</span>
                <span className="text-emerald-400 flex items-center gap-1 font-sans text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Render
                </span>
              </div>
              <FormattedText
                text={
                  notes ||
                  "Type math formulas like `$E=mc^2$` or `$$\\int_0^1 x^2 dx$$` for live preview."
                }
              />
            </div>
          </div>
        ) : effectiveMode === "edit" ? (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <div
              ref={lineNumbersRef}
              onWheel={(e) => {
                if (activeTextareaRef.current) activeTextareaRef.current.scrollTop += e.deltaY;
              }}
              className="hidden sm:block w-11 select-none text-right font-mono text-xs bg-app-card border-r border-ink-850 overflow-hidden flex-shrink-0"
              style={{
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingRight: "8px",
                fontFamily: "var(--font-editor, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
              }}
            >
              {noteLines.map((_, i) => {
                const isCurrentLine = cursorLine === i + 1;
                const h = wordWrap && lineHeights[i] ? lineHeights[i] : 24;
                return (
                  <div
                    key={i}
                    style={{
                      height: `${h}px`,
                      lineHeight: "24px",
                      fontSize: "14px",
                    }}
                    className={`transition-colors duration-75 ${
                      isCurrentLine
                        ? "text-highlight font-bold"
                        : "text-ink-600 hover:text-ink-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <textarea
              id="notes"
              ref={activeTextareaRef}
              value={notes}
              onChange={handleTextareaChange}
              onBeforeInput={handleBeforeInput}
              onKeyUp={handleKeyUp}
              onClick={handleCursorMove}
              onPaste={handlePaste}
              onDragOver={(e) => {
                e.preventDefault();
                const hasImage = Array.from(e.dataTransfer.items).some(
                  (i) => i.kind === "file" && i.type.startsWith("image/")
                );
                if (hasImage) {
                  e.dataTransfer.dropEffect = "copy";
                } else {
                  setIsDragging(true);
                }
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                const hasImage = Array.from(e.dataTransfer.files).some((f) =>
                  f.type.startsWith("image/")
                );
                if (hasImage) {
                  handleImageDrop(e);
                } else {
                  handleDrop(e);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Write notes, math & science formulas ($E=mc^2$), or type / for blocks… (Ctrl+Enter to recap)"
              className="inkdrop-editor flex-1 h-full resize-none font-mono text-ink-50 placeholder:text-ink-500 bg-transparent focus:outline-none overflow-y-auto scrollbar-thin select-text"
              style={{
                padding: "16px",
                fontSize: "14px",
                lineHeight: "24px",
                fontFamily: "var(--font-editor, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
                whiteSpace: wordWrap ? "pre-wrap" : "pre",
                overflowWrap: wordWrap ? "break-word" : "normal",
                wordBreak: wordWrap ? "break-all" : undefined,
              }}
              onScroll={(e) => {
                if (lineNumbersRef.current) {
                  lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
                }
              }}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 p-5 overflow-y-auto scrollbar-thin bg-app-surface/50 select-text">
            <FormattedText
              text={
                notes ||
                "Note is empty. Start typing or choose a template above."
              }
            />
          </div>
        )}
      </div>

      {/* IDE-STYLE BOTTOM WORKSTATION STATUS BAR */}
      <footer className="h-6 px-3 border-t border-ink-800/80 bg-app-card text-[10px] font-mono text-ink-400 flex items-center justify-between select-none flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Live Auto-save indicator */}
          <span className="flex items-center gap-1.5 pr-1 border-r border-ink-800">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                saveStatus === "saved"
                  ? "bg-emerald-400"
                  : saveStatus === "saving"
                  ? "bg-highlight animate-pulse"
                  : "bg-ink-500"
              }`}
            />
            <span className="text-ink-300">
              {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Draft"}
            </span>
          </span>

          <span className="text-ink-300">
            Ln {cursorLine}, Col {cursorCol}
          </span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-ink-400">UTF-8</span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-highlight font-semibold">Markdown</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-ink-500">
          <span>Type <code className="text-highlight">/</code> blocks</span>
          <span className="text-ink-700">&bull;</span>
          <span><code className="text-highlight">\</code> LaTeX</span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-highlight">```mermaid</span>
        </div>

        <div className="flex items-center gap-2">
          <span>{wordCount} words</span>
          <span className="text-ink-700">&bull;</span>
          <span>{estimatedReadMins}m read</span>
          <span className="text-ink-700">&bull;</span>
          <span className={isOverLimit ? "text-highlight font-bold" : ""}>
            {charCount}/20k chars
          </span>
        </div>
      </footer>

      {/* Safe Template Insertion Modal (Append to Bottom vs Replace Note) */}
      {pendingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-app-surface border border-ink-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-highlight/15 border border-highlight/30 flex-shrink-0">
                  {renderTemplateIcon(pendingTemplate.iconType)}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink-50">
                    Apply {pendingTemplate.name}
                  </h3>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Your current draft contains <span className="font-semibold text-ink-200">{wordCount} words</span>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="text-ink-400 hover:text-ink-100 p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Template description & snippet preview */}
            <div className="p-3 rounded-xl bg-app-card border border-ink-800 text-xs space-y-2">
              <p className="text-ink-300 font-medium">{pendingTemplate.description}</p>
              <div className="text-[11px] font-mono text-ink-400 line-clamp-3 bg-app-bg/80 p-2 rounded-lg border border-ink-700/50">
                {pendingTemplate.content.slice(0, 180)}...
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const combined = notes.trim()
                    ? `${notes.trim()}\n\n---\n\n${pendingTemplate.content}`
                    : pendingTemplate.content;
                  onNotesChange(combined);
                  setPendingTemplate(null);
                  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
                  setViewMode(isMobile ? "preview" : "split");
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-700 transition-colors"
                title="Keep existing notes and append this template at the bottom"
              >
                Append to Bottom
              </button>
              <button
                type="button"
                onClick={() => {
                  onNotesChange(pendingTemplate.content);
                  setPendingTemplate(null);
                  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
                  setViewMode(isMobile ? "preview" : "split");
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-highlight hover:bg-highlight-hover text-highlight-text transition-colors shadow-xs"
                title="Replace existing note with this template"
              >
                Replace Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const NotesInput = memo(NotesInputInner);
