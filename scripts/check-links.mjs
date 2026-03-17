#!/usr/bin/env node
/**
 * Post-build broken internal link checker.
 *
 * Scans all HTML files in dist/, extracts internal <a href="..."> links
 * that use the /gsd2-guide/ base path, resolves them against the dist/
 * filesystem (stripping the base prefix first), and reports any broken links.
 *
 * Only checks <a> tag hrefs — skips <link> tags (stylesheets, icons, sitemaps).
 * Uses only Node.js built-ins — no npm dependencies.
 *
 * Exit 0  – all links resolve (prints count)
 * Exit 1  – broken links found (prints report)
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST_DIR = 'dist';
const BASE_PATH = '/gsd2-guide';

// Segments to skip even if they start with BASE_PATH (build assets, search index)
const SKIP_SEGMENTS = ['/_astro/', '/pagefind/'];

// ── Collect all HTML files ──────────────────────────────────────────
const htmlFiles = readdirSync(DIST_DIR, { recursive: true })
  .filter((f) => f.endsWith('.html'))
  .map((f) => join(DIST_DIR, f));

// ── Extract and check links ────────────────────────────────────────
// Match <a ... href="..." ...> — captures href from anchor tags only
const aHrefRe = /<a\s[^>]*?href="([^"]+)"/gi;
let totalChecked = 0;
const broken = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8');
  let match;

  while ((match = aHrefRe.exec(html)) !== null) {
    const raw = match[1];

    // Only check absolute internal links with our base path
    if (!raw.startsWith(BASE_PATH + '/') && raw !== BASE_PATH) continue;

    // Skip asset paths (_astro/, pagefind/)
    if (SKIP_SEGMENTS.some((seg) => raw.includes(seg))) continue;

    // Strip hash fragment and query string
    let href = raw.split('#')[0].split('?')[0];

    // Strip the base path prefix → filesystem-relative path
    let localPath = href.slice(BASE_PATH.length); // e.g. "/getting-started/"
    if (!localPath) localPath = '/';

    // Resolve to a file in dist/
    let resolved = false;

    if (localPath.endsWith('/')) {
      // Trailing slash → look for index.html
      resolved = existsSync(join(DIST_DIR, localPath, 'index.html'));
    } else if (extname(localPath)) {
      // Has an extension → resolve directly
      resolved = existsSync(join(DIST_DIR, localPath));
    } else {
      // No extension, no trailing slash → try dir/index.html then .html
      resolved =
        existsSync(join(DIST_DIR, localPath, 'index.html')) ||
        existsSync(join(DIST_DIR, localPath + '.html'));
    }

    totalChecked++;

    if (!resolved) {
      broken.push({
        source: file,
        href: raw,
        resolved: join(DIST_DIR, localPath),
      });
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────
if (broken.length > 0) {
  console.log(`[link-check] ❌ ${broken.length} broken internal link(s) found out of ${totalChecked} checked\n`);
  for (const b of broken) {
    console.log(`  ${b.source}`);
    console.log(`    → ${b.href}`);
    console.log(`    ✗ ${b.resolved}\n`);
  }
  process.exit(1);
} else {
  console.log(`[link-check] ✅ ${totalChecked} internal links checked — 0 broken`);
  process.exit(0);
}
