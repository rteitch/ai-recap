"use client";

import { memo, useState } from "react";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { clearAllImages } from "@/lib/imageStorage";
import { triggerHaptic } from "@/lib/haptics";
import { toast } from "sonner";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const StorageIndicator = memo(function StorageIndicator() {
  const { usage, quota, usagePercent, imageCount, refresh } = useStorageUsage(15000);
  const [showDetails, setShowDetails] = useState(false);

  if (imageCount === 0 && usage === 0) return null;

  const barColor =
    usagePercent > 80
      ? "bg-red-500"
      : usagePercent > 60
      ? "bg-amber-500"
      : "bg-emerald-500";

  async function handleClear() {
    triggerHaptic();
    try {
      await clearAllImages();
      await refresh();
      toast.success("Semua gambar telah dihapus");
    } catch {
      toast.error("Gagal menghapus gambar");
    }
    setShowDetails(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-ink-400 hover:text-ink-200 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-800/50"
        title="Storage usage"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="hidden sm:inline">{imageCount} img</span>
        <span className="w-12 h-1.5 bg-ink-800 rounded-full overflow-hidden">
          <span className={`h-full ${barColor} rounded-full block`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
        </span>
      </button>

      {showDetails && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDetails(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-ink-900 border border-ink-700/60 rounded-lg shadow-xl p-3 min-w-[200px]">
            <div className="text-xs font-semibold text-ink-200 mb-2">Storage</div>
            <div className="space-y-1.5 text-[11px] text-ink-400">
              <div className="flex justify-between">
                <span>Gambar</span>
                <span className="text-ink-200">{imageCount} file</span>
              </div>
              <div className="flex justify-between">
                <span>Terpakai</span>
                <span className="text-ink-200">{formatBytes(usage)}</span>
              </div>
              {quota > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Kuota</span>
                    <span className="text-ink-200">{formatBytes(quota)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-ink-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                  </div>
                </>
              )}
            </div>
            {imageCount > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="mt-2 w-full text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded py-1 transition-colors"
              >
                Hapus Semua Gambar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
});
