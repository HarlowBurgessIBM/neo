# neo-typescript

A Neo **stack plugin**: the technology tier for TypeScript. It ships skills only. It adds no
agents and no hooks, and it changes no loop.

`neo-core`'s Code Writer, Code Reviewer and Implementation Planner are told to load the relevant
skill for the technology in front of them and to fall back to the consuming repository's
`AGENTS.md` when none matches. This plugin is what they find for TypeScript. They select a skill
by its description, never by name, so the descriptions carry the file extensions, the technology
names and the phase each skill serves
(`docs/contributing/reference/stack-plugin-contract.md` § Skill description format).

## What's inside

- **Skills** (`skills/`):
  - `neo-typescript-conventions` — writing and reviewing TypeScript source: narrowing data at
    boundaries, strict-option pitfalls, discriminated unions, and date, time zone and duration
    arithmetic. Ends with a review checklist.
  - `neo-typescript-testing` — writing and reviewing tests with Vitest and fast-check: boundary
    examples, property tests, deterministic time, proving a test can fail, and response fixtures
    shared between a server and its client. Ends with a review checklist.

## Where the content came from

The first version was written from one end-to-end run of the coding loop on a TypeScript
project: five tasks, 89 commits. The fix-up commits that code review produced were mostly one
kind of defect, a client trusting the shape of a response, with smaller groups around request
body handling and date edge cases. The skills lead with those.

## Install

```
copilot plugin marketplace add HarlowBurgessIBM/neo
copilot plugin install neo-core@neo
copilot plugin install neo-typescript@neo   # must say "Installed 2 skills."
```

A skill whose description does not match the task never loads, and nothing reports it. After
installing, ask a session to list the skills available to it and confirm both names appear.

## What does not belong here

Anything that changes between two TypeScript projects: layout, commands, lint rules, the
libraries a project has chosen. Those stay in the consuming repository's `AGENTS.md`.
