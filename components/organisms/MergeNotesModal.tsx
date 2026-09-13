"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { HistoryItem } from "@/lib/types";

type MergeNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  notes: HistoryItem[];
  currentNoteId: string;
  onMerge: (sourceId: string, targetId: string, separator: string) => void;
};

export const MergeNotesModal = memo(function MergeNotesModal({
  isOpen,
  onClose,
  notes,
  currentNoteId,
  onMerge,
}: MergeNotesModalProps) {
  const [targetId, setTargetId] = useState("");
  const [separator, setSeparator] = useState("\n\n");

  const availableNotes = notes.filter((n) => n.id !== currentNoteId);
  const currentNote = notes.find((n) => n.id === currentNoteId);
  const targetNote = notes.find((n) => n.id === targetId);

  useEffect(() => {
    if (isOpen) {
      setTargetId(availableNotes[0]?.id || "");
      setSeparator("\n\n");
    }
  }, [isOpen, availableNotes]);

  const handleMerge = useCallback(() => {
    if (!targetId) return;
    onMerge(currentNoteId, targetId, separator);
    onClose();
  }, [currentNoteId, targetId, separator, onMerge, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-notes-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-ink-900 border border-ink-600 rounded-xl p-5 sm:p-6 shadow-2xl animate-fade-up overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-ink-600/70">
          <h2
            id="merge-notes-title"
            className="text-sm font-medium text-ink-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-highlight flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Gabung Catatan</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-100 p-1 rounded hover:bg-ink-800 transition-colors touch-manipulation"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="py-4 space-y-4">
          {availableNotes.length === 0 ? (
            <p className="text-xs text-ink-400 text-center py-4">
              Tidak ada catatan lain untuk digabung.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-xs text-ink-300 mb-1">Gabungkan ke catatan:</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-ink-800 border border-ink-600 rounded text-ink-100 focus:outline-none focus:border-highlight"
                >
                  {availableNotes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {(n.title || n.preview || "Untitled").slice(0, 50)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink-300 mb-1">Pemisah:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSeparator("\n\n")}
                    className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                      separator === "\n\n"
                        ? "bg-highlight/10 border-highlight/40 text-highlight"
                        : "bg-ink-800 border-ink-600 text-ink-300 hover:bg-ink-700"
                    }`}
                  >
                    Baris Kosong
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeparator("\n---\n")}
                    className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                      separator === "\n---\n"
                        ? "bg-highlight/10 border-highlight/40 text-highlight"
                        : "bg-ink-800 border-ink-600 text-ink-300 hover:bg-ink-700"
                    }`}
                  >
                    Garis Pisah
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-ink-800/50 border border-ink-700">
                  <p className="text-[10px] text-ink-400 mb-1">Sumber:</p>
                  <p className="text-xs text-ink-200 line-clamp-3">
                    {(currentNote?.notes || "").slice(0, 200) || "Empty"}
                  </p>
                </div>
                <div className="text-center text-[10px] text-ink-500">↓ + ↓</div>
                <div className="p-2 rounded bg-ink-800/50 border border-ink-700">
                  <p className="text-[10px] text-ink-400 mb-1">Target:</p>
                  <p className="text-xs text-ink-200 line-clamp-3">
                    {(targetNote?.notes || "").slice(0, 200) || "Empty"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-3 border-t border-ink-600/70 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-ink-300 hover:text-ink-100 hover:bg-ink-800 rounded transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleMerge}
            disabled={!targetId || availableNotes.length === 0}
            className="px-3 py-1.5 text-xs bg-highlight/10 hover:bg-highlight/20 border border-highlight/30 text-highlight rounded transition-colors disabled:opacity-50"
          >
            Gabung
          </button>
        </div>
      </div>
    </div>
  );
});
