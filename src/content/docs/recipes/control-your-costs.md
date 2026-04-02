---
title: "Control Your Costs"
description: "Set budgets, pick a token profile, enable dynamic routing, and understand what drives spend — everything you need to keep GSD costs predictable."
---

> **See also:** [Solo Guide §6 — Controlling Costs](../solo-guide/controlling-costs/) for the strategic framing: flat-rate vs pay-per-use, what drives the bill, and typical cost patterns.

---

## Setting Budgets & Tracking Costs

### Budget Ceiling

Set a maximum cumulative spend for a project in your preferences:

```yaml
---
version: 1
budget_ceiling: 50.00
budget_enforcement: pause
---
```

Three enforcement modes are available:

| Mode | Behaviour |
|------|-----------|
| `warn` | Log a warning, continue executing |
| `pause` | Pause auto mode, wait for user action (recommended) |
| `halt` | Stop auto mode entirely |

`pause` is the right default — it gives you visibility at the moment the ceiling is hit and lets you decide whether to increase it, switch to a cheaper token profile, or stop.

### Viewing Costs

**Dashboard:** `Ctrl+Alt+G` or `/gsd status` shows real-time cost breakdown.

**Export:** `/gsd export` generates a full retrospective with cost by phase, slice, and model.

Aggregations available in the dashboard:
- By phase (research, planning, execution, completion, reassessment)
- By slice (M001/S01, M001/S02, …)
- By model (which models consumed the most budget)
- Project totals

All metrics are stored in `.gsd/metrics.json` and survive across sessions. Every unit's input tokens, output tokens, cache read/write, cost, duration, and tool call count are captured automatically.

### Cost Projections

Once at least two slices have completed, GSD projects remaining cost:

```
Projected remaining: $12.40 ($6.20/slice avg × 2 remaining)
```

If the budget ceiling has been reached, a warning is appended to the projection.

---

## Token Optimisation Strategies

The `token_profile` preference coordinates model selection, phase skipping, and context compression in one setting. Set it per-project via `/gsd prefs project`:

```yaml
---
version: 1
token_profile: balanced
---
```

### The Three Profiles

**`budget` — Maximum Savings (40–60% reduction)**

Use when the work is well-understood and mostly mechanical. Cheaper models, skipped optional phases, compressed context.

| Dimension | Setting |
|-----------|---------|
| Planning model | Sonnet |
| Execution model | Sonnet |
| Simple task model | Haiku |
| Completion model | Haiku |
| Milestone research | **Skipped** |
| Slice research | **Skipped** |
| Roadmap reassessment | **Skipped** |
| Context inline level | **Minimal** |

Best for: prototyping, small projects, well-understood codebases, documentation runs.

**`balanced` — Smart Defaults (default)**

The right choice for most active development. Keeps important phases, skips ones with diminishing returns, uses standard context compression.

| Dimension | Setting |
|-----------|---------|
| Planning model | User's default |
| Execution model | User's default |
| Completion model | User's default |
| Slice research | **Skipped** |
| Roadmap reassessment | Runs |
| Context inline level | **Standard** |

Best for: most projects and day-to-day development.

**`quality` — Full Context (no compression)**

Every phase runs. Every context artefact is inlined. No shortcuts. Use for architectural decisions, greenfield projects, and critical production work where getting it right first time is worth the cost premium.

### Context Compression

Each profile maps to an inline level that controls what gets pre-loaded into dispatch prompts:

| Profile | Inline Level | What's Included |
|---------|-------------|-----------------|
| `budget` | `minimal` | Task plan, essential prior summaries (truncated). Drops decisions register, requirements, UAT template. |
| `balanced` | `standard` | Task plan, prior summaries, slice plan, roadmap excerpt. Drops some supplementary templates. |
| `quality` | `full` | Everything — all plans, summaries, decisions, requirements, templates, and root files. |

At `budget` and `balanced` levels, GSD also applies deterministic prompt compression (heuristic text compression, deduplication, and low-information boilerplate removal) before falling back to section-boundary truncation. The `budget` profile additionally uses TF-IDF semantic chunking for large files (> 3 KB) to include only the relevant portions.

### Per-Phase Overrides

Explicit `phases` preferences always override profile defaults:

```yaml
---
version: 1
token_profile: budget
phases:
  skip_research: false    # override: run research even on budget profile
models:
  planning: claude-opus-4-6  # override: use Opus for planning despite budget profile
---
```

---

## Dynamic Model Routing

Dynamic routing automatically selects cheaper models for simple work and reserves expensive models for complex tasks. This can reduce token consumption by 20–50% on capped plans.

### Enabling

Dynamic routing is off by default. Enable it in preferences:

```yaml
---
version: 1
dynamic_routing:
  enabled: true
---
```

### Configuration

