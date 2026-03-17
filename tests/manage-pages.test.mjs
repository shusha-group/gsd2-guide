/**
 * tests/manage-pages.test.mjs — Tests for the manage-pages module.
 *
 * Run: node --test tests/manage-pages.test.mjs
 *
 * Uses temp directories for all file operations to avoid modifying real project files.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import {
  detectNewAndRemovedCommands,
  addSidebarEntry,
  removeSidebarEntry,
  addToPageMap,
  removeFromPageMap,
} from "../scripts/lib/manage-pages.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ─── Fixture helpers ─────────────────────────────────────────────────────────

/** Minimal commands.json matching the real structure. */
function makeCommandsJson(extraCommands = []) {
  const base = [
    { command: "/gsd", description: "Step mode", category: "Session Commands" },
    { command: "/gsd auto", description: "Autonomous mode", category: "Session Commands" },
    { command: "/gsd stop", description: "Stop auto", category: "Session Commands" },
    { command: "/gsd status", description: "Progress dashboard", category: "Session Commands" },
    { command: "/gsd help", description: "Help reference", category: "Session Commands" },
    { command: "/gsd parallel start", description: "Start workers", category: "Parallel Orchestration" },
    { command: "/gsd parallel status", description: "Show workers", category: "Parallel Orchestration" },
    { command: "/gsd skill-health", description: "Skill dashboard", category: "Configuration & Diagnostics" },
    { command: "/gsd skill-health <name>", description: "Detailed skill view", category: "Configuration & Diagnostics" },
    { command: "/worktree (/wt)", description: "Worktree lifecycle", category: "Git Commands" },
    { command: "/clear", description: "Start new session", category: "Session Management" },
    { command: "/exit", description: "Graceful shutdown", category: "Session Management" },
    { command: "Ctrl+Alt+G", description: "Toggle dashboard", category: "Keyboard Shortcuts" },
    { command: "Escape", description: "Pause auto mode", category: "Keyboard Shortcuts" },
    { command: "gsd --continue (-c)", description: "Resume session", category: "CLI Flags" },
    { command: "gsd", description: "Start session", category: "CLI Flags" },
    ...extraCommands,
  ];
  return base;
}

/** Minimal astro.config.mjs sidebar section. */
function makeAstroConfig() {
  return fs.readFileSync(path.join(ROOT, "astro.config.mjs"), "utf-8");
}

/** Minimal page-source-map.json. */
function makePageMap() {
  return {
    "commands/auto.mdx": [
      "src/resources/extensions/gsd/commands.ts",
      "src/resources/extensions/gsd/state.ts",
      "src/resources/extensions/gsd/types.ts",
      "src/resources/extensions/gsd/auto.ts",
    ],
    "commands/stop.mdx": [
      "src/resources/extensions/gsd/commands.ts",
      "src/resources/extensions/gsd/state.ts",
      "src/resources/extensions/gsd/types.ts",
    ],
  };
}

/** Minimal manifest.json with a .files map. */
function makeManifest(extraFiles = {}) {
  return {
    version: 1,
    files: {
      "src/resources/extensions/gsd/commands.ts": "abc",
      "src/resources/extensions/gsd/state.ts": "def",
      "src/resources/extensions/gsd/types.ts": "ghi",
      "src/resources/extensions/gsd/auto.ts": "jkl",
      "src/resources/extensions/gsd/stop.ts": "mno",
      "src/resources/extensions/gsd/prompts/discuss.md": "pqr",
      ...extraFiles,
    },
  };
}

// ─── Detection tests ─────────────────────────────────────────────────────────

