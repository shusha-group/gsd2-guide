---
title: "Skills, Extensions & Agents"
description: "How skills, extensions, and agents extend GSD — and how to author your own."
---

Skills, extensions, and agents are the three ways GSD can be extended with custom behaviour. They operate at different layers: skills guide the LLM, extensions add tools and commands to the runtime, and agents are specialised sub-processes the LLM can delegate work to.

---

## Skills

Skills are specialised instruction sets that GSD loads when the task matches. They provide domain-specific guidance for the LLM — coding patterns, framework idioms, testing strategies, and tool usage. When a skill is active, its `SKILL.md` instructions are injected into the dispatch prompt before the task description.

Skills follow the open [Agent Skills standard](https://agentskills.io/) and are **not GSD-specific** — they work with Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Windsurf, and 40+ other agents.

### Skill Directories

GSD reads skills from two locations, in priority order:

| Location                          | Scope   | Description                                              |
|-----------------------------------|---------|----------------------------------------------------------|
| `~/.agents/skills/`              | Global  | Shared across all projects and all compatible agents     |
| `.agents/skills/` (project root) | Project | Project-specific skills, committable to version control  |

Global skills take precedence over project skills when names collide.

> **Migration from `~/.gsd/agent/skills/`:** On first launch after upgrading, GSD automatically copies skills from the legacy `~/.gsd/agent/skills/` directory to `~/.agents/skills/`. The old directory is preserved for backward compatibility.

### Installing Skills

Skills are installed via the [skills.sh CLI](https://skills.sh):

```bash
# Interactive — choose skills and target agents
npx skills add dpearson2699/swift-ios-skills

# Install specific skills non-interactively
npx skills add dpearson2699/swift-ios-skills --skill swift-concurrency --skill swiftui-patterns -y

# Install all skills from a repo
npx skills add dpearson2699/swift-ios-skills --all

# Check for updates
npx skills check

# Update installed skills
npx skills update
```

During `gsd init`, GSD detects the project's tech stack and recommends relevant skill packs. For brownfield projects, detection is automatic; for greenfield projects, the user picks a tech stack.

### Skill Discovery

The `skill_discovery` preference controls how GSD finds skills during auto mode:

| Mode | Behavior |
|------|----------|
| `auto` | Skills are found and applied automatically |
| `suggest` | Skills are identified but require confirmation (default) |
| `off` | No skill discovery |

### Skill Preferences

Control which skills are used via preferences:

```yaml
---
version: 1
always_use_skills:
  - debug-like-expert
prefer_skills:
  - frontend-design
avoid_skills:
  - security-docker
skill_rules:
  - when: task involves Clerk authentication
    use: [clerk]
  - when: frontend styling work
    prefer: [frontend-design]
---
```

Skills can be referenced by bare name (e.g., `frontend-design`), absolute path, or directory path. Global skills (`~/.agents/skills/`) take precedence over project skills (`.agents/skills/`).

### Creating Your Own Skills

Create a skill by adding a directory with a `SKILL.md` file:

```
~/.agents/skills/my-skill/
  SKILL.md           — instructions for the LLM
  references/        — optional reference files
```

The `SKILL.md` file contains instructions the LLM follows when the skill is active. Reference files can be loaded by the skill instructions as needed.

For project-specific guidance, place skills in your project root:

```
.agents/skills/my-project-skill/
  SKILL.md
```

Project-local skills can be committed to version control so team members share the same skill set.

### Skill Lifecycle Management

GSD tracks skill performance across auto-mode sessions and surfaces health data to help you maintain skill quality.

Every auto-mode unit records which skills were available and actively loaded. View skill performance with `/gsd skill-health`:

```
/gsd skill-health              # overview table: name, uses, success%, tokens, trend, last used
/gsd skill-health rust-core    # detailed view for one skill
/gsd skill-health --stale 30   # skills unused for 30+ days
/gsd skill-health --declining  # skills with falling success rates
```

The dashboard flags skills with success rate below 70%, rising token usage, or staleness beyond the configured threshold.

For the full catalogue of built-in skills, see [Skills Reference](/reference/skills/).

---

## Extensions

Extensions are TypeScript modules that extend GSD itself — adding tools the LLM can call, registering slash commands, hooking into lifecycle events, and providing custom UI components.

Extensions run inside the GSD process and have access to the full GSD SDK. They are loaded from:

- `~/.gsd/agent/extensions/` — global extensions shared across all projects
- `.gsd/extensions/` — project-specific extensions

For the full catalogue of built-in extensions, see [Extensions Reference](/reference/extensions/).

---

## Agents

Agents are specialised sub-processes the LLM can delegate work to via the `subagent` tool. Each agent has its own system prompt, context window, and tool set. The main LLM uses agents for work that benefits from isolation — parallel research, independent implementation tasks, or specialist review.

Agents are defined as `.md` files in:

- `~/.gsd/agent/agents/` — global agents shared across all projects
- `.gsd/agents/` — project-specific agents

For the full catalogue of built-in agents, see [Agents Reference](/reference/agents/).
