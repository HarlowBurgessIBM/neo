# ShiftSwap demo — prompts

The prompts that worked in the first run, in the order they are used. **Presenter material: do not
copy this file into the demo repository.**

Sections marked *run-specific* answer questions an agent raised in that run. Use them as examples;
a new run will raise different ones.

## 0. Project instructions (Copilot app, Project settings)

Leave **Memory** off. Set **Instructions** to:

```text
This repository is a fictional demonstration project. AGENTS.md at the repository root is the source of truth for layout, commands, style and guardrails. Read it before acting, and follow it over anything written here.

A human Business Engineer owns every gate. Never accept a requirements document, sign a feature, approve a task set or a check set, or sign a waiver on their behalf. Stop and wait.

Treat a claim about this project as a fact only when you have read the file that states it in this session, and cite it as path:line. Say "unknown" instead of filling a gap.

Install dependencies with `npm ci`, never `npm install`, and do not change package.json or package-lock.json unless the task says to.
```

## 1. Product loop — the problem

Agent: **Neo Product Engineer**.

```text
Shift supervisors at Port Alder Refinery approve operator shift swaps by text message and a spreadsheet. Nobody checks the fatigue limits or qualifications until after the swap is worked. The client's brief, interview notes, and a near-miss summary are in docs/discovery/. Their standards are in docs/standards/. Work out whether this is worth solving and what should exist. Do not assume we should build software.
```

## 2. Gate 1 — overriding a "not yet"

```text
Three things before the PRD, then my decision.

1. Check every file-and-line locator against the file. Re-open any file whose locator you cannot confirm and correct it.

2. Tell me which agent_type you used for each researcher and each of the three lenses, and whether any was a fallback. Explain why no lens artifacts were written to docs/design/.

3. Answer one more research question, labelled per the evidence standard: what does ANSI/API RP 755 require for hours of service?

Decision: proceed to a PRD for a pilot. I am not accepting the recommendation to defer, for this reason: the standard requires checking both employees' full resulting schedules, and the supervisors say they do not calculate rest hours and cannot see the other unit's roster. The pilot is the validation vehicle.

Scope and conditions for the PRD:
- Pilot only: Crude Distillation Unit and Hydrocracker Unit, control-room desktops.
- Holdovers are a non-goal. The PRD must not claim the pilot would have prevented the near miss's shortfall.
- Carry every open assumption into the PRD as an open assumption, each with a named owner. Do not resolve them.
- Hours follow the fatigue standard as written. The training-days disagreement is an open question for the HSSE Manager.
- Record the process-only alternative as considered, with why it was not chosen for the pilot.
- Success criteria are outcome measures against the tally baselines, stated as self-reported.
- List the standing NFRs that bind this work. If one needs a figure nobody has supplied, record it as an open question; do not supply one.
```

## 3. Act 1b — the client answers

After `docs/discovery/pilot-kickoff-decisions.md` is on `main` and merged into the session:

```text
The client has answered the open questions. Their decisions are in docs/discovery/pilot-kickoff-decisions.md. Revise the PRD: close each open question that the decisions answer, citing the section; leave open anything they do not answer; and state the peak request rate where the standing performance requirement needs it. Do not change scope.
```

## 4. Gate 2 — accepting the PRD

Name the questions you are leaving open.

```text
I am the Business Engineer assigned by IT Applications (kickoff § 1.2). I accept this version of the PRD with its remaining open questions. Record the acceptance in the PRD's status and change log, then stop. Do not start the Specification loop.
```

Then commit, push and merge the session's branch to `main`.

## 5. Specification loop — one pass

Agent: **Neo Business Engineer**, selected as the session agent, in a new session from `main`.

