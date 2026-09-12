"use client";

import { memo, Fragment, useState, useEffect } from "react";
import { LatexRenderer } from "./LatexRenderer";
import { MermaidRenderer } from "./MermaidRenderer";
import { getImageUrl } from "@/lib/imageStorage";

type FormattedTextProps = {
  text: string;
};

// Sub-component for advanced code block with language badge & copy button
function CodeBlockView({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const lines = code.split("\n");

  return (
    <div className="my-3 rounded-lg border border-ink-700 bg-ink-950 overflow-hidden shadow-md text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-ink-900 border-b border-ink-800 text-ink-400">
        <span className="text-[11px] font-medium uppercase tracking-wider text-highlight">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-ink-100 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-800"
          title="Copy code"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3 text-ink-200 flex">
        <div className="select-none pr-3 text-right text-ink-600 border-r border-ink-800/80 mr-3 text-[11px]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 font-mono text-[12px] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

// Helper to generate anchor ID for headings (matches generateToc)
function getHeadingAnchor(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned || "heading";
}

// Parses inline tokens (inline math `$..$` or `\(..\)`, bold `**..**`, code `` `..` ``)
function ImageBlock({ id, alt }: { id: number; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getImageUrl(id).then((url) => {
      if (!cancelled) {
        if (url) {
          setSrc(url);
        } else {
          setError(true);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="my-2 px-3 py-2 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
        Gambar tidak ditemukan (ID: {id})
      </div>
    );
  }

  if (!src) {
    return (
      <div className="my-2 px-3 py-2 rounded border border-ink-700 bg-ink-900 text-ink-400 text-xs animate-pulse">
        Memuat gambar...
      </div>
    );
  }

  return (
    <figure className="my-3">
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg border border-ink-700/60 shadow-md"
        loading="lazy"
      />
      {alt && (
        <figcaption className="mt-1 text-center text-[11px] text-ink-400 italic">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

function parseInlineTokens(segment: string) {
  if (!segment) return null;

  const tokenRegex = /(\$[^$\n]+\$|\\\([^\)]+\\\)|\*\*[^*]+\*\*|`[^`]+`|!\[[^\]]*\]\(image:\d+\))/g;
  const parts = segment.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline math: $...$
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const math = part.slice(1, -1).trim();
      return <LatexRenderer key={index} math={math} block={false} />;
    }

    // Inline math: \(...\)
    if (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4) {
      const math = part.slice(2, -2).trim();
      return <LatexRenderer key={index} math={math} block={false} />;
    }

    // Bold text: **...**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-ink-50">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code: `...`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-ink-900 text-highlight border border-ink-600/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Image: ![alt](image:id)
    const imageMatch = /^!\[([^\]]*)\]\(image:(\d+)\)$/.exec(part);
    if (imageMatch) {
      const alt = imageMatch[1];
      const id = parseInt(imageMatch[2], 10);
      return <ImageBlock key={index} id={id} alt={alt} />;
    }

    // Regular text
    return <Fragment key={index}>{part}</Fragment>;
  });
}

// Parses line-level Markdown (headings, lists, blockquotes, horizontal dividers)
function parseMarkdownLines(text: string) {
  const lines = text.split("\n");

  return lines.map((line, lIdx) => {
    const trimmed = line.trim();

    // Horizontal Rule: --- or ***
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      return <hr key={lIdx} className="my-3 border-ink-700/60" />;
    }

    // Headings: #, ##, ###
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const anchorId = getHeadingAnchor(headingText);

      if (level === 1) {
        return (
          <h1
            key={lIdx}
            id={anchorId}
            className="text-lg sm:text-xl font-bold text-ink-50 mt-4 mb-2 pb-1 border-b border-ink-700/60 scroll-mt-6"
          >
            {parseInlineTokens(headingText)}
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2
            key={lIdx}
            id={anchorId}
            className="text-base sm:text-lg font-semibold text-ink-100 mt-3 mb-1.5 scroll-mt-6"
          >
            {parseInlineTokens(headingText)}
          </h2>
        );
      }
      return (
        <h3
          key={lIdx}
          id={anchorId}
          className="text-sm sm:text-base font-semibold text-ink-200 mt-2.5 mb-1 scroll-mt-6"
        >
          {parseInlineTokens(headingText)}
        </h3>
      );
    }

    // Blockquote: > ...
    if (trimmed.startsWith(">")) {
      const quoteContent = trimmed.replace(/^>\s*/, "");
      return (
        <blockquote
          key={lIdx}
          className="border-l-2 border-highlight bg-ink-850/60 pl-3 pr-2 py-1.5 my-1.5 rounded-r text-xs text-ink-200 italic"
        >
          {parseInlineTokens(quoteContent)}
        </blockquote>
      );
    }

    // Checklist item: - [ ] or - [x]
    const checkMatch = /^-\s*\[([ xX])\]\s*(.*)$/.exec(trimmed);
    if (checkMatch) {
      const isChecked = checkMatch[1].toLowerCase() === "x";
      return (
        <div key={lIdx} className="flex items-center gap-2 my-0.5 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="rounded border-ink-600 text-highlight focus:ring-0 cursor-default"
          />
          <span className={isChecked ? "line-through text-ink-500" : ""}>
            {parseInlineTokens(checkMatch[2])}
          </span>
        </div>
      );
    }

    // Bullet List: - or *
    if (/^[-*]\s+/.test(trimmed)) {
      const listContent = trimmed.replace(/^[-*]\s+/, "");
      return (
        <div key={lIdx} className="flex items-start gap-2 my-0.5 text-xs text-ink-200 pl-2">
          <span className="text-highlight mt-1 text-[8px]">•</span>
          <span className="flex-1">{parseInlineTokens(listContent)}</span>
        </div>
      );
    }

    // Image-only line: ![alt](image:id)
    const imageLineMatch = /^!\[([^\]]*)\]\(image:(\d+)\)$/.exec(trimmed);
    if (imageLineMatch) {
      const alt = imageLineMatch[1];
      const id = parseInt(imageLineMatch[2], 10);
      return <ImageBlock key={lIdx} id={id} alt={alt} />;
    }

    // Regular line
    return (
      <Fragment key={lIdx}>
        {lIdx > 0 && <br />}
        {parseInlineTokens(line)}
      </Fragment>
    );
  });
}

export const FormattedText = memo(function FormattedText({ text }: FormattedTextProps) {
  if (!text) return null;

  // Split text by block elements:
  // 1. Block Math: $$...$$ or \[...\]
  // 2. Fenced Code Blocks: ```...```
  const masterBlockRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|```[\s\S]*?```)/g;
  const segments = text.split(masterBlockRegex);

  return (
    <>
      {segments.map((segment, idx) => {
        if (!segment) return null;

        // Fenced Code Block: ```...```
        if (segment.startsWith("```") && segment.endsWith("```") && segment.length >= 6) {
          const inner = segment.slice(3, -3);
          const firstLineBreak = inner.indexOf("\n");
          let language = "";
          let code = inner;
          if (firstLineBreak !== -1) {
            language = inner.slice(0, firstLineBreak).trim();
            code = inner.slice(firstLineBreak + 1);
          }
          if (language.toLowerCase() === "mermaid") {
            return <MermaidRenderer key={idx} code={code} />;
          }
          return <CodeBlockView key={idx} language={language} code={code} />;
        }

        // Block math: $$...$$
        if (segment.startsWith("$$") && segment.endsWith("$$") && segment.length >= 4) {
          const math = segment.slice(2, -2).trim();
          return <LatexRenderer key={idx} math={math} block={true} />;
        }

        // Block math: \[...\]
        if (segment.startsWith("\\[") && segment.endsWith("\\]") && segment.length >= 4) {
          const math = segment.slice(2, -2).trim();
          return <LatexRenderer key={idx} math={math} block={true} />;
        }

        // Regular Markdown lines
        return <Fragment key={idx}>{parseMarkdownLines(segment)}</Fragment>;
      })}
    </>
  );
});
