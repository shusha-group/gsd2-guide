/**
 * manage-pages.mjs — Detect new/removed commands and manipulate sidebar entries
 * and page-source-map entries.
 *
 * Exports:
 *   detectNewAndRemovedCommands(options?)
 *   addSidebarEntry(slug, options?)
 *   removeSidebarEntry(slug, options?)
 *   addToPageMap(slug, options?)
 *   removeFromPageMap(slug, options?)
 *
 * All functions accept an options object with path overrides for testability.
 * Defaults resolve from ROOT (project root, computed via import.meta.url).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

// ─── Constants ───────────────────────────────────────────────────────────────

/** Commands that intentionally don't get pages. */
const EXCLUDED_SLUGS = ["help", "parallel"];

/** Pages in commands/ that aren't auto-managed command pages. */
const NON_COMMAND_PAGES = ["keyboard-shortcuts", "cli-flags", "headless"];

/** Regex matching top-level /gsd subcommands (single-word, lowercase, with hyphens). */
const COMMAND_RE = /^\/gsd [a-z][-a-z]*$/;

const GSD = "src/resources/extensions/gsd";
const SHARED_COMMAND_DEPS = [
  `${GSD}/commands.ts`,
  `${GSD}/state.ts`,
  `${GSD}/types.ts`,
];

// ─── Detection ───────────────────────────────────────────────────────────────

/**
 * Detect new and removed commands by comparing commands.json against existing
 * .mdx pages in the commands directory.
 *
 * @param {object} [options]
 * @param {string} [options.commandsPath] - Path to commands.json
 * @param {string} [options.commandsDir]  - Path to commands/ directory with .mdx files
 * @returns {{ newCommands: string[], removedCommands: string[] }}
 */
export function detectNewAndRemovedCommands(options = {}) {
  const commandsPath =
    options.commandsPath ||
    path.join(ROOT, "content/generated/commands.json");
  const commandsDir =
    options.commandsDir ||
    path.join(ROOT, "src/content/docs/commands");

  // Read and parse commands.json
  const commands = JSON.parse(fs.readFileSync(commandsPath, "utf-8"));

  // Extract slugs from commands.json:
  // - Bare "/gsd" → slug "gsd"
  // - "/gsd <word>" matching COMMAND_RE → slug is the word after "/gsd "
  const commandSlugs = new Set();
  for (const entry of commands) {
    const cmd = entry.command;
    if (cmd === "/gsd") {
      commandSlugs.add("gsd");
    } else if (COMMAND_RE.test(cmd)) {
      const slug = cmd.slice("/gsd ".length);
      commandSlugs.add(slug);
    }
  }

  // Remove excluded slugs
  for (const excluded of EXCLUDED_SLUGS) {
    commandSlugs.delete(excluded);
  }

  // Read existing .mdx files and extract slugs
  const existingFiles = fs
    .readdirSync(commandsDir)
    .filter((f) => f.endsWith(".mdx"));
  const existingSlugs = new Set(
    existingFiles.map((f) => f.replace(".mdx", ""))
  );

  // Remove non-command pages from consideration
  for (const nonCmd of NON_COMMAND_PAGES) {
    existingSlugs.delete(nonCmd);
  }

  // New = in commands.json but no .mdx page
  const newCommands = [...commandSlugs]
    .filter((slug) => !existingSlugs.has(slug))
    .sort();

  // Removed = has .mdx page but not in commands.json
  const removedCommands = [...existingSlugs]
    .filter((slug) => !commandSlugs.has(slug))
    .sort();

  return { newCommands, removedCommands };
}

// ─── Sidebar manipulation ────────────────────────────────────────────────────

/**
 * Add a sidebar entry for a new command. Inserts before the "Keyboard Shortcuts" line.
 *
 * @param {string} slug - Command slug (e.g. "fake-test")
 * @param {object} [options]
 * @param {string} [options.configPath] - Path to astro.config.mjs
 * @returns {{ added: true, slug: string }}
 */
