/**
 * tests/extract.test.mjs — Structural assertions for the content extraction pipeline.
 * Uses Node.js built-in test runner (node:test + node:assert).
 *
 * Run: node --test tests/extract.test.mjs
 */

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { extractLocal, resolvePackagePath } from "../scripts/lib/extract-local.mjs";

const OUTPUT_DIR = path.join(process.cwd(), "content", "generated");

// Run extraction once before all tests
let result;
before(async () => {
  result = await extractLocal({});
});

// ── Skills ─────────────────────────────────────────────────────────────────

describe("skills extraction", () => {
  it("produces skills.json with ≥8 entries", () => {
    const skills = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "skills.json"), "utf8"));
    assert.ok(skills.length >= 8, `Expected ≥8 skills, got ${skills.length}`);
  });

  it("each skill has name and description", () => {
    const skills = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "skills.json"), "utf8"));
    for (const skill of skills) {
      assert.ok(skill.name, `Skill missing name: ${JSON.stringify(skill)}`);
      assert.ok(skill.description, `Skill "${skill.name}" missing description`);
    }
  });

  it("each skill has a path field", () => {
    const skills = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "skills.json"), "utf8"));
    for (const skill of skills) {
      assert.ok(skill.path, `Skill "${skill.name}" missing path`);
    }
  });

  it("includes nested reference skills with parentSkill field", () => {
    const skills = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "skills.json"), "utf8"));
    const nested = skills.filter((s) => s.parentSkill);
    assert.ok(nested.length >= 1, `Expected ≥1 nested skill, got ${nested.length}`);
    const gh = nested.find((s) => s.name === "gh");
    assert.ok(gh, "Expected nested 'gh' skill under github-workflows");
    assert.equal(gh.parentSkill, "github-workflows");
  });

  it("skills with structured sections have objective field", () => {
    const skills = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "skills.json"), "utf8"));
    const withObjective = skills.filter((s) => s.objective);
    assert.ok(withObjective.length >= 1, "Expected at least one skill with objective");
  });
});

// ── Agents ─────────────────────────────────────────────────────────────────

describe("agents extraction", () => {
  it("produces agents.json with ≥5 entries", () => {
    const agents = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "agents.json"), "utf8"));
    assert.ok(agents.length >= 5, `Expected ≥5 agents, got ${agents.length}`);
  });

  it("each agent has name, description, and summary", () => {
    const agents = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "agents.json"), "utf8"));
    for (const agent of agents) {
      assert.ok(agent.name, `Agent missing name: ${JSON.stringify(agent)}`);
      assert.ok(agent.description, `Agent "${agent.name}" missing description`);
      assert.ok(agent.summary, `Agent "${agent.name}" missing summary`);
    }
  });

  it("includes expected agent names", () => {
    const agents = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "agents.json"), "utf8"));
    const names = agents.map((a) => a.name);
    for (const expected of ["scout", "researcher", "worker", "javascript-pro", "typescript-pro"]) {
      assert.ok(names.includes(expected), `Missing expected agent: ${expected}`);
    }
  });
});

// ── Extensions ─────────────────────────────────────────────────────────────

describe("extensions extraction", () => {
  it("produces extensions.json with ≥14 entries", () => {
    const exts = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "extensions.json"), "utf8"));
    assert.ok(exts.length >= 14, `Expected ≥14 extensions, got ${exts.length}`);
  });

  it("each extension has name and tools array", () => {
    const exts = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "extensions.json"), "utf8"));
    for (const ext of exts) {
      assert.ok(ext.name, `Extension missing name: ${JSON.stringify(ext)}`);
      assert.ok(Array.isArray(ext.tools), `Extension "${ext.name}" tools is not an array`);
    }
  });

  it("excludes shared/ directory", () => {
    const exts = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "extensions.json"), "utf8"));
    const shared = exts.find((e) => e.name === "shared");
    assert.equal(shared, undefined, "shared/ should be excluded from extensions");
  });

  it("extensions with tools have name and description in each tool", () => {
    const exts = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "extensions.json"), "utf8"));
    for (const ext of exts) {
      for (const tool of ext.tools) {
        assert.ok(tool.name, `Tool in "${ext.name}" missing name`);
        assert.ok(typeof tool.description === "string", `Tool "${tool.name}" in "${ext.name}" missing description`);
      }
    }
  });

  it("browser-tools has many tools (≥40)", () => {
    const exts = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "extensions.json"), "utf8"));
    const browser = exts.find((e) => e.name === "browser-tools");
    assert.ok(browser, "browser-tools extension not found");
    assert.ok(browser.tools.length >= 40, `Expected ≥40 browser tools, got ${browser.tools.length}`);
  });

  it("most extensions have a description", () => {
    const exts = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "extensions.json"), "utf8"));
    const withDesc = exts.filter((e) => e.description.length > 0);
    assert.ok(withDesc.length >= 14, `Expected ≥14 extensions with descriptions, got ${withDesc.length}`);
  });
});

