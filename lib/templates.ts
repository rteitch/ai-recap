export type StudyTemplate = {
  id: string;
  name: string;
  iconType: "math" | "cornell" | "lecture" | "meeting" | "mermaid";
  description: string;
  content: string;
};

export const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: "system-architecture-mermaid",
    name: "System Architecture & Flow (Mermaid)",
    iconType: "mermaid",
    description: "Flowcharts, sequence diagrams, mindmaps, and technical architecture with KaTeX",
    content: `# Architecture & Workflow: Distributed AI Recap System

## 1. System Flow & Decision Tree
\`\`\`mermaid
flowchart TD
    A([Student Notes Input]) --> B[Client-Side Sanitization]
    B --> C{Contains LaTeX Formulas?}
    C -->|Yes| D[Render KaTeX Delimiters $...$]
    C -->|No| E[Plain Text Parser]
    D & E --> F[Post to EdgeOne AI Gateway]
    F --> G{Response Status}
    G -->|200 OK| H[Store in IndexedDB]
    G -->|429 Rate Limit| I[Display Quota Warning]
    H --> J[Generate Summary & Flashcards]
\`\`\`

## 2. Component Sequence Interaction
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant UI as Editor & Workstation
    participant API as Next.js API (/api/recap)
    participant AI as EdgeOne LLM Gateway
    participant Storage as IndexedDB

    User->>UI: Types markdown & formulas
    UI->>Storage: Auto-save draft (0 tokens)
    User->>UI: Click "AI Recap"
    UI->>API: POST notes + customConfig
    API->>AI: Model Chain Request
    AI-->>API: Structured JSON { summary, quiz }
    API-->>UI: Return study artifacts
    UI-->>User: Active Recall Quiz ready
\`\`\`

## 3. Mathematical Foundations
The rate of transmission and information entropy is given by Claude Shannon's formulation:
$$H(X) = -\\sum_{i=1}^{n} P(x_i) \\log_2 P(x_i)$$
`,
  },
  {
    id: "science-latex",
    name: "Science & Math (LaTeX)",
    iconType: "math",
    description: "Physics formulas, quadratic equations, and ideal gas law with KaTeX notation",
    content: `# Concept: Thermodynamics & Special Relativity

## 1. Mass-Energy Equivalence
According to Albert Einstein's special theory of relativity, mass and energy are equivalent entities and formulated as:
$$E = mc^2$$
Where $c \\approx 3 \\times 10^8\\text{ m/s}$ is the speed of light in vacuum.

## 2. Ideal Gas Law
In classical thermodynamics, an ideal gas satisfies the macroscopic relation:
$$PV = nRT$$
- $P$ = Gas pressure (Pascals)
- $V$ = Gas volume ($m^3$)
- $n$ = Amount of substance (moles)
- $R \\approx 8.314\\text{ J/(mol}\\cdot\\text{K)}$ = Universal gas constant
- $T$ = Absolute temperature (Kelvin)

## 3. Quadratic Polynomial Solution
For the quadratic equation $ax^2 + bx + c = 0$, its roots are given by:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
`,
  },
  {
    id: "cornell",
    name: "Cornell Method (Active Recall)",
    iconType: "cornell",
    description: "High-retention note-taking: Key cues, core lecture notes, and summary",
    content: `# Topic: 
Subject / Course: 
Date: 

### Cues & Key Questions
- What core concept is the main focus of this chapter?
- What cause-and-effect relationship is explained?
- How is this formula/theory applied to solve real-world problems?

### Core Notes (Lecture Notes)
- Key Point: 
- Detailed Explanation: 
- Evidence / Case Study: 
- Key Terminology: 

### Summary
Write a 2-3 sentence core synthesis in your own words to practice active retrieval.
`,
  },
  {
    id: "lecture",
    name: "Lecture & Textbook Chapter",
    iconType: "lecture",
    description: "Comprehensive lecture framework: Background, mechanism, and exam focus",
    content: `# Chapter Title: 
Lecturer / Author: 

## 1. Background & Problem
- Foundational problem introducing this topic:
- Underlying assumptions used:

## 2. Theory & Working Mechanism
- Formal definition:
- Step-by-step systematic process:
- Exceptions or boundary conditions:

## 3. Key Points for Examination
- High-yield analytical concepts:
- Crucial distinctions not to confuse:
`,
  },
  {
    id: "meeting",
    name: "Meeting & Action Plan",
    iconType: "meeting",
    description: "Action-oriented documentation: Context, decisions, and action items",
    content: `# Project Meeting: 
Date & Time: 
Participants: 

## Main Agenda
1. Review previous progress
2. Discuss technical and operational bottlenecks
3. Establish targets for upcoming cycle

## Agreed Decisions
- Decision 1: 
- Decision 2: 

## Action Items
- [ ] Task 1 (Assignee: @someone, Due: YYYY-MM-DD)
- [ ] Task 2 (Assignee: @someone, Due: YYYY-MM-DD)
`,
  },
];
