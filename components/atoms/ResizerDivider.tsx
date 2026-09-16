"use client";

import { memo } from "react";

type ResizerDividerProps = {
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  isActive?: boolean;
  className?: string;
  title?: string;
};

export const ResizerDivider = memo(function ResizerDivider({
  onMouseDown,
  onDoubleClick,
  isActive = false,
  className = "",
  title = "Tarik untuk mengubah ukuran kolom (Klik ganda untuk reset)",
}: ResizerDividerProps) {
  return (
    <div
      role="separator"
      tabIndex={0}
      title={title}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      className={`relative flex-shrink-0 w-2 select-none cursor-col-resize group z-20 transition-colors flex items-center justify-center -mx-1 ${className}`}
    >
      {/* 1px visual divider line in the center */}
      <div
        className={`w-px h-full transition-colors ${
          isActive
            ? "bg-highlight shadow-[0_0_8px_var(--highlight)]"
            : "bg-ink-800/80 group-hover:bg-highlight/80"
        }`}
      />
    </div>
  );
});
