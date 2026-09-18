"use client";

import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "var(--bg-card, #161722)",
          border: "1px solid var(--app-border, #282a3a)",
          color: "var(--ink-100, #f3f4f6)",
          fontSize: "12px",
          fontFamily: "var(--font-sans, system-ui)",
        },
      }}
    />
  );
}
