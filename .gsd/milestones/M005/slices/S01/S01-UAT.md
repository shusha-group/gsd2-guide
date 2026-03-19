# S01: Prompt metadata extraction — UAT

**Milestone:** M005
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 produces a single JSON artifact consumed by all downstream slices. The artifact can be fully validated by inspection and automated tests. No runtime server, no UI, no human-experience dimension.

## Preconditions

1. Working directory is `/Users/davidspence/dev/gsd2-guide/.gsd/worktrees/M005`
2. `gsd-pi` is globally installed (`npm root -g` resolves to a path containing `gsd-pi/src/resources/extensions/gsd/prompts/`)
3. Node.js ≥ 18 available (`node --version`)
4. `content/generated/prompts.json` may or may not exist — the test regenerates it

## Smoke Test

```bash
node scripts/extract.mjs 2>&1 | grep "Prompts:"
```

**Expected:** `  Prompts:    32` appears in the summary block. If it says `0` or is absent, the extractor is not wired.

---

## Test Cases

### 1. Full extraction pipeline runs without errors

```bash
node scripts/extract.mjs
```

1. Run the command and observe output.
2. **Expected:** Exit code 0. Output contains `[prompts] Extracted 32 prompts from` (with a real path) and `Prompts:    32` in the summary. No `[prompts] Missing description` or `[prompts] Missing pipeline position` warnings.

---

### 2. Output file exists and has exactly 32 entries

```bash
python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"
```

1. Run after step 1 (or any prior extraction run).
2. **Expected:** Prints `32`. Any other number indicates a regression in the prompts directory scan or a package installation issue.

---

### 3. Group distribution matches D057 taxonomy

```bash
python3 -c "
import json
from collections import Counter
d = json.load(open('content/generated/prompts.json'))
print(Counter(p['group'] for p in d))
"
```

1. Run the command.
2. **Expected:** Output is `Counter({'commands': 13, 'auto-mode-pipeline': 10, 'guided-variants': 8, 'foundation': 1})` (order may vary). Total must sum to 32.

---

### 4. Special cases — `system` and `execute-task`

```bash
python3 -c "
import json
d = json.load(open('content/generated/prompts.json'))
sys = next(p for p in d if p['name'] == 'system')
et = next(p for p in d if p['name'] == 'execute-task')
print('system vars:', len(sys['variables']))
print('execute-task vars:', len(et['variables']))
"
```

1. Run the command.
2. **Expected:**
   - `system vars: 0` — the foundation prompt has no `{{variable}}` placeholders
   - `execute-task vars: 16` — the core execution prompt has exactly 16 variables

---

### 5. Structural integrity — every entry has all required fields

```bash
python3 -c "
import json
d = json.load(open('content/generated/prompts.json'))
valid_groups = {'auto-mode-pipeline', 'guided-variants', 'commands', 'foundation'}
errors = []
for p in d:
    for f in ['name', 'slug', 'group', 'variables', 'pipelinePosition', 'usedByCommands']:
        if f not in p:
            errors.append(f'MISSING {f} in {p[\"name\"]}')
    if p['group'] not in valid_groups:
        errors.append(f'INVALID group {p[\"group\"]} in {p[\"name\"]}')
    if not isinstance(p['variables'], list):
        errors.append(f'variables not array in {p[\"name\"]}')
    if not isinstance(p['usedByCommands'], list):
        errors.append(f'usedByCommands not array in {p[\"name\"]}')
    if not p['pipelinePosition']:
        errors.append(f'empty pipelinePosition in {p[\"name\"]}')
    if p['slug'] != p['name']:
        errors.append(f'slug != name in {p[\"name\"]}')
print('Errors:', errors if errors else 'none')
"
```

1. Run the command.
2. **Expected:** `Errors: none`. Any error entry indicates a malformed record that would break S02–S05 consumption.

---

### 6. Variable objects have correct shape

