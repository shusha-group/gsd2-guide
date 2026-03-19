/**
 * extract-prompts.mjs — Extract prompt metadata from the globally installed
 * gsd-pi package. Reads all 32 .md prompt files, extracts {{variable}}
 * placeholders via regex, and combines them with hardcoded taxonomy data
 * (group assignments, variable descriptions, command mappings, pipeline
 * positions) to produce content/generated/prompts.json.
 *
 * Variable descriptions and command mappings are authored as static data
 * per D055 — dynamic TypeScript AST derivation would be fragile and slow.
 */

import fs from "node:fs";
import path from "node:path";
import { resolvePackagePath } from "./extract-local.mjs";

// ── Group taxonomy (D057) ──────────────────────────────────────────────────

/**
 * Map from prompt name → group name (one of 4 canonical groups).
 */
const PROMPT_GROUPS = {
  // auto-mode-pipeline (10)
  "execute-task": "auto-mode-pipeline",
  "plan-slice": "auto-mode-pipeline",
  "plan-milestone": "auto-mode-pipeline",
  "research-slice": "auto-mode-pipeline",
  "research-milestone": "auto-mode-pipeline",
  "complete-slice": "auto-mode-pipeline",
  "complete-milestone": "auto-mode-pipeline",
  "validate-milestone": "auto-mode-pipeline",
  "reassess-roadmap": "auto-mode-pipeline",
  "replan-slice": "auto-mode-pipeline",

  // guided-variants (8)
  "guided-execute-task": "guided-variants",
  "guided-plan-slice": "guided-variants",
  "guided-plan-milestone": "guided-variants",
  "guided-research-slice": "guided-variants",
  "guided-complete-slice": "guided-variants",
  "guided-discuss-slice": "guided-variants",
  "guided-discuss-milestone": "guided-variants",
  "guided-resume-task": "guided-variants",

  // commands (13)
  "discuss": "commands",
  "discuss-headless": "commands",
  "queue": "commands",
  "forensics": "commands",
  "triage-captures": "commands",
  "doctor-heal": "commands",
  "heal-skill": "commands",
  "quick-task": "commands",
  "run-uat": "commands",
  "worktree-merge": "commands",
  "workflow-start": "commands",
  "rewrite-docs": "commands",
  "review-migration": "commands",

  // foundation (1)
  "system": "foundation",
};

// ── Variable descriptions ──────────────────────────────────────────────────

/**
 * Map from "promptName.variableName" → plain-language description string.
 * All variables extracted from prompt .md files must have an entry here.
 * Descriptions are written for documentation readers, not just developers.
 */
