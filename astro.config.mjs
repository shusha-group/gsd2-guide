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
      sidebar: [
        { label: 'Home', link: '/' },
      ],
    }),
  ],
});
