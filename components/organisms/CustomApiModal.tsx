"use client";

import { useState, useEffect, memo } from "react";
import {
  AiProvider,
  CustomApiConfig,
  PROVIDER_PRESETS,
  DEFAULT_AI_CONFIG,
} from "@/lib/ai-config";
import { toast } from "sonner";

type CustomApiModalProps = {
  isOpen: boolean;
  onClose: () => void;
  config: CustomApiConfig;
  onSave: (newConfig: CustomApiConfig) => void;
};

export const CustomApiModal = memo(function CustomApiModal({
  isOpen,
  onClose,
  config,
  onSave,
}: CustomApiModalProps) {
  const [provider, setProvider] = useState<AiProvider>(config.provider);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [showApiKey, setShowApiKey] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProvider(config.provider);
      setBaseUrl(config.baseUrl);
      setApiKey(config.apiKey);
      setModel(config.model);
      setTestResult(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const currentPreset =
    PROVIDER_PRESETS.find((p) => p.id === provider) || PROVIDER_PRESETS[0];

  function handleSelectProvider(pId: AiProvider) {
    setProvider(pId);
    setTestResult(null);
    const targetPreset = PROVIDER_PRESETS.find((p) => p.id === pId);
    if (!targetPreset) return;

    if (pId === "default") {
      setBaseUrl("");
      setApiKey("");
      setModel(targetPreset.defaultModel);
    } else {
      setBaseUrl(targetPreset.defaultBaseUrl);
      setModel(targetPreset.defaultModel);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          customConfig: {
            enabled: provider !== "default",
            provider,
            baseUrl: baseUrl.trim(),
            apiKey: apiKey.trim(),
            model: model.trim(),
          },
        }),
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Connected successfully to ${data.model || model || "AI"}!`,
          latencyMs: latency,
        });
        toast.success(`Connection verified (${latency}ms)`);
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to reach AI endpoint.",
        });
        toast.error(data.error || "Connection test failed");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Network error testing connection";
      setTestResult({
        success: false,
        message: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    const isCustom = provider !== "default";
    const newConfig: CustomApiConfig = {
      enabled: isCustom,
      provider,
      baseUrl: isCustom ? baseUrl.trim() : "",
      apiKey: isCustom ? apiKey.trim() : "",
      model: isCustom ? model.trim() : currentPreset.defaultModel,
    };

    onSave(newConfig);
    toast.success(
      isCustom
        ? `Switched to custom AI (${currentPreset.name}: ${newConfig.model})`
        : "Switched to Built-in Default AI"
    );
    onClose();
  }

  function handleResetDefault() {
    setProvider("default");
    setBaseUrl("");
    setApiKey("");
    setModel(DEFAULT_AI_CONFIG.model);
    setTestResult(null);
    onSave(DEFAULT_AI_CONFIG);
    toast.success("Reset to Built-in Default AI");
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-app-surface border border-ink-700 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 text-ink-100 max-h-[92vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-highlight-soft border border-highlight/40 flex items-center justify-center text-highlight">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-50">
                AI Engine &amp; API Configuration
              </h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Use built-in cloud AI or bring your own API key &amp; local models (Ollama, LM Studio, OpenAI, Claude).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-ink-400 hover:text-ink-200 hover:bg-ink-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider Tabs Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-200 uppercase tracking-wider block">
            Select AI Provider
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PROVIDER_PRESETS.map((p) => {
              const isSelected = provider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProvider(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-highlight/10 border-highlight/60 shadow-sm"
                      : "bg-ink-900/60 border-ink-800 hover:border-ink-700 hover:bg-ink-850"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-highlight" : "text-ink-200"
                      }`}
                    >
                      {p.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-highlight" />
                    )}
                  </div>
                  <p className="text-[10px] text-ink-400 mt-1 line-clamp-2 leading-tight">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form for Selected Provider */}
        <div className="p-4 rounded-xl bg-ink-900/80 border border-ink-800 space-y-4">
          {provider === "default" ? (
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-ink-100 flex items-center gap-2">
                  <span>Built-in Cloud AI is Active</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    Online &bull; Ready
                  </span>
                </div>
                <p className="text-[11px] text-ink-400 leading-relaxed">
                  No configuration required. Ready to generate instant recaps, quizzes, and flashcards with our default gateway.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Base URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-300">
                    API Base URL
                  </label>
                  <span className="text-[10px] font-mono text-ink-500">
                    OpenAI-compatible (/v1)
                  </span>
                </div>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={currentPreset.defaultBaseUrl || "https://api.example.com/v1"}
                  className="w-full bg-ink-950 border border-ink-700/80 rounded-lg px-3 py-2 text-xs text-ink-100 font-mono placeholder-ink-600 focus:outline-none focus:border-highlight"
                />
              </div>

              {/* API Key (if applicable) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-300">
                    API Key
                  </label>
                  {!currentPreset.requiresKey && (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Not required for local models
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      currentPreset.requiresKey
                        ? "sk-..."
                        : "Optional (leave blank for local Ollama/LM Studio)"
                    }
                    className="w-full bg-ink-950 border border-ink-700/80 rounded-lg pl-3 pr-9 py-2 text-xs text-ink-100 font-mono placeholder-ink-600 focus:outline-none focus:border-highlight"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200"
                    title={showApiKey ? "Hide Key" : "Show Key"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showApiKey ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
                {currentPreset.docHelp && (
                  <p className="text-[10px] text-ink-400 mt-1">
                    {currentPreset.docHelp}
                  </p>
                )}
                <div className="mt-1 text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium rounded-lg p-2">
                  API key is stored locally in your browser. Use a dedicated key with usage limits, not a production key.
                </div>
              </div>

              {/* Model Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-300">
                    Model Identifier
                  </label>
                  {currentPreset.suggestedModels.length > 0 && (
                    <span className="text-[10px] text-ink-500">
                      Quick suggestions below
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gpt-4o-mini, llama3.2, deepseek-r1"
                  className="w-full bg-ink-950 border border-ink-700/80 rounded-lg px-3 py-2 text-xs text-ink-100 font-mono placeholder-ink-600 focus:outline-none focus:border-highlight"
                />

                {/* Suggested Model Pills */}
                {currentPreset.suggestedModels.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {currentPreset.suggestedModels.map((sm) => (
                      <button
                        key={sm}
                        type="button"
                        onClick={() => setModel(sm)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          model === sm
                            ? "bg-highlight text-highlight-text font-bold border-highlight"
                            : "bg-ink-800 text-ink-300 border-ink-700 hover:text-ink-100"
                        }`}
                      >
                        {sm}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Test Connection Button & Result Banner */}
          <div className="pt-2 border-t border-ink-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-200 hover:text-ink-50 text-xs font-medium border border-ink-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-highlight" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Testing Connection…</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Test Connection</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-2 ${
                  testResult.success
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                {testResult.success ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span>
                  {testResult.message}
                  {testResult.latencyMs && (
                    <span className="font-mono text-[10px] ml-1 opacity-75">
                      ({testResult.latencyMs}ms)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-ink-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-ink-400 hover:text-ink-200 transition-colors"
            >
              Reset to Default
            </button>
            <span className="text-ink-700 text-xs">·</span>
            <a
              href="https://github.com/rteitch/ai-recap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-highlight transition-colors"
              title="View source on GitHub"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-ink-300 hover:text-ink-100 hover:bg-ink-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-highlight hover:bg-highlight-hover text-highlight-text font-bold text-xs transition-colors shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