export function addSidebarEntry(slug, options = {}) {
  const configPath =
    options.configPath || path.join(ROOT, "astro.config.mjs");

  let content = fs.readFileSync(configPath, "utf-8");
  const lines = content.split("\n");

  // Find the "Keyboard Shortcuts" line
  const boundaryIdx = lines.findIndex((line) =>
    line.includes("'Keyboard Shortcuts'")
  );
  if (boundaryIdx === -1) {
    throw new Error(
      "Could not find 'Keyboard Shortcuts' boundary in sidebar config"
    );
  }

  // Build the label: bare "gsd" slug → "/gsd", otherwise "/gsd <slug>"
  const label = slug === "gsd" ? "/gsd" : `/gsd ${slug}`;
  const newLine = `            { label: '${label}', link: '/commands/${slug}/' },`;

  // Insert before the boundary line
  lines.splice(boundaryIdx, 0, newLine);
  fs.writeFileSync(configPath, lines.join("\n"));

  return { added: true, slug };
}

/**
 * Remove a sidebar entry for a removed command.
 *
 * @param {string} slug - Command slug
 * @param {object} [options]
 * @param {string} [options.configPath] - Path to astro.config.mjs
 * @returns {{ removed: boolean, slug: string, reason?: string }}
 */
export function removeSidebarEntry(slug, options = {}) {
  const configPath =
    options.configPath || path.join(ROOT, "astro.config.mjs");

  let content = fs.readFileSync(configPath, "utf-8");
  const lines = content.split("\n");

  // For the bare "gsd" slug, the label is "/gsd" with link "/commands/gsd/"
  // For other slugs, the label is "/gsd <slug>"
  // Match by link to be precise — avoids false matches
  const linkPattern = `/commands/${slug}/`;

  // For the "gsd" slug, we need to distinguish "/gsd" (label) from "/gsd auto" etc.
  // The most reliable match is the link pattern since it's unique per page.
  const targetIdx = lines.findIndex((line) => {
    if (!line.includes(linkPattern)) return false;
    // Confirm it's a sidebar entry line (has label and link)
    if (!line.includes("label:") || !line.includes("link:")) return false;
    return true;
  });

  if (targetIdx === -1) {
    return { removed: false, slug, reason: "not found" };
  }

  lines.splice(targetIdx, 1);
  fs.writeFileSync(configPath, lines.join("\n"));

  return { removed: true, slug };
}

// ─── Page-source-map manipulation ────────────────────────────────────────────

/**
 * Add a page-source-map entry for a new command. Computes algorithmic deps
 * from the manifest (shared deps + slug.ts + prompts/slug.md if they exist).
 *
 * @param {string} slug - Command slug
 * @param {object} [options]
 * @param {string} [options.mapPath]      - Path to page-source-map.json
 * @param {string} [options.manifestPath] - Path to manifest.json
 * @returns {{ added: true, slug: string, deps: string[] }}
 */
export function addToPageMap(slug, options = {}) {
  const mapPath =
    options.mapPath ||
    path.join(ROOT, "content/generated/page-source-map.json");
  const manifestPath =
    options.manifestPath ||
    path.join(ROOT, "content/generated/manifest.json");

  const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const manifestFiles = new Set(Object.keys(manifest.files));

  // Compute algorithmic deps
  const deps = [...SHARED_COMMAND_DEPS];

  const tsPath = `${GSD}/${slug}.ts`;
  if (manifestFiles.has(tsPath)) {
    deps.push(tsPath);
  }

  const promptPath = `${GSD}/prompts/${slug}.md`;
  if (manifestFiles.has(promptPath)) {
    deps.push(promptPath);
  }

  const pageKey = `commands/${slug}.mdx`;
  map[pageKey] = deps;

  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + "\n");

  return { added: true, slug, deps };
}

/**
 * Remove a page-source-map entry for a removed command.
 *
 * @param {string} slug - Command slug
 * @param {object} [options]
 * @param {string} [options.mapPath] - Path to page-source-map.json
 * @returns {{ removed: boolean, slug: string, reason?: string }}
 */
export function removeFromPageMap(slug, options = {}) {
  const mapPath =
    options.mapPath ||
    path.join(ROOT, "content/generated/page-source-map.json");

  const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
  const pageKey = `commands/${slug}.mdx`;

  if (!(pageKey in map)) {
    return { removed: false, slug, reason: "not found" };
  }

  delete map[pageKey];
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + "\n");

  return { removed: true, slug };
}
