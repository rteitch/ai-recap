"use client";

import { memo, Fragment, useState, useEffect } from "react";
import { LatexRenderer } from "./LatexRenderer";
import { MermaidRenderer } from "./MermaidRenderer";
import { getImageUrl } from "@/lib/imageStorage";

type FormattedTextProps = {
  text: string;
};

type CodeToken = {
  type: "keyword" | "string" | "comment" | "number" | "boolean" | "plain";
  text: string;
};

const CODE_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
  "switch", "case", "break", "continue", "default", "import", "export", "from",
  "class", "extends", "super", "this", "new", "try", "catch", "finally", "throw",
  "async", "await", "yield", "type", "interface", "enum", "implements", "public",
  "private", "protected", "static", "readonly", "def", "lambda", "elif", "pass",
  "with", "as", "raise", "except", "in", "is", "not", "and", "or", "self",
  "select", "from", "where", "insert", "into", "update", "delete", "join", "inner",
  "left", "right", "outer", "group", "order", "by", "having", "limit", "create",
  "table", "drop", "alter", "primary", "key",
]);

const CODE_LITERALS = new Set([
  "true", "false", "null", "undefined", "None", "True", "False", "NaN", "Infinity",
  "string", "number", "boolean", "any", "void", "never", "unknown", "object"
]);

