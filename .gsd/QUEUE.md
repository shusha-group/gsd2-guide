# Milestone Queue

## Queued

### M002: GSD User Documentation Overhaul

**Queued:** 2026-03-17

**Problem:** The documentation site is heavily weighted toward Pi internals (What Is Pi, Extending Pi, Pi UI/TUI, Building Coding Agents — 90+ pages) while the actual GSD user workflow has thin coverage. Commands get a one-line description but no explanation of what they do mechanically. There's no end-to-end guide showing someone building a real project. Users can't tell how `/gsd quick`, `/gsd capture`, or `/gsd steer` actually work.

**Scope:**
- End-to-end walkthrough guide — building a project from first command to deployed software, showing what every step produces on disk
- Quick task and fix workflow guide — the smaller change workflows with real examples
- Command deep-dives — expand each `/gsd` command with mechanics, file artifacts, what the agent sees, and practical examples
- Rebalance site navigation — GSD user docs should be prominent; Pi internals clearly separated as a developer/contributor section

**Success criteria:**
- A new user can follow the walkthrough and understand the full GSD lifecycle
- Every `/gsd` subcommand has documentation explaining what it does, what it creates, and when to use it
- The sidebar clearly separates "using GSD" from "building on Pi"
