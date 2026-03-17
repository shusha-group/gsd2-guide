#!/usr/bin/env node
/**
 * extract.mjs — Single-entry-point orchestrator for the content extraction
 * pipeline. Runs local extraction, GitHub docs/releases, command extraction,
 * and manifest build, with CLI flags for path overrides, dry-run, and cache control.
 *
 * Usage:
 *   node scripts/extract.mjs [--pkg-path <path>] [--dry-run] [--no-cache] [--help]
 *   npm run extract
 */

import { extractLocal } from "./lib/extract-local.mjs";
import { extractGithubDocs } from "./lib/extract-github-docs.mjs";
import { extractReleases } from "./lib/extract-releases.mjs";
import { extractCommands } from "./lib/extract-commands.mjs";
import { buildManifest } from "./lib/manifest.mjs";
import fs from "node:fs";
import path from "node:path";

// ── CLI argument parsing ───────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    pkgPath: undefined,
    dryRun: false,
    noCache: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--pkg-path":
        opts.pkgPath = args[++i];
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--no-cache":
        opts.noCache = true;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
      default:
        console.error(`[orchestrator] Unknown flag: ${args[i]}`);
        process.exit(1);
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
Usage: node scripts/extract.mjs [options]

Options:
  --pkg-path <path>  Override the gsd-pi npm package path
  --dry-run          Show extraction plan without writing files
  --no-cache         Force fresh downloads (ignore cached tarball)
  --help, -h         Show this help message

Environment:
  GITHUB_TOKEN       GitHub API token for authenticated requests (optional)

Output:
  content/generated/   Directory containing all extracted content:
    skills.json        Skills from gsd-pi package
    agents.json        Agents from gsd-pi package
    extensions.json    Extensions from gsd-pi package
    commands.json      Commands parsed from documentation
    releases.json      GitHub releases with parsed sections
    manifest.json      File manifest with SHA hashes
    readme.md          Repository README
    docs/              Documentation markdown files
`.trim());
}

// ── Dry-run mode ───────────────────────────────────────────────────────────

async function dryRun(opts) {
  console.log("[orchestrator] Dry-run mode — showing plan without writing files\n");

  // Check package path
  const pkgLabel = opts.pkgPath || "(auto-detect from npm root -g)";
  console.log(`  Package path: ${pkgLabel}`);

  // Check GITHUB_TOKEN
  const hasToken = !!process.env.GITHUB_TOKEN;
  console.log(`  GITHUB_TOKEN: ${hasToken ? "present" : "not set (unauthenticated requests)"}`);

  // Check cache state
  const cacheDir = path.join(process.cwd(), ".cache");
  const shaFile = path.join(cacheDir, "last-sha.txt");
  const hasCachedSha = fs.existsSync(shaFile);
  console.log(`  Cache: ${hasCachedSha ? "tarball cached" : "no cache"}`);
  if (opts.noCache) {
    console.log(`  --no-cache: will force re-download`);
  }

  // Check output directory
  const outputDir = path.join(process.cwd(), "content", "generated");
  const hasOutput = fs.existsSync(outputDir);
  console.log(`  Output dir: ${outputDir} (${hasOutput ? "exists" : "will be created"})`);

  // Check GitHub API reachability
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers = { "User-Agent": "gsd2-guide-extractor" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("https://api.github.com/rate_limit", { headers });
    const data = await res.json();
    const remaining = data.rate?.remaining ?? "unknown";
    console.log(`  GitHub API: reachable (rate limit remaining: ${remaining})`);
  } catch (err) {
    console.log(`  GitHub API: unreachable (${err.message})`);
  }

  console.log("\n  Phases that would run:");
  console.log("    1. [local]       Extract skills, agents, extensions from gsd-pi");
  console.log("    2. [github-docs] Download repo tarball → docs/ + readme.md");
  console.log("    3. [releases]    Fetch GitHub releases → releases.json");
  console.log("    4. [commands]    Parse command tables → commands.json");
  console.log("    5. [manifest]    Build file manifest → manifest.json");
  console.log("\n[orchestrator] Dry-run complete — no files written");
}

// ── Main execution ─────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv);

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  if (opts.dryRun) {
    await dryRun(opts);
    process.exit(0);
  }

  const startTime = Date.now();
  console.log("[orchestrator] Starting content extraction pipeline\n");

  const outputDir = path.join(process.cwd(), "content", "generated");
  const token = process.env.GITHUB_TOKEN || undefined;

  // Clear cache if --no-cache
  if (opts.noCache) {
    const cacheDir = path.join(process.cwd(), ".cache");
    const shaFile = path.join(cacheDir, "last-sha.txt");
    if (fs.existsSync(shaFile)) {
      fs.unlinkSync(shaFile);
      console.log("[orchestrator] Cache cleared (--no-cache)\n");
    }
  }

  const extractOpts = {
    pkgPath: opts.pkgPath,
    outputDir,
    token,
  };

  // Phase 1: Run local + GitHub extraction in parallel (independent)
  console.log("── Phase 1: Parallel extraction ──────────────────────────────\n");

  const [localResult, docsResult, releasesResult] = await Promise.all([
    extractLocal(extractOpts),
    extractGithubDocs(extractOpts),
    extractReleases(extractOpts),
  ]);

  // Phase 2: Command extraction (depends on docs being downloaded)
  console.log("\n── Phase 2: Command extraction ───────────────────────────────\n");

  const commandsResult = await extractCommands(extractOpts);

  // Phase 3: Manifest build (depends on all GitHub data)
  console.log("\n── Phase 3: Manifest build ───────────────────────────────────\n");

  const manifestResult = await buildManifest(extractOpts);

  // Final summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalFiles =
    localResult.skills.length +
    localResult.agents.length +
    localResult.extensions.length +
    commandsResult.count +
    releasesResult.count +
    Object.keys(manifestResult.manifest.files).length +
    docsResult.docsCount +
    (docsResult.readmePath ? 1 : 0);

  console.log("\n── Summary ───────────────────────────────────────────────────\n");
  console.log(`  Skills:     ${localResult.skills.length}`);
  console.log(`  Agents:     ${localResult.agents.length}`);
  console.log(`  Extensions: ${localResult.extensions.length}`);
  console.log(`  Commands:   ${commandsResult.count}`);
  console.log(`  Releases:   ${releasesResult.count}`);
  console.log(`  Docs:       ${docsResult.docsCount} files`);
  console.log(`  README:     ${docsResult.readmePath ? "yes" : "no"}`);
  console.log(`  Manifest:   ${Object.keys(manifestResult.manifest.files).length} files tracked`);
  console.log(
    `  Manifest Δ: +${manifestResult.diff.added.length} added, ~${manifestResult.diff.changed.length} changed, -${manifestResult.diff.removed.length} removed`
  );
  console.log(`\n[orchestrator] Done in ${elapsed}s — ${totalFiles} total content items`);
}

main().catch((err) => {
  console.error(`\n[orchestrator] Fatal error: ${err.message}`);
  process.exit(1);
});
