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
   - Use the question tool to present 2-3 specific interpretations as options
   - Include code examples in the option descriptions
   - Allow user to select an interpretation or type their own answer

5. **Request Missing Examples**: If scenarios are underspecified:
   - Use the question tool to suggest specific example scenarios as options
   - Include edge cases in option descriptions
   - Enable multiple selection if needed

6. **Update and Refine**: Incorporate user feedback into the story

**Final Action:**

Use the question tool to ask: "Should I create `.planning/story.md` with this content?"
- Options: ["Yes, create it (Recommended)", "No, refine first", "Show me the content first"]
- If "Yes, create it": Delegate file creation to the @general agent
- If "No, refine first": Gather feedback using the question tool and update the story
- If "Show me the content first": Display the story and then ask again
