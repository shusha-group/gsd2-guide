---
estimated_steps: 6
estimated_files: 5
---

# T02: Extract GitHub docs via tarball and fetch releases

**Slice:** S01 — Content extraction pipeline
**Milestone:** M001

## Description

Pull all narrative documentation from the `gsd-build/gsd-2` GitHub repo using the tarball endpoint (single API call for ~126 markdown files) and fetch all releases via the releases API (single paginated call for 48+ releases). Build the content manifest using the tree API for SHA-based diff tracking. This task handles all GitHub API interaction with caching to stay within the 60 requests/hour unauthenticated rate limit.

**Key constraint:** The tarball's root directory is `gsd-build-gsd-2-{shortsha}/` — the SHA changes on every commit. Strip the first path component when extracting. Cache the tarball locally in `.cache/` and check HEAD SHA before re-downloading.

**Relevant installed skills:** None needed for this task (pure Node.js + fetch).

## Steps

1. **Write the GitHub docs extractor.** Create `scripts/lib/extract-github-docs.mjs`. Export `extractGithubDocs(options)` that:
   - Accepts `{ token, cacheDir, outputDir }` where `token` is an optional `GITHUB_TOKEN`
   - Checks the current HEAD SHA via `GET /repos/gsd-build/gsd-2/commits/main` (just needs the SHA, use `Accept: application/vnd.github.sha`)
   - Compares to cached SHA in `.cache/last-sha.txt` — if match, skip tarball download
   - If new SHA: downloads tarball via `GET /repos/gsd-build/gsd-2/tarball/main` (follow redirects), saves to `.cache/tarball.tar.gz`
   - Extracts tarball using Node.js `zlib` + `tar` npm package — strips the first path component (the variable `gsd-build-gsd-2-{sha}/` prefix)
   - Copies `docs/**/*.md` to `content/generated/docs/` preserving subdirectory structure
   - Copies `README.md` to `content/generated/readme.md`
   - Logs `[github-docs]` prefix with file counts
   - Returns `{ docsCount, readmePath }`
   - All fetch calls include `Authorization: Bearer {token}` header when token is provided
   - Log GitHub rate limit remaining from response headers (`x-ratelimit-remaining`)

2. **Write the releases extractor.** Create `scripts/lib/extract-releases.mjs`. Export `extractReleases(options)` that:
   - Fetches `GET /repos/gsd-build/gsd-2/releases?per_page=100` (all 48 fit in one page)
   - For each release, parses the markdown body into structured sections: look for `## Added`, `## Changed`, `## Fixed` headings, collect bullet items under each into arrays
   - Each bullet item has format `- **feature** — description` — parse into `{feature, description}`
   - Writes `content/generated/releases.json` as array of `{tag_name, name, published_at, html_url, added[], changed[], fixed[], body}`
   - Logs `[releases]` prefix with count
   - Returns `{ count }`

3. **Write the manifest builder.** Create `scripts/lib/manifest.mjs`. Export `buildManifest(options)` that:
   - Fetches `GET /repos/gsd-build/gsd-2/git/trees/main?recursive=1` to get all file paths and SHA hashes
   - Reads the existing `content/generated/manifest.json` (if present) as the previous manifest
   - Builds a new manifest: `{ version, generatedAt, headSha, files: { [path]: sha } }`
   - Compares to previous manifest and computes `{ added[], changed[], removed[] }` diff
   - Writes the new manifest to `content/generated/manifest.json`
   - Logs the diff summary (e.g., "3 added, 2 changed, 0 removed")
   - Returns `{ manifest, diff }`

4. **Install the `tar` dependency.** Add `tar` to `package.json` dependencies. Run `npm install`.

5. **Add GitHub extraction tests.** Extend `tests/extract.test.mjs` with tests for:
   - `content/generated/docs/` contains ≥100 .md files
   - Doc files preserve subdirectory structure (e.g., `docs/building-coding-agents/` exists)
   - `content/generated/readme.md` exists and has >100 characters
   - `content/generated/releases.json` has ≥48 entries
   - Each release has `tag_name` and `published_at`
   - At least some releases have non-empty `added` arrays (parsed sections)
   - `content/generated/manifest.json` exists and has `files` object with ≥100 entries
   - Manifest has `headSha` and `generatedAt` fields

