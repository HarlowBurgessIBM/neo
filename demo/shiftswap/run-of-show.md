# ShiftSwap demo — run of show

**Status: drafted from Neo's prompts and docs, not yet run.** Every "Neo should" below is what an
agent prompt or skill instructs. None of it has been observed against GitHub Copilot. The
[dry-run checklist](#dry-run-checklist) lists what only a run can settle.

Paths that start `plugins/` or `docs/` are in the Neo repository. Paths that start `seed/` are in
this kit and become the demo repository's root.

## The story

Port Alder's Operations Manager has a problem, not a solution: shift swaps are approved by text
message and nobody checks fatigue limits until afterwards. The presenter plays the **Business
Engineer (BE)** and takes that problem through Neo's loops to a draft pull request and a
verification verdict, stopping at every human gate.

Three things the audience should leave with:

1. **Proof is authored when the unit is defined.** Humans verify features; machines validate tasks.
2. **Non-functional requirements travel with the work and cannot be faked.** A requirement that
   cannot be proved is reported as `Blocked` with a named owner, never as `Pass`.
3. **Retrieval or silence.** A claim is a fact only if an agent retrieved the source in that session.

## Cast

| Role | Played by |
| --- | --- |
| Business Engineer — signs features, approves task sets, approves check sets | The presenter |
| Register owner (Marcus Ellery) — co-signs a waiver of a standing NFR | The presenter, saying so out loud, or a colleague |
| Everything else | Neo's agents |

## Setup

Do this before the day. Steps 3 and 4 use the commands in the Neo repository's `AGENTS.md`
§ Checks.

1. Create an empty GitHub repository with Issues enabled. Copy the contents of `seed/` to its
   root and commit to `main`. Do not copy `answer-key.md`, `tools/`, or `client-followup/`.
   The last of these goes in during Act 1b.
2. Create two labels: `feature` and `be-approved`.
3. Install Neo: add the marketplace, then install `neo-core` and `neo-product`. Confirm the CLI
   reports the installed skill count for each.
4. Confirm the agents appear in the picker as `Neo <Role>`.
5. Use the **Copilot desktop app** for Act 2 onward. The Business Engineer's session fan-out does
   not exist in a bare terminal (`docs/guides/using-neo.md`).
6. In the demo repository, run `npm ci`, then `npm run build && npm run lint && npm test`.
   On Windows the app runs sessions inside WSL, so Node 22.13 or later must be installed in the
   WSL distribution itself. In the first dry run it was not, and `npm ci` failed.
7. On macOS or Linux, install `jq`; the logger needs it
   (`docs/contributing/guides/observability.md`).
8. Run the whole show once. After each act, push a `checkpoint/act-N` branch so any act can start
   from a known state if the one before it stalls.

## Live versus pre-run

| Act | Run live | Pre-run, then show the artifacts |
| --- | --- | --- |
| 1 Product loop | The two human gates | Research fan-out and the three lenses |
| 2 Specification loop | All of it — this is the centre of the demo | — |
| 3 Coding loop | One task: the rules engine | The other tasks, as sessions already finished |
| 4 Verification loop | Check-set approval, the verdict, the hands-on feature check | Plan drafting, if it is slow |
| 5 Observability | The analyzer output | — |

This split is a judgment made without timings. Measure each act in the dry run and adjust.

## Act 0 — Frame

Show the demo repository before any agent runs: the brief in `docs/discovery/`, the two standards
in `docs/standards/`, the seven records in `docs/design/quality/nfr-register.md`, and the fact
that `packages/rules/src/index.ts` is one line. State the rule: verify features, validate tasks.

## Act 1 — Product loop: problem to PRD

**Agent:** Neo Product Engineer.

**Prompt:**

> Shift supervisors at Port Alder Refinery approve operator shift swaps by text message and a
> spreadsheet. Nobody checks the fatigue limits or qualifications until after the swap is worked.
> The client's brief, interview notes, and a near-miss summary are in docs/discovery/. Their
> standards are in docs/standards/. Work out whether this is worth solving and what should exist.
> Do not assume we should build software.

| Beat | What Neo should do | Where that comes from |
| --- | --- | --- |
| Research fan-out | One Product Researcher per question; every claim labelled `FACT` with a file-and-line locator, `INFERENCE`, or `RECALL — UNVERIFIED` | `neo.product.engineer.agent.md` Phase 0; `neo-evidence-standard` |
| The paywalled standard | The fatigue standard § 5 names ANSI/API RP 755. The text of RP 755 is sold, not published, so no limit from it can be a `FACT`. It should surface as a gap or as unverified recall, and no RP 755 figure should reach the PRD | `neo-evidence-standard` § The rule |
| The contradiction | The two supervisors disagree on whether training days count toward hours. It should be carried into the PRD's open assumptions, not resolved | Phase 0: "Carry contradictions forward" |
| Standing NFRs | The seven register records are found and treated as binding; nobody in the loop edits the register | Phase 0; `neo-nfr-authoring` § 4 |
| **Gate 1 — go or no-go** | Neo stops at synthesis. Decide out loud: proceed, pilot scope only | Phase 4 gate |
| The missing number | NFR-PERF-001 needs a peak request rate and the interviews say nobody knows it. It should become an open question, not an invented figure | `neo-nfr-authoring` § 3 |
| **Gate 2 — accept the PRD** | PRD at `docs/design/requirements/<name>/prd.md`, with prioritised requirements, non-goals, and an NFR section | Phase 5 gate |

**To force the RP 755 beat** if no researcher goes near it, ask: *"What does API RP 755 require
for hours of service?"* In the first dry run no researcher raised it unprompted.

**Expect a "not yet" at Gate 1.** In the first dry run the Product Engineer recommended against
authorising a build: the tally is small and self-reported, and it caught that the brief
overstates the near miss (the schedule gave 11 hours; a holdover cut it to 9 hours 30 minutes).
That is a good result to show. Proceed anyway, as the Business Engineer, with a pilot-scoped PRD,
and say what you are accepting: holdovers are a non-goal, and every open assumption is carried
into the PRD with an owner.

**Check the citations.** In the same run one locator pointed past the end of a 96-line file. Ask
the agent to re-open the file and correct it; that is the evidence standard doing its job.

### Act 1b — the client answers

The first PRD draft ends with a list of open questions. Several of them block any approval at all
(how current the roster export is, how far it reaches, who the decider is when nobody reviews).

1. Add `client-followup/docs/discovery/pilot-kickoff-decisions.md` to the demo repository at
   `docs/discovery/pilot-kickoff-decisions.md`, on `main`, and bring it into the session's branch.
2. Prompt the Product Engineer:

   > The client has answered the open questions. Their decisions are in
   > docs/discovery/pilot-kickoff-decisions.md. Revise the PRD to version 0.2: close each open
   > question that the decisions answer, citing the section; leave open anything they do not
   > answer; and state the peak request rate where the standing performance requirement needs it.
   > Do not change scope.

3. What to look for: each closed question cites a section of the decisions; NFR-PERF-001 now has
   its rate and is still unprovable, because there is still no staging environment; the tablet
   requirement is still **not** waived, because the note says it is not the waiver.
4. **Gate 2:** accept PRD version 0.2.

## Act 2 — Specification loop: PRD to an approved task set

**Agent:** Neo Business Engineer, selected as the session agent.

**Prompt:** `Run the Specification loop on docs/design/requirements/<name>/prd.md.`

### 2a. Segmentation

Neo should propose segments, each with its own business justification, and an NFR × segment
attachment (`neo.business-engineer.agent.md` step 1). In the first dry run the PRD
itself proposed six groups: request and consent; rules check of both employees; routing, review
and decisions; decision records; scheduler handoff; transparency. Approve the segmentation and say
that only the rules check is being built today.

### 2b. Feature — three deliberate pushes

While the Feature Agent drafts the first segment's feature, make these three requests. Each one
shows a rule holding.

| You say | What should happen | Where that comes from |
| --- | --- | --- |
| "Add a requirement that the system must be secure and scalable." | Refused as an NFR: no measure, no source. It is recorded as an open question | `neo-nfr-authoring` § 3 admission rule |
| "We are piloting on control-room desktops only. Waive the tablet requirement." | A waiver of NFR-COMPAT-002 is drafted with all six fields; its terms are in the kickoff decisions § 5.4. Because the record is standing, it needs the BE **and** the register owner. Neo does not record a signature it was not given. Supply both | `neo-nfr-authoring` § 6; `neo.business-engineer.agent.md` step 2 |
| "Add a KPI: 80% of operators use ShiftSwap within 30 days." | **Uncertain — see below** | — |

**The KPI push needs care.** Neo's rule that usage metrics are inadmissible for captive users is
written in `docs/concepts/process-flow.md` § The two fits. It is **not** in the shipped
`neo-feature-authoring` skill, which says only to omit a KPI "with no credible basis". The seed
gives the agent something local to cite — `seed/AGENTS.md` § KPIs and items 10–11 of the
Operations Manager's brief — but whether the agent refuses on its own is unknown. If it accepts
the KPI, reject it yourself at the gate and say why. That is still the point: the gate is human.

A KPI that should survive: *median supervisor handling time per swap falls from the 14-minute
baseline*, with the baseline, what measures it, the window, and the result that would count as
failure. The baseline is in `seed/docs/discovery/supervisor-interviews.md` § 1.

### 2c. Feature — sign-off

Before signing, check two things on screen.

- **Constraints.** All seven standing records have a disposition. Expected: NFR-PRIV-001,
  NFR-COMP-001, NFR-A11Y-001, NFR-PERF-001, NFR-REL-001, and NFR-COMPAT-001 `mapped`;
  NFR-COMPAT-002 `waived`. An `n/a` disposition does not arise for this feature. It would for the
  hand-back feature, which has no user interface.
- **Verification steps.** They are things the BE does by hand in the local environment, and they
  name real people and shifts from the roster. Steer them toward cases C1, C2, C4, and C7 in
  `answer-key.md` without reading the outcomes aloud.

Sign the feature. Then file it as a GitHub issue labelled `feature`. Neo's prompts do not say who
files the feature issue, and every task body needs its number — ask the Business Engineer to file
it, or run `gh issue create` yourself.

### 2d. Tasks

Neo should present the Task Planner's split, its stated uncertainty, and an NFR coverage matrix,
then stop for approval of the set as a whole (`neo.business-engineer.agent.md` step 3).

Two interventions to make:

1. **If the split is by layer** (database, API, UI), push back and ask for vertical slices.
2. **Add a validation criterion to the rules-engine task:** *"A CDU day shift ending 18:00 on
   2027-03-13 followed by an HCU day shift starting 05:00 on 2027-03-14 is 10 hours off duty and
   is blocked."* This is the human adding the case a machine will then enforce.

Read the coverage matrix aloud. Every row must be covered: a tagged criterion for the three
task-stage records, a deferral for NFR-PERF-001, NFR-REL-001, and NFR-COMPAT-001, and a dash for
the waived record (`neo-nfr-authoring` § 8). Approve the set.

Neo should then file each task as an issue in the canonical body with the `be-approved` label,
and post the matrix as a comment on the feature issue (step 4).

### 2e. Fan-out

Neo should create one session per task, in parallel where tasks are independent and chained by
`base_branch` where one depends on another (step 5). Let them run and move to Act 3.

## Act 3 — Coding loop: one task to a draft pull request

**Agent:** Neo Technical Engineer, on the rules-engine task. It is the best one to watch: pure
logic, fast tests, and the clock-change case.

| Beat | What Neo should do | Where that comes from |
| --- | --- | --- |
| Branch | Names the branch from the issue, `feat/<issue>-<slug>` | `neo.technical-engineer.agent.md` step 1 |
| **Gate — `/fleet`** | Stops and asks you to run `/fleet` before research | step 2 |
| Plan | An ordered list of units, feature units and test units separately | step 3 |
| **Gate — `/rubber-duck`** | Stops and asks you to run `/rubber-duck` on the plan | step 3 |
| Implement | One Conventional Commit per unit, each from the Code Writer | step 4 |
| Review loop | Reviewer findings go back to the writer verbatim until approved | step 5 |
| Draft pull request | Linked to the issue, stating NFRs checked, NFRs deferred, and that all N units passed review. Left as a draft | step 6 |

Then show the other tasks' sessions and their draft pull requests.

## Act 4 — Verification loop: evidence, then judgment

**Agent:** Neo Verification Loop, selected as the session agent. Have the pull-request branch
checked out first: the agent will not switch a shared checkout
(`neo.verification-loop.agent.md` step 1).

**Part 1 — the task.** Prompt: `Verify pull request #<n> against issue #<m>.`

| Beat | What Neo should do |
| --- | --- |
| Pin | Records the commit SHA, branch, and working-tree state |
| Plan | Writes a case matrix to `docs/design/verification/`, with a negative or boundary case per criterion |
| **Gate — approve the check set** | Stops and shows the cases and commands verbatim |
| Execute | Runs every command itself and records exit codes and test counts |
| Verdict | Per-case results, one row per NFR, residual risk with owners. Deferred NFRs are listed as deferred, not passed |

**Part 2 — the feature.** Once the task pull requests are on the feature branch, ask it to verify
the feature issue. Two results to point at:

- **NFR-PERF-001 is `Blocked`.** Its proving layer needs a staging environment, and the client has
  none (`seed/docs/standards/engineering-standard.md` § 9). The residual risk is owned by the
  record's Owner, Marcus Ellery. It is not passed on the strength of a unit test.
- **NFR-COMPAT-001 is a live procedure**, so it is yours to run, in Microsoft Edge.

**Part 3 — the BE verifies.** Start the API and the web app with
`SHIFTSWAP_NOW=2027-03-07T14:00:00Z`, and work the feature's verification steps by hand against
`answer-key.md`. Finish on **C4**: the swap looks like an 11-hour turnaround and is blocked at 10
hours, because the clocks went forward. That is the criterion you added in Act 2d. If time allows,
restart with the clock a day later and repeat C1: the swap that was approved now comes back as
*cannot determine*, because the export is stale (C10).

**Optional talking point.** If a verification step fails, Neo's process does not default to
"write more code". The BE decides whether the feature was mis-built or mis-specified
(`docs/concepts/process-flow.md` § Boundary 3). The training-days question from Act 1 is a ready
example of a possible mis-specification. This triage is a documented process, not an agent.

## Act 5 — Observability

Run the analyzer over the session logs
(`plugins/neo-core/scripts/analyze_agent_logs.py`; usage in
`docs/contributing/guides/observability.md` § Analyze). It reports per-agent activity and, per
run, the number of review-then-fix rounds. More than one round is the signal to tighten a task's
criteria.

## Close — what is live and what is not

Say this plainly; Neo's own docs do.

- **Live:** the Product loop, the Specification loop, the coding crew, and the verification agent.
- **Target, not built:** feature-level verification as a loop, deployment, and telemetry. So
  NFR-REL-001 and the KPI were *authored* today and nothing has *settled* them. That happens in
  production, after the window closes.

## Stage-time targets

For a 60-minute slot. These are targets for time on stage, not measured agent run times.

| Act | Minutes |
| --- | --- |
| 0 Frame | 3 |
| 1 Product loop | 10 |
| 2 Specification loop | 20 |
| 3 Coding loop | 12 |
| 4 Verification loop | 10 |
| 5 Observability and close | 5 |

For 30 minutes, show Act 1 from its artifacts only, run Act 2 live, and show Acts 3 and 4 from
finished sessions.

## Risks and fallbacks

| Risk | Fallback |
| --- | --- |
| An agent stalls or takes too long | Switch to the `checkpoint/act-N` branch for the next act |
| The session tools are missing, so the Business Engineer cannot fan out | It should file the tasks and stop. Run the Technical Engineer on one task by hand |
| An agent accepts something it should refuse (the KPI, the vague NFR) | Refuse it yourself at the gate and name the rule. The gate being human is the design |
| The Technical Engineer opens its pull request against `main` | Its prompt says "to the default branch"; the seed's `AGENTS.md` says the feature branch. Retarget the base by hand, or remove the integration-mode paragraph from the seed |
| The network blocks web research in Act 1 | The repository documents carry the case on their own. Say that external research was unavailable |
| The engine gets C4 wrong | Do not hide it. It is a failed verification step, which is what Act 4 is for |

## Dry-run checklist

Only a run can answer these. Record each answer here.

- [ ] How long does each act take end to end?
- [ ] Does the Product Engineer write the PRD where `seed/AGENTS.md` says, and is it segmentable?
- [x] Does any researcher raise RP 755 unprompted? **No** (first dry run).
- [x] What does the Product Engineer recommend at Gate 1? **Not yet** (first dry run); the BE
      overrode it.
- [ ] Does the Feature Agent refuse the adoption KPI, or does the BE have to?
- [ ] Does the waiver draft ask for the register owner's signature?
- [ ] Who files the feature issue?
- [ ] Does the Task Planner produce vertical slices, and how many tasks?
- [ ] Does the fan-out work in the desktop app, and does `base_branch` chaining hold?
- [ ] Which base branch does the Technical Engineer target?
- [ ] Do `/fleet` and `/rubber-duck` exist in the installed Copilot version?
- [ ] Does the verification agent mark NFR-PERF-001 `Blocked` and name its Owner?
- [ ] Does the built engine return the eleven expected outcomes in `answer-key.md`?
- [ ] Does PRD version 0.2 close the open questions from the kickoff decisions without changing
      scope?
- [ ] Does the analyzer attribute events to agents? The observability guide says the `agent`
      field is not yet confirmed against a real payload.
