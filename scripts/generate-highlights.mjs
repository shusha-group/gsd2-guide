#!/usr/bin/env node
/**
 * generate-highlights.mjs — Build changelog-highlights.json from releases.json.
 *
 * Parses the markdown body of each release to extract the first bullet from
 * ### Added, ### Changed, and ### Fixed sections. Concatenates them into a
 * 1-3 sentence summary. Skips releases with no parseable content.
 *
 * Input:  content/generated/releases.json
 * Output: content/generated/changelog-highlights.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RELEASES_PATH = join('content', 'generated', 'releases.json');
const OUTPUT_PATH   = join('content', 'generated', 'changelog-highlights.json');

const releases = JSON.parse(readFileSync(RELEASES_PATH, 'utf8'));

/**
 * Parse markdown body to extract first bullet from each section.
 * Handles ### Added, ### Changed, ### Fixed headings.
 */
function parseBody(body) {
  if (!body) return { added: null, changed: null, fixed: null };

  const result = { added: null, changed: null, fixed: null };
  const sections = body.split(/^###\s+/m);

  for (const section of sections) {
    const lines = section.split('\n');
    const heading = lines[0]?.trim().toLowerCase();
    let key = null;
    if (heading === 'added') key = 'added';
    else if (heading === 'changed') key = 'changed';
    else if (heading === 'fixed') key = 'fixed';
    else continue;

    // Find first bullet line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- ') || line.startsWith('* ')) {
        let text = line.slice(2).trim();
        // Strip leading bold prefix like **auto**: 
        text = text.replace(/^\*\*[\w-]+\*\*:\s*/, '');
        // Strip markdown links, keep text
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        // Strip inline code backticks
        text = text.replace(/`([^`]+)`/g, '$1');
        // Strip trailing issue refs like (#1234)
        text = text.replace(/\s*\(#\d+\)\s*$/, '');
        // Truncate at ~120 chars
        if (text.length > 120) text = text.slice(0, 117) + '…';
        if (text) {
          result[key] = text;
          break;
        }
      }
    }
  }
  return result;
}

function buildSummary(release) {
  // Try pre-parsed arrays first, fall back to body parsing
  let added = pickFirst(release.added);
  let changed = pickFirst(release.changed);
  let fixed = pickFirst(release.fixed);

  if (!added && !changed && !fixed) {
    const parsed = parseBody(release.body);
    added = parsed.added;
    changed = parsed.changed;
    fixed = parsed.fixed;
  }

  const parts = [];
  if (added)   parts.push(`Added: ${added}`);
  if (changed) parts.push(`Changed: ${changed}`);
  if (fixed)   parts.push(`Fixed: ${fixed}`);

  return parts.join(' · ') || null;
}

function pickFirst(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const item = arr[0];
  if (typeof item === 'string') return item.trim() || null;
  return (item.description || item.feature || '').trim() || null;
}

const highlights = [];

for (const release of releases) {
  const summary = buildSummary(release);
  if (!summary) continue;

  highlights.push({
    tag_name:     release.tag_name,
    published_at: release.published_at,
    html_url:     release.html_url,
    summary,
  });
}

writeFileSync(OUTPUT_PATH, JSON.stringify(highlights, null, 2));
console.log(`  ✓ Wrote ${highlights.length} highlights to ${OUTPUT_PATH}`);
