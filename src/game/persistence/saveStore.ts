import type { GameState, NewGameInput, SaveSummary } from '../state'
import { GAME_STATE_VERSION } from '../state'
import type { Result } from './storage'
import { readJson, removeKey, writeJson } from './storage'

const NAMESPACE = 'matchday'
const INDEX_KEY = `${NAMESPACE}.saves.index`

/** localStorage key holding a single save's full state. */
const saveKey = (id: string): string => `${NAMESPACE}.save.${id}`

/** Generate a stable save id, preferring crypto.randomUUID with a random fallback. */
function newId(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  return `save_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** Project a full GameState down to the lightweight SaveSummary kept in the index. */
function toSummary(state: GameState): SaveSummary {
  return {
    id: state.id,
    managerName: state.managerName,
    label: state.label,
    favorite: state.favorite,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    version: state.version,
  }
}

/** Build a fresh GameState from user input. Pure — does not touch storage. */
export function createGameState(input: NewGameInput): GameState {
  const now = Date.now()
  return {
    version: GAME_STATE_VERSION,
    id: newId(),
    managerName: input.managerName.trim(),
    favorite: false,
    createdAt: now,
    updatedAt: now,
    world: {},
  }
}

/**
 * List all save summaries from the index, treating a missing index as empty.
 * `favorite` is coalesced so saves written before the field existed read as not-favorited.
 */
export function listSaves(): Result<SaveSummary[]> {
  const result = readJson<SaveSummary[]>(INDEX_KEY)
  if (!result.ok) return result
  const summaries = (result.value ?? []).map((s) => ({ ...s, favorite: s.favorite ?? false }))
  return { ok: true, value: summaries }
}

/** Insert or replace a save's summary in the index. */
function upsertIndex(summary: SaveSummary): Result<void> {
  const listed = listSaves()
  if (!listed.ok) return listed
  const next = listed.value.filter((s) => s.id !== summary.id)
  next.push(summary)
  return writeJson(INDEX_KEY, next)
}

/** Persist a save's full state (restamping updatedAt) and upsert its index entry. */
export function saveGame(state: GameState): Result<GameState> {
  const stamped: GameState = { ...state, updatedAt: Date.now() }
  const written = writeJson(saveKey(stamped.id), stamped)
  if (!written.ok) return written
  const indexed = upsertIndex(toSummary(stamped))
  if (!indexed.ok) return indexed
  return { ok: true, value: stamped }
}

/** Create a new game from input and persist it in one step. */
export function startNewGame(input: NewGameInput): Result<GameState> {
  return saveGame(createGameState(input))
}

/**
 * Load a full save by id. ok(null) when no save exists for that id.
 * `favorite` is coalesced so saves written before the field existed load as not-favorited.
 */
export function loadGame(id: string): Result<GameState | null> {
  const result = readJson<GameState>(saveKey(id))
  if (!result.ok) return result
  const state = result.value
  if (state === null) return { ok: true, value: null }
  return { ok: true, value: { ...state, favorite: state.favorite ?? false } }
}

/** Delete a save's entry and remove it from the index. */
export function deleteGame(id: string): Result<void> {
  const removed = removeKey(saveKey(id))
  if (!removed.ok) return removed
  const listed = listSaves()
  if (!listed.ok) return listed
  return writeJson(INDEX_KEY, listed.value.filter((s) => s.id !== id))
}

/**
 * Load a save, apply a mutation, and persist it (restamping updatedAt via saveGame).
 * ok(null) when no save exists for that id; storage failures propagate.
 */
function mutateSave(
  id: string,
  mutator: (state: GameState) => GameState,
): Result<GameState | null> {
  const loaded = loadGame(id)
  if (!loaded.ok) return loaded
  if (loaded.value === null) return { ok: true, value: null }
  return saveGame(mutator(loaded.value))
}

/** Set a save's label (its display title). An empty/blank value clears it back to undefined. */
export function renameSave(id: string, label: string): Result<GameState | null> {
  const trimmed = label.trim()
  return mutateSave(id, (state) => ({ ...state, label: trimmed === '' ? undefined : trimmed }))
}

/** Update the manager name on a save. */
export function setManagerName(id: string, managerName: string): Result<GameState | null> {
  return mutateSave(id, (state) => ({ ...state, managerName: managerName.trim() }))
}

/** Toggle/set a save's favorite flag. */
export function setFavorite(id: string, favorite: boolean): Result<GameState | null> {
  return mutateSave(id, (state) => ({ ...state, favorite }))
}
