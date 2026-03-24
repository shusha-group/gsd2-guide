/**
 * manifest.mjs — Build a content manifest using the GitHub tree API.
 * Tracks file paths and SHA hashes for diff-based cache invalidation.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const REPO = "gsd-build/gsd-2";
const API_BASE = "https://api.github.com";
const MANIFEST_VERSION = 1;

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
 * Compute the diff between two file-SHA maps.
 * @param {Record<string,string>} oldFiles
 * @param {Record<string,string>} newFiles
 * @returns {{ added: string[], changed: string[], removed: string[] }}
 */
function computeDiff(oldFiles, newFiles) {
  const added = [];
  const changed = [];
  const removed = [];

  for (const [filePath, sha] of Object.entries(newFiles)) {
    if (!(filePath in oldFiles)) {
      added.push(filePath);
    } else if (oldFiles[filePath] !== sha) {
      changed.push(filePath);
    }
  }

  for (const filePath of Object.keys(oldFiles)) {
    if (!(filePath in newFiles)) {
      removed.push(filePath);
    }
  }

  return { added, changed, removed };
}

/**
 * Build the content manifest from the GitHub tree API.
 *
 * @param {{ token?: string, outputDir?: string }} options
 * @returns {Promise<{ manifest: object, diff: { added: string[], changed: string[], removed: string[] } }>}
 */
export async function buildManifest(options = {}) {
  const token = options.token || process.env.GITHUB_TOKEN || undefined;
  const outputDir = options.outputDir || path.join(process.cwd(), "content", "generated");

  fs.mkdirSync(outputDir, { recursive: true });

  // Fetch the recursive tree
  const url = `${API_BASE}/repos/${REPO}/git/trees/main?recursive=1`;
  const res = await fetch(url, {
    headers: githubHeaders(token),
  });

  const remaining = res.headers.get("x-ratelimit-remaining");
  console.log(`[manifest] API response — rate limit remaining: ${remaining ?? "unknown"}`);

  if (!res.ok) {
    throw new Error(
      `[manifest] Failed to fetch tree: HTTP ${res.status} — rate limit remaining: ${remaining ?? "unknown"}`
    );
  }

  const data = await res.json();

  // Extract HEAD SHA from the tree response (it's the sha of the tree itself)
  // We also need the HEAD commit SHA — fetch it separately or derive
  // The tree API returns the tree SHA, not the commit SHA. Use the SHA from
  // the last-sha.txt cache if available, otherwise use the tree SHA as a proxy.
  const cacheShaFile = path.join(process.cwd(), ".cache", "last-sha.txt");
  let headSha = data.sha; // tree SHA as fallback
  if (fs.existsSync(cacheShaFile)) {
    headSha = fs.readFileSync(cacheShaFile, "utf8").trim();
  }

  // Capture installed gsd-pi version for impact analysis (export-diff fallback)
  let gsdPiVersion = null;
  try {
    const out = execSync("npm list -g gsd-pi --json 2>/dev/null", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const parsed = JSON.parse(out);
    gsdPiVersion = parsed?.dependencies?.["gsd-pi"]?.version || null;
  } catch {}

  // Build file map: only blobs (not trees)
  const files = {};
  for (const item of data.tree) {
    if (item.type === "blob") {
      files[item.path] = item.sha;
    }
  }

  const manifest = {
    version: MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    headSha,
    gsdPiVersion,
    files,
  };

  // Read previous manifest for diff
  const manifestPath = path.join(outputDir, "manifest.json");
  let oldFiles = {};
  if (fs.existsSync(manifestPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      oldFiles = prev.files || {};
    } catch {
      // Corrupt or missing — treat as empty
    }
  }

  const diff = computeDiff(oldFiles, files);

  // Write new manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  console.log(
    `[manifest] ${Object.keys(files).length} files tracked — ` +
      `${diff.added.length} added, ${diff.changed.length} changed, ${diff.removed.length} removed`
  );

  return { manifest, diff };
}
