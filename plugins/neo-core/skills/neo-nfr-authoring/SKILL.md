---
name: neo-nfr-authoring
description: Use when writing, reviewing, or checking coverage of a non-functional requirement (NFR) — a PRD's NFR section, a standing NFR register, a feature's Constraints field, a task's NFR-tagged validation criteria, a task-set coverage matrix, or an NFR waiver. Defines the NFR record, categories, tiers, the admission rule, the waiver rule, and the coverage-matrix format. Load whenever an artifact states, carries, waives, or proves an NFR.
---

# Authoring and carrying NFRs

An NFR survives only if every artifact that crosses a boundary carries it and every gate asks where it went. This skill owns the record, the tiers, the admission rule, the waiver rule, the carrier forms, the coverage matrix, and the coverage check at each artifact. Agents and docs link here; they do not restate it.

This skill is duplicated, byte-identical, into `neo-core` and `neo-product`. Edit one copy and copy it to the other in the same commit; CI fails on drift.

## 1. What an NFR is

An NFR is a constraint **on** delivery, not something delivered. "p95 checkout ≤ 400 ms" and "no data store accepts public traffic" constrain how a feature is built; neither is a feature.

**Enabler work is not an NFR.** "Move every data service behind private endpoints" or "reach SOC 2" is a deliverable with its own business justification. It is an ordinary PRD and needs nothing from this skill except the NFRs it, in turn, must respect.

## 2. The record

### Fields

| Key | Required | Meaning |
| --- | --- | --- |
| `ID` | ✅ | `NFR-<PREFIX>-<NNN>`, prefix from the category map below. Never reused. |
| `Kind` | ✅ | `quality-attribute` (measurable: latency, availability, throughput, recoverability) or `constraint` (a binary boundary: "no public endpoints", "data resident in region X"). |
| `Category` | ✅ | One of the ten categories below. The list is fixed so coverage can be counted. |
| `Statement` | ✅ | Quality attribute: a **quality-attribute scenario** — stimulus, environment, response, and a numeric **response measure**. Constraint: the boundary and how a violation is observed. |
| `Source` | ✅ | The regulation, ADR, SLA, customer standard, or policy assignment it comes from, with a locator. Discovered and cited, never invented (§ 3). |
| `Tier` | ✅ | `standing`, `prd`, or `feature` (§ 4). |
| `Proving layer` | ✅ | `<layer> · <stage>` — the lowest evidence layer that can prove it, and the stage that runs it. |
| `Owner` | ✅ | The human accountable for the NFR and for any waiver of it. |
| `Tightens` | optional | The standing ID this record makes stricter. |
| `Status` | optional | `active` (default) or `retired`. |

**IDs are permanent.** Never reuse or renumber an ID. To withdraw a record, set `Status: retired`; never delete it.

### Category → prefix

| Category | Prefix |
| --- | --- |
| performance | `PERF` |
| reliability | `REL` |
| security | `SEC` |
| privacy | `PRIV` |
| compliance | `COMP` |
| operability | `OPS` |
| maintainability | `MAINT` |
| compatibility | `COMPAT` |
| accessibility | `A11Y` |
| cost | `COST` |

### Proving layer · stage

**Layer** is one of these names, the layers of `neo-verification-template` (shipped in `neo-core`; definitions live there):

`unit/property` · `contract` · `integration` · `static-analysis` · `policy-as-code` · `load/performance` · `runtime-eval` · `formal` · `live-procedure`

**Stage** is one of:

- `task` — provable inside one PR, by a tagged validation criterion.
- `feature-verification` — provable only against the assembled feature, in the verification plan (load profiles, cross-task behavior, a real environment).
- `operations` — settled only in production, as SLO or policy telemetry.

Pick the lowest layer that genuinely proves the property, then the earliest stage that can run that layer. Do not pull an emergent NFR (availability, p95 under load, RTO/RPO) down to `task` to make it look covered.

### The record block

Every record — in the register, in a PRD, or excerpted anywhere else — uses this exact shape: a level-3 heading, then a `text` fence holding the keys **in this order**. Continuation lines are indented to the value column. Optional keys follow `Owner`.

````markdown
### NFR-<PREFIX>-<NNN> — <short title>

```text
ID:            NFR-<PREFIX>-<NNN>
Kind:          quality-attribute | constraint
Category:      <category>
Statement:     <scenario with response measure, or boundary + observed violation>
               <indented continuation line>
Source:        <document § section, with locator>
Tier:          standing | prd | feature
Proving layer: <layer> · <stage>
Owner:         <human>
Tightens:      <standing ID>         (optional)
Status:        active | retired       (optional)
```
````

Keep the keys and order fixed. The block is meant to parse line by line, so a later tool can compute coverage instead of an agent.

## 3. Admission rule

An NFR is **admissible** only if it has **all** of:

