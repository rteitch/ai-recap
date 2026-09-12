export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  category: "format" | "math" | "code" | "layout";
  insertText: string;
  cursorOffset: number; // Offset from start of insertion to place cursor
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "h1",
    label: "Heading 1 (Main Title)",
    description: "Level 1 chapter title",
    category: "format",
    insertText: "# ",
    cursorOffset: 2,
  },
  {
    id: "h2",
    label: "Heading 2 (Section Header)",
    description: "Level 2 section header",
    category: "format",
    insertText: "## ",
    cursorOffset: 3,
  },
  {
    id: "h3",
    label: "Heading 3 (Sub-section)",
    description: "Level 3 specific topic",
    category: "format",
    insertText: "### ",
    cursorOffset: 4,
  },
  {
    id: "mathblock",
    label: "Math Block Formula ($$)",
    description: "Centered math/physics formula (KaTeX)",
    category: "math",
    insertText: "$$\n\\frac{a}{b}\n$$",
    cursorOffset: 3,
  },
  {
    id: "bullet",
    label: "Bullet List",
    description: "Unordered bullet points",
    category: "format",
    insertText: "- ",
    cursorOffset: 2,
  },
  {
    id: "numbered",
    label: "Numbered List (1, 2, 3)",
    description: "Step-by-step ordered list",
    category: "format",
    insertText: "1. ",
    cursorOffset: 3,
  },
  {
    id: "todo",
    label: "Task / Study Checklist",
    description: "Interactive checklist with checkboxes",
    category: "format",
    insertText: "- [ ] ",
    cursorOffset: 6,
  },
  {
    id: "quote",
    label: "Callout / Important Note",
    description: "Highlight block for important formulas or definitions",
    category: "format",
    insertText: "> **Important Note:** ",
    cursorOffset: 20,
  },
  {
    id: "code",
    label: "Code Block",
    description: "Code block with syntax highlighting",
    category: "code",
    insertText: "```typescript\n\n```",
    cursorOffset: 14,
  },
  {
    id: "table",
    label: "Comparison Table",
    description: "Two-column table to compare concepts",
    category: "layout",
    insertText: "| Concept A | Concept B |\n|---|---|\n| Description A | Description B |",
    cursorOffset: 2,
  },
  {
    id: "divider",
    label: "Divider Line",
    description: "Horizontal divider between sections",
    category: "layout",
    insertText: "---\n",
    cursorOffset: 4,
  },
  {
    id: "mermaid",
    label: "Mermaid Flowchart",
    description: "Interactive decision tree / process flow diagram",
    category: "layout",
    insertText: "```mermaid\nflowchart TD\n    A[Start] --> B{Condition}\n    B -->|Yes| C[Proceed]\n    B -->|No| D[Revise]\n```\n",
    cursorOffset: 12,
  },
  {
    id: "mindmap",
    label: "Mermaid Mindmap",
    description: "Hierarchical concept breakdown diagram",
    category: "layout",
    insertText: "```mermaid\nmindmap\n  root((Central Topic))\n    Branch 1\n      Sub-idea A\n    Branch 2\n      Sub-idea B\n```\n",
    cursorOffset: 12,
  },
  {
    id: "sequence",
    label: "Mermaid Sequence Diagram",
    description: "Interaction between actors and services",
    category: "layout",
    insertText: "```mermaid\nsequenceDiagram\n    actor User\n    participant App\n    participant API\n    User->>App: Request Action\n    App->>API: Query Data\n    API-->>App: Return Result\n    App-->>User: Display Output\n```\n",
    cursorOffset: 12,
  },
];
