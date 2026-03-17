#!/usr/bin/env node
/**
 * update.mjs — One-command update pipeline orchestrator.
 *
 * Chains: npm update gsd-pi → extract → diff report → regenerate →
 *         manage commands → build → check-links
 * Reports elapsed time per step, manifest diff summary, regeneration cost,
 * and overall result.
 *
 * - Does NOT call prebuild explicitly — it runs via npm lifecycle hook during build.
 * - Exits non-zero immediately if any step fails, naming the failed step.
 * - Satisfies R007 (single command update cycle) and R011 (content diff detection).
 *
 * Usage:
 *   node scripts/update.mjs
 *   npm run update
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectChanges, resolveStalePages } from './lib/diff-sources.mjs';
import { regenerateStalePages } from './lib/regenerate-page.mjs';
import { detectNewAndRemovedCommands, createNewPages, removePages } from './lib/manage-pages.mjs';

const DIST_DIR = 'dist';
const GENERATED_DIR = join('content', 'generated');

// ── Module-level state for summary section ──────────────────────────────
let regenResult = null;

// ── Cost helper ─────────────────────────────────────────────────────────
/**
 * Format cost estimate for token usage.
 * Sonnet pricing: $3/MTok input, $15/MTok output.
 */
export function formatCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  const total = inputCost + outputCost;
  return `$${total.toFixed(4)} (in: $${inputCost.toFixed(4)}, out: $${outputCost.toFixed(4)})`;
}

// ── Diff report step (runs between extract and build) ───────────────
function runDiffReport() {
  const prevPath = join(GENERATED_DIR, 'previous-manifest.json');
  const currPath = join(GENERATED_DIR, 'manifest.json');
  const mapPath = join(GENERATED_DIR, 'page-source-map.json');
  const stalePath = join(GENERATED_DIR, 'stale-pages.json');

  // First-run: no previous manifest
  if (!existsSync(prevPath)) {
    console.log('  ℹ First run — no previous manifest for diff. All pages considered fresh.');
    writeFileSync(stalePath, JSON.stringify({
      firstRun: true,
      stalePages: [],
      timestamp: new Date().toISOString(),
    }, null, 2));
    return;
  }

  // Missing page-source-map — warn but don't block
  if (!existsSync(mapPath)) {
    console.log('  ⚠ page-source-map.json not found — skipping diff report');
    writeFileSync(stalePath, JSON.stringify({
      firstRun: true,
      stalePages: [],
      timestamp: new Date().toISOString(),
    }, null, 2));
    return;
  }

  const previousManifest = JSON.parse(readFileSync(prevPath, 'utf8'));
  const currentManifest = JSON.parse(readFileSync(currPath, 'utf8'));
  const pageSourceMap = JSON.parse(readFileSync(mapPath, 'utf8'));

  const changes = detectChanges(previousManifest, currentManifest);
  const { stalePages, reasons } = resolveStalePages(changes, pageSourceMap);

  // Log summary
  console.log(`  Source diff: ${changes.changedFiles.length} changed, ${changes.addedFiles.length} added, ${changes.removedFiles.length} removed`);
  console.log(`  Stale pages: ${stalePages.length}`);

  if (stalePages.length === 0) {
    console.log('  ✓ No stale pages — skipping regeneration');
  } else {
    for (const page of stalePages) {
      const triggers = reasons.get(page) || [];
      const fileNames = triggers.map(f => f.split('/').pop());
      console.log(`    - ${page} (${fileNames.join(', ')} changed)`);
    }
  }

  // Convert reasons Map to plain object for JSON serialization
  const reasonsObj = {};
  for (const [page, triggers] of reasons.entries()) {
    reasonsObj[page] = triggers;
  }

  // Write boundary contract for S02/S03/S04
  writeFileSync(stalePath, JSON.stringify({
    changedFiles: changes.changedFiles,
    addedFiles: changes.addedFiles,
    removedFiles: changes.removedFiles,
    stalePages,
    reasons: reasonsObj,
    timestamp: new Date().toISOString(),
  }, null, 2));
}

