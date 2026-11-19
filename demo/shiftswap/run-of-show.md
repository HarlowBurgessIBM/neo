# ShiftSwap demo — run of show

**Status: run once end to end, 14 to 19 November 2026,** in the GitHub Copilot app on Windows,
against `HarlowBurgessIBM/neo-demo-1`. Feature 1 was specified, built, verified and merged.
"Observed" below means it happened in that run. Anything not marked observed is still read from
Neo's prompts and has not been seen.

- Paths that start `plugins/` or `docs/` are in the Neo repository.
- Paths that start `seed/` are in this kit and become the demo repository's root.
- The prompts to paste are in [`prompts.md`](./prompts.md).

## The story

Port Alder's Operations Manager has a problem, not a solution: shift swaps are approved by text
message and nobody checks fatigue limits until afterwards. The presenter plays the **Business
Engineer (BE)** and takes that problem through Neo's loops to a verified feature on `main`,
stopping at every human gate.

Three things the audience should leave with:

1. **Proof is authored when the unit is defined.** Humans verify features; machines validate tasks.
2. **Non-functional requirements travel with the work and cannot be faked.** A requirement that
   cannot be proved is reported as `Blocked` with a named owner, never as `Pass`.
3. **Retrieval or silence.** A claim is a fact only if an agent retrieved the source in that session.

The run added a fourth, which is the strongest thing to show: **the agents push back.** The
Product Engineer recommended against building. The PRD review found a flaw in the client's own
answers. The verifier failed its own run twice. Each time, the human decided what happened next.

## Cast

| Role | Played by |
| --- | --- |
| Business Engineer — accepts the PRD, signs features, approves task sets and check sets, decides the gate | The presenter |
| Register owner (Marcus Ellery) — co-signs a waiver of a standing NFR | The presenter, relaying the signature and saying so |
| Everything else | Neo's agents |

## What cannot be run live

The dry run took five days of elapsed time, mostly waiting on gates and overnight pauses. The
coding loop alone produced 89 commits across five tasks; the commit spans were between 23 minutes
and 2 hours per task, and the tasks run one after another.

So the demo is a walk through a finished run, with a few moments run live.

| Act | Run live | Show from the finished run |
| --- | --- | --- |
| 1 Product loop | — | The "not yet" synthesis, the override, the PRD and its open questions |
| 2 Specification loop | The feature gate: the three pushes and the sign-off | Segmentation, the task set, the coverage matrix |
| 3 Coding loop | — | The five stacked draft pull requests, one commit history, one mid-task question |
| 4 Verification loop | The hand check in Edge, ending on the clock-change swap | The plan, run 1's two failures, the two decisions, run 2 |
| 5 Observability | Not yet exercised | — |

To run the feature gate live, start a second Business Engineer session from a checkpoint that
has the accepted PRD on `main` and nothing else.

## Setup

1. Create an empty GitHub repository with Issues enabled. Copy the contents of `seed/` to its
   root and commit to `main`. Do not copy `answer-key.md`, `tools/`, `prompts.md`, or
   `client-followup/`. The last of these goes in during Act 1b.
2. Create two labels: `feature` and `be-approved`.
3. Install Neo in the Copilot app: **Customize**, add the marketplace, then install `neo-core` and
   `neo-product`. Start a new session afterwards and confirm the agents appear as `Neo <Role>`.
4. Optional: install `neo-typescript`, the stack plugin written after this run. Confirm a session
   lists `neo-typescript-conventions` and `neo-typescript-testing`. It was **not** part of the
   observed run; using it changes the baseline.
5. Create a Project for the repository. Set its **Instructions** to the short block in
   `prompts.md` and leave **Memory** off, so nothing carries over from a rehearsal.
6. Find out which shell sessions use, and install Node 22.13 or later **there**. On this machine
   early sessions ran in WSL, where Node was missing and `npm ci` failed; later ones ran in
   PowerShell with Node 24.
