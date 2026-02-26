---
description: Archive current active planning documents in .planning
agent: build
---

**Condition:** 
1. There are files in the `./.planning/` folder. Expected are `guide.md`, `tech-sepc.md` and `active-plan.md`.
2. All todos in `active-plan.md` are marked as complete.

If any of the conditions are not met: `question` the user for confirmation to proceed. Do not continue to make any changes.

**Action:**
1. Review `./.planning/tech-spec.md`.
2. Update `AGENTS.md` with new project structures, capabilities, and code patterns.
3. Move `.planning/*.md` to `.planning/archive/YYYY_MM_DD_feature_name/`. Extract a feature_name from the `tech-spec.md`: find a concise and descriptive title as feature name.