1. **A measure** — for a quality attribute, a full quality-attribute scenario with a numeric response measure; for a constraint, an observable violation.
2. **A cited source** — a `FACT` with a locator, per `neo-evidence-standard`. A source you did not retrieve this session is not a source.
3. **A proving layer and stage.**
4. **An Owner.**

Aspirations are rejected at authoring time: "secure", "scalable", "highly available", "performant", "robust" with no measure are not NFRs.

**An inadmissible NFR becomes an open question in its artifact** — the PRD's Open Questions, or the feature's flagged items — naming what is missing. It is never dropped silently and never promoted to a record by guessing the missing field.

Before / after:

- ✗ `The checkout must be fast and scalable.` (no scenario, no measure, no source)
- ✓ `Stimulus: shopper submits checkout. Environment: staging, 50 req/s sustained. Response: order confirmed. Measure: p95 ≤ 400 ms over a 10-minute run.` (with a source, layer, stage, and owner)

## 4. Tiers

| Tier | Home | Applies to | Who changes it |
| --- | --- | --- | --- |
| `standing` | The consuming repo's register | Every feature, by default, unless waived | The register owner |
| `prd` | The PRD's Non-Functional Requirements section | Every segment of that PRD the NFR is attached to | Product Engineer → BE at Boundary 0 |
| `feature` | The feature's `Constraints:` field | That feature and its tasks | BE, at feature sign-off |
| task | Validation criteria tagged with an NFR ID | That task | Task Planner + BE, at task-set approval |

The task tier holds no records — only tagged criteria and deferrals that point at records above it. `Tier:` therefore takes only `standing`, `prd`, or `feature`.

**Tighten, never loosen.** A lower tier may make a standing NFR stricter (record it with `Tightens:`). It may never make it weaker. Loosening is a waiver (§ 6), and a request to loosen in a PRD goes to Open Questions.

**The standing register lives in the consuming repo.** The suggested path is `docs/design/quality/nfr-register.md`, linked from that repo's `AGENTS.md`. Its header names the **register owner**. Read the path from `AGENTS.md`; if `AGENTS.md` names no register, record "Standing NFRs: none" — do not guess a path.

- **Agents propose register entries; they never write them.** A candidate standing NFR goes to the register owner as a record block labeled `FACT` with its locator.
- **Neo ships no NFR content.** This skill ships the format and the gates; every NFR comes from the consuming project.

## 5. Dispositions

For a feature, the **applicable set** is:

- every `active` standing NFR in the register, plus
- every PRD-tier NFR attached to the feature's segment, plus
- every feature-tier NFR the feature declares.

Each applicable NFR gets exactly one disposition:

- `mapped` — it binds this feature and will be proved at its proving layer and stage.
- `waived` — a complete, signed waiver (§ 6) is recorded.
- `n/a — <reason>` — it cannot apply to this feature, with a reason a reviewer can check ("no data store touched").

An applicable NFR with no disposition makes the feature unsignable. `n/a` with no reason is not a disposition.

## 6. Waiver rule

A waiver is a recorded decision on the feature. It has **every** one of these fields:

| Field | Meaning |
| --- | --- |
| ID | The NFR being waived |
| rationale | Why it cannot be met here |
| residual risk | What can go wrong because it is waived |
| owner | The human who carries that risk |
| revisit | An expiry date or a condition that ends the waiver |
| signed-by | Who signed it |

**Who signs:**

- A **PRD-** or **feature-tier** waiver is signed by the BE.
- A **standing** waiver is signed by the BE **and** the record's Owner (the register owner).

**If any field is missing, it is not a waiver** — the NFR still applies, and its disposition is `mapped`.

**Agents draft waivers and never sign them.** An agent never records a signature it did not receive from that human, and never presumes one. **An expired waiver lapses**: once its revisit date passes or its condition is met, the NFR applies again.

## 7. Carrier forms

**Feature — a `Constraints:` block,** one line per applicable NFR:

```text
Constraints:
  - NFR-SEC-002   mapped (standing)
  - NFR-PERF-001  mapped
  - NFR-A11Y-001  n/a — no user-facing surface; backend batch job only
  - NFR-OPS-001   waived — rationale: <…>; risk: <…>; owner: <…>; revisit: <…>; signed-by: <BE>, <register owner>
```

**Task — a `Constraints:` line,** the parent feature's mapped NFRs this task touches, each proved here or deferred:

```text
Constraints: NFR-SEC-002, NFR-PERF-001 (deferred → feature-verification · load/performance)
```

Write `Constraints: None` when the task touches no mapped NFR.

**Tagged criterion** — a validation criterion that proves an NFR is prefixed with its ID:

```text
- [NFR-SEC-002] <machine-checkable statement>
```

**Deferral** — an NFR whose stage is later than `task`:

```text
NFR-PERF-001 (deferred → feature-verification · load/performance)
```

