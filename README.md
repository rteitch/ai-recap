# AI Recap

> **The distraction-free study companion with active recall, flashcards, KaTeX LaTeX math rendering, Inkdrop-grade live split editor, and habit-building spaced repetition.**

Paste or write your notes, scientific formulas, lectures, or meeting transcripts. Get back a concise summary and four interactive active-recall questions to cement long-term memory.

Built with **Next.js 16 (App Router, Turbopack)**, **KaTeX Engine**, and deployed on **Tencent EdgeOne Makers**.

**🔗 Live Demo → [https://ai-recap.rth.my.id/](https://ai-recap.rth.my.id/)**

---

### Preview Demo

| Initial Screen | In Action |
| :---: | :---: |
| ![AI Recap — Initial Screen](public/ai-recap-apps1.jpg) | ![AI Recap — In Action](public/ai-recap-apps2.jpg) |

---

## ✨ Key Features

### 🎛️ 1. Dual Interface Architecture: Simple Mode & Full Workstation IDE
- **First-Visit Mode Picker Splash**: First-time visitors are greeted with an intuitive layout selection screen explaining the strengths of each mode. Choices are persisted in `localStorage`.
- **Mode 1: Simple Mode (`SimpleModeView.tsx`)**:
  - Centered, minimalist single-column interface tailored for quick study, pasting articles, or mobile usage.
  - **Live KaTeX & Mermaid Auto-Rendering**: Real-time syntax detection (`∑ KaTeX Active`, `Mermaid Active`) with a 3-way input view switcher:
    - **Write**: Distraction-free clean textarea.
    - **Live Split**: Type above, and watch math formulas (`$E=mc^2$`) and Mermaid diagrams render automatically below in real-time.
    - **Preview**: Full rendered document view.
  - **Inline Results**: Instant AI summary card, expandable self-test questions with self-grading (*Remembered* / *Review again*), and 1-click transition to Workstation.
- **Mode 2: Workstation Mode (`NotesInput.tsx` + 4-Column IDE)**:
  - Complete 4-column academic IDE: Navigation sidebar, notes library, markdown editor, and Study Companion pane.
  - Quick 1-click `[⚡ Simple Mode]` toggle button in the editor toolbar and desktop MenuBar.

### 🖋️ 2. Inkdrop-Grade Editor with Live KaTeX Split-View & Zen Mode
- **Three Viewing Modes**:
  - **Write (Zen 1-Pane)**: Clean, distraction-free single-column workspace for rapid note-taking and deep focus.
  - **Split (Side-by-Side)**: Interactive monospace editor on the left with instant, sub-5ms **Live KaTeX Preview** on the right. Formulas render in real-time as you type.
  - **Preview**: Full rendered layout with formatted typography, LaTeX formulas, and Mermaid diagrams.
  - **Hotkey Cycle**: Press `Ctrl+P` / `Cmd+P` to effortlessly cycle between Write, Split, and Preview modes.
- **Smart Typist Interactions**:
  - **Auto-Pairing**: Typing `$`, `(`, `[`, `{`, `"`, or `` ` `` automatically inserts the closing symbol and places your cursor between them (`$|$`).
  - **Wrap Selection**: Select any text and type `$` or bracket to immediately wrap it (`$selection$`).
  - **Smart Step-Over**: Typing a closing character when right before one cleanly steps over it without duplicate characters.
  - **Tab Indentation**: Pressing `Tab` inserts 2 spaces of code indentation; `Shift+Tab` dedents single or multi-line selections.
  - **Word Wrap Toggle**: Synchronized line-height measurement prevents gutter drift when word wrap is enabled.
  - **Line Numbers**: Lockstep-scrolling line numbers gutter in both Edit and Split views.

### 🎨 3. 17 Curated Themes & Ergonomic Keycap Editions
- **12 Classic Developer Presets**:
  - *Inkdrop Classic*, *GitHub Light / Paper*, *GitHub Dark*, *Tokyo Night*, *Catppuccin Mocha*, *Solarized Light / Paper*, *Solarized Dark*, *Nord Arctic*, *Dracula*, *One Dark Pro*, *Monokai Pro*, *Gruvbox Dark*.
- **4 Ergonomic Mechanical Keyboard Keycap Editions**:
  - Directly derived from authentic GMK ABS plastic master codes (`CR`, `N9`, `WS1`, `WS4`, `P3`, `TU2`, `V2`, `L9`, `CP`, `3A`, `N7`):
  - **GMK Midnight Red**: Slate dark scheme with classic crimson red accent (`#BC251E`).
  - **GMK Dusk Ocean**: Deep oceanic petrol background with electric cyan accent (`#00A4A9`).
  - **GMK Forest Slate**: Organic moss charcoal with calming botanical green accent (`#4A9E68`).
  - **GMK Sand Paper**: IBM Model M retro beige aesthetic with anti-glare warm paper reading comfort and industrial terracotta accent (`#C85312`).
- **Contrast & Eye-Strain Protection**:
  - Strictly audited for WCAG AA/AAA compliance across light and dark modes. Zero hardcoded dark-on-dark or yellow-on-white halation.
- **Theme Search & Instant Filter**:
  - Filter by `All`, `Dark Schemes`, `Light Paper`, or `⌨️ Keycaps (4)` with real-time keyword search in the Appearance modal.

### ⚡ 4. Slash Commands (`/`) & 60+ Formula Autocomplete
- **Slash Commands (`/` at start of line)**: Insert structural blocks without memorizing Markdown:
  - Heading 1, 2, 3 (`#`, `##`, `###`)
  - Centered Math Block (`$$\n\n$$`)
  - Bullet List, Numbered List, Checklist (`- [ ]`)
  - Note Callout (`> `)
  - Code Block with syntax highlighting (`` ```typescript``` ``)
  - Comparison Tables & Dividers (`---`)
- **60+ Curated LaTeX Science Formulas (`\`)**:
  - Formulas are automatically auto-wrapped in `$..$` or `$$..$$` so KaTeX live preview updates immediately upon selection.
  - Non-intrusive **Docked Candidate Strip** placed below the editor that never covers your text.
  - Fast keyboard navigation: `↑` / `↓`, `Tab` / `Enter`, and `Escape` for instant dismissal.

### 🧭 5. Table of Contents (Outline Navigation Panel)
- **Automatic Heading Extraction**: Detects `#`, `##`, and `###` in real-time.
- **Collapsible Outline**: Click **Outline** in the header toolbar to preview document structure.
- **Smooth Anchor Scrolling**: Click any section in the TOC to instantly glide to that exact part of your notes.

### 🏷️ 6. Study Status Workflow & Pin to Top (Zero-Token History)
- **Study Status Lifecycle**: Assign active review statuses to each session:
  - `In Progress` (sky) &bull; `Needs Review` (amber) &bull; `Mastered` (emerald) &bull; `Not Reviewed` (rose)
- **Pin to Top**: Pin critical exam topics to the top of your drawer with the SVG pin icon.
- **Filter Chips**: Filter by `All`, `📌 Pinned`, `⚠️ Needs Review`, `✅ Mastered`, or `📝 Draft`.
- **Notebook Organization**: Create notebooks to group related notes (e.g. "Study & Research", "Projects & Ideas").
- **Save Draft Without Recap (0 Tokens)**: Save work-in-progress notes to browser storage without consuming AI tokens.

### 💻 7. Advanced Code Block Rendering
- Fenced code blocks (`` ```lang...``` ``) render with:
  - Language header pill (e.g. `TYPESCRIPT`, `PYTHON`)
  - 1-Click **Copy Code** button with `✓ Copied` confirmation
  - Clean line-number gutters for enhanced readability.

### 🔬 8. KaTeX LaTeX Scientific Formula Engine
- **Inline & Display Math**: Comprehensive support for inline math (`$...$`) and display equations (`$$...$$`).
- **Graceful Error Handling**: Fallback boundaries prevent crashes on malformed equations.
- **High-Performance**: Pure client-side KaTeX rendering (1–5ms per formula) with zero external CDN roundtrips and anti-XSS protection.

### 🧠 9. Spaced Repetition & The 4 Laws of Atomic Habits
- **Make it Obvious (Cue)**: Daily Study Streak badge (`● Nd streak`) tracking continuous learning habits in `localStorage`.
- **Make it Attractive (Craving)**: Elegant dark & light editorial typography with tactile micro-haptic feedback.
- **Make it Easy (Response)**: 1-Tap sample loader, drag-and-drop file import (`.txt`, `.md`), and keyboard hotkeys (`Ctrl+Enter` to recap).
- **Make it Satisfying (Reward)**: Retention scorecard percentage with **per-question review time tracking**, **Retest Missed Only** (Leitner repetition), and **Copy Missed** for Notion/Obsidian.

### 🃏 10. Dual Mode: List Accordion & Focus Flashcard Deck
- **Interactive Flashcard Mode**:
  - `Space` / `Enter` or Tap to flip and reveal answer.
  - `←` / `→` or Touch Swipe to navigate between cards (30px threshold with visual displacement feedback).
  - `1` / `k` to rate as *✓ Remembered*, `2` / `r` to rate as *⟳ Review again*.
  - Micro-haptic tactile vibration feedback on supported mobile devices.
- **Visual Recall Badges in List Mode**: Instantly spot learning gaps via `✓` (emerald) and `⟳` (amber) indicators.
- **Screen Reader Accessible**: Built with WCAG 2.1 AA compliance (`aria-live="polite"`, `role="region"`, `aria-expanded`).

### 📱 11. Mobile Ergonomics & Offline PWA
- **iOS Safari Auto-Zoom Prevention**: Textarea font sizing (`text-base sm:text-sm`) prevents forced viewport zooming on mobile devices.
- **Responsive Flex Toolbar**: Clean wrapping on narrow screens with comfortable 44px touch targets.
- **PWA Service Worker**: Full offline support with connectivity status indicator (`● Offline mode`).
- **Expanded History**: Stores up to **50 study sessions** with real-time keyword search and notebook filtering.

### 🎙️ 12. Multi-Speed Text-to-Speech (TTS)
- Web Speech API integration with automatic language detection (English `en-US` / Indonesian `id-ID`).
- Dynamic speech rate cycling (`1.0x` → `1.25x` → `1.5x`) without interrupting playback.

### 🔍 13. Find & Replace, Merge Notes, Command Palette
- **Find & Replace** (`Ctrl+H`): Full-text search and replace within the current note.
- **Merge Notes** (`Ctrl+M`): Combine multiple notes into one with preview.
- **Command Palette** (`Ctrl+K`): Quick full-text search across all notes with highlighted query matching.

### ⌨️ 14. Global Keyboard Shortcuts
- `Ctrl+S` — Save draft instantly
- `Ctrl+Z` / `Ctrl+Y` — Global undo/redo across the editor
- `Ctrl+±` / `Ctrl+0` — Zoom in/out/reset editor font size
- `Ctrl+F` — Open Find & Replace
- `Alt+↑` / `Alt+↓` — Move current line up/down
- `Ctrl+B` / `Ctrl+I` / `Ctrl+Shift+X` — Bold / Italic / Strikethrough
- `Ctrl+1` / `Ctrl+2` / `Ctrl+3` — Heading 1/2/3
- `Ctrl+Shift+L` / `Ctrl+Shift+8` / `Ctrl+Shift+7` — Link / Bullet List / Numbered List
- `Ctrl+Shift+`` ` `` / `Ctrl+Shift+>` / `Ctrl+Shift+-` — Code Block / Blockquote / Horizontal Rule

### 📤 15. Comprehensive Export & Zero-Token Sharing
- **Complete Printable Study Sheet**: Clean `@media print` layout that prints 100% of the core summary, all questions, and all answers with sharp black math and zero blank page jumps.
- **Zero-Token Share Link**: Encodes recaps directly into a URL hash (`#recap=...`) openable anywhere with 0 AI tokens.
- **Export to Anki**: Ready-to-import TSV flashcard text files (`#separator:tab`).
- **Download Markdown**: Clean `.md` file export with Obsidian/Inkdrop compatible frontmatter.
- **Export .txt**: Plain text export of notes.
- **Backup / Restore**: Full `.json` backup with merge-on-restore to avoid duplicates.
- **Copy Q&A**: 1-click copy for individual questions, complete summaries, or missed items.

### 🖼️ 16. Image Support
- **Image Upload**: Via toolbar button, clipboard paste (`Ctrl+V`), or drag-and-drop.
- **Image Rendering**: Inline images with XSS-safe sanitization via `isomorphic-dompurify`.
- **Orphan Cleanup**: Automatically removes IndexedDB images no longer referenced in any note.

---

## 🏗️ Atomic Code Architecture

The codebase is organized following **Atomic Design** principles:

```text
ai-recap/
├── components/
│   ├── atoms/                          # Pure, stateless UI elements
│   │   ├── LatexRenderer.tsx           # Safe KaTeX inline ($) & block ($$) renderer
│   │   ├── FormattedText.tsx           # Combined LaTeX + Markdown + Mermaid parser
│   │   ├── MermaidRenderer.tsx         # Dynamic theme-adaptive Mermaid diagram renderer
│   │   ├── Kbd.tsx                     # Standardized keyboard hotkey badges
│   │   ├── SonnerToaster.tsx           # Theme-responsive toast notification provider
│   │   ├── ErrorBoundary.tsx           # Resilient class-based crash boundary with zero-loss draft recovery
│   │   └── ResizerDivider.tsx          # Draggable pane resizer
│   ├── molecules/                      # Functional atom combinations
│   │   ├── QuizCard.tsx                # Isolated memoized accordion card with Copy Q&A
│   │   ├── SpeechControls.tsx          # Audio TTS player & speed cycler
│   │   ├── StudyStreakBadge.tsx        # Daily habit streak badge
│   │   ├── OfflineBadge.tsx            # PWA connectivity indicator
│   │   ├── TocPanel.tsx                # Table of contents floating overlay
│   │   ├── NoteTagBar.tsx              # Interactive tag management bar
│   │   ├── NotebookDropdown.tsx         # Notebook selector dropdown
│   │   ├── StudyStatusDropdown.tsx      # Study status lifecycle selector
│   │   ├── WelcomeBanner.tsx           # Theme-responsive onboarding guide for empty notes
│   │   ├── ConfirmDialog.tsx           # Reusable confirmation modal
│   │   └── StorageIndicator.tsx        # IndexedDB storage usage indicator
│   └── organisms/                      # Standalone feature organisms
│       ├── SimpleModeView.tsx          # Mode 1: Clean centered recap UI with live KaTeX/Mermaid preview
│       ├── NotesInput.tsx              # Mode 2: Workstation editor with split view, autocomplete, templates
│       ├── MenuBar.tsx                 # Desktop application menu bar with quick mode toggle
│       ├── FlashcardDeck.tsx           # Focus flashcard deck with touch swipe & 3D flip
│       ├── RetentionScorecard.tsx      # Retention score, review time tracking, Retest Missed
│       ├── StudyCompanionPane.tsx      # Right-side AI companion panel
│       ├── HistoryDrawer.tsx           # 50-item local study history with notebook filter
│       ├── InkdropNavigation.tsx       # Left sidebar: notebooks, status filters, tags
│       ├── InkdropNoteList.tsx         # Note list with search highlighting, pin, duplicate, delete
│       ├── CommandPalette.tsx          # Ctrl+K full-text search across all notes
│       ├── FindReplaceModal.tsx        # Ctrl+H find & replace in current note
│       ├── MergeNotesModal.tsx         # Ctrl+M merge multiple notes with preview
│       ├── AppearanceModal.tsx         # 17 themes (Classic + GMK Keycaps), font & typography engine
│       ├── BackupRestoreModal.tsx      # JSON backup/restore with merge-on-restore
│       ├── CustomApiModal.tsx          # Custom AI API configuration (OpenAI-compatible)
│       └── ShortcutsModal.tsx          # Keyboard cheat-sheet modal [?]
├── hooks/
│   ├── useAppearance.ts               # Theme, custom CSS variables, and font engine
│   ├── useStudyStreak.ts              # Daily streak state & habit cycle logic
│   ├── useSpeech.ts                   # Web Speech API & voice pre-warming
│   ├── useKeyboardSound.ts            # Cherry MX Black mechanical keyboard sound with mobile haptics
│   ├── useStorageUsage.ts             # IndexedDB storage monitoring
│   └── useResizablePanes.ts           # Draggable pane resize logic
├── lib/
│   ├── themes.ts                      # 17 color themes, luminance contrast calculator & CSS token builder
│   ├── types.ts                       # Shared TypeScript definitions (QuizItem, HistoryItem, etc.)
│   ├── templates.ts                   # Academic study templates with SVG icon mappings
│   ├── latexAutocomplete.ts           # 60+ curated LaTeX math formulas & autocomplete engine
│   ├── slashCommands.ts               # Slash command definitions (/ at start of line)
│   ├── mermaidTemplates.ts            # Mermaid diagram templates (Flow, Architecture, Concept, Timeline)
│   ├── generateToc.ts                 # Automatic heading extraction for TOC
│   ├── imageStorage.ts                # IndexedDB image storage with quota management
│   ├── ai-config.ts                   # Custom API configuration (OpenAI-compatible providers)
│   ├── tags.ts                        # Tag management utilities
│   ├── haptics.ts                     # Micro-haptic tactile feedback
│   └── wordCount.ts                   # Zero-allocation linear word counter (<0.04ms)
└── app/
    ├── api/recap/route.ts             # EdgeOne AI Gateway route with multi-model fallback & 20k chars limit
    ├── layout.tsx                     # Root layout with KaTeX CSS & PWA manifest
    ├── page.tsx                       # Clean declarative top-level orchestrator
    └── globals.css                    # Ink theme, print styles, reduced motion, mobile touch targets
```

---

## 🔒 Security & AI Resilience

1. **Prompt Injection Defense**: User notes are encapsulated inside `<user_notes>` isolation tags with strict system override guards.
2. **Generous Capacity with Abuse Caps**: Supports up to **20,000 characters** (~3,500 words) per note and generates up to 1,500 output tokens.
3. **Multi-Model Fallback Chain**: Automatically cascades from primary model to backups if rate limits or outages occur:
   - Primary: `@makers/deepseek-v4-flash`
   - Fallbacks: `@makers/kimi-k2.6`, `@makers/hy3`, `@makers/minimax-m3`
4. **Origin & Anti-Abuse Shielding**: Sliding-window rate limiter (10 req/min), fair-use daily cap of **10 recaps/day** per user, and `sec-fetch-site` cross-origin blocking.
5. **SSRF Protection**: DNS rebinding TLD blocklist, hex/octal IP address blocking, `transfer-encoding` header blocking, and Content-Length guard.
6. **XSS Sanitization**: `isomorphic-dompurify` for Mermaid diagram rendering and image alt text. `sanitizeModelText` strips AI model output of HTML/script injection.
7. **Security Headers**: `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Frame-Options: DENY`.
8. **Zero Data Retention**: 100% client-side storage — user notes and recaps are never stored or logged on any server. Generic error messages prevent information leakage.

---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup
```bash
git clone https://github.com/rteitch/ai-recap.git
cd ai-recap
npm install
cp .env.example .env.local
```

Fill in `AI_GATEWAY_API_KEY` in `.env.local`:
```env
AI_GATEWAY_BASE_URL="https://ai-gateway.edgeone.link/v1"
AI_GATEWAY_API_KEY="your-edgeone-api-key"
AI_GATEWAY_MODEL="@makers/deepseek-v4-flash"
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Build for Production
```bash
npm run build
npm run start
```

---

## ☁️ Deploy to EdgeOne Makers

1. Push this project to your GitHub repository.
2. In the [EdgeOne Makers Console](https://edgeone.ai/), click **Import Git Repository** and select the repository.
3. Framework is detected automatically as **Next.js (App Router)** — no custom build command needed.
4. Add the three environment variables under **Project Settings → Environment Variables**:
   - `AI_GATEWAY_BASE_URL`
   - `AI_GATEWAY_API_KEY`
   - `AI_GATEWAY_MODEL`
5. Click **Deploy**. Every subsequent push to `main` redeploys automatically.

---

## 🌐 Custom Domain Setup (EdgeOne Makers + Cloudflare DNS)

To connect your custom domain (e.g., `ai-recap.rth.my.id`):

### 1. Add Domain in EdgeOne Makers
1. Open the EdgeOne Makers console → Select your project (`ai-recap`).
2. Navigate to **Domains** → Click **Add Domain** and enter your subdomain (`ai-recap.rth.my.id`).

### 2. Verify Domain Ownership (TXT Record)
- Open your **Cloudflare** dashboard → Select domain (`rth.my.id`) → **DNS** > **Records**.
- Add a new record:
  - **Type**: `TXT`
  - **Name**: `edgeonereclaim.<subdomain>` (e.g., `edgeonereclaim.ai-recap`)
  - **Content**: Enter the verification code provided by EdgeOne (e.g., `reclaim-xxxx...`)
  - **Proxy status**: **DNS only** (gray cloud)
- Return to EdgeOne Makers and click **Verify**.

### 3. Route Traffic (CNAME Record)
In Cloudflare DNS, add:
- **Type**: `CNAME`
- **Name**: `ai-recap`
- **Target**: Your default EdgeOne domain (e.g., `ai-recap-xxxx.edgeone.dev`)
- **Proxy status**: **DNS only** (gray cloud)

### 4. Automatic SSL
- Propagation takes 1–5 minutes.
- EdgeOne automatically issues and manages free SSL/TLS HTTPS certificates.

---

## 🙏 Acknowledgments

- **Keyboard Sounds** — Cherry MX Black mechanical keyboard sound effects by [KBS (kbs.im)](https://kbs.im/). Used under their sound library license.

---

## 📄 License

MIT &copy; [RTH Nexus](https://rth.my.id). All rights reserved.
