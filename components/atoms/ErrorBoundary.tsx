"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { toast } from "sonner";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  variant?: "fullscreen" | "inline";
  onReset?: () => void;
  draftText?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log error for diagnostics
    if (typeof console !== "undefined") {
      console.error("[ErrorBoundary caught exception]:", error, errorInfo);
    }
  }

  handleCopyDraft = async () => {
    let textToCopy = this.props.draftText;
    if (!textToCopy && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ai_recap_saved_state");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.notes) textToCopy = parsed.notes;
        }
      } catch {
        // Ignore
      }
    }

    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        this.setState({ copied: true });
        toast.success("Note draft copied to clipboard!");
        setTimeout(() => this.setState({ copied: false }), 2500);
      } catch {
        toast.error("Failed to copy note to clipboard");
      }
    } else {
      toast.info("No active note draft text available to copy");
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    const { hasError, error, errorInfo, copied } = this.state;
    const { children, fallbackTitle, variant = "fullscreen" } = this.props;

    if (!hasError) {
      return children;
    }

    if (variant === "inline") {
      return (
        <div
          role="alert"
          className="my-3 p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-ink-100 flex flex-col gap-2 animate-fade-in text-xs font-sans"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{fallbackTitle || "Component Rendering Error"}</span>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-2 py-0.5 rounded bg-ink-800 hover:bg-ink-700 text-ink-200 hover:text-ink-50 border border-ink-600/60 transition-colors text-[11px]"
            >
              Retry
            </button>
          </div>
          <p className="text-ink-400 text-[11px] font-mono leading-tight truncate">
            {error?.message || "An unexpected rendering error occurred in this view."}
          </p>
        </div>
      );
    }

    return (
      <div
        role="alert"
        className="min-h-screen w-full bg-app-bg text-ink-100 flex items-center justify-center p-4 select-text"
      >
        <div className="w-full max-w-lg bg-app-surface border border-ink-700 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-up">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-50">
                {fallbackTitle || "Workstation Fault Isolated"}
              </h2>
              <p className="text-xs text-ink-300 mt-1 leading-relaxed">
                An unexpected error occurred during rendering. Your saved notes and history in browser storage are safe and intact.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ink-800">
            <button
              type="button"
              onClick={this.handleCopyDraft}
              className="px-3.5 py-1.5 rounded-lg bg-highlight hover:bg-highlight-hover text-highlight-text font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copied ? "Copied to Clipboard!" : "Copy Note Draft to Clipboard"}</span>
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              className="px-3.5 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-200 hover:text-ink-50 font-medium text-xs border border-ink-700 transition-colors"
            >
              Recover View
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="px-3.5 py-1.5 rounded-lg bg-ink-850 hover:bg-ink-800 text-ink-400 hover:text-ink-200 font-medium text-xs border border-ink-700/60 transition-colors"
            >
              Reload Page
            </button>
          </div>

          {error && (
            <details className="mt-2 text-xs border border-ink-800/80 rounded-lg bg-ink-950/60 p-2 text-ink-400">
              <summary className="cursor-pointer select-none font-mono text-[11px] hover:text-ink-200">
                Technical Error Details ({error.name})
              </summary>
              <div className="mt-2 font-mono text-[10px] space-y-1 overflow-x-auto p-1 text-rose-300">
                <p>{error.message}</p>
                {errorInfo?.componentStack && (
                  <pre className="text-ink-500 whitespace-pre-wrap mt-1">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}
