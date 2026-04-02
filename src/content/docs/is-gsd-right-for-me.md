---
title: "Is GSD Right for Me?"
description: "Assess whether GSD fits your project and working style, then find the learning path that matches your background."
---

GSD is a structured execution layer for Claude Code. It works brilliantly in some situations and adds unnecessary overhead in others. This page helps you figure out which applies to you — and if GSD is the right fit, routes you to the fastest learning path for your background.

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

## Where are you coming from?

Even if GSD is the right tool, the fastest path to productive depends on your background. Find the description that best fits you.

---

### Coming from a no-code or low-code platform

You've been building with Replit, Lovable, Bolt, or a similar tool and you're hitting the limits of what they can do. You want more control and the ability to build production-grade software, but you're not a professional developer.

**What you'll find in GSD:** a structured way to work with Claude Code that keeps you in the director's seat without requiring deep software engineering knowledge. GSD handles the context management, task tracking, and verification that makes multi-session AI development coherent.

**What to expect:** GSD has a learning curve. The first session involves more upfront work than clicking "generate" on a visual builder — you write requirements, review a plan, and approve before code is written. By session two or three, the investment pays off in coherent, reviewable output.

→ **Your path:** [Choose Your Path → Path 1: Solo Business Builder](../choose-your-path/#path-1--solo-business-builder)

---

### New to AI-assisted coding tools

You're an experienced developer who understands software structure, but you're relatively new to AI coding assistants. You've tried Claude Code or similar tools but haven't settled on a workflow that scales beyond small tasks.

**What you'll find in GSD:** a disciplined execution layer that turns free-form AI prompting into a repeatable, auditable development process. Milestones, slices, tasks, and verification gates map naturally onto how professional projects are already structured.

**What to expect:** GSD will feel familiar in structure but different in practice. The main adjustment is learning to direct the AI at the planning level rather than the implementation level. The architecture docs are worth reading before you dive in.

→ **Your path:** [Choose Your Path → Path 2: Developer New to AI Coding](../choose-your-path/#path-2--developer-new-to-ai-coding)

---

### Already using Claude Code or similar AI tools

You're comfortable with AI coding assistants and have shipped real projects with them. You're looking for the structural layer that makes AI development production-grade: reproducible context, verification gates, structured planning, and clean git history.

**What you'll find in GSD:** exactly that layer. Auto mode, the GSD directory, extensions, dynamic model routing, and parallel orchestration are designed for developers who already know what they're doing with AI and want more leverage.

**What to expect:** the learning curve is mostly configuration and understanding the data model. The architecture and auto-mode docs are the most efficient entry points.

→ **Your path:** [Choose Your Path → Path 3: Experienced AI Developer](../choose-your-path/#path-3--experienced-ai-developer)

---

## The honest trade-off

GSD adds structure, and structure has a cost. The first session with a new project involves more upfront work than a free-form prompt. You write requirements, review a roadmap, and approve a plan before code is written.

In exchange, sessions two through ten are dramatically more coherent. The AI knows what you've already built, what decisions you've made, and what the current task is — without you re-explaining it every time.

If your project has more than one or two sessions in it, that trade is worth making.

---

## Still not sure?

Try `/gsd quick` on a small task first. It gives you GSD's guarantees (atomic commit, state tracking) without the full planning overhead. If that experience feels right, the full workflow is a natural next step.

→ [Choose Your Path](../choose-your-path/) — pick the reading path that matches your background  
→ [Quick Reference](../quick-reference/) — the 15 commands you'll use most  
→ [Getting Started](../getting-started/) — get set up in about five minutes

:::tip[Ready to try it?]
The [Solo Guide](../solo-guide/) gets you from zero to a completed milestone in under an hour. If you want to check the command surface first, [Getting Started](../getting-started/) covers installation and your first session.
:::
