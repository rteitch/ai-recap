"use client";

import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "#161722",
          border: "1px solid #282a3a",
          color: "#f3f4f6",
          fontSize: "12px",
          fontFamily: "var(--font-sans, system-ui)",
        },
      }}
    />
  );
}
