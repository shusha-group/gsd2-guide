---
estimated_steps: 8
estimated_files: 8
---

# T01: Author planning and queue command deep-dives

**Slice:** S03 — Command deep-dives — planning, maintenance, and utility commands
**Milestone:** M002

## Description

Create 6 MDX deep-dive pages for the "during execution" planning commands: `/gsd queue`, `/gsd steer`, `/gsd capture`, `/gsd triage`, `/gsd knowledge`, and `/gsd cleanup`. These are the commands users invoke while auto-mode is running (or between runs) to steer, capture thoughts, and maintain state.

Each page follows the established S02 template exactly:
1. Frontmatter (`title`, `description`)
2. **What It Does** — 2-3 paragraph explanation
3. **Usage** — command syntax with examples
4. **How It Works** — Mermaid diagram (for queue, steer, triage) or prose subsections (for simpler commands). Internal mechanics, not surface description.
5. **What Files It Touches** — Creates/Reads/Writes tables
6. **Examples** — Annotated terminal output using Cookmate as example project
7. **Related Commands** — Cross-links to related command pages using `../sibling/` format

After creating the pages, add 6 sidebar entries to `astro.config.mjs` and link all 6 commands in the commands landing page.

## Steps

1. **Study source handlers.** Read the relevant sections of the GSD source to understand each command's internals:
   - `queue`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/guided-flow.ts` — `showQueue()` at line 296
   - `steer`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 1803
   - `capture`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/captures.ts` — `appendCapture()`
   - `triage`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 1749
   - `knowledge`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 1678
   - `cleanup`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 1601 (branches) and line 1642 (snapshots)

2. **Create `src/content/docs/commands/queue.mdx`** — Queue hub: reorder pending milestones (drag reorder → QUEUE-ORDER.json, remove conflicting depends_on), add new milestone via LLM discussion. Reads `deriveState()` for registry. Needs Mermaid diagram showing the queue hub flow (list → reorder/add → save).

3. **Create `src/content/docs/commands/steer.mdx`** — Appends override to OVERRIDES.md with scope (M/S/T). If auto-mode active: sends `gsd-hard-steer` message to trigger document rewrite. If inactive: tells agent to update plans manually. Needs Mermaid diagram showing the active vs inactive path.

4. **Create `src/content/docs/commands/capture.mdx`** — Simple append to CAPTURES.md. Worktree-aware path resolution. Classifications: quick-task, inject, defer, replan, note. Prose + tables sufficient (no Mermaid needed).

5. **Create `src/content/docs/commands/triage.mdx`** — Loads pending captures, builds context, dispatches `triage-captures` prompt to LLM. Needs Mermaid diagram showing the triage pipeline (load captures → build context → LLM classification → apply actions).

6. **Create `src/content/docs/commands/knowledge.mdx`** — Takes type (rule/pattern/lesson) + text, appends to KNOWLEDGE.md. Scope derived from active milestone/slice. Simple command — prose + tables.

7. **Create `src/content/docs/commands/cleanup.mdx`** — Two sub-commands: `branches` (finds gsd/* branches merged into main, deletes them) and `snapshots` (prunes old refs/gsd/snapshots/ keeping last 5 per label). Bare `cleanup` runs both. Prose + tables sufficient.

8. **Wire sidebar and landing page.** Add 6 sidebar entries to `astro.config.mjs` after the existing S02 entries in the Commands section. Add deep-dive links to the 6 commands in `content/generated/docs/commands.md` (change plain text `| \`/gsd queue\`` to `| [\`/gsd queue\`](queue/)`).

### Mermaid Styling Convention

All Mermaid diagrams MUST use this exact node styling:
- Start/end nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Decision nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Action nodes: `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`
- Error/unreachable nodes: `fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8`

### Cross-link Format

Links between command pages use relative `../sibling/` format:
```markdown
[`/gsd capture`](../capture/)
```

### Example Terminal Output Style

Use the S02 convention — bullet points with `●` prefix, checkmarks with `✓`, indented sub-items:
```
> /gsd capture "consider adding rate limiting to the API"

● Capture saved
  Type: note
  Added to .gsd/CAPTURES.md
  Triage pending — 3 captures waiting
```

## Must-Haves

- [ ] 6 MDX files created in `src/content/docs/commands/`
- [ ] Each page has frontmatter, What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands
- [ ] Mermaid diagrams for queue, steer, and triage (minimum)
- [ ] 6 sidebar entries added to `astro.config.mjs`
- [ ] 6 deep-dive links added to `content/generated/docs/commands.md`
- [ ] All internal cross-links use `../sibling/` format

## Verification

- `npm run build` succeeds (expect ~42 pages)
- `node scripts/check-links.mjs` exits 0 with 0 broken links
- `ls src/content/docs/commands/*.mdx | wc -l` → 15
- All 6 new pages appear in `dist/commands/*/index.html`
- `grep "'/commands/" astro.config.mjs | wc -l` → 16

## Inputs

- `src/content/docs/commands/quick.mdx` — Reference for the established page template (read one existing S02 page to match structure)
- `astro.config.mjs` — Sidebar structure, insert after existing S02 entries in Commands section
- `content/generated/docs/commands.md` — Commands landing page, add links (NOT `src/content/docs/commands.md` which is overwritten by prebuild)
- GSD source files listed in Step 1 — Read-only reference for command internals

## Expected Output

- `src/content/docs/commands/queue.mdx` — Queue hub deep-dive with reorder/add Mermaid diagram
- `src/content/docs/commands/steer.mdx` — Hard-steer deep-dive with active/inactive path diagram
- `src/content/docs/commands/capture.mdx` — Capture deep-dive (prose + tables)
- `src/content/docs/commands/triage.mdx` — Triage deep-dive with pipeline Mermaid diagram
- `src/content/docs/commands/knowledge.mdx` — Knowledge deep-dive (prose + tables)
- `src/content/docs/commands/cleanup.mdx` — Cleanup deep-dive (prose + tables)
- `astro.config.mjs` — 6 new sidebar entries under Commands
- `content/generated/docs/commands.md` — 6 commands now linked to deep-dive pages
