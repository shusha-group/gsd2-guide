---
title: "Is GSD Right for Me?"
description: "Assess whether GSD fits your project and working style in about 30 seconds."
---

GSD is a structured execution layer for Claude Code. It works brilliantly in some situations and adds unnecessary overhead in others. This page helps you figure out which applies to you.

---

## GSD is built for this

**Sustained multi-session projects.** If you're working on something that takes days or weeks — not hours — GSD pays for itself quickly. It maintains coherent context across sessions so the AI isn't starting from scratch each time.

**Solo builders who want to stay in control.** GSD puts you in the role of technical director: you set the requirements and architectural constraints, the AI executes, you review. If you want visibility and the ability to intervene, GSD is designed for exactly that.

**Brownfield codebases.** Bringing structure to an existing project without disrupting work in progress is one of GSD's strengths. You can introduce it incrementally, milestone by milestone.

**Projects where correctness matters more than speed.** The planning and verification overhead pays off when rework is expensive. If getting it right the first time matters, the upfront investment in a structured plan is worth it.

**Anything where context continuity matters.** GSD writes structured summaries after each task and loads only what's relevant for the next one. Sessions can be interrupted and resumed without losing coherence.

---

## GSD is not built for this

**Quick one-off scripts.** If you need a 20-line utility script by end of day, skip GSD. The planning overhead isn't worth it. Use `/gsd quick` or just prompt Claude Code directly.

**Pure vibe coding and exploration.** If you're in discovery mode — throwing ideas at the wall to see what sticks — the structure GSD imposes will feel like friction. GSD is for building, not exploring.

**Team workflows (without adaptation).** GSD's defaults are optimised for solo developers. Teams can use it, but milestone IDs, commit behaviour, and hand-off patterns need deliberate configuration via `/gsd mode`.

**Projects where you don't want to review.** GSD pauses for verification and expects you to read what it's built. If you want to click "go" and walk away, GSD will frustrate you.

---

## Quick assessment

Answer these four questions:

| Question | Yes → | No → |
|----------|-------|------|
| Will this take more than a day to build? | GSD adds real value | Consider `/gsd quick` or plain Claude Code |
| Do you need the work to survive a session restart? | GSD handles this | Not a factor |
| Do you want to stay close to architectural decisions? | GSD is designed for this | GSD may feel like overhead |
| Is correctness more important than raw speed? | GSD's verification gates help | Plain Claude Code may be faster |

If you answered **Yes** to at least two of these, GSD is likely worth setting up.

---

## The honest trade-off

GSD adds structure, and structure has a cost. The first session with a new project involves more upfront work than a free-form prompt. You write requirements, review a roadmap, and approve a plan before code is written.

In exchange, sessions two through ten are dramatically more coherent. The AI knows what you've already built, what decisions you've made, and what the current task is — without you re-explaining it every time.

If your project has more than one or two sessions in it, that trade is worth making.

---

## Still not sure?

Try `/gsd quick` on a small task first. It gives you GSD's guarantees (atomic commit, state tracking) without the full planning overhead. If that experience feels right, the full workflow is a natural next step.

→ [Quick Reference](../quick-reference/) — the 15 commands you'll use most  
→ [Installation](../getting-started/) — get set up in about five minutes  
→ [Why GSD 2](../solo-guide/why-gsd/) — the longer argument for why structure beats prompting
