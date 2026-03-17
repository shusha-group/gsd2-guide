/**
 * tests/regenerate-page.test.mjs — Tests for LLM page regeneration module.
 *
 * All tests mock the Anthropic SDK via options.client to avoid needing an API key.
 *
 * Run: node --test tests/regenerate-page.test.mjs
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { regeneratePage, regenerateStalePages } from "../scripts/lib/regenerate-page.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ── Test fixtures ──────────────────────────────────────────────────────────

const VALID_FRONTMATTER_RESPONSE = `---
title: "/gsd test-cmd"
description: "A test command page."
---

## What It Does

This is a test page.
`;

const INVALID_RESPONSE = `This is not valid MDX — no frontmatter at all.`;

/**
 * Create a mock Anthropic client that records call args and returns a controlled response.
 */
function createMockClient(overrides = {}) {
  const calls = [];
  const response = {
    content: [{ type: "text", text: overrides.text ?? VALID_FRONTMATTER_RESPONSE }],
    model: overrides.model ?? "claude-sonnet-4-5-20250929",
    stop_reason: overrides.stop_reason ?? "end_turn",
    usage: {
      input_tokens: overrides.input_tokens ?? 1000,
      output_tokens: overrides.output_tokens ?? 500,
    },
    ...overrides.extra,
  };

  return {
    calls,
    messages: {
      create: async (params) => {
        calls.push(params);
        if (overrides.throwError) {
          throw new Error(overrides.throwError);
        }
        return response;
      },
    },
  };
}

// ── Temp directory for test output ─────────────────────────────────────────

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(ROOT, ".tmp-test-regen-"));
});

