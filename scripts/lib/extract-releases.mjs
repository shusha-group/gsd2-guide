/**
 * extract-releases.mjs — Fetch all releases from gsd-build/gsd-2 and parse
 * markdown bodies into structured Added/Changed/Fixed sections.
 */

import fs from "node:fs";
import path from "node:path";

const REPO = "gsd-build/gsd-2";
const API_BASE = "https://api.github.com";

/**
 * Build standard headers for GitHub API requests.
 * @param {string} [token]
 * @returns {Record<string,string>}
 */
function githubHeaders(token) {
  const headers = {
    "User-Agent": "gsd2-guide-extractor",
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Parse a release markdown body into structured sections.
 * Looks for ## Added, ## Changed, ## Fixed headings and collects bullets.
 *
 * Bullet format: - **feature** — description
 *   or:          - **feature** - description
 *   or plain:    - description text
 *
 * @param {string} body
 * @returns {{ added: Array<{feature: string, description: string}>, changed: Array<{feature: string, description: string}>, fixed: Array<{feature: string, description: string}> }}
 */
function parseReleaseBody(body) {
  if (!body) return { added: [], changed: [], fixed: [] };

  const sections = { added: [], changed: [], fixed: [] };
  let currentSection = null;

  for (const line of body.split("\n")) {
    const trimmed = line.trim();

    // Detect section headings
    const headingMatch = trimmed.match(/^##\s+(Added|Changed|Fixed)\b/i);
    if (headingMatch) {
      currentSection = headingMatch[1].toLowerCase();
      continue;
    }

    // A new heading that's not one of our sections ends the current section
    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      currentSection = null;
      continue;
    }

    // Collect bullet items
    if (currentSection && sections[currentSection] && trimmed.startsWith("- ")) {
      const bulletText = trimmed.slice(2).trim();

      // Try to parse "**feature** — description" or "**feature** - description"
      const featureMatch = bulletText.match(
        /^\*\*(.+?)\*\*\s*(?:—|-|–)\s*(.*)/
      );

      if (featureMatch) {
        sections[currentSection].push({
          feature: featureMatch[1].trim(),
          description: featureMatch[2].trim(),
        });
      } else {
        // Plain bullet — use full text as description, empty feature
        sections[currentSection].push({
          feature: "",
          description: bulletText,
        });
      }
    }
  }

  return sections;
}

/**
 * Fetch all releases from the GitHub repo and write structured JSON.
 *
 * @param {{ token?: string, outputDir?: string }} options
 * @returns {Promise<{ count: number }>}
 */
export async function extractReleases(options = {}) {
  const token = options.token || process.env.GITHUB_TOKEN || undefined;
  const outputDir = options.outputDir || path.join(process.cwd(), "content", "generated");

  fs.mkdirSync(outputDir, { recursive: true });

  const url = `${API_BASE}/repos/${REPO}/releases?per_page=100`;
  const res = await fetch(url, {
    headers: githubHeaders(token),
  });

  const remaining = res.headers.get("x-ratelimit-remaining");
  console.log(`[releases] API response — rate limit remaining: ${remaining ?? "unknown"}`);

  if (!res.ok) {
    throw new Error(
      `[releases] Failed to fetch releases: HTTP ${res.status} — rate limit remaining: ${remaining ?? "unknown"}`
    );
  }

  const releases = await res.json();

  const structured = releases.map((release) => {
    const { added, changed, fixed } = parseReleaseBody(release.body);

    return {
      tag_name: release.tag_name,
      name: release.name || release.tag_name,
      published_at: release.published_at,
      html_url: release.html_url,
      added,
      changed,
      fixed,
      body: release.body || "",
    };
  });

  const outputPath = path.join(outputDir, "releases.json");
  fs.writeFileSync(outputPath, JSON.stringify(structured, null, 2) + "\n");

  console.log(`[releases] Extracted ${structured.length} releases`);

  return { count: structured.length };
}
