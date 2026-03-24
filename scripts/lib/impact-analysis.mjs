/**
 * impact-analysis.mjs — Semantic impact analysis for stale page detection.
 *
 * The freshness system flags pages stale whenever a source dep's SHA changes.
 * Many SHA changes are cosmetic (formatting, barrel refactors, internal logic)
 * and don't affect user-visible doc content. This module analyses *what*
 * actually changed and filters out false positives before regeneration runs.
 *
 * Strategy per dep type:
 *
 *   commands.ts / state.ts / types.ts (shared barrel deps)
 *     → Diff commands.json (previous vs current). If command list, descriptions,
 *       and categories are identical, skip all pages stale only due to these files.
 *
 *   prompts/*.md
 *     → Diff prompts.json entry for the specific prompt. If variables and
 *       content hash are identical, skip the page.
 *
 *   extensions/* (reference/extensions.mdx)
 *     → Diff extensions.json. If tool names/descriptions are identical, skip.
 *
 *   command-specific .ts files (auto.ts, doctor.ts, etc.)
 *     → Read old + new file from npm, extract exported function/class/const names.
 *       If exports unchanged, candidate for skip (conservative — still regenerates
 *       if any export name changed).
 *
 * Exports:
 *   analyzeImpact(stalePages) → { mustRegenerate, skipped, report }
 *
 * CLI:
 *   node scripts/lib/impact-analysis.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");
const GENERATED = path.join(ROOT, "content", "generated");

// ── Shared barrel deps that almost never carry doc-relevant changes ────────

const SHARED_BARREL_DEPS = new Set([
  "src/resources/extensions/gsd/commands.ts",
  "src/resources/extensions/gsd/state.ts",
  "src/resources/extensions/gsd/types.ts",
]);

// ── Helpers ────────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function sha1(content) {
  return crypto.createHash("sha1").update(content).digest("hex");
}

/**
 * Normalise a commands.json array to a canonical map keyed by command string,
 * value is "description|category". Order-independent.
 */
function normaliseCommands(arr) {
  if (!Array.isArray(arr)) return null;
  const map = {};
  for (const { command, description, category } of arr) {
    map[command] = `${description}|${category}`;
  }
  return map;
}

/**
 * Compare two commands.json arrays.
 * Returns { same: boolean, added, removed, changed }
 */
function diffCommands(prev, curr) {
  const p = normaliseCommands(prev);
  const c = normaliseCommands(curr);
  if (!p || !c) return { same: false, added: [], removed: [], changed: [] };

  const added = Object.keys(c).filter((k) => !(k in p));
  const removed = Object.keys(p).filter((k) => !(k in c));
  const changed = Object.keys(c).filter((k) => k in p && p[k] !== c[k]);

  return { same: added.length === 0 && removed.length === 0 && changed.length === 0, added, removed, changed };
}

/**
 * Normalise a prompts.json array to a map keyed by slug → sha1 of JSON.
 */
function normalisePrompts(arr) {
  if (!Array.isArray(arr)) return null;
  const map = {};
  for (const entry of arr) {
    map[entry.slug] = sha1(JSON.stringify(entry));
  }
  return map;
}

// Patterns that represent no-op substitutions in prompt files — changes that
// are purely internal refactors with no effect on user-visible doc content.
const PROMPT_NOOP_SUBSTITUTIONS = [
  // "GSD Skill Preferences" inline prose → {{skillActivation}} template variable.
  // The doc pages describe skill loading behaviour already; this is just parameterisation.
  // Matches both sentence-ending (with period) and list-item (without period) variants.
  {
    pattern: /If a `GSD Skill Preferences` block is present in system context, use it to decide which skills to load and follow during [^.\n]+\.?/g,
    replacement: "{{skillActivation}}",
  },
];

/**
 * Normalise prompt file content by applying no-op substitutions, then
 * collapse whitespace so minor formatting differences don't count.
 */