```yaml
dynamic_routing:
  enabled: true
  tier_models:                    # explicit model per tier (optional)
    light: claude-haiku-4-5
    standard: claude-sonnet-4-6
    heavy: claude-opus-4-6
  escalate_on_failure: true       # bump tier on task failure (default: true)
  budget_pressure: true           # auto-downgrade near budget ceiling (default: true)
  cross_provider: true            # consider models from other providers (default: true)
  hooks: true                     # apply routing to post-unit hooks (default: true)
```

When `tier_models` is omitted, the router uses a built-in capability mapping:
- **Light:** `claude-haiku-4-5`, `gpt-4o-mini`, `gemini-2.0-flash`
- **Standard:** `claude-sonnet-4-6`, `gpt-4o`, `gemini-2.5-pro`
- **Heavy:** `claude-opus-4-6`, `gpt-4.5-preview`, `gemini-2.5-pro`

### How Classification Works

Units are classified by pure heuristics — no LLM calls, sub-millisecond:

| Signal | Simple → Light | Complex → Heavy |
|--------|---------------|----------------|
| Step count | ≤ 3 | ≥ 8 |
| File count | ≤ 3 | ≥ 8 |
| Description length | < 500 chars | > 2000 chars |
| Code blocks | — | ≥ 5 |
| Complexity keywords | None | Present |

**Complexity keywords:** `research`, `investigate`, `refactor`, `migrate`, `integrate`, `complex`, `architect`, `redesign`, `security`, `performance`, `concurrent`, `parallel`, `distributed`, `backward compat`

Non-task units have built-in tier assignments:

| Unit Type | Default Tier |
|-----------|-------------|
| `complete-slice`, `run-uat` | Light |
| `research-*`, `plan-*`, `complete-milestone` | Standard |
| `execute-task` | Standard (upgraded by task analysis) |
| `replan-slice`, `reassess-roadmap` | Heavy |
| `hook/*` | Light |

### `escalate_on_failure`

When a task fails at a given tier, the router escalates on retry: Light → Standard → Heavy. This prevents cheap models from burning retries on work that needs more reasoning.

### Interaction with Token Profiles

Token profiles and dynamic routing are complementary — profiles set the baseline models, routing further optimises within those baselines. A `budget` profile + dynamic routing provides maximum cost reduction. A `quality` profile + dynamic routing still routes within quality-tier models — the profile is the ceiling, not overridden by the router.

---

## Monitoring & Alerts

### Budget Pressure Behaviour

When approaching the budget ceiling, the complexity router automatically downgrades model assignments before you hit the wall:

| Budget Used | Effect |
|------------|--------|
| < 50% | No adjustment |
| 50–75% | Standard → Light |
| 75–90% | More aggressive downgrading |
| > 90% | Nearly everything → Light; only Heavy stays at Standard |

This graduated response spreads the budget across remaining work rather than exhausting it early on complex tasks.

### Context Pause Threshold

Add a second safety valve — if context window usage for a single task exceeds a threshold, auto mode pauses before dispatch:

```yaml
---
version: 1
context_pause_threshold: 80   # pause if context exceeds 80% of window
---
```

Useful for catching unexpectedly large tasks before they burn significant tokens.

### Adaptive Learning (Routing History)

GSD tracks the success and failure of each tier assignment and adjusts future classifications. This is automatic and persists in `.gsd/routing-history.json`.

If a tier's failure rate exceeds 20% for a given pattern, future classifications for that pattern are bumped up one tier. Use `/gsd rate` to submit manual feedback:

```
/gsd rate over    # model was overpowered — encourage cheaper next time
/gsd rate ok      # model was appropriate — no adjustment
/gsd rate under   # model was too weak — encourage stronger next time
```

Feedback signals are weighted 2× compared to automatic outcomes. Requires dynamic routing to be active.

### Cache Hit Rate

The metrics ledger tracks `cacheHitRate` per unit (percentage of input tokens served from cache) and provides an aggregate cache hit rate for the session. Check it via `/gsd status` → Metrics tab.

---

## Configuration Examples

### Cost-Optimised Setup

```yaml
---
version: 1
token_profile: budget
budget_ceiling: 25.00
dynamic_routing:
  enabled: true
models:
  execution_simple: claude-haiku-4-5-20250414
---
```

### Balanced with Custom Models

```yaml
---
version: 1
token_profile: balanced
dynamic_routing:
  enabled: true
models:
  planning:
    model: claude-opus-4-6
    fallbacks:
      - openrouter/z-ai/glm-5
  execution: claude-sonnet-4-6
---
```

### Full Quality for Critical Work

```yaml
---
version: 1
token_profile: quality
models:
  planning: claude-opus-4-6
  execution: claude-opus-4-6
---
```

---

## Quick Tips

- Start with `balanced` and a generous `budget_ceiling` to establish baseline costs
- Check `/gsd status` after a few slices to see per-slice cost averages
- Switch to `budget` for well-understood, repetitive, or documentation work
- Use `quality` only when architectural decisions are being made
- Enable `dynamic_routing` for automatic model downgrading on simple tasks
- Use `/gsd visualize` → Metrics tab to see where your budget is going
- Run `/gsd export` after a milestone for a full cost breakdown by phase and slice