// ── Package path resolution ────────────────────────────────────────────────

describe("package path resolution", () => {
  it("resolves the package dynamically", () => {
    const pkgPath = resolvePackagePath();
    assert.ok(fs.existsSync(pkgPath), `Package path does not exist: ${pkgPath}`);
    assert.ok(
      fs.existsSync(path.join(pkgPath, "src", "resources")),
      "Package missing src/resources/"
    );
  });

  it("throws for invalid override path", () => {
    assert.throws(
      () => resolvePackagePath("/nonexistent/path"),
      /gsd-pi package not found/,
      "Should throw for invalid path"
    );
  });
});

// ── Output files ───────────────────────────────────────────────────────────

describe("output files", () => {
  it("skills.json exists and is valid JSON", () => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "skills.json"), "utf8");
    const parsed = JSON.parse(content);
    assert.ok(Array.isArray(parsed));
  });

  it("agents.json exists and is valid JSON", () => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "agents.json"), "utf8");
    const parsed = JSON.parse(content);
    assert.ok(Array.isArray(parsed));
  });

  it("extensions.json exists and is valid JSON", () => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "extensions.json"), "utf8");
    const parsed = JSON.parse(content);
    assert.ok(Array.isArray(parsed));
  });
});

// ── GitHub Docs ────────────────────────────────────────────────────────────

describe("github docs extraction", () => {
  const docsDir = path.join(OUTPUT_DIR, "docs");

  /**
   * Recursively count .md files in a directory.
   */
  function countMdFiles(dir) {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += countMdFiles(full);
      } else if (entry.name.endsWith(".md")) {
        count++;
      }
    }
    return count;
  }

  it("content/generated/docs/ contains ≥100 .md files", () => {
    const count = countMdFiles(docsDir);
    assert.ok(count >= 100, `Expected ≥100 docs, got ${count}`);
  });

  it("doc files preserve subdirectory structure", () => {
    const expectedDirs = [
      "building-coding-agents",
      "context-and-hooks",
      "extending-pi",
      "pi-ui-tui",
      "what-is-pi",
    ];
    for (const dir of expectedDirs) {
      const dirPath = path.join(docsDir, dir);
      assert.ok(
        fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory(),
        `Expected subdirectory docs/${dir}/ to exist`
      );
    }
  });

  it("content/generated/readme.md exists and has >100 characters", () => {
    const readmePath = path.join(OUTPUT_DIR, "readme.md");
    assert.ok(fs.existsSync(readmePath), "readme.md does not exist");
    const content = fs.readFileSync(readmePath, "utf8");
    assert.ok(content.length > 100, `readme.md too short: ${content.length} chars`);
  });
});

// ── Releases ───────────────────────────────────────────────────────────────

describe("releases extraction", () => {
  let releases;

  before(() => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "releases.json"), "utf8");
    releases = JSON.parse(content);
  });

  it("releases.json has ≥48 entries", () => {
    assert.ok(releases.length >= 48, `Expected ≥48 releases, got ${releases.length}`);
  });

  it("each release has tag_name and published_at", () => {
    for (const release of releases) {
      assert.ok(release.tag_name, `Release missing tag_name: ${JSON.stringify(release).slice(0, 80)}`);
      assert.ok(release.published_at, `Release "${release.tag_name}" missing published_at`);
    }
  });

  it("at least some releases have non-empty added arrays", () => {
    const withAdded = releases.filter((r) => r.added && r.added.length > 0);
    assert.ok(
      withAdded.length >= 1,
      `Expected at least 1 release with non-empty added array, got ${withAdded.length}`
    );
  });

  it("each release has html_url and body fields", () => {
    for (const release of releases) {
      assert.ok(release.html_url, `Release "${release.tag_name}" missing html_url`);
      assert.ok(typeof release.body === "string", `Release "${release.tag_name}" body is not a string`);
    }
  });
});

// ── Manifest ───────────────────────────────────────────────────────────────

