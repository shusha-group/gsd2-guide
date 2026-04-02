# S03: Content Consolidation — UAT

**Milestone:** M008
**Written:** 2026-04-02T13:31:34.728Z

## UAT: S03 Content Consolidation

### Preconditions
- Site built locally via `npm run build` (exit 0)
- Dev server running via `npm run dev` or inspecting `dist/`
- Browser open to the local dev server

---

### Test 1: Control Your Costs recipe exists and is accessible

**Steps:**
1. Navigate to `/recipes/control-your-costs/`
2. Confirm the page loads with title "Control Your Costs"
3. Verify the page has all four sections: "Setting Budgets & Tracking Costs", "Token Optimisation Strategies", "Dynamic Model Routing", "Monitoring & Alerts"
4. Confirm content uses Australian English (e.g. "Optimisation" not "Optimization")

**Expected:** Page loads, all 4 sections present, Australian English throughout.

---

### Test 2: Sidebar shows exactly one cost entry

**Steps:**
1. Open any page and inspect the sidebar
2. Look in the Recipes section for cost-related entries
3. Confirm there is exactly 1 entry labelled "Control Your Costs"
4. Confirm there is no "Cost Management", "Token Optimization", or "Dynamic Model Routing" entry in the sidebar

**Expected:** Exactly 1 cost entry: "Control Your Costs". No old entries visible.

---

### Test 3: Old cost pages show redirect notices

**Steps:**
1. Navigate to `/cost-management/`
2. Confirm a redirect notice pointing to `/recipes/control-your-costs/` is visible
3. Repeat for `/token-optimization/` and `/dynamic-model-routing/`

**Expected:** All three old pages load and display a redirect notice with a link to the new recipe.

---

### Test 4: Solo Guide and Cost Examples cross-link to the recipe

**Steps:**
1. Navigate to `/solo-guide/controlling-costs/`
2. Find a link to `/recipes/control-your-costs/`
3. Navigate to `/cost-examples/`
4. Find a link to `/recipes/control-your-costs/`

**Expected:** Both pages contain a working link to the Control Your Costs recipe.

---

### Test 5: Skills, Extensions & Agents guide exists and is accessible

**Steps:**
1. Navigate to `/skills-extensions-agents/`
2. Confirm the page loads
3. Verify sections for Skills, Extensions, and Agents are present
4. Confirm there are links to `/reference/skills/`, `/reference/extensions/`, and `/reference/agents/`

**Expected:** Page loads with all three sections and links to reference pages.

---

### Test 6: Sidebar shows Skills, Extensions & Agents in Learn More

**Steps:**
1. Open any page and inspect the Learn More section of the sidebar
2. Confirm there is an entry labelled "Skills, Extensions & Agents"
3. Confirm there is no standalone "Skills" entry in Learn More

**Expected:** "Skills, Extensions & Agents" present; standalone "Skills" absent.

---

### Test 7: Auto-mode ↔ How Auto Mode Works cross-links

**Steps:**
1. Navigate to `/auto-mode/`
2. Find a link to `/how-auto-mode-works/` (expect in an "Under the Hood" section)
3. Navigate to `/how-auto-mode-works/`
4. Find a link back to `/auto-mode/` (expect near the top)

**Expected:** Both pages link to each other; links are working (not 404).

---

### Test 8: Zero broken links

**Steps:**
1. Run `npm run check-links` from the project root

**Expected:** Exit 0, 0 broken links across all pages.

---

### Edge Cases

- **Old skills.md page**: Navigate to `/skills/` — should show a redirect notice pointing to `/skills-extensions-agents/`.
- **Reference pages untouched**: Navigate to `/reference/skills/`, `/reference/extensions/`, `/reference/agents/` — these should load with their generated card content, not the conceptual guide content.
- **Build idempotency**: Run `npm run build` twice consecutively — both should exit 0 with 150 pages.

