---
name: run-unit-tests
description: Executes project compilation, linting, and unit tests using npm.
metadata:
  audience: developers
  framework: npm
---

## What I do
I provide the standard commands needed to compile the code, check for linting errors, and execute the unit test suite.

## When to use me
Use this skill whenever you need to verify that recent code changes haven't broken the build, or when the user explicitly asks to run tests. 

## Instructions
When instructed to run tests, use your bash/terminal tool to execute the following command at the root of the project:

```bash
npm run compile && npm run lint && npm run test:unit
```

If the command fails, analyze the output to determine if it was a compilation error, a linting issue, or a failing unit test, and assist the user in fixing the problem.
