#!/usr/bin/env node

/**
 * check-page-freshness.mjs — Compare agent-generated page source deps
 * against the current manifest to find genuinely stale pages.
 *
 * Unlike the ephemeral previous-manifest diff (which only catches changes
 * between consecutive runs), this compares against page-versions.json —
 * a committed file recording the manifest SHAs at the time each page was
 * last generated/verified.
 *
 * When a page's source deps have changed since its last recorded version,
 * it's flagged as stale. The output is a list of pages needing regeneration
 * by an agent task.
 *
 * Usage:
 *   node scripts/check-page-freshness.mjs           # report only
 *   node scripts/check-page-freshness.mjs --stamp    # update page-versions.json to mark all current
 *
 * Exit codes:
 *   0 — all pages fresh, or --stamp mode
 *   1 — stale pages found (list printed)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const MANIFEST_PATH = path.join(ROOT, "content/generated/manifest.json");
const PAGE_MAP_PATH = path.join(ROOT, "content/generated/page-source-map.json");
const VERSIONS_PATH = path.join(ROOT, "page-versions.json");

function run() {
  const stampMode = process.argv.includes("--stamp");

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log("[freshness] No manifest.json — run extract first.");
    return 0;
  }
  if (!fs.existsSync(PAGE_MAP_PATH)) {
    console.log("[freshness] No page-source-map.json — run extract first.");
    return 0;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const pageMap = JSON.parse(fs.readFileSync(PAGE_MAP_PATH, "utf-8"));

  // Load existing versions (or empty)
  let versions = {};
  if (fs.existsSync(VERSIONS_PATH)) {
    versions = JSON.parse(fs.readFileSync(VERSIONS_PATH, "utf-8"));
  }

  if (stampMode) {
    // Update all pages to current manifest SHAs
    const stamped = {};
    for (const [page, deps] of Object.entries(pageMap)) {
      const depShas = {};
      for (const dep of deps) {
        if (manifest.files[dep]) {
          depShas[dep] = manifest.files[dep];
        }
      }
      stamped[page] = {
        headSha: manifest.headSha,
        deps: depShas,
        stampedAt: new Date().toISOString(),
      };
    }
    fs.writeFileSync(VERSIONS_PATH, JSON.stringify(stamped, null, 2) + "\n");
    console.log(`[freshness] Stamped ${Object.keys(stamped).length} pages as current (HEAD: ${manifest.headSha.slice(0, 8)})`);
    return 0;
  }

  // Check mode: find stale pages
  const stale = [];

  for (const [page, deps] of Object.entries(pageMap)) {
    const recorded = versions[page];

    if (!recorded) {
      // Page has no version record — it's never been stamped
      stale.push({ page, reason: "no version record", changedDeps: [] });
      continue;
    }

    // Compare each dep SHA against the recorded version
    const changedDeps = [];
    for (const dep of deps) {
      const currentSha = manifest.files[dep];
      const recordedSha = recorded.deps?.[dep];
      if (currentSha && currentSha !== recordedSha) {
        changedDeps.push(dep);
      }
    }

    if (changedDeps.length > 0) {
      stale.push({ page, reason: "deps changed", changedDeps });
    }
  }

  if (stale.length === 0) {
    console.log("[freshness] ✅ All pages are current with their source dependencies");
    return 0;
  }

  console.log(`[freshness] ⚠ ${stale.length} page(s) have changed source dependencies:\n`);
  for (const { page, reason, changedDeps } of stale) {
    if (reason === "no version record") {
      console.log(`  ${page}: never stamped`);
    } else {
      const depNames = changedDeps.map(d => d.split("/").pop());
      console.log(`  ${page}: ${depNames.join(", ")}`);
    }
  }

  console.log(`\nRun 'node scripts/check-page-freshness.mjs --stamp' after regenerating to mark as current.`);

  return 1;
}

process.exit(run());
