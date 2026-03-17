/**
 * diff-sources.mjs — Diff detection and page staleness resolution.
 *
 * Compares two manifest versions to find changed/added/removed source files,
 * then resolves which doc pages are stale based on the page-source-map.
 *
 * Exports:
 *   detectChanges(previousManifest, currentManifest) → { changedFiles, addedFiles, removedFiles }
 *   resolveStalePages(changes, pageSourceMap)         → { stalePages, reasons }
 *
 * CLI: node scripts/lib/diff-sources.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Detect which source files changed between two manifest snapshots.
 *
 * @param {{ files: Record<string, string> }} previousManifest
 * @param {{ files: Record<string, string> }} currentManifest
 * @returns {{ changedFiles: string[], addedFiles: string[], removedFiles: string[] }}
 */
export function detectChanges(previousManifest, currentManifest) {
  const oldFiles = previousManifest.files || {};
  const newFiles = currentManifest.files || {};

  const changedFiles = [];
  const addedFiles = [];
  const removedFiles = [];

  for (const [filePath, sha] of Object.entries(newFiles)) {
    if (!(filePath in oldFiles)) {
      addedFiles.push(filePath);
    } else if (oldFiles[filePath] !== sha) {
      changedFiles.push(filePath);
    }
  }

  for (const filePath of Object.keys(oldFiles)) {
    if (!(filePath in newFiles)) {
      removedFiles.push(filePath);
    }
  }

  return { changedFiles, addedFiles, removedFiles };
}

/**
 * Resolve which doc pages are stale given a set of source file changes
 * and a page-source-map.
 *
 * A page is stale if any of its source dependencies appear in changedFiles
 * or removedFiles. addedFiles do NOT flag existing pages as stale.
 * A page with an empty dependency array is never stale.
 *
 * @param {{ changedFiles: string[], addedFiles: string[], removedFiles: string[] }} changes
 * @param {Record<string, string[]>} pageSourceMap
 * @returns {{ stalePages: string[], reasons: Map<string, string[]> }}
 */
export function resolveStalePages(changes, pageSourceMap) {
  const triggeringFiles = new Set([
    ...changes.changedFiles,
    ...changes.removedFiles,
  ]);

  const stalePages = [];
  const reasons = new Map();

  for (const [pagePath, deps] of Object.entries(pageSourceMap)) {
    if (!deps || deps.length === 0) continue;

    const triggers = deps.filter((dep) => triggeringFiles.has(dep));
    if (triggers.length > 0) {
      stalePages.push(pagePath);
      reasons.set(pagePath, triggers);
    }
  }

  return { stalePages, reasons };
}

// ── CLI entry point ────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const root = path.resolve(path.dirname(__filename), "..", "..");
  const generatedDir = path.join(root, "content", "generated");

  const prevPath = path.join(generatedDir, "previous-manifest.json");
  const currPath = path.join(generatedDir, "manifest.json");
  const mapPath = path.join(generatedDir, "page-source-map.json");

  if (!fs.existsSync(prevPath)) {
    console.log(
      "First run — no previous manifest. All pages considered fresh."
    );
    process.exit(0);
  }

  if (!fs.existsSync(currPath)) {
    console.error("[diff-sources] Error: manifest.json not found. Run extract first.");
    process.exit(1);
  }

  if (!fs.existsSync(mapPath)) {
    console.error("[diff-sources] Error: page-source-map.json not found. Run build-page-map.mjs first.");
    process.exit(1);
  }

  const previousManifest = JSON.parse(fs.readFileSync(prevPath, "utf8"));
  const currentManifest = JSON.parse(fs.readFileSync(currPath, "utf8"));
  const pageSourceMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));

  const changes = detectChanges(previousManifest, currentManifest);
  const { stalePages, reasons } = resolveStalePages(changes, pageSourceMap);

  console.log(
    `${changes.changedFiles.length} files changed, ` +
      `${changes.addedFiles.length} files added, ` +
      `${changes.removedFiles.length} files removed. ` +
      `${stalePages.length} pages stale.`
  );

  for (const page of stalePages) {
    const triggers = reasons.get(page) || [];
    console.log(`  - ${page} (because: ${triggers.join(", ")})`);
  }
}
