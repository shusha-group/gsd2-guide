/**
 * regenerate-page.mjs — LLM-powered page regeneration via Claude API.
 *
 * Reads source files from the installed gsd-pi package, reads the current page
 * content, constructs a quality-focused prompt with an exemplar page, sends
 * everything to Claude, validates the output, and writes updated MDX.
 *
 * Exports:
 *   regeneratePage(pagePath, sourceFiles, options) → result object
 *   regenerateStalePages(options)                  → batch result object
 *
 * CLI: node scripts/lib/regenerate-page.mjs [pagePath]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePackagePath } from "./extract-local.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

// ── System prompt construction ─────────────────────────────────────────────

/**
 * Build the system prompt with quality rules and the exemplar page.
 * @param {string} exemplarContent — full text of the exemplar page
 * @returns {string}
 */
function buildSystemPrompt(exemplarContent) {
  return `You are a documentation writer for the gsd-pi CLI tool.

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

Output ONLY the complete MDX file content. No markdown code fences. No explanation before or after.`;
}

/**
 * Build the user message with source files and current page content.
 * @param {string} pagePath — content-relative path like "commands/capture.mdx"
 * @param {Array<{path: string, content: string}>} sources — readable source files
 * @param {string} currentPage — current page content (empty string if new page)
 * @returns {string}
 */
function buildUserMessage(pagePath, sources, currentPage) {
  const sourceParts = sources
    .map((s) => `<source path="${s.path}">\n${s.content}\n</source>`)
    .join("\n\n");

  const currentPart = currentPage
    ? `\n\n<current_page>\n${currentPage}\n</current_page>`
    : "";

  return `${sourceParts}${currentPart}

Regenerate the documentation page for \`${pagePath}\`. Use the source code above to ensure accuracy. Match the quality, structure, and style of the exemplar page.`;
}

// ── Core regeneration function ─────────────────────────────────────────────

/**
 * Regenerate a single documentation page via Claude API.
 *
 * @param {string} pagePath — content-relative key like "commands/capture.mdx"
 * @param {string[]} sourceFiles — repo-relative source paths
 * @param {object} [options]
 * @param {boolean} [options.dryRun] — if true, don't write output
 * @param {string} [options.pkgPath] — override gsd-pi package path
 * @param {string} [options.model] — Claude model identifier
 * @param {number} [options.maxTokens] — max output tokens
 * @param {object} [options.client] — pre-built Anthropic client (for testing)
 * @returns {Promise<object>} result with token usage or skip/error info
 */
export async function regeneratePage(pagePath, sourceFiles, options = {}) {
  // API key check first — do NOT import SDK if no key
  if (!options.client && !process.env.ANTHROPIC_API_KEY) {
    return { skipped: true, reason: "no API key" };
  }

  // Resolve package path
  let pkgRoot;
  try {
    pkgRoot = resolvePackagePath(options.pkgPath);
  } catch (err) {
    console.error(`[regenerate] Failed to resolve package path: ${err.message}`);
    return { error: "package path resolution failed", details: err.message };
  }

  // Read source files
  const sources = [];
  for (const dep of sourceFiles) {
    const fullPath = path.join(pkgRoot, dep);
    try {
      const content = fs.readFileSync(fullPath, "utf8");
      sources.push({ path: dep, content });
    } catch {
      console.warn(`⚠ Source file not found: ${dep}`);
    }
  }

  // Read current page (empty string if doesn't exist)
  const pageFullPath = path.join(ROOT, "src", "content", "docs", pagePath);
  let currentPage = "";
  try {
    currentPage = fs.readFileSync(pageFullPath, "utf8");
  } catch {
    // New page — that's fine
  }

  // Read exemplar page
  const exemplarPath = path.join(ROOT, "src", "content", "docs", "commands", "capture.mdx");
  let exemplarContent = "";
  try {
    exemplarContent = fs.readFileSync(exemplarPath, "utf8");
  } catch {
    console.warn("[regenerate] Exemplar page not found: commands/capture.mdx");
  }

  // Construct prompt
  const systemPrompt = buildSystemPrompt(exemplarContent);
  const userMessage = buildUserMessage(pagePath, sources, currentPage);

  // Instantiate client
  let client = options.client;
  if (!client) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    client = new Anthropic();
  }

  // Call Claude API
  const startTime = Date.now();
  let message;
  try {
    message = await client.messages.create({
      model: options.model || "claude-sonnet-4-5-20250929",
      max_tokens: options.maxTokens || 16384,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
  } catch (err) {
    console.error(`[regenerate] API error for ${pagePath}: ${err.message}`);
    return { error: "API call failed", pagePath, details: err.message };
  }

  const elapsedMs = Date.now() - startTime;

  // Extract response text
  const text = message.content[0].text;

  // Check stop reason
  if (message.stop_reason === "max_tokens") {
    console.warn(`⚠ Response truncated (max_tokens) for ${pagePath}`);
  }

  // Validate frontmatter
  if (!text.startsWith("---\n") || text.indexOf("---\n", 4) === -1) {
    console.error(`[regenerate] Invalid frontmatter in response for ${pagePath}`);
    return {
      error: "invalid frontmatter",
      pagePath,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      model: message.model,
      elapsedMs,
      stopReason: message.stop_reason,
    };
  }

  // Write output
  if (!options.dryRun) {
    const outDir = path.dirname(pageFullPath);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(pageFullPath, text);
  }

  return {
    pagePath,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    model: message.model,
    elapsedMs,
    stopReason: message.stop_reason,
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

  /**
   * Format cost estimate for token usage.
   * Sonnet pricing: $3/MTok input, $15/MTok output.
   */
  function formatCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1_000_000) * 3;
    const outputCost = (outputTokens / 1_000_000) * 15;
    const total = inputCost + outputCost;
    return `$${total.toFixed(4)} (in: $${inputCost.toFixed(4)}, out: $${outputCost.toFixed(4)})`;
  }

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
    console.log(`  Tokens: ${result.inputTokens} in / ${result.outputTokens} out`);
    console.log(`  Cost: ${formatCost(result.inputTokens, result.outputTokens)}`);
    console.log(`  Time: ${(result.elapsedMs / 1000).toFixed(1)}s`);
    if (result.stopReason === "max_tokens") {
      console.warn("  ⚠ Response was truncated (max_tokens)");
    }
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
          `  ✓ ${r.pagePath}: ${r.inputTokens} in / ${r.outputTokens} out — ${formatCost(r.inputTokens, r.outputTokens)}`
        );
      }
    }

    // Summary
    console.log(
      `\nBatch complete: ${batch.successCount} success, ${batch.failCount} failed, ${batch.skipCount} skipped`
    );
    if (batch.totalInputTokens > 0) {
      console.log(
        `Total tokens: ${batch.totalInputTokens} in / ${batch.totalOutputTokens} out`
      );
      console.log(`Total cost: ${formatCost(batch.totalInputTokens, batch.totalOutputTokens)}`);
      console.log(`Total time: ${(batch.totalElapsedMs / 1000).toFixed(1)}s`);
    }

    // Exit 1 only if ALL pages failed
    if (batch.successCount === 0 && batch.failCount > 0) {
      process.exit(1);
    }
  }
}
