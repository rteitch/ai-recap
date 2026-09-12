/**
 * Tag utility functions for AI Recap
 * Handles hashtag extraction from note markdown, tag normalization,
 * and deterministic color dot generation for custom tags.
 */

export const KNOWN_TAG_COLORS: Record<string, string> = {
  math: "bg-blue-400",
  physics: "bg-cyan-400",
  ai: "bg-purple-400",
  study: "bg-emerald-400",
  kuliah: "bg-emerald-400",
  ujian: "bg-amber-400",
  exam: "bg-amber-400",
  sains: "bg-teal-400",
  science: "bg-teal-400",
  coding: "bg-pink-400",
  draft: "bg-stone-400",
  template: "bg-yellow-400",
  biology: "bg-emerald-400",
  chemistry: "bg-indigo-400",
  history: "bg-stone-300",
};

const PALETTE = [
  "bg-blue-400",
  "bg-purple-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-cyan-400",
  "bg-pink-400",
  "bg-indigo-400",
  "bg-teal-400",
  "bg-rose-400",
  "bg-lime-400",
];

/**
 * Returns a deterministic Tailwind background color class for any tag name
 */
export function getTagDotColor(tag: string): string {
  const clean = tag.toLowerCase().trim();
  if (KNOWN_TAG_COLORS[clean]) return KNOWN_TAG_COLORS[clean];
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

/**
 * Cleans a tag string by stripping leading hashes/spaces and lowercasing
 */
export function normalizeTag(tag: string): string {
  return tag.replace(/^[#\s]+/, "").trim().toLowerCase();
}

/**
 * Extracts hashtags from note markdown content.
 * Matches `#tag` (e.g. `#physics`, `#exam-2026`, `#chapter1`)
 * Avoids markdown headings (`# Heading` which requires a space after `#`).
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const regex = /(?:^|\s)#([a-zA-Z_][a-zA-Z0-9_-]*)/g;
  const tags = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const t = match[1].toLowerCase().trim();
    if (t.length >= 2 && !/^\d+$/.test(t)) {
      tags.add(t);
    }
  }
  return Array.from(tags);
}