function normalisePromptContent(content) {
  let s = content;
  for (const { pattern, replacement } of PROMPT_NOOP_SUBSTITUTIONS) {
    s = s.replace(pattern, replacement);
  }
  // Collapse multiple blank lines to one, trim trailing whitespace per line
  return s
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Diff two prompt file contents after stripping no-op substitutions.
 * Returns { docRelevant: boolean, reason: string }
 *
 * "Doc relevant" means: after normalisation, content still differs —
 * i.e. something user-visible actually changed.
 */
function diffPromptContent(oldContent, newContent) {
  const oldNorm = normalisePromptContent(oldContent);
  const newNorm = normalisePromptContent(newContent);

  if (oldNorm === newNorm) {
    return { docRelevant: false, reason: "only no-op substitutions (e.g. {{skillActivation}} parameterisation)" };
  }

  // Count changed lines for a terse summary
  const oldLines = new Set(oldNorm.split("\n"));
  const newLines = new Set(newNorm.split("\n"));
  const added = [...newLines].filter((l) => l && !oldLines.has(l)).length;
  const removed = [...oldLines].filter((l) => l && !newLines.has(l)).length;

  // Detect new template variables introduced
  const oldVars = new Set((oldNorm.match(/\{\{(\w+)\}\}/g) || []).map((v) => v.slice(2, -2)));
  const newVars = new Set((newNorm.match(/\{\{(\w+)\}\}/g) || []).map((v) => v.slice(2, -2)));
  const newVarNames = [...newVars].filter((v) => !oldVars.has(v));
  const removedVarNames = [...oldVars].filter((v) => !newVars.has(v));

  const parts = [];
  if (added) parts.push(`+${added} lines`);
  if (removed) parts.push(`-${removed} lines`);
  if (newVarNames.length) parts.push(`new vars: {{${newVarNames.join("}}, {{")}}}`);
  if (removedVarNames.length) parts.push(`removed vars: {{${removedVarNames.join("}}, {{")}}}`);

  return { docRelevant: true, reason: parts.join(", ") || "content changed" };
}

/**
 * Compare extensions.json arrays — check tool names and descriptions.
 * Returns { same: boolean }
 */
function diffExtensions(prev, curr) {
  if (!Array.isArray(prev) || !Array.isArray(curr)) return { same: false };
  const sig = (arr) =>
    arr
      .map((e) => `${e.name}|${e.description}|${(e.tools || []).map((t) => `${t.name}:${t.description}`).join(",")}`)
      .sort()
      .join("\n");
  return { same: sig(prev) === sig(curr) };
}

/**
 * Extract exported symbol names from a TypeScript source file.
 * Simple regex — not a full AST, but good enough for this purpose.
 */
function extractExports(content) {
  const exports = new Set();
  const patterns = [
    /^export\s+(?:async\s+)?function\s+(\w+)/gm,
    /^export\s+(?:const|let|var)\s+(\w+)/gm,
    /^export\s+class\s+(\w+)/gm,
    /^export\s+type\s+(\w+)/gm,
    /^export\s+interface\s+(\w+)/gm,
    /^export\s+enum\s+(\w+)/gm,
    /^export\s+\{([^}]+)\}/gm,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) {
      // Handle named export groups: export { a, b, c }
      if (m[1].includes(",") || m[1].includes(" ")) {
        m[1].split(",").forEach((s) => {
          const name = s.trim().split(/\s+as\s+/).pop().trim();
          if (name) exports.add(name);
        });
      } else {
        exports.add(m[1]);
      }
    }
  }
  return exports;
}

/**
 * Resolve the global gsd-pi package path.
 */
