/**
 * regenerate-page.mjs — LLM-powered page regeneration via claude -p subprocess.
 *
 * Spawns `claude -p` with quality rules as system prompt, task instructions via
 * stdin. Claude reads source files and writes updated MDX directly. Node.js
 * validates frontmatter after the subprocess exits.
 *
 * Exports:
 *   regeneratePage(pagePath, sourceFiles, options) → result object
 *   regenerateStalePages(options)                  → batch result object
 *   findClaude(claudePath?)                        → boolean
 *
 * CLI: node scripts/lib/regenerate-page.mjs [pagePath]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

// ── Curated source mappings for high-dep reference pages ───────────────────

const CURATED_SOURCES = {
  "reference/skills.mdx": ["content/generated/skills.json"],
  "reference/extensions.mdx": ["content/generated/extensions.json"],
  "reference/agents.mdx": ["content/generated/agents.json"],
};

// ── Claude CLI detection ───────────────────────────────────────────────────

/**
 * Check if the `claude` CLI is available.
 * @param {string} [claudePath] — override path to the claude binary
 * @returns {boolean}
 */
export function findClaude(claudePath) {
  const bin = claudePath || "claude";
  try {
    execSync(`${bin} --version`, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

// ── System prompt construction ─────────────────────────────────────────────

/**
 * Build the system prompt with quality rules and the exemplar page.
 * Passed via --system-prompt flag. Does NOT contain source file paths.
 * @param {string} exemplarContent — full text of the exemplar page
 * @returns {string}
 */
function buildSystemPrompt(exemplarContent) {
  return `You are a documentation writer for the gsd-pi CLI tool.
You have access to Read and Write tools to read source files and write updated MDX.

## Quality Rules for Command Pages

### Section Order (exact)
1. What It Does
2. Usage
3. How It Works
4. What Files It Touches
5. Examples
6. Related Commands

### Frontmatter Format
\`\`\`
---
title: "/gsd <command>"
description: "one-line description"
---
\`\`\`

### Mermaid Diagrams
- Use \`flowchart TD\` orientation
- Decision nodes: \`fill:#0d180d,stroke:#39ff14,color:#39ff14\`
- Action nodes: \`fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8\`
- Style classes should be applied with \`style\` statements or \`classDef\`

### Link Format
- Internal links use relative format: \`../slug/\`
- Example: \`[/gsd triage](../triage/)\`

### File Tables
- Use markdown tables with columns: File | Purpose
- Group by Creates / Reads / Writes sections

<exemplar>
${exemplarContent}
</exemplar>

When updating a page, preserve good existing content. Fix only what is outdated or inaccurate based on the current source code. Match the quality, structure, and style of the exemplar page.`;
}

/**
 * Build the system prompt specific to prompt pages.
 * Passed via --system-prompt flag. Does NOT contain source file paths.
 * @param {string} exemplarContent — full text of the exemplar prompt page
 * @returns {string}
 */
function buildPromptSystemPrompt(exemplarContent) {
  return `You are a documentation writer for the gsd-pi CLI tool.
You have access to Read and Write tools to read source files and write updated MDX.

## Quality Rules for Prompt Pages

### Section Order (exact)
1. What It Does
2. Pipeline Position (with Mermaid diagram)
3. Variables (table)
4. Used By (links)

### Frontmatter Format
\`\`\`
---
title: "{prompt-name}"
description: "one-line description"
---
\`\`\`

### Mermaid Diagrams
- Use \`flowchart TD\` orientation
- Decision nodes: \`fill:#0d180d,stroke:#39ff14,color:#39ff14\`
- Action nodes: \`fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8\`
- Apply styles with \`style\` statements

### Variable Table Format
\`\`\`
| Variable | Description | Required |
|----------|-------------|----------|
| \`variableName\` | What this variable provides | Yes/No |
\`\`\`

### MDX Escaping (CRITICAL)
- Template variables like \`{{variable}}\` MUST be wrapped in backticks to avoid JSX parse errors
- Example: write \`{{taskId}}\` not {{taskId}} in prose text

### Link Format
- Command links use: \`../../commands/{slug}/\`
- Example: \`[/gsd auto](../../commands/auto/)\`

<exemplar>
${exemplarContent}
</exemplar>

When updating a page, preserve good existing content. Fix only what is outdated or inaccurate based on the current source code. Match the quality, structure, and style of the exemplar page.`;
}

// ── User message construction ──────────────────────────────────────────────

/**
 * Build the user message (stdin input) that instructs Claude what to do.
 * Lists source file paths for Claude to read — does NOT include file contents.
 * @param {string} pagePath — content-relative path like "commands/capture.mdx"
 * @param {string[]} sourceFiles — repo-relative source paths for Claude to read
 * @param {object} [options]
 * @param {boolean} [options.dryRun] — if true, instruct Claude to output to stdout
 * @returns {string}
 */
function buildUserMessage(pagePath, sourceFiles, options = {}) {
  const pageRelPath = `src/content/docs/${pagePath}`;
  const sourceList = sourceFiles.map((f) => `  - ${f}`).join("\n");

  let writeInstruction;
  if (options.dryRun) {
    writeInstruction = `Output the complete updated MDX content to stdout. Do NOT write any files.`;
  } else {
    writeInstruction = `Write the updated MDX to: ${pageRelPath}`;
  }

  return `You are regenerating the documentation page \`${pagePath}\`.

Read the current page at: ${pageRelPath}
Read these source files (relative to project root):
${sourceList}

Update the page to reflect the current source code. Preserve good existing content. Fix outdated or inaccurate content. Match the section structure and quality of the exemplar in the system prompt.

${writeInstruction}`;
}

/**
 * Apply dep capping: for pages with too many deps, substitute curated source paths.
 * @param {string} pagePath — content-relative path
 * @param {string[]} sourceFiles — original source file list
 * @param {number} threshold — max deps before capping (default: 50)
 * @returns {string[]} — possibly substituted source file list
 */
function capDeps(pagePath, sourceFiles, threshold = 50) {
  if (sourceFiles.length > threshold && CURATED_SOURCES[pagePath]) {
    return CURATED_SOURCES[pagePath];
  }
  return sourceFiles;
}

// ── Stream-json output parsing ─────────────────────────────────────────────

/**
 * Parse stream-json output from `claude -p --output-format stream-json`.
 * Extracts model (from system/init event) and duration/result (from result event).
 * @param {string} stdout — raw stdout from subprocess
 * @returns {{ model: string, durationMs: number, subtype: string, resultText: string }}
 */
export function parseStreamJson(stdout) {
  const parsed = {
    model: "unknown",
    durationMs: 0,
    subtype: "unknown",
    resultText: "",
  };

  if (!stdout) return parsed;

  const lines = stdout.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let obj;
    try {
      obj = JSON.parse(trimmed);
    } catch {
      // Skip non-JSON lines
      continue;
    }

    if (obj.type === "system" && obj.subtype === "init" && obj.model) {
      parsed.model = obj.model;
    }

    if (obj.type === "result") {
      parsed.durationMs = obj.duration_ms || 0;
      parsed.subtype = obj.subtype || "unknown";
      parsed.resultText = obj.result || "";
    }
  }

  return parsed;
}

// ── Core regeneration function ─────────────────────────────────────────────

/**
 * Regenerate a single documentation page via claude -p subprocess.
 *
 * @param {string} pagePath — content-relative key like "commands/capture.mdx"
 * @param {string[]} sourceFiles — repo-relative source paths
 * @param {object} [options]
 * @param {boolean} [options.dryRun] — if true, Claude outputs to stdout instead of writing file
 * @param {string} [options.model] — Claude model identifier (default: 'sonnet')
 * @param {number} [options.timeout] — subprocess timeout in ms (default: 300000)
 * @param {string} [options.claudePath] — override path to claude binary
 * @param {number} [options.depThreshold] — max deps before capping (default: 50)
 * @returns {Promise<object>} result with timing info or skip/error info
 */
export async function regeneratePage(pagePath, sourceFiles, options = {}) {
  const claudePath = options.claudePath || "claude";

  // Check if claude CLI is available
  if (!findClaude(claudePath)) {
    return { skipped: true, reason: "claude CLI not available" };
  }

  // Determine page type and select appropriate system prompt + exemplar
  let systemPrompt;
  if (pagePath.startsWith("prompts/")) {
    // Prompt page path — use prompt-specific exemplar and system prompt
    const exemplarPath = path.join(ROOT, "src", "content", "docs", "prompts", "execute-task.mdx");
    let exemplarContent = "";
    try {
      exemplarContent = fs.readFileSync(exemplarPath, "utf8");
    } catch {
      console.warn("[regenerate] Exemplar page not found: prompts/execute-task.mdx");
    }
    systemPrompt = buildPromptSystemPrompt(exemplarContent);
  } else {
    // Command/reference page — use existing exemplar and system prompt
    const exemplarPath = path.join(ROOT, "src", "content", "docs", "commands", "capture.mdx");
    let exemplarContent = "";
    try {
      exemplarContent = fs.readFileSync(exemplarPath, "utf8");
    } catch {
      console.warn("[regenerate] Exemplar page not found: commands/capture.mdx");
    }
    systemPrompt = buildSystemPrompt(exemplarContent);
  }
  const cappedDeps = capDeps(pagePath, sourceFiles, options.depThreshold || 50);
  const userMessage = buildUserMessage(pagePath, cappedDeps, options);

  // Spawn claude -p subprocess
  const args = [
    "-p",
    "--output-format", "stream-json",
    "--no-session-persistence",
    "--dangerously-skip-permissions",
    "--model", options.model || "sonnet",
    "--system-prompt", systemPrompt,
  ];

  const result = spawnSync(claudePath, args, {
    input: userMessage,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env,
    cwd: ROOT,
    timeout: options.timeout || 300_000,
  });

  // Handle subprocess failure
  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const exitInfo = result.signal
      ? `killed by signal ${result.signal}`
      : `exit code ${result.status}`;
    console.error(`[regenerate] claude -p failed for ${pagePath}: ${exitInfo}`);
    if (stderr) console.error(`  stderr: ${stderr.slice(0, 500)}`);
    return {
      error: "subprocess failed",
      pagePath,
      details: stderr || exitInfo,
    };
  }

  // Parse stream-json output
  const stream = parseStreamJson(result.stdout);

  // Check if claude reported an error in stream-json
  if (stream.subtype === "error") {
    console.error(`[regenerate] claude reported error for ${pagePath}: ${stream.resultText}`);
    return {
      error: "claude error",
      pagePath,
      details: stream.resultText,
      model: stream.model,
      durationMs: stream.durationMs,
    };
  }

  // For dryRun, validate the result text from stream-json
  if (options.dryRun) {
    const text = stream.resultText;
    if (!text.startsWith("---\n") || text.indexOf("---\n", 4) === -1) {
      // dryRun output may not have frontmatter if Claude wrote to file anyway
      // or if the result text is a summary rather than MDX content
      console.warn(`[regenerate] dryRun: result text may not contain raw MDX for ${pagePath}`);
    }
    return {
      pagePath,
      inputTokens: 0,
      outputTokens: 0,
      model: stream.model,
      elapsedMs: stream.durationMs,
      durationMs: stream.durationMs,
    };
  }

  // Validate the written file
  const pageFullPath = path.join(ROOT, "src", "content", "docs", pagePath);
  let pageContent;
  try {
    pageContent = fs.readFileSync(pageFullPath, "utf8");
  } catch (err) {
    console.error(`[regenerate] File not found after subprocess for ${pagePath}: ${err.message}`);
    return {
      error: "file not written",
      pagePath,
      details: `Expected file at ${pageFullPath} but it was not found`,
      model: stream.model,
      durationMs: stream.durationMs,
    };
  }

  // Validate frontmatter
  if (!pageContent.startsWith("---\n") || pageContent.indexOf("---\n", 4) === -1) {
    console.error(`[regenerate] Invalid frontmatter in written file for ${pagePath}`);
    return {
      error: "invalid frontmatter",
      pagePath,
      model: stream.model,
      durationMs: stream.durationMs,
      inputTokens: 0,
      outputTokens: 0,
      elapsedMs: stream.durationMs,
    };
  }

  return {
    pagePath,
    inputTokens: 0,
    outputTokens: 0,
    model: stream.model,
    elapsedMs: stream.durationMs,
    durationMs: stream.durationMs,
  };
}

// ── Batch wrapper ──────────────────────────────────────────────────────────

/**
 * Regenerate all stale pages from stale-pages.json.
 *
 * @param {object} [options] — same options as regeneratePage, plus:
 * @param {string} [options.generatedDir] — override path to generated dir
 * @returns {Promise<object>} batch result with per-page results and totals
 */
export async function regenerateStalePages(options = {}) {
  const generatedDir = options.generatedDir || path.join(ROOT, "content", "generated");

  // Read stale pages
  const stalePath = path.join(generatedDir, "stale-pages.json");
  let staleData;
  try {
    staleData = JSON.parse(fs.readFileSync(stalePath, "utf8"));
  } catch (err) {
    console.error(`[regenerate] Failed to read stale-pages.json: ${err.message}`);
    return { error: "cannot read stale-pages.json", details: err.message, results: [] };
  }

  const stalePages = staleData.stalePages || [];
  if (stalePages.length === 0) {
    return { skipped: true, reason: "no stale pages", results: [] };
  }

  // Read page source map
  const mapPath = path.join(generatedDir, "page-source-map.json");
  let pageSourceMap;
  try {
    pageSourceMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  } catch (err) {
    console.error(`[regenerate] Failed to read page-source-map.json: ${err.message}`);
    return { error: "cannot read page-source-map.json", details: err.message, results: [] };
  }

  // Iterate sequentially
  const results = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalElapsedMs = 0;
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const page of stalePages) {
    const sourceFiles = pageSourceMap[page] || [];
    try {
      const result = await regeneratePage(page, sourceFiles, options);

      if (result.skipped) {
        skipCount++;
      } else if (result.error) {
        failCount++;
      } else {
        successCount++;
        totalInputTokens += result.inputTokens || 0;
        totalOutputTokens += result.outputTokens || 0;
        totalElapsedMs += result.elapsedMs || 0;
      }

      results.push(result);
    } catch (err) {
      console.error(`[regenerate] Unexpected error for ${page}: ${err.message}`);
      failCount++;
      results.push({ pagePath: page, error: "unexpected error", details: err.message });
    }
  }

  return {
    results,
    totalInputTokens,
    totalOutputTokens,
    totalElapsedMs,
    successCount,
    failCount,
    skipCount,
  };
}

