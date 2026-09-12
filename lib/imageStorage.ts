const DB_NAME = "ai-recap-images";
const DB_VERSION = 1;
const BLOB_STORE = "blobs";
const META_STORE = "meta";

export interface ImageMeta {
  id: number;
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: number;
}

export interface StorageStats {
  usage: number;
  quota: number;
  usagePercent: number;
  imageCount: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        const metaStore = db.createObjectStore(META_STORE, { keyPath: "id" });
        metaStore.createIndex("createdAt", "createdAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(undefined);
      return;
    }
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve(undefined);
    img.src = URL.createObjectURL(file);
  });
}

export async function storeImage(file: File): Promise<ImageMeta> {
  const db = await openDB();
  const dims = await getImageDimensions(file);

  return new Promise<ImageMeta>((resolve, reject) => {
    const tx = db.transaction([BLOB_STORE, META_STORE], "readwrite");
    const blobStore = tx.objectStore(BLOB_STORE);
    const metaStore = tx.objectStore(META_STORE);

    const blobReq = blobStore.add({ blob: file });
    blobReq.onerror = () => reject(blobReq.error);

    blobReq.onsuccess = () => {
      const id = blobReq.result as number;
      const meta: ImageMeta = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        width: dims?.width,
        height: dims?.height,
        createdAt: Date.now(),
      };
      const metaReq = metaStore.add(meta);
      metaReq.onerror = () => reject(metaReq.error);
      metaReq.onsuccess = () => resolve(meta);
    };

    tx.onerror = () => reject(tx.error);
  });
}

export async function getImageBlob(id: number): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOB_STORE, "readonly");
    const req = tx.objectStore(BLOB_STORE).get(id);
    req.onsuccess = () => resolve(req.result?.blob ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getImageMeta(id: number): Promise<ImageMeta | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function listImages(): Promise<ImageMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).getAll();
    req.onsuccess = () => {
      const items = (req.result ?? []) as ImageMeta[];
      items.sort((a, b) => b.createdAt - a.createdAt);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteImage(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([BLOB_STORE, META_STORE], "readwrite");
    tx.objectStore(BLOB_STORE).delete(id);
    tx.objectStore(META_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllImages(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([BLOB_STORE, META_STORE], "readwrite");
    tx.objectStore(BLOB_STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImageCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getStorageStats(): Promise<StorageStats> {
  let usage = 0;
  let quota = 0;

  if ("storage" in navigator && "estimate" in navigator.storage) {
    const est = await navigator.storage.estimate();
    usage = est.usage ?? 0;
    quota = est.quota ?? 0;
  }

  const imageCount = await getImageCount();
  const usagePercent = quota > 0 ? Math.round((usage / quota) * 100) : 0;

  return { usage, quota, usagePercent, imageCount };
}

const blobUrlCache = new Map<number, string>();

export async function getImageUrl(id: number): Promise<string | null> {
  if (blobUrlCache.has(id)) {
    return blobUrlCache.get(id)!;
  }

  const blob = await getImageBlob(id);
  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  blobUrlCache.set(id, url);
  return url;
}

export function revokeImageUrl(id: number): void {
  const url = blobUrlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(id);
  }
}

export function revokeAllImageUrls(): void {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache.clear();
}

export async function hasStorageSpace(bytes: number): Promise<boolean> {
  if (!("storage" in navigator) || !("estimate" in navigator.storage)) {
    return true;
  }
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return usage + bytes < quota * 0.9;
}

const IMAGE_REF_REGEX = /!\[[^\]]*\]\(image:(\d+)\)/g;

export function extractImageIds(text: string): number[] {
  const ids: number[] = [];
  let match;
  while ((match = IMAGE_REF_REGEX.exec(text)) !== null) {
    ids.push(parseInt(match[1], 10));
  }
  return ids;
}

export async function cleanupOrphanedImages(keepTexts: string[]): Promise<number> {
  const keepIds = new Set<number>();
  for (const text of keepTexts) {
    for (const id of extractImageIds(text)) {
      keepIds.add(id);
    }
  }

  const allImages = await listImages();
  let deleted = 0;

  for (const img of allImages) {
    if (!keepIds.has(img.id)) {
      try {
        await deleteImage(img.id);
        revokeImageUrl(img.id);
        deleted++;
      } catch {
      }
    }
  }

  return deleted;
}