```text
Run the Specification loop on docs/design/requirements/shift-swap-pilot/prd.md (accepted). I am the Business Engineer assigned by IT Applications (kickoff § 1.2). You draft and sequence; I sign and approve. Stop at each of the three gates below and show the full output in your message.

GATE 1 — SEGMENTATION. Propose a segmentation of the whole PRD that meets these constraints, which I have already decided:

- Five features. Group F is not a feature; put its notices on the views they belong to. Distribute H1's timestamps to the features that create them.
- Feature 1 is a standalone check that an operator can use by hand. It includes B1 to B4, C1, F1, F2, and only the part of A1 that lets an operator pick one of their own shifts and one of another employee's and see the result for both employees, including the refusal for shifts outside the pilot units. The result is one of: approved without review, review required, cannot be approved, cannot determine. "Approved without review" is a classification here, not a stored approval. Nothing is stored and no consent is taken.
- In Feature 1, B3 covers only conditions that need no stored requests: missing roster or qualification records, missing or inconsistent export fields, the horizon, and export age. Name the later feature that first verifies each of the others: the overlay of approved swaps, undecided conflicting requests, and contradicted swaps.
- B5 belongs only to the feature that reaches a decision. C2 to C6 stay with routing.
- Show the NFR-by-segment attachment. Carry the open questions, the unsigned tablet waiver and the retention candidate as open items; do not resolve them.

After I approve, save the segmentation to docs/design/requirements/shift-swap-pilot/segmentation.md, commit it on this session's branch, and push the branch. Never commit to main.

Only Feature 1 goes further today. Features 2 to 5 are boundaries only.

GATE 2 — FEATURE 1. Have the Feature Agent draft it, then stop for my sign-off. I expect:

- Constraints: a disposition for all seven standing NFRs, each with its reason. I intend to waive NFR-COMPAT-002 on the terms in kickoff § 5.4: draft the waiver with every required field and ask me for both signatures. Do not record a signature I have not given.
- KPIs: include one only if it meets the KPI rule in AGENTS.md; otherwise omit it and say why. No usage or adoption measures.
- Verification steps I can carry out by hand in the local environment, in Microsoft Edge, with SHIFTSWAP_NOW=2027-03-07T14:00:00Z unless a step says otherwise. Write one step for each swap below, naming the operators and shifts. Work out the expected result of each from the fatigue standard and data/roster.sample.json, state it, and show the arithmetic so I can check it:
  1. Maya Thibodeaux gives CDU-CON1-0318-N and takes Luis Fontenot's CDU-CON1-0319-N.
  2. Aisha Okafor gives HCU-CON2-0312-N and takes Priya Raman's HCU-CON1-0310-D.
  3. Maya Thibodeaux gives CDU-CON1-0310-D and takes Luis Fontenot's CDU-CON1-0312-D.
  4. Maya Thibodeaux gives CDU-CON1-0310-D and takes Dwayne Hebert's HCU-CON1-0314-D.
  5. Tom Broussard gives CDU-FLD1-0309-D and takes Jerome Guidry's CDU-FLD1-0318-D.
  6. Priya Raman gives HCU-CON1-0308-D and takes Dwayne Hebert's HCU-CON1-0317-D.
  7. Swap 1 again, with SHIFTSWAP_NOW=2027-03-08T12:00:00Z.
  8. Maya Thibodeaux gives CDU-CON1-0318-N and takes Nadia Trahan's FCC-CON1-0318-D.

After I sign, write the feature artifact, file the feature as a GitHub issue labelled `feature`, and tell me the issue number.

GATE 3 — TASK SET. Have the Task Planner split Feature 1, then stop for my approval of the set as a whole. I expect:

- Vertical slices that each validate on their own, not a split by layer.
- Machine-checkable validation criteria, including one for the night of 13 to 14 March 2027, when site clocks go forward.
- The NFR coverage matrix with no uncovered row: a tagged criterion for each NFR proved at task stage, and a deferral for each proved later.
- The planner's uncertainty, stated plainly.

After I approve, file each task as an issue in the canonical task body with the `be-approved` label, post the coverage matrix as a comment on the feature issue, and then spawn one session per task. If you cannot see the session tools, say so and stop after filing.
```

The swaps correspond to cases C1, C2, C3, C4, C5, C7, C10 and C11 in `answer-key.md`. The
prompt gives the swaps and withholds the outcomes, so the agent has to derive them.

## 6. Feature gate — decisions *(run-specific)*

```text
Accepted, with two changes and one correction.

Accepted as recommended: the precedence rule; refuse visibly; naming the reviewing unit optional; the Q25 observation kept as conditional; the missing-versus-unqualified rule; operator role only; malformed-data cases left to task fixtures; COMP-001 n/a; signing with PERF-001 Blocked and REL-001 deferred, residual risk with Marcus Ellery; boundaries left to task criteria.

Change 1, COMPAT-001: I will run the steps on the current Edge release only. Record the previous major release as not tested, with the residual risk owned by Marcus Ellery. Do not claim it.

Change 2: drop the to-the-second export-age boundary from the verification steps and make it a task criterion.

Correction, step 2: Aisha's rest after the new shift is 108 hours on the clock, not 132. The 107 hours elapsed is right.
```

