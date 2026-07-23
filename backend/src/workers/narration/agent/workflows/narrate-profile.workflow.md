---
id: narrate-profile
title: Narrate Yourself — profile README workflow
engine: langgraph
max_revisions: 2
---
The "Narrate Yourself" agent is a LangGraph state machine with three roles and a
bounded revise loop:

```
Planner (analyze) → Writer (draft) → Reviewer (review) ──(revise, ≤2)──▶ Writer
                                          └──────────(APPROVED)────────▶ END
```

- **analyze** — the Planner reads the working context and emits a plan.
  Phase: `analyzing`.
- **draft** — the Writer produces the README from the plan (plus any revision
  feedback). Phase: `drafting`.
- **review** — the Reviewer approves or returns fixes. Phase: `reviewing`.
- The loop returns to **draft** until the Reviewer replies `APPROVED` or
  `max_revisions` is reached, then ends.

State channels: `context`, `intent`, `plan`, `draft`, `critique`, `revisions`,
`approved`. Node names differ from channel names (LangGraph rule): the nodes are
`analyze` / `write` / `review`.

Implemented in `../../services/narration-agent.service.ts`; the role prompts are
assembled by `../../context/profile.prompts.ts` (via the shared
`src/workers/shared/agent/card-loader.ts`).
