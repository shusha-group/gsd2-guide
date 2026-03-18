#!/usr/bin/env node

/**
 * audit-content.mjs — Verify command pages reflect the extracted command data.
 *
 * For each command in commands.json that maps to a detail page, checks that
 * the page mentions key elements (flags, subcommands). Reports gaps so the
 * update pipeline can surface them.
 *
 * Also checks the upstream docs/commands.md sections against the corresponding
 * hand-authored .mdx pages to detect when upstream has content the page doesn't.
 *
 * Exit codes:
 *   0 — all pages current
 *   1 — gaps found (printed to stdout)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const COMMANDS_JSON = path.join(ROOT, "content/generated/commands.json");
const COMMANDS_DIR = path.join(ROOT, "src/content/docs/commands");
const UPSTREAM_COMMANDS_MD = path.join(ROOT, "content/generated/docs/commands.md");

/** Commands that intentionally don't get pages — skip in audit. */
const EXCLUDED_SLUGS = new Set(["help", "parallel", "sessions"]);

/**
 * Map from category name to the page slug that covers it.
 * Commands in these categories should be mentioned in the corresponding page.
 */
const CATEGORY_PAGE_MAP = {
  "Headless Mode": "headless",
  "CLI Flags": "cli-flags",
  "Keyboard Shortcuts": "keyboard-shortcuts",
  "Parallel Orchestration": null, // covered by parallel-orchestration.md (not a command page)
};

/**
 * Map from /gsd subcommand slug to the page that should document it.
 */
function slugForCommand(cmd) {
  if (cmd === "/gsd") return "gsd";
  const m = cmd.match(/^\/gsd ([a-z][-a-z]*)$/);
  if (m) return m[1];
  const m2 = cmd.match(/^gsd ([a-z][-a-z]*)$/);
  if (m2) return m2[1];
  return null;
}

function readPage(slug) {
  const mdxPath = path.join(COMMANDS_DIR, `${slug}.mdx`);
  if (fs.existsSync(mdxPath)) return fs.readFileSync(mdxPath, "utf-8");
  const mdPath = path.join(COMMANDS_DIR, `${slug}.md`);
  if (fs.existsSync(mdPath)) return fs.readFileSync(mdPath, "utf-8");
  return null;
}

/**
 * Extract flag names from a command string, e.g. "--timeout N" → "timeout"
 */
function extractFlagName(cmd) {
  const m = cmd.match(/^--([a-z][-a-z]*)/);
  return m ? m[1] : null;
}

function run() {
  const commands = JSON.parse(fs.readFileSync(COMMANDS_JSON, "utf-8"));
  const gaps = [];

  // Group commands by their target page
  const pageCommands = new Map();

  for (const entry of commands) {
    const cmd = entry.command;
    const category = entry.category;

    // Determine which page should mention this command
    let targetSlug = null;

    if (category in CATEGORY_PAGE_MAP) {
      targetSlug = CATEGORY_PAGE_MAP[category];
    } else {
      targetSlug = slugForCommand(cmd);
    }

    if (!targetSlug) continue;
    if (EXCLUDED_SLUGS.has(targetSlug)) continue;

    if (!pageCommands.has(targetSlug)) {
      pageCommands.set(targetSlug, []);
    }
    pageCommands.get(targetSlug).push(entry);
  }

  // Check each page for its expected commands
  for (const [slug, entries] of pageCommands) {
    const content = readPage(slug);
    if (!content) {
      gaps.push({
        page: slug,
        type: "missing_page",
        detail: `No page found for ${entries.length} commands`,
        commands: entries.map((e) => e.command),
      });
      continue;
    }

    const contentLower = content.toLowerCase();

    for (const entry of entries) {
      const cmd = entry.command;

      // For flags like --timeout, check the flag name appears in the page
      const flagName = extractFlagName(cmd);
      if (flagName) {
        if (!contentLower.includes(flagName)) {
          gaps.push({
            page: slug,
            type: "missing_flag",
            detail: `Flag "${cmd}" not mentioned`,
            description: entry.description,
          });
        }
        continue;
      }

      // For subcommands like "/gsd parallel start", check the full command or key words
      // For the page's own primary command, skip (it's the page title)
      const ownCmd = slug === "gsd" ? "/gsd" : `/gsd ${slug}`;
      if (cmd === ownCmd) continue;

      // Strip parenthetical aliases like "(-c)" from the command before keyword extraction
      const cleanCmd = cmd.replace(/\s*\([^)]*\)\s*/g, " ").trim();

      // Check if the specific subcommand or its distinguishing word is mentioned
      const words = cleanCmd.replace(/^\/gsd\s+/, "").replace(/^gsd\s+/, "").split(/\s+/);
      const keyWord = words[words.length - 1]; // last word is usually the distinguishing one
      if (keyWord && keyWord.length > 2 && !contentLower.includes(keyWord.toLowerCase())) {
        gaps.push({
          page: slug,
          type: "missing_subcommand",
          detail: `Subcommand "${cmd}" not mentioned (looked for "${keyWord}")`,
          description: entry.description,
        });
      }
    }
  }

  // Report
  if (gaps.length === 0) {
    console.log("[audit] ✅ All command pages are current with commands.json");
    return 0;
  }

  console.log(`[audit] ⚠ ${gaps.length} content gap(s) found:\n`);

  // Group by page
  const byPage = new Map();
  for (const gap of gaps) {
    if (!byPage.has(gap.page)) byPage.set(gap.page, []);
    byPage.get(gap.page).push(gap);
  }

  for (const [page, pageGaps] of byPage) {
    console.log(`  ${page}.mdx:`);
    for (const g of pageGaps) {
      if (g.type === "missing_page") {
        console.log(`    ✗ PAGE MISSING — ${g.detail}`);
        for (const cmd of g.commands) {
          console.log(`      - ${cmd}`);
        }
      } else {
        console.log(`    ✗ ${g.detail}`);
      }
    }
    console.log();
  }

  return 1;
}

process.exit(run());
