import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightClientMermaid from '@pasqal-io/starlight-client-mermaid';

export default defineConfig({
  site: 'https://getshitdone.help',
  base: '/',
  integrations: [
    starlight({
      title: 'Get Shit Done',
      plugins: [starlightClientMermaid()],
      customCss: [
        './src/styles/custom.css',
        './src/styles/terminal.css',
      ],
      components: {
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
      },
      head: [
        {
          tag: 'script',
          attrs: {
            'data-goatcounter': 'https://getshitdone.goatcounter.com/count',
            async: true,
            src: '//gc.zgo.at/count.js',
          },
        },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Home', link: '/' },
            { label: 'Is GSD Right for Me?', link: '/is-gsd-right-for-me/' },
            { label: 'Choose Your Path', link: '/choose-your-path/' },
            { label: 'FAQ', link: '/faq/' },
            { label: 'Quick Reference', link: '/quick-reference/' },
            { label: 'Writing a Good Brief', link: '/writing-a-good-brief/' },
            { label: 'Cost Examples', link: '/cost-examples/' },
            { label: 'Installation', link: '/user-docs/getting-started/' },
            { label: 'Developing with GSD', link: '/user-guide/developing-with-gsd/' },
            { label: 'Discussing a Milestone', link: '/user-guide/discussing-a-milestone/' },
          ],
        },
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
          label: 'Recipes',
          items: [
            { label: 'Fix a Bug', link: '/recipes/fix-a-bug/' },
            { label: 'Small Change', link: '/recipes/small-change/' },
            { label: 'New Milestone', link: '/recipes/new-milestone/' },
            { label: 'Handle UAT Failures', link: '/recipes/uat-failures/' },
            { label: 'Error Recovery', link: '/recipes/error-recovery/' },
            { label: 'Working in Teams', link: '/recipes/working-in-teams/' },
            { label: 'Auto Mode', link: '/user-docs/auto-mode/' },
            { label: 'Git Strategy', link: '/user-docs/git-strategy/' },
            { label: 'Control Your Costs', link: '/recipes/control-your-costs/' },
            { label: 'Captures & Triage', link: '/user-docs/captures-triage/' },
            { label: 'Parallel Orchestration', link: '/user-docs/parallel-orchestration/' },
          ],
        },
        {
          label: 'Commands',
          items: [
            { label: 'Commands Reference', link: '/user-docs/commands/' },
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
              ],
            },
            {
              label: 'Monitoring & Capture',
              items: [
                { label: '/gsd status', link: '/commands/status/' },
                { label: '/gsd forensics', link: '/commands/forensics/' },
                { label: '/gsd export', link: '/commands/export/' },
                { label: '/gsd logs', link: '/commands/logs/' },
              ],
            },
            {
              label: 'Milestone Management',
              items: [
                { label: '/gsd cleanup', link: '/commands/cleanup/' },
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
                { label: '/gsd mcp', link: '/commands/mcp/' },
                { label: '/gsd rethink', link: '/commands/rethink/' },
            { label: '/gsd workflow', link: '/commands/workflow/' },
                { label: 'Keyboard Shortcuts', link: '/commands/keyboard-shortcuts/' },
                { label: 'CLI Flags', link: '/commands/cli-flags/' },
                { label: 'Headless Mode', link: '/commands/headless/' },
              ],
            },
                { label: 'add-tests', link: '/prompts/add-tests/' },
                { label: 'debug-diagnose', link: '/prompts/debug-diagnose/' },
                { label: 'debug-session-manager', link: '/prompts/debug-session-manager/' },
                { label: 'parallel-research-slices', link: '/prompts/parallel-research-slices/' },
                { label: 'refine-slice', link: '/prompts/refine-slice/' },
                { label: 'scan', link: '/prompts/scan/' },
                { label: 'workflow-oneshot', link: '/prompts/workflow-oneshot/' },
          ],
        },
        {
          label: 'Learn More',
          items: [
            {
              label: 'Understand GSD',
              items: [
                { label: 'How Auto Mode Works', link: '/how-auto-mode-works/' },
                { label: 'Architecture', link: '/dev/architecture/' },
                { label: 'The .gsd/ Directory', link: '/gsd-directory/' },
                { label: 'The Story of GSD', link: '/story-of-gsd/' },
                { label: 'GSD v1 vs v2', link: '/v1-to-v2/' },
              ],
            },
            {
              label: 'Configure & Extend',
              items: [
                { label: 'Configuration', link: '/user-docs/configuration/' },
                { label: 'Custom Models', link: '/user-docs/custom-models/' },
                { label: 'Skills, Extensions & Agents', link: '/skills-extensions-agents/' },
                { label: 'Web Interface', link: '/user-docs/web-interface/' },
                { label: 'Workflow Visualizer', link: '/user-docs/visualizer/' },
                { label: 'Remote Questions', link: '/user-docs/remote-questions/' },
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
              label: 'Help',
              items: [
                { label: 'Troubleshooting', link: '/user-docs/troubleshooting/' },
                { label: 'Migration from v1', link: '/user-docs/migration/' },
                { label: 'Glossary', link: '/glossary/' },
              ],
            },
            {
              label: 'Prompts',
              collapsed: true,
              items: [
                {
                  label: 'Auto-mode Pipeline',
                  collapsed: true,
                  items: [
                    { label: 'complete-milestone', link: '/prompts/complete-milestone/' },
                    { label: 'complete-slice', link: '/prompts/complete-slice/' },
                    { label: 'execute-task', link: '/prompts/execute-task/' },
                    { label: 'gate-evaluate', link: '/prompts/gate-evaluate/' },
                    { label: 'plan-milestone', link: '/prompts/plan-milestone/' },
                    { label: 'plan-slice', link: '/prompts/plan-slice/' },
                    { label: 'reactive-execute', link: '/prompts/reactive-execute/' },
                    { label: 'reassess-roadmap', link: '/prompts/reassess-roadmap/' },
                    { label: 'replan-slice', link: '/prompts/replan-slice/' },
                    { label: 'research-milestone', link: '/prompts/research-milestone/' },
                    { label: 'research-slice', link: '/prompts/research-slice/' },
                    { label: 'rethink', link: '/prompts/rethink/' },
                    { label: 'validate-milestone', link: '/prompts/validate-milestone/' },
                  ],
                },
                {
                  label: 'Guided Variants',
                  collapsed: true,
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
                  collapsed: true,
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
                  collapsed: true,
                  items: [
                    { label: 'system', link: '/prompts/system/' },
                  ],
                },
              ],
            },
            { label: 'Changelog', link: '/changelog/' },
          ],
        },
      ],
    }),
  ],
});
