---
description: Create active-plan.md in .planning
agent: plan
---

You will create a step-by-step implementation plan based on the technical specification.

**Input:**
Technical specification from `.planning/tech-spec.md`

**Action:**

1. **Context Discovery**
   - Read `.planning/tech-spec.md` to understand the implementation approach
   - Read `.planning/story.md` to understand the feature goal
   - Search for existing test patterns in the codebase
   - Identify the test command from `AGENTS.md`

2. **Determine Plan Type**:
   - **New Feature/Function**: Use the **TDD Template** (with stubs)
   - **Bugfix**: Use the **Red-Green-Refactor Template** (no stubs - existing code is the "stub")

3. **Draft Implementation Plan** using the appropriate template:

### Template A: TDD (for New Features)

```markdown
# TDD Implementation Plan

## Cycle 1: [Feature/Function Name]
- [ ] **STUB**: Create/Update `[filename]` with function signature `[signature]`. Return static/dummy value.
- [ ] **TEST**: Create unit test in `[test-filename]` asserting the *real* expected behavior.
- [ ] **VERIFY FAIL**: Run test command `[cmd]`. **Expect failure** (Red State).
- [ ] **IMPLEMENT**: Update `[filename]` to replace stub with real logic.
- [ ] **VERIFY PASS**: Run test command `[cmd]`. **Expect pass** (Green State).
- [ ] **REFACTOR**: Improve code for readability/performance without changing behavior. Re-run tests.
- [ ] **VERIFY PASS**: Run test command `[cmd]`. **Expect pass** (Refactored State).

## Cycle 2: [Next Feature]
...
```

### Template B: Red-Green-Refactor (for Bugfixes)

```markdown
# Implementation Plan: Bugfix

## Issue: [Bug Description]
**Root Cause**: [Brief explanation of what's wrong]

## Cycle 1: [Bug Fix Name]
- [ ] **RED**: Create failing test in `[test-filename]` that demonstrates the bug (uses current buggy behavior as expected failure).
- [ ] **VERIFY FAIL**: Run test command `[cmd]`. **Expect failure** (confirms bug exists).
- [ ] **GREEN**: Fix the bug in `[filename]` by updating `[function/section]`.
- [ ] **VERIFY PASS**: Run test command `[cmd]`. **Expect pass** (bug is fixed).
- [ ] **REFACTOR**: Clean up the fix if needed. Re-run tests.
- [ ] **VERIFY PASS**: Run test command `[cmd]`. **Expect pass**.

## Cycle 2: [Related Fix or Edge Case]
...
```

4. **Validate Plan Quality**:
   - Is the test command correctly identified from AGENTS.md?
   - Are cycles appropriately sized (1 logical unit per cycle)?
   - For bugfixes: Does the test clearly demonstrate the bug?
   - For features: Are stubs simple and correct?

5. **Clarify Ambiguities**: If anything is unclear:
   - Use the question tool to ask about cycle breakdown with specific options
   - Use the question tool to confirm test file locations with discovered locations as options
   - Use the question tool to discuss refactoring opportunities with concrete suggestions

**Final Action:**

Use the question tool to ask: "Should I create `.planning/active-plan.md` with this content?"
- Options: ["Yes, create it (Recommended)", "No, refine first", "Show me the plan first"]
- If "Yes, create it": Delegate file creation to the @general agent
- If "No, refine first": Gather feedback using the question tool and update the plan
- If "Show me the plan first": Display the plan and then ask again

**Quality Checklist:**
- [ ] Correct template used (TDD vs Red-Green-Refactor)
- [ ] Test command matches AGENTS.md
- [ ] Cycles are appropriately sized
- [ ] Test files identified
- [ ] Verification steps included