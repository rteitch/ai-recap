# Analisis Fitur Inkdrop → Rencana Penyempurnaan AI Recap

**Tujuan dokumen:** memetakan fitur-fitur [Inkdrop](https://www.inkdrop.app/) (aplikasi catatan Markdown untuk developer, AI-native, berbasis CodeMirror 6) terhadap kondisi AI Recap saat ini, lalu menentukan fitur mana yang layak diadopsi — beserta spesifikasi teknis implementasinya di dalam struktur codebase AI Recap yang sudah ada (Next.js 16 App Router, Atomic Design, KaTeX, zero-server-retention).

Referensi: homepage produk Inkdrop, dokumentasi developer/API-nya, dan catatan rilis Inkdrop v6 (Agustus 2026) yang merombak editornya ke CodeMirror 6 + storage ke SQLite.

---

## 1. Ringkasan Eksekutif

Inkdrop dan AI Recap sebenarnya menyasar masalah yang berdekatan tapi tidak identik: Inkdrop adalah **catatan kerja jangka panjang untuk developer** (ribuan notes, integrasi agent AI, sinkronisasi lintas perangkat), sementara AI Recap adalah **companion belajar per-sesi** (rekap cepat, flashcard, retensi, zero-token draft). Karena itu, tidak semua fitur Inkdrop relevan — beberapa (emoji autocomplete, aplikasi desktop native, plugin system penuh) justru bertentangan dengan positioning AI Recap yang sudah kuat (0 emoji, PWA ringan, zero data retention).

Namun ada kelompok fitur Inkdrop yang **sangat relevan** karena AI Recap sudah punya fondasi yang mirip (editor split-view custom, popover autocomplete `\` untuk LaTeX, sistem draft/history lokal) — tinggal digeneralisasi:

- Struktur editor (slash command, floating toolbar, TOC) → AI Recap sudah punya pola popover trigger-based (autocomplete LaTeX), tinggal digeneralisasi.
- Rendering konten (Mermaid, code block yang lebih baik) → pelengkap alami untuk KaTeX yang sudah ada.
- Organisasi catatan (tags, status, pin, notebook) → AI Recap baru punya History Drawer flat 50-item; ini titik lemah terbesar dibanding Inkdrop.

---

## 2. Inventaris Fitur Inkdrop & Fit-Gap terhadap AI Recap

| Kategori | Fitur Inkdrop | Sudah ada di AI Recap? | Relevansi untuk study app | Tier Rekomendasi |
|---|---|---|---|---|
| **AI-native** | MCP server (agent baca/tulis notes) | Tidak | Rendah–Sedang (niche, developer-adjacent) | Tier 3 |
| | AI-ready note templates (instruksi khusus utk AI di dalam template) | Sebagian (10 template statis, tanpa instruksi AI eksplisit) | Sedang | Tier 3 |
| | Encrypted cloud sync | Tidak (zero-retention by design) | Rendah — bertentangan dgn positioning | Tidak direkomendasikan (default) |
| | Multi-platform native (macOS/Win/Linux/iOS/Android) | Sebagian (PWA web) | Rendah — PWA sudah cukup | Tidak direkomendasikan |
| **Editor** | Slash commands (`/` → heading, code block, alert) | Tidak (baru ada `$`, `(`, `[`, `` ` `` auto-pair) | **Tinggi** | **Tier 1** |
| | Floating selection toolbar (bold/italic/heading saat select teks) | Tidak | **Tinggi** | Tier 2 |
| | Code-aware autocompletion di dalam code block | Tidak (autocomplete baru utk LaTeX via `\`) | Sedang | Tier 2 |
| | Emoji autocompletion | Tidak | Tidak relevan — desain AI Recap eksplisit 0 emoji | Tidak direkomendasikan |
| | Smarter link pasting (fetch judul halaman) | Tidak | Rendah–Sedang | Tier 3 |
| | Inline AI assistant (edit teks via instruksi bebas) | Tidak | Sedang — berpotensi makan kuota AI harian | Tier 3 |
| | Next Edit Suggestions (AI prediksi lanjutan tulisan) | Tidak | Rendah utk konteks belajar 1x-pakai | Tidak diprioritaskan |
| **Renderer** | Advanced code blocks (label bahasa, nomor baris, nama file) | Tidak (FormattedText baru gabungkan LaTeX+Markdown dasar) | **Tinggi** (catatan CS/coding) | **Tier 1** |
| | Diagram Mermaid (flowchart, pan/zoom, ikut tema) | Tidak | **Tinggi** — pelengkap alami KaTeX | Tier 2 |
| | Math KaTeX inline & block | **Sudah ada, lebih lengkap** (autocomplete popover, wrap-selection, dsb — AI Recap unggul di sini) | — | — |
| **Organisasi** | Note list at-a-glance | Sebagian (History Drawer, 50 item, search keyword) | Sedang | — |
| | Nestable notebooks (folder per proyek) | Tidak (flat list) | **Tinggi** — kelemahan terbesar saat ini | Tier 2 |
| | Note status (active/on hold/completed/dropped) + filter | Tidak (baru badge ✓/⟳ per pertanyaan, bukan per sesi) | **Tinggi** — selaras dgn konsep retensi yg sudah ada | **Tier 1** |
| | Tags | Tidak | **Tinggi** — pelengkap search & status | Tier 2 |
| | Pin to top | Tidak | Sedang | **Tier 1** |
| **Shortcut** | Telescope command palette (fuzzy find + jalankan command) | Tidak (baru hotkey `Ctrl+Enter`) | Sedang–Tinggi | Tier 2 |
| | Customizable keymaps | Tidak | Rendah | Tidak diprioritaskan |
| | Vim keybindings | Tidak | Sangat rendah utk target siswa | Tidak direkomendasikan |
| **Extensibility** | Plugin system + init.js + styles.css | Tidak | Rendah — premature utk app single-purpose | Tidak direkomendasikan (untuk saat ini) |
| | Local HTTP server utk automation/agent | Tidak | Rendah utk web app (bukan proses lokal) | Tier 3 (bentuk berbeda: REST export) |
| **Storage engine** | v6: pindah ke SQLite (13x lebih cepat query, 23x code-block render) | AI Recap: localStorage murni | Sedang — relevan **hanya jika** notebook/tags Tier 2 mulai mendekati batas localStorage | Catatan arsitektur (§5) |

---

## 3. Scorecard Prioritas

Skala 1 (rendah) – 5 (tinggi). "Butuh Backend" menandai apakah fitur menyentuh `app/api/` atau tetap 100% client-side (selaras prinsip zero-token/zero-retention).

| Fitur | Impact | Effort | Tier | Butuh Backend? |
|---|---|---|---|---|
| Note Status (workflow per sesi) | 4 | 2 | 1 | Tidak |
| Pin to Top | 2 | 1 | 1 | Tidak |
| Table of Contents / Outline Panel | 4 | 2 | 1 | Tidak |
| Advanced Code Block Rendering | 3 | 3 | 1 | Tidak |
| Slash Commands | 4 | 3 | 1 | Tidak |
| Tags | 3 | 2 | 2 | Tidak |
| Diagram Mermaid | 4 | 3 | 2 | Tidak |
| Command Palette (`Ctrl+K`) | 3 | 3 | 2 | Tidak |
| Floating Selection Toolbar | 4 | 4* | 2 | Tidak |
| Notebook / Pengelompokan Mapel | 4 | 5 | 2/3 | Tidak (tetap localStorage, bisa evolve ke IndexedDB) |
| Smarter Link Pasting (title fetch) | 2 | 2 | 3 | Ya (endpoint kecil) |
| Inline AI Assistant | 3 | 4 | 3 | Ya (kuota terpisah) |
| MCP / Agent Export Endpoint | 2 | 4 | 3 | Ya |
| Encrypted Sync (opt-in) | 2 | 5 | 3 | Ya |

*Effort Floating Toolbar turun ke ~2 jika sudah migrasi ke CodeMirror 6 (lihat §5).

---

## 4. Spesifikasi Implementasi — Tier 1 (Quick Wins)

### 4.1 Note Status (status belajar per sesi)

- **Goal:** melapisi status workflow di atas konsep retensi yang sudah ada, mis. `Belum Direview`, `Sedang Dipelajari`, `Dikuasai`, `Perlu Diulang` — mengadaptasi status `active/on hold/completed/dropped` milik Inkdrop ke konteks belajar.
- **File terdampak:** `lib/types.ts` (tambah field `status` pada `HistoryItem`), `components/organisms/HistoryDrawer.tsx` (dropdown status + filter chip), `components/organisms/RetentionScorecard.tsx` (opsional: auto-suggest status `Dikuasai` jika retensi ≥ 90%).
- **Pendekatan:**

```ts
// lib/types.ts
export type StudyStatus = 'belum-direview' | 'sedang-dipelajari' | 'dikuasai' | 'perlu-diulang';

export interface HistoryItem {
  // ...field yang sudah ada
  status: StudyStatus;
  pinned?: boolean;
  tags?: string[];
}
```
- **Effort:** rendah — murni state + UI filter, tetap localStorage.

### 4.2 Pin to Top

- **Goal:** sesi penting (mis. materi ujian besok) tidak tenggelam di antara 50 item histori.
- **File terdampak:** `HistoryDrawer.tsx` — toggle ikon pin per card, fungsi sort: `pinned` dulu (berdasarkan waktu pin), sisanya berdasarkan recency.
- **Effort:** sangat rendah, 1–2 jam kerja.

### 4.3 Table of Contents / Outline Panel

- **Goal:** navigasi cepat pada catatan kuliah panjang — kebutuhan yang sama persis dengan yang mendorong Inkdrop menambahkan panel outline.
- **File terdampak:** `lib/generateToc.ts` (baru), `components/organisms/TocPanel.tsx` (baru), dipanggil dari `NotesInput.tsx` saat mode Split/Preview.
- **Pendekatan:** fungsi murni parse heading Markdown, tidak butuh library baru.

```ts
// lib/generateToc.ts
export interface TocEntry { level: number; text: string; anchorId: string; }

export function generateToc(markdown: string): TocEntry[] {
  const lines = markdown.split('\n');
  const entries: TocEntry[] = [];
  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const anchorId = text.toLowerCase().replace(/[^\w]+/g, '-');
      entries.push({ level, text, anchorId });
    }
  }
  return entries;
}
```
- Tambahkan `id={entry.anchorId}` pada elemen heading hasil render `FormattedText.tsx`, lalu `TocPanel` cukup `scrollIntoView` saat item diklik.
- **Effort:** rendah — kandidat kuat untuk sprint pertama.

### 4.4 Advanced Code Block Rendering

- **Goal:** label bahasa, nomor baris, dan nama file opsional pada blok kode — penting untuk catatan pemrograman/CS.
- **File terdampak:** `components/atoms/FormattedText.tsx` (deteksi fenced block ` ```lang:filename.ts `), styling baru untuk header bar blok kode.
- **Pendekatan:** gunakan `prism-react-renderer` (bundle kecil, murni client-side — selaras filosofi "zero external CDN roundtrip" yang sudah dipegang untuk KaTeX) dibanding `shiki` yang lebih berat. Nomor baris via CSS counter, tanpa dependency tambahan.
- **Effort:** sedang — 1 dependency baru + refactor kecil di parser `FormattedText`.

### 4.5 Slash Commands

- **Goal:** insert heading/code block/quote/divider tanpa hafal syntax — mempercepat penulisan terutama untuk siswa yang belum familiar Markdown.
- **File terdampak:** `lib/slashCommands.ts` (baru, data-driven — pola sama persis dengan `lib/latexAutocomplete.ts`), generalisasi komponen popover autocomplete yang sudah ada menjadi `components/molecules/TriggerMenu.tsx` yang menerima trigger character sebagai prop (`\` → LaTeX, `/` → block command) supaya tidak duplikasi logika navigasi ↑/↓/Enter/Escape yang sudah ada.

```ts
// lib/slashCommands.ts
export interface SlashCommand {
  id: string;
  label: string;
  insertText: string; // template teks yg disisipkan
  cursorOffset: number; // posisi kursor relatif setelah insert
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'h1', label: 'Heading 1', insertText: '# ', cursorOffset: 2 },
  { id: 'h2', label: 'Heading 2', insertText: '## ', cursorOffset: 3 },
  { id: 'bullet', label: 'Bullet List', insertText: '- ', cursorOffset: 2 },
  { id: 'code', label: 'Code Block', insertText: '```\n\n```', cursorOffset: 4 },
  { id: 'quote', label: 'Alert / Catatan Penting', insertText: '> ', cursorOffset: 2 },
];
```
- **Trigger detection:** deteksi `/` hanya ketika karakter sebelumnya adalah awal baris (mencegah bentrok dengan pecahan/fraksi atau URL yang mengandung `/`).
- **Effort:** sedang — sebagian besar effort adalah refactor popover trigger menjadi generic, sisanya reuse.

---

## 5. Spesifikasi Implementasi — Tier 2

### 5.1 Diagram Mermaid

- **Goal:** pelengkap alami KaTeX — banyak materi (algoritma, siklus biologi, alur proses) lebih jelas sebagai diagram daripada rumus/teks.
- **File terdampak:** `components/atoms/MermaidRenderer.tsx` (baru, meniru pola `LatexRenderer.tsx`: parsing block `​```mermaid`, dynamic import agar tidak membengkakkan initial bundle, error boundary yang sama filosofinya dengan "Graceful Error Handling" milik KaTeX supaya diagram tidak valid tidak meng-crash halaman).

