/**
 * extract-local.mjs — Extract skills, agents, and extension metadata from the
 * locally installed gsd-pi npm package. No network calls.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import matter from "gray-matter";

// ── Package path resolution ────────────────────────────────────────────────

/**
 * Resolve the gsd-pi package path. Uses overridePath if provided,
 * otherwise shells out to `npm root -g` and appends `/gsd-pi`.
 * Validates the path exists and contains src/resources/.
 * @param {string} [overridePath]
 * @returns {string} Absolute path to the gsd-pi package root
 */
export function resolvePackagePath(overridePath) {
  let pkgPath;
  if (overridePath) {
    pkgPath = path.resolve(overridePath);
  } else {
    const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
    pkgPath = path.join(globalRoot, "gsd-pi");
  }

  const resourcesDir = path.join(pkgPath, "src", "resources");
  if (!fs.existsSync(resourcesDir)) {
    throw new Error(
      `[local] gsd-pi package not found at ${pkgPath} — missing src/resources/. ` +
        `Install with: npm i -g gsd-pi`
    );
  }
  return pkgPath;
}

// ── Skills extraction ──────────────────────────────────────────────────────

/**
 * Recursively find all SKILL.md files under a directory.
 * @param {string} dir
 * @param {string[]} [results]
 * @returns {string[]}
 */
function findSkillFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findSkillFiles(full, results);
    } else if (entry.name === "SKILL.md") {
      results.push(full);
    }
  }
  return results;
}

/**
 * Extract content from an XML-like tag in markdown body.
 * @param {string} body
 * @param {string} tagName
 * @returns {string|undefined}
 */
function extractXmlSection(body, tagName) {
  const re = new RegExp(`<${tagName}>\\s*([\\s\\S]*?)\\s*</${tagName}>`, "i");
  const m = body.match(re);
  return m ? m[1].trim() : undefined;
}

/**
 * Extract skills from SKILL.md files under the package's skills directory.
 * @param {string} pkgPath
 * @returns {Array<{name: string, description: string, path: string, parentSkill?: string, objective?: string, arguments?: string, detection?: string}>}
 */
export function extractSkills(pkgPath) {
  const skillsDir = path.join(pkgPath, "src", "resources", "skills");
  if (!fs.existsSync(skillsDir)) {
    console.warn("[local] Skills directory not found:", skillsDir);
    return [];
  }

  const skillFiles = findSkillFiles(skillsDir);
  const skills = [];

  for (const filePath of skillFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter, content: body } = matter(raw);

      // Compute relative path from skills dir (e.g., "lint/SKILL.md")
      const relPath = path.relative(skillsDir, filePath);
      // Determine parent skill for nested references
      const parts = relPath.split(path.sep);
      // Nested: e.g., "github-workflows/references/gh/SKILL.md" has depth > 2
      const isNested = parts.length > 2;
      const parentSkill = isNested ? parts[0] : undefined;

      const skill = {
        name: frontmatter.name || path.basename(path.dirname(filePath)),
        description: frontmatter.description || "",
        path: relPath,
      };

      // Extract structured XML-like sections
      const objective = extractXmlSection(body, "objective");
      const args = extractXmlSection(body, "arguments");
      const detection = extractXmlSection(body, "detection");

      if (objective) skill.objective = objective;
      if (args) skill.arguments = args;
      if (detection) skill.detection = detection;
      if (parentSkill) skill.parentSkill = parentSkill;

      skills.push(skill);
    } catch (err) {
      console.error(`[local] Failed to parse skill at ${filePath}:`, err.message);
    }
  }

  return skills;
}

// ── Agents extraction ──────────────────────────────────────────────────────

/**
 * Extract the first non-empty paragraph from the markdown body.
 * @param {string} body
 * @returns {string}
 */
function extractFirstParagraph(body) {
  const lines = body.split("\n");
  const paraLines = [];
  let started = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!started) {
      if (trimmed.length > 0) {
        started = true;
        paraLines.push(trimmed);
      }
    } else {
      if (trimmed.length === 0) break;
      paraLines.push(trimmed);
    }
  }

  return paraLines.join(" ");
}

