# Decisions

An append-only decision log (ADR-lite). Newest entries at the bottom. Each entry records what we
decided, the context, the options we weighed, the choice, and why — so we don't relitigate settled
calls or forget the reasoning.

Format:
> **Date** — Decision
> **Context**: why this came up.
> **Options considered**: what we weighed.
> **Choice**: what we picked.
> **Why**: the reasoning.

---

**2026-09-23** — Subagents are project-scoped, not global
**Context**: We need a team of Claude Code subagents to build the game.
**Options considered**: Project-scoped (committed in the repo's `.claude/agents/`) vs global
(`~/.claude/agents/`, shared across all projects).
**Choice**: Project-scoped.
**Why**: The agents are versioned and travel with the game repo; they're specific to this project.

---

**2026-09-23** — Six-agent roster adopted
**Context**: Deciding how many specialised agents to stand up.
**Options considered**: A lean 3-agent set (match engine, docs, infra) with architecture, UI, and
tests handled in the main thread; vs the full six.
**Choice**: Six — `game-architect`, `match-engine-dev`, `react-ui-dev`, `test-writer`,
`docs-writer`, `infra-deploy`.
**Why**: The point of the project is to learn advanced agent orchestration, so a fuller roster is
justified. For a pure React-learning project, three would have been the right call.

---

**2026-09-23** — Per-agent tool restrictions and model tiers
**Context**: How to configure each agent, and how to keep costs and blast radius sensible.
**Options considered**: One model and full tools for everyone, vs tailored tools/models per role.
**Choice**: Tailored. Models: `opus` for `game-architect` and `match-engine-dev` (reasoning-heavy),
`sonnet` for `react-ui-dev` / `test-writer` / `infra-deploy`, `haiku` for `docs-writer`.
`game-architect` and `docs-writer` have no `Bash` and so can't run or deploy anything.
**Why**: Tool restrictions are the real guardrails, and model tiers map cost to job difficulty.

---

**2026-09-23** — Hooks deferred
**Context**: Considered wiring up `settings.json` hooks (auto-test on engine edits, lint, guard
`main`) as part of the initial setup.
**Options considered**: Set up hooks now vs add them later.
**Choice**: Defer — tracked in `FUTURE_IMPROVEMENTS.md`.
**Why**: Hooks are best added reactively to kill a specific repeated pain, rather than guessed up
front, and they can be added any time with no rework to the agents.

---

**2026-09-23** — Main-thread orchestration first, lead agent later
**Context**: Choosing how work is coordinated across the agents.
**Options considered**: Main-thread orchestration (the main session delegates) vs a dedicated
lead/orchestrator agent that decomposes and delegates autonomously.
**Choice**: Start with main-thread orchestration; add a lead agent later as a deliberate experiment.
**Why**: See routing and hand-off decisions by hand before automating them — better for learning,
and the reasoning stays visible instead of happening inside another agent's context.

---

**2026-09-23** — Plan before build
**Context**: Multiple agents will soon be touching the repo.
**Options considered**: Jump straight into building vs agree a plan first.
**Choice**: Agree a plan before touching files.
**Why**: With several agents involved, an agreed plan keeps the work coherent and reviewable.

---

**2026-09-23** — Theme: soccer, real-ish
**Context**: Choosing the sport and whether teams/players are real or fictional.
**Options considered**: Soccer vs American football; fictional vs real-ish (hand-seeded) vs
licensed data.
**Choice**: Soccer, real-ish — real-sounding leagues/teams seeded by hand, no official licensed data.
**Why**: Familiar and motivating to build, without the legal/data burden of licensed content.

---

**2026-09-23** — Tech: Vite + React + TypeScript, local-only
**Context**: How to build the app and where game data/saves live.
**Options considered**: Vite + React client-only (localStorage); client-first but backend-ready;
Next.js full-stack with a database.
**Choice**: Vite + React + TypeScript, client-only, saves in localStorage. No backend.
**Why**: Fastest to build and run, no infrastructure to reason about, ideal for a learning project.
A backend can be added later if the game outgrows local-only.

---

**2026-09-23** — Build flow: main-thread orchestration
**Context**: Confirming how work is coordinated across agents (previously leaning this way).
**Options considered**: Main-thread orchestration vs a dedicated lead/orchestrator agent.
**Choice**: Main-thread orchestration.
**Why**: The main session delegates and every routing decision stays visible — best for learning
the workflow before automating it. A lead agent remains a later experiment (FUTURE_IMPROVEMENTS.md).

---

**2026-09-23** — Start with a walking skeleton, defer game depth
**Context**: Where to begin building.
**Options considered**: Design the full data model and sim depth up front vs get a runnable app
on screen first.
**Choice**: First milestone is a walking skeleton — Vite + React + TS scaffold, a styling
framework, and a title screen that runs locally. Simulation depth is deferred until it runs.
**Why**: A runnable foundation de-risks tooling early and gives every later feature somewhere to
live. Committing to sim depth before anything runs would be premature.

---

**2026-09-23** — Styling: Tailwind CSS
**Context**: Choosing a styling framework to add during the scaffold.
**Options considered**: Tailwind CSS (utility-first); Mantine (React component library); CSS
Modules (built-in, plain scoped CSS).
**Choice**: Tailwind CSS.
**Why**: Fast to iterate, fully cross-browser, and a large ecosystem. No prebuilt components means
we style the custom manager UI ourselves — good for learning and flexible for a bespoke game look.
