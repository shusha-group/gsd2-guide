/**
 * tests/regenerate-page.test.mjs — Tests for page regeneration via claude -p subprocess.
 *
 * Test strategy:
 *   1. Unit tests: parseStreamJson(), findClaude() — test exported functions directly
 *   2. Integration tests: regeneratePage() with mock-claude.sh via options.claudePath
 *   3. Batch tests: regenerateStalePages() with fixture stale-pages.json
 *
 * Mock subprocess: tests/fixtures/mock-claude.sh responds to --version, reads stdin,
 * emits canned stream-json, and optionally writes MDX files. Behaviour is controlled
 * via env vars (MOCK_EXIT_CODE, MOCK_WRITE_PATH, MOCK_BAD_FRONTMATTER, etc.).
 *
 * Run: node --test tests/regenerate-page.test.mjs
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import {
  regeneratePage,
  regenerateStalePages,
  findClaude,
  parseStreamJson,
} from "../scripts/lib/regenerate-page.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const MOCK_CLAUDE = path.resolve(__dirname, "fixtures", "mock-claude.sh");

// ── parseStreamJson unit tests ─────────────────────────────────────────────

describe("parseStreamJson", () => {
  it("extracts model from system/init event", () => {
    const stdout = [
      '{"type":"system","subtype":"init","model":"claude-sonnet-4-20250514"}',
      '{"type":"result","subtype":"success","duration_ms":5000,"result":"Done."}',
    ].join("\n");

    const result = parseStreamJson(stdout);
    assert.strictEqual(result.model, "claude-sonnet-4-20250514");
  });

  it("extracts duration_ms from result event", () => {
    const stdout = [
      '{"type":"system","subtype":"init","model":"claude-sonnet-4-20250514"}',
      '{"type":"result","subtype":"success","duration_ms":5000,"result":"Done."}',
    ].join("\n");

    const result = parseStreamJson(stdout);
    assert.strictEqual(result.durationMs, 5000);
    assert.strictEqual(result.subtype, "success");
    assert.strictEqual(result.resultText, "Done.");
  });

  it("detects error subtype from result event", () => {
    const stdout = [
      '{"type":"system","subtype":"init","model":"claude-sonnet-4-20250514"}',
      '{"type":"result","subtype":"error_max_turns","duration_ms":3000,"result":"Max turns reached."}',
    ].join("\n");

    const result = parseStreamJson(stdout);
    assert.strictEqual(result.subtype, "error_max_turns");
    assert.strictEqual(result.resultText, "Max turns reached.");
  });

  it("skips non-JSON lines (hook output) without error", () => {
    const stdout = [
      '{"type":"system","subtype":"init","model":"claude-sonnet-4-20250514"}',
      "hook: pre-tool check passed",
      '{"type":"assistant","message":{"content":[{"type":"text","text":"working"}]}}',
      "hook: post-tool cleanup",
      '{"type":"result","subtype":"success","duration_ms":2000,"result":"OK"}',
    ].join("\n");

    const result = parseStreamJson(stdout);
    assert.strictEqual(result.model, "claude-sonnet-4-20250514");
    assert.strictEqual(result.durationMs, 2000);
  });

  it("handles empty stdout gracefully", () => {
    const result = parseStreamJson("");
    assert.strictEqual(result.model, "unknown");
    assert.strictEqual(result.durationMs, 0);
    assert.strictEqual(result.subtype, "unknown");
  });

  it("handles null/undefined stdout gracefully", () => {
    const result = parseStreamJson(null);
    assert.strictEqual(result.model, "unknown");
    assert.strictEqual(result.durationMs, 0);
  });
});

// ── findClaude unit tests ──────────────────────────────────────────────────

describe("findClaude", () => {
  it("returns true when claude CLI is available (default path)", () => {
    // In this dev environment, 'claude' should be installed
    const result = findClaude();
    assert.strictEqual(result, true, "claude CLI should be available in dev environment");
  });

  it("returns false when claudePath points to nonexistent binary", () => {
    const result = findClaude("/nonexistent/path/to/claude-binary");
    assert.strictEqual(result, false);
  });

  it("returns true when claudePath points to mock-claude.sh", () => {
    // mock-claude.sh handles --version, so findClaude should accept it
    const result = findClaude(MOCK_CLAUDE);
    assert.strictEqual(result, true, "mock-claude.sh should respond to --version");
  });
});

// ── Prompt construction tests (indirect via mock subprocess stdin) ──────────

describe("prompt construction (via mock subprocess stdin capture)", () => {
  let tmpDir;
  let stdinCapturePath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "regen-prompt-"));
    stdinCapturePath = path.join(tmpDir, "captured-stdin.txt");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("user message contains the pagePath and source file list", async () => {
    // Set up env to capture stdin and write valid MDX
    const pagePath = "commands/test-prompt.mdx";
    const pageFullPath = path.join(ROOT, "src", "content", "docs", pagePath);

    const env = {
      ...process.env,
      MOCK_CAPTURE_STDIN: stdinCapturePath,
      MOCK_WRITE_PATH: pageFullPath,
    };

    // Temporarily set env for the subprocess
    const origEnv = { ...process.env };
    Object.assign(process.env, env);

    try {
      const result = await regeneratePage(
        pagePath,
        ["src/commands/test.ts", "src/lib/helper.ts"],
        { claudePath: MOCK_CLAUDE }
      );

      // Read back captured stdin
      const stdin = fs.readFileSync(stdinCapturePath, "utf8");
      assert.ok(stdin.includes(pagePath), "stdin should contain pagePath");
      assert.ok(stdin.includes("src/commands/test.ts"), "stdin should list source files");
      assert.ok(stdin.includes("src/lib/helper.ts"), "stdin should list all source files");
    } finally {
      // Restore env and clean up written file
      process.env = origEnv;
      try { fs.unlinkSync(pageFullPath); } catch {}
    }
  });

  it("reference page with >50 deps gets curated source list (dep capping)", async () => {
    const pagePath = "reference/skills.mdx";
    const pageFullPath = path.join(ROOT, "src", "content", "docs", pagePath);

    // Generate >50 fake deps
    const manyDeps = Array.from({ length: 60 }, (_, i) => `src/dep-${i}.ts`);

    const env = {
      ...process.env,
      MOCK_CAPTURE_STDIN: stdinCapturePath,
      MOCK_WRITE_PATH: pageFullPath,
    };

    const origEnv = { ...process.env };
    Object.assign(process.env, env);

    try {
      await regeneratePage(pagePath, manyDeps, { claudePath: MOCK_CLAUDE });

      const stdin = fs.readFileSync(stdinCapturePath, "utf8");
      // Should contain the curated path instead of 60 individual deps
      assert.ok(
        stdin.includes("content/generated/skills.json"),
        "should substitute curated skills.json path"
      );
      // Should NOT contain the individual dep paths
      assert.ok(
        !stdin.includes("src/dep-0.ts"),
        "should not contain individual deps when capped"
      );
    } finally {
      process.env = origEnv;
      try { fs.unlinkSync(pageFullPath); } catch {}
    }
  });
});

// ── regeneratePage integration tests with mock subprocess ──────────────────

describe("regeneratePage (mock subprocess)", () => {
  it("returns success result with pagePath, model, durationMs", async () => {
    const pagePath = "commands/test-regen.mdx";
    const pageFullPath = path.join(ROOT, "src", "content", "docs", pagePath);

    const origEnv = { ...process.env };
    process.env.MOCK_WRITE_PATH = pageFullPath;
    process.env.MOCK_MODEL = "claude-sonnet-4-20250514";
    process.env.MOCK_DURATION_MS = "4567";

    try {
      const result = await regeneratePage(pagePath, ["src/test.ts"], {
        claudePath: MOCK_CLAUDE,
      });

      assert.strictEqual(result.pagePath, pagePath);
      assert.strictEqual(result.model, "claude-sonnet-4-20250514");
      assert.strictEqual(result.durationMs, 4567);
      assert.strictEqual(result.error, undefined, "should not have error");
    } finally {
      process.env = origEnv;
      try { fs.unlinkSync(pageFullPath); } catch {}
    }
  });

  it("returns error result when subprocess exits non-zero", async () => {
    const origEnv = { ...process.env };
    process.env.MOCK_EXIT_CODE = "1";
    process.env.MOCK_STDERR = "Something went wrong";

    try {
      const result = await regeneratePage("commands/test-error.mdx", ["src/test.ts"], {
        claudePath: MOCK_CLAUDE,
      });

      assert.strictEqual(result.error, "subprocess failed");
      assert.strictEqual(result.pagePath, "commands/test-error.mdx");
      assert.ok(result.details.includes("Something went wrong"), "should capture stderr");
    } finally {
      process.env = origEnv;
    }
  });

  it("returns skipped result when claudePath points to nonexistent binary", async () => {
    const result = await regeneratePage("commands/test-skip.mdx", ["src/test.ts"], {
      claudePath: "/nonexistent/claude-binary",
    });

    assert.strictEqual(result.skipped, true);
    assert.strictEqual(result.reason, "claude CLI not available");
  });

  it("returns error on invalid frontmatter in written file", async () => {
    const pagePath = "commands/test-badfm.mdx";
    const pageFullPath = path.join(ROOT, "src", "content", "docs", pagePath);

    const origEnv = { ...process.env };
    process.env.MOCK_WRITE_PATH = pageFullPath;
    process.env.MOCK_BAD_FRONTMATTER = "1";

    try {
      const result = await regeneratePage(pagePath, ["src/test.ts"], {
        claudePath: MOCK_CLAUDE,
      });

      assert.strictEqual(result.error, "invalid frontmatter");
      assert.strictEqual(result.pagePath, pagePath);
      assert.ok(result.model, "should include model even on frontmatter error");
      assert.ok(result.durationMs !== undefined, "should include durationMs even on error");
    } finally {
      process.env = origEnv;
      try { fs.unlinkSync(pageFullPath); } catch {}
    }
  });

  it("dryRun skips file validation", async () => {
    const result = await regeneratePage("commands/test-dryrun.mdx", ["src/test.ts"], {
      claudePath: MOCK_CLAUDE,
      dryRun: true,
    });

    // dryRun mode doesn't try to read the file back
    assert.strictEqual(result.pagePath, "commands/test-dryrun.mdx");
    assert.ok(result.model, "should have model from stream-json");
    assert.strictEqual(result.error, undefined, "dryRun should not error on missing file");
  });
});

// ── regenerateStalePages batch tests ───────────────────────────────────────

describe("regenerateStalePages", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "regen-batch-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns skip when stale-pages.json has empty stalePages", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "stale-pages.json"),
      JSON.stringify({ stalePages: [], reasons: {} })
    );
    fs.writeFileSync(
      path.join(tmpDir, "page-source-map.json"),
      JSON.stringify({})
    );

    const result = await regenerateStalePages({ generatedDir: tmpDir });
    assert.strictEqual(result.skipped, true);
    assert.strictEqual(result.reason, "no stale pages");
  });

  it("processes stale pages sequentially and aggregates results", async () => {
    const pages = ["commands/alpha.mdx", "commands/beta.mdx"];

    fs.writeFileSync(
      path.join(tmpDir, "stale-pages.json"),
      JSON.stringify({ stalePages: pages, reasons: {} })
    );
    fs.writeFileSync(
      path.join(tmpDir, "page-source-map.json"),
      JSON.stringify({
        "commands/alpha.mdx": ["src/alpha.ts"],
        "commands/beta.mdx": ["src/beta.ts"],
      })
    );

    // Write valid MDX for both pages so validation passes
    for (const p of pages) {
      const fullPath = path.join(ROOT, "src", "content", "docs", p);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, "---\ntitle: test\ndescription: test\n---\n\nContent.");
    }

    const origEnv = { ...process.env };

    try {
      // The mock script needs MOCK_WRITE_PATH, but regenerateStalePages calls regeneratePage
      // for each page, and we can't set different MOCK_WRITE_PATH per call.
      // Instead, use dryRun mode which doesn't do file validation.
      const result = await regenerateStalePages({
        generatedDir: tmpDir,
        claudePath: MOCK_CLAUDE,
        dryRun: true,
      });

      assert.strictEqual(result.results.length, 2);
      assert.strictEqual(result.successCount, 2);
      assert.strictEqual(result.failCount, 0);
      assert.strictEqual(result.skipCount, 0);
    } finally {
      process.env = origEnv;
      // Clean up written files
      for (const p of pages) {
        try { fs.unlinkSync(path.join(ROOT, "src", "content", "docs", p)); } catch {}
      }
    }
  });

  it("returns error when stale-pages.json is missing", async () => {
    const result = await regenerateStalePages({
      generatedDir: path.join(tmpDir, "nonexistent"),
    });

    assert.ok(result.error, "should have error");
    assert.ok(
      result.error.includes("stale-pages.json"),
      "error should mention stale-pages.json"
    );
  });

  it("handles missing claudePath with skip for all pages", async () => {
    const pages = ["commands/gamma.mdx"];

    fs.writeFileSync(
      path.join(tmpDir, "stale-pages.json"),
      JSON.stringify({ stalePages: pages, reasons: {} })
    );
    fs.writeFileSync(
      path.join(tmpDir, "page-source-map.json"),
      JSON.stringify({ "commands/gamma.mdx": ["src/gamma.ts"] })
    );

    const result = await regenerateStalePages({
      generatedDir: tmpDir,
      claudePath: "/nonexistent/claude",
    });

    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.skipCount, 1);
    assert.strictEqual(result.results[0].skipped, true);
    assert.strictEqual(result.results[0].reason, "claude CLI not available");
  });
});
