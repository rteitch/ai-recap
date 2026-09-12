export function triggerHaptic(duration = 12) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(duration);
    } catch {
      // Silently ignore if not supported
    }
  }
}
