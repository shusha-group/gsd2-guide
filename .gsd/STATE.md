# GSD State

**Active Milestone:** M004: Claude Code–Powered Documentation Regeneration
**Active Slice:** S01 — Claude Code Regeneration Engine (planned, ready for execution)
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
Execute S01/T01: Rewrite regeneratePage() to spawn claude -p subprocess. Replace Anthropic SDK call with spawnSync, build new prompt construction, parse stream-json output, add dep capping for reference pages, implement graceful degradation.
