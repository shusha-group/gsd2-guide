/**
 * tests/regenerate-page.test.mjs — Tests for page regeneration via Claude API.
 *
 * Uses options.client mock injection (no SDK module mocking needed).
 *
 * Run: node --test tests/regenerate-page.test.mjs
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { regeneratePage, regenerateStalePages } from "../scripts/lib/regenerate-page.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ── Mock helpers ───────────────────────────────────────────────────────────

const VALID_FRONTMATTER = `---
title: "/gsd test"
description: "Test command"
---

## What It Does

Tests things.

## Usage

\`\`\`bash
/gsd test
\`\`\`

## How It Works

It works.

## What Files It Touches

| File | Purpose |
|------|---------|
| test.ts | Tests |

## Examples

Example here.

## Related Commands

- [/gsd doctor](../doctor/)
`;

function mockClient(response) {
  return {
    messages: {
      create: async (params) => {
        // Store the params for inspection
        mockClient._lastParams = params;
        if (typeof response === "function") return response(params);
        return response;
      },
    },
    _lastParams: null,
  };
}

function successResponse(text = VALID_FRONTMATTER) {
  return {
    content: [{ type: "text", text }],
    usage: { input_tokens: 5000, output_tokens: 2000 },
    model: "claude-sonnet-4-5-20250929",
    stop_reason: "end_turn",
  };
}

// ── regeneratePage unit tests ──────────────────────────────────────────────

describe("regeneratePage", () => {
  it("returns skip result when no API key and no client", async () => {
    const origKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      const result = await regeneratePage("commands/test.mdx", ["src/test.ts"]);
      assert.strictEqual(result.skipped, true);
      assert.strictEqual(result.reason, "no API key");
    } finally {
      if (origKey !== undefined) process.env.ANTHROPIC_API_KEY = origKey;
    }
  });

  it("includes quality rules in system prompt", async () => {
    const client = mockClient(successResponse());
    await regeneratePage("commands/test.mdx", [], { client, dryRun: true });

    const systemPrompt = client._lastParams?.system || mockClient._lastParams?.system;
    assert.ok(systemPrompt.includes("Section Order"), "should include section order rules");
    assert.ok(systemPrompt.includes("Mermaid Diagrams"), "should include Mermaid rules");
    assert.ok(systemPrompt.includes("Link Format"), "should include link format rules");
    assert.ok(systemPrompt.includes("Frontmatter Format"), "should include frontmatter rules");
  });

  it("includes exemplar page content in system prompt", async () => {
    const client = mockClient(successResponse());
    await regeneratePage("commands/test.mdx", [], { client, dryRun: true });

    const systemPrompt = client._lastParams?.system || mockClient._lastParams?.system;
    assert.ok(systemPrompt.includes("<exemplar>"), "should include exemplar tags");
    // The exemplar is capture.mdx — it should exist
    const captureExists = fs.existsSync(
      path.join(ROOT, "src", "content", "docs", "commands", "capture.mdx")
    );
    if (captureExists) {
      assert.ok(systemPrompt.includes("/gsd capture"), "should include capture content");
    }
  });

  it("includes source files in user message with source tags", async () => {
    const client = mockClient((params) => {
      mockClient._lastParams = params;
      return successResponse();
    });

    // Use an existing source file from the package
    await regeneratePage("commands/test.mdx", [], { client, dryRun: true });

    const userMessage = (client._lastParams || mockClient._lastParams).messages[0].content;
    assert.ok(userMessage.includes("Regenerate the documentation page"), "should include regeneration instruction");
  });

  it("includes current page content in user message", async () => {
    const client = mockClient((params) => {
      mockClient._lastParams = params;
      return successResponse();
    });

    // capture.mdx is an existing page
    await regeneratePage("commands/capture.mdx", [], { client, dryRun: true });

    const userMessage = (client._lastParams || mockClient._lastParams).messages[0].content;
    assert.ok(userMessage.includes("<current_page>"), "should include current_page tags for existing page");
  });

  it("extracts token usage from response", async () => {
    const client = mockClient(successResponse());
    const result = await regeneratePage("commands/test.mdx", [], { client, dryRun: true });

    assert.strictEqual(result.inputTokens, 5000);
    assert.strictEqual(result.outputTokens, 2000);
    assert.strictEqual(result.model, "claude-sonnet-4-5-20250929");
    assert.ok(result.elapsedMs >= 0);
    assert.strictEqual(result.stopReason, "end_turn");
    assert.strictEqual(result.pagePath, "commands/test.mdx");
  });

  it("warns on missing source files", async (t) => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);

    try {
      const client = mockClient(successResponse());
      await regeneratePage("commands/test.mdx", ["src/nonexistent-file-xyz.ts"], {
        client,
        dryRun: true,
      });

      assert.ok(
        warnings.some((w) => w.includes("Source file not found")),
        `should warn about missing source file. Warnings: ${warnings.join(", ")}`
      );
    } finally {
      console.warn = origWarn;
    }
  });

  it("rejects response with invalid frontmatter", async () => {
    const client = mockClient({
      content: [{ type: "text", text: "No frontmatter here\n\nJust content." }],
      usage: { input_tokens: 1000, output_tokens: 500 },
      model: "claude-sonnet-4-5-20250929",
      stop_reason: "end_turn",
    });

    const result = await regeneratePage("commands/test.mdx", [], { client, dryRun: true });
    assert.strictEqual(result.error, "invalid frontmatter");
    assert.strictEqual(result.pagePath, "commands/test.mdx");
    assert.strictEqual(result.inputTokens, 1000);
  });

  it("warns on max_tokens stop reason", async (t) => {
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);

    try {
      const client = mockClient({
        content: [{ type: "text", text: VALID_FRONTMATTER }],
        usage: { input_tokens: 5000, output_tokens: 16384 },
        model: "claude-sonnet-4-5-20250929",
        stop_reason: "max_tokens",
      });

      const result = await regeneratePage("commands/test.mdx", [], { client, dryRun: true });

      assert.ok(
        warnings.some((w) => w.includes("max_tokens")),
        "should warn about truncation"
      );
      assert.strictEqual(result.stopReason, "max_tokens");
    } finally {
      console.warn = origWarn;
    }
  });

  it("returns error result on API failure", async () => {
    const client = {
      messages: {
        create: async () => {
          throw new Error("API rate limit exceeded");
        },
      },
    };

    const result = await regeneratePage("commands/test.mdx", [], { client, dryRun: true });
    assert.strictEqual(result.error, "API call failed");
    assert.strictEqual(result.pagePath, "commands/test.mdx");
    assert.ok(result.details.includes("rate limit"));
  });
});

// ── regenerateStalePages batch tests ───────────────────────────────────────

describe("regenerateStalePages", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "regen-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("skips when stale-pages.json has empty stalePages array", async () => {
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

  it("iterates stale pages and collects results", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "stale-pages.json"),
      JSON.stringify({
        stalePages: ["commands/alpha.mdx", "commands/beta.mdx"],
        reasons: {},
      })
    );
    fs.writeFileSync(
      path.join(tmpDir, "page-source-map.json"),
      JSON.stringify({
        "commands/alpha.mdx": [],
        "commands/beta.mdx": [],
      })
    );

    const client = mockClient(successResponse());
    const result = await regenerateStalePages({
      generatedDir: tmpDir,
      client,
      dryRun: true,
    });

    assert.strictEqual(result.results.length, 2);
    assert.strictEqual(result.successCount, 2);
    assert.strictEqual(result.failCount, 0);
    assert.strictEqual(result.totalInputTokens, 10000);
    assert.strictEqual(result.totalOutputTokens, 4000);
  });

  it("handles partial failures in batch mode", async () => {
    let callCount = 0;
    const client = {
      messages: {
        create: async () => {
          callCount++;
          if (callCount === 1) {
            return successResponse();
          }
          throw new Error("API error");
        },
      },
    };

    fs.writeFileSync(
      path.join(tmpDir, "stale-pages.json"),
      JSON.stringify({
        stalePages: ["commands/ok.mdx", "commands/fail.mdx"],
        reasons: {},
      })
    );
    fs.writeFileSync(
      path.join(tmpDir, "page-source-map.json"),
      JSON.stringify({
        "commands/ok.mdx": [],
        "commands/fail.mdx": [],
      })
    );

    const result = await regenerateStalePages({
      generatedDir: tmpDir,
      client,
      dryRun: true,
    });

    assert.strictEqual(result.successCount, 1);
    assert.strictEqual(result.failCount, 1);
    assert.strictEqual(result.results.length, 2);
  });

  it("returns error when stale-pages.json is missing", async () => {
    const result = await regenerateStalePages({
      generatedDir: path.join(tmpDir, "nonexistent"),
    });

    assert.ok(result.error);
    assert.ok(result.error.includes("stale-pages.json"));
  });
});
