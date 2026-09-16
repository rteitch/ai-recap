export type StudyTemplate = {
  id: string;
  name: string;
  iconType: "math" | "cornell" | "lecture" | "meeting" | "mermaid";
  description: string;
  content: string;
};

export const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: "cornell",
    name: "Cornell Note-Taking (Active Recall & Synthesis)",
    iconType: "cornell",
    description: "High-retention methodology: Key cues, core lecture notes, formula callouts, and 2-sentence summary",
    content: `# Topic: Distributed Systems & Consensus
Subject / Module: Computer Science CS-401
Date: 2026-09-16

### Cues & Retrieval Prompts
- What fundamental problem does consensus solve in an asynchronous distributed network?
- How does Raft distinguish leader election from log replication?
- What is the CAP theorem tradeoff when network partition $P$ occurs?

### Core Notes & Analysis
- **Consensus Guarantee**: Ensures multiple distinct nodes agree on state machine transitions despite network failures or delayed packets.
- **Raft State Machine**:
  - Three distinct roles: *Follower*, *Candidate*, and *Leader*.
  - Randomized election timeout ($150\\text{ms} - 300\\text{ms}$) prevents split-vote deadlocks.
  - Heartbeat messages (\`AppendEntries\`) maintain leader authority.
- **CAP Theorem Formulation**:
  $$N_{\\text{available}} + N_{\\text{consistent}} \\le \\text{Total Guarantee during Partition } P$$

> [!TIP]
> Always cover the right column and test your recall using only the *Cues & Retrieval Prompts* column on the left.

### 2-Sentence Active Retrieval Summary
Consensus algorithms ensure fault-tolerant state consistency across untrusted or asynchronous networks by establishing a single leader through quorum voting. Under network partitions, systems must choose between immediate consistency or uninterrupted availability.
`,
  },

  {
    id: "science-latex",
    name: "Science, Physics & Mathematics (LaTeX)",
    iconType: "math",
    description: "Physics laws, thermodynamic equations, physical constants table, and KaTeX notations",
    content: `# Concept: Modern Physics, Thermodynamics & Classical Mechanics

## 1. Mass-Energy Equivalence & Relativity
According to Albert Einstein's special theory of relativity, mass and energy are equivalent:
$$E = mc^2$$
Where $c \\approx 2.998 \\times 10^8\\text{ m/s}$ is the speed of light in vacuum. The Lorentz transformation factor $\\gamma$ is defined as:
$$\\gamma = \\frac{1}{\\sqrt{1 - \\frac{v^2}{c^2}}}$$

## 2. Table of Fundamental Physical Constants
| Constant | Symbol | Standard Value | SI Unit |
| :--- | :---: | :---: | :--- |
| Speed of Light | $c$ | $2.998 \\times 10^8$ | $\\text{m/s}$ |
| Planck Constant | $h$ | $6.626 \\times 10^{-34}$ | $\\text{J}\\cdot\\text{s}$ |
| Universal Gravitational Constant | $G$ | $6.674 \\times 10^{-11}$ | $\\text{N}\\cdot\\text{m}^2/\\text{kg}^2$ |
| Boltzmann Constant | $k_B$ | $1.381 \\times 10^{-23}$ | $\\text{J/K}$ |
| Elementary Charge | $e$ | $1.602 \\times 10^{-19}$ | $\\text{C}$ |

## 3. Ideal Gas Law & Thermodynamic Work
In classical thermodynamics, the macroscopic state equation of an ideal gas is:
$$PV = nRT$$
- $P$: Gas pressure (Pascals)
- $V$: Enclosed volume ($m^3$)
- $n$: Amount of substance (moles)
- $R$: Universal gas constant ($8.314\\text{ J}/(\\text{mol}\\cdot\\text{K})$)
- $T$: Absolute temperature (Kelvin)

The reversible isothermal expansion work is:
$$W = \\int_{V_1}^{V_2} P \\, dV = nRT \\ln\\left(\\frac{V_2}{V_1}\\right)$$

> [!NOTE]
> For adiabatic processes where no heat transfer occurs ($Q = 0$), $PV^\\gamma = \\text{constant}$, where $\\gamma = C_p / C_v$.
`,
  },

  {
    id: "system-architecture-mermaid",
    name: "System Architecture & Flow (Mermaid)",
    iconType: "mermaid",
    description: "Flowcharts, sequence diagrams, state machines, and Claude Shannon information theory",
    content: `# Architecture & Workflow: Distributed AI Recap System

## 1. System Flow & Decision Tree
\`\`\`mermaid
flowchart TD
    A([Student Notes Input]) --> B[Client-Side Sanitization]
    B --> C{Contains LaTeX Formulas?}
    C -->|Yes| D[Render KaTeX Delimiters $...$]
    C -->|No| E[Plain Text Markdown Parser]
    D & E --> F[Post to EdgeOne AI Gateway]
    F --> G{Response Status}
    G -->|200 OK| H[Store in IndexedDB Cache]
    G -->|429 Rate Limit| I[Display Quota Warning]
    H --> J[Generate Structured Summary & Quiz]
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
    User->>UI: Click "Generate AI Recap"
    UI->>API: POST notes + customConfig
    API->>AI: Model Chain Request
    AI-->>API: Structured JSON { summary, quiz }
    API-->>UI: Return study artifacts
    UI-->>User: Active Recall Quiz ready
\`\`\`

## 3. Information Theory & Entropy
The transmission efficiency and information entropy of the parsed tokens is formulated by Claude Shannon as:
$$H(X) = -\\sum_{i=1}^{n} P(x_i) \\log_2 P(x_i)$$
`,
  },

  {
    id: "algorithm-ds",
    name: "Algorithm & Complexity Analysis (LeetCode & System Design)",
    iconType: "lecture",
    description: "Problem constraints, asymptotic complexity comparison table, invariants, and implementation",
    content: `# Algorithm: Dynamic Subarray Sum & Sliding Window
Difficulty: Medium | Topic: Two Pointers / Sliding Window | Category: Core Data Structures

## 1. Problem Statement & Constraints
Given an array of positive integers \`nums\` and a target positive integer \`target\`, find the minimal length of a contiguous subarray of which the sum is greater than or equal to \`target\`. If there is no such subarray, return 0 instead.

- Constraints: $1 \\le \\text{target} \\le 10^9$
- $1 \\le \\text{nums.length} \\le 10^5$
- $1 \\le \\text{nums}[i] \\le 10^4$

## 2. Asymptotic Complexity Comparison
| Approach | Time Complexity | Space Complexity | In-Place? | Key Tradeoff |
| :--- | :---: | :---: | :---: | :--- |
| Brute Force (Nested Loops) | $O(N^2)$ | $O(1)$ | Yes | Exceeds time limit for $N \\ge 10^5$ |
| Prefix Sum + Binary Search | $O(N \\log N)$ | $O(N)$ | No | Requires auxiliary prefix sum array |
| Two-Pointer Sliding Window | $O(N)$ | $O(1)$ | Yes | Optimal linear time with zero extra heap |

## 3. Invariants & Guarantees
- **Right Pointer ($R$)**: Expands window until $\\sum_{i=L}^{R} \\text{nums}[i] \\ge \\text{target}$.
- **Left Pointer ($L$)**: Contracts window while maintaining validity, updating minimal recorded length $\\min(len)$.

> [!IMPORTANT]
> Because all elements in \`nums\` are strictly positive, shrinking the window is strictly monotonic. If negative numbers exist, Kadane's algorithm or a hashmap prefix sum must be used instead.

## 4. Edge Cases Checklist
- [ ] Array is empty or target cannot be satisfied (should return 0)
- [ ] Single element satisfies target ($nums[0] \\ge target$)
- [ ] Target equals total sum of entire array
`,
  },

  {
    id: "literature-review",
    name: "Academic Literature Review & Paper Synthesis",
    iconType: "lecture",
    description: "Paper breakdown: Hypotheses, mathematical formulation, benchmark matrix, and limitations",
    content: `# Literature Review: Attention Mechanisms & Transformer Scaling

## 1. Paper Metadata
| Field | Paper Details |
| :--- | :--- |
| **Title** | Attention Is All You Need |
| **Authors** | Vaswani et al. (Google Brain / Google Research) |
| **Venue / Year** | NeurIPS 2017 |
| **Primary Domain** | Natural Language Processing & Sequence Modeling |

## 2. Core Hypothesis & Contribution
- **Hypothesis**: Recurrent and convolutional connections are not required for sequence transduction; an architecture based solely on self-attention mechanisms can compute input and output representations globally in parallel.
- **Key Advantages**:
  - Eliminates sequential computation bottleneck of LSTMs ($O(1)$ sequential operations vs $O(N)$).
  - Enables massive distributed GPU batch training across billions of tokens.

## 3. Mathematical Formulation
Scaled Dot-Product Attention is formulated as:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
Where queries $Q$, keys $K$, and values $V$ have dimensionality $d_k$. Multi-Head Attention projects $h$ distinct attention heads:
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h)W^O$$

## 4. Empirical Benchmark Comparison
| Model Architecture | BLEU Score (EN-DE) | Training FLOPs ($10^{18}$) | Inference Latency |
| :--- | :---: | :---: | :---: |
| ByteNet | 23.75 | 9.0 | High |
| GNMT + RL | 24.60 | 15.3 | Medium |
| Transformer (Base) | 27.30 | 3.3 | Fast |
| Transformer (Big) | 28.40 | 23.0 | High-Capacity |

## 5. Critical Critique & Limitations
> [!WARNING]
> Standard self-attention scales quadratically $O(N^2)$ in memory and compute with respect to sequence length $N$, necessitating FlashAttention or sparse kernels for long-context windows.
`,
  },

  {
    id: "weekly-study-sprint",
    name: "Weekly Study Sprint & Spaced Repetition (OKR)",
    iconType: "cornell",
    description: "Weekly learning objectives, Leitner box intervals, daily drill checklists, and review schedule",
    content: `# Weekly Study Sprint: Sprint Week 38 (2026-W38)
Sprint Goal: Master Linear Algebra Eigenvalues, Dynamic Programming, and System Design

## 1. Objectives & Key Results (OKRs)
- **Objective**: Establish deep procedural mastery of high-yield exam concepts.
  - **KR 1**: Score $\\ge 85\\%$ on 6 active recall quizzes across all 3 modules.
  - **KR 2**: Complete 15 LeetCode DP practice problems with zero syntax errors.
  - **KR 3**: Formalize 3 complete Mermaid architecture diagrams for distributed systems.

## 2. Leitner Box Spaced Repetition Schedule
| Leitner Box | Interval | Active Study Topics | Retention Target |
| :---: | :--- | :--- | :---: |
| **Box 1** | Daily (24h) | Newly learned definitions, KaTeX formulas | $70\\%$ |
| **Box 2** | Every 3 Days | Sliding window invariants, Eigenvector proofs | $80\\%$ |
| **Box 3** | Weekly (7d) | Distributed consensus, Raft protocol | $90\\%$ |
| **Box 4** | Bi-Weekly (14d) | Classical mechanics, Fourier transform | $95\\%$ |
| **Box 5** | Monthly (30d) | Core data structure asymptotic tables | $98\\%$ |

## 3. Daily Action Checklist
- [x] **Monday**: Derive characteristic polynomial $\\det(A - \\lambda I) = 0$
- [x] **Tuesday**: Solve LeetCode #300 Longest Increasing Subsequence ($O(N \\log N)$)
- [ ] **Wednesday**: Review Cornell cues for CS-401 Distributed Systems
- [ ] **Thursday**: Active Recall 10-card Flashcard session on mobile workstation
- [ ] **Friday**: Simulate 60-minute midterm exam conditions

> [!TIP]
> Never skip Box 1 cards. Re-testing newly acquired knowledge within 24 hours cuts the Ebbinghaus forgetting rate by over 60%.
`,
  },

  {
    id: "engineering-postmortem",
    name: "Engineering Incident Post-Mortem & 5 Whys (SRE)",
    iconType: "meeting",
    description: "SRE incident analysis: Timeline table, 5 Whys root cause chain, mitigations, and Kaizen actions",
    content: `# Post-Mortem: High Latency & Quota Degradation on AI Gateway
Severity: SEV-2 | Incident Lead: @sre-oncall | Date: 2026-09-15

## 1. Executive Summary & Impact
During the peak revision window at 14:00 UTC, the AI Recap Gateway experienced elevated response latencies exceeding $8.4\\text{s}$ (baseline: $650\\text{ms}$) and a $12\\%$ HTTP 429 quota exhaustion rate. Approximately 420 active study sessions were delayed before automated circuit-breaker fallback activated.

## 2. Incident Timeline (UTC)
| Time (UTC) | Event & Investigation Status | Action Taken |
| :--- | :--- | :--- |
| **14:02** | P99 latency alert fired ($> 5.0\\text{s}$) | On-call engineer paged |
| **14:07** | Gateway logs show sudden surge in uncompressed prompts | Enabled aggressive client-side text trimmer |
| **14:14** | Circuit breaker tripped on LLM model provider | Switched traffic to secondary failover endpoint |
| **14:22** | P99 latency normalized to $720\\text{ms}$, 0% error rate | Incident downgraded to monitoring |

## 3. Root Cause Analysis: 5 Whys
1. **Why did latency spike?** Downstream LLM tokens-per-second dropped due to heavy simultaneous prompt payloads.
2. **Why were payloads oversized?** Users pasted complete textbook chapters without length normalization.
3. **Why did the frontend accept oversized inputs?** The character limit warning was visual-only and didn't block submission.
4. **Why was throttling missing?** Client-side debouncer was only attached to keystrokes, not the submit button.
5. **Why wasn't this caught in staging?** Synthetic integration tests used uniform 200-word test samples.

## 4. Preventative Kaizen Action Items
- [ ] Implement client-side token estimator before API request dispatch (Owner: @frontend)
- [ ] Add Redis token-bucket rate limiter per IP address (Owner: @backend)
- [ ] Expand load test suite to simulate 25,000-character edge-case payloads (Owner: @qa)

> [!CAUTION]
> Ensure secondary failover endpoints maintain identical structured JSON response formats to prevent client parsing deserialization crashes.
`,
  },

  {
    id: "lecture",
    name: "Lecture & Research Chapter Deep Dive",
    iconType: "lecture",
    description: "Comprehensive lecture framework: Background, mechanism, distinction matrix, and exam focus",
    content: `# Chapter Title: Neurobiology of Memory Consolidation
Lecturer / Author: Prof. H. Eichenbaum
Module: Cognitive Neuroscience 302

## 1. Foundational Background & Premises
- **Synaptic Plasticity**: The strength of neural connections is modified in response to repeated stimulation (Hebbian theory).
- **Hippocampal-Neocortical Dialogue**: Initial memory traces reside transiently in the hippocampus before undergoing slow system consolidation into neocortical circuits.

## 2. Systematic Biological Mechanism
1. **Long-Term Potentiation (LTP)**:
   - High-frequency stimulation induces strong depolarization of post-synaptic dendritic spines.
   - Magnesium ($Mg^{2+}$) block is ejected from NMDA receptors, allowing influx of Calcium ($Ca^{2+}$).
   - Second-messenger cascades phosphorylate AMPA receptors and trigger retrograde messengers.
2. **Sleep Consolidation**:
   - Sharp-wave ripples (SWRs) during non-REM slow-wave sleep replay daytime neural trajectories.

## 3. Distinction Matrix: Short-Term vs Long-Term Potentiation
| Dimension | Early LTP (E-LTP) | Late LTP (L-LTP) |
| :--- | :--- | :--- |
| **Duration** | 1 to 3 hours | 24+ hours to weeks |
| **Protein Synthesis** | Not required (pre-existing kinases) | Requires gene transcription & CREB |
| **Structural Changes** | Transient receptor trafficking | New dendritic spine growth |

## 4. High-Yield Examination Points
- [ ] Differentiate episodic memory from procedural memory structures.
- [ ] Explain how NMDA antagonist AP5 impairs spatial learning in Morris water maze.
`,
  },

  {
    id: "meeting",
    name: "Strategic Meeting & Action Plan",
    iconType: "meeting",
    description: "Action-oriented documentation: Strategic agenda, agreed decisions, and ownership checklist",
    content: `# Project Sync: Enterprise Study Workstation Roadmap
Date & Time: 2026-09-16 10:00 AM UTC
Location: Virtual Workstation
Participants: Product Engineering Lead, UX Architect, Platform SRE

## 1. Strategic Agenda
1. Review Phase 2 enterprise layout deliverables (Dock, Menubar, Status Bar)
2. Audit theme engine coverage and contrast standards across 13 color schemes
3. Finalize study template suite and safe insertion flows (Append vs Replace)

## 2. Agreed Decisions
- **Decision 1**: All toolbar buttons and active states must bind to \`--highlight\` instead of static yellow.
- **Decision 2**: Template selection must never wipe user notes without explicit choice between "Append to Bottom" and "Replace Note".
- **Decision 3**: Support native Markdown tables and callout alert boxes in the markdown renderer.

## 3. Assigned Action Items
- [ ] Implement 4 new developer themes in themes engine (Owner: @dev, Due: Today)
- [ ] Test table parsing in FormattedText preview and print view (Owner: @ux, Due: Today)
- [ ] Verify zero TypeScript errors on production build (Owner: @sre, Due: Today)
`,
  },
];
