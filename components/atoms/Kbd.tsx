"use client";

import { memo, ReactNode } from "react";

type KbdProps = {
  children: ReactNode;
  variant?: "default" | "highlight" | "emerald" | "amber";
  className?: string;
};

export const Kbd = memo(function Kbd({
  children,
  variant = "default",
  className = "",
}: KbdProps) {
  const variantStyles = {
    default: "bg-ink-800 border-ink-600 text-ink-200",
    highlight: "bg-ink-800 border-ink-600 text-highlight",
    emerald: "bg-ink-800 border-ink-600 text-emerald-300",
    amber: "bg-ink-800 border-ink-600 text-yellow-300",
  }[variant];

  return (
    <kbd
      className={`inline-block px-1.5 py-0.5 rounded border font-mono text-[11px] shadow-sm select-none ${variantStyles} ${className}`}
    >
      {children}
    </kbd>
  );
});