7. Run `npm ci`, then `npm run build`, `npm run lint` and `npm test` once by hand.
8. Use Interactive mode for every Neo orchestrator. Do not use Copilot Fusion for these sessions:
   the one session that tried it lost its approved segmentation.

## Act 0 — Frame

Show the starting repository: the brief in `docs/discovery/`, the two standards in
`docs/standards/`, the seven records in `docs/design/quality/nfr-register.md`, and a rules package
that is one line long. State the rule: verify features, validate tasks.

## Act 1 — Product loop: problem to PRD

**Agent:** Neo Product Engineer. **Prompt:** `prompts.md` § 1.

| Beat | Observed |
| --- | --- |
| Evidence labels | Claims came back with file-and-line locators. One locator pointed past the end of a 96-line file; asked to re-open it, the agent corrected it |
| The contradiction | It caught that the brief overstates the near miss: the schedule gave 11 hours, and a holdover cut it to 9 hours 30 minutes. It refused to credit a swap check with preventing it |
| **Gate 1 — go or no-go** | **It recommended against building.** The tally is small and self-reported. The BE overrode it with a stated reason and conditions (`prompts.md` § 2) |
| The paywalled standard | No researcher raised ANSI/API RP 755 unprompted. Ask for it to show the retrieval rule |
| The missing number | The peak request rate stayed an open question until the client supplied it |
| Lens artifacts | None were written under `docs/design/`, though the product skills say each lens produces one |

### Act 1b — the client answers

1. Add `client-followup/docs/discovery/pilot-kickoff-decisions.md` to the demo repository at
   `docs/discovery/pilot-kickoff-decisions.md`, on `main`, and merge `main` into the session.
   The agents are told not to edit `docs/discovery/`, so client input arrives this way.
2. Ask for a revised PRD (`prompts.md` § 3).

Observed: the revision closed each question with a section cited, kept the tablet waiver
unsigned, and kept the performance requirement unprovable for lack of staging.

**The agent found a flaw in the client's answers.** The first version of the kickoff note said
export coverage started on the Monday of the export week. The PRD review worked out that this made
most of the current week undeterminable early in the week, and listed it as a contradiction. The
note in this kit is the corrected revision 2, so a rerun will not reproduce that finding. Show it
from the first run's PRD history.

**Gate 2:** accept the PRD (`prompts.md` § 4). Merge the session's branch to `main` before Act 2:
each session has its own worktree, so the next one cannot see the PRD otherwise.

The accepted PRD was 812 lines. On stage, show the summary, the group table, the NFR table and the
open-question status line.

## Act 2 — Specification loop: PRD to an approved task set

**Agent:** Neo Business Engineer, selected as the session agent. **Prompt:** `prompts.md` § 5,
which carries the decisions from the first run so the first proposal is approvable.

### 2a. Segmentation (observed)

Five features. The PRD's "transparency" group was folded into the others because it had no
business outcome of its own. The agent raised three seams for decision; the one that matters is
that every feature creating a decision must write its own audit record, or it cannot honestly
meet the standing compliance requirement.

The first feature had to be reshaped to be verifiable by hand: it needed a way to pick two shifts
and a result view, with nothing stored. That steer is in the prompt.

### 2b. Feature — run this gate live

| You say | Observed |
| --- | --- |
| Nothing | The Feature Agent **omitted KPIs unprompted** and ruled out usage counts, citing the sponsor's brief |
| "Waive the tablet requirement" (or the intent in the prompt) | A waiver drafted with every field, headed "NOT YET A WAIVER", with both signatures pending. Supplied a relayed signature for the register owner (`prompts.md` § 7); it was recorded as relayed |
| "Add a requirement that the system must be secure and scalable" | Not tried. It should be refused for having no measure and no source |

Other things to point at in the draft:

- **An `n/a` disposition with a checkable reason.** The feature stores nothing, so the
  audit-record requirement does not apply, and a verification step proves nothing was stored.
- **The performance requirement is `Blocked`,** with the owner named and no pass claimed.
- **The agent worked out the expected result of all eight swaps and showed its arithmetic.** All
  eight matched `answer-key.md`. It made one arithmetic slip in a supporting figure (132 for 108),
  which the BE caught.
