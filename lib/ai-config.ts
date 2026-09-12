export type AiProvider =
  | "default"
  | "openai"
  | "anthropic"
  | "openrouter"
  | "ollama"
  | "lmstudio"
  | "custom";

export type CustomApiConfig = {
  enabled: boolean;
  provider: AiProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type ProviderPreset = {
  id: AiProvider;
  name: string;
  description: string;
  defaultBaseUrl: string;
  requiresKey: boolean;
  defaultModel: string;
  suggestedModels: string[];
  docHelp?: string;
};

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "default",
    name: "Built-in AI (Default)",
    description: "Pre-configured cloud model. No setup or API key needed.",
    defaultBaseUrl: "",
    requiresKey: false,
    defaultModel: "Default DeepSeek/Kimi Gateway",
    suggestedModels: ["Default DeepSeek/Kimi Gateway"],
    docHelp: "Free daily fair-use quota (10 recaps/day).",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Direct connection to official OpenAI API.",
    defaultBaseUrl: "https://api.openai.com/v1",
    requiresKey: true,
    defaultModel: "gpt-4o-mini",
    suggestedModels: ["gpt-4o-mini", "gpt-4o", "o3-mini", "gpt-4-turbo"],
    docHelp: "Get your API key at platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Claude models via OpenAI-compatible endpoint or OpenRouter.",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    requiresKey: true,
    defaultModel: "anthropic/claude-3.5-sonnet",
    suggestedModels: [
      "anthropic/claude-3.5-sonnet",
      "anthropic/claude-3.5-haiku",
      "anthropic/claude-3-opus",
    ],
    docHelp: "OpenRouter route to Anthropic models (openrouter.ai/keys)",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified access to 200+ AI models (DeepSeek, Llama, Claude, etc.)",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    requiresKey: true,
    defaultModel: "deepseek/deepseek-r1",
    suggestedModels: [
      "deepseek/deepseek-r1",
      "meta-llama/llama-3.3-70b-instruct",
      "google/gemini-2.0-flash-exp:free",
      "openai/gpt-4o-mini",
      "qwen/qwen-2.5-72b-instruct",
    ],
    docHelp: "Get an OpenRouter key at openrouter.ai/keys",
  },
  {
    id: "ollama",
    name: "Ollama (Local LLM)",
    description: "Run 100% private models on your local machine with 0 cost.",
    defaultBaseUrl: "http://localhost:11434/v1",
    requiresKey: false,
    defaultModel: "llama3.2",
    suggestedModels: [
      "llama3.2",
      "llama3.1",
      "mistral",
      "deepseek-r1:8b",
      "deepseek-r1:14b",
      "qwen2.5:7b",
      "phi3",
    ],
    docHelp: "Ensure Ollama is running (`ollama serve` or Ollama app desktop).",
  },
  {
    id: "lmstudio",
    name: "LM Studio (Local LLM)",
    description: "Connect to local models hosted in LM Studio Local Server.",
    defaultBaseUrl: "http://localhost:1234/v1",
    requiresKey: false,
    defaultModel: "local-model",
    suggestedModels: ["local-model"],
    docHelp: "Start the Local Server in LM Studio (Developer tab).",
  },
  {
    id: "custom",
    name: "Custom OpenAI-Compatible Endpoint",
    description: "Any custom endpoint adhering to /v1/chat/completions standard.",
    defaultBaseUrl: "",
    requiresKey: false,
    defaultModel: "",
    suggestedModels: [],
    docHelp: "Supports Groq, Together, vLLM, Aphrodite, FastChat, etc.",
  },
];

export const DEFAULT_AI_CONFIG: CustomApiConfig = {
  enabled: false,
  provider: "default",
  baseUrl: "",
  apiKey: "",
  model: "Default DeepSeek/Kimi Gateway",
};

const STORAGE_KEY = "ai_recap_custom_api_settings";

export function loadCustomApiConfig(): CustomApiConfig {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      provider: parsed.provider || "default",
      baseUrl: parsed.baseUrl || "",
      apiKey: parsed.apiKey || "",
      model: parsed.model || "",
    };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveCustomApiConfig(config: CustomApiConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota error
  }
}
