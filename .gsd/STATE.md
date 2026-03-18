# GSD State

**Active Milestone:** M004: Claude Code–Powered Documentation Regeneration
**Active Slice:** None — planning complete, ready for S01
**Phase:** executing
**Requirements Status:** 9 active · 41 validated · 5 deferred · 1 out of scope

## Milestone Registry
- ✅ **M001:** GSD 2 Documentation Site
- ✅ **M002:** GSD User Guide
- ✅ **M003:** Continuous Documentation Regeneration
- 🔄 **M004:** Claude Code–Powered Documentation Regeneration

## Recent Decisions
- D050: Replace @anthropic-ai/sdk with `claude -p` subprocess (Claude Code, not bare API)
- D051: Local-only regeneration — no GitHub Actions CI trigger

## Blockers
- None

## Next Action
Begin S01: Claude Code Regeneration Engine. Rewrite `scripts/lib/regenerate-page.mjs` to spawn `claude -p` instead of calling the Anthropic SDK. Verify page-source-map accuracy. Prove output quality matches M002 on `commands/capture.mdx`.