## 8. Coverage matrix

Emitted with every proposed task set, one row per applicable NFR:

| NFR | Tier | Disposition | Proving stage · layer | Covered by / Deferred to |
| --- | --- | --- | --- | --- |
| NFR-SEC-002 | standing | mapped | task · policy-as-code | #T2 criterion 2 |
| NFR-PERF-001 | prd | mapped | feature-verification · load/performance | deferred → feature-verification · load/performance |
| NFR-OPS-001 | standing | waived | — | — |

Rules:

- Every applicable NFR has **exactly one** row.
- A `mapped` row with stage `task` needs at least one tagged criterion, named in the last column.
- A `mapped` row with a later stage needs a deferral, named in the last column.
- `waived` and `n/a` rows carry `—` in the last two columns.
- A `mapped` row with neither a tagged criterion nor a deferral is **uncovered**. A task set with an uncovered row cannot be approved.

## 9. Coverage checks by artifact

This skill defines each check. Where each check sits, who owns the gate, and where a failure routes is owned by Neo's process flow (`docs/concepts/process-flow.md` in the Neo repository).

| Artifact | Check passes when |
| --- | --- |
| **PRD** | The NFR section lists records, or states `Standing only`. Every record is admissible (§ 3). |
| **Segmentation** | Every PRD NFR is attached to at least one segment, or is `n/a` with a reason. No segment exists only to hold an NFR. |
| **Feature** | Every applicable NFR (§ 5) has a disposition. Every waiver is complete and signed by the right people (§ 6). |
| **Task set** | The coverage matrix (§ 8) has no uncovered row. |
| **Carrier issue** | `## Constraints` is present (it may say `None`). |
| **Review** | No `mapped` task-stage NFR on the carrier is violated by the change. A deferred NFR is a finding only if the change makes it **unprovable** at its later stage. |
| **Verification plan** | Every in-stage NFR has at least one case at or above its proving layer. A missing environment means `Blocked` plus residual risk owned by the record's Owner — never `Pass`. |
| **Feature verified** | Every `feature-verification` deferral has a recorded result. |

## 10. Worked example

Standing register entry, in the consuming repo:

### NFR-SEC-002 — Data stores are network-isolated

```text
ID:            NFR-SEC-002
Kind:          constraint
Category:      security
Statement:     No data store accepts traffic from a public network. Violation observed as
               publicNetworkAccess != Disabled on any storage, database, or cache resource.
Source:        docs/adr/0007-network-isolation.md § Decision
Tier:          standing
Proving layer: policy-as-code · task
Owner:         <platform lead>
```

PRD-tier record, in the checkout PRD:

### NFR-PERF-001 — Checkout latency under load

```text
ID:            NFR-PERF-001
Kind:          quality-attribute
Category:      performance
Statement:     Stimulus: shopper submits checkout. Environment: staging, 50 req/s sustained.
               Response: order confirmed. Measure: p95 ≤ 400 ms over a 10-minute run.
Source:        PRD § Success metrics; SLA schedule B
Tier:          prd
Proving layer: load/performance · feature-verification
Owner:         <BE>
```

Feature:

```text
Title:       Complete checkout with a saved card
...
Constraints:
  - NFR-SEC-002   mapped (standing)
  - NFR-PERF-001  mapped
  - NFR-OPS-001   waived — rationale: legacy payment adapter emits no traces; risk: blind spot in
                  checkout incidents; owner: <platform lead>; revisit: adapter replacement;
                  signed-by: <BE>, <platform lead>
```

`NFR-OPS-001` is standing, so its waiver carries both signatures.

Task, under that feature:

```text
Title:       Add order persistence for saved-card checkout
Parent feature: #812
What:        ...
Constraints: NFR-SEC-002, NFR-PERF-001 (deferred → feature-verification · load/performance)
Validation criteria:
  - POST /api/checkout with a saved card returns 201 and creates an Order row with status=paid.
  - [NFR-SEC-002] Policy check over the changed IaC reports zero resources with public network
    access enabled; exit code 0.
```

Coverage matrix for the task set: the table in § 8. The verification plan then carries an `NFR-PERF-001` case at the `load/performance` layer. If no staging environment can sustain 50 req/s, that case is `Blocked`, the residual risk is owned by the record's Owner, and the gate says so instead of passing on a unit test.

## 11. Anti-patterns

- **Checklist theater** — pasting "secure, performant, scalable" as NFRs. The admission rule rejects them.
- **Fake per-task proof** — a unit test that "proves" an emergent NFR on a laptop. Defer it to the stage that can prove it.
- **An agent writing the register** — agents propose; the register owner writes.
- **A waiver with no owner** — not a waiver; the NFR still applies.
- **A deferral marked `Pass`** — a deferred NFR has no result until its stage runs it. A missing environment is `Blocked`, never `Pass`.
