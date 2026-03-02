---
description: Create story.md in .planning
agent: plan
---

You will create a comprehensive user story explaining exactly WHAT feature, bug, or refactoring needs to be implemented.

**Input:**
$ARGUMENTS

**Action:**

1. **Context Discovery**
   - Read `AGENTS.md` to understand project conventions
   - Search for related code patterns using glob/grep (similar features, related modules)
   - Check `.planning/archive/` for similar past implementations
   - Identify which modules/files are likely affected

2. **Draft User Story** using this template:

```markdown
# User Story: [Feature/Bug Name]

## Feature Goal
[1-2 sentences: What problem does this solve? Why is it needed?]

## Context & Motivation
[When would a user encounter this? What's the current pain point?]

## Expected Behavior
[What should happen? Be specific and concrete]

## Current Behavior (for bugs)
[What currently happens that's wrong or missing?]

## Examples

### Example 1: [Scenario Name]
```python
# Code example showing expected behavior
```

[Explanation of what this demonstrates]

### Example 2: [Edge Case]
[Show edge cases, error conditions, or unusual scenarios]

## Acceptance Criteria
- [ ] Criterion 1: [Specific, testable condition]
- [ ] Criterion 2: [Another measurable requirement]
- [ ] Criterion 3: [Edge case handling]

## Technical Constraints
[Are there limitations? Performance requirements? Compatibility concerns?]

## Assumptions
[What are we assuming about the implementation context?]

## Out of Scope
[What explicitly will NOT be addressed in this story?]

## Dependencies
[Does this depend on other features or blocks other work?]
```

3. **Validate Story Quality**:
   - Is the goal clear and specific?
   - Are there at least 2-3 concrete examples?
   - Do examples cover happy path AND edge cases?
   - Are acceptance criteria testable?
   - Is it clear WHAT needs to be done (not HOW)?

4. **Clarify Ambiguities**: If the input is unclear or could have multiple interpretations:
   - Present 2-3 specific interpretations
   - Show code examples for each interpretation
   - Ask the user to select or provide more detail

5. **Request Missing Examples**: If scenarios are underspecified:
   - Suggest specific example scenarios based on codebase patterns
   - Provide options for the user to choose from
   - Include edge cases you've identified from similar features

6. **Update and Refine**: Incorporate user feedback into the story

**Final Action:**

Ask the user: "Should I create `.planning/story.md` with this content?"

If yes, delegate file creation to the @general agent.