const VARIABLE_DESCRIPTIONS = {
  // ── complete-milestone ─────────────────────────────────────────────────
  "complete-milestone.inlinedContext": "Pre-assembled context block containing relevant milestone summaries, roadmap state, and prior work artifacts for the completion agent",
  "complete-milestone.milestoneId": "Current milestone identifier (e.g. M001)",
  "complete-milestone.milestoneSummaryPath": "File path where the milestone completion summary should be written",
  "complete-milestone.milestoneTitle": "Human-readable title of the milestone being completed",
  "complete-milestone.roadmapPath": "File path to the project roadmap document for cross-referencing milestone status",
  "complete-milestone.workingDirectory": "Absolute path to the project working directory",

  // ── complete-slice ─────────────────────────────────────────────────────
  "complete-slice.inlinedContext": "Pre-assembled context block containing relevant task summaries, slice plan, and dependency artifacts for the completion agent",
  "complete-slice.milestoneId": "Current milestone identifier (e.g. M001)",
  "complete-slice.roadmapPath": "File path to the project roadmap document",
  "complete-slice.sliceId": "Current slice identifier within the milestone (e.g. S01)",
  "complete-slice.sliceSummaryPath": "File path where the slice completion summary should be written",
  "complete-slice.sliceTitle": "Human-readable title of the slice being completed",
  "complete-slice.sliceUatPath": "File path to the UAT (user acceptance testing) results for this slice",
  "complete-slice.workingDirectory": "Absolute path to the project working directory",

  // ── discuss ────────────────────────────────────────────────────────────
  "discuss.commitInstruction": "Instruction block telling the agent how to commit GSD state changes at the end of the discussion session",
  "discuss.contextPath": "File path to a context document providing background for the discussion topic",
  "discuss.inlinedTemplates": "Pre-assembled block of GSD templates (plan, task-plan, roadmap, etc.) for reference during the discussion",
  "discuss.milestoneId": "Current active milestone identifier for scoping the discussion",
  "discuss.multiMilestoneCommitInstruction": "Extended commit instruction used when the discussion spans multiple milestones",
  "discuss.preamble": "Opening context paragraph describing the current project state and the intended scope of this discussion",
  "discuss.roadmapPath": "File path to the project roadmap for reference during discussion",

  // ── discuss-headless ───────────────────────────────────────────────────
  "discuss-headless.commitInstruction": "Instruction block telling the headless agent how to commit GSD state changes at session end",
  "discuss-headless.contextPath": "File path to a context document providing background for the headless discussion",
  "discuss-headless.inlinedTemplates": "Pre-assembled block of GSD templates for reference during the headless discussion session",
  "discuss-headless.milestoneId": "Current active milestone identifier for scoping the discussion",
  "discuss-headless.multiMilestoneCommitInstruction": "Extended commit instruction used when the discussion spans multiple milestones",
  "discuss-headless.roadmapPath": "File path to the project roadmap for reference",
  "discuss-headless.seedContext": "Initial context or question text that seeds the headless discussion without requiring interactive user input",

  // ── doctor-heal ────────────────────────────────────────────────────────
  "doctor-heal.doctorCommandSuffix": "Additional arguments or flags to append to the /doctor command invocation during healing",
  "doctor-heal.doctorSummary": "Full output summary from the doctor diagnostic run that identified the issues to heal",
  "doctor-heal.scopeLabel": "Human-readable label describing the scope of issues being healed (e.g. 'workspace', 'slice S02')",
  "doctor-heal.structuredIssues": "Structured list of diagnostic issues found by the doctor command, formatted for the healing agent",

  // ── execute-task ───────────────────────────────────────────────────────
  "execute-task.carryForwardSection": "Context carried forward from a previous partial execution of this task, if the task is being resumed",
  "execute-task.milestoneId": "Current milestone identifier (e.g. M001)",
  "execute-task.overridesSection": "Optional override instructions that supersede or amend the default task plan behavior",
  "execute-task.planPath": "File path to the full task plan document (T01-PLAN.md)",
  "execute-task.priorTaskLines": "Summary lines from previously completed tasks in this slice, providing continuity context",
  "execute-task.resumeSection": "Resume state block indicating where execution should pick up if this is a continuation run",
  "execute-task.sliceId": "Current slice identifier within the milestone (e.g. S01)",
  "execute-task.slicePlanExcerpt": "Relevant excerpt from the slice plan providing goal and verification context for the executor",
  "execute-task.sliceTitle": "Human-readable title of the slice containing this task",
  "execute-task.taskId": "Current task identifier within the slice (e.g. T01)",
  "execute-task.taskPlanInline": "Full task plan content inlined directly into the prompt for the executor agent",
  "execute-task.taskPlanPath": "File path to the task plan document for reference",
  "execute-task.taskSummaryPath": "File path where the task summary should be written upon completion",
  "execute-task.taskTitle": "Human-readable title of the task being executed",
  "execute-task.verificationBudget": "Maximum number of verification attempts the executor agent is allowed for this task",
  "execute-task.workingDirectory": "Absolute path to the project working directory",

  // ── forensics ─────────────────────────────────────────────────────────
  "forensics.forensicData": "Structured diagnostic data collected for the problem under investigation (stack traces, logs, state dumps)",
  "forensics.gsdSourceDir": "Absolute path to the GSD source directory for cross-referencing during forensic analysis",
  "forensics.problemDescription": "Plain-language description of the problem or anomaly triggering the forensic investigation",

  // ── guided-complete-slice ─────────────────────────────────────────────
  "guided-complete-slice.inlinedTemplates": "Pre-assembled block of GSD completion templates for guided slice completion",
  "guided-complete-slice.milestoneId": "Current milestone identifier",
  "guided-complete-slice.sliceId": "Current slice identifier within the milestone",
  "guided-complete-slice.sliceTitle": "Human-readable title of the slice being completed",
  "guided-complete-slice.workingDirectory": "Absolute path to the project working directory",

  // ── guided-discuss-milestone ──────────────────────────────────────────
  "guided-discuss-milestone.commitInstruction": "Instruction telling the guided agent how to commit discussion outputs at session end",
  "guided-discuss-milestone.inlinedTemplates": "Pre-assembled block of GSD templates for reference during milestone discussion",
  "guided-discuss-milestone.milestoneId": "Current milestone identifier being discussed",
  "guided-discuss-milestone.milestoneTitle": "Human-readable title of the milestone under discussion",
  "guided-discuss-milestone.structuredQuestionsAvailable": "Flag or content indicating whether structured discussion questions have been pre-generated for this session",

  // ── guided-discuss-slice ──────────────────────────────────────────────
  "guided-discuss-slice.commitInstruction": "Instruction telling the guided agent how to commit discussion outputs at session end",
  "guided-discuss-slice.contextPath": "File path to background context document for the slice discussion",
  "guided-discuss-slice.inlinedContext": "Pre-assembled context block containing slice artifacts and prior summaries for the discussion",
  "guided-discuss-slice.inlinedTemplates": "Pre-assembled block of GSD templates for reference during slice discussion",
  "guided-discuss-slice.milestoneId": "Current milestone identifier",
  "guided-discuss-slice.sliceDirPath": "File system path to the slice directory containing all slice artifacts",
  "guided-discuss-slice.sliceId": "Current slice identifier within the milestone",
  "guided-discuss-slice.sliceTitle": "Human-readable title of the slice being discussed",

  // ── guided-execute-task ───────────────────────────────────────────────
  "guided-execute-task.inlinedTemplates": "Pre-assembled block of GSD task execution templates for guided execution",
  "guided-execute-task.milestoneId": "Current milestone identifier",
  "guided-execute-task.sliceId": "Current slice identifier",
  "guided-execute-task.taskId": "Current task identifier",
  "guided-execute-task.taskTitle": "Human-readable title of the task to be executed",

  // ── guided-plan-milestone ─────────────────────────────────────────────
  "guided-plan-milestone.inlinedTemplates": "Pre-assembled block of GSD milestone planning templates for guided planning",
  "guided-plan-milestone.milestoneId": "Current milestone identifier being planned",
  "guided-plan-milestone.milestoneTitle": "Human-readable title of the milestone being planned",
  "guided-plan-milestone.secretsOutputPath": "File path where any discovered secrets or sensitive configuration notes should be written",

  // ── guided-plan-slice ─────────────────────────────────────────────────
  "guided-plan-slice.inlinedTemplates": "Pre-assembled block of GSD slice planning templates for guided planning",
  "guided-plan-slice.milestoneId": "Current milestone identifier",
  "guided-plan-slice.sliceId": "Current slice identifier being planned",
  "guided-plan-slice.sliceTitle": "Human-readable title of the slice being planned",

  // ── guided-research-slice ─────────────────────────────────────────────
  "guided-research-slice.inlinedTemplates": "Pre-assembled block of GSD research templates for guided slice research",
  "guided-research-slice.milestoneId": "Current milestone identifier",
  "guided-research-slice.sliceId": "Current slice identifier to research",
  "guided-research-slice.sliceTitle": "Human-readable title of the slice being researched",

  // ── guided-resume-task ────────────────────────────────────────────────
  "guided-resume-task.milestoneId": "Current milestone identifier for the task being resumed",
  "guided-resume-task.sliceId": "Current slice identifier for the task being resumed",

  // ── heal-skill ────────────────────────────────────────────────────────
  "heal-skill.date": "Current date string injected into the skill healing prompt for temporal context",
  "heal-skill.healArtifact": "Path or content of the healing artifact produced by the skill health check that triggered this heal",
  "heal-skill.skillName": "Name of the skill being healed (e.g. 'lint', 'test')",
  "heal-skill.unitId": "Identifier of the GSD unit (milestone/slice/task) where the skill health issue was detected",

  // ── plan-milestone ────────────────────────────────────────────────────
  "plan-milestone.inlinedContext": "Pre-assembled context block containing research summaries and existing project context for the planner",
  "plan-milestone.milestoneId": "Current milestone identifier being planned",
  "plan-milestone.milestonePath": "File system path to the milestone directory",
  "plan-milestone.milestoneTitle": "Human-readable title of the milestone being planned",
  "plan-milestone.outputPath": "File path where the completed milestone plan should be written",
  "plan-milestone.researchOutputPath": "File path to the research document that informs this planning session",
  "plan-milestone.secretsOutputPath": "File path where any discovered secrets or sensitive configuration notes should be written",
  "plan-milestone.skillDiscoveryInstructions": "Instructions for the planner on how to discover and evaluate relevant skills for this milestone",
  "plan-milestone.skillDiscoveryMode": "Mode string controlling how skill discovery is performed ('auto', 'manual', 'skip')",
  "plan-milestone.sourceFilePaths": "List of source file paths that are particularly relevant to this milestone's implementation scope",
  "plan-milestone.workingDirectory": "Absolute path to the project working directory",

  // ── plan-slice ────────────────────────────────────────────────────────
  "plan-slice.commitInstruction": "Instruction block telling the planner how to commit the completed slice plan",
  "plan-slice.dependencySummaries": "Pre-assembled summaries of completed slices that this slice depends on",
  "plan-slice.executorContextConstraints": "Constraints and context limits that executor agents must respect when running tasks in this slice",
  "plan-slice.inlinedContext": "Pre-assembled context block containing research output and milestone context for the planner",
  "plan-slice.milestoneId": "Current milestone identifier",
  "plan-slice.outputPath": "File path where the completed slice plan (S01-PLAN.md) should be written",
  "plan-slice.sliceId": "Current slice identifier being planned",
  "plan-slice.slicePath": "File system path to the slice directory",
  "plan-slice.sliceTitle": "Human-readable title of the slice being planned",
  "plan-slice.sourceFilePaths": "List of source file paths particularly relevant to this slice's implementation scope",
  "plan-slice.workingDirectory": "Absolute path to the project working directory",

  // ── queue ─────────────────────────────────────────────────────────────
  "queue.commitInstruction": "Instruction telling the queue agent how to commit updated roadmap and milestone files",
  "queue.existingMilestonesContext": "Summary of existing milestones in the roadmap for context when queuing new work",
  "queue.inlinedTemplates": "Pre-assembled block of GSD roadmap and milestone templates for reference during queuing",
  "queue.preamble": "Opening context describing the project and the scope of work to be queued",

  // ── quick-task ────────────────────────────────────────────────────────
  "quick-task.branch": "Git branch name where the quick task output should be committed",
  "quick-task.date": "Current date string for temporal context in the quick task prompt",
  "quick-task.description": "Plain-language description of the quick task to be executed",
  "quick-task.summaryPath": "File path where the quick task summary should be written",
  "quick-task.taskDir": "File system directory where quick task artifacts should be placed",
  "quick-task.taskNum": "Sequential number identifying this quick task within the session",

  // ── reassess-roadmap ──────────────────────────────────────────────────
  "reassess-roadmap.assessmentPath": "File path where the roadmap reassessment document should be written",
  "reassess-roadmap.commitInstruction": "Instruction block telling the reassessment agent how to commit updated roadmap files",
  "reassess-roadmap.completedSliceId": "Identifier of the slice that was just completed, triggering this reassessment",
  "reassess-roadmap.deferredCaptures": "List of deferred capture items to consider when reassessing the roadmap priorities",
  "reassess-roadmap.inlinedContext": "Pre-assembled context block containing milestone status, roadmap state, and completion summaries",
  "reassess-roadmap.milestoneId": "Current milestone identifier",
  "reassess-roadmap.roadmapPath": "File path to the project roadmap document being reassessed",
  "reassess-roadmap.workingDirectory": "Absolute path to the project working directory",

  // ── replan-slice ──────────────────────────────────────────────────────
  "replan-slice.captureContext": "Content or path of the blocker capture that triggered this slice replan",
  "replan-slice.inlinedContext": "Pre-assembled context block containing the current slice state and blocker information",
  "replan-slice.milestoneId": "Current milestone identifier",
  "replan-slice.planPath": "File path to the existing slice plan that needs to be replanned",
  "replan-slice.replanPath": "File path where the new replanned slice plan should be written",
  "replan-slice.sliceId": "Current slice identifier being replanned",
  "replan-slice.sliceTitle": "Human-readable title of the slice being replanned",
  "replan-slice.workingDirectory": "Absolute path to the project working directory",

  // ── research-milestone ────────────────────────────────────────────────
  "research-milestone.inlinedContext": "Pre-assembled context block containing existing project state and relevant prior research",
  "research-milestone.milestoneId": "Current milestone identifier to research",
  "research-milestone.milestoneTitle": "Human-readable title of the milestone being researched",
  "research-milestone.outputPath": "File path where the research document should be written",
  "research-milestone.skillDiscoveryInstructions": "Instructions for the researcher on how to discover and evaluate relevant skills",
  "research-milestone.skillDiscoveryMode": "Mode string controlling how skill discovery is performed ('auto', 'manual', 'skip')",
  "research-milestone.workingDirectory": "Absolute path to the project working directory",

  // ── research-slice ────────────────────────────────────────────────────
  "research-slice.dependencySummaries": "Pre-assembled summaries of completed slices that this slice depends on",
  "research-slice.inlinedContext": "Pre-assembled context block containing milestone context and relevant prior artifacts",
  "research-slice.milestoneId": "Current milestone identifier",
  "research-slice.outputPath": "File path where the slice research document should be written",
  "research-slice.skillDiscoveryInstructions": "Instructions for the researcher on how to discover and evaluate relevant skills",
  "research-slice.skillDiscoveryMode": "Mode string controlling how skill discovery is performed ('auto', 'manual', 'skip')",
  "research-slice.sliceId": "Current slice identifier to research",
  "research-slice.slicePath": "File system path to the slice directory",
  "research-slice.sliceTitle": "Human-readable title of the slice being researched",
  "research-slice.workingDirectory": "Absolute path to the project working directory",

  // ── review-migration ──────────────────────────────────────────────────
  "review-migration.gsdPath": "File system path to the .gsd directory being migrated",
  "review-migration.previewStats": "Summary statistics of the migration preview showing what will change",
  "review-migration.sourcePath": "File system path to the source GSD workspace being migrated",

  // ── rewrite-docs ──────────────────────────────────────────────────────
  "rewrite-docs.documentList": "List of documentation files to be rewritten in this pass",
  "rewrite-docs.milestoneId": "Current milestone identifier providing context for the documentation rewrite",
  "rewrite-docs.milestoneTitle": "Human-readable title of the milestone for documentation context",
  "rewrite-docs.overrideContent": "Override content or specific rewrite instructions that supersede the default rewrite behavior",
  "rewrite-docs.overridesPath": "File path to an overrides document providing custom rewrite directives",

  // ── run-uat ───────────────────────────────────────────────────────────
  "run-uat.inlinedContext": "Pre-assembled context block containing slice artifacts and implementation details for UAT",
  "run-uat.milestoneId": "Current milestone identifier",
  "run-uat.sliceId": "Current slice identifier being tested",
  "run-uat.uatPath": "File path to the UAT specification document",
  "run-uat.uatResultPath": "File path where UAT results should be written",
  "run-uat.uatType": "Type of UAT being run (e.g. 'smoke', 'full', 'regression')",
  "run-uat.workingDirectory": "Absolute path to the project working directory",

  // ── triage-captures ───────────────────────────────────────────────────
  "triage-captures.currentPlan": "Current project plan or roadmap content for context during capture triage",
  "triage-captures.pendingCaptures": "List of pending capture items to be triaged and prioritized",
  "triage-captures.roadmapContext": "Roadmap context content providing project state for intelligent triage decisions",

  // ── validate-milestone ────────────────────────────────────────────────
  "validate-milestone.inlinedContext": "Pre-assembled context block containing all slice summaries and milestone artifacts for validation",
  "validate-milestone.milestoneId": "Current milestone identifier being validated",
  "validate-milestone.milestoneTitle": "Human-readable title of the milestone being validated",
  "validate-milestone.remediationRound": "Current remediation attempt number if this is a re-validation after fixes",
  "validate-milestone.roadmapPath": "File path to the project roadmap for cross-referencing during validation",
  "validate-milestone.validationPath": "File path where the validation report should be written",
  "validate-milestone.workingDirectory": "Absolute path to the project working directory",

  // ── workflow-start ────────────────────────────────────────────────────
  "workflow-start.artifactDir": "Directory path where workflow artifacts (templates, outputs) should be stored",
  "workflow-start.branch": "Git branch name for the workflow being started",
  "workflow-start.complexity": "Complexity level of the workflow ('simple', 'standard', 'complex')",
  "workflow-start.date": "Current date string for temporal context in the workflow prompt",
  "workflow-start.description": "Plain-language description of the workflow to start",
  "workflow-start.issueRef": "GitHub issue reference associated with this workflow (e.g. '#123')",
  "workflow-start.phases": "Structured list of phases defining the workflow execution plan",
  "workflow-start.templateId": "Identifier of the workflow template being instantiated",
  "workflow-start.templateName": "Human-readable name of the workflow template",
  "workflow-start.workflowContent": "Full content of the workflow template being used to start this workflow",

  // ── worktree-merge ────────────────────────────────────────────────────
  "worktree-merge.addedFiles": "List of files added in the worktree branch relative to the main branch",
  "worktree-merge.codeDiff": "Unified diff of code changes between the worktree branch and the main branch",
  "worktree-merge.commitLog": "Log of commits in the worktree branch to be merged",
  "worktree-merge.gsdDiff": "Unified diff of .gsd directory changes between the worktree and main branch",
  "worktree-merge.mainBranch": "Name of the main branch that the worktree will be merged into",
  "worktree-merge.mainTreePath": "File system path to the main branch worktree checkout",
  "worktree-merge.modifiedFiles": "List of files modified in the worktree branch relative to the main branch",
  "worktree-merge.removedFiles": "List of files removed in the worktree branch relative to the main branch",
  "worktree-merge.worktreeBranch": "Name of the worktree branch being merged",
  "worktree-merge.worktreeName": "Human-readable name of the worktree being merged (e.g. 'M005')",
  "worktree-merge.worktreePath": "File system path to the worktree directory being merged",
};

