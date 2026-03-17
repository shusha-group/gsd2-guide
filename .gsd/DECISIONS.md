# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | arch | Site framework | Astro + Starlight | Purpose-built for doc sites, zero client JS, built-in Pagefind search, GitHub Pages deployment support, content collections | No |
| D002 | M001 | arch | Hosting platform | GitHub Pages | Free, CDN-backed, git push to deploy, source repo already on GitHub | Yes — if custom domain or server features needed |
| D003 | M001 | arch | Content source of truth | Installed npm package + GitHub repo | npm package has behavioral truth (prompts, templates, skills), GitHub repo has narrative docs. Both needed. | No |
| D004 | M001 | scope | Version display strategy | Latest + changelog (no per-version snapshots) | 6+ releases/day makes per-version snapshots impractical. Latest docs + browsable changelog covers the need. | Yes — if release velocity slows |
| D005 | M001 | scope | Update trigger | Manual one-command trigger | User wants control over when docs update. CI/CD auto-trigger deferred. | Yes — can add CI/CD later |
| D006 | M001 | convention | Design aesthetic | Terminal-native dark with visual aids | Dark-mode-first, tight typography, code-heavy foundation. Diagrams and illustrations for vibe-coder accessibility. "Craft feel" per user emphasis. | No |
| D007 | M001 | convention | Quick-reference format | Cheat-sheet cards (searchable, filterable, expandable) | Fastest lookup for developers coding alongside GSD. Interactive playground deferred. | Yes — if users want more interactivity |
| D008 | M001 | arch | AI consumption strategy | Well-structured semantic HTML + sitemap | Good structure is sufficient for AI parsing. No dedicated JSON API or llms.txt needed. | Yes — if AI consumption becomes primary use case |