```tsx
// components/atoms/MermaidRenderer.tsx (skeleton)
'use client';
import { useEffect, useRef, useState } from 'react';

export function MermaidRenderer({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('mermaid').then(async (mermaid) => {
      try {
        mermaid.default.initialize({ startOnLoad: false, theme: 'dark' });
        const { svg } = await mermaid.default.render(`mmd-${Date.now()}`, code);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setError('Diagram tidak valid');
      }
    });
    return () => { cancelled = true; };
  }, [code]);

  if (error) return <div className="mermaid-error">{error}</div>;
  return <div ref={ref} className="mermaid-container" />;
}
```
- **Catatan zero-token:** murni rendering client-side, tidak menyentuh `app/api/recap/route.ts` sama sekali — tidak memengaruhi kuota AI harian.
- **Effort:** sedang — dependency baru (`mermaid`, ~500KB, tapi lazy-loaded via `import()` sehingga tidak masuk initial bundle).

### 5.2 Command Palette (`Ctrl/Cmd+K`)

- **Goal:** navigasi power-user — cari sesi lama, jalankan aksi (Save Draft, Export Anki, ganti Template) tanpa mouse, konsisten dengan filosofi hotkey yang sudah ada (`Ctrl+Enter` untuk recap).
- **File terdampak:** `components/organisms/CommandPalette.tsx` (baru), global `keydown` listener di `app/page.tsx`.
- **Pendekatan:** sumber data = daftar template + 50 item history + daftar aksi statis. Untuk fuzzy matching, tulis matcher ringan sendiri (selaras semangat performa "zero-allocation word counter <0.04ms" yang sudah ada di `lib/wordCount.ts`) alih-alih menambah dependency `fuse.js` yang lebih berat.
- **Effort:** sedang.

