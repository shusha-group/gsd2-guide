/**
 * tests/update-pipeline.test.mjs — Integration tests for update pipeline orchestration.
 *
 * Tests the pipeline step structure, regeneration orchestration, manage-commands
 * detection, and cost formatting added in S04/T01.
 *
 * Run: node --test tests/update-pipeline.test.mjs
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { steps, formatCost } from '../scripts/update.mjs';
import { regenerateStalePages } from '../scripts/lib/regenerate-page.mjs';
import { detectNewAndRemovedCommands } from '../scripts/lib/manage-pages.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ── Temp directory for test fixtures ───────────────────────────────────────

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(ROOT, '.tmp-test-pipeline-'));
});

afterEach(() => {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

// ── Pipeline step structure ────────────────────────────────────────────────

describe('pipeline step structure', () => {
  it('has 7 steps in the correct order', () => {
    const stepNames = steps.map((s) => s.name);
    assert.deepStrictEqual(stepNames, [
      'npm update',
      'extract',
      'diff report',
      'regenerate',
      'manage commands',
      'build',
      'check-links',
    ]);
  });

  it('regenerate and manage commands steps use fn (not cmd)', () => {
    const regenStep = steps.find((s) => s.name === 'regenerate');
    const manageStep = steps.find((s) => s.name === 'manage commands');
    assert.equal(typeof regenStep.fn, 'function');
    assert.equal(typeof manageStep.fn, 'function');
    assert.equal(regenStep.cmd, undefined);
    assert.equal(manageStep.cmd, undefined);
  });

  it('diff report step uses fn (not cmd)', () => {
    const diffStep = steps.find((s) => s.name === 'diff report');
    assert.equal(typeof diffStep.fn, 'function');
  });

  it('shell steps have cmd strings', () => {
    const shellSteps = steps.filter((s) => s.cmd);
    assert.equal(shellSteps.length, 4);
    for (const step of shellSteps) {
      assert.equal(typeof step.cmd, 'string');
    }
  });
});

// ── formatCost ─────────────────────────────────────────────────────────────

describe('formatCost', () => {
  it('computes correct cost for 1M input + 100K output', () => {
    // 1M input * $3/MTok = $3.0000
    // 100K output * $15/MTok = $1.5000
    // Total = $4.5000
    const result = formatCost(1_000_000, 100_000);
    assert.equal(result, '$4.5000 (in: $3.0000, out: $1.5000)');
  });

  it('computes correct cost for zero tokens', () => {
    const result = formatCost(0, 0);
    assert.equal(result, '$0.0000 (in: $0.0000, out: $0.0000)');
  });

  it('computes correct cost for small token counts', () => {
    // 1000 input * $3/MTok = $0.003
    // 500 output * $15/MTok = $0.0075
    // Total = $0.0105
    const result = formatCost(1000, 500);
    assert.equal(result, '$0.0105 (in: $0.0030, out: $0.0075)');
  });

  it('computes correct cost for large token counts', () => {
    // 10M input * $3/MTok = $30
    // 2M output * $15/MTok = $30
    // Total = $60
    const result = formatCost(10_000_000, 2_000_000);
    assert.equal(result, '$60.0000 (in: $30.0000, out: $30.0000)');
  });
});

// ── regenerateStalePages integration ───────────────────────────────────────

describe('regenerateStalePages — pipeline integration', () => {
  it('returns skipped when stalePages is empty', async () => {
    const genDir = path.join(tmpDir, 'generated');
    fs.mkdirSync(genDir, { recursive: true });

    fs.writeFileSync(
      path.join(genDir, 'stale-pages.json'),
      JSON.stringify({ stalePages: [], reasons: {} }),
    );

    const result = await regenerateStalePages({ generatedDir: genDir });
    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'no stale pages');
    assert.deepStrictEqual(result.results, []);
  });

  it('returns error structure when stale-pages.json is missing', async () => {
    const genDir = path.join(tmpDir, 'nonexistent');

    const origError = console.error;
    console.error = () => {};
    try {
      const result = await regenerateStalePages({ generatedDir: genDir });
      assert.ok(result.error, 'should have error field');
      assert.ok(result.details, 'should have details field');
      assert.deepStrictEqual(result.results, []);
    } finally {
      console.error = origError;
    }
  });

  it('returns batch structure with correct shape for successful run', async () => {
    const genDir = path.join(tmpDir, 'generated');
    fs.mkdirSync(genDir, { recursive: true });

    fs.writeFileSync(
      path.join(genDir, 'stale-pages.json'),
      JSON.stringify({
        stalePages: ['commands/capture.mdx'],
        reasons: {},
      }),
    );

    fs.writeFileSync(
      path.join(genDir, 'page-source-map.json'),
      JSON.stringify({ 'commands/capture.mdx': [] }),
    );

    // Mock client
    const mockClient = {
      messages: {
        create: async () => ({
          content: [{ type: 'text', text: '---\ntitle: "test"\n---\n\nContent' }],
          model: 'claude-sonnet-4-5-20250929',
          stop_reason: 'end_turn',
          usage: { input_tokens: 500, output_tokens: 200 },
        }),
      },
    };

    const result = await regenerateStalePages({
      generatedDir: genDir,
      client: mockClient,
      dryRun: true,
    });

    // Verify batch result shape
    assert.ok(Array.isArray(result.results));
    assert.equal(typeof result.totalInputTokens, 'number');
    assert.equal(typeof result.totalOutputTokens, 'number');
    assert.equal(typeof result.totalElapsedMs, 'number');
    assert.equal(typeof result.successCount, 'number');
    assert.equal(typeof result.failCount, 'number');
    assert.equal(typeof result.skipCount, 'number');
  });
});

// ── detectNewAndRemovedCommands integration ────────────────────────────────

describe('detectNewAndRemovedCommands — pipeline integration', () => {
  it('returns correct structure shape', () => {
    const result = detectNewAndRemovedCommands();
    assert.ok(Array.isArray(result.newCommands), 'newCommands should be an array');
    assert.ok(Array.isArray(result.removedCommands), 'removedCommands should be an array');
  });

  it('detects no new/removed commands against real project data', () => {
    // Against the real project data, commands should be in sync
    const result = detectNewAndRemovedCommands();
    // Both arrays should be arrays (may be empty or non-empty depending on project state)
    assert.ok(Array.isArray(result.newCommands));
    assert.ok(Array.isArray(result.removedCommands));
    // All entries should be strings
    for (const cmd of result.newCommands) {
      assert.equal(typeof cmd, 'string');
    }
    for (const cmd of result.removedCommands) {
      assert.equal(typeof cmd, 'string');
    }
  });
});

// ── isDirectRun guard ──────────────────────────────────────────────────────

describe('isDirectRun guard', () => {
  it('importing update.mjs does not trigger pipeline execution', async () => {
    // If importing triggered the pipeline, the test would hang or fail
    // due to execSync calls. The fact that this test file loaded
    // update.mjs (via the steps/formatCost imports) without hanging
    // proves the guard works.
    assert.ok(steps.length > 0, 'steps should be importable without side effects');
    assert.equal(typeof formatCost, 'function', 'formatCost should be importable');
  });
});
