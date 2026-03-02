---
description: Archive current active planning documents in .planning
agent: build
---

**Purpose:**
Archive completed planning documents to preserve implementation history and update project knowledge.

**Pre-conditions:**

1. Verify these files exist in `.planning/`:
   - `story.md` (optional but recommended)
   - `tech-spec.md` (required)
   - `active-plan.md` (required)

2. Check completion status:
   - All checkboxes in `active-plan.md` are marked `[x]`
   - If incomplete: **STOP** and ask user for confirmation

**Action:**

1. **Extract feature name** from `tech-spec.md`:
   - Use the title from the first `# Technical Specification: [Feature Name]`
   - Convert to kebab-case: lowercase, spaces → dashes, remove special chars
   - Example: "Fix Multiline Statement Selection" → "fix-multiline-statement-selection"

2. **Create archive directory**:
   - Format: `.planning/archive/YYYY-MM-DD_feature-name/`
   - Use today's date (ISO format with dashes)
   - Check if directory exists; if yes, append `-v2`, `-v3`, etc.

3. **Move planning files**:
   - Move `story.md`, `tech-spec.md`, `active-plan.md` to archive directory
   - If `guide.md` exists, move it too
   - Preserve all other files in `.planning/` (if any)

4. **Update AGENTS.md** (if applicable):
   
   Review the completed feature and update AGENTS.md if any of these changed:
   
   - **Project Structure**: New modules, directories, or file organization
     ```
     ## Project Structure
     src/
     ├── new-module/           # ← Add if created
     ```
   
   - **Build/Test Commands**: New scripts or changed commands
     ```
     ## Build, Lint, and Test Commands
     - **New command**: `npm run new-command`
     ```
   
   - **Code Patterns**: New patterns worth documenting
     ```
     ## Code Style Guidelines
     ### New Pattern Category
     - Pattern description
     ```
   
   - **Development Workflow**: New workflow steps
     ```
     ### Development Workflow
     5. `npm run new-step` - Description
     ```
   
   **Important**: Only update if the feature introduced NEW patterns/conventions that should be followed in future work. Don't duplicate existing documentation.

5. **Verify archive**:
   - Confirm all files were moved successfully
   - Verify `.planning/` is ready for new work (or empty)

**Error Handling:**

- If required files missing: Ask user which files to archive
- If archive directory exists: Append version number
- If AGENTS.md update fails: Warn user but don't block archive

**Final Action:**

Report to user:
```
✅ Archived: [feature-name]
📁 Location: .planning/archive/YYYY-MM-DD_feature-name/
📝 Files archived: story.md, tech-spec.md, active-plan.md
🔄 AGENTS.md: [Updated with X changes / No updates needed]
```

**Quality Checklist:**
- [ ] All planning files moved to archive
- [ ] Archive directory follows naming convention
- [ ] AGENTS.md reviewed and updated if needed
- [ ] No files left in `.planning/` (except archive folder)
- [ ] Archive verified to contain all files
