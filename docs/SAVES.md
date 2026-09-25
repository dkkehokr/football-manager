# Game state & saves

Design note for issue #3. Covers the persisted game-state shape, the localStorage schema, and
the persistence contract. This is the boundary the engine and UI build against.

## Module structure

The game domain lives under `src/game/`, framework-free (no React/DOM-framework imports), so the
same code can back the future simulation engine.

- `src/game/state.ts` — data model: `GameState`, `SaveSummary`, `NewGameInput`, `GameWorld`,
  `GAME_STATE_VERSION`.
- `src/game/persistence/storage.ts` — pure, guarded localStorage read/write with JSON
  (de)serialization; exposes the `Result<T>` type.
- `src/game/persistence/saveStore.ts` — the save API (create/save/load/list/delete).
- Barrels: `src/game/persistence/index.ts`, `src/game/index.ts`. Import from `@/game` equivalent
  (relative `../game`).

## State shape

`GameState` is the persisted seed:

- `version` — schema version (`GAME_STATE_VERSION`, currently `1`) for future migrations.
- `id` — stable identity, the localStorage key (a UUID, **not** the manager name).
- `managerName` — user input; doubles as the save's display label for now.
- `createdAt` / `updatedAt` — epoch millis.
- `world` — the single, well-named growth point for gameplay (squad, league, fixtures, tactics).
  Empty for the seed, typed `Record<string, never>`.

## localStorage schema & key strategy

Namespace prefix `matchday.`. **Index + one entry per save** (not a single saves map):

- `matchday.saves.index` -> `SaveSummary[]` — lightweight list for a save-picker UI.
- `matchday.save.<id>` -> `GameState` — one full save per key.

Why this shape:

- **Keyed by stable `id`, not manager name** — names collide and can be renamed; the id is the
  identity.
- **Index + per-entry over a single map** — rendering a save list reads one small key without
  deserializing every full `GameState` (which grows large once squads/fixtures land), and writing
  one save doesn't rewrite all others. Scales cleanly to multiple saves even though the initial UI
  only creates one.

## Versioning / migrations

Every save carries `version`. When the shape changes, bump `GAME_STATE_VERSION` and migrate on
`loadGame` (read version, upgrade forward, re-save). No migration code needed yet at v1.

## Failure handling

All I/O returns `Result<T>` (`{ ok: true, value } | { ok: false, error }`). `StorageFailure.kind`
is `unavailable` (no/blocked localStorage), `corrupt` (unparseable JSON), or `write-failed` (quota
or disabled). Callers must handle the `!ok` branch and surface a message; nothing throws.

## Status

- Implemented: `createGameState`, `saveGame`, `startNewGame`, `listSaves`, `loadGame`, `deleteGame`.
- `loadGame` / `listSaves` / `deleteGame` were trivial given the storage helper, so they ship now
  but are not yet wired to any UI — those flows (load/continue, delete) are follow-ups.
