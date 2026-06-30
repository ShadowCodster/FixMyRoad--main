// Lightweight IndexedDB wrapper for offline support.
// Stores: (1) queued complaints (with image blobs) submitted while offline,
// and (2) cached GET responses (dashboard, roads, nearby roads) for offline viewing.

const DB_NAME = 'roadwatch_offline'
const DB_VERSION = 1
const QUEUE_STORE = 'complaint_queue'
const CACHE_STORE = 'api_cache'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'localId' })
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ── Queued complaints (offline submission) ──────────────────────

export interface QueuedComplaint {
  localId: string
  roadSlNo: number
  latitude: string
  longitude: string
  imageBlob: Blob
  imageName: string
  createdAt: string
  status: 'pending' | 'syncing' | 'failed'
}

export async function queueComplaint(
  data: Omit<QueuedComplaint, 'localId' | 'createdAt' | 'status'>,
): Promise<QueuedComplaint> {
  const db = await openDB()
  const item: QueuedComplaint = {
    ...data,
    localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite')
    tx.objectStore(QUEUE_STORE).put(item)
    tx.oncomplete = () => resolve(item)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getQueuedComplaints(): Promise<QueuedComplaint[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly')
    const req = tx.objectStore(QUEUE_STORE).getAll()
    req.onsuccess = () => resolve(req.result as QueuedComplaint[])
    req.onerror = () => reject(req.error)
  })
}

export async function removeQueuedComplaint(localId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite')
    tx.objectStore(QUEUE_STORE).delete(localId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function updateQueuedComplaintStatus(
  localId: string,
  status: QueuedComplaint['status'],
): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite')
    const store = tx.objectStore(QUEUE_STORE)
    const getReq = store.get(localId)
    getReq.onsuccess = () => {
      const item = getReq.result as QueuedComplaint | undefined
      if (item) {
        item.status = status
        store.put(item)
      }
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Generic API response cache (for offline viewing) ────────────

interface CacheEntry {
  key: string
  data: unknown
  cachedAt: string
}

export async function setCachedData(key: string, data: unknown): Promise<void> {
  const db = await openDB()
  const entry: CacheEntry = { key, data, cachedAt: new Date().toISOString() }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, 'readwrite')
    tx.objectStore(CACHE_STORE).put(entry)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedData<T>(key: string): Promise<{ data: T; cachedAt: string } | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, 'readonly')
    const req = tx.objectStore(CACHE_STORE).get(key)
    req.onsuccess = () => {
      const entry = req.result as CacheEntry | undefined
      resolve(entry ? { data: entry.data as T, cachedAt: entry.cachedAt } : null)
    }
    req.onerror = () => reject(req.error)
  })
}