afterEach(() => {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

// ── regeneratePage ─────────────────────────────────────────────────────────

describe("regeneratePage", () => {
  it("returns skip when no API key and no client provided", async () => {
    const origKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const result = await regeneratePage("commands/test.mdx", [], {});
      assert.equal(result.skipped, true);
      assert.equal(result.reason, "no API key");
    } finally {
      if (origKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = origKey;
      }
    }
  });

  it("system prompt includes exemplar content and quality rules", async () => {
    const client = createMockClient();
    await regeneratePage("commands/capture.mdx", [], {
      client: client.messages ? client : client,
      dryRun: true,
    });

    assert.equal(client.calls.length, 1);
    const call = client.calls[0];

    // System prompt should have quality rules
    assert.ok(call.system.includes("What It Does"), "missing section rule: What It Does");
    assert.ok(call.system.includes("Usage"), "missing section rule: Usage");
    assert.ok(call.system.includes("How It Works"), "missing section rule: How It Works");
    assert.ok(call.system.includes("Related Commands"), "missing section rule: Related Commands");
    assert.ok(call.system.includes("flowchart TD"), "missing Mermaid orientation rule");
    assert.ok(call.system.includes("fill:#0d180d"), "missing Mermaid decision node style");
    assert.ok(call.system.includes("fill:#1a3a1a"), "missing Mermaid action node style");
    assert.ok(call.system.includes("../slug/"), "missing link format rule");

    // System prompt should include exemplar content (capture.mdx)
    assert.ok(call.system.includes("<exemplar>"), "missing exemplar open tag");
    assert.ok(call.system.includes("</exemplar>"), "missing exemplar close tag");
    assert.ok(
      call.system.includes("/gsd capture"),
      "exemplar should contain capture page content"
    );
  });

  it("user message includes source files in <source> tags", async () => {
    // Create a fake source file in a temp pkg directory
    const fakePkgDir = path.join(tmpDir, "fake-pkg");
    const srcDir = path.join(fakePkgDir, "src", "resources");
    fs.mkdirSync(srcDir, { recursive: true });
    const testFile = path.join(fakePkgDir, "src", "resources", "test.ts");
    fs.writeFileSync(testFile, 'export function hello() { return "world"; }');

    const client = createMockClient();
    await regeneratePage(
      "commands/capture.mdx",
      ["src/resources/test.ts"],
      { client, dryRun: true, pkgPath: fakePkgDir }
    );

    const userMsg = client.calls[0].messages[0].content;
    assert.ok(userMsg.includes('<source path="src/resources/test.ts">'), "missing source tag");
    assert.ok(userMsg.includes('export function hello()'), "missing source content");
  });

  it("user message includes current page in <current_page> tags", async () => {
    const client = createMockClient();
    // capture.mdx exists in the repo, so current page should be included
    await regeneratePage("commands/capture.mdx", [], {
      client,
      dryRun: true,
    });

    const userMsg = client.calls[0].messages[0].content;
    assert.ok(userMsg.includes("<current_page>"), "missing current_page open tag");
    assert.ok(userMsg.includes("</current_page>"), "missing current_page close tag");
    assert.ok(userMsg.includes("/gsd capture"), "current page should contain capture content");
  });

  it("extracts token usage from response", async () => {
    const client = createMockClient({
      input_tokens: 2500,
      output_tokens: 1200,
    });

    const result = await regeneratePage("commands/capture.mdx", [], {
      client,
      dryRun: true,
    });

    assert.equal(result.inputTokens, 2500);
    assert.equal(result.outputTokens, 1200);
    assert.equal(result.model, "claude-sonnet-4-5-20250929");
    assert.ok(typeof result.elapsedMs === "number");
    assert.equal(result.stopReason, "end_turn");
  });

  it("missing source file logs warning and continues", async (t) => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(" "));

    try {
      const client = createMockClient();
      const result = await regeneratePage(
        "commands/capture.mdx",
        ["src/resources/nonexistent-file.ts"],
        { client, dryRun: true }
      );

      // Should complete without error
      assert.ok(!result.error, "should not have error");
      assert.ok(!result.skipped, "should not be skipped");

      // Should have logged a warning
      assert.ok(
        warnings.some((w) => w.includes("nonexistent-file.ts")),
        `expected warning about missing file, got: ${JSON.stringify(warnings)}`
      );
    } finally {
      console.warn = origWarn;
    }
  });

  it("invalid frontmatter prevents writing", async () => {
    const client = createMockClient({ text: INVALID_RESPONSE });

    const result = await regeneratePage("commands/capture.mdx", [], {
      client,
      // NOT dryRun — but should not write because frontmatter is invalid
    });

    assert.equal(result.error, "invalid frontmatter");
    assert.ok(result.inputTokens, "should still report token usage");

    // Verify the actual file was not changed
    const actual = fs.readFileSync(
      path.join(ROOT, "src", "content", "docs", "commands", "capture.mdx"),
      "utf8"
    );
    assert.ok(actual.startsWith("---"), "capture.mdx should still have valid frontmatter");
    assert.ok(!actual.includes("This is not valid MDX"), "invalid content should not be written");
  });

  it("max_tokens stop reason triggers warning", async () => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(" "));

    try {
      const client = createMockClient({ stop_reason: "max_tokens" });
      const result = await regeneratePage("commands/capture.mdx", [], {
        client,
        dryRun: true,
      });

      assert.equal(result.stopReason, "max_tokens");
      assert.ok(
        warnings.some((w) => w.includes("max_tokens")),
        `expected max_tokens warning, got: ${JSON.stringify(warnings)}`
      );
    } finally {
      console.warn = origWarn;
    }
  });

  it("API error returns structured error result", async () => {
    const client = createMockClient({ throwError: "rate limit exceeded" });
    const errors = [];
    const origError = console.error;
    console.error = (...args) => errors.push(args.join(" "));

    try {
      const result = await regeneratePage("commands/capture.mdx", [], {
        client,
        dryRun: true,
      });

      assert.equal(result.error, "API call failed");
      assert.ok(result.details.includes("rate limit exceeded"));
    } finally {
      console.error = origError;
    }
  });
});

