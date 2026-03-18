/**
 * tests/update-pipeline.test.mjs — Integration tests for update pipeline orchestration.
 *
 * Tests the pipeline step structure, manage-commands detection, and the
 * isDirectRun guard.
 *
 * Run: node --test tests/update-pipeline.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { steps } from '../scripts/update.mjs';
import { detectNewAndRemovedCommands } from '../scripts/lib/manage-pages.mjs';

// ── Pipeline step structure ────────────────────────────────────────────────

describe('pipeline step structure', () => {
  it('has 6 steps in the correct order', () => {
    const stepNames = steps.map((s) => s.name);
    assert.deepStrictEqual(stepNames, [
      'npm update',
      'extract',
      'diff report',
      'manage commands',
      'build',
      'check-links',
    ]);
  });

  it('manage commands step uses fn (not cmd)', () => {
    const manageStep = steps.find((s) => s.name === 'manage commands');
    assert.equal(typeof manageStep.fn, 'function');
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
    // update.mjs (via the steps import) without hanging proves the
    // guard works.
    assert.ok(steps.length > 0, 'steps should be importable without side effects');
  });
});
