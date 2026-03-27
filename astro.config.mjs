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
          label: "Solo Builder's Guide",
          items: [
            { label: 'Overview', link: '/solo-guide/' },
            { label: '1. Why GSD 2', link: '/solo-guide/why-gsd/' },
            { label: '2. Your First Project', link: '/solo-guide/first-project/' },
            { label: '3. Brownfield Reality', link: '/solo-guide/brownfield/' },
            { label: '4. The Daily Mix', link: '/solo-guide/daily-mix/' },
            { label: '5. Context Engineering', link: '/solo-guide/context-engineering/' },
            { label: '6. Controlling Costs', link: '/solo-guide/controlling-costs/' },
            { label: '7. When Things Go Wrong', link: '/solo-guide/when-things-go-wrong/' },
            { label: '8. Building a Rhythm', link: '/solo-guide/building-rhythm/' },
          ],
        },
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', link: '/getting-started/' },
            { label: 'Developing with GSD', link: '/user-guide/developing-with-gsd/' },
            { label: 'Discussing a Milestone', link: '/user-guide/discussing-a-milestone/' },
          ],
        },
        {
          label: 'Commands',
          items: [
            { label: 'Commands Reference', link: '/commands/' },
            {
              label: 'Running GSD',
              items: [
                { label: '/gsd', link: '/commands/gsd/' },
                { label: '/gsd next', link: '/commands/next/' },
                { label: '/gsd auto', link: '/commands/auto/' },
                { label: '/gsd stop', link: '/commands/stop/' },
                { label: '/gsd quick', link: '/commands/quick/' },
              ],
            },
            {
              label: 'Planning & Discussion',
              items: [
                { label: '/gsd discuss', link: '/commands/discuss/' },
                { label: '/gsd steer', link: '/commands/steer/' },
                { label: '/gsd queue', link: '/commands/queue/' },
                { label: '/gsd new-milestone', link: '/commands/new-milestone/' },
              ],
            },
            {
              label: 'Monitoring & Capture',
              items: [
                { label: '/gsd status', link: '/commands/status/' },
                { label: '/gsd visualize', link: '/commands/visualize/' },
                { label: '/gsd capture', link: '/commands/capture/' },
                { label: '/gsd triage', link: '/commands/triage/' },
                { label: '/gsd forensics', link: '/commands/forensics/' },
                { label: '/gsd export', link: '/commands/export/' },
                { label: '/gsd logs', link: '/commands/logs/' },
              ],
            },
            {
              label: 'Milestone Management',
              items: [
                { label: '/gsd skip', link: '/commands/skip/' },
                { label: '/gsd undo', link: '/commands/undo/' },
                { label: '/gsd cleanup', link: '/commands/cleanup/' },
                { label: '/gsd knowledge', link: '/commands/knowledge/' },
              ],
            },
            {
              label: 'Configuration',
              items: [
                { label: '/gsd prefs', link: '/commands/prefs/' },
                { label: '/gsd mode', link: '/commands/mode/' },
                { label: '/gsd config', link: '/commands/config/' },
                { label: '/gsd keys', link: '/commands/keys/' },
                { label: '/gsd update', link: '/commands/update/' },
              ],
            },
            {
              label: 'Diagnostics & Skills',
              items: [
                { label: '/gsd doctor', link: '/commands/doctor/' },
                { label: '/gsd skill-health', link: '/commands/skill-health/' },
                { label: '/gsd hooks', link: '/commands/hooks/' },
                { label: '/gsd run-hook', link: '/commands/run-hook/' },
              ],
            },
            {
              label: 'Migration',
              items: [
                { label: '/gsd migrate', link: '/commands/migrate/' },
              ],
            },
            {
              label: 'Reference',
              items: [
            { label: '/gsd fast', link: '/commands/fast/' },
            { label: '/gsd changelog', link: '/commands/changelog/' },
            { label: '/gsd dispatch', link: '/commands/dispatch/' },
            { label: '/gsd history', link: '/commands/history/' },
            { label: '/gsd init', link: '/commands/init/' },
            { label: '/gsd inspect', link: '/commands/inspect/' },
            { label: '/gsd park', link: '/commands/park/' },
            { label: '/gsd pause', link: '/commands/pause/' },
            { label: '/gsd rate', link: '/commands/rate/' },
            { label: '/gsd remote', link: '/commands/remote/' },
            { label: '/gsd reset-slice', link: '/commands/reset-slice/' },
            { label: '/gsd setup', link: '/commands/setup/' },
            { label: '/gsd start', link: '/commands/start/' },
            { label: '/gsd templates', link: '/commands/templates/' },
            { label: '/gsd undo-task', link: '/commands/undo-task/' },
            { label: '/gsd unpark', link: '/commands/unpark/' },
            { label: '/gsd widget', link: '/commands/widget/' },
            { label: '/gsd mcp', link: '/commands/mcp/' },
            { label: '/gsd rethink', link: '/commands/rethink/' },
                { label: 'Keyboard Shortcuts', link: '/commands/keyboard-shortcuts/' },
                { label: 'CLI Flags', link: '/commands/cli-flags/' },
                { label: 'Headless Mode', link: '/commands/headless/' },
              ],
            },
                { label: 'gate-evaluate', link: '/prompts/gate-evaluate/' },
                { label: 'reactive-execute', link: '/prompts/reactive-execute/' },
                { label: 'rethink', link: '/prompts/rethink/' },
          ],
        },
        {
          label: 'Prompts',
          items: [
            {
              label: 'Auto-mode Pipeline',
              items: [
                { label: 'complete-milestone', link: '/prompts/complete-milestone/' },
                { label: 'complete-slice', link: '/prompts/complete-slice/' },
                { label: 'execute-task', link: '/prompts/execute-task/' },
                { label: 'plan-milestone', link: '/prompts/plan-milestone/' },
                { label: 'plan-slice', link: '/prompts/plan-slice/' },
                { label: 'reassess-roadmap', link: '/prompts/reassess-roadmap/' },
                { label: 'replan-slice', link: '/prompts/replan-slice/' },
                { label: 'research-milestone', link: '/prompts/research-milestone/' },
                { label: 'research-slice', link: '/prompts/research-slice/' },
                { label: 'validate-milestone', link: '/prompts/validate-milestone/' },
              ],
            },
            {
              label: 'Guided Variants',
              items: [
                { label: 'guided-complete-slice', link: '/prompts/guided-complete-slice/' },
                { label: 'guided-discuss-milestone', link: '/prompts/guided-discuss-milestone/' },
                { label: 'guided-discuss-slice', link: '/prompts/guided-discuss-slice/' },
                { label: 'guided-execute-task', link: '/prompts/guided-execute-task/' },
                { label: 'guided-plan-milestone', link: '/prompts/guided-plan-milestone/' },
                { label: 'guided-plan-slice', link: '/prompts/guided-plan-slice/' },
                { label: 'guided-research-slice', link: '/prompts/guided-research-slice/' },
                { label: 'guided-resume-task', link: '/prompts/guided-resume-task/' },
              ],
            },
            {
              label: 'Commands',
              items: [
                { label: 'discuss', link: '/prompts/discuss/' },
                { label: 'discuss-headless', link: '/prompts/discuss-headless/' },
                { label: 'doctor-heal', link: '/prompts/doctor-heal/' },
                { label: 'forensics', link: '/prompts/forensics/' },
                { label: 'heal-skill', link: '/prompts/heal-skill/' },
                { label: 'queue', link: '/prompts/queue/' },
                { label: 'quick-task', link: '/prompts/quick-task/' },
                { label: 'review-migration', link: '/prompts/review-migration/' },
                { label: 'rewrite-docs', link: '/prompts/rewrite-docs/' },
                { label: 'run-uat', link: '/prompts/run-uat/' },
                { label: 'triage-captures', link: '/prompts/triage-captures/' },
                { label: 'workflow-start', link: '/prompts/workflow-start/' },
                { label: 'worktree-merge', link: '/prompts/worktree-merge/' },
              ],
            },
            {
              label: 'Foundation',
              items: [
                { label: 'system', link: '/prompts/system/' },
              ],
            },
          ],
        },
        {
          label: 'Recipes',
          items: [
            { label: 'Fix a Bug', link: '/recipes/fix-a-bug/' },
            { label: 'Small Change', link: '/recipes/small-change/' },
            { label: 'New Milestone', link: '/recipes/new-milestone/' },
            { label: 'Handle UAT Failures', link: '/recipes/uat-failures/' },
            { label: 'Error Recovery', link: '/recipes/error-recovery/' },
            { label: 'Working in Teams', link: '/recipes/working-in-teams/' },
            { label: 'Auto Mode', link: '/auto-mode/' },
            { label: 'Git Strategy', link: '/git-strategy/' },
            { label: 'Cost Management', link: '/cost-management/' },
            { label: 'Token Optimization', link: '/token-optimization/' },
            { label: 'Dynamic Model Routing', link: '/dynamic-model-routing/' },
            { label: 'Captures & Triage', link: '/captures-triage/' },
            { label: 'Parallel Orchestration', link: '/parallel-orchestration/' },
          ],
        },
        {
          label: 'Reference',
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
          label: 'How-to Guides',
          items: [
            { label: 'Configuration', link: '/configuration/' },
            { label: 'Architecture', link: '/architecture/' },
            { label: 'Web Interface', link: '/web-interface/' },
            { label: 'Custom Models', link: '/custom-models/' },
            { label: 'Skills', link: '/skills/' },
            { label: 'Workflow Visualizer', link: '/visualizer/' },
            { label: 'Remote Questions', link: '/remote-questions/' },
            { label: 'Migration from v1', link: '/migration/' },
            { label: 'Troubleshooting', link: '/troubleshooting/' },
          ],
        },
      ],
    }),
  ],
});
