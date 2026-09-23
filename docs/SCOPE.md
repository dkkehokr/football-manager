# Scope

A React football (soccer) manager game, built with a team of Claude Code subagents. The
underlying goal is learning an advanced multi-agent AI/orchestration setup — the game is the
vehicle for that, not the end in itself.

## Decided

- **App**: React + TypeScript.
- **Build tool + data**: Vite, client-only, saves in localStorage. No backend.
- **Theme**: Soccer (association football), real-ish — real-sounding leagues/teams seeded by
  hand, no official licensed data.
- **Build flow**: Main-thread orchestration — the main session coordinates and delegates to
  subagents.
- **Styling**: Tailwind CSS.

## First milestone — walking skeleton

Before any game logic, get a runnable app on screen:

- Scaffold a Vite + React + TypeScript app.
- Add Tailwind CSS.
- A **title screen** only (game name, a "New Game" button that doesn't need to do anything yet).
- Runs locally with a single dev command.

Goal: something that builds, runs, and looks intentional — a foundation to grow into.

## Open questions

### Simulation depth (beyond the skeleton) — UNDECIDED
Deferred until the skeleton runs. The eventual target:
- **Minimal MVP** — pick a squad, sim matches, league table. No transfers/finances/training.
- **Core manager** — + lineup/tactics, transfers, player development over a season.
- **Full sim** — + finances, contracts, morale, injuries, youth academy, multiple seasons.
