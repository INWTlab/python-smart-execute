---
description: Execute active-plan.md by delegating cycles to sub-agents with interruptible state tracking
agent: build
---

You will execute the implementation plan in `.planning/active-plan.md` by delegating each cycle to a sub-agent. The main agent only tracks cycle-level progress, enabling interruption and resumption at any time.

**Input:**
Implementation plan from `.planning/active-plan.md`

**Architecture:**
- **Main Agent (Orchestrator)**: Manages cycle-level todos, delegates implementation to sub-agents, syncs state to disk
- **Sub-Agent (Implementer)**: Executes all tasks within a single cycle (STUB/TEST/IMPLEMENT/VERIFY/REFACTOR)

**Action:**

1. **Parse the Plan and Restore State**
   - Read `.planning/active-plan.md`
   - Read `.planning/tech-spec.md` for implementation details
   - Check which cycles are already marked `[x]` complete in active-plan.md
   - Identify remaining cycles that need implementation

2. **Create/Restore Cycle-Level Todo List**
   
   Create todos ONLY for cycles (not individual tasks). Use the `todowrite` tool:
   
   ```
   - Cycle 1: [Feature Name] (completed/pending/in_progress)
   - Cycle 2: [Feature Name] (pending)
   - Cycle 3: [Feature Name] (pending)
   ```
   
   If resuming after interruption:
   - Mark already-completed cycles (from active-plan.md checkboxes) as `completed`
   - Mark current cycle as `in_progress` if partially done
   - Remaining cycles as `pending`

3. **Execute Cycles via Sub-Agents**
   
   For each incomplete cycle, in order:
   
   **a. Mark Cycle In Progress**
   - Update todo: `pending` → `in_progress`
   
   **b. Delegate to Sub-Agent**
   
   Use the `task` tool to launch a `general` sub-agent with this prompt structure:
   
   ```
   Execute Cycle [N]: [Cycle Name] from .planning/active-plan.md
   
   Read the cycle tasks from .planning/active-plan.md and execute them in order:
   
   Tasks for this cycle:
   [List the specific tasks for this cycle from active-plan.md]
   
   Execute each task:
   - STUB: Add function signature with dummy return
   - TEST: Write failing test matching tech-spec
   - VERIFY FAIL: Run tests (must fail)
   - IMPLEMENT: Replace stub with real logic per tech-spec.md
   - VERIFY PASS: Run tests (must pass)
   - REFACTOR: Clean up code (no behavior change)
   - VERIFY PASS: Run tests (must pass)
   
   Rules:
   - Follow test command from AGENTS.md (npm run test:unit)
   - Run lint/typecheck after implementation if specified in AGENTS.md
   - Do NOT modify tech-spec.md or story.md
   - Return SUCCESS when all cycle tasks complete, or FAILURE with error details
   ```
   
   **c. Handle Sub-Agent Result**
   
   - **SUCCESS**: 
     - Update todo: `in_progress` → `completed`
     - Sync to active-plan.md: Mark cycle checkbox as `[x]`
     - Report completion to user
     - Continue to next cycle
   
    - **FAILURE**:
      - Keep cycle as `in_progress`
      - Report error to user
      - Use the question tool with options: ["Retry this cycle", "Skip and continue", "Stop execution"]
   
   **d. Sync State After Each Cycle**
   
   After sub-agent completes successfully:
   1. Update active-plan.md checkbox: `- [ ]` → `- [x]`
   2. Update opencode todo list: cycle marked `completed`
   3. Report: "Cycle [N] complete. State synced."

4. **Cycle Boundaries**
   
   - **Within same session**: Continue to next cycle automatically
   - **After interruption**: Parse active-plan.md to find last completed cycle, resume from next
   - **User pause request**: Complete current cycle first, then stop (state is preserved)

5. **Interruption and Resumption**
   
   This architecture enables clean resumption:
   
   ```
   Session 1:
   → Cycle 1: completed, synced to disk
   → Cycle 2: completed, synced to disk
   → Cycle 3: in_progress when interrupted
   
   Session 2 (resumption):
   → Parse active-plan.md: Cycles 1-2 marked [x]
   → Create todos: Cycles 1-2 completed, Cycle 3 in_progress
   → Re-delegate Cycle 3 to sub-agent
   → Continue from there
   ```

**Error Handling:**

- **No active-plan.md**: Report "No implementation plan found. Run `/create-active-plan` first."
- **All cycles complete**: Report "All cycles in active-plan are complete!"
- **Sub-agent failure**: Report error, use the question tool with options: ["Retry this cycle", "Skip and continue", "Stop execution"]
- **Missing tech spec**: STOP - sub-agent cannot proceed without specifications

**Important Rules:**

- **Main agent**: Only manages cycles, delegates all implementation to sub-agents
- **Sub-agents**: Do all STUB/TEST/IMPLEMENT/VERIFY/REFACTOR work
- **State sync**: After each cycle, update both active-plan.md AND todo list
- **Never skip sync**: Always sync state before moving to next cycle
- **Resumability**: Any session can resume by reading active-plan.md checkboxes

**Example Workflow:**

```
→ Reading active-plan.md...
→ Found 3 cycles, 2 already complete
→ Restoring todo state...
  
  [x] Cycle 1: getMultilineStatementRange (completed)
  [x] Cycle 2: smartSelect Integration (completed)
  [ ] Cycle 3: Edge Cases (pending)

→ Starting Cycle 3...
  [in_progress] Cycle 3: Edge Cases
  
→ Delegating to sub-agent...
  → Sub-agent executing: STUB, TEST, VERIFY FAIL, IMPLEMENT, VERIFY PASS, REFACTOR, VERIFY PASS
  → Sub-agent reports: SUCCESS
  
→ Syncing state...
  → Updated active-plan.md: Cycle 3 marked [x]
  → Updated todo list: Cycle 3 completed
  
→ Cycle 3 complete. State synced.
→ All cycles complete!
```

**Resumption Example:**

```
→ Reading active-plan.md...
→ Cycle 1: [x] complete
→ Cycle 2: [ ] incomplete (was in progress when interrupted)
→ Cycle 3: [ ] pending

→ Creating todos from saved state...
  [x] Cycle 1: getMultilineStatementRange (completed)
  [ ] Cycle 2: smartSelect Integration (in_progress)
  [ ] Cycle 3: Edge Cases (pending)

→ Resuming Cycle 2...
  → Delegating to sub-agent...
  → Sub-agent executing remaining tasks...
```

**Quality Checklist:**
- [ ] active-plan.md parsed correctly
- [ ] Only cycle-level todos created (not task-level)
- [ ] Sub-agent receives complete cycle context
- [ ] State synced to active-plan.md after each cycle
- [ ] State synced to todo list after each cycle
- [ ] Resumption works from saved state
