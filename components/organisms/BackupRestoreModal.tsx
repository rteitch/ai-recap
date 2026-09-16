"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type BackupRestoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const STORAGE_KEYS = [
  "ai_recap_saved_state",
  "ai_recap_history",
  "ai_recap_notebooks",
  "ai_recap_custom_api",
  "ai_recap_study_streak",
  "ai_recap_quiz_count",
] as const;

type BackupData = {
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
};

export const BackupRestoreModal = memo(function BackupRestoreModal({
  isOpen,
  onClose,
}: BackupRestoreModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<BackupData | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
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
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleExport = useCallback(() => {
    const data: Record<string, string> = {};
    for (const key of STORAGE_KEYS) {
      const value = localStorage.getItem(key);
      if (value) {
        data[key] = value;
      }
    }

    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-recap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exported successfully!");
    onClose();
  }, [onClose]);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json")) {
      toast.error("Please select a .json backup file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as BackupData;
        if (!parsed.version || !parsed.data || typeof parsed.data !== "object") {
          toast.error("Invalid backup format.");
          return;
        }

        const validKeys: Record<string, string> = {};
        let invalidCount = 0;
        for (const [key, value] of Object.entries(parsed.data)) {
          if (typeof value === "string" && STORAGE_KEYS.includes(key as typeof STORAGE_KEYS[number])) {
            try {
              JSON.parse(value);
              validKeys[key] = value;
            } catch {
              invalidCount++;
            }
          } else {
            invalidCount++;
          }
        }

        if (Object.keys(validKeys).length === 0) {
          toast.error("No valid data found in backup file.");
          return;
        }

        if (invalidCount > 0) {
          toast.warning(`${invalidCount} items skipped due to invalid format.`);
        }

        setPreview({ ...parsed, data: validKeys });
      } catch {
        toast.error("File is not valid JSON.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleImport = useCallback(() => {
    if (!preview) return;
    setImporting(true);

    try {
      for (const [key, value] of Object.entries(preview.data)) {
        localStorage.setItem(key, value);
      }
      toast.success("Backup restored! Reloading page...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      toast.error("Failed to restore backup.");
      setImporting(false);
    }
  }, [preview]);

  const handleImportFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isOpen) return null;

  return (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-restore-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in no-print"
        onClick={onClose}
      >
      <div
        className="w-full max-w-md bg-ink-900 border border-ink-600 rounded-xl p-5 sm:p-6 shadow-2xl animate-fade-up overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-ink-600/70">
          <h2
            id="backup-restore-title"
            className="text-sm font-medium text-ink-50 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-highlight flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>Backup & Restore</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-100 p-1 rounded hover:bg-ink-800 transition-colors touch-manipulation"
            aria-label="Close backup dialog"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Export Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-ink-300 uppercase tracking-wider">
              Export Backup
            </h3>
            <p className="text-xs text-ink-400">
              Download all your notes, history, and settings as a .json file.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="w-full px-4 py-2.5 rounded-lg bg-highlight/10 hover:bg-highlight/20 border border-highlight/30 text-highlight text-sm font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Backup (.json)
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-ink-300 uppercase tracking-wider">
              Restore Backup
            </h3>
            <p className="text-xs text-ink-400">
              Import a backup file from this device or another browser.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {!preview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={handleImportFile}
                className={`w-full px-4 py-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer text-center ${
                  isDragging
                    ? "border-highlight bg-highlight/10"
                    : "border-ink-600 hover:border-ink-500 hover:bg-ink-800/50"
                }`}
              >
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-ink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-ink-300">
                  {isDragging
                    ? "Drop your backup file here"
                    : "Click or drag a .json backup file"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-ink-800/50 border border-ink-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-ink-400">Backup Preview</span>
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="text-xs text-ink-500 hover:text-ink-300"
                    >
                      Change file
                    </button>
                  </div>
                  <p className="text-sm text-ink-200">
                    Exported: {new Date(preview.exportedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    {Object.keys(preview.data).length} items found
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    This will replace all current data. The page will reload after import.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full px-4 py-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-sm font-semibold transition-colors touch-manipulation flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Restore This Backup
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-ink-600/70 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-ink-200 text-xs transition-colors touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});