6. **Run and verify.** Execute the GitHub extractors standalone to verify they work. Confirm caching works by running twice and checking that the second run skips the tarball download.

## Must-Haves

- [ ] Tarball download in a single API call, cached locally with SHA check
- [ ] All `docs/**/*.md` files extracted preserving directory structure
- [ ] `README.md` extracted as `content/generated/readme.md`
- [ ] All releases fetched and parsed into structured sections (added/changed/fixed)
- [ ] Content manifest with SHA hashes from tree API, with diff tracking
- [ ] `GITHUB_TOKEN` env var supported for authenticated requests
- [ ] Rate limit remaining logged from response headers
- [ ] Tests pass for docs count, releases count, manifest structure

## Verification

- `node -e "import('./scripts/lib/extract-github-docs.mjs').then(m => m.extractGithubDocs({ outputDir: 'content/generated' }).then(r => console.log(r)))"` shows docsCount ≥100
- `node -e "import('./scripts/lib/extract-releases.mjs').then(m => m.extractReleases({ outputDir: 'content/generated' }).then(r => console.log(r)))"` shows count ≥48
- `find content/generated/docs -name "*.md" | wc -l` returns ≥100
- `node --test tests/extract.test.mjs` — all GitHub-related assertions pass
- Second run: console output shows cache hit / skip message for tarball

## Inputs

- `package.json` from T01 (to add `tar` dependency)
- `tests/extract.test.mjs` from T01 (to extend with GitHub tests)
- GitHub API endpoints:
  - `GET /repos/gsd-build/gsd-2/commits/main` — HEAD SHA check
  - `GET /repos/gsd-build/gsd-2/tarball/main` — full repo download (~2.3 MB)
  - `GET /repos/gsd-build/gsd-2/releases?per_page=100` — all releases
  - `GET /repos/gsd-build/gsd-2/git/trees/main?recursive=1` — file SHAs for manifest
- Tarball structure: root dir is `gsd-build-gsd-2-{shortsha}/`, contains `docs/` with 7 subdirectories and ~126 .md files
- Release body format: `## Added` / `## Changed` / `## Fixed` sections with `- **feature** — description` bullets
- Docs subdirectories: `building-coding-agents/`, `context-and-hooks/`, `extending-pi/`, `pi-ui-tui/`, `proposals/`, `what-is-pi/`

## Observability Impact

- **New signals:** Console output with `[github-docs]`, `[releases]`, `[manifest]` phase labels, file counts, and GitHub rate limit remaining from `x-ratelimit-remaining` header on every API response
- **Inspection surfaces:** `cat .cache/last-sha.txt` shows cached HEAD SHA; `jq '.files | length' content/generated/manifest.json` shows tracked file count; `jq 'length' content/generated/releases.json` shows release count; `find content/generated/docs -name '*.md' | wc -l` for docs count
- **Failure visibility:** GitHub API errors include HTTP status code and rate-limit remaining; tarball extraction errors include the path that failed; SHA cache mismatch triggers re-download with old→new SHA log
- **Cache diagnostics:** Second run logs `[github-docs] Cache hit — HEAD SHA unchanged ({sha})` when tarball is reused
- **Redaction:** `GITHUB_TOKEN` value is never logged — only its presence/absence is noted

## Expected Output

- `scripts/lib/extract-github-docs.mjs` — tarball downloader + extractor with caching
- `scripts/lib/extract-releases.mjs` — releases fetcher with markdown body parser
- `scripts/lib/manifest.mjs` — tree API manifest builder with diff tracking
- `content/generated/docs/**/*.md` — ≥100 markdown files preserving directory structure
- `content/generated/readme.md` — processed README from the repo
- `content/generated/releases.json` — array of ≥48 release objects with parsed sections
- `content/generated/manifest.json` — `{ version, generatedAt, headSha, files: {path: sha} }`
- `.cache/tarball.tar.gz` — cached tarball for subsequent runs
- `.cache/last-sha.txt` — HEAD SHA for cache invalidation
- Updated `tests/extract.test.mjs` with GitHub content assertions
