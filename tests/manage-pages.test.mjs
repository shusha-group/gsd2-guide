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
  createNewPages,
  removePages,
  detectNewAndRemovedPrompts,
  addPromptSidebarEntry,
  removePromptSidebarEntry,
  createNewPromptPages,
  removePromptPages,
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
    { command: "/gsd export --html", description: "HTML report", category: "Session Commands" },
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
    { command: "gsd config", description: "Re-run setup wizard", category: "CLI Flags" },
    { command: "gsd update", description: "Update GSD", category: "CLI Flags" },
    { command: "gsd sessions", description: "Alias for headless", category: "CLI Flags" },
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
    // Existing pages: auto, stop, status, gsd, skill-health, config, update (match the base commands)
    const { commandsPath, commandsDir } = setup({
      commands,
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(result.newCommands.includes("fake-test"), "fake-test should be new");
  });

  it("detects a removed command when .mdx exists but command is gone", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: [
        "auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx",
        "config.mdx", "update.mdx",
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
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    // "skill-health <name>" doesn't match COMMAND_RE so no extra slug
    assert.ok(!result.newCommands.includes("skill-health"), "skill-health subcommands filtered");
    assert.deepEqual(result.newCommands, []);
  });

  it("filters out non-gsd commands", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
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
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    // Ctrl+Alt+G, Escape should not produce slugs
    const allSlugs = [...result.newCommands, ...result.removedCommands];
    assert.ok(!allSlugs.some(s => s.startsWith("Ctrl") || s === "Escape"));
  });

  it("filters out CLI flags", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    // "gsd --continue" etc. should not produce slugs
    assert.ok(!result.newCommands.includes("--continue"));
  });

  it("excludes /gsd help (EXCLUDED_SLUGS)", () => {
    // help is in commands.json but should NOT be flagged as new even without a page
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(!result.newCommands.includes("help"), "help should be excluded");
  });

  it("excludes /gsd parallel (EXCLUDED_SLUGS) — subcommands don't match regex anyway", () => {
    // "/gsd parallel start" doesn't match COMMAND_RE (has space + second word)
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(!result.newCommands.includes("parallel"), "parallel should be excluded");
  });

  it("never flags non-command pages for removal", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: [
        "auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx",
        "config.mdx", "update.mdx",
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
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
    });

    const result = detectNewAndRemovedCommands({ commandsPath, commandsDir });
    assert.ok(result.newCommands.includes("gsd"), "bare /gsd should produce slug 'gsd'");
  });

  it("returns empty arrays when all commands match pages", () => {
    const { commandsPath, commandsDir } = setup({
      commands: makeCommandsJson(),
      mdxFiles: ["auto.mdx", "stop.mdx", "status.mdx", "gsd.mdx", "skill-health.mdx", "config.mdx", "update.mdx"],
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

// ═══════════════════════════════════════════════════════════════════════════════
// T02: Orchestration integration tests (createNewPages, removePages)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mock client is no longer needed — createNewPages is scaffold-only.
 */

// ─── createNewPages tests ────────────────────────────────────────────────────

describe("createNewPages", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;
  /** @type {string} */
  let mapPath;
  /** @type {string} */
  let manifestPath;
  /** @type {string} */
  let commandsDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-create-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    mapPath = path.join(tmpDir, "page-source-map.json");
    manifestPath = path.join(tmpDir, "manifest.json");
    commandsDir = path.join(tmpDir, "commands");

    fs.writeFileSync(configPath, makeAstroConfig());
    fs.writeFileSync(mapPath, JSON.stringify(makePageMap(), null, 2));
    fs.writeFileSync(manifestPath, JSON.stringify(makeManifest()));
    fs.mkdirSync(commandsDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates a scaffold page, updates sidebar and map", () => {
    const result = createNewPages(["fake-test-t02"], {
      configPath,
      mapPath,
      manifestPath,
      commandsDir,
    });

    assert.equal(result.created, 1);
    assert.equal(result.failed, 0);
    assert.equal(result.results.length, 1);

    const entry = result.results[0];
    assert.equal(entry.slug, "fake-test-t02");

    // Sidebar was updated
    assert.ok(entry.sidebar?.added, "Sidebar entry should be added");
    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(
      sidebarContent.includes("/commands/fake-test-t02/"),
      "Sidebar should contain the new command link"
    );

    // Map was updated
    assert.ok(entry.map?.added, "Map entry should be added");
    const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok(
      "commands/fake-test-t02.mdx" in map,
      "Map should contain the new page key"
    );

    // Scaffold file was created
    const pagePath = path.join(commandsDir, "fake-test-t02.mdx");
    assert.ok(fs.existsSync(pagePath), "Scaffold .mdx file should exist");

    const content = fs.readFileSync(pagePath, "utf-8");
    assert.ok(content.startsWith("---\n"), "Should have frontmatter");
    assert.ok(content.includes("/gsd fake-test-t02"), "Should have command title");
    assert.ok(content.includes("scaffold"), "Should indicate scaffold status");
  });

  it("skips all writes in dryRun mode", () => {
    const result = createNewPages(["fake-test-t02"], {
      dryRun: true,
      configPath,
      mapPath,
      manifestPath,
      commandsDir,
    });

    assert.equal(result.created, 1);

    // No sidebar/map updates in dryRun
    assert.equal(result.results[0].sidebar, null, "Sidebar should not be updated in dryRun");
    assert.equal(result.results[0].map, null, "Map should not be updated in dryRun");

    // Sidebar file should be unchanged
    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(
      !sidebarContent.includes("fake-test-t02"),
      "Sidebar should NOT contain the command in dryRun"
    );

    // No scaffold file written
    assert.ok(
      !fs.existsSync(path.join(commandsDir, "fake-test-t02.mdx")),
      "Scaffold file should NOT exist in dryRun"
    );
  });

  it("processes multiple new commands", () => {
    const result = createNewPages(
      ["fake-test-t02", "fake-test-t02b"],
      {
        configPath,
        mapPath,
        manifestPath,
        commandsDir,
      }
    );

    assert.equal(result.created, 2);
    assert.equal(result.results.length, 2);
    assert.equal(result.results[0].slug, "fake-test-t02");
    assert.equal(result.results[1].slug, "fake-test-t02b");

    // Both sidebar entries added
    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(sidebarContent.includes("/commands/fake-test-t02/"));
    assert.ok(sidebarContent.includes("/commands/fake-test-t02b/"));

    // Both map entries added
    const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok("commands/fake-test-t02.mdx" in map);
    assert.ok("commands/fake-test-t02b.mdx" in map);

    // Both scaffold files created
    assert.ok(fs.existsSync(path.join(commandsDir, "fake-test-t02.mdx")));
    assert.ok(fs.existsSync(path.join(commandsDir, "fake-test-t02b.mdx")));
  });
});

// ─── removePages tests ──────────────────────────────────────────────────────

describe("removePages", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;
  /** @type {string} */
  let mapPath;
  /** @type {string} */
  let commandsDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-remove-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    mapPath = path.join(tmpDir, "page-source-map.json");
    commandsDir = path.join(tmpDir, "commands");

    fs.writeFileSync(configPath, makeAstroConfig());
    fs.writeFileSync(mapPath, JSON.stringify(makePageMap(), null, 2));
    fs.mkdirSync(commandsDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("deletes file, removes sidebar entry, removes map entry", () => {
    // Create a fake page file
    fs.writeFileSync(
      path.join(commandsDir, "auto.mdx"),
      "---\ntitle: test\n---\n"
    );

    const result = removePages(["auto"], {
      configPath,
      mapPath,
      commandsDir,
    });

    assert.equal(result.removed, 1);
    assert.equal(result.failed, 0);
    assert.equal(result.results.length, 1);

    const entry = result.results[0];
    assert.equal(entry.slug, "auto");
    assert.equal(entry.fileDeleted, true);
    assert.ok(entry.sidebar?.removed, "Sidebar entry should be removed");
    assert.ok(entry.map?.removed, "Map entry should be removed");

    // Verify file is gone
    assert.ok(!fs.existsSync(path.join(commandsDir, "auto.mdx")));

    // Verify sidebar is cleaned
    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(!sidebarContent.includes("/commands/auto/"));

    // Verify map is cleaned
    const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok(!("commands/auto.mdx" in map));
  });

  it("handles missing file gracefully and still cleans sidebar/map", () => {
    // Don't create the file — it doesn't exist
    const result = removePages(["auto"], {
      configPath,
      mapPath,
      commandsDir,
    });

    assert.equal(result.removed, 1, "Should still count as removed");
    assert.equal(result.results[0].fileDeleted, false, "File was not deleted (didn't exist)");

    // Sidebar and map should still be cleaned
    assert.ok(result.results[0].sidebar?.removed, "Sidebar entry should be removed");
    assert.ok(result.results[0].map?.removed, "Map entry should be removed");
  });

  it("processes multiple removals", () => {
    // Create page files for both
    fs.writeFileSync(
      path.join(commandsDir, "auto.mdx"),
      "---\ntitle: auto\n---\n"
    );
    fs.writeFileSync(
      path.join(commandsDir, "stop.mdx"),
      "---\ntitle: stop\n---\n"
    );

    const result = removePages(["auto", "stop"], {
      configPath,
      mapPath,
      commandsDir,
    });

    assert.equal(result.removed, 2);
    assert.equal(result.failed, 0);
    assert.equal(result.results.length, 2);

    // Both files gone
    assert.ok(!fs.existsSync(path.join(commandsDir, "auto.mdx")));
    assert.ok(!fs.existsSync(path.join(commandsDir, "stop.mdx")));

    // Both sidebar entries removed
    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(!sidebarContent.includes("/commands/auto/"));
    assert.ok(!sidebarContent.includes("/commands/stop/"));

    // Both map entries removed
    const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok(!("commands/auto.mdx" in map));
    assert.ok(!("commands/stop.mdx" in map));
  });
});

// ─── Full round-trip test ────────────────────────────────────────────────────

describe("Full round-trip: detect → create → remove", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let commandsJsonPath;
  /** @type {string} */
  let commandsDir;
  /** @type {string} */
  let configPath;
  /** @type {string} */
  let mapPath;
  /** @type {string} */
  let manifestPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-roundtrip-"));
    commandsJsonPath = path.join(tmpDir, "commands.json");
    commandsDir = path.join(tmpDir, "commands");
    configPath = path.join(tmpDir, "astro.config.mjs");
    mapPath = path.join(tmpDir, "page-source-map.json");
    manifestPath = path.join(tmpDir, "manifest.json");

    fs.mkdirSync(commandsDir);

    // Set up existing pages: auto, stop, status, gsd, skill-health, config, update
    for (const slug of ["auto", "stop", "status", "gsd", "skill-health", "config", "update"]) {
      fs.writeFileSync(
        path.join(commandsDir, `${slug}.mdx`),
        `---\ntitle: "/gsd ${slug}"\n---\nContent for ${slug}.\n`
      );
    }

    // Set up commands.json WITH a new command "roundtrip-test"
    const commands = makeCommandsJson([
      {
        command: "/gsd roundtrip-test",
        description: "A round-trip test command",
        category: "Session Commands",
      },
    ]);
    fs.writeFileSync(commandsJsonPath, JSON.stringify(commands));

    // Set up config, map, manifest
    fs.writeFileSync(configPath, makeAstroConfig());
    fs.writeFileSync(mapPath, JSON.stringify(makePageMap(), null, 2));
    fs.writeFileSync(manifestPath, JSON.stringify(makeManifest()));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("detects new → creates page → detects removed → removes page", () => {
    // Step 1: Detect new command
    const detect1 = detectNewAndRemovedCommands({
      commandsPath: commandsJsonPath,
      commandsDir,
    });
    assert.ok(
      detect1.newCommands.includes("roundtrip-test"),
      "Should detect roundtrip-test as new"
    );
    assert.deepEqual(detect1.removedCommands, []);

    // Step 2: Create the new page as scaffold
    const createResult = createNewPages(["roundtrip-test"], {
      configPath,
      mapPath,
      manifestPath,
      commandsDir,
    });

    assert.equal(createResult.created, 1);
    assert.ok(
      fs.existsSync(path.join(commandsDir, "roundtrip-test.mdx")),
      "Scaffold file should exist after creation"
    );

    // Verify sidebar was updated
    let sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(sidebarContent.includes("/commands/roundtrip-test/"));

    // Verify map was updated
    let map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok("commands/roundtrip-test.mdx" in map);

    // Step 3: Verify detection now shows no new/removed
    const detect2 = detectNewAndRemovedCommands({
      commandsPath: commandsJsonPath,
      commandsDir,
    });
    assert.deepEqual(detect2.newCommands, [], "No new commands after creation");
    assert.deepEqual(detect2.removedCommands, [], "No removed commands");

    // Step 4: Remove the command from commands.json
    const commandsWithout = makeCommandsJson(); // No roundtrip-test
    fs.writeFileSync(commandsJsonPath, JSON.stringify(commandsWithout));

    // Step 5: Detect removed command
    const detect3 = detectNewAndRemovedCommands({
      commandsPath: commandsJsonPath,
      commandsDir,
    });
    assert.ok(
      detect3.removedCommands.includes("roundtrip-test"),
      "Should detect roundtrip-test as removed"
    );

    // Step 6: Remove the page
    const removeResult = removePages(["roundtrip-test"], {
      configPath,
      mapPath,
      commandsDir,
    });

    assert.equal(removeResult.removed, 1);
    assert.ok(
      removeResult.results[0].fileDeleted,
      "File in temp dir should be deleted"
    );

    // Verify sidebar cleaned
    sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(!sidebarContent.includes("/commands/roundtrip-test/"));

    // Verify map cleaned
    map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    assert.ok(!("commands/roundtrip-test.mdx" in map));

    // Verify temp file is gone
    assert.ok(!fs.existsSync(path.join(commandsDir, "roundtrip-test.mdx")));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Prompt page management tests
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Prompt fixture helpers ──────────────────────────────────────────────────

/**
 * Minimal prompts.json matching the real structure, using one slug from each group.
 * Accepts extraPrompts to add additional entries.
 */
function makePromptsJson(extraPrompts = []) {
  return [
    { slug: "execute-task", name: "Execute Task", group: "auto-mode-pipeline" },
    { slug: "plan-milestone", name: "Plan Milestone", group: "auto-mode-pipeline" },
    { slug: "guided-execute-task", name: "Guided Execute Task", group: "guided-variants" },
    { slug: "discuss", name: "Discuss", group: "commands" },
    { slug: "system", name: "System", group: "foundation" },
    ...extraPrompts,
  ];
}

// ─── detectNewAndRemovedPrompts tests ────────────────────────────────────────

describe("detectNewAndRemovedPrompts", () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-prompts-detect-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function setup({ sourceMdFiles = [], pagesMdxFiles = [] }) {
    const sourceDir = path.join(tmpDir, "source-prompts");
    const pageDir = path.join(tmpDir, "prompts");
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.mkdirSync(pageDir, { recursive: true });

    for (const f of sourceMdFiles) {
      fs.writeFileSync(path.join(sourceDir, f), "# Prompt content\n");
    }
    for (const f of pagesMdxFiles) {
      fs.writeFileSync(path.join(pageDir, f), "---\ntitle: Test\n---\n");
    }

    return { promptsSourceDir: sourceDir, promptsPageDir: pageDir };
  }

  it("detects a new prompt when source .md exists but no .mdx page", () => {
    const { promptsSourceDir, promptsPageDir } = setup({
      sourceMdFiles: ["execute-task.md", "new-prompt.md"],
      pagesMdxFiles: ["execute-task.mdx"],
    });

    const result = detectNewAndRemovedPrompts({ promptsSourceDir, promptsPageDir });
    assert.ok(result.newPrompts.includes("new-prompt"), "new-prompt should be detected");
    assert.deepEqual(result.removedPrompts, []);
  });

  it("detects a removed prompt when .mdx page exists but no source .md", () => {
    const { promptsSourceDir, promptsPageDir } = setup({
      sourceMdFiles: ["execute-task.md"],
      pagesMdxFiles: ["execute-task.mdx", "old-prompt.mdx"],
    });

    const result = detectNewAndRemovedPrompts({ promptsSourceDir, promptsPageDir });
    assert.ok(result.removedPrompts.includes("old-prompt"), "old-prompt should be detected");
    assert.deepEqual(result.newPrompts, []);
  });

  it("returns empty arrays when all prompts match pages", () => {
    const { promptsSourceDir, promptsPageDir } = setup({
      sourceMdFiles: ["execute-task.md", "discuss.md"],
      pagesMdxFiles: ["execute-task.mdx", "discuss.mdx"],
    });

    const result = detectNewAndRemovedPrompts({ promptsSourceDir, promptsPageDir });
    assert.deepEqual(result.newPrompts, []);
    assert.deepEqual(result.removedPrompts, []);
  });

  it("returns sorted arrays", () => {
    const { promptsSourceDir, promptsPageDir } = setup({
      sourceMdFiles: ["zebra.md", "alpha.md", "middle.md"],
      pagesMdxFiles: [],
    });

    const result = detectNewAndRemovedPrompts({ promptsSourceDir, promptsPageDir });
    assert.deepEqual(result.newPrompts, ["alpha", "middle", "zebra"]);
  });

  it("detects both new and removed simultaneously", () => {
    const { promptsSourceDir, promptsPageDir } = setup({
      sourceMdFiles: ["execute-task.md", "brand-new.md"],
      pagesMdxFiles: ["execute-task.mdx", "old-removed.mdx"],
    });

    const result = detectNewAndRemovedPrompts({ promptsSourceDir, promptsPageDir });
    assert.ok(result.newPrompts.includes("brand-new"));
    assert.ok(result.removedPrompts.includes("old-removed"));
  });
});

// ─── addPromptSidebarEntry tests ─────────────────────────────────────────────

describe("addPromptSidebarEntry", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;
  /** @type {string} */
  let promptsJsonPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-prompt-sidebar-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    promptsJsonPath = path.join(tmpDir, "prompts.json");
    fs.writeFileSync(configPath, makeAstroConfig());
    fs.writeFileSync(promptsJsonPath, JSON.stringify(makePromptsJson()));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("inserts into the Auto-mode Pipeline sub-group for an auto-mode-pipeline prompt", () => {
    const promos = makePromptsJson([
      { slug: "test-auto-prompt", name: "Test Auto Prompt", group: "auto-mode-pipeline" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    const result = addPromptSidebarEntry("test-auto-prompt", { configPath, promptsJsonPath });
    assert.equal(result.added, true);
    assert.equal(result.group, "Auto-mode Pipeline");

    const content = fs.readFileSync(configPath, "utf-8");
    assert.ok(
      content.includes("link: '/prompts/test-auto-prompt/'"),
      "Link should be present in config"
    );

    const lines = content.split("\n");
    const autoModeIdx = lines.findIndex((l) => l.includes("'Auto-mode Pipeline'"));
    const entryIdx = lines.findIndex((l) => l.includes("/prompts/test-auto-prompt/"));
    const guidedIdx = lines.findIndex((l) => l.includes("'Guided Variants'"));
    assert.ok(entryIdx > autoModeIdx, "Entry should be after Auto-mode Pipeline label");
    assert.ok(entryIdx < guidedIdx, "Entry should be before Guided Variants label");
  });

  it("inserts into the Commands sub-group for a commands prompt", () => {
    const promos = makePromptsJson([
      { slug: "test-cmd-prompt", name: "Test Cmd Prompt", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    addPromptSidebarEntry("test-cmd-prompt", { configPath, promptsJsonPath });
    const content = fs.readFileSync(configPath, "utf-8");
    assert.ok(content.includes("link: '/prompts/test-cmd-prompt/'"));

    const lines = content.split("\n");
    const cmdSectionIdx = lines.findIndex((l) => l.includes("label: 'Commands'"));
    const entryIdx = lines.findIndex((l) => l.includes("/prompts/test-cmd-prompt/"));
    const foundationIdx = lines.findIndex((l) => l.includes("'Foundation'"));
    assert.ok(entryIdx > cmdSectionIdx, "Entry should be after Commands label");
    assert.ok(entryIdx < foundationIdx, "Entry should be before Foundation label");
  });

  it("inserts into the Foundation sub-group for a foundation prompt", () => {
    const promos = makePromptsJson([
      { slug: "new-foundation-prompt", name: "New Foundation", group: "foundation" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    addPromptSidebarEntry("new-foundation-prompt", { configPath, promptsJsonPath });
    const content = fs.readFileSync(configPath, "utf-8");
    assert.ok(content.includes("link: '/prompts/new-foundation-prompt/'"));
  });

  it("maintains alphabetical order within the sub-group", () => {
    const promos = makePromptsJson([
      { slug: "aaa-prompt", name: "AAA", group: "commands" },
      { slug: "zzz-prompt", name: "ZZZ", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    addPromptSidebarEntry("zzz-prompt", { configPath, promptsJsonPath });
    addPromptSidebarEntry("aaa-prompt", { configPath, promptsJsonPath });

    const content = fs.readFileSync(configPath, "utf-8");
    const lines = content.split("\n");
    const aaaIdx = lines.findIndex((l) => l.includes("/prompts/aaa-prompt/"));
    const zzzIdx = lines.findIndex((l) => l.includes("/prompts/zzz-prompt/"));
    assert.ok(aaaIdx < zzzIdx, "aaa-prompt should appear before zzz-prompt");
  });

  it("uses 16-space indentation", () => {
    const promos = makePromptsJson([
      { slug: "indent-test-prompt", name: "Indent Test", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    addPromptSidebarEntry("indent-test-prompt", { configPath, promptsJsonPath });
    const content = fs.readFileSync(configPath, "utf-8");
    const line = content.split("\n").find((l) => l.includes("/prompts/indent-test-prompt/"));
    assert.ok(line, "Line should exist");
    assert.ok(line.startsWith("                "), "Should have 16-space indent");
    assert.ok(!line.startsWith("                 "), "Should not have 17-space indent");
  });

  it("has correct label/link format", () => {
    const promos = makePromptsJson([
      { slug: "format-test-prompt", name: "Format Test", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    addPromptSidebarEntry("format-test-prompt", { configPath, promptsJsonPath });
    const content = fs.readFileSync(configPath, "utf-8");
    assert.ok(
      content.includes("{ label: 'format-test-prompt', link: '/prompts/format-test-prompt/' },"),
      "Label/link format should match expected pattern"
    );
  });

  it("throws when slug is not found in prompts.json", () => {
    assert.throws(
      () => addPromptSidebarEntry("nonexistent-slug", { configPath, promptsJsonPath }),
      /not found in prompts\.json/
    );
  });
});

// ─── removePromptSidebarEntry tests ──────────────────────────────────────────

describe("removePromptSidebarEntry", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-prompt-sidebar-rm-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    fs.writeFileSync(configPath, makeAstroConfig());
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes an entry from the Auto-mode Pipeline sub-group", () => {
    const before = fs.readFileSync(configPath, "utf-8");
    assert.ok(before.includes("/prompts/execute-task/"), "Sanity: execute-task exists");

    const result = removePromptSidebarEntry("execute-task", { configPath });
    assert.deepEqual(result, { removed: true, slug: "execute-task" });

    const after = fs.readFileSync(configPath, "utf-8");
    assert.ok(!after.includes("/prompts/execute-task/"), "execute-task should be removed");
    assert.ok(after.includes("/prompts/complete-milestone/"), "complete-milestone should remain");
  });

  it("removes an entry from the Commands sub-group", () => {
    const before = fs.readFileSync(configPath, "utf-8");
    assert.ok(before.includes("/prompts/discuss/"), "Sanity: discuss exists");

    const result = removePromptSidebarEntry("discuss", { configPath });
    assert.deepEqual(result, { removed: true, slug: "discuss" });

    const after = fs.readFileSync(configPath, "utf-8");
    assert.ok(!after.includes("/prompts/discuss/"), "discuss should be removed");
  });

  it("removes an entry from the Foundation sub-group", () => {
    const result = removePromptSidebarEntry("system", { configPath });
    assert.deepEqual(result, { removed: true, slug: "system" });

    const after = fs.readFileSync(configPath, "utf-8");
    assert.ok(!after.includes("/prompts/system/"), "system should be removed");
  });

  it("returns removed: false for nonexistent slug", () => {
    const result = removePromptSidebarEntry("nonexistent-prompt", { configPath });
    assert.deepEqual(result, { removed: false, slug: "nonexistent-prompt", reason: "not found" });
  });

  it("does not affect command sidebar entries", () => {
    removePromptSidebarEntry("discuss", { configPath });
    const after = fs.readFileSync(configPath, "utf-8");
    assert.ok(after.includes("/commands/auto/"), "Command entries should remain");
    assert.ok(after.includes("'Keyboard Shortcuts'"), "Keyboard Shortcuts should remain");
  });
});

// ─── createNewPromptPages tests ───────────────────────────────────────────────

describe("createNewPromptPages", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;
  /** @type {string} */
  let promptsJsonPath;
  /** @type {string} */
  let promptsDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-create-prompts-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    promptsJsonPath = path.join(tmpDir, "prompts.json");
    promptsDir = path.join(tmpDir, "prompts");

    fs.writeFileSync(configPath, makeAstroConfig());
    fs.mkdirSync(promptsDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates a scaffold MDX file and sidebar entry for a new prompt", () => {
    const promos = makePromptsJson([
      { slug: "test-create-prompt", name: "Test Create", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    const result = createNewPromptPages(["test-create-prompt"], {
      configPath,
      promptsJsonPath,
      promptsDir,
    });

    assert.equal(result.created, 1);
    assert.equal(result.failed, 0);

    const entry = result.results[0];
    assert.equal(entry.slug, "test-create-prompt");
    assert.ok(entry.sidebar?.added, "Sidebar entry should be added");

    const pagePath = path.join(promptsDir, "test-create-prompt.mdx");
    assert.ok(fs.existsSync(pagePath), "Scaffold .mdx file should exist");

    const content = fs.readFileSync(pagePath, "utf-8");
    assert.ok(content.startsWith("---\n"), "Should have frontmatter");
    assert.ok(content.includes('title: "test-create-prompt"'), "Should have title");
    assert.ok(content.includes("Prompt reference: test-create-prompt"), "Should have description");
    assert.ok(content.includes("scaffold"), "Should indicate scaffold status");

    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(sidebarContent.includes("/prompts/test-create-prompt/"), "Sidebar should have the link");
  });

  it("does NOT add to page-source-map (handled by build-page-map.mjs)", () => {
    const promos = makePromptsJson([
      { slug: "test-no-map-prompt", name: "Test No Map", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    const result = createNewPromptPages(["test-no-map-prompt"], {
      configPath,
      promptsJsonPath,
      promptsDir,
    });

    assert.equal(result.created, 1);
    assert.ok(!result.results[0].map, "Should have no map entry in result");
  });

  it("skips all writes in dryRun mode", () => {
    const promos = makePromptsJson([
      { slug: "test-dryrun-prompt", name: "Test Dry Run", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    const result = createNewPromptPages(["test-dryrun-prompt"], {
      dryRun: true,
      configPath,
      promptsJsonPath,
      promptsDir,
    });

    assert.equal(result.created, 1);
    assert.equal(result.results[0].sidebar, null, "Sidebar should not be updated in dryRun");

    assert.ok(
      !fs.existsSync(path.join(promptsDir, "test-dryrun-prompt.mdx")),
      "Scaffold file should NOT exist in dryRun"
    );

    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(!sidebarContent.includes("test-dryrun-prompt"), "Sidebar should be unchanged");
  });

  it("processes multiple new prompts", () => {
    const promos = makePromptsJson([
      { slug: "multi-prompt-a", name: "Multi A", group: "commands" },
      { slug: "multi-prompt-b", name: "Multi B", group: "commands" },
    ]);
    fs.writeFileSync(promptsJsonPath, JSON.stringify(promos));

    const result = createNewPromptPages(["multi-prompt-a", "multi-prompt-b"], {
      configPath,
      promptsJsonPath,
      promptsDir,
    });

    assert.equal(result.created, 2);
    assert.equal(result.failed, 0);

    assert.ok(fs.existsSync(path.join(promptsDir, "multi-prompt-a.mdx")));
    assert.ok(fs.existsSync(path.join(promptsDir, "multi-prompt-b.mdx")));

    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(sidebarContent.includes("/prompts/multi-prompt-a/"));
    assert.ok(sidebarContent.includes("/prompts/multi-prompt-b/"));
  });
});

// ─── removePromptPages tests ──────────────────────────────────────────────────

describe("removePromptPages", () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let configPath;
  /** @type {string} */
  let promptsDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "manage-pages-remove-prompts-"));
    configPath = path.join(tmpDir, "astro.config.mjs");
    promptsDir = path.join(tmpDir, "prompts");

    fs.writeFileSync(configPath, makeAstroConfig());
    fs.mkdirSync(promptsDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("deletes file and removes sidebar entry", () => {
    fs.writeFileSync(
      path.join(promptsDir, "discuss.mdx"),
      "---\ntitle: discuss\n---\n"
    );

    const result = removePromptPages(["discuss"], { configPath, promptsDir });

    assert.equal(result.removed, 1);
    assert.equal(result.failed, 0);

    const entry = result.results[0];
    assert.equal(entry.slug, "discuss");
    assert.equal(entry.fileDeleted, true);
    assert.ok(entry.sidebar?.removed, "Sidebar entry should be removed");

    assert.ok(!fs.existsSync(path.join(promptsDir, "discuss.mdx")));

    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(!sidebarContent.includes("/prompts/discuss/"));
  });

  it("handles missing file gracefully and still removes sidebar entry", () => {
    const result = removePromptPages(["discuss"], { configPath, promptsDir });

    assert.equal(result.removed, 1, "Should still count as removed");
    assert.equal(result.results[0].fileDeleted, false, "File was not deleted (didn't exist)");
    assert.ok(result.results[0].sidebar?.removed, "Sidebar entry should be removed");
  });

  it("processes multiple removals", () => {
    fs.writeFileSync(path.join(promptsDir, "discuss.mdx"), "---\ntitle: discuss\n---\n");
    fs.writeFileSync(path.join(promptsDir, "execute-task.mdx"), "---\ntitle: execute-task\n---\n");

    const result = removePromptPages(["discuss", "execute-task"], {
      configPath,
      promptsDir,
    });

    assert.equal(result.removed, 2);
    assert.equal(result.failed, 0);

    assert.ok(!fs.existsSync(path.join(promptsDir, "discuss.mdx")));
    assert.ok(!fs.existsSync(path.join(promptsDir, "execute-task.mdx")));

    const sidebarContent = fs.readFileSync(configPath, "utf-8");
    assert.ok(!sidebarContent.includes("/prompts/discuss/"));
    assert.ok(!sidebarContent.includes("/prompts/execute-task/"));
  });
});
