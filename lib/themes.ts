export type ThemeId =
  | "inkdrop"
  | "catppuccin-mocha"
  | "tokyo-night"
  | "nord"
  | "dracula"
  | "github-dark"
  | "github-light"
  | "solarized-dark"
  | "one-dark-pro"
  | "monokai-pro"
  | "solarized-light"
  | "gruvbox-dark"
  | "custom";

export type EditorFontId =
  | "system-mono"
  | "jetbrains-mono"
  | "fira-code"
  | "geist-mono"
  | "comic-mono"
  | "custom";

export type UIFontId =
  | "system-sans"
  | "inter"
  | "lexend"
  | "plus-jakarta"
  | "atkinson"
  | "merriweather";

export type FontSizeId = "compact" | "normal" | "large";

export interface ThemeColors {
  name: string;
  id: ThemeId;
  isDark: boolean;
  // Surface backgrounds
  bgApp: string;
  bgSidebar: string;
  bgSurface: string;
  bgCard: string;
  bgCardHover: string;
  // Ink text hierarchy
  ink50: string;
  ink100: string;
  ink200: string;
  ink300: string;
  ink400: string;
  ink500: string;
  ink600: string;
  ink700: string;
  ink800: string;
  ink850: string;
  ink900: string;
  ink950: string;
  // Brand / highlight accent
  highlight: string;
  highlightHover: string;
  highlightSoft: string;
  highlightText: string;
  // Borders
  border: string;
}

export interface CustomThemeConfig {
  bgApp: string;
  bgSidebar: string;
  bgSurface: string;
  highlight: string;
  isDark: boolean;
}

export interface FontOption<T = string> {
  id: T;
  name: string;
  description: string;
  family: string;
}

export interface AppearanceState {
  themeId: ThemeId;
  customTheme: CustomThemeConfig;
  editorFont: EditorFontId;
  uiFont: UIFontId;
  customSystemFont: string;
  fontSize: FontSizeId;
}

