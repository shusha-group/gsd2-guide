---
title: "Glossary"
description: "Definitions for GSD-specific terms used throughout the documentation."
---

A reference for terms used throughout the GSD documentation and tooling. If you encounter a term not listed here, it's likely standard software development vocabulary — GSD tries not to invent jargon unnecessarily.

---

**Auto mode** — GSD's fully automated execution mode. In auto mode, GSD dispatches tasks to subagents and runs an entire slice end-to-end without requiring manual approval at each step. Contrast with guided mode.

**Brief** — A short written description of what you want to build, used as input to the planning phase. A good brief covers the goal, constraints, and any known technical decisions.

**Brownfield** — A project that already has existing code. GSD works with brownfield projects from the first session — run `/gsd init` in the project directory and it reads what's there. Contrast with greenfield.

**Checkpoint** — A stable, verified state saved at task completion. If something goes wrong, GSD can roll back to the last checkpoint rather than leaving a half-applied change.

**Context engineering** — The practice of structuring information so AI agents can use it effectively across sessions. GSD's `.gsd/` directory is its context engineering layer — it persists decisions, plans, and summaries so every session starts fully informed.

**Decision** — A recorded architectural or implementation choice, stored in `.gsd/DECISIONS.md`. Decisions capture what was chosen, why, and by whom — so future sessions don't relitigate resolved questions.

**Executor** — The agent role responsible for implementing a task. In auto mode, the executor receives a task plan and produces code, tests, and a summary. Contrast with planner and scout.

**Gate** — A verification check that must pass before a task or slice is marked complete. Gates confirm that what was built matches what was planned, catching issues before they compound.

**Greenfield** — A new project with no existing code. GSD's planning phase is well suited to greenfield work — you define requirements, review a roadmap, and approve before any code is written.

**Guided mode** — GSD's interactive execution mode. In guided mode, you review and approve each step before it runs. Slower than auto mode, but gives you full visibility and control.

**Milestone** — The top-level planning unit in GSD. A milestone represents a significant deliverable — typically one to four weeks of work — broken down into slices. See [Architecture](../architecture/).

**Persona** — A user archetype used in GSD's documentation and planning. The three main personas are Solo Business Builder, Developer New to AI Coding, and Experienced AI Developer. See [Choose Your Path](../choose-your-path/).

**Planner** — The agent role responsible for decomposing work into milestones, slices, and tasks. The planner reads the brief and requirements, then produces a structured plan for the executor to follow.

**Proof level** — A label indicating how rigorously a slice's output was verified. Proof levels range from exploratory (light verification) to contract (full test coverage and gate checks). Defined per-slice in the roadmap.

**Quick mode** — A lightweight GSD mode for single-session tasks. Run with `/gsd quick` — gives you atomic commit, state tracking, and verification without the full planning overhead.

**Replan** — The process of revising a slice plan mid-execution when a blocker is discovered. GSD preserves completed tasks and replans only the remaining work.

**Requirement** — A documented project constraint or capability, stored in `.gsd/REQUIREMENTS.md`. Requirements are the source of truth that plans are measured against.

**Research** — The phase where a scout agent investigates the codebase before planning begins. Research produces a CONTEXT artifact that the planner uses to avoid incorrect assumptions.

**Roadmap** — The planned sequence of milestones for a project, rendered in `.gsd/ROADMAP.md`. The roadmap is a living document — it updates as milestones complete and the plan evolves.

**Scout** — The agent role responsible for researching the codebase before a planner writes a plan. The scout reads existing files and produces a context summary without making changes.

**Slice** — The mid-level planning unit in GSD. A slice is a coherent chunk of work within a milestone — typically one to three days — broken into tasks. Slices are the unit of git branching and verification.

**Solo builder** — A persona for someone building a product independently, often without a professional software background. The Solo Builder path in the documentation is designed for this person.

**Task** — The smallest execution unit in GSD. A task is a concrete, bounded piece of work — typically two to four hours — with a clear verification check. Tasks are executed by the executor agent.

**UAT** — User Acceptance Testing. In GSD, a UAT document is generated at slice completion and describes what was built and how to manually verify it works as intended.

**Verification** — The process of confirming that what was built matches what was planned. Verification in GSD happens at the task level (gate checks), slice level (UAT), and milestone level (success criteria).