### 5.3 Tags

- **Goal:** filter lintas mata pelajaran (mis. "Fisika", "UTS"), melengkapi keyword search yang sudah ada.
- **File terdampak:** `lib/types.ts` (`tags: string[]` sudah disiapkan di §4.1), `HistoryDrawer.tsx` (chip input saat simpan, filter chip di atas daftar).
- **Effort:** rendah–sedang.

### 5.4 Floating Selection Toolbar

- **Goal:** format teks (bold/italic/heading) langsung dari seleksi, tanpa syntax manual.
- **Kendala teknis:** `<textarea>` native **tidak** mengekspos koordinat piksel dari posisi seleksi teks — untuk menampilkan toolbar mengambang di atas seleksi butuh trik "mirror div" (duplikasi styling textarea ke elemen tersembunyi untuk menghitung posisi karakter), yang rawan bug terutama di mobile Safari (yang notabene sudah butuh workaround khusus di AI Recap — lihat `text-base sm:text-sm` untuk mencegah auto-zoom iOS).
- **Rekomendasi:** jangan implementasikan floating toolbar di atas `<textarea>` mentah. Ini adalah kandidat utama justifikasi migrasi ke **CodeMirror 6** (lihat §6) — di mana floating toolbar tinggal memakai `EditorView.updateListener` + `showTooltip` API bawaan, effort turun dari "tinggi" ke "rendah–sedang".