export const THEME_PRESETS: Record<ThemeId, ThemeColors> = {
  inkdrop: {
    name: "Inkdrop Classic",
    id: "inkdrop",
    isDark: true,
    bgApp: "#14181f",
    bgSidebar: "#11141a",
    bgSurface: "#181924",
    bgCard: "#1c222c",
    bgCardHover: "#242b38",
    ink50: "#EDEEF0",
    ink100: "#E2E4E9",
    ink200: "#C4C9D2",
    ink300: "#A0A7B5",
    ink400: "#8B93A1",
    ink500: "#6B7280",
    ink600: "#4A5261",
    ink700: "#2E3543",
    ink800: "#1C222C",
    ink850: "#171B24",
    ink900: "#14181F",
    ink950: "#0D1015",
    highlight: "#F5C518",
    highlightHover: "#e5b512",
    highlightSoft: "rgba(245, 197, 24, 0.12)",
    highlightText: "#0d1015",
    border: "rgba(255, 255, 255, 0.08)",
  },

  "catppuccin-mocha": {
    name: "Catppuccin Mocha",
    id: "catppuccin-mocha",
    isDark: true,
    bgApp: "#1e1e2e",
    bgSidebar: "#181825",
    bgSurface: "#24253a",
    bgCard: "#313244",
    bgCardHover: "#3b3d52",
    ink50: "#f5e0dc",
    ink100: "#cdd6f4",
    ink200: "#bac2de",
    ink300: "#a6adc8",
    ink400: "#9399b2",
    ink500: "#7f849c",
    ink600: "#6c7086",
    ink700: "#45475a",
    ink800: "#313244",
    ink850: "#25263a",
    ink900: "#1e1e2e",
    ink950: "#11111b",
    highlight: "#cba6f7",
    highlightHover: "#b48bf2",
    highlightSoft: "rgba(203, 166, 247, 0.15)",
    highlightText: "#11111b",
    border: "rgba(205, 214, 244, 0.12)",
  },

  "tokyo-night": {
    name: "Tokyo Night",
    id: "tokyo-night",
    isDark: true,
    bgApp: "#1a1b26",
    bgSidebar: "#16161e",
    bgSurface: "#1f2335",
    bgCard: "#24283b",
    bgCardHover: "#292e42",
    ink50: "#f0f2ff",
    ink100: "#c0caf5",
    ink200: "#a9b1d6",
    ink300: "#9aa5ce",
    ink400: "#7aa2f7",
    ink500: "#565f89",
    ink600: "#414868",
    ink700: "#2f3549",
    ink800: "#24283b",
    ink850: "#1c2030",
    ink900: "#1a1b26",
    ink950: "#13141c",
    highlight: "#7aa2f7",
    highlightHover: "#6691f0",
    highlightSoft: "rgba(122, 162, 247, 0.15)",
    highlightText: "#13141c",
    border: "rgba(192, 202, 245, 0.1)",
  },

  nord: {
    name: "Nord Arctic",
    id: "nord",
    isDark: true,
    bgApp: "#2e3440",
    bgSidebar: "#242933",
    bgSurface: "#343b49",
    bgCard: "#3b4252",
    bgCardHover: "#434c5e",
    ink50: "#eceff4",
    ink100: "#e5e9f0",
    ink200: "#d8dee9",
    ink300: "#c2c9d6",
    ink400: "#88c0d0",
    ink500: "#81a1c1",
    ink600: "#5e81ac",
    ink700: "#4c566a",
    ink800: "#3b4252",
    ink850: "#2e3440",
    ink900: "#242933",
    ink950: "#1d212a",
    highlight: "#88c0d0",
    highlightHover: "#78b0c0",
    highlightSoft: "rgba(136, 192, 208, 0.15)",
    highlightText: "#1d212a",
    border: "rgba(216, 222, 233, 0.1)",
  },

  dracula: {
    name: "Dracula",
    id: "dracula",
    isDark: true,
    bgApp: "#282a36",
    bgSidebar: "#21222c",
    bgSurface: "#2d303e",
    bgCard: "#383a4c",
    bgCardHover: "#44475a",
    ink50: "#f8f8f2",
    ink100: "#e2e2dc",
    ink200: "#bd93f9",
    ink300: "#bfbfbf",
    ink400: "#8be9fd",
    ink500: "#6272a4",
    ink600: "#4d5b82",
    ink700: "#3d4766",
    ink800: "#383a4c",
    ink850: "#2d303e",
    ink900: "#282a36",
    ink950: "#191a21",
    highlight: "#bd93f9",
    highlightHover: "#aa7bf2",
    highlightSoft: "rgba(189, 147, 249, 0.15)",
    highlightText: "#191a21",
    border: "rgba(248, 248, 242, 0.1)",
  },

  "github-dark": {
    name: "GitHub Dark",
    id: "github-dark",
    isDark: true,
    bgApp: "#0d1117",
    bgSidebar: "#010409",
    bgSurface: "#161b22",
    bgCard: "#21262d",
    bgCardHover: "#30363d",
    ink50: "#f0f6fc",
    ink100: "#e6edf3",
    ink200: "#c9d1d9",
    ink300: "#b1bac4",
    ink400: "#8b949e",
    ink500: "#6e7681",
    ink600: "#484f58",
    ink700: "#30363d",
    ink800: "#21262d",
    ink850: "#161b22",
    ink900: "#0d1117",
    ink950: "#010409",
    highlight: "#58a6ff",
    highlightHover: "#438fe6",
    highlightSoft: "rgba(88, 166, 255, 0.15)",
    highlightText: "#010409",
    border: "rgba(240, 246, 252, 0.1)",
  },

  "github-light": {
    name: "GitHub Light / Paper",
    id: "github-light",
    isDark: false,
    bgApp: "#ffffff",
    bgSidebar: "#f6f8fa",
    bgSurface: "#f0f2f5",
    bgCard: "#ffffff",
    bgCardHover: "#eaeef2",
    ink50: "#1f2328",
    ink100: "#24292f",
    ink200: "#32383f",
    ink300: "#424a53",
    ink400: "#57606a",
    ink500: "#6e7781",
    ink600: "#8c959f",
    ink700: "#d0d7de",
    ink800: "#e1e4e8",
    ink850: "#eaeef2",
    ink900: "#f6f8fa",
    ink950: "#ffffff",
    highlight: "#0969da",
    highlightHover: "#0550ae",
    highlightSoft: "rgba(9, 105, 218, 0.12)",
    highlightText: "#ffffff",
    border: "rgba(31, 35, 40, 0.12)",
  },

  "solarized-dark": {
    name: "Solarized Dark",
    id: "solarized-dark",
    isDark: true,
    bgApp: "#002b36",
    bgSidebar: "#073642",
    bgSurface: "#094452",
    bgCard: "#0b5263",
    bgCardHover: "#0e6175",
    ink50: "#fdf6e3",
    ink100: "#eee8d5",
    ink200: "#93a1a1",
    ink300: "#839496",
    ink400: "#657b83",
    ink500: "#586e75",
    ink600: "#47595f",
    ink700: "#26484f",
    ink800: "#073642",
    ink850: "#042c36",
    ink900: "#002b36",
    ink950: "#001f27",
    highlight: "#b58900",
    highlightHover: "#9a7400",
    highlightSoft: "rgba(181, 137, 0, 0.18)",
    highlightText: "#001f27",
    border: "rgba(147, 161, 161, 0.15)",
  },

  "one-dark-pro": {
    name: "One Dark Pro",
    id: "one-dark-pro",
    isDark: true,
    bgApp: "#282c34",
    bgSidebar: "#21252b",
    bgSurface: "#2f3440",
    bgCard: "#353b45",
    bgCardHover: "#3e4451",
    ink50: "#abb2bf",
    ink100: "#e5e9f0",
    ink200: "#abb2bf",
    ink300: "#828997",
    ink400: "#61afef",
    ink500: "#5c6370",
    ink600: "#4b5263",
    ink700: "#383e4a",
    ink800: "#2c313a",
    ink850: "#242830",
    ink900: "#21252b",
    ink950: "#1b1d23",
    highlight: "#61afef",
    highlightHover: "#4fa3e3",
    highlightSoft: "rgba(97, 175, 239, 0.15)",
    highlightText: "#1b1d23",
    border: "rgba(171, 178, 191, 0.12)",
  },

  "monokai-pro": {
    name: "Monokai Pro",
    id: "monokai-pro",
    isDark: true,
    bgApp: "#2d2a2e",
    bgSidebar: "#221f22",
    bgSurface: "#363337",
    bgCard: "#403e41",
    bgCardHover: "#4a474b",
    ink50: "#fcfcfa",
    ink100: "#f7f7f5",
    ink200: "#e3e3e1",
    ink300: "#c1c0c0",
    ink400: "#a9dc76",
    ink500: "#727072",
    ink600: "#5b595c",
    ink700: "#403e41",
    ink800: "#363337",
    ink850: "#2b282c",
    ink900: "#221f22",
    ink950: "#19181a",
    highlight: "#ffd866",
    highlightHover: "#fcc642",
    highlightSoft: "rgba(255, 216, 102, 0.16)",
    highlightText: "#19181a",
    border: "rgba(252, 252, 250, 0.1)",
  },

  "solarized-light": {
    name: "Solarized Light / Paper",
    id: "solarized-light",
    isDark: false,
    bgApp: "#fdf6e3",
    bgSidebar: "#eee8d5",
    bgSurface: "#f6f0dc",
    bgCard: "#ffffff",
    bgCardHover: "#eae4d0",
    ink50: "#002b36",
    ink100: "#073642",
    ink200: "#586e75",
    ink300: "#657b83",
    ink400: "#839496",
    ink500: "#93a1a1",
    ink600: "#a8b5b5",
    ink700: "#cbd6d6",
    ink800: "#e0d9c4",
    ink850: "#eae4d0",
    ink900: "#eee8d5",
    ink950: "#fdf6e3",
    highlight: "#268bd2",
    highlightHover: "#1f75b3",
    highlightSoft: "rgba(38, 139, 210, 0.14)",
    highlightText: "#ffffff",
    border: "rgba(7, 54, 66, 0.12)",
  },

  "gruvbox-dark": {
    name: "Gruvbox Dark",
    id: "gruvbox-dark",
    isDark: true,
    bgApp: "#282828",
    bgSidebar: "#1d2021",
    bgSurface: "#32302f",
    bgCard: "#3c3836",
    bgCardHover: "#504945",
    ink50: "#fbf1c7",
    ink100: "#ebdbb2",
    ink200: "#d5c4a1",
    ink300: "#bdae93",
    ink400: "#fabd2f",
    ink500: "#928374",
    ink600: "#665c54",
    ink700: "#504945",
    ink800: "#3c3836",
    ink850: "#282828",
    ink900: "#1d2021",
    ink950: "#141617",
    highlight: "#fabd2f",
    highlightHover: "#e5a820",
    highlightSoft: "rgba(250, 189, 47, 0.16)",
    highlightText: "#141617",
    border: "rgba(235, 219, 178, 0.12)",
  },

  custom: {
    name: "Custom Theme",
    id: "custom",
    isDark: true,
    bgApp: "#15161e",
    bgSidebar: "#111218",
    bgSurface: "#1a1c27",
    bgCard: "#222533",
    bgCardHover: "#2b2f42",
    ink50: "#edf0f7",
    ink100: "#dbe0ec",
    ink200: "#c2c9d8",
    ink300: "#9ea6b8",
    ink400: "#828b9e",
    ink500: "#677083",
    ink600: "#4f5668",
    ink700: "#373c49",
    ink800: "#242732",
    ink850: "#1a1c25",
    ink900: "#15161e",
    ink950: "#0e0f14",
    highlight: "#10b981",
    highlightHover: "#059669",
    highlightSoft: "rgba(16, 185, 129, 0.15)",
    highlightText: "#0e0f14",
    border: "rgba(255, 255, 255, 0.08)",
  },
};

