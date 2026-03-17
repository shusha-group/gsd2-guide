---
estimated_steps: 7
estimated_files: 6
---

# T01: Scaffold project and extract local content from npm package

**Slice:** S01 — Content extraction pipeline
**Milestone:** M001

## Description

Set up the Node.js project and build the local content extractor that reads skills, agents, and extension metadata from the installed `gsd-pi` npm package. This task is the zero-risk foundation — no API calls, no rate limits — and proves that the extraction patterns work against real source files. It also establishes the test framework used throughout the slice.

The npm package lives at the global npm root (resolve via `npm root -g` + `/gsd-pi` or use `--pkg-path` override). Skills and agents use YAML frontmatter in `.md` files (parsed with `gray-matter`). Extensions register tools via `pi.registerTool({ name:, description: })` in TypeScript source (regex extraction).

**Relevant installed skills:** None needed for this task (pure Node.js scripting).

## Steps

1. **Initialize the project.** Create `package.json` with `"type": "module"`, name `gsd2-guide`, and add `gray-matter` as a dependency. Add a `"extract"` script placeholder pointing to `scripts/extract.mjs`. Run `npm install`. Create `.gitignore` with `node_modules/`, `content/generated/`, `.cache/`. Create `content/generated/.gitkeep`.

2. **Write the npm package path resolver.** In `scripts/lib/extract-local.mjs`, export a function `resolvePackagePath(overridePath)` that: (a) uses `overridePath` if provided, (b) otherwise shells out to `npm root -g` and appends `/gsd-pi`, (c) validates the path exists and contains `src/resources/`. Throw a clear error if the package isn't found.

3. **Extract skills.** In `scripts/lib/extract-local.mjs`, export `extractSkills(pkgPath)`. Recursively find all `SKILL.md` files under `{pkgPath}/src/resources/skills/`. Parse each with `gray-matter` to get `name` and `description` from frontmatter. Also extract structured sections from the body: `<objective>`, `<arguments>`, `<detection>` (using regex for XML-like tags). Handle nested reference skills (e.g., `github-workflows/references/gh/SKILL.md`) — include them with a `parentSkill` field and a `path` field showing the relative skill path. Return an array of skill objects. Expected: ≥8 skills (7 top-level + 1 nested reference).

4. **Extract agents.** In `scripts/lib/extract-local.mjs`, export `extractAgents(pkgPath)`. Read all `.md` files from `{pkgPath}/src/resources/agents/`. Parse YAML frontmatter with `gray-matter` to get `name`, `description`, `tools`, `model`, `memory`. Extract the first paragraph after frontmatter as `summary` (the human-facing description). Return array of agent objects. Expected: 5 agents (scout, researcher, worker, javascript-pro, typescript-pro).

5. **Extract extensions.** In `scripts/lib/extract-local.mjs`, export `extractExtensions(pkgPath)`. List directories under `{pkgPath}/src/resources/extensions/`. Exclude `shared/`. For each extension directory: read the JSDoc comment block at the top of `index.ts` (if exists) for the extension description. Regex-match all `pi.registerTool({` blocks to extract `name:` and `description:` values. For single-file extensions (`.ts` files directly in extensions/), do the same. Handle multi-line descriptions (template literals and string concatenation). Return array with `name` (directory name or file basename), `description` (from JSDoc), `tools[]` (array of `{name, description}`). Expected: ≥14 extensions.

6. **Write output files.** Export a main `extractLocal(options)` function that calls all three extractors, writes `skills.json`, `agents.json`, `extensions.json` to `content/generated/`, logs counts with `[local]` prefix.

7. **Write tests.** Create `tests/extract.test.mjs` using Node.js built-in test runner (`node:test` + `node:assert`). Test `extractLocal` output: skills.json exists and has ≥8 entries each with `name` and `description`; agents.json has ≥5 entries each with `name` and `description`; extensions.json has ≥14 entries each with `name` and `tools` array. Test that `shared/` is excluded from extensions. Test that nested skill references are included.

## Must-Haves

- [ ] `package.json` exists with `gray-matter` dependency and `"type": "module"`
- [ ] Skills extraction finds ≥8 skills including nested references, each with `name` and `description`
- [ ] Agent extraction finds 5 agents, each with `name`, `description`, and `summary`
- [ ] Extension extraction finds ≥14 extensions, each with `name`, `tools[]`, and `description`
- [ ] `shared/` directory is excluded from extensions
- [ ] Package path is dynamically resolved, not hardcoded
- [ ] All tests pass: `node --test tests/extract.test.mjs`

## Verification

- `npm install` succeeds (clean install from package.json)
- `node -e "import('./scripts/lib/extract-local.mjs').then(m => m.extractLocal({}).then(r => console.log('skills:', r.skills.length, 'agents:', r.agents.length, 'extensions:', r.extensions.length)))"` shows correct counts
- `node --test tests/extract.test.mjs` — all assertions pass
- `cat content/generated/skills.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.assert(d.length >= 8, 'Expected ≥8 skills, got ' + d.length)"` passes

## Inputs

- Installed `gsd-pi` npm package at global npm root (`~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/`)
- Package structure: `src/resources/skills/*/SKILL.md` (YAML frontmatter), `src/resources/agents/*.md` (YAML frontmatter), `src/resources/extensions/*/index.ts` and `extensions/*.ts` (TypeScript with `pi.registerTool()` patterns)
- Skills use `---\nname: ...\ndescription: ...\n---` YAML frontmatter followed by XML-like sections (`<objective>`, `<arguments>`)
- Agents use YAML frontmatter with `name`, `description`, `tools` fields; body is agent instructions
- Extensions use `pi.registerTool({ name: "tool_name", description: "..." })` pattern consistently
- The `shared/` extension directory is a utility library, not an extension — must be excluded
- Single-file extensions exist directly in the extensions directory (e.g., `ask-user-questions.ts`)
- Nested skill references exist (e.g., `github-workflows/references/gh/SKILL.md`)

## Expected Output

- `package.json` — Node.js project with `gray-matter` dependency, `"type": "module"`
- `.gitignore` — ignores `node_modules/`, `content/generated/`, `.cache/`
- `scripts/lib/extract-local.mjs` — local content extractor with `extractSkills`, `extractAgents`, `extractExtensions`, `extractLocal` exports
- `content/generated/skills.json` — array of ≥8 skill objects `{name, description, path, objective?, arguments?, parentSkill?}`
- `content/generated/agents.json` — array of 5 agent objects `{name, description, summary, tools?, model?}`
- `content/generated/extensions.json` — array of ≥14 extension objects `{name, description, tools: [{name, description}]}`
- `tests/extract.test.mjs` — test file with structural assertions for all three extractors
- `content/generated/.gitkeep` — ensures the output directory exists in git
