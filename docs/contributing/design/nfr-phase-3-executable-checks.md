# First-Class NFRs, Phase 3 — executable checks (design proposal)

Why this document exists: Phases 1 and 2 ([HarlowBurgessIBM/neo#3](https://github.com/HarlowBurgessIBM/neo/pull/3),
[HarlowBurgessIBM/neo#4](https://github.com/HarlowBurgessIBM/neo/pull/4)) gave every NFR an identity and a carrier,
and put a coverage check at every gate. Every one of those checks is **enforced by agent prose and human approval**.
Phase 3 makes the checks **executable**: a tool can say "this record is malformed", "this task set has an uncovered
NFR", "this waiver has lapsed", "this IaC violates `NFR-SEC-002`", and "this SLO was breached" — without an agent
having to notice.

**Status: proposal.** This is a *design* doc. It changes nothing until its pieces land in the owning docs and skills
listed in [§ Changes by file](#changes-by-file). Nothing here is `[live]`. It extends
[nfr-first-class-support.md](./nfr-first-class-support.md) (accepted), whose § Phase 3 named three items; this doc
designs them and adds what Phases 1–2 left unenforced. Open decisions are in [§ Decisions needed](#decisions-needed),
each with a recommended default.

Terms in **bold** are defined in the [glossary](../../glossary.md). The NFR record, tiers, waivers, and coverage
matrix are owned by the `neo-nfr-authoring` skill
([`SKILL.md`](../../../plugins/neo-core/skills/neo-nfr-authoring/SKILL.md)); this doc links to it rather than
restating it.

**Evidence note.** Claims about this tree are `FACT` with a `path:line` locator read this session. Claims about GitHub
Actions are `FACT` from *Events that trigger workflows*
(<https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows>), fetched this
session. Anything else is labeled. The upstream issues #14, #67, and #68 are **not readable from this repository**
(it has no issues; they live upstream); what is known of them comes only from `todo.md:31-32,41`.

---

## The problem — what Phases 1–2 leave unenforced

| Gap | Where it stands today | Consequence |
| --- | --- | --- |
| **Record form is unchecked.** | The record block is fixed-key and "meant to parse line by line, so a later tool can compute coverage instead of an agent" — but no tool exists (FACT: `neo-nfr-authoring/SKILL.md` § 2, "The record block"). | A malformed ID, a wrong prefix, a missing Owner, or an unknown layer survives until a human notices. |
| **Coverage is unchecked.** | The matrix rule "a set with an uncovered row cannot be approved" is enforced by the Task Planner and the BE agent (FACT: `neo.task-planner.agent.md` step 6; `neo.business-engineer.agent.md` step 3). | The single load-bearing artifact rests on the same prose the design set out to stop trusting. Recorded as a known risk (FACT: `nfr-first-class-support.md` § Risks, "Prompt-only enforcement"). |
| **Waivers never lapse in practice.** | "An expired waiver lapses" (FACT: `neo-nfr-authoring/SKILL.md:162`), but nothing reads a waiver's revisit date after sign-off. `revisit` is free text — a date *or* a condition (`:152`). | A dated waiver silently outlives its expiry. |
| **IDs can be deleted or renumbered.** | "Never reuse or renumber an ID … never delete it" (FACT: `neo-nfr-authoring/SKILL.md` § 2). Nothing compares a register edit against its previous version. | A deleted standing record silently stops applying to every feature. |
| **Proof is hand-written.** | Every tagged criterion and verification case is authored per task. Stack plugins that would ship reusable checks are not built (FACT: `todo.md:31-32` — `neo-azure-platform` #67, `neo-ops` #68). | The same "no public network access" check is re-invented, slightly differently, on every task. |
| **Operations stage has no layer.** | `operations` is a stage (FACT: `neo-nfr-authoring/SKILL.md:62`), but none of the nine layer names (`:56`) means "production telemetry". | An operations-stage record cannot state its proving layer honestly. |
| **Operations stage has no producer.** | Operations-stage NFRs "ride" the Operations → Specification edge `[target]` (FACT: `process-flow.md:239`). The SRE / Platform Eng agents (#14) are not built (FACT: `todo.md:41`). | An SLO-shaped NFR is deferred to a stage nothing runs. |

## Principles

1. **The tool checks form; humans and agents still check substance.** A parser can prove a record has a `Measure:`
   and a known layer. It cannot prove the source was retrieved, the measure is the right one, or the waiver is wise.
   A green check is necessary, never sufficient — and every surface that reports it must say so.
2. **No new gate owner.** Every check lands on a gate that already exists in `process-flow.md` and keeps that gate's
   owner. A tool *informs* the owner; it does not replace the human.
3. **Advisory before blocking.** A check ships reporting first. Blocking is an opt-in per consuming repo.
4. **Core stays stack-agnostic.** `neo-core` knows an NFR has a category and a proving layer; it never names the tool
   that proves it. Stack plugins are found by description matching, as today (FACT:
   `stack-plugin-contract.md:167`).
5. **Grammar before tooling.** Freeze only formats that have survived a real run. The task handoff schema is still
   "provisional until the dry run confirms the emitter and consumer actually agree on it" (FACT:
   `task-handoff-schema.md:15-17`).

---

## Proposal

Phase 3 splits into four sub-phases with different dependencies. 3A and the contract halves of 3C and 3D can start
now; the rest waits on work outside this design.

| Sub-phase | Delivers | Depends on |
| --- | --- | --- |
| **3A — Grammar and file checks** | Tightened record grammar; a reference checker for repo files (register, PRDs); retire-don't-delete detection | The Phase 1–2 end-to-end dry run (plan § 8) |
| **3B — Issue-level checks (GitHub)** | Carrier `## Constraints` check; coverage-matrix check; waiver-expiry scan | 3A |
| **3C — Stack check templates** | The check-template contract and discovery rule (now); the first templates (with #67) | Contract: nothing. Templates: `neo-azure-platform` (#67) |
| **3D — Operations stage** | The `telemetry` layer, the instrumentation obligation, and the breach record (now); emitting breaches (later) | Contract: nothing. Emission: SRE / Platform Eng agents (#14), `neo-ops` (#68) |

### 3A — Grammar and file checks

#### Grammar changes to the record (owned by `neo-nfr-authoring`)

Small, mechanical tightenings so that admission's *form* becomes checkable. Each is a change to the duplicated skill
(edit one copy, `cp` to the other; the validator enforces it).

| Change | Today | Phase 3 |
| --- | --- | --- |
| Measure token | A quality attribute's Statement carries "a numeric response measure"; nothing marks where. | The Statement of a `quality-attribute` record **must** contain a `Measure:` clause with at least one number. |
| Violation token | A constraint's Statement says "how a violation is observed"; nothing marks where. | The Statement of a `constraint` record **must** contain a `Violation:` clause. |
| Revisit grammar | Free text: "an expiry date or a condition" (FACT: `SKILL.md:152`). | `revisit: YYYY-MM-DD` **or** `revisit: when <condition>`. Only the dated form is machine-checked; the condition form stays human-checked. |
| Operations layer | No layer for production telemetry (FACT: `SKILL.md:56`). | Add `telemetry`, valid only with stage `operations` (see 3D). |
| Layer–stage compatibility | Any layer with any stage. | A short compatibility table, e.g. `telemetry` only at `operations`; `load/performance` not at `task` without a stated reason. Violations warn; they do not fail. |

The existing worked example already uses `Measure:` and "Violation observed as" (FACT: `SKILL.md` § 10), so the
token rules codify current practice. "Violation observed as" becomes `Violation:`.

#### The reference checker — `neo-nfr-checker`

A new `neo-core` skill whose payload is a script, not prose:

- `plugins/neo-core/skills/neo-nfr-checker/SKILL.md` — what the checker proves and does **not** prove, how to adopt
  it, and the exit-code contract.
- `assets/check_nfr.py` — **standard-library Python 3 only**, no network access in file modes.
- `assets/neo-nfr.yml` — a GitHub Actions workflow template.
- `assets/fixtures/` — passing and failing record blocks, used by Neo's own CI.

It lives only in `neo-core` (always installed), not in `neo-product`, so it is not a duplicated skill.

**Modes and checks.**

| ID | Mode | Checks | Gate it informs |
| --- | --- | --- | --- |
| C1 | `files <paths>` | Every record block parses: keys present and in order; `ID` matches `NFR-<PREFIX>-<NNN>`; prefix matches `Category`; `Kind`, `Tier`, layer, and stage are from the fixed lists; `Owner` non-empty; `Measure:` / `Violation:` token by Kind. | Boundary 0 (PRD); the register |
| C2 | `files <paths>` | IDs are unique across every file given (register plus PRDs). `Tightens:` names an existing standing ID. | Boundary 0; the register |
| C3 | `files <paths>` | A PRD's NFR section is either record blocks or the literal `Standing only`, and has a `Standing NFRs:` line. | Boundary 0 |
| C4 | `diff --base <ref> <paths>` | No record present at `<ref>` is missing or renumbered at `HEAD`. Withdrawal is `Status: retired`, never deletion. | The register (owner's PR review) |

**Exit codes:** `0` clean, `1` at least one violation, `2` usage or parse error (an unparseable file is never reported
as clean). Output is one line per finding: `<path>:<line>: <check-id> <message>`.

**What it cannot prove — stated in its own output.** Every run ends with a fixed line: *"Form checked only. Source
retrieval, measure adequacy, and waiver judgment are not machine-checked."* (Principle 1.)

#### Adoption by a consuming repo

A plugin cannot ship a workflow, and a consuming repo's CI cannot reach a plugin's install directory (FACT:
`nfr-implementation-plan.md` § 2, decision 3). So the checker is **vendored into the consuming repo** by an ordinary
Neo task. The human files a task such as "Adopt the Neo NFR checker", and the Technical Engineer implements it with
the skill as its reference: copy `check_nfr.py` to a path the repo's `AGENTS.md` names, copy and adjust
`neo-nfr.yml`, and record the checker version. This goes through the normal loop and the human's approval, and no
agent writes CI on its own initiative.

This must be reconciled with "Neo ships capability, not scaffolding" (FACT: `stack-plugin-contract.md:80`). The
proposed reading: the checker is a *capability* the consumer opts into, not a template the consumer must fill in to
make Neo work. Neo runs without it exactly as it does today. See [Decision 1](#decisions-needed).

**Drift between the vendored copy and the plugin.** `check_nfr.py` prints its version on every run, and the skill
states the current version. An agent that loads the skill and sees an older version in the consuming repo reports
it; it does not upgrade the copy unasked.

#### Neo's own CI keeps the skill and the checker in step

`validate.yml` gains one step: run `check_nfr.py files` over `assets/fixtures/` (the passing ones must exit 0, the
failing ones must exit 1 with the expected check IDs) **and** over the record blocks in `neo-nfr-authoring/SKILL.md`
itself. The skill's worked example can then never drift from what the checker accepts. (Note that no workflow has run
on this repository yet — see the Phase 2 PR's verification section — so this needs GitHub Actions turned on before it
protects anything.)

### 3B — Issue-level checks (GitHub only)

The matrix, the carrier `## Constraints`, and the waivers live on GitHub issues, not in repo files. So their checks
run as workflows on issue events, in the consuming repo's vendored `neo-nfr.yml`.

| ID | Trigger | Checks | On failure (advisory) | On failure (strict, opt-in) |
| --- | --- | --- | --- | --- |
| C5 | `issues` — `opened`, `edited`, `labeled` (`be-approved`) | A task issue has a parseable `## Constraints` section: `None`, or one bullet per NFR with ID, disposition, statement, and source. Every `[NFR-ID]` tag in the criteria appears on the Constraints list. | Comment on the issue with the findings. | Also remove `be-approved`, so the task cannot cross Boundary 1. |
| C6 | `issue_comment` — `created` | A comment headed `## NFR coverage matrix` has one row per applicable NFR (every `active` standing ID in the register must have a row); every `mapped` task-stage row names a task issue whose criteria carry that `[NFR-ID]` tag; every later-stage row has a deferral. | Comment listing uncovered rows. | Also remove `be-approved` from the listed task issues. |
| C7 | `schedule` (weekly) | Every waiver with `revisit: YYYY-MM-DD` on an open feature issue is not past its date. | Comment on the feature issue: the waiver has lapsed and the NFR applies again. | Same — a lapse is never auto-reverted; the BE re-decides. |

FACT (GitHub docs, fetched): `issue_comment` (activity types `created`, `edited`, `deleted`) and `issues` (including
`labeled`) trigger workflows, and each "will only trigger a workflow run if the workflow file exists on the default
branch". `schedule` runs only on the default branch, "can be delayed during periods of high loads", and in a public
repository "scheduled workflows are automatically disabled when no repository activity has occurred in 60 days". So C5–C7 work
only once `neo-nfr.yml` is on the consuming repo's default branch, and C7 is a best-effort scan, not a guarantee.

**Untrusted input.** Issue bodies and comments are written by anyone who can comment. The workflow passes the event to
the checker as a file (`$GITHUB_EVENT_PATH`) and never interpolates `${{ github.event.issue.body }}` or any comment
text into a `run:` line. Permissions are least-privilege: `contents: read` always, `issues: write` only for the jobs
that comment or remove a label. (The GitHub docs index lists a "Script injections" page under Security; its content
was not read this session — INFERENCE: the interpolation rule above is the standard mitigation it describes; verify
when implementing.)

**Azure DevOps.** 3A's file checks run anywhere Python runs, including Azure Pipelines. 3B's issue checks have no ADO
equivalent in this design: work-item events would need ADO service hooks, which were not researched here
(`RECALL — UNVERIFIED`). ADO parity is out of scope until a consuming repo needs it.

### 3C — Stack check templates

A stack plugin turns a category of NFR into a reusable, runnable check. `neo-core` defines the *shape* of a check
template and how agents find one; stack plugins ship the templates.

#### The check template

A fixed-key block, in the same spirit as the NFR record, in a stack skill (in its `SKILL.md` or under
`assets/checks/`):

````markdown
### neo-azure-platform/storage-no-public-network — Data stores reject public traffic

```text
Check:         neo-azure-platform/storage-no-public-network
Proves:        security, privacy
Layer:         policy-as-code
Stages:        task, operations
Inputs:        <paths or resource scope the check runs over>
Prerequisites: <tool and version; environment>   — absent → Blocked
Command:       <runnable command block, recording its exit code>
Pass when:     exit 0 and <observable outcome>
Does not prove: <what a pass leaves unproven>
```
````

- **Check IDs** are `<plugin>/<check-name>`: namespaced by plugin, so two stacks cannot collide, and permanent — the
  same never-reuse rule as NFR IDs.
- **`Command`** follows the verification template's command-block rules: exit code recorded immediately, and a
  minimum selected-test count for filtered runs (FACT: `neo-verification-template/SKILL.md:47`, § Automated command
  block format).
- **`Does not prove`** is mandatory. A policy check over IaC proves the *declared* configuration, not the deployed
  one; that is what the `operations` stage is for.

*Illustrative only:* the example above shows the shape. Neo ships no such check; `neo-azure-platform` (#67) would.

#### Discovery — description matching, extended

`neo-core` agents cannot name stack skills (FACT: `stack-plugin-contract.md:167`). So the stack-skill description
format (`stack-plugin-contract.md` § Skill description format) gains a sixth rule:

> **6. Name the NFR coverage, if any** — a skill that ships check templates states the NFR categories and the proving
> layer it serves: "Proves security and privacy NFRs at the policy-as-code layer."

Category and layer come straight from the record, so an agent can match on them without knowing the plugin.

#### How core agents use a template

| Agent | Today | With a matching template |
| --- | --- | --- |
| Task Planner | Writes each `[NFR-ID]` criterion by hand. | Uses the template: `- [NFR-SEC-002] check neo-azure-platform/storage-no-public-network over the changed IaC exits 0`. The matrix's *Covered by* names the check ID (FACT: the column exists, `neo-nfr-authoring/SKILL.md:200`). |
| Code Reviewer | Checks the change against the NFR by reading it. | Also runs the template's command, read-only, when its prerequisites are present. |
| Verification Loop | Writes each NFR case by hand. | Builds the case from the template; an absent prerequisite is `Blocked`, per the template's own line. |

**No template matches → today's behavior.** The agent writes the check itself, as it does now. A missing stack plugin
never blocks the loop.

### 3D — Operations stage

#### What can land now

1. **A `telemetry` layer** (3A grammar change), valid only at stage `operations`: proof by production telemetry or
   production policy-compliance state over a stated window.
2. **The instrumentation obligation.** An operations-stage NFR is proved by telemetry, and telemetry that does not
   exist proves nothing. This mirrors the KPI rule: "if the telemetry does not exist yet, emitting it is in scope for
   the feature" (FACT: `process-flow.md:276-283`). So:
   - An operations-stage record gains an optional `SLI:` key (after `Owner`, per the optional-key rule): the metric or
     query that measures the Statement's `Measure:`, and where it is emitted.
   - If that telemetry does not exist, emitting it is a **task-stage** obligation of the feature: a tagged criterion
     such as `- [NFR-REL-003] the checkout service emits checkout_latency_ms with route and status labels; a test
     asserts the emission`.
   - The matrix row therefore has two parts: instrumentation *covered* at `task`, settlement *deferred* →
     `operations · telemetry`. A row whose telemetry is neither present nor tasked is **uncovered**.
3. **The breach record** — the input format on the Operations → Specification edge, defined now so #14 has a contract
   to emit against:

```text
NFR:           NFR-PERF-001
Observed:      p95 = 612 ms over 2026-11-01 → 2026-11-07 (objective: ≤ 400 ms)
Evidence:      <locator: dashboard, saved query, or policy-compliance report>
Detected-by:   <agent or monitor>
Routed-to:     <record Owner>, <BE>
```

   A breach is **feedback, not a block** (FACT: `process-flow.md:239-241`). It enters the Specification loop, where the
   Owner and the BE decide among three responses: a new task (mis-built), a re-specified or re-waived NFR
   (mis-specified), or a register change. This is the same mis-built / mis-specified triage Boundary 3 already uses.

#### What waits

Producing breach records needs something watching production: the SRE / Platform Eng agents (#14, not built; FACT:
`todo.md:41`) and `neo-ops` (#68). Phase 3 does not design those agents. It gives them a record to read (the NFR with
its `SLI:`), a layer name to prove at (`telemetry`), and a record to emit (the breach).

---

## Changes by file

### 3A — Grammar and file checks

| File | Change |
| --- | --- |
| `neo-nfr-authoring/SKILL.md` (both copies, byte-identical) | `Measure:` / `Violation:` tokens; revisit grammar; `telemetry` layer; layer–stage compatibility table; optional `SLI:` key (3D). |
| New skill `plugins/neo-core/skills/neo-nfr-checker/` | `SKILL.md`, `assets/check_nfr.py`, `assets/neo-nfr.yml`, `assets/fixtures/`. |
| `.github/workflows/validate.yml` | Run the checker over its fixtures and over `neo-nfr-authoring`'s record blocks. |
| `neo-verification-template/SKILL.md` | Add a `telemetry` row to the layer table. |
| `stack-plugin-contract.md` | Project tier: the vendored checker is an opt-in, project-tier copy. Reconcile with "capability, not scaffolding". What ships: one row. |
| `AGENTS.md`, `plugin-contract.md`, READMEs, glossary, owner tables | The inventory edits a new skill always needs: `neo-core` goes to 6 skills ("Installed 6 skills."). |

### 3B — Issue-level checks

| File | Change |
| --- | --- |
| `neo-nfr-checker` assets | `issue` and `waivers` modes; workflow jobs for C5–C7; advisory and strict modes. |
| `neo-nfr-authoring/SKILL.md` (both copies) | § 9: note which checks a vendored checker can run. |
| `process-flow.md` | One line on each affected gate: a vendored checker may report on it; the owner is unchanged. |
| `task-handoff-schema.md` | § 5: the `## Constraints` grammar is now machine-parsed — fixed bullet form. |

### 3C — Stack check templates

| File | Change |
| --- | --- |
| `stack-plugin-contract.md` | The check-template format; description rule 6; check-ID namespacing. |
| `neo-verification-template/SKILL.md` | Build an NFR case from a matching template; absent prerequisite → `Blocked`. |
| `neo.task-planner.agent.md`, `neo.code-reviewer.agent.md`, `neo.verification-loop.agent.md` | "If a skill offers a check template for this NFR's category and layer, use it; otherwise write the check." No stack skill is named. |
| `neo-azure-platform` (#67), `neo-ops` (#68) | The first templates. Out of this repo's Phase 3 scope; they implement the contract. |

### 3D — Operations stage

| File | Change |
| --- | --- |
| `neo-nfr-authoring/SKILL.md` (both copies) | The instrumentation obligation; the two-part matrix row; the breach record. |
| `neo-product-requirements/references/quality-attributes.md` | Step 6: an `operations`-stage NFR names its `SLI:` or flags the instrumentation as in scope. |
| `process-flow.md` | Operations → Specification edge: the breach record and the triage it enters. Still `[target]`. |

## Sequencing

1. **Run the Phase 1–2 dry run first** (plan § 8). Fold any format changes it forces into 3A's grammar changes, so
   the checker freezes a grammar that has survived contact.
2. **3A**, in one PR: grammar, checker, Neo CI self-test.
3. **3C contract and 3D contract** can land alongside or after 3A — docs and prompts only.
4. **3B** once 3A is adopted by at least one consuming repo, so the issue checks are tuned against real issues.
5. **3C templates and 3D emission** land with #67, #68, and #14.

## Risks

- **False confidence.** A green checker reads as "the NFRs are fine". Mitigation: Principle 1, the fixed closing line
  on every run, and the checker never reports on substance.
- **Grammar churn breaks records in the wild.** The token rules are not purely additive. Mitigation: warning-only for
  one minor release, then error ([Decision 3](#decisions-needed)).
- **Vendored drift.** A copied checker ages. Mitigation: a version on every run, the skill states the current version,
  and agents report — never auto-upgrade — a stale copy.
- **Enforcement friction.** Strict mode removing `be-approved` adds a machine to a human gate. Mitigation: advisory
  default ([Decision 2](#decisions-needed)); the human owner stays the gate owner.
- **Untrusted issue text.** Mitigation: event via file, no `${{ }}` interpolation, least-privilege permissions.
- **Template sprawl.** Many stacks shipping overlapping checks. Mitigation: namespaced check IDs; `Does not prove` is
  mandatory, so overlaps are visible.
- **GitHub-only enforcement.** 3B does not reach ADO. Accepted for now; the file checks (3A) do.

## Decisions needed

| # | Question | Recommended default |
| --- | --- | --- |
| 1 | Ship a reference checker as a skill asset, or specify the grammar only and let each consuming repo write its own? | **Ship it** in `neo-core` as `neo-nfr-checker`, adopted by a normal Neo task. Record in `stack-plugin-contract.md` that an opt-in tool is capability, not scaffolding. |
| 2 | Default enforcement for 3B: advisory (comment) or strict (remove `be-approved`)? | **Advisory by default**; strict is opt-in per repo, declared in its `AGENTS.md` and set as a workflow input. |
| 3 | Make the `Measure:` / `Violation:` tokens mandatory? | **Yes**, warning for one minor release, then error. |
| 4 | Adopt the revisit grammar (`YYYY-MM-DD` or `when <condition>`)? | **Yes**; only dated waivers are machine-checked. |
| 5 | Add a `telemetry` proving layer for the `operations` stage? | **Yes**. |
| 6 | ADO parity for the issue checks? | **Out of scope** until a consuming repo needs it. |

Still open from earlier phases, and **not** settled here: the Architect role pair (FACT:
`nfr-first-class-support.md` § Open questions, item 1), and cross-PRD NFRs (item 4, out of scope).

## Related

- [nfr-first-class-support.md](./nfr-first-class-support.md) — the accepted design for Phases 1–2; its § Phase 3
  names the items designed here.
- [nfr-implementation-plan.md](./nfr-implementation-plan.md) — § 8 (the dry run 3A waits on), § 10 (the Phase 3
  outline and the interfaces Phases 1–2 left for it).
- [process-flow.md](../../concepts/process-flow.md) — the gates every check reports to, and the KPI instrumentation
  rule 3D mirrors.
- [stack-plugin-contract.md](../reference/stack-plugin-contract.md) — late binding, the skill description format,
  and the project tier.
