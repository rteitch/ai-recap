"use client";

import { memo } from "react";

type StudyStreakBadgeProps = {
  streak: number;
};

export const StudyStreakBadge = memo(function StudyStreakBadge({
  streak,
}: StudyStreakBadgeProps) {
  if (streak <= 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400"
      title={`${streak} consecutive day${streak > 1 ? "s" : ""} studied`}
    >
      <svg
        className="w-3 h-3 text-amber-500 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.527.82-1.14 2.07-1.14 3.442 0 .54.07 1.05.188 1.527a4.992 4.992 0 00-1.782-1.042 1 1 0 00-1.22.453c-.343.6-.537 1.282-.537 2.012 0 2.973 2.385 5.56 5.37 5.56 3.01 0 5.43-2.587 5.43-5.56 0-1.803-.895-3.398-2.28-4.394a5.98 5.98 0 00-1.787-2.493zM10 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          clipRule="evenodd"
        />
      </svg>
      <span>{streak}d streak</span>
    </span>
  );
});