// ── Command mappings ───────────────────────────────────────────────────────

/**
 * Map from prompt name → array of command slugs that use this prompt.
 * Derived from loadPrompt() call site analysis across the gsd extension source.
 */
const COMMAND_MAPPINGS = {
  // foundation
  "system": ["gsd", "config", "knowledge"],

  // commands
  "discuss": ["gsd", "discuss", "steer"],
  "discuss-headless": ["headless"],
  "queue": ["queue"],
  "forensics": ["forensics"],
  "triage-captures": ["capture", "triage"],
  "doctor-heal": ["doctor"],
  "heal-skill": ["skill-health"],
  "quick-task": ["quick"],
  "run-uat": ["auto"],
  "worktree-merge": [],
  "workflow-start": [],
  "rewrite-docs": ["auto"],
  "review-migration": ["migrate"],

  // auto-mode-pipeline
  "execute-task": ["auto", "hooks"],
  "plan-slice": ["auto"],
  "plan-milestone": ["auto"],
  "research-slice": ["auto"],
  "research-milestone": ["auto"],
  "complete-slice": ["auto"],
  "complete-milestone": ["auto"],
  "validate-milestone": ["auto"],
  "reassess-roadmap": ["auto"],
  "replan-slice": ["auto"],

  // guided-variants
  "guided-execute-task": ["gsd"],
  "guided-plan-slice": ["gsd"],
  "guided-plan-milestone": ["gsd"],
  "guided-research-slice": ["gsd"],
  "guided-complete-slice": ["gsd"],
  "guided-discuss-slice": ["gsd"],
  "guided-discuss-milestone": ["gsd"],
  "guided-resume-task": ["gsd"],
};