// ── Regenerate step (async — calls regenerateStalePages) ────────────
export async function runRegenerate() {
  const batch = await regenerateStalePages();
  regenResult = batch;

  if (batch.skipped) {
    console.log(`  ⊘ Skipped: ${batch.reason}`);
    return;
  }

  if (batch.error) {
    console.log(`  ✗ Error: ${batch.error}`);
    if (batch.details) console.log(`    ${batch.details}`);
    return;
  }

  // Per-page results
  for (const r of batch.results) {
    if (r.skipped) {
      console.log(`  ⊘ ${r.pagePath || '?'}: skipped — ${r.reason}`);
    } else if (r.error) {
      console.log(`  ✗ ${r.pagePath || '?'}: ${r.error}`);
    } else {
      console.log(`  ✓ ${r.pagePath}: ${r.inputTokens} in / ${r.outputTokens} out`);
    }
  }

  // Batch summary
  console.log(`  Regenerated: ${batch.successCount} success, ${batch.failCount} failed, ${batch.skipCount} skipped`);

  if (batch.totalInputTokens > 0) {
    console.log(`  Total tokens: ${batch.totalInputTokens} in / ${batch.totalOutputTokens} out`);
    console.log(`  Cost estimate: ${formatCost(batch.totalInputTokens, batch.totalOutputTokens)}`);
  }

  if (batch.totalElapsedMs > 0) {
    console.log(`  Regeneration time: ${(batch.totalElapsedMs / 1000).toFixed(1)}s`);
  }
}

// ── Manage commands step (async — calls detect + create/remove) ─────
export async function runManageCommands() {
  const detection = detectNewAndRemovedCommands();

  console.log(`  New commands: ${detection.newCommands.length}`);
  console.log(`  Removed commands: ${detection.removedCommands.length}`);

  if (detection.newCommands.length > 0) {
    console.log(`  Creating ${detection.newCommands.length} new page(s)...`);
    const createResult = await createNewPages(detection.newCommands);
    for (const r of createResult.results) {
      if (r.regeneration?.skipped) {
        console.log(`    ⊘ ${r.slug}: skipped — ${r.regeneration.reason}`);
      } else if (r.regeneration?.error) {
        console.log(`    ✗ ${r.slug}: ${r.regeneration.error}`);
      } else {
        console.log(`    ✓ ${r.slug}: page created`);
      }
    }
  }

  if (detection.removedCommands.length > 0) {
    console.log(`  Removing ${detection.removedCommands.length} page(s)...`);
    const removeResult = removePages(detection.removedCommands);
    for (const r of removeResult.results) {
      const status = r.error ? `✗ ${r.error}` : '✓ removed';
      console.log(`    ${status}: ${r.slug}`);
    }
  }

  if (detection.newCommands.length === 0 && detection.removedCommands.length === 0) {
    console.log('  ✓ All commands in sync — no changes needed.');
  }
}

// ── Pipeline steps ──────────────────────────────────────────────────
export const steps = [
  { name: 'npm update', cmd: 'npm update gsd-pi', capture: false },
  { name: 'extract',    cmd: 'node scripts/extract.mjs', capture: true },
  { name: 'diff report', fn: runDiffReport },
  { name: 'regenerate', fn: runRegenerate },
  { name: 'manage commands', fn: runManageCommands },
  { name: 'build',      cmd: 'npm run build', capture: false },
  { name: 'check-links', cmd: 'node scripts/check-links.mjs', capture: false },
];

