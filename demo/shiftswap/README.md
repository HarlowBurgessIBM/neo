# ShiftSwap demo kit

Everything needed to demonstrate Neo across the agentic development lifecycle on one small target
application. **Dev-time material — not shipped in any plugin.**

The target is **ShiftSwap**: refinery operators request a shift swap, a rules engine checks it
against the site fatigue standard and qualification records, clean swaps are approved without a
supervisor, and the rest are blocked with the rule cited or sent for supervisor review. The client
is fictional — **Veridane Energy, Port Alder Refinery**.

## What is here

| Path | What it is | Goes into the demo repo? |
| --- | --- | --- |
| `seed/` | The starting contents of the demo repository: project `AGENTS.md`, client standards, discovery notes, standing NFR register, roster fixture, and a TypeScript skeleton that builds, lints, and tests green | **Yes — all of it, as the first commit** |
| `client-followup/` | The client's answers to the PRD's open questions (`docs/discovery/pilot-kickoff-decisions.md`). Introduced after the first PRD draft, not before | **Yes — but only after Act 1's first PRD draft** |
| `run-of-show.md` | The presenter script: setup, acts, prompts, the gates, fallbacks, and what a dry run still has to confirm | No |
| `answer-key.md` | The expected outcome of eleven scripted swaps against the roster fixture | **No — keep it away from the agents** |
| `tools/build-roster.mjs` | Regenerates `seed/data/roster.sample.json` | No |
| `tools/reference-check.mjs` | Independently computes the answer key from the fixture and the fatigue standard | **No — it is an answer key in code** |

## Standing up the demo repository

Neo runs against a *consuming* repository, so the seed has to live in a repository of its own.

1. Create an empty GitHub repository with Issues enabled.
2. Copy the **contents** of `seed/` to its root and commit to `main`. Copy nothing else from this
   folder.
3. Follow `run-of-show.md` § Setup.

## What is and is not verified

- **Verified here:** the seed's `npm run build`, `npm run lint`, and `npm test` exit 0 on Node
  22.23; `npm run dev:api` serves `/api/healthz`; the answer key is computed by
  `tools/reference-check.mjs`, not written by hand.
- **Not verified:** nothing in `run-of-show.md` has been run against GitHub Copilot. Every
  "expected" behaviour there is read from Neo's agent prompts and skills and has to be confirmed
  in a dry run.

## Fictional content

Veridane Energy, Port Alder Refinery, every named person, and every figure and limit in
`seed/docs/standards/` and `seed/docs/discovery/` are invented. The fatigue limits are **not**
taken from ANSI/API RP 755 or any regulation. One web search for each name found no company
called "Veridane Energy" and no refinery called "Port Alder"; that is not a trademark check.
