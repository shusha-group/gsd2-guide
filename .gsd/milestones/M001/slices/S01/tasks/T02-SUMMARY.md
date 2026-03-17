---
id: T02
parent: S01
milestone: M001
provides:
  - GitHub docs extractor with tarball download and SHA-based caching
  - Releases extractor with markdown body parsing into structured sections
  - Content manifest builder with SHA hashes from tree API and diff tracking
key_files:
  - scripts/lib/extract-github-docs.mjs
  - scripts/lib/extract-releases.mjs
  - scripts/lib/manifest.mjs
  - tests/extract.test.mjs
key_decisions:
  - Used named import from tar v7 ESM (`import { extract as tarExtract } from "tar"`) — tar v7 has no default export
  - Tarball filter uses original (pre-strip) paths; strip:1 handles prefix removal automatically
  - Clean previous docs dir before re-extraction to avoid stale files from removed upstream docs
  - Manifest uses commit SHA from .cache/last-sha.txt (set by docs extractor) rather than tree SHA for consistency
patterns_established:
  - Phase-labeled console output with `[github-docs]`, `[releases]`, `[manifest]` prefixes
  - Rate limit remaining logged on every GitHub API response via `x-ratelimit-remaining` header
  - SHA-based cache invalidation pattern: check HEAD SHA → compare to .cache/last-sha.txt → skip or re-download
  - Structured error messages include HTTP status code and rate limit remaining
observability_surfaces:
  - Console phase labels with counts and rate-limit remaining
  - .cache/last-sha.txt for cache state inspection
  - cat .cache/last-sha.txt to check cached SHA
  - jq '.files | length' content/generated/manifest.json for tracked file count
  - find content/generated/docs -name '*.md' | wc -l for docs count
duration: 25m
verification_result: passed
completed_at: 2025-03-17
blocker_discovered: false
---

# T02: Extract GitHub docs via tarball and fetch releases

**Built GitHub content extraction pipeline: 126 docs from tarball with SHA-based caching, 48 releases with parsed Added/Changed/Fixed sections, and content manifest tracking 991 files.**

## What Happened

Created three extraction modules that pull all content from the `gsd-build/gsd-2` GitHub repo:

1. **`extract-github-docs.mjs`** — Fetches the repo tarball in a single API call, extracts `docs/**/*.md` (126 files across 6 subdirectories) and `README.md` to `content/generated/`. Implements SHA-based caching: checks HEAD SHA via `Accept: application/vnd.github.sha` header, compares to `.cache/last-sha.txt`, and skips re-download on match. Tarball is cached at `.cache/tarball.tar.gz`. Uses `tar` npm package v7 with `strip: 1` to remove the variable `gsd-build-gsd-2-{sha}/` prefix.

2. **`extract-releases.mjs`** — Fetches all releases in one paginated call (`per_page=100`), parses each release body looking for `## Added`, `## Changed`, `## Fixed` headings, and extracts bullet items into `{feature, description}` objects. Handles `- **feature** — description` format plus plain bullets. Writes structured `releases.json` with 48 entries.

3. **`manifest.mjs`** — Uses the tree API (`/git/trees/main?recursive=1`) to get SHA hashes for all 991 repo files. Compares against previous manifest to compute added/changed/removed diff. Writes `manifest.json` with version, generatedAt, headSha, and files map.

All modules support optional `GITHUB_TOKEN` for authenticated requests (5000 req/hr vs 60 unauthenticated). Rate limit remaining is logged from every API response. Token value is never logged.

## Verification

- `node --test tests/extract.test.mjs` — **30/30 tests pass** (0 fail) including 11 new GitHub-specific tests
- `find content/generated/docs -name "*.md" | wc -l` → 126 (≥100 ✓)
- `content/generated/releases.json` has 48 entries (≥48 ✓), all with `tag_name`, `published_at`, `html_url`
- `content/generated/manifest.json` has 991 file entries with SHA hashes, `headSha`, `generatedAt`, `version`
- `content/generated/readme.md` exists with 31,574 characters (>100 ✓)
- Subdirectory structure preserved: `building-coding-agents/`, `context-and-hooks/`, `extending-pi/`, `pi-ui-tui/`, `proposals/`, `what-is-pi/`
- Cache hit verified: second run logs `[github-docs] Cache hit — HEAD SHA unchanged (af17b600)`
- Rate limit remaining logged on every API call

**Slice-level checks passing after T02:**
- ✅ skills.json ≥8 entries (8)
- ✅ agents.json ≥5 entries (5)
- ✅ extensions.json ≥14 entries (17)
- ⏳ commands.json — not yet (T03)
- ✅ releases.json ≥48 entries (48)
- ✅ docs/ ≥100 .md files (126)
- ✅ readme.md exists
- ✅ manifest.json has file entries with SHA hashes
- ⏳ `node scripts/extract.mjs` orchestrator — not yet (T03)

## Diagnostics

- **Inspect cache state:** `cat .cache/last-sha.txt`
- **Docs count:** `find content/generated/docs -name '*.md' | wc -l`
- **Releases count:** `jq 'length' content/generated/releases.json`
- **Manifest file count:** `jq '.files | length' content/generated/manifest.json`
- **Re-run docs extraction:** `node -e "import('./scripts/lib/extract-github-docs.mjs').then(m => m.extractGithubDocs({ outputDir: 'content/generated' }).then(r => console.log(r)))"`
- **Re-run releases:** `node -e "import('./scripts/lib/extract-releases.mjs').then(m => m.extractReleases({ outputDir: 'content/generated' }).then(r => console.log(r)))"`
- **Re-run manifest:** `node -e "import('./scripts/lib/manifest.mjs').then(m => m.buildManifest({ outputDir: 'content/generated' }).then(r => console.log('files:', Object.keys(r.manifest.files).length)))"`
- **Force re-download:** `rm .cache/last-sha.txt` then re-run docs extraction
- **Error shapes:** GitHub API errors include `HTTP {status} — rate limit remaining: {n}`

## Deviations

- `tar` v7 uses ESM named exports only (`import { extract } from "tar"`) — no default export. Fixed during implementation.
- Docs directory is cleaned before each extraction to prevent stale files accumulating.

## Known Issues

None.

## Files Created/Modified

- `scripts/lib/extract-github-docs.mjs` — Tarball downloader + docs extractor with SHA-based caching
- `scripts/lib/extract-releases.mjs` — Releases fetcher with markdown body parser (Added/Changed/Fixed sections)
- `scripts/lib/manifest.mjs` — Tree API manifest builder with diff tracking
- `tests/extract.test.mjs` — Extended with 11 new tests for GitHub docs, releases, and manifest
- `package.json` — Added `tar` dependency
- `.cache/tarball.tar.gz` — Cached repo tarball (~2.3 MB)
- `.cache/last-sha.txt` — HEAD SHA for cache invalidation
- `content/generated/docs/**/*.md` — 126 markdown files across 6 subdirectories
- `content/generated/readme.md` — Repo README (31KB)
- `content/generated/releases.json` — 48 structured release objects
- `content/generated/manifest.json` — 991 file entries with SHA hashes