// ── regenerateStalePages ───────────────────────────────────────────────────

describe("regenerateStalePages", () => {
  it("iterates stale pages from stale-pages.json", async () => {
    // Set up temp generated dir with test data
    const genDir = path.join(tmpDir, "generated");
    fs.mkdirSync(genDir, { recursive: true });

    fs.writeFileSync(
      path.join(genDir, "stale-pages.json"),
      JSON.stringify({
        stalePages: ["commands/capture.mdx", "commands/doctor.mdx"],
        reasons: {},
      })
    );

    fs.writeFileSync(
      path.join(genDir, "page-source-map.json"),
      JSON.stringify({
        "commands/capture.mdx": ["src/resources/extensions/gsd/captures.ts"],
        "commands/doctor.mdx": ["src/resources/extensions/gsd/doctor.ts"],
      })
    );

    const client = createMockClient();

    const batch = await regenerateStalePages({
      client,
      dryRun: true,
      generatedDir: genDir,
    });

    assert.equal(batch.results.length, 2);
    assert.equal(batch.successCount, 2);
    assert.equal(batch.failCount, 0);
    assert.equal(batch.skipCount, 0);
    assert.equal(batch.totalInputTokens, 2000); // 1000 * 2
    assert.equal(batch.totalOutputTokens, 1000); // 500 * 2
    assert.ok(batch.totalElapsedMs >= 0);

    // Verify the mock client was called twice
    assert.equal(client.calls.length, 2);
  });

  it("returns skip when stalePages is empty", async () => {
    const genDir = path.join(tmpDir, "generated");
    fs.mkdirSync(genDir, { recursive: true });

    fs.writeFileSync(
      path.join(genDir, "stale-pages.json"),
      JSON.stringify({ stalePages: [], reasons: {} })
    );

    const batch = await regenerateStalePages({ generatedDir: genDir });

    assert.equal(batch.skipped, true);
    assert.equal(batch.reason, "no stale pages");
    assert.deepStrictEqual(batch.results, []);
  });

  it("partial failure still returns results for other pages", async () => {
    const genDir = path.join(tmpDir, "generated");
    fs.mkdirSync(genDir, { recursive: true });

    fs.writeFileSync(
      path.join(genDir, "stale-pages.json"),
      JSON.stringify({
        stalePages: ["commands/capture.mdx", "commands/fail.mdx"],
        reasons: {},
      })
    );

    fs.writeFileSync(
      path.join(genDir, "page-source-map.json"),
      JSON.stringify({
        "commands/capture.mdx": [],
        "commands/fail.mdx": [],
      })
    );

    // Create a client that fails on the second call
    let callCount = 0;
    const mockClient = {
      messages: {
        create: async () => {
          callCount++;
          if (callCount === 2) {
            throw new Error("simulated API failure");
          }
          return {
            content: [{ type: "text", text: VALID_FRONTMATTER_RESPONSE }],
            model: "claude-sonnet-4-5-20250929",
            stop_reason: "end_turn",
            usage: { input_tokens: 800, output_tokens: 400 },
          };
        },
      },
    };

    // Suppress error output during test
    const origError = console.error;
    console.error = () => {};
    try {
      const batch = await regenerateStalePages({
        client: mockClient,
        dryRun: true,
        generatedDir: genDir,
      });

      assert.equal(batch.results.length, 2);
      assert.equal(batch.successCount, 1);
      assert.equal(batch.failCount, 1);
    } finally {
      console.error = origError;
    }
  });

  it("handles missing stale-pages.json gracefully", async () => {
    const genDir = path.join(tmpDir, "nonexistent");

    const origError = console.error;
    console.error = () => {};
    try {
      const batch = await regenerateStalePages({ generatedDir: genDir });
      assert.ok(batch.error, "should return error");
      assert.deepStrictEqual(batch.results, []);
    } finally {
      console.error = origError;
    }
  });
});
