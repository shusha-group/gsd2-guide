#!/usr/bin/env node
/**
 * generate-highlights.mjs — Build changelog-highlights.json from releases.json.
 *
 * For each release, picks the first notable item from added[], changed[], fixed[]
 * and concatenates them into a 1-3 sentence solo-builder-focused summary.
 * Releases where all three arrays are empty and body is minimal are skipped.
 *
 * Input:  content/generated/releases.json
 * Output: content/generated/changelog-highlights.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RELEASES_PATH = join('content', 'generated', 'releases.json');
const OUTPUT_PATH   = join('content', 'generated', 'changelog-highlights.json');

const releases = JSON.parse(readFileSync(RELEASES_PATH, 'utf8'));

function pickFirst(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const item = arr[0];
  // Items are objects with { feature, description } or plain strings
  if (typeof item === 'string') return item.trim() || null;
  return (item.description || item.feature || '').trim() || null;
}

function buildSummary(release) {
  const parts = [];
  const added   = pickFirst(release.added);
  const changed = pickFirst(release.changed);
  const fixed   = pickFirst(release.fixed);

  if (added)   parts.push(`Added: ${added}`);
  if (changed) parts.push(`Changed: ${changed}`);
  if (fixed)   parts.push(`Fixed: ${fixed}`);

  return parts.join(' · ') || null;
}

const highlights = [];

for (const release of releases) {
  const hasContent =
    (release.added   && release.added.length   > 0) ||
    (release.changed && release.changed.length > 0) ||
    (release.fixed   && release.fixed.length   > 0);

  const bodyMeaningful = (release.body || '').trim().length > 80;

  if (!hasContent && !bodyMeaningful) continue;

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
