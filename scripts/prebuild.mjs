#!/usr/bin/env node

/**
 * prebuild.mjs — Content bridge: copies content/generated/docs/ → src/content/docs/
 * with YAML frontmatter injection.
 *
 * For each .md file in the source:
 *   1. Extract the first `# Heading` as the frontmatter title
 *   2. Strip that heading from the body (prevents Starlight duplicate <h1>)
 *   3. Prepend YAML frontmatter with the extracted title
 *   4. Write to src/content/docs/ preserving directory structure
 *
 * Uses a .generated-manifest.json to track which files were generated,
 * so we only clean our own files and never touch placeholder pages.
 */

import { readdir, readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises';
import { join, relative, dirname, basename, extname } from 'node:path';
import { existsSync } from 'node:fs';

const SOURCE_DIR = 'content/generated/docs';
const TARGET_DIR = 'src/content/docs';
const MANIFEST_FILE = join(TARGET_DIR, '.generated-manifest.json');

/**
 * Convert a kebab-case filename to Title Case.
 * e.g. "getting-started" → "Getting Started"
 */
function kebabToTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Escape special characters for YAML double-quoted string.
 */
function escapeYamlString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

/**
 * Recursively find all .md files in a directory.
 */
async function findMarkdownFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Read the previous manifest and delete those files.
 */
async function cleanPreviousGenerated() {
  if (!existsSync(MANIFEST_FILE)) return;

  let manifest;
  try {
    manifest = JSON.parse(await readFile(MANIFEST_FILE, 'utf-8'));
  } catch {
    return;
  }

  const files = manifest.files || [];
  let removed = 0;
  for (const filePath of files) {
    try {
      await rm(filePath, { force: true });
      removed++;
    } catch {
      // File may already be gone — that's fine
    }
  }

  // Clean up empty directories left behind (bottom-up)
  const dirs = [...new Set(files.map(f => dirname(f)))].sort((a, b) => b.length - a.length);
  for (const dir of dirs) {
    // Don't remove the target root
    if (dir === TARGET_DIR) continue;
    try {
      const entries = await readdir(dir);
      if (entries.length === 0) {
        await rm(dir, { recursive: true, force: true });
      }
    } catch {
      // Directory may already be gone
    }
  }

  if (removed > 0) {
    console.log(`Cleaned ${removed} previously generated files`);
  }
}

/**
 * Rewrite internal markdown links from `.md` format to Starlight-compatible `/page/` format.
 *
 * Patterns handled:
 *   ](./file.md)         → ](../file/)
 *   ](file.md)           → ](../file/)
 *   ](./file.md#section) → ](../file/#section)
 *   ](./dir/README.md)   → ](../dir/)
 *   ](./README.md)       → ](../)
 *
 * Skips fenced code blocks (``` regions) and external links (http/https).
 */
function rewriteLinks(content) {
  const lines = content.split('\n');
  let inCodeBlock = false;
  const linkRegex = /\]\((?!https?:\/\/|#)(\.\/|\.\.\/|)([^)#\s]+?)\.md(#[^)]+)?\)/g;

  return lines.map(line => {
    // Track fenced code block state
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;

    return line.replace(linkRegex, (match, prefix, filePath, fragment) => {
      // Leave ../native/README.md as-is (dead link, content doesn't exist)
      if (prefix === '../' && filePath.includes('native/README')) {
        return match;
      }

      const frag = fragment || '';

      // Handle README.md targets → directory index
      if (filePath === 'README' || filePath.endsWith('/README')) {
        // e.g., ./what-is-pi/README.md → ../what-is-pi/
        // e.g., ./README.md → ../
        if (filePath === 'README') {
          return `](../${frag})`;
        }
        // e.g., ./subdir/README → ../subdir/
        const dirPath = filePath.replace(/\/README$/, '');
        return `](../${dirPath}/${frag})`;
      }

      // Regular file: ./file.md → ../file/
      return `](../${filePath}/${frag})`;
    });
  }).join('\n');
}

/**
 * Process a single markdown file: extract title, inject frontmatter, strip heading, rewrite links.
 * If isSubdirReadme is true, adds sidebar order: 0 frontmatter for directory index pages.
 */
function processMarkdown(content, filePath, isSubdirReadme = false) {
  const trimmed = content.trimStart();

  // If file already has frontmatter, just pass it through
  if (trimmed.startsWith('---')) {
    return content;
  }

  // Extract first # heading
  const headingMatch = trimmed.match(/^#\s+(.+)$/m);

  let title;
  let body;

  if (headingMatch) {
    title = headingMatch[1].trim();
    // Strip the first heading line from the body
    // Find the heading in the original trimmed content and remove it
    const headingLine = headingMatch[0];
    const headingIndex = trimmed.indexOf(headingLine);
    const beforeHeading = trimmed.slice(0, headingIndex);
    const afterHeading = trimmed.slice(headingIndex + headingLine.length);
    // Reassemble without the heading, trimming leading blank lines from afterHeading
    body = (beforeHeading + afterHeading).replace(/^\n+/, '');
  } else {
    // No heading found — derive title from filename
    const name = basename(filePath, extname(filePath));
    // Strip leading numbers like "01-" "02-"
    const cleaned = name.replace(/^\d+-/, '');
    title = kebabToTitleCase(cleaned);
    body = trimmed;
  }

  const escapedTitle = escapeYamlString(title);
  let frontmatter;
  if (isSubdirReadme) {
    frontmatter = `---\ntitle: "${escapedTitle}"\nsidebar:\n  order: 0\n---\n\n`;
  } else {
    frontmatter = `---\ntitle: "${escapedTitle}"\n---\n\n`;
  }

  // Rewrite internal .md links to Starlight-compatible format
  body = rewriteLinks(body);

  return frontmatter + body;
}

async function main() {
  // Verify source directory exists
  if (!existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory '${SOURCE_DIR}' not found.`);
    console.error('Run the extract script first: npm run extract');
    process.exit(1);
  }

  // Clean previously generated files
  await cleanPreviousGenerated();

  // Find all markdown files
  const sourceFiles = await findMarkdownFiles(SOURCE_DIR);

  if (sourceFiles.length === 0) {
    console.warn('Warning: No markdown files found in source directory.');
    process.exit(0);
  }

  const generatedFiles = [];
  let processed = 0;
  let skipped = 0;
  const errors = [];

  for (const sourceFile of sourceFiles) {
    const relPath = relative(SOURCE_DIR, sourceFile);

    // Skip root-level README.md — index.mdx is the hand-authored splash page
    if (relPath === 'README.md') {
      console.log(`Skipping root README.md (hand-authored index.mdx exists)`);
      continue;
    }

    // Determine if this is a subdirectory README.md → rename to index.md
    const isSubdirReadme = basename(relPath) === 'README.md' && dirname(relPath) !== '.';
    const targetRelPath = isSubdirReadme
      ? join(dirname(relPath), 'index.md')
      : relPath;
    const targetFile = join(TARGET_DIR, targetRelPath);

    try {
      const content = await readFile(sourceFile, 'utf-8');
      const result = processMarkdown(content, sourceFile, isSubdirReadme);

      // Ensure target directory exists
      await mkdir(dirname(targetFile), { recursive: true });

      await writeFile(targetFile, result, 'utf-8');
      generatedFiles.push(targetFile);
      processed++;
    } catch (err) {
      errors.push({ file: relPath, error: err.message });
      skipped++;
    }
  }

  // Write manifest
  await writeFile(MANIFEST_FILE, JSON.stringify({
    generated_at: new Date().toISOString(),
    source_dir: SOURCE_DIR,
    file_count: generatedFiles.length,
    files: generatedFiles,
  }, null, 2), 'utf-8');

  // Report
  console.log(`Prebuild complete: ${processed} files processed`);
  if (skipped > 0) {
    console.warn(`  ${skipped} files skipped due to errors:`);
    for (const { file, error } of errors) {
      console.warn(`    ${file}: ${error}`);
    }
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main();
