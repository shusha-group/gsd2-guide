/**
 * build-page-map.mjs — Generate the page-source-map that maps all doc pages
 * to their gsd-pi source file dependencies (48 core + 32 prompt pages = 80 total).
 *
 * Exports: buildPageSourceMap(manifestPath?)
 * CLI:     node scripts/lib/build-page-map.mjs
 *
 * Output:  content/generated/page-source-map.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const GSD = "src/resources/extensions/gsd";
const PROMPTS = `${GSD}/prompts`;
const TEMPLATES = `${GSD}/templates`;
const MIGRATE = `${GSD}/migrate`;

// ─── Shared dependencies included for every command page ─────────────────────
const SHARED_COMMAND_DEPS = [
  `${GSD}/commands.ts`,
  `${GSD}/state.ts`,
  `${GSD}/types.ts`,
];

// ─── Special-case command overrides ──────────────────────────────────────────
// Each key is the command slug (without .mdx). Values are source paths relative
// to the repo root. These REPLACE the algorithmic mapping entirely.
const COMMAND_OVERRIDES = {
  gsd: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/guided-flow.ts`,
    `${PROMPTS}/discuss.md`,
    `${PROMPTS}/system.md`,
  ],
  auto: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/auto.ts`,
    `${GSD}/auto-dispatch.ts`,
    `${GSD}/auto-recovery.ts`,
    `${GSD}/auto-worktree.ts`,
    `${GSD}/auto-prompts.ts`,
    `${GSD}/auto-supervisor.ts`,
    `${GSD}/auto-dashboard.ts`,
    `${GSD}/unit-runtime.ts`,
  ],
  doctor: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/doctor.ts`,
    `${GSD}/doctor-proactive.ts`,
    `${PROMPTS}/doctor-heal.md`,
  ],
  migrate: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${MIGRATE}/command.ts`,
    `${MIGRATE}/index.ts`,
    `${MIGRATE}/parser.ts`,
    `${MIGRATE}/parsers.ts`,
    `${MIGRATE}/preview.ts`,
    `${MIGRATE}/transformer.ts`,
    `${MIGRATE}/types.ts`,
    `${MIGRATE}/validator.ts`,
    `${MIGRATE}/writer.ts`,
  ],
  visualize: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/visualizer-data.ts`,
    `${GSD}/visualizer-overlay.ts`,
    `${GSD}/visualizer-views.ts`,
  ],
  hooks: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/post-unit-hooks.ts`,
    `${PROMPTS}/execute-task.md`,
  ],
  capture: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/captures.ts`,
    `${PROMPTS}/triage-captures.md`,
  ],
  triage: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/triage-ui.ts`,
    `${GSD}/triage-resolution.ts`,
    `${PROMPTS}/triage-captures.md`,
  ],
  queue: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/queue-order.ts`,
    `${GSD}/queue-reorder-ui.ts`,
    `${PROMPTS}/queue.md`,
  ],
  forensics: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/forensics.ts`,
    `${GSD}/session-forensics.ts`,
    `${PROMPTS}/forensics.md`,
  ],
  knowledge: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${PROMPTS}/system.md`,
    `${GSD}/files.ts`,
  ],
  config: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/preferences.ts`,
    `${PROMPTS}/system.md`,
  ],
  prefs: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/preferences.ts`,
  ],
  mode: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/guided-flow.ts`,
    `${GSD}/preferences.ts`,
  ],
  steer: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${PROMPTS}/discuss.md`,
    `${GSD}/guided-flow.ts`,
  ],
  status: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/session-status-io.ts`,
  ],
  cleanup: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/worktree-manager.ts`,
    `${GSD}/worktree.ts`,
    `${GSD}/git-service.ts`,
  ],
  headless: [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${PROMPTS}/discuss-headless.md`,
  ],
  "cli-flags": [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
  ],
  "keyboard-shortcuts": [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
  ],
  "skill-health": [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/skill-health.ts`,
    `${GSD}/skill-telemetry.ts`,
    `${GSD}/skill-discovery.ts`,
    `${PROMPTS}/heal-skill.md`,
  ],
  "run-hook": [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${GSD}/types.ts`,
    `${GSD}/post-unit-hooks.ts`,
  ],
};

// ─── Recipe page mappings ────────────────────────────────────────────────────
const RECIPE_MAPPINGS = {
  "recipes/new-milestone.mdx": [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${PROMPTS}/discuss.md`,
    `${PROMPTS}/research-milestone.md`,
    `${PROMPTS}/plan-milestone.md`,
    `${TEMPLATES}/roadmap.md`,
    `${TEMPLATES}/project.md`,
  ],
  "recipes/fix-a-bug.mdx": [
    `${GSD}/commands.ts`,
    `${GSD}/state.ts`,
    `${PROMPTS}/discuss.md`,
    `${PROMPTS}/execute-task.md`,
    `${GSD}/doctor.ts`,
  ],
  "recipes/small-change.mdx": [
    `${GSD}/commands.ts`,
    `${GSD}/quick.ts`,
    `${PROMPTS}/quick-task.md`,
  ],
  "recipes/error-recovery.mdx": [
    `${GSD}/auto-recovery.ts`,
    `${GSD}/crash-recovery.ts`,
    `${GSD}/doctor.ts`,
    `${PROMPTS}/doctor-heal.md`,
  ],
  "recipes/uat-failures.mdx": [
    `${PROMPTS}/run-uat.md`,
    `${GSD}/unit-runtime.ts`,
    `${PROMPTS}/replan-slice.md`,
  ],
  "recipes/working-in-teams.mdx": [
    `${GSD}/worktree.ts`,
    `${GSD}/worktree-manager.ts`,
    `${GSD}/git-service.ts`,
    `${PROMPTS}/worktree-merge.md`,
  ],
};

// ─── Walkthrough mapping ─────────────────────────────────────────────────────
const WALKTHROUGH_DEPS = [
  `${GSD}/state.ts`,
  `${GSD}/commands.ts`,
  `${GSD}/types.ts`,
  `${GSD}/auto.ts`,
  `${GSD}/auto-dispatch.ts`,
  `${GSD}/guided-flow.ts`,
  `${GSD}/preferences.ts`,
  `${GSD}/doctor.ts`,
  `${GSD}/quick.ts`,
  `${PROMPTS}/discuss.md`,
  `${PROMPTS}/system.md`,
  `${PROMPTS}/execute-task.md`,
  `${PROMPTS}/plan-milestone.md`,
  `${PROMPTS}/research-milestone.md`,
  `${TEMPLATES}/roadmap.md`,
  `${TEMPLATES}/project.md`,
];

/**
 * Build the page-source-map object.
 *
 * @param {string} [manifestPath] - Path to manifest.json (default: content/generated/manifest.json)
 * @returns {{ map: Record<string, string[]>, warnings: string[] }}
 */
