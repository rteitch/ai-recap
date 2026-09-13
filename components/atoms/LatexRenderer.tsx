"use client";

import { useMemo, memo } from "react";
import katex from "katex";
import DOMPurify from "isomorphic-dompurify";

type LatexRendererProps = {
  math: string;
  block?: boolean;
};

export const LatexRenderer = memo(function LatexRenderer({
  math,
  block = false,
}: LatexRendererProps) {
  const html = useMemo(() => {
    try {
      const raw = katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml",
      });
      return DOMPurify.sanitize(raw, {
        USE_PROFILES: { html: true, mathMl: true, svg: true },
        ADD_TAGS: ["semantics", "annotation", "svg", "path"],
        ADD_ATTR: ["aria-hidden", "style", "viewBox", "preserveAspectRatio", "d"],
        FORBID_TAGS: ["script"],
        FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
      });
    } catch {
      return null;
    }
  }, [math, block]);

  if (!html) {
    return (
      <span className="font-mono text-xs text-yellow-400/90" title="Formula display fallback">
        {block ? `$$${math}$$` : `$${math}$`}
      </span>
    );
  }

  if (block) {
    return (
      <div
        role="math"
        aria-label={math}
        className="my-3 overflow-x-auto py-2 text-center text-ink-50 scrollbar-thin"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      role="math"
      aria-label={math}
      className="inline-block px-0.5 text-ink-50 align-baseline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
