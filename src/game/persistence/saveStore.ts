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
    createdAt: now,
    updatedAt: now,
    world: {},
  }
}

/** List all save summaries from the index, treating a missing index as empty. */
export function listSaves(): Result<SaveSummary[]> {
  const result = readJson<SaveSummary[]>(INDEX_KEY)
  if (!result.ok) return result
  return { ok: true, value: result.value ?? [] }
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

/** Load a full save by id. ok(null) when no save exists for that id. */
export function loadGame(id: string): Result<GameState | null> {
  return readJson<GameState>(saveKey(id))
}

/** Delete a save's entry and remove it from the index. */
export function deleteGame(id: string): Result<void> {
  const removed = removeKey(saveKey(id))
  if (!removed.ok) return removed
  const listed = listSaves()
  if (!listed.ok) return listed
  return writeJson(INDEX_KEY, listed.value.filter((s) => s.id !== id))
}