// ── Pipeline position strings ──────────────────────────────────────────────

/**
 * Map from prompt name → 1-2 sentence description of when/why this prompt
 * fires in the GSD workflow. Used by documentation pages.
 */
const PIPELINE_POSITIONS = {
  // foundation
  "system": "Injected as the system message into every GSD agent session — establishes the agent persona, base capabilities, and behavioral constraints that all other prompts build upon.",

  // auto-mode-pipeline
  "execute-task": "Dispatched by auto-mode when a task is ready for execution — the executor agent receives this prompt with the full task plan inlined and writes a task summary upon completion.",
  "plan-slice": "Dispatched by auto-mode after slice research is complete — the planner agent decomposes the slice into a set of executable tasks with time estimates and file lists.",
  "plan-milestone": "Dispatched by auto-mode after milestone research is complete — the planner agent creates the milestone plan with slice breakdown and dependency ordering.",
  "research-slice": "Dispatched by auto-mode at the start of each slice — the researcher agent explores the codebase and existing artifacts to produce a research document that informs slice planning.",
  "research-milestone": "Dispatched by auto-mode at the start of milestone planning — the researcher agent explores the project scope and produces a research document that informs the milestone plan.",
  "complete-slice": "Dispatched by auto-mode after all tasks in a slice pass verification — the completion agent writes the slice summary and updates roadmap state.",
  "complete-milestone": "Dispatched by auto-mode after all slices in a milestone are complete — the completion agent writes the milestone summary and updates the roadmap.",
  "validate-milestone": "Dispatched by auto-mode after the completion agent finishes — validates that all slice summaries and artifacts meet the milestone's acceptance criteria.",
  "reassess-roadmap": "Dispatched by auto-mode after each slice completes — re-evaluates roadmap priorities and deferred captures in light of what was learned during implementation.",
  "replan-slice": "Dispatched by auto-mode when a blocker is discovered mid-execution — replans the remaining slice tasks given the newly surfaced constraint or finding.",

  // guided-variants
  "guided-execute-task": "Invoked by /gsd in guided mode to walk the user through executing a specific task — provides structure and checkpoints compared to the headless auto-mode version.",
  "guided-plan-slice": "Invoked by /gsd in guided mode to collaboratively plan a slice — the agent and user work through task decomposition interactively.",
  "guided-plan-milestone": "Invoked by /gsd in guided mode to collaboratively plan a milestone — supports user input on scope, priorities, and slice ordering.",
  "guided-research-slice": "Invoked by /gsd in guided mode to conduct slice research with user collaboration — the agent explores the codebase and asks clarifying questions.",
  "guided-complete-slice": "Invoked by /gsd in guided mode to complete a slice — the agent and user review task summaries together before writing the slice summary.",
  "guided-discuss-slice": "Invoked by /gsd discuss or /gsd steer scoped to a specific slice — opens an interactive discussion about slice scope, blockers, or implementation decisions.",
  "guided-discuss-milestone": "Invoked by /gsd discuss or /gsd steer scoped to a specific milestone — opens an interactive discussion about milestone goals, risks, or priorities.",
  "guided-resume-task": "Invoked by /gsd in guided mode to resume a partially completed task — loads prior execution context and continues from where execution left off.",

  // commands
  "discuss": "Invoked by /gsd discuss or /gsd steer — opens an interactive discussion session about the current project state, allowing the user to ask questions, explore options, or steer direction.",
  "discuss-headless": "Invoked by /headless — runs a non-interactive discussion session seeded with context, designed for automated pipelines that need discussion-style reasoning without user input.",
  "queue": "Invoked by /queue — allows the user to add new work items to the roadmap by describing them in natural language; the agent structures them into milestones.",
  "forensics": "Invoked by /forensics — launches a deep diagnostic investigation into a specific problem, collecting evidence and producing a structured report.",
  "triage-captures": "Invoked by /capture or /triage after pending captures accumulate — reviews the list of captured notes and prioritizes them against the current roadmap.",
  "doctor-heal": "Invoked by /doctor after a diagnostic run surfaces issues — the healing agent works through the structured issue list to resolve workspace problems.",
  "heal-skill": "Invoked by the skill-health system when a skill check fails — applies targeted remediation to restore the skill to a healthy state.",
  "quick-task": "Invoked by /quick — executes a standalone task outside the milestone system, writing a summary artifact when done.",
  "run-uat": "Dispatched by auto-mode as a validation step — runs user acceptance tests for a completed slice and writes structured results.",
  "worktree-merge": "Invoked when merging a GSD worktree branch back into main — the agent reviews the diff and .gsd changes, then performs a structured merge with commit message generation.",
  "workflow-start": "Invoked to initialize a templated workflow — loads the selected template, instantiates it with the provided parameters, and sets up the initial workflow state.",
  "rewrite-docs": "Dispatched by auto-mode or /auto steer to refresh documentation files — the agent rewrites listed documents to reflect current implementation state.",
  "review-migration": "Invoked by /migrate — reviews a proposed GSD workspace migration and guides the user through applying the changes.",
};