describe("detectNewAndRemovedCommands", () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-detect-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function setup({ commands = makeCommandsJson(), mdxFiles = [] }) {
    const commandsPath = path.join(tmpDir, "commands.json");
    fs.writeFileSync(commandsPath, JSON.stringify(commands));

    const commandsDir = path.join(tmpDir, "commands");
    fs.mkdirSync(commandsDir);
    for (const f of mdxFiles) {
      fs.writeFileSync(path.join(commandsDir, f), "---\ntitle: Test\n---\n");
    }

    return { commandsPath, commandsDir };
  }

  it("detects a new command when no .mdx page exists", () => {
    const commands = makeCommandsJson([
      { command: "/gsd fake-test", description: "Fake", category: "Session Commands" },
    ]);
    // Existing pages: auto, stop, status, gsd, skill-health (match the base commands)
    const { commandsPath, commandsDir } = setup({
      commands,
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(result.newCommands.includes("fake-test"), "fake-test should be new");
  });

  it("detects a removed command when .mdx exists but command is gone", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: [
        "auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx",
        "removed-cmd.mdx",
      ],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(result.removedCommands.includes("removed-cmd"), "removed-cmd should be flagged");
  });

  it("filters out subcommands with arguments", () => {
    // "/gsd skill-health <name>" should NOT produce a separate slug
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    // "skill-health <name>" doesn't match COMMAND_RE so no extra slug
    assert.ok(!result.newCommands.includes("skill-health"), "skill-health subcommands filtered");
    assert.deepEqual(result.newCommands, []);
  });

  it("filters out non-gsd commands", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    // /worktree, /clear, /exit should not produce slugs
    assert.ok(!result.newCommands.includes("worktree"));
    assert.ok(!result.newCommands.includes("clear"));
    assert.ok(!result.newCommands.includes("exit"));
  });

  it("filters out keyboard shortcuts", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    // Ctrl+Alt+G, Escape should not produce slugs
    const allSlugs = [...result.newCommands, ...result.removedCommands];
    assert.ok(!allSlugs.some(s => s.startsWith("Ctrl") || s === "Escape"));
  });

  it("filters out CLI flags", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    // "gsd --continue" etc. should not produce slugs
    assert.ok(!result.newCommands.includes("--continue"));
  });

  it("excludes /gsd help (EXCLUDED_SLUGS)", () => {
    // help is in commands.json but should NOT be flagged as new even without a page
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(!result.newCommands.includes("help"), "help should be excluded");
  });

  it("excludes /gsd parallel (EXCLUDED_SLUGS) — subcommands don't match regex anyway", () => {
    // "/gsd parallel start" doesn't match COMMAND_RE (has space + second word)
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(!result.newCommands.includes("parallel"), "parallel should be excluded");
  });

  it("never flags non-command pages for removal", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: [
        "auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx",
        "keyboard-shortcuts.mdx", "cli-flags.mdx", "headless.mdx",
      ],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(!result.removedCommands.includes("keyboard-shortcuts"));
    assert.ok(!result.removedCommands.includes("cli-flags"));
    assert.ok(!result.removedCommands.includes("headless"));
  });

  it("maps the bare /gsd command to slug 'gsd'", () => {
    // No gsd.mdx → should detect "gsd" as new
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(result.newCommands.includes("gsd"), "bare /gsd should produce slug 'gsd'");
  });

  it("returns empty arrays when all commands match pages", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.deepEqual(result.newCommands, []);
    assert.deepEqual(result.removedCommands, []);
  });
});

// ─── Sidebar tests ───────────────────────────────────────────────────────────

describe("addSidebarEntry", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-sidebar-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    fs.writeFileSync(configPath, makeAstroConfig());
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("inserts a line before 'Keyboard Shortcuts'", () => {
    const result = addSidebarEntry("fake-test", { configPath });
    assert.deepEqual(result, { added: true, slug: "fake-test" });

    const content = fs.readFileSync(configPath, "utf-8");
    const lines = content.split("\n");
    const kbIdx = lines.findIndex((l) => l.includes("'Keyboard Shortcuts'"));
    const newIdx = lines.findIndex((l) => l.includes("fake-test"));

    assert.ok(newIdx !== -1, "New line should exist");
    assert.ok(newIdx < kbIdx, "New line should be before Keyboard Shortcuts");
  });

  it("has correct label/link format", () => {
    addSidebarEntry("fake-test", { configPath });
    const content = fs.readFileSync(configPath, "utf-8");
    assert.ok(
      content.includes("{ label: '/gsd fake-test', link: '/commands/fake-test/' },"),
      "Line format should match expected pattern"
    );
  });

  it("uses 12-space indentation", () => {
    addSidebarEntry("fake-test", { configPath });
    const content = fs.readFileSync(configPath, "utf-8");
    const line = content.split("\n").find((l) => l.includes("fake-test"));
    assert.ok(line.startsWith("            "), "Should have 12-space indent");
    assert.ok(!line.startsWith("             "), "Should not have 13-space indent");
  });
});