/**
 * Extract agents from .md files under the package's agents directory.
 * @param {string} pkgPath
 * @returns {Array<{name: string, description: string, summary: string, tools?: string, model?: string, memory?: string}>}
 */
export function extractAgents(pkgPath) {
  const agentsDir = path.join(pkgPath, "src", "resources", "agents");
  if (!fs.existsSync(agentsDir)) {
    console.warn("[local] Agents directory not found:", agentsDir);
    return [];
  }

  const agents = [];

  for (const entry of fs.readdirSync(agentsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const filePath = path.join(agentsDir, entry.name);
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter, content: body } = matter(raw);

      const agent = {
        name: frontmatter.name || path.basename(entry.name, ".md"),
        description: frontmatter.description || "",
        summary: extractFirstParagraph(body),
      };

      if (frontmatter.tools) agent.tools = frontmatter.tools;
      if (frontmatter.model) agent.model = frontmatter.model;
      if (frontmatter.memory) agent.memory = frontmatter.memory;

      agents.push(agent);
    } catch (err) {
      console.error(`[local] Failed to parse agent at ${filePath}:`, err.message);
    }
  }

  return agents;
}

// ── Extensions extraction ──────────────────────────────────────────────────

/**
 * Extract JSDoc description from the first comment block in a TypeScript file.
 * @param {string} source
 * @returns {string}
 */
function extractJsDocDescription(source) {
  // Match the first JSDoc-style comment block at the top of the file
  const m = source.match(/^\/\*\*\s*([\s\S]*?)\s*\*\//);
  if (!m) return "";

  // Extract the first line or sentence as the description
  const body = m[1]
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => line.length > 0)
    .join(" ");

  // Take up to the first period-terminated sentence, or all of it
  const sentenceMatch = body.match(/^(.+?\.)\s/);
  return sentenceMatch ? sentenceMatch[1] : body;
}

/**
 * Extract all tool definitions from TypeScript source. Handles:
 *   - pi.registerTool({ name: "...", description: "..." })
 *   - return { name: "...", description: "..." } (factory functions)
 *   - Simple strings, multi-line concatenation, template literals
 * @param {string} source — full source content of a .ts file
 * @returns {Array<{name: string, description: string}>}
 */
