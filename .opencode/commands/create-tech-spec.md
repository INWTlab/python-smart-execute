---
description: Create tech-spec.md in .planning
agent: plan
---

You will create a technical specification explaining exactly HOW a feature, bug, or refactoring needs to be implemented.

**Input:**
User story from `.planning/story.md`

**Action:**

1. **Context Discovery**
   - Read `.planning/story.md` to understand WHAT needs to be implemented
   - Search for existing code patterns (similar features, related modules, existing utilities)
   - Check `.planning/archive/` for similar past implementations
   - Identify which files will need changes

2. **Draft Technical Specification** using this template:

```markdown
# Technical Specification: [Feature/Bug Name]

## 1. Files to Modify
[List existing files that need changes]

- `src/path/to/file.ts`: [What needs to change and why]
  - Current behavior: [Brief description]
  - New behavior: [Brief description]
  - Functions/sections affected: [List specific functions or line ranges]

## 2. Files to Create
[List new files to add, if any]

- `src/path/to/new-file.ts`: [Purpose and responsibility]

## 3. Implementation Approach

### What to Implement

**For each change/addition:**

- **[Function/Feature Name]**: [What it should do]
  - **Location**: `src/path/to/file.ts`
  - **Approach**: [How to implement - algorithm, pattern, or strategy]
  - **Tools/Utilities to use**: [Existing functions, libraries, or patterns to leverage]
  - **Edge cases to handle**: [List specific edge cases]

### External Dependencies

**Decision: Build vs Buy**
- [ ] No new external dependencies needed
- [ ] New dependency required: [library name]
  - **Why needed**: [Justification]
  - **Why not build internally**: [Reasoning]
  - **Alternatives considered**: [What else was evaluated]

## 4. Test Strategy

### What to Test

**For each behavior/feature:**

1. **[Test Scenario Name]**
   - **What**: [What behavior to verify]
   - **Given**: [Initial state/setup]
   - **When**: [Action taken]
   - **Then**: [Expected outcome]
   - **Edge cases**: [Specific edge cases for this scenario]

### Test Files

- `src/test/suite/test-file.test.ts`:
  - Test suite: [Name]
  - Test cases to add: [List specific test cases]

## 5. Design Decisions

[List key decisions and rationale]

- **[Decision]**: [Why this approach]
  - Alternatives considered: [What else was evaluated]
  - Trade-offs: [Pros/cons of chosen approach]
```

3. **Validate Specification Quality**:
   - Is it clear WHICH files to modify and create?
   - Is the implementation approach specific enough (without writing code)?
   - Are the tools/utilities to use identified?
   - Are test scenarios concrete (Given/When/Then)?
   - Is there a clear decision on external dependencies?
   - Are design decisions documented with rationale?

4. **Clarify Ambiguities**: If anything is unclear:
   - Ask about implementation approach
   - Discuss external library vs internal implementation
   - Clarify edge case handling
   - Confirm design decisions

5. **Update and Refine**: Incorporate feedback

**Final Action:**

Ask the user: "Should I create `.planning/tech-spec.md` with this content?"

If yes, delegate file creation to the @general agent.

**Quality Checklist:**
- [ ] Files to modify clearly identified
- [ ] Files to create clearly identified (if any)
- [ ] Implementation approach is clear (without code)
- [ ] Tools/utilities to use are specified
- [ ] Test scenarios use Given/When/Then format
- [ ] Edge cases identified
- [ ] External dependencies decided
- [ ] Design decisions documented
