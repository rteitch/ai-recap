export type MermaidCategory =
  | "All"
  | "Flow"
  | "Architecture"
  | "Concept"
  | "Timeline & Data";

export interface MermaidTemplate {
  id: string;
  name: string;
  category: "Flow" | "Architecture" | "Concept" | "Timeline & Data";
  description: string;
  code: string;
}

export const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    id: "flowchart-td",
    name: "Flowchart (Process & Decision - TD)",
    category: "Flow",
    description: "Vertical decision tree with branching conditions and status nodes",
    code: `\`\`\`mermaid
flowchart TD
    A([Start Study Session]) --> B[Read Raw Notes]
    B --> C{Understand Core Concept?}
    C -->|Yes| D[Test with Active Recall Quiz]
    C -->|No| E[Review Formulas & Breakdown]
    E --> B
    D --> F{Quiz Score >= 80%?}
    F -->|Yes| G[Mark as Mastered]
    F -->|No| H[Schedule Spaced Repetition]
    H --> B
    G --> I([Session Complete])
\`\`\``,
  },
  {
    id: "flowchart-lr",
    name: "Flowchart (Data Pipeline - LR)",
    category: "Flow",
    description: "Horizontal step-by-step pipeline from input to output",
    code: `\`\`\`mermaid
flowchart LR
    subgraph Input ["Source Stage"]
        A[Raw Markdown Notes]
        B[LaTeX Equations]
    end

    subgraph Processing ["AI Analysis Stage"]
        C[Token Normalizer]
        D[EdgeOne LLM Gateway]
        E[Active Recall Engine]
    end

    subgraph Output ["Study Artifacts"]
        F[Executive Summary]
        G[Self-Test Quiz]
        H[Interactive Flashcards]
    end

    A & B --> C --> D --> E
    E --> F & G & H
\`\`\``,
  },
  {
    id: "sequence-api",
    name: "Sequence Diagram (Client-Server-AI)",
    category: "Architecture",
    description: "Synchronous and asynchronous message exchanges between actors",
    code: `\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Browser)
    participant App as Next.js App Router
    participant Gateway as EdgeOne AI Gateway
    participant DB as IndexedDB Local Storage

    Student->>App: Paste notes & click "AI Recap"
    App->>DB: Save local draft
    App->>Gateway: POST /api/recap (Notes + Prompt)
    activate Gateway
    Gateway-->>App: Return JSON { summary, quiz }
    deactivate Gateway
    App->>DB: Cache study session result
    App-->>Student: Render Summary, Quiz & Flashcards
\`\`\``,
  },
  {
    id: "mindmap-concept",
    name: "Mindmap (Concept Breakdown)",
    category: "Concept",
    description: "Hierarchical concept map branching from a central topic",
    code: `\`\`\`mermaid
mindmap
  root((Classical Mechanics))
    Newton Laws
      First: Inertia
      Second: F = ma
      Third: Action & Reaction
    Energy & Work
      Kinetic: 0.5 * m * v^2
      Potential: m * g * h
      Conservation of Energy
    Thermodynamics
      Ideal Gas Law: PV = nRT
      First Law: dU = dQ - dW
      Entropy & Heat Engines
    Rotational Dynamics
      Torque: r x F
      Angular Momentum
\`\`\``,
  },
  {
    id: "class-oop",
    name: "Class Diagram (Object-Oriented Design)",
    category: "Architecture",
    description: "Classes, attributes, methods, inheritance, and relations",
    code: `\`\`\`mermaid
classDiagram
    class Note {
        +String id
        +String title
        +String content
        +Date createdAt
        +StudyStatus status
        +saveDraft()
        +exportPdf()
    }

    class StudySession {
        +String sessionId
        +Number durationMinutes
        +Number score
        +startQuiz()
        +submitAnswer()
    }

    class QuizQuestion {
        +String question
        +String answer
        +RatingType rating
        +verifyKnowledge()
    }

    class FlashcardDeck {
        +Array~QuizQuestion~ cards
        +Number currentIndex
        +flipCard()
        +nextCard()
    }

    Note "1" *-- "many" QuizQuestion : generates
    StudySession "1" o-- "1" FlashcardDeck : contains
    FlashcardDeck "1" *-- "many" QuizQuestion : holds
\`\`\``,
  },
  {
    id: "erd-database",
    name: "Entity-Relationship Diagram (ERD)",
    category: "Architecture",
    description: "Relational database schema with keys and cardinalities",
    code: `\`\`\`mermaid
erDiagram
    STUDENT ||--o{ NOTE : creates
    STUDENT ||--o{ STUDY_STREAK : maintains
    NOTE ||--o{ QUIZ_ITEM : contains
    NOTE }|--|| NOTEBOOK : belongs_to
    QUIZ_ITEM ||--o{ RETENTION_RECORD : tracks

    STUDENT {
        string id PK
        string email
        string username
        timestamp joined_at
    }

    NOTE {
        string id PK
        string student_id FK
        string notebook_id FK
        string title
        text content
        string status
    }

    QUIZ_ITEM {
        string id PK
        string note_id FK
        string question
        string answer
    }

    RETENTION_RECORD {
        string id PK
        string quiz_id FK
        string rating
        timestamp reviewed_at
    }
\`\`\``,
  },
  {
    id: "state-lifecycle",
    name: "State Diagram (Study Lifecycle)",
    category: "Concept",
    description: "Finite state machine with state transitions and triggers",
    code: `\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft: Create New Note
    Draft --> InProgress: Start Studying & Summarizing
    InProgress --> NeedsReview: Quiz Score < 75%
    InProgress --> Mastered: Quiz Score >= 90%
    NeedsReview --> InProgress: Re-study Flashcards
    NeedsReview --> Mastered: Retest Passed
    Mastered --> Archived: Spaced Repetition Validated
    Archived --> [*]
\`\`\``,
  },
  {
    id: "gantt-schedule",
    name: "Gantt Chart (Study & Exam Schedule)",
    category: "Timeline & Data",
    description: "Project or exam preparation timeline with milestones",
    code: `\`\`\`mermaid
gantt
    title Semester Exam Preparation Schedule
    dateFormat  YYYY-MM-DD
    section Phase 1: Review
    Summarize Chapter 1-3       :done,    des1, 2026-09-01, 2026-09-05
    Active Recall & LaTeX Form  :active,  des2, 2026-09-06, 2026-09-10
    section Phase 2: Drill
    Self-Test Quiz Practice     :         des3, 2026-09-11, 2026-09-16
    Flashcard Spaced Repetition :         des4, 2026-09-17, 2026-09-22
    section Phase 3: Final Mock
    Simulate Midterm Exam       :crit,    des5, 2026-09-23, 2026-09-25
    Exam Day                    :milestone, m1, 2026-09-26, 0d
\`\`\``,
  },
  {
    id: "git-graph",
    name: "Git Graph (Branching & Releases)",
    category: "Timeline & Data",
    description: "Version control branches, commits, and merge points",
    code: `\`\`\`mermaid
gitGraph
    commit id: "Initial commit"
    commit id: "Add LaTeX parser"
    branch feature/mermaid
    checkout feature/mermaid
    commit id: "Add MermaidRenderer"
    commit id: "Add dark theme support"
    checkout main
    merge feature/mermaid id: "Merge Mermaid feature"
    branch release/v2.1
    checkout release/v2.1
    commit id: "Polish responsive drawer"
    commit id: "Release v2.1.0"
    checkout main
    merge release/v2.1 id: "Deploy to Production"
\`\`\``,
  },
  {
    id: "pie-distribution",
    name: "Pie Chart (Study Time Allocation)",
    category: "Timeline & Data",
    description: "Proportional distribution of topics or revision time",
    code: `\`\`\`mermaid
pie title Study Time Allocation by Subject
    "Mathematics & Calculus" : 35
    "Theoretical Physics" : 25
    "Computer Science & Algorithms" : 25
    "Chemistry & Biology" : 15
\`\`\``,
  },
  {
    id: "user-journey",
    name: "User Journey (Learning Experience)",
    category: "Concept",
    description: "Map student emotional journey across study phases",
    code: `\`\`\`mermaid
journey
    title Student Study Workflow Experience
    section Capturing
      Import lecture notes: 4: Student
      Format with LaTeX formulas: 5: Student
    section AI Synthesis
      Trigger AI Recap: 5: Student, AI Companion
      Review structured summary: 5: Student
    section Active Recall
      Take 6-Question Self-Test: 3: Student
      Flip interactive Flashcards: 4: Student
      Master difficult concepts: 5: Student
\`\`\``,
  },
  {
    id: "quadrant-matrix",
    name: "Quadrant Chart (Priority Matrix)",
    category: "Concept",
    description: "2x2 prioritization matrix for exam revision topics",
    code: `\`\`\`mermaid
quadrantChart
    title Exam Topics Priority Matrix
    x-axis Low Understanding --> High Understanding
    y-axis Low Exam Weight --> High Exam Weight
    quadrant-1 Quick Review
    quadrant-2 Urgent Focus
    quadrant-3 Skip or Skim
    quadrant-4 Solid Mastery
    Thermodynamics: [0.3, 0.85]
    Quantum Tunneling: [0.2, 0.9]
    Newtonian Mechanics: [0.8, 0.7]
    Historical Context: [0.7, 0.2]
    Advanced Calculus: [0.4, 0.75]
\`\`\``,
  },
];
