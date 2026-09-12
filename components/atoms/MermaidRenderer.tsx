"use client";

import { useEffect, useState, useRef, useId, memo } from "react";
import DOMPurify from "isomorphic-dompurify";

type MermaidRendererProps = {
  code: string;
};

// Module-level singleton instance & initialization promise to avoid duplicate imports
let cachedMermaid: any = null;
let mermaidInitPromise: Promise<any> | null = null;

async function getMermaidInstance() {
  if (cachedMermaid) return cachedMermaid;
  if (!mermaidInitPromise) {
    mermaidInitPromise = import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
        themeVariables: {
          darkMode: true,
          background: "#13141a",
          primaryColor: "#272935",
          primaryTextColor: "#f1f2f6",
          primaryBorderColor: "#F5C518",
          lineColor: "#8b8d98",
          secondaryColor: "#1e1f29",
          tertiaryColor: "#181922",
          mainBkg: "#1d1e28",
          nodeBorder: "#F5C518",
          clusterBkg: "#161720",
          clusterBorder: "#383a4c",
          titleColor: "#f1f2f6",
          edgeLabelBackground: "#1e1f29",
        },
        fontFamily: "inherit",
      });
      cachedMermaid = mermaid;
      return mermaid;
    });
  }
  return mermaidInitPromise;
}

export const MermaidRenderer = memo(function MermaidRenderer({ code }: MermaidRendererProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, "m");
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidSvgRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    // Clear any previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setIsLoading(false);
      setSvgContent(null);
      setRenderError(null);
      return;
    }

    // If we don't have an SVG yet, show initial loading
    if (!lastValidSvgRef.current) {
      setIsLoading(true);
    }

    // Debounce rendering by 280ms to avoid DOM thrashing and lag during rapid live typing
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const mermaid = await getMermaidInstance();
        if (isCancelled) return;

        // Generate clean unique ID for SVG element
        const id = `mermaid-${uniqueId}-${Math.random().toString(36).slice(2, 7)}`;

// mermaid.render returns { svg }
const { svg: rawSvg } = await mermaid.render(id, trimmedCode);
const sanitizedSvg = DOMPurify.sanitize(rawSvg, { USE_PROFILES: { svg: true } });

if (!isCancelled) {
  lastValidSvgRef.current = sanitizedSvg;
  setSvgContent(sanitizedSvg);
  setRenderError(null);
  setIsLoading(false);
}
      } catch (err) {
        if (!isCancelled) {
          // Clean up any stray error elements mermaid may have injected into document.body
          try {
            const strayElements = document.querySelectorAll(`[id^="dmermaid-${uniqueId}"]`);
            strayElements.forEach((el) => el.remove());
          } catch {
            // Ignore DOM query errors
          }

          // If we already had a valid diagram, keep showing it so typing doesn't collapse the view
          if (!lastValidSvgRef.current) {
            const errMsg = err instanceof Error ? err.message : String(err);
            setRenderError(errMsg);
          }
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      isCancelled = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, uniqueId]);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (renderError && !svgContent) {
    return (
      <div className="my-3 rounded-lg border border-ink-700 bg-ink-950 overflow-hidden shadow-md text-xs font-mono">
        <div className="flex items-center justify-between px-3 py-1.5 bg-ink-900 border-b border-ink-800 text-ink-400">
          <div className="flex items-center gap-1.5 text-yellow-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[11px] font-semibold text-yellow-400">Mermaid Diagram (Editing...)</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] hover:text-ink-100 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-800"
          >
            {copied ? "Copied" : "Copy Code"}
          </button>
        </div>
        <div className="p-3 text-ink-300 overflow-x-auto">
          <pre className="text-[11px] font-mono leading-relaxed">{code}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-ink-700/80 bg-[#14151e] overflow-hidden shadow-lg group">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181924] border-b border-ink-800/80 text-ink-400">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span className="text-[11px] font-medium tracking-wide text-ink-200">
            Mermaid Diagram
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-ink-100 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-800"
          title="Copy Mermaid source code"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Diagram Canvas */}
      <div
        ref={containerRef}
        className="p-4 overflow-x-auto flex items-center justify-center min-h-[120px] bg-[#12131b] scrollbar-thin print:bg-white print:p-2"
      >
        {isLoading && !svgContent ? (
          <div className="flex items-center gap-2 text-xs text-ink-400 animate-pulse py-8">
            <svg className="w-4 h-4 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>Rendering diagram…</span>
          </div>
        ) : svgContent ? (
          <div
            className="mermaid-svg-wrapper w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : null}
      </div>
    </div>
  );
});