## 7. The waiver — both signatures

```text
Waiver of NFR-COMPAT-002 on the terms drafted: I sign as the Business Engineer. Marcus Ellery, the register owner, also signs; I am relaying his signature, which he agreed to give in kickoff § 5.4. Record both, and record that his was relayed by me.
```

## 8. Task-set gate — decisions *(run-specific)*

```text
Approved as a set, with three changes. Apply them, show me only the criteria that change, then file.

1. Check § 3.3 on every shift in each employee's resulting schedule within coverage, not only the taken shift, labelled changed or not changed by the swap. PRD B1 says "every roster shift". A failure on an unchanged shift is a § 3.3 finding. Add a fixture criterion for it.

2. A "now" earlier than exportedAt, an invalid site time zone, and a roster time that does not exist or is ambiguous at a clock change each give cannot determine, naming the input. Keep startup failure for a malformed SHIFTSWAP_NOW and 503 for a missing or unreadable roster file.

3. Add shared response fixtures for the verification steps. Each API test asserts its response equals the committed fixture, and each web test renders from the same file. Do not make the web app depend on API code.
```

A mid-task question that came back from the first task, and the answer:

```text
Yes. Show the owner's name on each take option. Amend the task with these criteria and build it in the open pull request:

- Each take entry in GET /api/shifts carries the owner's name. Do not add other employees' employee numbers to take entries.
- The picker shows the owner's name with each take option, and the name is part of the option's accessible label.
- The existing NFR-PRIV-001 log-capture criterion still passes with names in the response body.
- The shared response fixtures are updated to match.

Record this as a criteria change I approved on the task, not as new scope.
```

## 9. Verification loop

Merge the task pull requests into the feature branch first. Mark each draft ready for review to
merge it. Agent: **Neo Verification Loop**, in a new session on the feature branch.

```text
Verify Feature 1, issue #<feature>, on the branch feature/<feature>-<slug>. All task pull requests are merged into it. If this session is not on that branch, check it out in this session's own worktree.

The criteria are the feature's verification steps in docs/design/requirements/shift-swap-pilot/feature-1-check-swap-by-hand.md and each task issue's validation criteria. The NFRs are in the "NFR coverage matrix" comment on the feature issue. Write the plan where AGENTS.md says verification plans go.

The task pull requests were stacked. Each one's base is either the feature branch or the head branch of the pull request below it. When you pin, check that every pull request is merged and that its head commit is an ancestor of the pinned commit; do not expect every base to be the feature branch.

Stop for my approval of the check set before running anything. The hand steps in Edge are mine to perform; put them in the plan's live procedure for me, and do not mark them Pass.
```

Read the plan's scripts before approving. You are approving code the agent will run.

When a case fails, decide what it is before anything is changed. The two decisions from the first
run, as examples *(run-specific)*:

```text
D4: the expected result of the pin check was mis-stated. Keep the original Fail and its reason in the record. This is a correction to the check, not a change to match the result, and it does not go back to the builder.

D5: triaged as mis-documented, not mis-built. AGENTS.md is corrected on the feature branch. Update the expectation to match the corrected document, and keep the original Fail in the record.

Re-pin to the new HEAD, say that the earlier pin is stale, and rerun every block.
```

## 10. Recording the hand check

```text
My results for the live procedure, performed by me in Microsoft Edge at <commit>:

- Edge version from edge://version: <full version string>. Edge reported it was up to date.
- Every live case: Pass.
- Observations: <anything you saw that the steps did not ask about>.

Record these as my results, complete the tester record, and give me the gate verdict with the residual-risk list.
```

Then:

```text
Commit only the verification plan to the feature branch and push that branch. Do not commit anything else, and do not touch main. Then confirm the commit ID.
```

## 11. Closing the feature

Pull request from the feature branch to `main`. Put this in the description **and** in the squash
commit message, with a Conventional Commits title such as
`feat: check a proposed swap by hand (Feature #<n>)`:

```text
Closes #<feature>
Closes #<task>
Closes #<task>

Verified at <commit>. Plan and results: docs/design/verification/<plan>.md.
Residual risk, owner Marcus Ellery: NFR-PERF-001 (no staging environment); NFR-COMPAT-001 on the previous Edge release (not tested).
NFR-COMPAT-002 waived for the pilot.
```
