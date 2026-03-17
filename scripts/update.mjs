#!/usr/bin/env node
/**
 * update.mjs — One-command update pipeline orchestrator.
 *
 * Chains: npm update gsd-pi → extract → build → check-links
 * Reports elapsed time per step, manifest diff summary, and overall result.
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
import { detectChanges, resolveStalePages } from './lib/diff-sources.mjs';

const DIST_DIR = 'dist';
const GENERATED_DIR = join('content', 'generated');

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

// ── Pipeline steps ──────────────────────────────────────────────────
const steps = [
  { name: 'npm update', cmd: 'npm update gsd-pi', capture: false },
  { name: 'extract',    cmd: 'node scripts/extract.mjs', capture: true },
  { name: 'diff report', fn: runDiffReport },
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

// ── Main ────────────────────────────────────────────────────────────
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
      // In-process function step (e.g., diff report)
      step.fn();
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
  console.log(`  ${t.name.padEnd(14)} ${formatElapsed(t.elapsed)}`);
}

console.log('');

if (manifestDiff) {
  console.log(`[update] Manifest diff: +${manifestDiff.added} added, ~${manifestDiff.changed} changed, -${manifestDiff.removed} removed`);
} else {
  console.log('[update] Manifest diff: (not available — extract output did not contain diff data)');
}

console.log(`[update] Pages built: ${pageCount}`);
console.log(`[update] Link check: passed`);
console.log(`[update] Total time: ${formatElapsed(totalElapsed)}`);
