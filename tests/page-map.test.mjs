/**
 * tests/page-map.test.mjs — Tests for the page-source-map generator.
 *
 * Run: node --test tests/page-map.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPageSourceMap } from "../scripts/lib/build-page-map.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// Build the map once for all tests
const manifestPath = path.join(ROOT, "content/generated/manifest.json");
const { map, warnings } = buildPageSourceMap(manifestPath);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const manifestFiles = new Set(Object.keys(manifest.files));

// ─── Expected page lists ─────────────────────────────────────────────────────

const COMMAND_SLUGS = [
  "auto",
  "capture",
  "cleanup",
  "cli-flags",
  "discuss",
  "doctor",
  "forensics",
  "gsd",
  "headless",
  "hooks",
  "keyboard-shortcuts",
  "knowledge",
  "migrate",
  "mode",
  "next",
  "prefs",
  "queue",
  "quick",
  "run-hook",
  "skill-health",
  "status",
  "steer",
  "stop",
  "triage",
  "visualize",
];

const RECIPE_SLUGS = [
  "error-recovery",
  "fix-a-bug",
  "new-milestone",
  "small-change",
  "uat-failures",
  "working-in-teams",
];

const REFERENCE_SLUGS = [
  "agents",
  "commands",
  "extensions",
  "index",
  "shortcuts",
  "skills",
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("page-source-map", () => {
  it("has exactly 40 page entries", () => {
    const pageCount = Object.keys(map).length;
    assert.equal(pageCount, 40, `Expected 40 pages, got ${pageCount}`);
  });

  it("includes all 25 command pages", () => {
    assert.equal(COMMAND_SLUGS.length, 25, "Sanity: 25 command slugs defined");
    for (const slug of COMMAND_SLUGS) {
      const key = `commands/${slug}.mdx`;
      assert.ok(
        key in map,
        `Missing command page: ${key}`
      );
    }
  });

  it("includes all 6 recipe pages", () => {
    for (const slug of RECIPE_SLUGS) {
      const key = `recipes/${slug}.mdx`;
      assert.ok(
        key in map,
        `Missing recipe page: ${key}`
      );
    }
  });

  it("includes walkthrough, 6 reference pages, changelog, and homepage", () => {
    assert.ok("user-guide/developing-with-gsd.mdx" in map, "Missing walkthrough");
    for (const slug of REFERENCE_SLUGS) {
      const key = `reference/${slug}.mdx`;
      assert.ok(key in map, `Missing reference page: ${key}`);
    }
    assert.ok("changelog.mdx" in map, "Missing changelog");
    assert.ok("index.mdx" in map, "Missing homepage");
  });

  it("every source path in every entry exists in manifest.json", () => {
    const missing = [];
    for (const [page, deps] of Object.entries(map)) {
      for (const dep of deps) {
        if (!manifestFiles.has(dep)) {
          missing.push(`${page} → ${dep}`);
        }
      }
    }
    assert.equal(
      missing.length,
      0,
      `Source paths not in manifest:\n  ${missing.join("\n  ")}`
    );
  });

  it("command pages each have ≥1 .ts file in their deps", () => {
    for (const slug of COMMAND_SLUGS) {
      const key = `commands/${slug}.mdx`;
      const deps = map[key];
      const tsFiles = deps.filter((d) => d.endsWith(".ts"));
      assert.ok(
        tsFiles.length >= 1,
        `${key} has ${tsFiles.length} .ts deps, expected ≥1`
      );
    }
  });

  it("cross-cutting pages (recipes, walkthrough) have ≥3 deps each", () => {
    for (const slug of RECIPE_SLUGS) {
      const key = `recipes/${slug}.mdx`;
      const deps = map[key];
      assert.ok(
        deps.length >= 3,
        `${key} has ${deps.length} deps, expected ≥3`
      );
    }
    const walkthroughDeps = map["user-guide/developing-with-gsd.mdx"];
    assert.ok(
      walkthroughDeps.length >= 3,
      `walkthrough has ${walkthroughDeps.length} deps, expected ≥3`
    );
  });

  it("static pages have 0 deps (index, reference/index, changelog)", () => {
    assert.deepEqual(map["index.mdx"], [], "homepage should have 0 deps");
    assert.deepEqual(
      map["reference/index.mdx"],
      [],
      "reference/index should have 0 deps"
    );
    assert.deepEqual(map["changelog.mdx"], [], "changelog should have 0 deps");
  });

  it("generates without warnings (all paths valid)", () => {
    assert.equal(
      warnings.length,
      0,
      `Build had ${warnings.length} warnings:\n  ${warnings.join("\n  ")}`
    );
  });
});