describe("manifest", () => {
  let manifest;

  before(() => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "manifest.json"), "utf8");
    manifest = JSON.parse(content);
  });

  it("manifest.json has files object with ≥100 entries", () => {
    assert.ok(manifest.files, "manifest missing files object");
    const count = Object.keys(manifest.files).length;
    assert.ok(count >= 100, `Expected ≥100 file entries, got ${count}`);
  });

  it("manifest has headSha field", () => {
    assert.ok(manifest.headSha, "manifest missing headSha");
    assert.ok(manifest.headSha.length >= 7, `headSha too short: ${manifest.headSha}`);
  });

  it("manifest has generatedAt field", () => {
    assert.ok(manifest.generatedAt, "manifest missing generatedAt");
    // Should be a valid ISO date
    const date = new Date(manifest.generatedAt);
    assert.ok(!isNaN(date.getTime()), `generatedAt is not a valid date: ${manifest.generatedAt}`);
  });

  it("manifest has version field", () => {
    assert.ok(manifest.version !== undefined, "manifest missing version");
  });
});

// ── Commands ───────────────────────────────────────────────────────────────

describe("commands extraction", () => {
  let commands;

  before(() => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "commands.json"), "utf8");
    commands = JSON.parse(content);
  });

  it("commands.json exists and has entries", () => {
    assert.ok(Array.isArray(commands), "commands.json is not an array");
    assert.ok(commands.length > 0, "commands.json is empty");
  });

  it("each command has command, description, and category fields", () => {
    for (const cmd of commands) {
      assert.ok(cmd.command, `Command missing command field: ${JSON.stringify(cmd)}`);
      assert.ok(cmd.description, `Command "${cmd.command}" missing description`);
      assert.ok(cmd.category, `Command "${cmd.command}" missing category`);
    }
  });

  it("commands span multiple categories", () => {
    const categories = new Set(commands.map((c) => c.category));
    assert.ok(
      categories.size >= 3,
      `Expected ≥3 categories, got ${categories.size}: ${[...categories].join(", ")}`
    );
    // Verify some expected categories
    const expected = ["Session Commands", "CLI Flags"];
    for (const cat of expected) {
      assert.ok(categories.has(cat), `Missing expected category: ${cat}`);
    }
  });

  it("includes slash commands and CLI flags", () => {
    const slashCmds = commands.filter((c) => c.command.startsWith("/"));
    assert.ok(slashCmds.length >= 1, "Expected at least one slash command");

    const flags = commands.filter(
      (c) => c.command.startsWith("gsd --") || c.command.startsWith("gsd config")
    );
    assert.ok(flags.length >= 1, "Expected at least one CLI flag command");
  });

  it("includes keyboard shortcuts", () => {
    const shortcuts = commands.filter((c) => c.category === "Keyboard Shortcuts");
    assert.ok(shortcuts.length >= 1, "Expected at least one keyboard shortcut");
  });
});

// ── Prompts ────────────────────────────────────────────────────────────────

