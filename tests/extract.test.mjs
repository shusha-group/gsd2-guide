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
