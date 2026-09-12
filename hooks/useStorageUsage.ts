"use client";

import { useState, useEffect, useCallback } from "react";
import { getStorageStats, type StorageStats } from "@/lib/imageStorage";

export function useStorageUsage(intervalMs = 30000) {
  const [stats, setStats] = useState<StorageStats>({
    usage: 0,
    quota: 0,
    usagePercent: 0,
    imageCount: 0,
  });

  const refresh = useCallback(async () => {
    try {
      const newStats = await getStorageStats();
      setStats(newStats);
    } catch {
      // Storage API not supported or error
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { ...stats, refresh };
}