describe("prompts extraction", () => {
  let prompts;

  before(() => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "prompts.json"), "utf8");
    prompts = JSON.parse(content);
  });

  it("prompts.json exists and is valid JSON", () => {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, "prompts.json"), "utf8");
    assert.doesNotThrow(() => JSON.parse(content), "prompts.json is not valid JSON");
    const parsed = JSON.parse(content);
    assert.ok(Array.isArray(parsed), "prompts.json should be an array");
  });

  it("contains exactly 32 prompts", () => {
    assert.equal(prompts.length, 32, `Expected 32 prompts, got ${prompts.length}`);
  });

  it("every prompt has required fields with correct types", () => {
    const validGroups = ["auto-mode-pipeline", "guided-variants", "commands", "foundation"];
    for (const entry of prompts) {
      assert.ok(typeof entry.name === "string" && entry.name.length > 0,
        `Prompt missing non-empty name: ${JSON.stringify(entry)}`);
      assert.ok(typeof entry.slug === "string" && entry.slug.length > 0,
        `Prompt "${entry.name}" missing non-empty slug`);
      assert.ok(validGroups.includes(entry.group),
        `Prompt "${entry.name}" has invalid group: "${entry.group}" (must be one of ${validGroups.join(", ")})`);
      assert.ok(Array.isArray(entry.variables),
        `Prompt "${entry.name}" variables is not an array`);
      assert.ok(typeof entry.pipelinePosition === "string" && entry.pipelinePosition.length > 0,
        `Prompt "${entry.name}" missing non-empty pipelinePosition`);
      assert.ok(Array.isArray(entry.usedByCommands),
        `Prompt "${entry.name}" usedByCommands is not an array`);
    }
  });

  it("group distribution matches taxonomy (10+8+13+1)", () => {
    const counts = {};
    for (const entry of prompts) {
      counts[entry.group] = (counts[entry.group] ?? 0) + 1;
    }
    assert.equal(counts["auto-mode-pipeline"], 10,
      `Expected 10 auto-mode-pipeline prompts, got ${counts["auto-mode-pipeline"]}`);
    assert.equal(counts["guided-variants"], 8,
      `Expected 8 guided-variants prompts, got ${counts["guided-variants"]}`);
    assert.equal(counts["commands"], 13,
      `Expected 13 commands prompts, got ${counts["commands"]}`);
    assert.equal(counts["foundation"], 1,
      `Expected 1 foundation prompt, got ${counts["foundation"]}`);
  });

  it("system prompt has zero variables", () => {
    const system = prompts.find((p) => p.name === "system");
    assert.ok(system, "Could not find prompt with name='system'");
    assert.equal(system.variables.length, 0,
      `Expected system prompt to have 0 variables, got ${system.variables.length}`);
  });

  it("execute-task prompt has 16 variables", () => {
    const executeTask = prompts.find((p) => p.name === "execute-task");
    assert.ok(executeTask, "Could not find prompt with name='execute-task'");
    assert.equal(executeTask.variables.length, 16,
      `Expected execute-task to have 16 variables, got ${executeTask.variables.length}`);
  });

  it("variable objects have name, description, and required fields", () => {
    const executeTask = prompts.find((p) => p.name === "execute-task");
    assert.ok(executeTask, "Could not find execute-task prompt");
    for (const variable of executeTask.variables) {
      assert.ok(typeof variable.name === "string" && variable.name.length > 0,
        `Variable missing non-empty name: ${JSON.stringify(variable)}`);
      assert.ok(typeof variable.description === "string" && variable.description.length > 0,
        `Variable "${variable.name}" missing non-empty description`);
      assert.ok(typeof variable.required === "boolean",
        `Variable "${variable.name}" required field is not a boolean`);
    }
  });

  it("usedByCommands entries are strings", () => {
    for (const entry of prompts) {
      if (entry.usedByCommands.length === 0) continue;
      for (const cmd of entry.usedByCommands) {
        assert.ok(typeof cmd === "string",
          `Prompt "${entry.name}" usedByCommands contains non-string: ${JSON.stringify(cmd)}`);
      }
    }
  });

  it("slug matches name for all prompts", () => {
    for (const entry of prompts) {
      assert.equal(entry.slug, entry.name,
        `Prompt slug "${entry.slug}" does not match name "${entry.name}"`);
    }
  });
});

// ── End-to-end ─────────────────────────────────────────────────────────────

describe("end-to-end orchestrator", () => {
  it("node scripts/extract.mjs exits with code 0", () => {
    const result = execSync("node scripts/extract.mjs", {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 60_000,
    });
    assert.ok(result.includes("[orchestrator]"), "Output should include orchestrator prefix");
    assert.ok(result.includes("Done in"), "Output should include completion message");
  });

  it("all 8 output artifacts are present", () => {
    const expected = [
      "skills.json",
      "agents.json",
      "extensions.json",
      "commands.json",
      "releases.json",
      "manifest.json",
      "readme.md",
    ];
    for (const file of expected) {
      const filePath = path.join(OUTPUT_DIR, file);
      assert.ok(fs.existsSync(filePath), `Missing output file: ${file}`);
    }
    // docs/ directory with content
    const docsDir = path.join(OUTPUT_DIR, "docs");
    assert.ok(fs.existsSync(docsDir) && fs.statSync(docsDir).isDirectory(), "docs/ directory missing");
  });

  it("all JSON files are valid JSON", () => {
    const jsonFiles = ["skills.json", "agents.json", "extensions.json", "commands.json", "releases.json", "manifest.json", "prompts.json"];
    for (const file of jsonFiles) {
      const content = fs.readFileSync(path.join(OUTPUT_DIR, file), "utf8");
      assert.doesNotThrow(() => JSON.parse(content), `${file} is not valid JSON`);
    }
  });

  it("second run is idempotent (manifest diff shows 0 changes)", () => {
    // Run extraction again
    const output = execSync("node scripts/extract.mjs", {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 60_000,
    });
    // Manifest should show no changes
    assert.ok(output.includes("0 added, 0 changed, 0 removed"), "Second run should show no manifest changes");
    // Should show cache hit
    assert.ok(output.includes("Cache hit"), "Second run should show cache hit for tarball");
  });
});
