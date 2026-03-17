/**
 * tests/diff-sources.test.mjs — Tests for diff detection and staleness resolver.
 *
 * Run: node --test tests/diff-sources.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectChanges, resolveStalePages } from "../scripts/lib/diff-sources.mjs";

// ── Helper to build mock manifests ─────────────────────────────────────────

function manifest(files) {
  return { version: 1, generatedAt: new Date().toISOString(), headSha: "abc123", files };
}

// ── detectChanges ──────────────────────────────────────────────────────────

describe("detectChanges", () => {
  it("detects modified file (same path, different SHA)", () => {
    const prev = manifest({ "src/a.ts": "sha1" });
    const curr = manifest({ "src/a.ts": "sha2" });
    const result = detectChanges(prev, curr);

    assert.deepStrictEqual(result.changedFiles, ["src/a.ts"]);
    assert.deepStrictEqual(result.addedFiles, []);
    assert.deepStrictEqual(result.removedFiles, []);
  });

  it("detects added file (only in current)", () => {
    const prev = manifest({ "src/a.ts": "sha1" });
    const curr = manifest({ "src/a.ts": "sha1", "src/b.ts": "sha2" });
    const result = detectChanges(prev, curr);

    assert.deepStrictEqual(result.changedFiles, []);
    assert.deepStrictEqual(result.addedFiles, ["src/b.ts"]);
    assert.deepStrictEqual(result.removedFiles, []);
  });

  it("detects removed file (only in previous)", () => {
    const prev = manifest({ "src/a.ts": "sha1", "src/b.ts": "sha2" });
    const curr = manifest({ "src/a.ts": "sha1" });
    const result = detectChanges(prev, curr);

    assert.deepStrictEqual(result.changedFiles, []);
    assert.deepStrictEqual(result.addedFiles, []);
    assert.deepStrictEqual(result.removedFiles, ["src/b.ts"]);
  });

  it("returns empty arrays when manifests are identical", () => {
    const files = { "src/a.ts": "sha1", "src/b.ts": "sha2" };
    const prev = manifest(files);
    const curr = manifest({ ...files });
    const result = detectChanges(prev, curr);

    assert.deepStrictEqual(result.changedFiles, []);
    assert.deepStrictEqual(result.addedFiles, []);
    assert.deepStrictEqual(result.removedFiles, []);
  });

  it("handles combined add + change + remove in one diff", () => {
    const prev = manifest({ "src/a.ts": "sha1", "src/c.ts": "sha3" });
    const curr = manifest({ "src/a.ts": "sha1-modified", "src/b.ts": "sha2" });
    const result = detectChanges(prev, curr);

    assert.deepStrictEqual(result.changedFiles, ["src/a.ts"]);
    assert.deepStrictEqual(result.addedFiles, ["src/b.ts"]);
    assert.deepStrictEqual(result.removedFiles, ["src/c.ts"]);
  });
});

// ── resolveStalePages ──────────────────────────────────────────────────────

describe("resolveStalePages", () => {
  it("flags page whose dependency changed", () => {
    const changes = {
      changedFiles: ["src/x.ts"],
      addedFiles: [],
      removedFiles: [],
    };
    const pageMap = {
      "commands/alpha.mdx": ["src/x.ts"],
      "commands/beta.mdx": ["src/y.ts"],
    };
    const { stalePages, reasons } = resolveStalePages(changes, pageMap);

    assert.deepStrictEqual(stalePages, ["commands/alpha.mdx"]);
    assert.deepStrictEqual(reasons.get("commands/alpha.mdx"), ["src/x.ts"]);
    assert.ok(!reasons.has("commands/beta.mdx"));
  });

  it("added files do NOT flag existing pages as stale", () => {
    const changes = {
      changedFiles: [],
      addedFiles: ["src/z.ts"],
      removedFiles: [],
    };
    const pageMap = {
      "commands/alpha.mdx": ["src/z.ts"],
    };
    const { stalePages } = resolveStalePages(changes, pageMap);

    assert.deepStrictEqual(stalePages, []);
  });

  it("removed file flags dependent page as stale", () => {
    const changes = {
      changedFiles: [],
      addedFiles: [],
      removedFiles: ["src/x.ts"],
    };
    const pageMap = {
      "commands/alpha.mdx": ["src/x.ts"],
    };
    const { stalePages, reasons } = resolveStalePages(changes, pageMap);

    assert.deepStrictEqual(stalePages, ["commands/alpha.mdx"]);
    assert.deepStrictEqual(reasons.get("commands/alpha.mdx"), ["src/x.ts"]);
  });

  it("page with empty dependency array is never stale", () => {
    const changes = {
      changedFiles: ["src/a.ts", "src/b.ts"],
      addedFiles: ["src/c.ts"],
      removedFiles: ["src/d.ts"],
    };
    const pageMap = {
      "index.mdx": [],
      "changelog.mdx": [],
    };
    const { stalePages } = resolveStalePages(changes, pageMap);

    assert.deepStrictEqual(stalePages, []);
  });

  it("cross-cutting page flagged when any one dep changes", () => {
    const changes = {
      changedFiles: ["src/b.ts"],
      addedFiles: [],
      removedFiles: [],
    };
    const pageMap = {
      "user-guide/overview.mdx": ["src/a.ts", "src/b.ts", "src/c.ts"],
    };
    const { stalePages, reasons } = resolveStalePages(changes, pageMap);

    assert.deepStrictEqual(stalePages, ["user-guide/overview.mdx"]);
    assert.deepStrictEqual(reasons.get("user-guide/overview.mdx"), ["src/b.ts"]);
  });

  it("page with multiple changed deps lists all in reasons", () => {
    const changes = {
      changedFiles: ["src/a.ts"],
      addedFiles: [],
      removedFiles: ["src/c.ts"],
    };
    const pageMap = {
      "user-guide/overview.mdx": ["src/a.ts", "src/b.ts", "src/c.ts"],
    };
    const { stalePages, reasons } = resolveStalePages(changes, pageMap);

    assert.deepStrictEqual(stalePages, ["user-guide/overview.mdx"]);
    const triggers = reasons.get("user-guide/overview.mdx");
    assert.ok(triggers.includes("src/a.ts"), "should include changed file");
    assert.ok(triggers.includes("src/c.ts"), "should include removed file");
    assert.equal(triggers.length, 2);
  });

  it("no changes means no stale pages", () => {
    const changes = {
      changedFiles: [],
      addedFiles: [],
      removedFiles: [],
    };
    const pageMap = {
      "commands/alpha.mdx": ["src/x.ts"],
      "commands/beta.mdx": ["src/y.ts"],
    };
    const { stalePages } = resolveStalePages(changes, pageMap);

    assert.deepStrictEqual(stalePages, []);
  });
});
