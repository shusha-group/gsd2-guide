import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightClientMermaid from '@pasqal-io/starlight-client-mermaid';

export default defineConfig({
  site: 'https://shusha-group.github.io',
  base: '/gsd2-guide',
  integrations: [
    starlight({
      title: 'GSD 2',
      plugins: [starlightClientMermaid()],
      customCss: [
        './src/styles/custom.css',
        './src/styles/terminal.css',
      ],
      components: {
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
      },
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Changelog', link: '/changelog/' },
        {
          label: 'Quick Reference',
          items: [
            { label: 'Overview', link: '/reference/' },
            { label: 'Commands', link: '/reference/commands/' },
            { label: 'Skills', link: '/reference/skills/' },
            { label: 'Extensions', link: '/reference/extensions/' },
            { label: 'Agents', link: '/reference/agents/' },
            { label: 'Shortcuts', link: '/reference/shortcuts/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Getting Started', link: '/getting-started/' },
            { label: 'Auto Mode', link: '/auto-mode/' },
            { label: 'Configuration', link: '/configuration/' },
            { label: 'Commands Reference', link: '/commands/' },
            { label: 'Git Strategy', link: '/git-strategy/' },
            { label: 'Working in Teams', link: '/working-in-teams/' },
            { label: 'Cost Management', link: '/cost-management/' },
            { label: 'Token Optimization', link: '/token-optimization/' },
            { label: 'Dynamic Model Routing', link: '/dynamic-model-routing/' },
            { label: 'Captures & Triage', link: '/captures-triage/' },
            { label: 'Workflow Visualizer', link: '/visualizer/' },
            { label: 'Skills', link: '/skills/' },
            { label: 'Remote Questions', link: '/remote-questions/' },
            { label: 'Migration from v1', link: '/migration/' },
            { label: 'Troubleshooting', link: '/troubleshooting/' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'Architecture Overview', link: '/architecture/' },
            { label: 'Agent Knowledge Index', link: '/agent-knowledge-index/' },
            { label: 'ADR-001: Branchless Worktree Architecture', link: '/adr-001-branchless-worktree-architecture/' },
            { label: 'PRD: Branchless Worktree Architecture', link: '/prd-branchless-worktree-architecture/' },
          ],
        },
        {
          label: 'What Is Pi',
          autogenerate: { directory: 'what-is-pi' },
        },
        {
          label: 'Building Coding Agents',
          autogenerate: { directory: 'building-coding-agents' },
        },
        {
          label: 'Context and Hooks',
          autogenerate: { directory: 'context-and-hooks' },
        },
        {
          label: 'Extending Pi',
          autogenerate: { directory: 'extending-pi' },
        },
        {
          label: 'Pi UI / TUI',
          autogenerate: { directory: 'pi-ui-tui' },
        },
        {
          label: 'Proposals',
          autogenerate: { directory: 'proposals' },
        },
      ],
    }),
  ],
});