describe("removeSidebarEntry", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-sidebar-rm-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    fs.writeFileSync(configPath, makeAstroConfig());
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes the /gsd auto line", () => {
    const before = fs.readFileSync(configPath, "utf-8");
    assert.ok(before.includes("/gsd auto"), "Sanity: auto line exists");

    const result = removeSidebarEntry("auto", { configPath });
    assert.deepEqual(result, { removed: true, slug: "auto" });

    const after = fs.readFileSync(configPath, "utf-8");
    assert.ok(!after.includes("/gsd auto"), "auto line should be removed");
  });

  it("removes the bare /gsd line (special case)", () => {
    const before = fs.readFileSync(configPath, "utf-8");
    // The bare /gsd line has link: '/commands/gsd/'
    assert.ok(before.includes("/commands/gsd/"), "Sanity: gsd link exists");

    const result = removeSidebarEntry("gsd", { configPath });
    assert.deepEqual(result, { removed: true, slug: "gsd" });

    const after = fs.readFileSync(configPath, "utf-8");
    assert.ok(!after.includes("/commands/gsd/"), "gsd link should be removed");
    // Ensure /gsd auto is NOT removed (only the bare gsd)
    assert.ok(after.includes("/gsd auto"), "/gsd auto should still exist");
  });

  it("returns removed: false for nonexistent slug", () => {
    const result = removeSidebarEntry("nonexistent", { configPath });
    assert.deepEqual(result, { removed: false, slug: "nonexistent", reason: "not found" });
  });

  it("does not affect non-command entries", () => {
    const before = fs.readFileSync(configPath, "utf-8");
    removeSidebarEntry("auto", { configPath });
    const after = fs.readFileSync(configPath, "utf-8");

    // Non-command entries should all still be present
    assert.ok(after.includes("'Keyboard Shortcuts'"), "Keyboard Shortcuts preserved");
    assert.ok(after.includes("'CLI Flags'"), "CLI Flags preserved");
    assert.ok(after.includes("'Headless Mode'"), "Headless Mode preserved");
  });
});

// ─── Page-source-map tests ───────────────────────────────────────────────────

describe("addToPageMap", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let mapPath;
  /** @type {string} */
  let manifestPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-map-"));
    mapPath = path.join(tmpDir, "page-source-map.json");
    manifestPath = path.join(tmpDir, "manifest.json");
    fs.writeFileSync(mapPath, JSON.stringify(makePageMap(), null, 2));
    fs.writeFileSync(manifestPath, JSON.stringify(makeManifest()));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates entry with at least shared deps", () => {
    const result = addToPageMap("fake-test", { mapPath, manifestPath });
    assert.equal(result.added, true);
    assert.equal(result.slug, "fake-test");
    assert.ok(result.deps.length >= 3, "Should have at least 3 shared deps");
    assert.ok(result.deps.includes("src/resources/extensions/gsd/commands.ts"));
    assert.ok(result.deps.includes("src/resources/extensions/gsd/state.ts"));
    assert.ok(result.deps.includes("src/resources/extensions/gsd/types.ts"));

    // Verify the map file was updated
    const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok("commands/fake-test.mdx" in map);
  });

  it("includes slug.ts if it exists in manifest", () => {
    // stop.ts is in our manifest fixture
    const result = addToPageMap("stop", { mapPath, manifestPath });
    assert.ok(
      result.deps.includes("src/resources/extensions/gsd/stop.ts"),
      "Should include stop.ts"
    );
  });

  it("includes prompts/slug.md if it exists in manifest", () => {
    // discuss.md is in our manifest fixture under prompts/
    const result = addToPageMap("discuss", { mapPath, manifestPath });
    assert.ok(
      result.deps.includes("src/resources/extensions/gsd/prompts/discuss.md"),
      "Should include prompts/discuss.md"
    );
  });
});

describe("removeFromPageMap", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let mapPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-map-rm-"));
    mapPath = path.join(tmpDir, "page-source-map.json");
    fs.writeFileSync(mapPath, JSON.stringify(makePageMap(), null, 2));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes the commands/auto.mdx key", () => {
    const result = removeFromPageMap("auto", { mapPath });
    assert.deepEqual(result, { removed: true, slug: "auto" });

    const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok(!("commands/auto.mdx" in map), "auto entry should be removed");
    // stop should still be there
    assert.ok("commands/stop.mdx" in map, "stop entry should remain");
  });

  it("returns removed: false for nonexistent slug", () => {
    const result = removeFromPageMap("nonexistent", { mapPath });
    assert.deepEqual(result, { removed: false, slug: "nonexistent", reason: "not found" });
  });
});
