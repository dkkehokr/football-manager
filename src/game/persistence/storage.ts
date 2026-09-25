export type StorageFailureKind = 'unavailable' | 'corrupt' | 'write-failed'

export interface StorageFailure {
  kind: StorageFailureKind
  message: string
  cause?: unknown
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: StorageFailure }

function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

function fail(kind: StorageFailureKind, message: string, cause?: unknown): Result<never> {
  return { ok: false, error: { kind, message, cause } }
}

// Touching localStorage can itself throw (private mode, disabled storage, or a non-browser
// host), so access is guarded rather than assuming the global exists and is usable.
function getStore(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

export function readJson<T>(key: string): Result<T | null> {
  const store = getStore()
  if (!store) return fail('unavailable', 'localStorage is not available')
  let raw: string | null
  try {
    raw = store.getItem(key)
  } catch (cause) {
    return fail('unavailable', `Failed to read key "${key}"`, cause)
  }
  if (raw === null) return ok(null)
  try {
    return ok(JSON.parse(raw) as T)
  } catch (cause) {
    return fail('corrupt', `Stored JSON for key "${key}" could not be parsed`, cause)
  }
}

export function writeJson<T>(key: string, value: T): Result<void> {
  const store = getStore()
  if (!store) return fail('unavailable', 'localStorage is not available')
  let serialized: string
  try {
    serialized = JSON.stringify(value)
  } catch (cause) {
    return fail('write-failed', `Failed to serialize value for key "${key}"`, cause)
  }
  try {
    store.setItem(key, serialized)
    return ok(undefined)
  } catch (cause) {
    return fail('write-failed', `Failed to write key "${key}" (quota exceeded or disabled?)`, cause)
  }
}

export function removeKey(key: string): Result<void> {
  const store = getStore()
  if (!store) return fail('unavailable', 'localStorage is not available')
  try {
    store.removeItem(key)
    return ok(undefined)
  } catch (cause) {
    return fail('write-failed', `Failed to remove key "${key}"`, cause)
  }
}