function extractToolsFromSource(source) {
  const tools = [];
  const seen = new Set();

  // Pattern 1: pi.registerTool({ ... }) blocks
  const registerBlocks = source.matchAll(
    /pi\.registerTool\(\{([\s\S]*?)(?:async\s+execute|execute\s*[:(]|parameters\s*[:{])/g
  );

  for (const match of registerBlocks) {
    const tool = extractToolFromBlock(match[1]);
    if (tool && !seen.has(tool.name)) {
      seen.add(tool.name);
      tools.push(tool);
    }
  }

  // Pattern 2: return { name: "...", ... } in factory functions (e.g., createAsyncBashTool)
  // Only match if this file has ToolDefinition return type
  if (source.includes("ToolDefinition")) {
    const returnBlocks = source.matchAll(
      /return\s*\{([\s\S]*?)(?:async\s+execute|execute\s*[:(]|parameters\s*[:{])/g
    );

    for (const match of returnBlocks) {
      const tool = extractToolFromBlock(match[1]);
      if (tool && !seen.has(tool.name)) {
        seen.add(tool.name);
        tools.push(tool);
      }
    }
  }

  return tools;
}

/**
 * Extract name and description from a tool definition block.
 * @param {string} block
 * @returns {{name: string, description: string} | null}
 */
function extractToolFromBlock(block) {
  const nameMatch = block.match(/name:\s*["'`]([^"'`]+)["'`]/);
  if (!nameMatch) return null;

  let description = "";
  const descMatch = block.match(
    /description:\s*([\s\S]*?)(?:,\s*\n\s*(?:label|promptSnippet|promptGuidelines|parameters|async\s+execute|execute))/
  );
  if (descMatch) {
    description = parseStringValue(descMatch[1].trim());
  }

  return { name: nameMatch[1], description };
}

/**
 * Parse a potentially multi-line string value from TypeScript source.
 * Handles: "str", `str`, "a" + "b" + "c", `a` + `b`
 * @param {string} raw
 * @returns {string}
 */
function parseStringValue(raw) {
  // Remove trailing comma
  const cleaned = raw.replace(/,\s*$/, "").trim();

  // Handle template literal
  if (cleaned.startsWith("`") && cleaned.endsWith("`")) {
    return cleaned.slice(1, -1).trim();
  }

  // Handle string concatenation: "a" + "b" or `a` + `b`
  const parts = cleaned.split(/\s*\+\s*\n?\s*/);
  const result = parts
    .map((part) => {
      const p = part.trim();
      if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
        return p.slice(1, -1);
      }
      if (p.startsWith("`") && p.endsWith("`")) {
        return p.slice(1, -1);
      }
      return p;
    })
    .join("");

  return result.trim();
}

/**
 * Recursively find all .ts files in a directory.
 * @param {string} dir
 * @param {string[]} [results]
 * @returns {string[]}
 */
function findTsFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTsFiles(full, results);
    } else if (entry.name.endsWith(".ts")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Extract extensions from the package's extensions directory.
 * @param {string} pkgPath
 * @returns {Array<{name: string, description: string, tools: Array<{name: string, description: string}>}>}
 */
export function extractExtensions(pkgPath) {
  const extDir = path.join(pkgPath, "src", "resources", "extensions");
  if (!fs.existsSync(extDir)) {
    console.warn("[local] Extensions directory not found:", extDir);
    return [];
  }

  const extensions = [];
  const entries = fs.readdirSync(extDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(extDir, entry.name);

    // Skip shared/ utility directory
    if (entry.name === "shared") continue;

    if (entry.isDirectory()) {
      // Directory extension — read all .ts files recursively for registerTool calls
      const tsFiles = findTsFiles(fullPath);
      let description = "";
      const allTools = [];

      for (const tsFile of tsFiles) {
        const source = fs.readFileSync(tsFile, "utf8");

        // Extract JSDoc from the main index.ts
        if (path.basename(tsFile) === "index.ts" && !description) {
          description = extractJsDocDescription(source);
        }

        const tools = extractToolsFromSource(source);
        allTools.push(...tools);
      }

      // If no index.ts JSDoc, try first .ts file for description
      if (!description && tsFiles.length > 0) {
        const firstSource = fs.readFileSync(tsFiles[0], "utf8");
        description = extractJsDocDescription(firstSource);
      }

      extensions.push({
        name: entry.name,
        description,
        tools: allTools,
      });
    } else if (entry.name.endsWith(".ts")) {
      // Single-file extension
      const source = fs.readFileSync(fullPath, "utf8");
      const description = extractJsDocDescription(source);
      const tools = extractToolsFromSource(source);

      extensions.push({
        name: path.basename(entry.name, ".ts"),
        description,
        tools,
      });
    }
  }

  return extensions;
}

// ── Main orchestrator ──────────────────────────────────────────────────────

/**
 * Run all local extractors and write output JSON files.
 * @param {{ pkgPath?: string, outputDir?: string }} options
 * @returns {Promise<{skills: Array, agents: Array, extensions: Array}>}
 */
export async function extractLocal(options = {}) {
  const pkgPath = resolvePackagePath(options.pkgPath);
  const outputDir = options.outputDir || path.join(process.cwd(), "content", "generated");

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const skills = extractSkills(pkgPath);
  const agents = extractAgents(pkgPath);
  const extensions = extractExtensions(pkgPath);

  // Write output files
  fs.writeFileSync(path.join(outputDir, "skills.json"), JSON.stringify(skills, null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, "agents.json"), JSON.stringify(agents, null, 2) + "\n");
  fs.writeFileSync(
    path.join(outputDir, "extensions.json"),
    JSON.stringify(extensions, null, 2) + "\n"
  );

  console.log(`[local] Skills: ${skills.length}, Agents: ${agents.length}, Extensions: ${extensions.length}`);

  return { skills, agents, extensions };
}
