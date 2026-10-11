"use client";

import { memo, ReactNode } from "react";

type KbdProps = {
  children: ReactNode;
  variant?: "default" | "highlight" | "emerald" | "amber" | "yellow";
  className?: string;
};

export const Kbd = memo(function Kbd({
  children,
  variant = "default",
  className = "",
}: KbdProps) {
  const variantStyles = {
    default: "bg-app-card border-app-border text-ink-200",
    highlight: "bg-app-card border-app-border text-highlight",
    emerald: "bg-app-card border-app-border text-emerald-700 dark:text-emerald-300 font-semibold",
    amber: "bg-app-card border-app-border text-amber-600 dark:text-amber-400 font-semibold",
    yellow: "bg-app-card border-app-border text-highlight",
  }[variant];

  return (
    <kbd
      className={`inline-block px-1.5 py-0.5 rounded border font-mono text-[11px] shadow-sm select-none ${variantStyles} ${className}`}
    >
      {children}
    </kbd>
  );
});