### 5.5 Notebook / Pengelompokan per Mata Pelajaran

- **Goal:** mengatasi keterbatasan History Drawer flat 50-item — kelemahan organisasi terbesar dibanding Inkdrop saat ini.
- **File terdampak:** restrukturisasi model data di `HistoryDrawer.tsx` dan storage layer (saat ini localStorage array biasa).
- **Pendekatan bertahap:**
  1. **Tanpa ubah storage:** tambah field `subject: string` pada `HistoryItem`, render `HistoryDrawer` sebagai grouped-by-subject list (bukan flat) — effort rendah, cukup untuk kebanyakan kasus.
  2. **Jika volume data mulai mendekati batas localStorage (~5–10MB)** — misal setelah tags + status + notebook aktif dan histori berkembang melebihi 50 sesi — evaluasi migrasi storage ke **IndexedDB** (via lib `idb`) untuk kapasitas jauh lebih besar dan query lebih baik. Ini paralel dengan keputusan Inkdrop v6 pindah dari format lama ke SQLite demi performa query & rendering.
- **Effort:** sedang (opsi 1) hingga tinggi (opsi 2, ganti storage layer).

---

## 6. Catatan Arsitektur Kunci: Perlukah Migrasi ke CodeMirror 6?

Inkdrop v6 (rilis terbaru, Agustus 2026) mengganti fondasi editornya ke **CodeMirror 6**, menambahkan slash command, saran link/note inline, resize gambar, dan spellcheck native — sekaligus memindahkan storage ke SQLite untuk performa. AI Recap saat ini membangun semua smart-typist behavior (auto-pairing, wrap-selection, step-over, autocomplete `\`) secara manual di atas `<textarea>` — pendekatan yang sudah terbukti jalan dan ringan, tapi punya batas.

| Aspek | Tetap `<textarea>` manual | Migrasi ke CodeMirror 6 |
|---|---|---|
| Bundle size | Lebih kecil, tanpa dependency editor | +~200-300KB (bisa lazy-load) |
| Smart-typist yang sudah ada | Tetap terkontrol penuh, risiko regresi 0 | Perlu port ulang seluruh logika (auto-pair, wrap-selection, step-over) sebagai CodeMirror extension |
| Slash Commands (§4.5) | Bisa (effort sedang) | Bisa (effort sedang, API lebih matang) |
| Floating Toolbar (§5.4) | Sulit & rawan bug (mirror-div trick) | Native didukung (`showTooltip`) |
| TOC / Code block render | Tidak terpengaruh (independen dari editor) | Tidak terpengaruh |
| Risiko mobile (iOS Safari) | Sudah punya workaround yang battle-tested | Perlu validasi ulang behavior mobile dari nol |

**Rekomendasi:** jangan migrasi big-bang. Kerjakan Tier 1 dulu (§4) — semuanya independen dari pilihan editor. Migrasi ke CodeMirror 6 baru dijustifikasi ketika **Floating Toolbar** dan **Code-aware autocompletion** (autocomplete bahasa pemrograman di dalam code block) benar-benar masuk prioritas roadmap, karena keduanya jauh lebih murah & stabil di atas CodeMirror dibanding di-hack manual di atas textarea.

---

## 7. Fitur yang TIDAK Direkomendasikan (dan Alasannya)

| Fitur Inkdrop | Alasan tidak diadopsi |
|---|---|
| Emoji autocompletion | Bertentangan langsung dengan keputusan desain AI Recap yang eksplisit "0 emoji" (ikon SVG vektor) |
| Encrypted cloud sync sebagai default | Bertentangan dengan positioning inti "Zero Data Retention — 100% client-side" yang jadi pembeda AI Recap |
| Aplikasi desktop/mobile native | PWA sudah menutupi kebutuhan offline & instalasi; effort native app tidak sebanding dgn manfaat utk study companion |
| Plugin system penuh (init.js, styles.css, TS plugin API) | Premature untuk aplikasi single-purpose; ROI rendah dibanding fokus fitur belajar inti |
| Vim keybindings | Niche, target audiens siswa umumnya tidak butuh modal editing |
| Local HTTP server literal | Tidak relevan untuk web app tanpa proses lokal permanen — jika mau versi setara, arahnya jadi REST export endpoint (Tier 3), bukan server lokal |

---

## 8. Roadmap Bertahap yang Disarankan

| Sprint | Fokus | Fitur |
|---|---|---|
| **Sprint 1** (~1–2 minggu) | Quick wins, tanpa risiko arsitektur | TOC Panel, Pin to Top, Note Status, Advanced Code Block Rendering |
| **Sprint 2** (~2–3 minggu) | Struktur & navigasi | Slash Commands (generalisasi TriggerMenu), Tags, Command Palette |
| **Sprint 3** (~3–4 minggu, evaluasi arsitektur) | Rendering & organisasi besar | Diagram Mermaid, Notebook/Subject grouping (opsi 1: field `subject`), keputusan go/no-go migrasi CodeMirror 6 |
| **Backlog / Stretch** | Butuh backend atau berisiko terhadap positioning | Inline AI Assistant (kuota terpisah dari kuota recap harian), Smarter link pasting, REST export endpoint utk agent, opt-in encrypted sync |

---

## 9. Dependency Baru yang Direkomendasikan

| Package | Untuk fitur | Ukuran (approx.) | Catatan |
|---|---|---|---|
| `prism-react-renderer` | Advanced code block (§4.4) | Kecil (~30-50KB) | Alternatif lebih ringan dari `shiki` |
| `mermaid` | Diagram Mermaid (§5.1) | ~500KB | Wajib lazy-load via `import()` dinamis |
| `idb` | Storage IndexedDB (§5.5, opsional/stretch) | Sangat kecil | Hanya jika localStorage mulai mepet kapasitas |

Tidak direkomendasikan menambah `fuse.js` untuk Command Palette — cukup fuzzy matcher custom mengingat codebase sudah punya preseden performance-first (`lib/wordCount.ts`).

---

## Referensi

- [Inkdrop — halaman produk](https://www.inkdrop.app/)
- [Inkdrop Documentation](https://docs.inkdrop.app/)
- [Inkdrop Developer/API Reference — Customize the Editor](https://developers.inkdrop.app/guides/customize-the-editor)
- [Inkdrop v6 rebuilds its editor, preview and storage engine — AlternativeTo News](https://alternativeto.net/news/2026/8/inkdrop-v6-rebuilds-its-editor-preview-and-storage-engine/)