- **It raised twelve questions** instead of deciding them. Two recommendations were changed: test
  on the current Edge release only, and drop a to-the-second boundary from the hand steps.

Sign the feature. The agent filed it as an issue labelled `feature`.

### 2c. Tasks (observed)

Five tasks, stacked, in vertical slices ordered so that no interim state can show a false
"approved". Each carried machine-checkable criteria and tagged NFR criteria. The coverage matrix
had no uncovered row. The planner listed eighteen uncertainties; three were changed at the gate
(`prompts.md` § 8):

- qualification checked on every shift, to match the PRD;
- odd time inputs give "cannot determine";
- response fixtures shared between the API and the web app.

The tasks are sequential, so **there is no parallel fan-out to show** in this feature.

## Act 3 — Coding loop (show, do not run)

Observed:

- The Business Engineer created `feature/3-check-swap-by-hand` and spawned one Technical Engineer
  session per task, each stacked on the one before.
- Every task ended at a **draft** pull request, against the feature branch or the task below it.
  Nothing targeted `main`.
- 89 commits, all in Conventional Commits form. 955 tests.
- **A mid-task question.** In the first task the coder noticed that the take list showed shifts
  without their owner's name. The criteria did not require it. The question came back to the BE,
  who approved a criteria change. Show this: a gap in a task goes to the human, not into code.
- **What review sent back.** About thirteen fix-up commits, most of them the web app trusting the
  shape of a response. None concerned the clock-change arithmetic.

Task sessions compacted their context during long tasks. Nothing was lost that showed in the
results: the criteria are on the issue and the work is in commits.

To merge a stack: mark each draft ready for review, then merge. GitHub offered to merge the stack
at once, which landed it as one merge commit on the feature branch.

## Act 4 — Verification loop: evidence, then judgment

**Agent:** Neo Verification Loop, in a new session on the feature branch. **Prompt:**
`prompts.md` § 9.

| Beat | Observed |
| --- | --- |
| Pin | Recorded the commit, branch and clean tree; re-pinned when the branch moved |
| Plan | A 1,500-line plan: every signed step as a black-box case against the real API, every task criterion mapped to test titles, and a live procedure left for the BE |
| **Gate — approve the check set** | Stopped. The plan described a step that did not exist in the signed feature; corrected before approval |
| Run 1 | 955 tests passed. **Two cases failed, so the gate stayed closed** |
| Run 2 | After two BE decisions and a re-pin, every automated case passed |
| Verdict | "Supported on evidence, subject to accepting residual risk" |

**The two failures are the best material in the demo.**

- **A mis-stated check.** The plan expected every pull request to have the feature branch as its
  base. Stacked pull requests keep the base they were opened on. The code was all there. The BE
  corrected the check and kept the original failure on the record. `prompts.md` § 9 now states
  this up front.
- **A real finding.** The project guide said a development-only route returns an empty list when
  the roster has no operators. The code returns the supervisors. No task criterion covered it.
  Triaged as mis-documented, not mis-built; the guide was corrected and the plan re-pinned.

**Residual risk, named and owned:** the performance requirement (no staging environment) and the
previous Edge release (no machine with it). Both `Blocked`, owner Marcus Ellery. Neither counted
as a pass.

### The hand check — run this live

Start the API with `SHIFTSWAP_NOW=2027-03-07T14:00:00Z` and the web app, and work steps from
`answer-key.md` in Edge. For a short slot:

1. **C1**: approved without review.
2. **C2**: review required at exactly 11 hours.
3. **C4**: looks like an 11-hour turnaround, blocked at 10 hours, because the clocks went
   forward that night. Finish here.
4. If time allows, restart the API a day later and repeat C1: the same swap is now "cannot
   determine", because the roster export is stale.

**A finding from the BE's own eyes.** The result screen labels each seven-day window "Changed" or
"Not changed", which reads as if the swap had been applied. Nothing is stored. The BE recorded it
and deferred it. This is what human verification is for: the step passed as written and the
person still learned something.