function resolveGlobalPkgPath() {
  try {
    const root = execSync("npm root -g", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    const p = path.join(root, "gsd-pi");
    if (fs.existsSync(p)) return p;
  } catch {}
  return null;
}

/**
 * Get old version of a source file from the previous-manifest.json's recorded
 * headSha, by fetching from the npm registry tarball.
 *
 * This is expensive (network), so we only use it for command-specific .ts files
 * when we can't determine safety from JSON diffs alone.
 *
 * Returns file content string, or null if unavailable.
 */
function fetchOldFileFromNpm(relPath, version, tmpDir) {
  const tarball = path.join(tmpDir, `gsd-pi-${version}.tgz`);
  if (!fs.existsSync(tarball)) {
    try {
      execSync(`npm pack gsd-pi@${version} --quiet`, {
        cwd: tmpDir,
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 30000,
      });
    } catch {
      return null;
    }
  }
  try {
    const result = execSync(`tar -xOf ${tarball} package/${relPath} 2>/dev/null`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result || null;
  } catch {
    return null;
  }
}

// ── Core analysis ──────────────────────────────────────────────────────────

/**
 * Analyse stale pages and partition into mustRegenerate vs skipped.
 *
 * @param {Array<{page: string, changedDeps: string[]}>} stalePages
 * @returns {{ mustRegenerate: Array<{page,changedDeps,reason}>, skipped: Array<{page,reason}>, report: string[] }}
 */
export function analyzeImpact(stalePages) {
  const mustRegenerate = [];
  const skipped = [];
  const report = [];

  if (stalePages.length === 0) return { mustRegenerate, skipped, report };

  // ── Load previous + current structured outputs ───────────────────────────

  const prevCommands = readJson(path.join(GENERATED, "previous-commands.json"));
  const currCommands = readJson(path.join(GENERATED, "commands.json"));
  const prevExtensions = readJson(path.join(GENERATED, "previous-extensions.json"));
  const currExtensions = readJson(path.join(GENERATED, "extensions.json"));

  // Previous gsd-pi version (for fetching old prompt files and ts exports)
  const prevManifest = readJson(path.join(GENERATED, "previous-manifest.json"));
  const prevVersion = prevManifest?.gsdPiVersion;
  const tmpDir = path.join(ROOT, ".cache");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // ── Pre-compute diffs ────────────────────────────────────────────────────

  // Commands diff
  let commandsDiff = null;
  if (prevCommands && currCommands) {
    commandsDiff = diffCommands(prevCommands, currCommands);
  }

  // Extensions diff
  let extensionsDiff = null;
  if (prevExtensions && currExtensions) {
    extensionsDiff = diffExtensions(prevExtensions, currExtensions);
  }

  if (commandsDiff) {
    if (commandsDiff.same) {
      report.push("commands.json: no structural change (command list, descriptions, categories identical)");
    } else {
      const parts = [];
      if (commandsDiff.added.length) parts.push(`+${commandsDiff.added.length} added`);
      if (commandsDiff.removed.length) parts.push(`-${commandsDiff.removed.length} removed`);
      if (commandsDiff.changed.length) parts.push(`~${commandsDiff.changed.length} changed`);
      report.push(`commands.json: ${parts.join(", ")} — ${commandsDiff.added.concat(commandsDiff.removed, commandsDiff.changed).slice(0, 5).join(", ")}`);
    }
  } else {
    report.push("commands.json: no previous snapshot — cannot skip based on commands diff");
  }

  if (extensionsDiff) {
    report.push(`extensions.json: ${extensionsDiff.same ? "no structural change" : "changed"}`);
  }

  report.push("");

  // ── Global gsd-pi path for reading current ts files ──────────────────────

  const globalPkgPath = resolveGlobalPkgPath();

  // ── Per-page analysis ────────────────────────────────────────────────────

  for (const { page, changedDeps } of stalePages) {
    const nonBarrelDeps = changedDeps.filter((d) => !SHARED_BARREL_DEPS.has(d));
    const onlyBarrelDeps = nonBarrelDeps.length === 0;

    // ── Case 1: stale only because of shared barrel deps ────────────────────
    if (onlyBarrelDeps) {
      if (commandsDiff?.same) {
        skipped.push({ page, reason: "shared deps changed but commands.json is identical" });
        continue;
      }
      if (!commandsDiff) {
        // No previous snapshot — can't be sure, regenerate conservatively
        mustRegenerate.push({ page, changedDeps, reason: "no previous commands.json snapshot" });
        continue;
      }
      // Commands actually changed — regenerate
      mustRegenerate.push({ page, changedDeps, reason: `commands changed: ${[...commandsDiff.added, ...commandsDiff.removed, ...commandsDiff.changed].slice(0, 3).join(", ")}` });
      continue;
    }

    // ── Case 2: prompt page (dep is prompts/*.md) ────────────────────────────
    const promptDeps = nonBarrelDeps.filter((d) => d.includes("/prompts/") && d.endsWith(".md"));
    const nonPromptNonBarrel = nonBarrelDeps.filter((d) => !d.includes("/prompts/"));

    if (promptDeps.length > 0 && nonPromptNonBarrel.length === 0) {
      if (!globalPkgPath) {
        mustRegenerate.push({ page, changedDeps, reason: "global gsd-pi path not found" });
        continue;
      }

      const docRelevantChanges = [];
      const noopChanges = [];

      for (const dep of promptDeps) {
        const slug = path.basename(dep, ".md");
        const promptName = path.basename(dep); // e.g. execute-task.md

        // Read current file from global install
        const currPath = path.join(globalPkgPath, dep);
        if (!fs.existsSync(currPath)) {
          docRelevantChanges.push(`${slug}: not found in current package`);
          continue;
        }
        const currContent = fs.readFileSync(currPath, "utf-8");

        // Read old file from previous version tarball
        let oldContent = null;
        if (prevVersion) {
          oldContent = fetchOldFileFromNpm(dep, prevVersion, tmpDir);
        }

        if (!oldContent) {
          // No old version available — can't assess, regenerate conservatively
          docRelevantChanges.push(`${slug}: old version unavailable`);
          continue;
        }

        const { docRelevant, reason } = diffPromptContent(oldContent, currContent);
        if (docRelevant) {
          docRelevantChanges.push(`${slug}: ${reason}`);
        } else {
          noopChanges.push(`${slug}: ${reason}`);
        }
      }

      // Also check barrel deps haven't caused command changes
      const barrelSafe = changedDeps
        .filter((d) => SHARED_BARREL_DEPS.has(d))
        .every(() => commandsDiff?.same);

      if (docRelevantChanges.length === 0 && barrelSafe) {
        const noopSummary = noopChanges.length > 0
          ? noopChanges.join("; ")
          : "prompt content unchanged after normalisation";
        skipped.push({ page, reason: noopSummary });
        continue;
      }

      const reasons = [...docRelevantChanges];
      if (!barrelSafe && commandsDiff && !commandsDiff.same) {
        reasons.push("commands changed");
      }
      mustRegenerate.push({ page, changedDeps, reason: reasons.join("; ") });
      continue;
    }

    // ── Case 3: reference/extensions.mdx ────────────────────────────────────
    if (page === "reference/extensions.mdx") {
      if (extensionsDiff?.same) {
        skipped.push({ page, reason: "extensions.json is identical (tool names and descriptions unchanged)" });
        continue;
      }
      mustRegenerate.push({ page, changedDeps, reason: extensionsDiff ? "extensions changed" : "no previous extensions.json snapshot" });
      continue;
    }

    // ── Case 3b: reference/commands.mdx and reference/shortcuts.mdx ─────────
    // These depend on docs/commands.md — proxy via commands.json structural diff.
    if (page === "reference/commands.mdx" || page === "reference/shortcuts.mdx") {
      if (commandsDiff?.same) {
        skipped.push({ page, reason: "commands.json is identical — docs/commands.md content unchanged for doc purposes" });
        continue;
      }
      mustRegenerate.push({ page, changedDeps, reason: commandsDiff ? `commands changed: ${[...commandsDiff.added, ...commandsDiff.removed, ...commandsDiff.changed].slice(0, 3).join(", ")}` : "no previous commands.json snapshot" });
      continue;
    }

    // ── Case 3c: reference/skills.mdx ───────────────────────────────────────
    // Depends on all skill SKILL.md files — proxy via skills.json.
    if (page === "reference/skills.mdx") {
      const prevSkills = readJson(path.join(GENERATED, "previous-skills.json"));
      const currSkills = readJson(path.join(GENERATED, "skills.json"));
      if (prevSkills && currSkills) {
        const sig = (arr) =>
          Array.isArray(arr)
            ? arr.map((s) => `${s.name}|${s.description}`).sort().join("\n")
            : JSON.stringify(arr);
        if (sig(prevSkills) === sig(currSkills)) {
          skipped.push({ page, reason: "skills.json is identical (names and descriptions unchanged)" });
          continue;
        }
      }
      mustRegenerate.push({ page, changedDeps, reason: "skill content changed or no previous snapshot" });
      continue;
    }

    // ── Case 4: command-specific .ts files ───────────────────────────────────
    const tsDeps = nonBarrelDeps.filter((d) => d.endsWith(".ts"));
    if (tsDeps.length > 0 && globalPkgPath) {
      let allExportsUnchanged = true;
      const exportDiffReasons = [];

      for (const dep of tsDeps) {
        const currentPath = path.join(globalPkgPath, dep);
        if (!fs.existsSync(currentPath)) {
          allExportsUnchanged = false;
          exportDiffReasons.push(`${path.basename(dep)}: not found in current package`);
          continue;
        }

        const currentContent = fs.readFileSync(currentPath, "utf-8");
        const currentExports = extractExports(currentContent);

        let oldExports = null;
        if (prevVersion) {
          const oldContent = fetchOldFileFromNpm(dep, prevVersion, tmpDir);
          if (oldContent) {
            oldExports = extractExports(oldContent);
          }
        }

        if (!oldExports) {
          // Can't get old version — be conservative
          allExportsUnchanged = false;
          exportDiffReasons.push(`${path.basename(dep)}: old version unavailable`);
          continue;
        }

        // Compare export sets
        const added = [...currentExports].filter((e) => !oldExports.has(e));
        const removed = [...oldExports].filter((e) => !currentExports.has(e));
        if (added.length > 0 || removed.length > 0) {
          allExportsUnchanged = false;
          const parts = [];
          if (added.length) parts.push(`+${added.slice(0, 3).join(",")}`);
          if (removed.length) parts.push(`-${removed.slice(0, 3).join(",")}`);
          exportDiffReasons.push(`${path.basename(dep)}: exports changed (${parts.join(" ")})`);
        }
      }

      if (allExportsUnchanged && commandsDiff?.same) {
        skipped.push({ page, reason: "exports unchanged in all specific deps; commands.json identical" });
        continue;
      }

      if (allExportsUnchanged) {
        // Exports ok but commands.json changed — regenerate
        mustRegenerate.push({ page, changedDeps, reason: exportDiffReasons.length ? exportDiffReasons.join("; ") : "commands.json changed" });
        continue;
      }

      mustRegenerate.push({ page, changedDeps, reason: exportDiffReasons.join("; ") });
      continue;
    }

    // ── Default: regenerate ──────────────────────────────────────────────────
    mustRegenerate.push({ page, changedDeps, reason: "unknown dep type — regenerating conservatively" });
  }

  return { mustRegenerate, skipped, report };
}

// ── CLI entry point ────────────────────────────────────────────────────────

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain) {
  const { getStalePages } = await import("../check-page-freshness.mjs");
  const { stalePages } = getStalePages();

  if (stalePages.length === 0) {
    console.log("No stale pages — nothing to analyse.");
    process.exit(0);
  }

  console.log(`Analysing ${stalePages.length} stale page(s)...\n`);
  const { mustRegenerate, skipped, report } = analyzeImpact(stalePages);

  if (report.length) {
    console.log("Source diff summary:");
    report.forEach((l) => console.log(`  ${l}`));
  }

  if (skipped.length > 0) {
    console.log(`\n✓ Skipping ${skipped.length} page(s) — no user-visible content change:`);
    for (const { page, reason } of skipped) {
      console.log(`  - ${page}: ${reason}`);
    }
  }

  if (mustRegenerate.length > 0) {
    console.log(`\n⚠ Must regenerate ${mustRegenerate.length} page(s):`);
    for (const { page, reason } of mustRegenerate) {
      console.log(`  - ${page}: ${reason}`);
    }
  }

  console.log(`\nResult: ${mustRegenerate.length} to regenerate, ${skipped.length} skipped of ${stalePages.length} total.`);
}
