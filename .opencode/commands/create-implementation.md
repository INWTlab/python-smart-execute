---
description: Execute active-plan.md by creating todos and implementing step-by-step
agent: build
---

You will execute the implementation plan in `.planning/active-plan.md` one step at a time, using opencode's todo system to track progress.

**Input:**
Implementation plan from `.planning/active-plan.md`

**Action:**

1. **Parse the Plan**
   - Read `.planning/active-plan.md`
   - Read `.planning/tech-spec.md` for implementation details
   - Identify all cycles and their tasks

2. **Create Todo List**
   
   Parse the plan structure and create todos using the `todowrite` tool. Each checkbox item becomes a todo task:
   
   **For TDD Plans (New Features):**
   ```
   Cycle 1: [Feature Name]
   - STUB: Create function signature
   - TEST: Write failing test
   - VERIFY FAIL: Run tests (expect failure)
   - IMPLEMENT: Replace stub with real logic
   - VERIFY PASS: Run tests (expect pass)
   - REFACTOR: Clean up code
   - VERIFY PASS: Run tests (expect pass)
   ```
   
   **For Bugfix Plans (Red-Green-Refactor):**
   ```
   Cycle 1: [Bug Fix Name]
   - RED: Write failing test that demonstrates bug
   - VERIFY FAIL: Run tests (confirm bug exists)
   - GREEN: Fix the bug
   - VERIFY PASS: Run tests (bug fixed)
   - REFACTOR: Clean up if needed
   - VERIFY PASS: Run tests (still passing)
   ```

3. **Execute Tasks Sequentially**
   
   For each todo task (in order):
   
   **STUB Tasks:**
   - Check if target file exists
   - Create file if missing, or read and update if exists
   - Add function signature with dummy return value (e.g., `return null`, `return true`)
   - Do NOT implement real logic yet
   
   **TEST Tasks:**
   - Check if test file exists (create if missing)
   - Import the function/module being tested
   - Write test case that asserts the *real* expected behavior
   - Test should be specific and match tech-spec requirements
   
   **RED Tasks (for Bugfixes):**
   - Write a test that demonstrates the current buggy behavior
   - The test should fail, proving the bug exists
   
   **VERIFY FAIL Tasks:**
   - Run the test command from `AGENTS.md` (usually `npm run test:unit`)
   - **Expected**: Test FAILS (non-zero exit code)
   - **If passes**: STOP - the test is broken (false positive). Ask user for help.
   
   **IMPLEMENT Tasks:**
   - Read the failing test output to understand what's needed
   - Replace stub/buggy code with real implementation
   - Follow the approach described in `tech-spec.md`
   
   **GREEN Tasks (for Bugfixes):**
   - Fix the bug in the identified file/section
   - Follow the fix approach from `tech-spec.md`
   
   **VERIFY PASS Tasks:**
   - Run the test command from `AGENTS.md`
   - **Expected**: Test PASSES (exit code 0)
   - **If fails**: Debug and retry (up to 3 attempts), then ask for help
   
   **REFACTOR Tasks:**
   - Improve code for readability, performance, or maintainability
   - Do NOT change behavior
   - Focus on: naming, structure, removing duplication
   
4. **Progress Tracking**
   
   - Update todo status as you work:
     - `pending` → `in_progress` (when starting a task)
     - `in_progress` → `completed` (when task succeeds)
   - After completing a task, move to the next one
   - After completing a full cycle, report progress to user

5. **Cycle Boundaries**
   
   - If next task is in the **same cycle**: Continue automatically
   - If next task starts a **new cycle**: 
     - Report completion of current cycle
     - Ask user: "Cycle [N] complete. Continue with next cycle?"

**Error Handling:**

- **No active-plan.md**: Report "No implementation plan found. Run `/create-active-plan` first."
- **All tasks complete**: Report "All tasks in active-plan are complete!"
- **Test unexpectedly passes** (VERIFY FAIL): STOP and ask user - test may be wrong
- **Test fails 3 times** (VERIFY PASS): STOP and ask user for help
- **Missing tech spec**: STOP - do not guess signatures, ask user

**Important Rules:**

- **NEVER** modify `tech-spec.md` or `story.md`
- **Only** modify source code, test files, and files listed in tech-spec
- **Always** run lint/typecheck after implementation if specified in AGENTS.md
- **Follow** the exact test command from AGENTS.md (e.g., `npm run test:unit`)

**Example Workflow:**

```
→ Reading active-plan.md...
→ Found 2 cycles with 14 total tasks
→ Creating todo list...

✓ Cycle 1: getMultilineStatementRange
  [ ] STUB: Add function signature
  [ ] TEST: Write unit tests
  [ ] VERIFY FAIL: Run tests
  [ ] IMPLEMENT: Bracket balancing logic
  [ ] VERIFY PASS: Run tests
  [ ] REFACTOR: Clean up
  [ ] VERIFY PASS: Run tests

✓ Cycle 2: smartSelect Integration
  [ ] STUB: Call getMultilineStatementRange
  [ ] TEST: Write integration tests
  ...

→ Starting Cycle 1, Task 1: STUB
  [in_progress] STUB: Add function signature
  → Reading src/smartExecute/selection.ts...
  → Adding function signature with dummy return...
  [completed] STUB: Add function signature
  
→ Starting Cycle 1, Task 2: TEST
  [in_progress] TEST: Write unit tests
  → Creating test file...
  → Writing test cases...
  [completed] TEST: Write unit tests
  
→ Cycle 1 complete. Continue with next cycle?
```

**Quality Checklist:**
- [ ] active-plan.md parsed correctly
- [ ] Todos created for all tasks
- [ ] Test command matches AGENTS.md
- [ ] Each task executed in order
- [ ] Verify steps actually run tests
- [ ] Progress tracked via todo status