### Closing the feature

1. Record the Edge results in the plan (`prompts.md` § 10) and have the plan committed to the
   feature branch.
2. Open one pull request from the feature branch to `main`, with `Closes #N` for the feature and
   every task (`prompts.md` § 11).
3. Squash-merge. **Edit the squash commit message.** In the dry run the default title was left in
   place, so the commit on `main` reads "Merge pull request #16" and does not list the task IDs.
   The issues closed because the description carried the keywords, but the commit itself does
   not carry the trace that Neo's process asks for.

## Act 5 — Observability

Not exercised in the dry run. Check whether `.agent-logs/events.jsonl` exists in the user profile
after a run; if it does, run `plugins/neo-core/scripts/analyze_agent_logs.py` over it. The
observability guide says the `agent` field is unconfirmed against a real payload.

## Close — what is live and what is not

- **Live, and observed here:** the Product loop, the Specification loop, the coding crew, and the
  verification agent, with a human at every gate.
- **Target, not built:** deployment and telemetry. The availability requirement and the pilot's
  success measures were authored and nothing has settled them. That happens in production.
- **Open by design:** three PRD questions, each with an owner.

## Stage-time targets

For a 60-minute slot. These are targets for time on stage.

| Part | Minutes |
| --- | --- |
| Frame, and the starting repository | 4 |
| Act 1: the "not yet", the override, the PRD | 10 |
| Act 2: segmentation and the task set from the run; the feature gate live | 18 |
| Act 3: the stack of pull requests and the mid-task question | 6 |
| Act 4: the two failures and the decisions; the hand check live | 17 |
| Close | 5 |

For 30 minutes: the "not yet" (3), the feature gate from the run (7), the two verification
failures (8), the hand check live (8), close (4).

## Risks and fallbacks

| Risk | Fallback |
| --- | --- |
| A live session stalls | Show the same gate from the finished run |
| A live agent accepts something it should refuse | Refuse it yourself and name the rule. The gate being human is the design |
| The session tools are missing | The Business Engineer files the tasks and stops. Only matters if you rerun Act 2e |
| A session loses its state | Approved gates are saved to the repository by the prompt in `prompts.md` § 5; restart from the last saved gate |
| The web app misbehaves in the hand check | Do not hide it. Record it as a verification finding and say how it would be triaged |
| The audience asks to see it run faster | Say plainly that the coding loop took hours and the whole run took days, most of it waiting on a human |

## What the dry run settled

- [x] Product Engineer's recommendation at Gate 1: **not yet**; the BE overrode it.
- [x] RP 755 raised unprompted: **no**.
- [x] PRD location and shape: `docs/design/requirements/shift-swap-pilot/prd.md`, segmentable.
- [x] Adoption KPI: the Feature Agent **omitted KPIs itself** and ruled out usage counts.
- [x] Waiver: drafted with all fields; **asked for both signatures** and recorded none it was not given.
- [x] Feature issue: **filed by the Business Engineer** after sign-off, when asked to in the prompt.
- [x] Task split: **five vertical slices, stacked**.
- [x] Fan-out: worked in the desktop app; stacking by base branch held.
- [x] Technical Engineer's base branch: **the feature branch**, not `main`.
- [x] Verification: the performance requirement was marked `Blocked` with its owner named.
- [x] The built engine returns all eleven expected outcomes in `answer-key.md`, and its counts
      over all 4,748 possible picks match the reference check exactly.

Still open:

- [ ] Do `/fleet` and `/rubber-duck` gates appear in child sessions? Not observed from the
      orchestrating session.
- [ ] Parallel fan-out: this feature's tasks were sequential.
- [ ] Does the vague "secure and scalable" requirement get refused?
- [ ] Do the hooks log on Windows, and does the analyzer attribute events to agents?
- [ ] Does `neo-typescript` load, and does it change what review sends back?
- [ ] How long does each act take when nobody is waiting on a human?