function tokenizeCodeLine(line: string, language: string): CodeToken[] {
  const lang = (language || "").toLowerCase().trim();
  if (lang === "text" || lang === "plain" || lang === "txt") {
    return [{ type: "plain", text: line }];
  }

  const isPythonOrBash = lang === "python" || lang === "py" || lang === "bash" || lang === "sh" || lang === "shell";
  const regex = isPythonOrBash
    ? /(#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_]\w*)|([^\s\w#"']+)|(\s+)/g
    : /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_]\w*)|([^\s\w"'/]+)|(\s+)/g;

  const tokens: CodeToken[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const fullMatch = match[0];
    const comment = match[1];
    const str = match[2];
    const num = match[3];
    const word = match[4];

    if (comment) {
      tokens.push({ type: "comment", text: comment });
    } else if (str) {
      tokens.push({ type: "string", text: str });
    } else if (num) {
      tokens.push({ type: "number", text: num });
    } else if (word) {
      const lower = word.toLowerCase();
      if (CODE_KEYWORDS.has(lower)) {
        tokens.push({ type: "keyword", text: word });
      } else if (CODE_LITERALS.has(word) || CODE_LITERALS.has(lower)) {
        tokens.push({ type: "boolean", text: word });
      } else {
        tokens.push({ type: "plain", text: word });
      }
    } else {
      tokens.push({ type: "plain", text: fullMatch });
    }
  }

  if (tokens.length === 0) {
    tokens.push({ type: "plain", text: line });
  }

  return tokens;
}

function renderCodeToken(token: CodeToken, idx: number) {
  switch (token.type) {
    case "keyword":
      return <span key={idx} className="text-purple-400 font-semibold print:text-purple-700">{token.text}</span>;
    case "string":
      return <span key={idx} className="text-emerald-400 print:text-emerald-700">{token.text}</span>;
    case "comment":
      return <span key={idx} className="text-ink-500 italic print:text-gray-500">{token.text}</span>;
    case "number":
      return <span key={idx} className="text-amber-400 print:text-amber-700">{token.text}</span>;
    case "boolean":
      return <span key={idx} className="text-cyan-400 print:text-cyan-700">{token.text}</span>;
    default:
      return <span key={idx}>{token.text}</span>;
  }
}

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
    <div className="my-3 rounded-lg border border-ink-700 bg-ink-950 overflow-hidden shadow-md text-xs font-mono print:bg-white print:border-gray-300 print:text-black print:shadow-none print:break-inside-avoid print:page-break-inside-avoid">
      <div className="flex items-center justify-between px-3 py-1.5 bg-ink-900 border-b border-ink-800 text-ink-400 print:bg-gray-100 print:border-gray-200 print:text-gray-700">
        <span className="text-[11px] font-medium uppercase tracking-wider text-highlight print:text-gray-900">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-ink-100 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-800 print:hidden"
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
      <div className="overflow-x-auto p-3 text-ink-200 flex print:text-black print:bg-white">
        <div className="select-none pr-3 text-right text-ink-600 border-r border-ink-800/80 mr-3 text-[11px] print:border-gray-200 print:text-gray-400">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 font-mono text-[12px] leading-relaxed">
          <code>
            {lines.map((line, lineIdx) => {
              const tokens = tokenizeCodeLine(line, language);
              return (
                <div key={lineIdx}>
                  {tokens.map((token, tokenIdx) => renderCodeToken(token, tokenIdx))}
                </div>
              );
            })}
          </code>
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
        Image not found (ID: {id})
      </div>
    );
  }

  if (!src) {
    return (
      <div className="my-2 px-3 py-2 rounded border border-ink-700 bg-ink-900 text-ink-400 text-xs animate-pulse">
        Loading image...
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

  const tokenRegex = /(\$\$[^$\n]+\$\$|\$[^$\n]+\$|\\\([^\)]+\\\)|\*\*[^*]+\*\*|`[^`]+`|!\[[^\]]*\]\(image:\d+\))/g;
  const parts = segment.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline math: $$...$$
    if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
      const math = part.slice(2, -2).trim();
      return <LatexRenderer key={index} math={math} block={false} />;
    }

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

// Helper to parse table row cells: "| A | B | C |" -> ["A", "B", "C"]
function parseTableRow(line: string): string[] {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((cell) => cell.trim());
}

// Check if a line is a markdown table separator: "| --- | :---: | ---: |"
function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("-")) return false;
  const cells = parseTableRow(trimmed);
  if (cells.length === 0) return false;
  return cells.every((c) => /^:?-+:?$/.test(c));
}

// Parse alignments from separator cells
function parseAlignments(sepLine: string): ("left" | "center" | "right")[] {
  const cells = parseTableRow(sepLine);
  return cells.map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

type CalloutType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

const CALLOUT_CONFIGS: Record<
  CalloutType,
  { label: string; border: string; bg: string; text: string; icon: React.ReactNode }
> = {
  NOTE: {
    label: "Note",
    border: "border-sky-500/70",
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  TIP: {
    label: "Tip",
    border: "border-emerald-500/70",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  IMPORTANT: {
    label: "Important",
    border: "border-purple-500/70",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  WARNING: {
    label: "Warning",
    border: "border-amber-500/70",
    bg: "bg-amber-500/10",
    text: "text-amber-800 dark:text-amber-300 font-semibold",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  CAUTION: {
    label: "Caution",
    border: "border-rose-500/70",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
      </svg>
    ),
  },
};

// Parses line-level Markdown (headings, tables, callouts, lists, blockquotes, horizontal dividers)
function parseMarkdownLines(text: string) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Table Detection: line starts and ends with '|', next line is a separator
    if (
      trimmed.startsWith("|") &&
      trimmed.endsWith("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headerCells = parseTableRow(trimmed);
      const sepLine = lines[i + 1];
      const alignments = parseAlignments(sepLine);
      const rows: string[][] = [];
      i += 2;

      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        rows.push(parseTableRow(lines[i].trim()));
        i++;
      }

      nodes.push(
        <div
          key={`table-${i}`}
          className="my-3 overflow-x-auto rounded-lg border border-ink-700/80 shadow-sm print:border-gray-300 print:my-2"
        >
          <table className="w-full text-xs border-collapse">
            <thead className="bg-app-card text-ink-100 font-semibold border-b border-ink-700 print:bg-gray-100 print:text-black">
              <tr>
                {headerCells.map((h, cIdx) => (
                  <th
                    key={cIdx}
                    className="px-3 py-2 text-left font-semibold"
                    style={{ textAlign: alignments[cIdx] || "left" }}
                  >
                    {parseInlineTokens(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/80 print:divide-gray-200">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-ink-800/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3 py-1.5 text-ink-200 print:text-black"
                      style={{ textAlign: alignments[cIdx] || "left" }}
                    >
                      {parseInlineTokens(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 2. Callout / Alert Detection: > [!TYPE]
    const calloutMatch = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i.exec(trimmed);
    if (calloutMatch) {
      const type = calloutMatch[1].toUpperCase() as CalloutType;
      const firstLineContent = calloutMatch[2];
      const config = CALLOUT_CONFIGS[type];
      const bodyLines: string[] = [];
      if (firstLineContent.trim()) {
        bodyLines.push(firstLineContent.trim());
      }
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        const nextContent = lines[i].trim().replace(/^>\s*/, "");
        bodyLines.push(nextContent);
        i++;
      }

      nodes.push(
        <div
          key={`callout-${i}`}
          className={`callout-box my-2.5 p-3 rounded-lg border-l-4 ${config.border} ${config.bg} print:border-gray-600 print:bg-gray-50`}
        >
          <div className={`flex items-center gap-1.5 font-bold text-xs ${config.text} mb-1 print:text-gray-900`}>
            {config.icon}
            <span>{config.label}</span>
          </div>
          <div className="text-xs text-ink-200 leading-relaxed space-y-1 print:text-gray-800">
            {bodyLines.map((bLine, bIdx) => (
              <div key={bIdx}>{parseInlineTokens(bLine)}</div>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // 3. Standard Blockquote: > ...
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      nodes.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-2 border-highlight bg-ink-850/60 pl-3 pr-2 py-1.5 my-1.5 rounded-r text-xs text-ink-200 italic"
        >
          {quoteLines.map((qLine, qIdx) => (
            <div key={qIdx}>{parseInlineTokens(qLine)}</div>
          ))}
        </blockquote>
      );
      continue;
    }

    // 4. Horizontal Rule: --- or ***
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      nodes.push(<hr key={`hr-${i}`} className="my-3 border-ink-700/60" />);
      i++;
      continue;
    }

    // 5. Headings: #, ##, ###
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const anchorId = getHeadingAnchor(headingText);

      if (level === 1) {
        nodes.push(
          <h1
            key={`h1-${i}`}
            id={anchorId}
            className="text-lg sm:text-xl font-bold text-ink-50 mt-4 mb-2 pb-1 border-b border-ink-700/60 scroll-mt-6"
          >
            {parseInlineTokens(headingText)}
          </h1>
        );
      } else if (level === 2) {
        nodes.push(
          <h2
            key={`h2-${i}`}
            id={anchorId}
            className="text-base sm:text-lg font-semibold text-ink-100 mt-3 mb-1.5 scroll-mt-6"
          >
            {parseInlineTokens(headingText)}
          </h2>
        );
      } else {
        nodes.push(
          <h3
            key={`h3-${i}`}
            id={anchorId}
            className="text-sm sm:text-base font-semibold text-ink-200 mt-2.5 mb-1 scroll-mt-6"
          >
            {parseInlineTokens(headingText)}
          </h3>
        );
      }
      i++;
      continue;
    }

    // 6. Checklist item: - [ ] or - [x]
    const checkMatch = /^-\s*\[([ xX])\]\s*(.*)$/.exec(trimmed);
    if (checkMatch) {
      const isChecked = checkMatch[1].toLowerCase() === "x";
      nodes.push(
        <div key={`chk-${i}`} className="flex items-center gap-2 my-0.5 text-xs text-ink-200">
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
      i++;
      continue;
    }

    // 7. Bullet List: - or *
    if (/^[-*]\s+/.test(trimmed)) {
      const listContent = trimmed.replace(/^[-*]\s+/, "");
      nodes.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-0.5 text-xs text-ink-200 pl-2">
          <span className="text-highlight mt-1 text-[8px]">•</span>
          <span className="flex-1">{parseInlineTokens(listContent)}</span>
        </div>
      );
      i++;
      continue;
    }

    // 8. Image-only line: ![alt](image:id)
    const imageLineMatch = /^!\[([^\]]*)\]\(image:(\d+)\)$/.exec(trimmed);
    if (imageLineMatch) {
      const alt = imageLineMatch[1];
      const id = parseInt(imageLineMatch[2], 10);
      nodes.push(<ImageBlock key={`img-${i}`} id={id} alt={alt} />);
      i++;
      continue;
    }

    // 9. Regular line
    nodes.push(
      <Fragment key={`line-${i}`}>
        {i > 0 && <br />}
        {parseInlineTokens(line)}
      </Fragment>
    );
    i++;
  }

  return nodes;
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
