"use client";

import { memo } from "react";

type OfflineBadgeProps = {
  isOnline: boolean;
};

export const OfflineBadge = memo(function OfflineBadge({
  isOnline,
}: OfflineBadgeProps) {
  if (isOnline) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2.5 py-0.5 text-[11px] font-medium text-yellow-300"
      title="Working offline. Saved recaps and flashcards are available."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
      <span>Offline mode</span>
    </span>
  );
});