// ── CLI entry point ────────────────────────────────────────────────────────

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const pagePath = process.argv[2];

  if (pagePath) {
    // Single page mode — look up source files from page-source-map.json
    const mapPath = path.join(ROOT, "content", "generated", "page-source-map.json");
    let pageSourceMap;
    try {
      pageSourceMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    } catch {
      console.error("[regenerate] page-source-map.json not found. Run build-page-map.mjs first.");
      process.exit(1);
    }

    const sourceFiles = pageSourceMap[pagePath];
    if (!sourceFiles) {
      console.error(`[regenerate] Page "${pagePath}" not found in page-source-map.json`);
      process.exit(1);
    }

    console.log(`Regenerating ${pagePath} (${sourceFiles.length} source files)...`);
    const result = await regeneratePage(pagePath, sourceFiles);

    if (result.skipped) {
      console.log(`⊘ Skipped: ${result.reason}`);
      process.exit(0);
    }

    if (result.error) {
      console.error(`✗ Error: ${result.error}`);
      if (result.details) console.error(`  ${result.details}`);
      process.exit(1);
    }

    console.log(`✓ ${pagePath}`);
    console.log(`  Model: ${result.model}`);
    console.log(`  Duration: ${(result.durationMs / 1000).toFixed(1)}s`);
  } else {
    // Batch mode — regenerate all stale pages
    console.log("Regenerating stale pages...");
    const batch = await regenerateStalePages();

    if (batch.skipped) {
      console.log(`⊘ Skipped: ${batch.reason}`);
      process.exit(0);
    }

    if (batch.error) {
      console.error(`✗ Error: ${batch.error}`);
      if (batch.details) console.error(`  ${batch.details}`);
      process.exit(1);
    }

    // Print per-page results
    for (const r of batch.results) {
      if (r.skipped) {
        console.log(`  ⊘ ${r.pagePath || "?"}: skipped — ${r.reason}`);
      } else if (r.error) {
        console.log(`  ✗ ${r.pagePath || "?"}: ${r.error}`);
      } else {
        console.log(
          `  ✓ ${r.pagePath}: ${(r.durationMs / 1000).toFixed(1)}s (${r.model})`
        );
      }
    }

    // Summary
    console.log(
      `\nBatch complete: ${batch.successCount} success, ${batch.failCount} failed, ${batch.skipCount} skipped`
    );
    if (batch.totalElapsedMs > 0) {
      console.log(`Total time: ${(batch.totalElapsedMs / 1000).toFixed(1)}s`);
    }

    // Exit 1 only if ALL pages failed
    if (batch.successCount === 0 && batch.failCount > 0) {
      process.exit(1);
    }
  }
}