// ── Helpers ─────────────────────────────────────────────────────────
function formatElapsed(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function countHtmlFiles(dir) {
  try {
    return readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.html')).length;
  } catch {
    return 0;
  }
}

function parseManifestDiff(output) {
  // Look for the line: "  Manifest Δ: +N added, ~N changed, -N removed"
  const match = output.match(/Manifest\s*[ΔΔ]:\s*\+(\d+)\s*added,\s*~(\d+)\s*changed,\s*-(\d+)\s*removed/);
  if (match) {
    return { added: parseInt(match[1], 10), changed: parseInt(match[2], 10), removed: parseInt(match[3], 10) };
  }
  return null;
}

// ── Main pipeline (guarded — only runs when executed directly) ──────
const __filename_update = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && (
  process.argv[1] === __filename_update ||
  process.argv[1].endsWith('/update.mjs')
);

if (isDirectRun) {
  const pipelineStart = Date.now();
  const timings = [];
  let manifestDiff = null;

  console.log('[update] ═══════════════════════════════════════════════════════');
  console.log('[update] Starting update pipeline');
  console.log('[update] ═══════════════════════════════════════════════════════\n');

  for (const step of steps) {
    const label = `[update] Step: ${step.name}`;
    console.log(`${label}`);
    console.log(`[update] ${'─'.repeat(55)}`);

    const stepStart = Date.now();

    try {
      if (step.fn) {
        // In-process function step (sync or async)
        await step.fn();
      } else if (step.capture) {
        // Capture stdout to parse manifest diff, pipe stderr through
        const output = execSync(step.cmd, {
          encoding: 'utf-8',
          stdio: ['inherit', 'pipe', 'inherit'],
          maxBuffer: 10 * 1024 * 1024,
        });
        // Print captured output so user still sees it
        process.stdout.write(output);
        // Parse manifest diff from extract output
        manifestDiff = parseManifestDiff(output) || manifestDiff;
      } else {
        execSync(step.cmd, { stdio: 'inherit' });
      }
    } catch (err) {
      const elapsed = Date.now() - stepStart;
      const totalElapsed = Date.now() - pipelineStart;
      console.log(`\n[update] ❌ Step "${step.name}" failed after ${formatElapsed(elapsed)}`);
      console.log(`[update] Total elapsed: ${formatElapsed(totalElapsed)}`);
      if (err.status != null) {
        console.log(`[update] Exit code: ${err.status}`);
      }
      process.exit(err.status || 1);
    }

    const elapsed = Date.now() - stepStart;
    timings.push({ name: step.name, elapsed });
    console.log(`[update] ✅ ${step.name} completed in ${formatElapsed(elapsed)}\n`);
  }

  // ── Summary ─────────────────────────────────────────────────────────
  const totalElapsed = Date.now() - pipelineStart;
  const pageCount = countHtmlFiles(DIST_DIR);

  console.log('[update] ═══════════════════════════════════════════════════════');
  console.log('[update] Pipeline complete');
  console.log('[update] ═══════════════════════════════════════════════════════\n');

  console.log('[update] Step timings:');
  for (const t of timings) {
    console.log(`  ${t.name.padEnd(18)} ${formatElapsed(t.elapsed)}`);
  }

  console.log('');

  if (manifestDiff) {
    console.log(`[update] Manifest diff: +${manifestDiff.added} added, ~${manifestDiff.changed} changed, -${manifestDiff.removed} removed`);
  } else {
    console.log('[update] Manifest diff: (not available — extract output did not contain diff data)');
  }

  // ── Regeneration summary ──────────────────────────────────────────
  console.log('');
  if (!regenResult) {
    console.log('[update] Regeneration: (no result available)');
  } else if (regenResult.skipped) {
    console.log(`[update] Regeneration: skipped (${regenResult.reason})`);
  } else if (regenResult.error) {
    console.log(`[update] Regeneration: error — ${regenResult.error}`);
  } else {
    console.log(`[update] Regeneration: ${regenResult.successCount} regenerated, ${regenResult.skipCount} skipped, ${regenResult.failCount} failed`);
    if (regenResult.totalInputTokens > 0) {
      console.log(`[update] Tokens: ${regenResult.totalInputTokens} in / ${regenResult.totalOutputTokens} out`);
      console.log(`[update] Cost: ${formatCost(regenResult.totalInputTokens, regenResult.totalOutputTokens)}`);
    }
    if (regenResult.totalElapsedMs > 0) {
      console.log(`[update] Regeneration time: ${(regenResult.totalElapsedMs / 1000).toFixed(1)}s`);
    }
  }

  console.log(`[update] Pages built: ${pageCount}`);
  console.log(`[update] Link check: passed`);
  console.log(`[update] Total time: ${formatElapsed(totalElapsed)}`);
}