// ── Main extractor ─────────────────────────────────────────────────────────

/**
 * Extract prompt metadata from the gsd-pi package and write prompts.json.
 * @param {{ pkgPath?: string, outputDir?: string }} options
 * @returns {Promise<{ count: number }>}
 */
export async function extractPrompts(options = {}) {
  const pkgRoot = resolvePackagePath(options.pkgPath);
  const outputDir = options.outputDir || path.join(process.cwd(), "content", "generated");
  const promptsDir = path.join(pkgRoot, "src", "resources", "extensions", "gsd", "prompts");

  if (!fs.existsSync(promptsDir)) {
    console.warn(`[prompts] Prompts directory not found: ${promptsDir}`);
    return { count: 0 };
  }

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const varRegex = /\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g;
  const prompts = [];

  const entries = fs.readdirSync(promptsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const name = path.basename(entry.name, ".md");
    const filePath = path.join(promptsDir, entry.name);
    const content = fs.readFileSync(filePath, "utf8");

    // Extract unique variable names in order of first appearance
    const seen = new Set();
    const variables = [];
    for (const match of content.matchAll(varRegex)) {
      const varName = match[1];
      if (!seen.has(varName)) {
        seen.add(varName);
        const descKey = `${name}.${varName}`;
        const description = VARIABLE_DESCRIPTIONS[descKey] || "";
        if (!description) {
          console.warn(`[prompts] Missing description for variable: ${descKey}`);
        }
        variables.push({ name: varName, description, required: true });
      }
    }

    const group = PROMPT_GROUPS[name] || "commands";
    if (!PROMPT_GROUPS[name]) {
      console.warn(`[prompts] Unknown group for prompt: ${name} — defaulting to 'commands'`);
    }

    const usedByCommands = COMMAND_MAPPINGS[name] ?? [];
    const pipelinePosition = PIPELINE_POSITIONS[name] || "";
    if (!PIPELINE_POSITIONS[name]) {
      console.warn(`[prompts] Missing pipeline position for prompt: ${name}`);
    }

    prompts.push({
      name,
      slug: name,
      group,
      variables,
      pipelinePosition,
      usedByCommands,
    });
  }

  // Sort by name for stable output
  prompts.sort((a, b) => a.name.localeCompare(b.name));

  const outputPath = path.join(outputDir, "prompts.json");
  fs.writeFileSync(outputPath, JSON.stringify(prompts, null, 2) + "\n");

  console.log(`[prompts] Extracted ${prompts.length} prompts from ${promptsDir}`);

  return { count: prompts.length };
}
