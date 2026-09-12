export interface TocEntry {
  level: number;
  text: string;
  anchorId: string;
}

export function generateToc(markdown: string): TocEntry[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split("\n");
  const entries: TocEntry[] = [];
  const seenIds = new Map<string, number>();

  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      let baseId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      if (!baseId) {
        baseId = `heading-${entries.length + 1}`;
      }

      const count = seenIds.get(baseId) || 0;
      seenIds.set(baseId, count + 1);
      const anchorId = count > 0 ? `${baseId}-${count}` : baseId;

      entries.push({ level, text, anchorId });
    }
  }

  return entries;
}
