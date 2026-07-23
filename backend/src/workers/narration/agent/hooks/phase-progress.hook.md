---
id: phase-progress
title: Phase progress hook
signature: onPhase(phase: string) => Promise<void>
implemented_by: workers/narration/services/narration-runner.service.ts
---
A lifecycle hook the workflow calls as it enters each node (`gathering` →
`analyzing` → `drafting` → `reviewing` → `completed`). The runner writes the
phase to the generation row's `phase` column, which the frontend polls to drive
the progress timeline. Purely observational — it never alters the agent's output.
