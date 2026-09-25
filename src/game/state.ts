export const GAME_STATE_VERSION = 1

// The single, well-named place gameplay state grows into (squad, league, fixtures,
// tactics, finances...). Kept empty on purpose for the seed; typing it as
// Record<string, never> makes "no gameplay yet" explicit and flags accidental writes
// until real slices are added.
export type GameWorld = Record<string, never>

export interface GameState {
  version: number
  id: string
  managerName: string
  /** Optional player-chosen save title. When unset, the manager name is shown instead. */
  label?: string
  favorite: boolean
  createdAt: number
  updatedAt: number
  world: GameWorld
}

export interface SaveSummary {
  id: string
  managerName: string
  label?: string
  favorite: boolean
  createdAt: number
  updatedAt: number
  version: number
}

export interface NewGameInput {
  managerName: string
}
