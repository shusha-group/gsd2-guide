/**
 * extract-github-docs.mjs — Download the gsd-build/gsd-2 repo via tarball,
 * extract docs/**\/*.md and README.md to content/generated/.
 * Caches tarball locally with SHA-based invalidation.
 */

import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { extract as tarExtract } from "tar";

const REPO = "gsd-build/gsd-2";
const API_BASE = "https://api.github.com";

/**
 * Build standard headers for GitHub API requests.
 * @param {string} [token]
 * @param {Record<string,string>} [extra]
 * @returns {Record<string,string>}
 */
function githubHeaders(token, extra = {}) {
  const headers = {
    "User-Agent": "gsd2-guide-extractor",
    ...extra,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Log rate-limit remaining from a GitHub API response.
 * @param {Response} res
 * @param {string} label
 */
function logRateLimit(res, label) {
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (remaining !== null) {
    console.log(`[github-docs] ${label} — rate limit remaining: ${remaining}`);
  }
}

/**
 * Fetch the HEAD SHA of the main branch.
 * @param {string} [token]
 * @returns {Promise<string>}
 */
async function fetchHeadSha(token) {
  const url = `${API_BASE}/repos/${REPO}/commits/main`;
  const res = await fetch(url, {
    headers: githubHeaders(token, {
      Accept: "application/vnd.github.sha",
    }),
  });
  logRateLimit(res, "HEAD SHA check");

  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new Error(
      `[github-docs] Failed to fetch HEAD SHA: HTTP ${res.status} — rate limit remaining: ${remaining ?? "unknown"}`
    );
  }

  return (await res.text()).trim();
}

/**
 * Download the tarball for the main branch.
 * @param {string} destPath — where to save the .tar.gz
 * @param {string} [token]
 */
async function downloadTarball(destPath, token) {
  const url = `${API_BASE}/repos/${REPO}/tarball/main`;
  const res = await fetch(url, {
    headers: githubHeaders(token),
    redirect: "follow",
  });
  logRateLimit(res, "tarball download");

  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new Error(
      `[github-docs] Failed to download tarball: HTTP ${res.status} — rate limit remaining: ${remaining ?? "unknown"}`
    );
  }

  const fileStream = fs.createWriteStream(destPath);
  await pipeline(res.body, fileStream);
}

/**
 * Extract docs/**\/*.md and README.md from a tarball, stripping the first
 * path component (the variable gsd-build-gsd-2-{sha}/ prefix).
 *
 * @param {string} tarballPath
 * @param {string} outputDir — e.g. content/generated
 * @returns {Promise<{docsCount: number, readmePath: string|null}>}
 */
async function extractFromTarball(tarballPath, outputDir) {
  const docsDir = path.join(outputDir, "docs");
  // Clean previous docs to avoid stale files
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(docsDir, { recursive: true });

  let docsCount = 0;
  let readmePath = null;

  await tarExtract({
    file: tarballPath,
    strip: 1, // Remove the gsd-build-gsd-2-{sha}/ prefix
    filter: (entryPath) => {
      // After stripping, tar gives us paths relative to the repo root.
      // But the filter sees the ORIGINAL path before stripping.
      // We need to match: {prefix}/docs/**/*.md and {prefix}/README.md
      const parts = entryPath.split("/");
      if (parts.length < 2) return false;
      const relPath = parts.slice(1).join("/");
      if (relPath === "README.md") return true;
      if (relPath.startsWith("docs/") && relPath.endsWith(".md")) return true;
      return false;
    },
    cwd: outputDir,
    onentry: (entry) => {
      const parts = entry.path.split("/");
      const relPath = parts.slice(1).join("/");
      if (relPath === "README.md") {
        // Rename to lowercase readme.md via onentry isn't straightforward;
        // we'll handle this post-extraction
      } else if (relPath.startsWith("docs/") && relPath.endsWith(".md")) {
        docsCount++;
      }
    },
  });

  // Move README.md → readme.md (lowercase as per plan)
  const upperReadme = path.join(outputDir, "README.md");
  const lowerReadme = path.join(outputDir, "readme.md");
  if (fs.existsSync(upperReadme)) {
    fs.renameSync(upperReadme, lowerReadme);
    readmePath = lowerReadme;
  } else if (fs.existsSync(lowerReadme)) {
    readmePath = lowerReadme;
  }

  // Recount docs after extraction (more reliable than onentry)
  docsCount = countMdFiles(docsDir);

  return { docsCount, readmePath };
}

/**
 * Recursively count .md files in a directory.
 * @param {string} dir
 * @returns {number}
 */
function countMdFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countMdFiles(full);
    } else if (entry.name.endsWith(".md")) {
      count++;
    }
  }
  return count;
}

/**
 * Extract GitHub docs from the gsd-build/gsd-2 repo.
 *
 * @param {{ token?: string, cacheDir?: string, outputDir?: string }} options
 * @returns {Promise<{ docsCount: number, readmePath: string|null }>}
 */
export async function extractGithubDocs(options = {}) {
  const token = options.token || process.env.GITHUB_TOKEN || undefined;
  const cacheDir = options.cacheDir || path.join(process.cwd(), ".cache");
  const outputDir = options.outputDir || path.join(process.cwd(), "content", "generated");

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  if (token) {
    console.log("[github-docs] Using authenticated requests (GITHUB_TOKEN present)");
  } else {
    console.log("[github-docs] Using unauthenticated requests (no GITHUB_TOKEN)");
  }

  // 1. Check HEAD SHA
  const headSha = await fetchHeadSha(token);
  const shaFile = path.join(cacheDir, "last-sha.txt");
  const tarballFile = path.join(cacheDir, "tarball.tar.gz");

  // 2. Check cache
  let cachedSha = null;
  if (fs.existsSync(shaFile)) {
    cachedSha = fs.readFileSync(shaFile, "utf8").trim();
  }

  if (cachedSha === headSha && fs.existsSync(tarballFile)) {
    console.log(`[github-docs] Cache hit — HEAD SHA unchanged (${headSha.slice(0, 8)})`);
  } else {
    if (cachedSha) {
      console.log(
        `[github-docs] SHA changed: ${cachedSha.slice(0, 8)} → ${headSha.slice(0, 8)}, re-downloading tarball`
      );
    } else {
      console.log(`[github-docs] No cache, downloading tarball (HEAD: ${headSha.slice(0, 8)})`);
    }
    await downloadTarball(tarballFile, token);
    fs.writeFileSync(shaFile, headSha + "\n");
  }

  // 3. Extract docs from tarball
  const { docsCount, readmePath } = await extractFromTarball(tarballFile, outputDir);

  console.log(`[github-docs] Extracted ${docsCount} docs, README: ${readmePath ? "yes" : "no"}`);

  return { docsCount, readmePath };
}