export const EDITOR_FONTS: FontOption<EditorFontId>[] = [
  {
    id: "system-mono",
    name: "System Monospace",
    description: "Native OS code font (Consolas, Menlo, Monaco)",
    family: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    description: "Industry favorite for code readability & ligatures",
    family: "'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  {
    id: "fira-code",
    name: "Fira Code",
    description: "Popular developer font with clean ligatures",
    family: "'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  {
    id: "geist-mono",
    name: "Geist Mono",
    description: "Modern, crisp monospace designed by Vercel",
    family: "'Geist Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  {
    id: "comic-mono",
    name: "Comic Mono",
    description: "Legible & friendly font, reduces reading strain & fatigue",
    family: "'Comic Mono', 'Comic Sans MS', cursive, monospace",
  },
  {
    id: "custom",
    name: "Custom Local Font",
    description: "Use any font already installed on your device",
    family: "inherit",
  },
];

export const UI_FONTS: FontOption<UIFontId>[] = [
  {
    id: "system-sans",
    name: "System UI (San Francisco / Segoe)",
    description: "Fast native operating system font stack",
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  {
    id: "inter",
    name: "Inter",
    description: "The modern design standard for digital interfaces",
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    id: "lexend",
    name: "Lexend",
    description: "Scientifically proven to improve reading speed & reduce dyslexia strain",
    family: "'Lexend', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    description: "Contemporary geometric sans-serif with friendly curves",
    family: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    id: "atkinson",
    name: "Atkinson Hyperlegible",
    description: "Created by Braille Institute for maximum character distinction",
    family: "'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    id: "merriweather",
    name: "Merriweather / Editorial Serif",
    description: "Book-like reading experience for long study notes",
    family: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
];

export const FONT_SIZES: { id: FontSizeId; name: string; size: string; description: string }[] = [
  { id: "compact", name: "Compact", size: "13px", description: "Fits more information on screen" },
  { id: "normal", name: "Default", size: "14px", description: "Optimal balance for all displays" },
  { id: "large", name: "Comfortable", size: "15.5px", description: "Easier on eyes during long sessions" },
];

export const DEFAULT_APPEARANCE: AppearanceState = {
  themeId: "inkdrop",
  customTheme: {
    bgApp: "#15161e",
    bgSidebar: "#111218",
    bgSurface: "#1a1c27",
    highlight: "#F5C518",
    isDark: true,
  },
  editorFont: "jetbrains-mono",
  uiFont: "inter",
  customSystemFont: "",
  fontSize: "normal",
};

/**
 * Calculates WCAG relative luminance to determine optimal high-contrast text (#0d1015 vs #ffffff)
 */
export function getContrastTextColor(hex: string): string {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return "#ffffff";
  const r = parseInt(cleanHex.length === 3 ? cleanHex[0] + cleanHex[0] : cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.length === 3 ? cleanHex[1] + cleanHex[1] : cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.length === 3 ? cleanHex[2] + cleanHex[2] : cleanHex.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return lum > 0.38 ? "#0d1015" : "#ffffff";
}

/**
 * Generate full ThemeColors object from a user's custom partial configuration
 */
export function buildCustomThemeColors(config: CustomThemeConfig): ThemeColors {
  const isDark = config.isDark;
  return {
    name: "Custom Theme",
    id: "custom",
    isDark,
    bgApp: config.bgApp,
    bgSidebar: config.bgSidebar,
    bgSurface: config.bgSurface,
    bgCard: config.bgSurface,
    bgCardHover: config.bgSurface,
    ink50: isDark ? "#EDEEF0" : "#1f2328",
    ink100: isDark ? "#E2E4E9" : "#24292f",
    ink200: isDark ? "#C4C9D2" : "#32383f",
    ink300: isDark ? "#A0A7B5" : "#424a53",
    ink400: isDark ? "#8B93A1" : "#57606a",
    ink500: isDark ? "#6B7280" : "#6e7781",
    ink600: isDark ? "#4A5261" : "#8c959f",
    ink700: isDark ? "#2E3543" : "#d0d7de",
    ink800: isDark ? "#1C222C" : "#e1e4e8",
    ink850: isDark ? "#171B24" : "#eaeef2",
    ink900: config.bgApp,
    ink950: config.bgSidebar,
    highlight: config.highlight,
    highlightHover: config.highlight,
    highlightSoft: `${config.highlight}25`,
    highlightText: getContrastTextColor(config.highlight),
    border: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
  };
}

/**
 * Apply CSS custom properties to document root element
 */
export function applyThemeToDOM(colors: ThemeColors, state: AppearanceState) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute("data-theme", colors.id);
  root.setAttribute("data-color-scheme", colors.isDark ? "dark" : "light");

  // Core backgrounds
  root.style.setProperty("--bg-app", colors.bgApp);
  root.style.setProperty("--bg-sidebar", colors.bgSidebar);
  root.style.setProperty("--bg-surface", colors.bgSurface);
  root.style.setProperty("--bg-card", colors.bgCard);
  root.style.setProperty("--bg-card-hover", colors.bgCardHover);

  // Inks
  root.style.setProperty("--ink-50", colors.ink50);
  root.style.setProperty("--ink-100", colors.ink100);
  root.style.setProperty("--ink-200", colors.ink200);
  root.style.setProperty("--ink-300", colors.ink300);
  root.style.setProperty("--ink-400", colors.ink400);
  root.style.setProperty("--ink-500", colors.ink500);
  root.style.setProperty("--ink-600", colors.ink600);
  root.style.setProperty("--ink-700", colors.ink700);
  root.style.setProperty("--ink-800", colors.ink800);
  root.style.setProperty("--ink-850", colors.ink850);
  root.style.setProperty("--ink-900", colors.ink900);
  root.style.setProperty("--ink-950", colors.ink950);

  // Highlight / Accent
  root.style.setProperty("--highlight", colors.highlight);
  root.style.setProperty("--highlight-hover", colors.highlightHover);
  root.style.setProperty("--highlight-soft", colors.highlightSoft);
  root.style.setProperty("--highlight-text", colors.highlightText);
  root.style.setProperty("--border-color", colors.border);

  // Typography font-family
  let editorFamily = EDITOR_FONTS.find((f) => f.id === state.editorFont)?.family;
  if (state.editorFont === "custom" && state.customSystemFont.trim()) {
    editorFamily = `"${state.customSystemFont.trim()}", monospace`;
  }
  const uiFamily = UI_FONTS.find((f) => f.id === state.uiFont)?.family;

  if (editorFamily) root.style.setProperty("--font-editor", editorFamily);
  if (uiFamily) root.style.setProperty("--font-ui", uiFamily);

  // Base font size
  const sizeMap: Record<FontSizeId, string> = {
    compact: "13px",
    normal: "14px",
    large: "15.5px",
  };
  root.style.setProperty("--editor-font-size", sizeMap[state.fontSize]);

  // Dispatch custom event so listeners (like MermaidRenderer) know theme updated
  window.dispatchEvent(
    new CustomEvent("ai-recap-appearance-change", {
      detail: { colors, state },
    })
  );
}