export function buildPageSourceMap(manifestPath) {
  const mPath =
    manifestPath || path.join(ROOT, "content/generated/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(mPath, "utf-8"));
  const manifestFiles = new Set(Object.keys(manifest.files));

  /** @type {Record<string, string[]>} */
  const map = {};
  const warnings = [];

  // ─── Helper: validate and add deps ──────────────────────────────────
  function addPage(pageKey, deps) {
    const validDeps = [];
    for (const dep of deps) {
      if (manifestFiles.has(dep)) {
        validDeps.push(dep);
      } else {
        warnings.push(`Missing source path for ${pageKey}: ${dep}`);
      }
    }
    map[pageKey] = validDeps;
  }

  // ─── 1. Command pages (27) ──────────────────────────────────────────
  const commandDir = path.join(ROOT, "src/content/docs/commands");
  const commandFiles = fs
    .readdirSync(commandDir)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  for (const file of commandFiles) {
    const slug = file.replace(".mdx", "");
    const pageKey = `commands/${file}`;

    if (COMMAND_OVERRIDES[slug]) {
      addPage(pageKey, COMMAND_OVERRIDES[slug]);
    } else {
      // Algorithmic: slug.ts + prompts/slug.md + shared deps
      const deps = [...SHARED_COMMAND_DEPS];
      const tsPath = `${GSD}/${slug}.ts`;
      if (manifestFiles.has(tsPath)) {
        deps.push(tsPath);
      }
      const promptPath = `${PROMPTS}/${slug}.md`;
      if (manifestFiles.has(promptPath)) {
        deps.push(promptPath);
      }
      addPage(pageKey, deps);
    }
  }

  // ─── 2. Recipe pages (6) ────────────────────────────────────────────
  for (const [pageKey, deps] of Object.entries(RECIPE_MAPPINGS)) {
    addPage(pageKey, deps);
  }

  // ─── 3. Walkthrough (1) ─────────────────────────────────────────────
  addPage("user-guide/developing-with-gsd.mdx", WALKTHROUGH_DEPS);

  // ─── 4. Reference pages (6) ─────────────────────────────────────────
  addPage("reference/commands.mdx", ["docs/commands.md"]);

  // Skills: all files under src/resources/skills/
  const skillFiles = [...manifestFiles]
    .filter((p) => p.startsWith("src/resources/skills/"))
    .sort();
  addPage("reference/skills.mdx", skillFiles);

  // Agents: all files under src/resources/agents/
  const agentFiles = [...manifestFiles]
    .filter((p) => p.startsWith("src/resources/agents/"))
    .sort();
  addPage("reference/agents.mdx", agentFiles);

  // Extensions: all files under src/resources/extensions/ (non-test, non-doc)
  const extensionFiles = [...manifestFiles]
    .filter(
      (p) =>
        p.startsWith("src/resources/extensions/") &&
        !p.includes("/tests/") &&
        !p.includes("/docs/")
    )
    .sort();
  addPage("reference/extensions.mdx", extensionFiles);

  addPage("reference/shortcuts.mdx", ["docs/commands.md"]);
  addPage("reference/index.mdx", []);

  // ─── 5. Other pages (2) ─────────────────────────────────────────────
  addPage("changelog.mdx", []);
  addPage("index.mdx", []);

  // ─── 6. Prompt pages (32) ─────────────────────────────────────────
  const promptsJsonPath = path.join(ROOT, "content/generated/prompts.json");
  if (fs.existsSync(promptsJsonPath)) {
    const promptsJson = JSON.parse(fs.readFileSync(promptsJsonPath, "utf-8"));
    for (const prompt of promptsJson) {
      addPage(`prompts/${prompt.slug}.mdx`, [
        `src/resources/extensions/gsd/prompts/${prompt.name}.md`,
      ]);
    }
  }

  // ─── Validation summary ─────────────────────────────────────────────
  const totalPages = Object.keys(map).length;
  const totalDeps = Object.values(map).reduce((sum, deps) => sum + deps.length, 0);
  const missingCount = warnings.length;

  if (missingCount > 0) {
    const allDeps = Object.values(map).flat().length + missingCount;
    const missingPct = (missingCount / allDeps) * 100;
    if (missingPct > 50) {
      console.error(
        `ERROR: ${missingPct.toFixed(1)}% of source paths missing from manifest. ` +
          `This suggests a repo restructure — verify manifest.json is current.`
      );
    }
    for (const w of warnings) {
      console.warn(`WARNING: ${w}`);
    }
  }

  console.log(
    `Page source map: ${totalPages} pages mapped, ${totalDeps} total deps` +
      (missingCount > 0 ? `, ${missingCount} warnings` : "")
  );

  return { map, warnings };
}

// ─── CLI entry point ──────────────────────────────────────────────────────────
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain) {
  const { map, warnings } = buildPageSourceMap();
  const outPath = path.join(ROOT, "content/generated/page-source-map.json");
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2) + "\n");
  console.log(`Written to ${path.relative(ROOT, outPath)}`);
  if (warnings.length > 0) {
    process.exit(1);
  }
}