```bash
python3 -c "
import json
d = json.load(open('content/generated/prompts.json'))
errors = []
for p in d:
    for v in p['variables']:
        if not all(k in v for k in ['name', 'description', 'required']):
            errors.append(f'Bad var shape in {p[\"name\"]}: {v}')
        if not v['description']:
            errors.append(f'Empty description for {v[\"name\"]} in {p[\"name\"]}')
        if v['required'] is not True:
            errors.append(f'required!=True for {v[\"name\"]} in {p[\"name\"]}')
print('Errors:', errors if errors else 'none')
"
```

1. Run the command.
2. **Expected:** `Errors: none`. Empty descriptions would silently produce empty table cells in S03's generated pages.

---

### 7. All 48 automated tests pass

```bash
node --test tests/extract.test.mjs
```

1. Run the full test suite.
2. **Expected:** Final TAP lines show `# tests 48`, `# pass 48`, `# fail 0`. The `ok 10 - prompts extraction` line should appear with 9 sub-tests all passing.

---

### 8. Extraction is idempotent

```bash
node scripts/extract.mjs && node scripts/extract.mjs
```

1. Run extraction twice in sequence.
2. **Expected:** Both runs exit 0, both print `Prompts: 32`. The second run produces identical `prompts.json` output (confirmed by the idempotency test in the suite).

---

## Edge Cases

### Missing gsd-pi package

Simulate by temporarily passing a bad path (not practically testable without code modification). If gsd-pi is not globally installed, `resolvePackagePath()` throws with an actionable install message — extraction fails loudly, not silently.

**Expected behavior:** `[prompts] Prompts directory not found:` warning in output, extraction returns count 0.

### New prompt file added to gsd-pi

If a 33rd `.md` file appears in the prompts directory after a package upgrade:

1. `node scripts/extract.mjs` will emit `[prompts] Missing description for variable:` warnings for any new `{{variables}}`.
2. `prompts.json` will have 33 entries.
3. `node --test tests/extract.test.mjs` will fail on the `contains exactly 32 prompts` test.

**Expected behavior:** Extraction succeeds with warnings; tests fail with diagnostic count message; maintainer must add entries to static maps in `extract-prompts.mjs` and update the test assertion.

---

## Failure Signals

- `node scripts/extract.mjs` exits non-zero → check `resolvePackagePath()` error message for missing package
- `Prompts: 0` in summary → prompts directory not found at expected path under gsd-pi install
- `# fail N` in test output → inspect failing test name; error messages include actual vs expected values
- `[prompts] Missing description for variable: X` → variable `X` was added to a prompt file without updating `VARIABLE_DESCRIPTIONS` in `extract-prompts.mjs`
- `execute-task vars: N` where N ≠ 16 → gsd-pi package was updated, test assertions need review

---

## Requirements Proved By This UAT

- **R018** — prompt metadata extracted as structured, user-facing documentation (variable descriptions, pipeline positions, group taxonomy), not raw agent-instruction text
- **R001** — extraction reads from globally installed gsd-pi package via dynamic path resolution, consuming the installed package as source of truth

## Not Proven By This UAT

- R057–R060 (prompt pages exist, render, have Mermaid diagrams, link to commands) — requires S02, S03, S04
- `npm run build` succeeding with prompt pages — requires S02
- `npm run check-links` passing — requires S03, S04
- End-to-end stale detection for prompt pages — requires S05
- Quality of variable descriptions (are they human-readable and accurate?) — requires human review of generated pages in S03

## Notes for Tester

All test commands run in ~2 seconds total. No server, no browser, no network required (extraction reads from locally installed npm package). The Python 3 one-liners can be replaced with `python3 -m json.tool content/generated/prompts.json | head -100` for a manual spot-check if the commands above feel tedious. The most valuable manual check is picking 2–3 prompts from `prompts.json` and verifying their `pipelinePosition` strings make sense — these descriptions were authored by hand and are the most likely to have inaccuracies that automated tests can't catch.
