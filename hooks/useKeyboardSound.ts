"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { triggerHaptic } from "@/lib/haptics";

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
  const lastReleaseTimeRef = useRef<number>(0);

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

  // Auto-unlock Web Audio context on the first user touch or click (crucial for mobile browsers)
  useEffect(() => {
    function unlockAudio() {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      if (isEnabled && !isLoadedRef.current && !isLoadingRef.current) {
        initAudio();
      }
    }

    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("touchend", unlockAudio, { passive: true });
    window.addEventListener("click", unlockAudio, { passive: true });
    return () => {
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("touchend", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };
  }, [isEnabled, initAudio]);

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

  const playBuffer = useCallback((buffer: AudioBuffer | null, pitchVariation: boolean = false) => {
    if (!buffer || !audioCtxRef.current || !gainNodeRef.current) return;
    try {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      if (pitchVariation) {
        // Authentic tactile variation: ±3% micro-pitch jitter prevents robotic machine-gun effect
        source.playbackRate.value = 1.0 + (Math.random() - 0.5) * 0.06;
      }
      source.connect(gainNodeRef.current);
      source.start(0);
    } catch {
      // Ignore
    }
  }, []);

  const playKeyRelease = useCallback(
    (eKey: string) => {
      if (!isEnabled) return;

      // Throttle duplicate release events (prevents synthetic keyup + timeout collision)
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastReleaseTimeRef.current < 45) {
        return;
      }
      lastReleaseTimeRef.current = now;

      const key = eKey ? eKey.toLowerCase() : "generic";
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

  const playKeyPress = useCallback(
    (eKey: string) => {
      if (!isEnabled) return;
      const key = eKey ? eKey.toLowerCase() : "generic";
      const isUnidentified = !key || key === "unidentified" || key === "generic";

      // Detect touch/mobile devices or virtual keyboard input
      const isTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0));

      // On physical keyboards, debounce repeated keydown while key is held down.
      // On touch / virtual keyboards, bypass this check so consecutive same-letter taps ("look", "good") fire reliably!
      if (!isTouch && !isUnidentified) {
        if (pressedKeysRef.current.has(key)) return;
        pressedKeysRef.current.add(key);
      }

      // Provide crisp tactile haptic pulse on mobile touch devices
      if (isTouch) {
        triggerHaptic(8);
      }

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
        // Apply micro-pitch variation on generic keys for organic mechanical feel
        playBuffer(b.GENERIC[randIndex], true);
      }

      // On mobile virtual keyboards, browsers do not reliably dispatch separate keyup events.
      // Schedule the switch release sound after authentic mechanical switch travel time (65ms).
      if (isTouch || isUnidentified) {
        setTimeout(() => {
          playKeyRelease(key);
        }, 65);
      }
    },
    [isEnabled, initAudio, playBuffer, playKeyRelease]
  );

  return {
    isSoundEnabled: isEnabled,
    toggleSound,
    playKeyPress,
    playKeyRelease,
  };
}
