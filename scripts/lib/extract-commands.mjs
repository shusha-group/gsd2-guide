/**
 * extract-commands.mjs — Parse command/shortcut/flag tables from downloaded
 * markdown docs and README. Produces a flat array of {command, description, category}.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Parse markdown tables from content. Detects header rows with two columns
 * (Command/Flag/Shortcut | Description/Action/What it does) and extracts
 * subsequent data rows.
 *
 * @param {string} content — raw markdown
 * @param {string} fallbackCategory — used when no ## heading precedes the table
 * @returns {Array<{command: string, description: string, category: string}>}
 */
function parseCommandTables(content, fallbackCategory = "General") {
  const lines = content.split("\n");
  const commands = [];
  let currentCategory = fallbackCategory;
  let inTable = false;
  let headerSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track ## headings as category names
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      currentCategory = headingMatch[1].trim();
      inTable = false;
      headerSeen = false;
      continue;
    }

    // Detect table header row — must have a pipe-separated row with command-like
    // header in the first column
    if (
      !inTable &&
      /^\|/.test(line) &&
      /command|flag|shortcut/i.test(line) &&
      /description|action|what it does/i.test(line)
    ) {
      inTable = true;
      headerSeen = false;
      continue;
    }

    // Skip separator row (|---|---|)
    if (inTable && !headerSeen && /^\|[\s-|]+\|$/.test(line)) {
      headerSeen = true;
      continue;
    }

    // Parse data rows
    if (inTable && headerSeen) {
      if (!line.startsWith("|")) {
        // End of table
        inTable = false;
        headerSeen = false;
        continue;
      }

      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      if (cells.length >= 2) {
        // Clean up backticks and trim
        const rawCommand = cells[0].replace(/`/g, "").trim();
        const description = cells[1].replace(/`/g, "").trim();

        if (rawCommand && description) {
          commands.push({
            command: rawCommand,
            description,
            category: currentCategory,
          });
        }
      }
    }
  }

  return commands;
}

/**
 * Merge two command arrays, deduplicating by command name.
 * The first occurrence wins (docs/commands.md takes priority over README).
 *
 * @param {Array<{command: string, description: string, category: string}>} primary
 * @param {Array<{command: string, description: string, category: string}>} secondary
 * @returns {Array<{command: string, description: string, category: string}>}
 */
function mergeCommands(primary, secondary) {
  const seen = new Set(primary.map((c) => c.command));
  const merged = [...primary];

  for (const cmd of secondary) {
    if (!seen.has(cmd.command)) {
      seen.add(cmd.command);
      merged.push(cmd);
    }
  }

  return merged;
}

/**
 * Extract commands from downloaded docs markdown tables.
 *
 * @param {{ outputDir?: string }} options
 * @returns {Promise<{ count: number }>}
 */
export async function extractCommands(options = {}) {
  const outputDir =
    options.outputDir || path.join(process.cwd(), "content", "generated");

  // Primary source: docs/commands.md
  const commandsPath = path.join(outputDir, "docs", "commands.md");
  let commands = [];

  if (fs.existsSync(commandsPath)) {
    const content = fs.readFileSync(commandsPath, "utf8");
    commands = parseCommandTables(content);
    console.log(`[commands] Parsed ${commands.length} commands from docs/commands.md`);
  } else {
    console.warn("[commands] docs/commands.md not found — skipping primary source");
  }

  // Secondary source: readme.md (may have additional commands)
  const readmePath = path.join(outputDir, "readme.md");
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, "utf8");
    const readmeCommands = parseCommandTables(readmeContent, "README Commands");
    if (readmeCommands.length > 0) {
      const beforeCount = commands.length;
      commands = mergeCommands(commands, readmeCommands);
      const added = commands.length - beforeCount;
      if (added > 0) {
        console.log(`[commands] Merged ${added} additional commands from readme.md`);
      }
    }
  }

  // Write output
  const outputPath = path.join(outputDir, "commands.json");
  fs.writeFileSync(outputPath, JSON.stringify(commands, null, 2) + "\n");

  console.log(`[commands] Total: ${commands.length} commands across ${new Set(commands.map((c) => c.category)).size} categories`);

  return { count: commands.length };
}
