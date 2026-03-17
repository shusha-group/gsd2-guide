import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightClientMermaid from '@pasqal-io/starlight-client-mermaid';

export default defineConfig({
  site: 'https://gsd-build.github.io',
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
        {
          label: 'Placeholder',
          items: [
            { label: 'Components', link: '/placeholder/components/' },
            { label: 'Diagrams', link: '/placeholder/diagrams/' },
            { label: 'Code Examples', link: '/placeholder/code-examples/' },
          ],
        },
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
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
