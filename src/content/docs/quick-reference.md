---
title: "Quick Reference"
description: "The 15 most-used GSD commands — what they do and when to reach for them."
---

Not sure which command to use? This page covers the commands you'll reach for in 90% of sessions. For the full list, see the [Commands Reference](../commands/).

---

## Start a session

### `/gsd`
Step mode. GSD executes one unit at a time and pauses for your review between each step. Good when you want to stay close to what's happening.

```
/gsd
```

### `/gsd auto`
Autonomous mode. GSD researches, plans, executes, and commits — repeating until the milestone is done or you intervene. The workhorse command for sustained builds.

```
/gsd auto
```

### `/gsd quick`
Run a quick task with full GSD guarantees (atomic commit, state tracking) without going through the full planning overhead. Perfect for small fixes and one-off changes.

```
/gsd quick fix the login redirect
```

---

## Plan and discuss

### `/gsd discuss`
Open a structured architecture conversation. Use this to think through a new milestone or a tricky design decision before committing to a plan.

```
/gsd discuss
```

### `/gsd new-milestone`
Create a new milestone. Runs the discussion and planning sequence to produce a roadmap before any code is written.

```
/gsd new-milestone
```

### `/gsd queue`
View and reorder upcoming milestones. Safe to run during auto mode — it won't interrupt a running session.

```
/gsd queue
```

---

## Execute and monitor

### `/gsd status`
Progress dashboard. Shows the current milestone, completed slices, running tasks, and cost so far.

```
/gsd status
```

### `/gsd steer`
Hard-steer the plan mid-execution. Use this when auto mode is heading in the wrong direction and you need to correct course without stopping.

```
/gsd steer
```

### `/gsd stop`
Stop auto mode gracefully. The current task finishes cleanly before GSD halts.

```
/gsd stop
```

### `/gsd visualize`
Open the workflow visualizer — an interactive view of progress, dependencies, metrics, and timeline.

```
/gsd visualize
```

---

## Capture and manage

### `/gsd capture`
Fire-and-forget thought capture. Use this mid-session to log an idea or concern without interrupting auto mode. GSD queues it for triage later.

```
/gsd capture add a loading state to the dashboard
```

### `/gsd triage`
Review pending captures and decide what to do with each one — promote to milestone, dismiss, or defer.

```
/gsd triage
```

### `/gsd knowledge`
Add a persistent project rule, pattern, or lesson that future GSD sessions will load automatically.

```
/gsd knowledge always use the existing auth middleware pattern
```

---

## Recover and debug

### `/gsd forensics`
Full-access debugger. Use when auto mode fails in a way you can't explain — structured anomaly detection, unit traces, and LLM-guided root-cause analysis.

```
/gsd forensics
```

### `/gsd doctor`
Runtime health checks with auto-fix. Run this if something feels wrong with your GSD setup — it surfaces issues across widget, visualizer, and reports.

```
/gsd doctor
```

---

## Workflow phases at a glance

| Phase | Reach for |
|-------|-----------|
| Starting work | `/gsd auto`, `/gsd`, `/gsd quick` |
| Planning | `/gsd discuss`, `/gsd new-milestone`, `/gsd queue` |
| Executing | `/gsd status`, `/gsd steer`, `/gsd stop` |
| Monitoring | `/gsd status`, `/gsd visualize` |
| Capturing ideas | `/gsd capture`, `/gsd triage` |
| Managing knowledge | `/gsd knowledge` |
| Debugging | `/gsd forensics`, `/gsd doctor` |

---

*New to GSD? Start with [Is GSD Right for Me?](../is-gsd-right-for-me/) to assess fit, then [Installation](../getting-started/) to get set up.*

## Next Steps

- [Solo Guide](../solo-guide/) — guided walkthrough for solo builders, from install to first completed milestone
- [Auto Mode](../auto-mode/) — deep dive into how autonomous execution works
- [Is GSD Right for Me?](../is-gsd-right-for-me/) — honest assessment of when GSD adds value

:::tip[New to GSD?]
The [Solo Guide](../solo-guide/) is the best place to start if you've just installed GSD — it walks you through the full workflow with practical examples rather than reference documentation.
:::
