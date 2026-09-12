"use client";

import { memo } from "react";

type SpeechControlsProps = {
  isSpeaking: boolean;
  speechRate: 1.0 | 1.25 | 1.5;
  onToggleSpeech: () => void;
  onCycleRate: () => void;
};

export const SpeechControls = memo(function SpeechControls({
  isSpeaking,
  speechRate,
  onToggleSpeech,
  onCycleRate,
}: SpeechControlsProps) {
  return (
    <div className="flex items-center gap-1.5 no-print">
      <button
        type="button"
        onClick={onToggleSpeech}
        className="text-xs text-ink-400 hover:text-ink-50 transition-colors touch-manipulation flex items-center gap-1.5 py-0.5"
      >
        {isSpeaking ? (
          <>
            <svg
              className="w-3.5 h-3.5 text-highlight flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span>Stop</span>
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span>Listen</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onCycleRate}
        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-900/60 border border-ink-600/70 text-ink-300 hover:text-ink-100 transition-colors touch-manipulation"
        title="Change playback speed (1x, 1.25x, 1.5x)"
      >
        {speechRate}x
      </button>
    </div>
  );
});
