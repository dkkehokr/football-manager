# Future Improvements

A running list of things we've deliberately deferred, so we don't forget them.

## Agent / AI setup

- [ ] **Hooks** (`settings.json`) — automated behaviours we chose to add later, not up front.
      Add them to kill specific repetitive pains as they appear, e.g.:
  - Run Jest automatically after edits to the match engine.
  - Lint/format on save.
  - Guard against writing to `main`.
- [ ] **Lead / orchestrator agent** — a 7th agent that decomposes work and delegates to the
      others autonomously. Decided to first practice main-thread orchestration by hand, then
      add this as a deliberate next experiment.
- [ ] **Workflow script** (`Workflow` tool) — deterministic multi-agent orchestration
      (fan-out / pipeline with a verify stage) once the manual version is understood.
- [ ] **MCP servers** — external tools/data sources for the agents, if a need arises.

## Game

- [ ] Scope decisions still open (MVP depth, theme, tech/data choices) — to be planned.

---
Add to this file whenever we say "let's do that later".
