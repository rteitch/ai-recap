"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SOUND_FILES = {
  press: {
    SPACE: "/sounds/mxblack/press-space.mp3",
    ENTER: "/sounds/mxblack/press-enter.mp3",
    BACKSPACE: "/sounds/mxblack/press-backspace.mp3",
    GENERIC: [
      "/sounds/mxblack/press-generic-0.mp3",
      "/sounds/mxblack/press-generic-1.mp3",
      "/sounds/mxblack/press-generic-2.mp3",
      "/sounds/mxblack/press-generic-3.mp3",
      "/sounds/mxblack/press-generic-4.mp3",
    ],
  },
  release: {
    SPACE: "/sounds/mxblack/release-space.mp3",
    ENTER: "/sounds/mxblack/release-enter.mp3",
    BACKSPACE: "/sounds/mxblack/release-backspace.mp3",
    GENERIC: "/sounds/mxblack/release-generic.mp3",
  },
};

type DecodedBuffers = {
  press: {
    SPACE: AudioBuffer | null;
    ENTER: AudioBuffer | null;
    BACKSPACE: AudioBuffer | null;
    GENERIC: AudioBuffer[];
  };
  release: {
    SPACE: AudioBuffer | null;
    ENTER: AudioBuffer | null;
    BACKSPACE: AudioBuffer | null;
    GENERIC: AudioBuffer | null;
  };
};

export function useKeyboardSound() {
  const [isEnabled, setIsEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<DecodedBuffers>({
    press: { SPACE: null, ENTER: null, BACKSPACE: null, GENERIC: [] },
    release: { SPACE: null, ENTER: null, BACKSPACE: null, GENERIC: null },
  });
  const isLoadingRef = useRef(false);
  const isLoadedRef = useRef(false);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  // Clear pressed keys if window loses focus so keys never get stuck
  useEffect(() => {
    function handleBlur() {
      pressedKeysRef.current.clear();
    }
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  // Restore user preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ai_recap_sound_enabled");
      if (saved !== null) {
        setIsEnabled(saved === "true");
      } else {
        // Default to enabled for satisfying typing feedback
        setIsEnabled(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const initAudio = useCallback(async () => {
    if (isLoadedRef.current || isLoadingRef.current) return;
    if (typeof window === "undefined") return;

    isLoadingRef.current = true;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = 0.65; // Pleasant, non-fatiguing volume
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      async function loadBuffer(url: string): Promise<AudioBuffer | null> {
        try {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          return await ctx.decodeAudioData(arrayBuffer);
        } catch {
          return null;
        }
      }

      const [
        pSpace,
        pEnter,
        pBackspace,
        pGen0,
        pGen1,
        pGen2,
        pGen3,
        pGen4,
        rSpace,
        rEnter,
        rBackspace,
        rGen,
      ] = await Promise.all([
        loadBuffer(SOUND_FILES.press.SPACE),
        loadBuffer(SOUND_FILES.press.ENTER),
        loadBuffer(SOUND_FILES.press.BACKSPACE),
        loadBuffer(SOUND_FILES.press.GENERIC[0]),
        loadBuffer(SOUND_FILES.press.GENERIC[1]),
        loadBuffer(SOUND_FILES.press.GENERIC[2]),
        loadBuffer(SOUND_FILES.press.GENERIC[3]),
        loadBuffer(SOUND_FILES.press.GENERIC[4]),
        loadBuffer(SOUND_FILES.release.SPACE),
        loadBuffer(SOUND_FILES.release.ENTER),
        loadBuffer(SOUND_FILES.release.BACKSPACE),
        loadBuffer(SOUND_FILES.release.GENERIC),
      ]);

      buffersRef.current = {
        press: {
          SPACE: pSpace,
          ENTER: pEnter,
          BACKSPACE: pBackspace,
          GENERIC: [pGen0, pGen1, pGen2, pGen3, pGen4].filter(Boolean) as AudioBuffer[],
        },
        release: {
          SPACE: rSpace,
          ENTER: rEnter,
          BACKSPACE: rBackspace,
          GENERIC: rGen,
        },
      };

      isLoadedRef.current = true;
    } catch {
      // Ignore audio init failure
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  // Pre-load audio when enabled
  useEffect(() => {
    if (isEnabled) {
      initAudio();
    }
  }, [isEnabled, initAudio]);

  const toggleSound = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ai_recap_sound_enabled", String(next));
      } catch {
        // Ignore
      }
      if (next) {
        initAudio();
      }
      return next;
    });
  }, [initAudio]);

  const playBuffer = useCallback((buffer: AudioBuffer | null) => {
    if (!buffer || !audioCtxRef.current || !gainNodeRef.current) return;
    try {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNodeRef.current);
      source.start(0);
    } catch {
      // Ignore
    }
  }, []);

  const playKeyPress = useCallback(
    (eKey: string) => {
      if (!isEnabled) return;
      const key = eKey.toLowerCase();
      // Physical Cherry MX switch only strikes once on downstroke; ignore repeat until release
      if (pressedKeysRef.current.has(key)) return;
      pressedKeysRef.current.add(key);

      if (!isLoadedRef.current) {
        initAudio();
      }

      const b = buffersRef.current.press;

      if (key === " " || key === "spacebar") {
        playBuffer(b.SPACE);
      } else if (key === "enter") {
        playBuffer(b.ENTER);
      } else if (key === "backspace" || key === "delete") {
        playBuffer(b.BACKSPACE);
      } else if (b.GENERIC.length > 0) {
        const randIndex = Math.floor(Math.random() * b.GENERIC.length);
        playBuffer(b.GENERIC[randIndex]);
      }
    },
    [isEnabled, initAudio, playBuffer]
  );

  const playKeyRelease = useCallback(
    (eKey: string) => {
      if (!isEnabled) return;
      const key = eKey.toLowerCase();
      pressedKeysRef.current.delete(key);

      const b = buffersRef.current.release;

      if (key === " " || key === "spacebar") {
        playBuffer(b.SPACE);
      } else if (key === "enter") {
        playBuffer(b.ENTER);
      } else if (key === "backspace" || key === "delete") {
        playBuffer(b.BACKSPACE);
      } else {
        playBuffer(b.GENERIC);
      }
    },
    [isEnabled, playBuffer]
  );

  return {
    isSoundEnabled: isEnabled,
    toggleSound,
    playKeyPress,
    playKeyRelease,
  };
}
