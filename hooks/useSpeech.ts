"use client";

import { useState, useEffect, useCallback } from "react";

export function useSpeech(textToRead: string | undefined) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<1.0 | 1.25 | 1.5>(1.0);

  // Pre-warm SpeechSynthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const warmVoices = () => {
        window.speechSynthesis.getVoices();
      };
      warmVoices();
      window.speechSynthesis.addEventListener("voiceschanged", warmVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", warmVoices);
      };
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    if (!textToRead) return;

    window.speechSynthesis.cancel();

    // Small delay to allow audio thread to reset cleanly
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      const isIndonesian = /\b(yang|dan|di|dari|ini|itu|untuk|pada|adalah|dengan|sebagai|oleh|ke|bisa|akan)\b/i.test(
        textToRead
      );
      utterance.lang = isIndonesian ? "id-ID" : "en-US";

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(isIndonesian ? "id" : "en")
      );
      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [isSpeaking, textToRead, speechRate, stopSpeech]);

  const cycleSpeechRate = useCallback(() => {
    const nextRate: 1.0 | 1.25 | 1.5 =
      speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
    setSpeechRate(nextRate);

    if (
      isSpeaking &&
      textToRead &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = nextRate;
      const isIndonesian = /\b(yang|dan|di|dari|ini|itu|untuk|pada|adalah|dengan|sebagai|oleh|ke|bisa|akan)\b/i.test(
        textToRead
      );
      utterance.lang = isIndonesian ? "id-ID" : "en-US";
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(isIndonesian ? "id" : "en")
      );
      if (matchingVoice) utterance.voice = matchingVoice;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, textToRead, speechRate]);

  return {
    isSpeaking,
    speechRate,
    toggleSpeech,
    cycleSpeechRate,
    stopSpeech,
  };
}
