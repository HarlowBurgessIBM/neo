# First-Class NFRs — a design proposal

Why this document exists: Neo has no concept of a **non-functional requirement (NFR)**. A PRD can
state a latency budget or a regulatory boundary, but nothing below the PRD has a place to carry
it, so it survives only if an agent happens to pass it along. This document proposes how NFRs
become first-class without adding a loop, a PRD type, or a second artifact hierarchy.

**Status: accepted — Phase 1 landed in
[HarlowBurgessIBM/neo#3](https://github.com/HarlowBurgessIBM/neo/pull/3), Phase 2 in
[HarlowBurgessIBM/neo#4](https://github.com/HarlowBurgessIBM/neo/pull/4).** Phase 3 is designed separately in
[nfr-phase-3-executable-checks.md](./nfr-phase-3-executable-checks.md) (proposal). This is still a *design* doc — the
*why* and the shape. It is not the contract: the rules now live in their owning docs and skills
(the `neo-nfr-authoring` skill, `process-flow.md`, the task handoff schema, and the files in
[§ Changes by file](#changes-by-file)), and where this doc and an owner disagree, the owner
wins. Baseline for the analysis below: `main` after
verification-loop shipped and the docs were trued up (PR #1). The implementation sequence is in
[nfr-implementation-plan.md](./nfr-implementation-plan.md).

Terms in **bold** are defined in the [glossary](../../glossary.md). The boundaries and gates are
owned by [process-flow.md](../../concepts/process-flow.md); this doc links to them rather than
restating them.

---

## The problem — where NFRs leak today

Every claim below was checked against the tree at the baseline commit.

| Stage | What exists | What happens to an NFR |
| --- | --- | --- |
| PRD | A "Technical Considerations" bullet list — Architecture, Integrations, Data, Performance, Security/Compliance (`plugins/neo-product/skills/neo-product-requirements/assets/prd-template.md`). A constraints table with *Type* and *Source* (`references/scope-definition.md` § 3). The Product Coach probes compliance, abuse/failure exposure, and service-level constraints (`neo.product.coach.agent.md`). | Captured as prose, unnumbered, untestable as written. |
| Segmentation | The BE segments the PRD; each segment must carry its own business justification ([Boundary 0](../../concepts/process-flow.md#boundary-0--product--specification)). The Feature Agent gets "the segment text and any context it needs" (`neo.business-engineer.agent.md`, step 2). | **First leak.** A cross-cutting NFR belongs to no segment, so it is passed on only at the agent's discretion. |
| Feature | Fields: Title, What, Why, KPIs (optional), Verification steps (`neo-feature-authoring`). | **No field.** |
| Task | Fields: Title, Parent feature, What, Validation criteria, Depends on ([task-handoff-schema § 2](../reference/task-handoff-schema.md#2-fields)). | **No field.** Survives only if someone happens to phrase it as a validation criterion. |
| Code review | Judges against the consuming repo's `AGENTS.md`: conventions, safety, scope, build/lint/test (`neo.code-reviewer.agent.md`). | Checked only if it is a coding convention. Latency, availability, network posture: not checked. |
| Verification | `neo-verification-template` has the right evidence layers — policy-as-code, integration tests against real dependencies, live procedures. | Proves only the criteria handed to it. An NFR dropped upstream is never proved. |

A whole-word search for `NFR` / `non-functional` returns no shipped content under `plugins/` (the
only hits are pointers to this doc). The defect is not
a missing *box* — Neo already has the artifacts and the gates. It is **missing traceability**: no
identity for an NFR, and no gate that asks "where did it go?" That is exactly the failure mode the
[framework gap analysis](./framework-gap-analysis.md) names in principle 1: leaks live in soft
handoffs.

## What "first-class" should and should not mean

**It should mean:** an NFR has an identity, a measure, and a source; it rides inside the artifacts
that already cross every boundary; and each gate checks coverage of it.

**It should not mean:**

- **A separate NFR PRD.** It would fail Neo's own Boundary 0 gate: an NFR has no business
  justification of its own, because it is a constraint *on* delivery, not something delivered.
  The exception is **enabler work** that is a deliverable in its own right ("move every data
  service behind private endpoints", "reach SOC 2") — that is an ordinary PRD and needs nothing new.
- **A new loop or a third fit.** NFR proof splits cleanly across what exists: pre-production proof
  is part of **verification** (problem–solution fit; blocking), and SLO-shaped NFRs settled in
  production ride the Operations → Specification feedback edge alongside KPI settlement (value
  fit; non-blocking). See [process-flow.md § The two fits](../../concepts/process-flow.md#the-two-fits).
  No third mechanism is needed, so none should be invented.
- **Every NFR as a per-task validation criterion.** Many NFRs are emergent and system-level —
  availability, p95 under load, RTO/RPO. They cannot be proved inside one PR. Forcing them there
  produces fake tests that pass on a laptop. The design must say honestly *which layer* proves
  each one.

---

## Proposal

### 1. The NFR record

One record type, owned by a new skill (`neo-nfr-authoring`, see [§ Changes by file](#changes-by-file)).

| Field | Required | Meaning |
| --- | --- | --- |
| **ID** | ✅ | Stable, category-prefixed: `NFR-PERF-001`, `NFR-SEC-004`. Never reused. |
| **Kind** | ✅ | `quality-attribute` (measurable: latency, availability, throughput, recoverability) or `constraint` (binary boundary: "no public endpoints", "data resident in region X", "auth via the existing IdP"). |
| **Category** | ✅ | A fixed list — performance, reliability, security, privacy, compliance, operability, maintainability, compatibility, accessibility, cost. Fixed so coverage can be counted. Each category has a fixed ID prefix (below). |
| **Statement** | ✅ | For a quality attribute: a **quality-attribute scenario** — stimulus, environment, response, and **response measure**. For a constraint: the boundary and how a violation is observed. |
| **Source** | ✅ | The regulation, ADR, SLA, customer standard, or policy assignment it comes from. Discovered and cited, never invented — the same rule the PRD constraints table already applies. |
| **Tier** | ✅ | `standing`, `prd`, `feature` — see § 2. |
| **Proving layer** | ✅ | The lowest evidence layer that can prove it, from the `neo-verification-template` layer table, and the stage that runs it: `task`, `feature-verification`, or `operations`. |
| **Owner** | ✅ | The human accountable for the NFR and for any waiver of it. |

Category → ID prefix:

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

**Admission rule.** An NFR is admissible only if it has a measure (or, for a constraint, an
observable violation) and a proving layer. This is the same move as the
[KPI falsifiability gate](../../concepts/process-flow.md#falsifiability-is-a-gate-on-kpi-authoring):
"secure", "scalable", and "highly available" are aspirations, not NFRs, and are rejected at
authoring time rather than discovered unprovable at verification.

### 2. Tiers — where an NFR lives

| Tier | Home | Applies to | Who changes it |
| --- | --- | --- | --- |
| **Standing** | A register in the **consuming repo** — proposed `docs/design/quality/nfr-register.md` — linked from that repo's `AGENTS.md` | Every feature, by default, unless waived | The register owner (project tier) |
| **PRD** | The PRD's new Non-Functional Requirements section (takes over the Performance and Security/Compliance bullets of "Technical Considerations"; the Architecture, Integrations, and Data bullets stay as context) | Every segment of that PRD the NFR touches | Product Engineer → BE at Boundary 0 |
| **Feature** | The feature's new `Constraints:` field | That feature and its tasks | BE, at feature sign-off |
| **Task** | Validation criteria tagged with an NFR ID | That task | Task Planner + BE, at task-set approval |

Standing NFRs are the project tier's obligation, consistent with
[stack-plugin-contract.md](../reference/stack-plugin-contract.md): `neo-core` ships the *format*
and the *gates*; the consuming repo owns the *content*. Neo never ships anyone's NFRs.

A PRD- or feature-tier NFR may **tighten** a standing one (a stricter latency budget for one
flow) but may not **loosen** it — loosening is a waiver (§ 3).

### 3. Waivers

A standing NFR applies unless explicitly waived. A waiver is a recorded decision on the feature:
the NFR ID, the rationale, the residual risk, the owner, and an expiry or revisit condition. A
waiver without a rationale and an owner is not a waiver, and the NFR still applies. Who may *sign*
a waiver is settled in [§ Open questions](#open-questions), item 1: the BE signs PRD- and
feature-tier waivers; a standing waiver also needs the record's Owner (the register owner).

### 4. Gates — coverage at every boundary

Each existing gate gains one coverage check. No new gate owner is introduced.

| Gate | Owner | Added check | On failure |
| --- | --- | --- | --- |
| [Boundary 0](../../concepts/process-flow.md#boundary-0--product--specification) — PRD accepted | BE | The PRD lists its NFRs as records, or states "standing only". Every listed NFR passes the admission rule. | Back to the Product loop (the lens that produced the weak section). |
| Segmentation (inside the Specification loop) | BE (Neo BE drafts) | Every PRD NFR is attached to each segment it touches. An NFR attached to no segment is surfaced to the human, not dropped. A cross-cutting NFR is never a segment of its own. | Re-segment, or record the NFR as not applicable with a reason. |
| Feature sign-off | BE | Every applicable NFR — standing plus PRD — is **mapped**, **waived**, or **N/A with reason**. | Feature is not ready-to-work; the Task Planner refuses it, as it refuses an unsigned feature today. |
| Task-set approval ([Boundary 1](../../concepts/process-flow.md#boundary-1--specification--coding)) | BE | An **NFR × task coverage matrix**: each mapped NFR whose proving stage is `task` is covered by at least one tagged validation criterion; each NFR with a later proving stage is listed as **deferred to** that stage and layer. | Task set is not approved. |
| Code review | Neo Code Reviewer, then human | The reviewer checks the change against the NFRs listed on the task's carrier issue, in addition to `AGENTS.md`. | Changes requested. |
| Verification | Neo Verification Loop, then human | Every NFR on the spec traces to at least one case. An NFR whose environment does not exist is `Blocked` and listed as residual risk with its owner — never `Pass`. | Gate stays closed. |
| [Boundary 3](../../concepts/process-flow.md#boundary-3--verification--deployment) — feature verified `[target]` | BE | Every NFR deferred to `feature-verification` has a recorded result. | Feature does not deploy. |
| Operations `[target]` | Platform Eng Agent `[target]` | NFRs with proving stage `operations` become SLO / policy telemetry; a breach is an input on the Operations → Specification edge. | Feedback, not a block. |

The coverage matrix is the load-bearing artifact. It is what makes "where did the NFR go?"
answerable at the one gate a human already approves as a whole set.

### 5. Who authors NFRs

- **Product loop.** The Product Coach and Systems Thinking lenses already probe compliance,
  service levels, failure exposure, and constraints. A new quality-attribute elicitation reference
  in `neo-product-requirements` turns those answers into NFR records instead of prose. Technical
  and regulatory rows of today's constraints table become NFR records; timeline and budget rows
  stay in the scope definition, because they constrain the *project*, not the *system*.
- **Brownfield.** The Product Researcher harvests standing NFRs from what already exists — ADRs,
  IaC, and policy assignments are NFRs that are already enforced. They are cited with their
  source, per `neo-evidence-standard`, and proposed to the register owner; they are not written
  into the register by an agent.
- **Stack plugins.** This is where NFRs become executable. A stack plugin (for example the planned
  `neo-azure-platform`) ships check templates mapped to NFR categories — policy-as-code rules,
  private-endpoint assertions, a load-test harness. `neo-core` stays stack-agnostic: it knows an
  NFR has a proving layer, not which tool proves it.

### 6. Worked example

Standing register entry in the consuming repo, in the fixed-key block format (open question 2):

### NFR-SEC-002 — Data stores are network-isolated

```text
ID:            NFR-SEC-002
Kind:          constraint
Category:      security
Statement:     No data store accepts traffic from a public network. Violation observed as
               publicNetworkAccess != Disabled on any storage, database, or cache resource.
Source:        ADR-0007 Network isolation
Tier:          standing
Proving layer: policy-as-code · task
Owner:         <platform lead>
```

PRD-tier NFR in the checkout PRD:

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

```
Title:       Complete checkout with a saved card
...
Constraints:
  - NFR-SEC-002   mapped (standing)
  - NFR-PERF-001  mapped
  - NFR-OPS-001   waived — legacy payment adapter emits no traces; risk: blind spot in
                  checkout incidents; owner: <platform lead>; revisit: adapter replacement
```

Task, under that feature:

```
Title:       Add order persistence for saved-card checkout
Parent feature: #812
What:        ...
Constraints: NFR-SEC-002, NFR-PERF-001 (deferred → feature-verification · load/performance)
Validation criteria:
  - POST /api/checkout with a saved card returns 201 and creates an Order row with status=paid.
  - [NFR-SEC-002] Policy check over the changed IaC reports zero resources with public network
    access enabled; exit code 0.
```

The verification plan then carries a `NFR-PERF-001` case at the `load/performance` layer. If no staging environment
can sustain 50 req/s, the case is `Blocked` and the gap is residual risk with an owner — the
merge recommendation says so instead of passing on a unit test.

---

## Changes by file

Grouped by phase. Each rule lands **once**, in its owning file; everything else links to it.

### Phase 1 — traceability (closes the silent-loss gap)

| File | Change |
| --- | --- |
| New skill `neo-nfr-authoring` in **both** plugins | Owns the record format, tiers, admission rule, waiver rule, and coverage-matrix format. Duplicated into `neo-product` and `neo-core` like `neo-evidence-standard`, because plugins cannot share files — the Product loop authors NFRs and the Specification loop consumes them. |
| `neo-product-requirements` — `assets/prd-template.md`, `references/scope-definition.md`, new `references/quality-attributes.md` | A new NFR section takes over the Performance and Security/Compliance bullets of "Technical Considerations" (Architecture, Integrations, and Data stay); technical/regulatory constraints become NFR records; a quality-attribute elicitation procedure. |
| `neo-feature-authoring` | `Constraints:` field; mapped / waived / N/A rule at sign-off. |
| `neo-task-authoring` | NFR-tagged validation criteria; "deferred to stage · layer" form. |
| `task-handoff-schema.md` | A `Constraints` carrier field (NFR IDs, mapped or deferred) on the GitHub Issue and ADO story formats. |
| `neo.business-engineer.agent.md` | Load `neo-nfr-authoring`; attach PRD NFRs to every segment; carry them into the Feature Agent prompt, the carrier issue, and the child-session kickoff prompt. |
| `neo.feature-agent.agent.md` | Load `neo-nfr-authoring`; draft a disposition for every applicable NFR; draft (never sign) waivers. Its procedure lists the fields it drafts, so it must change with the field. |
| `neo.task-planner.agent.md` | Load `neo-nfr-authoring`; refuse a feature without dispositions; carry constraints onto tasks as tagged criteria or deferrals. |
| `neo.product.coach.agent.md` | Load `neo-nfr-authoring` when drafting the PRD's NFR section. |
| `neo.product.engineer.agent.md` | Phase 5 gate: the PRD states its NFRs as admissible records, or "Standing only". |
| `scripts/validate-plugins.py` | Fail CI when a skill duplicated across plugins drifts — `neo-nfr-authoring` and `neo-evidence-standard` must stay byte-identical. |
| `glossary.md` | Define **NFR**, **NFR register**, **waiver**, **coverage matrix**. |
| `stack-plugin-contract.md` | The standing register is a project-tier artifact, alongside `AGENTS.md`. |

### Phase 2 — gates

| File | Change |
| --- | --- |
| `process-flow.md` | The coverage checks in [§ 4](#4-gates--coverage-at-every-boundary), each on its owning boundary. |
| `neo.task-planner.agent.md` | Emit the coverage matrix with the proposed task set. |
| `neo.business-engineer.agent.md` | Present the matrix with the task set; persist it on the feature issue. |
| `neo.technical-engineer.agent.md` | Read the carrier issue's Constraints and forward them to the writer and reviewer — the reviewer reviews only what the TE assigns it, so without this the review check cannot fire. |
| `neo.code-reviewer.agent.md` | Check against the task's NFRs as well as `AGENTS.md`. |
| `neo-verification-template` | NFR → case traceability; `Blocked` handling for missing environments; a new `load/performance` layer row (the layer table has none today). |
| `neo.verification-loop.agent.md` | Read the target's Constraints (or the feature's matrix) as well as its validation criteria. |
| `neo.product.researcher.agent.md` | Harvest candidate standing NFRs from ADRs, IaC, and policy in brownfield runs. |
| `neo.product.engineer.agent.md` | Phase 0: ask the researcher which standing NFRs already bind the area — a researcher answers only the question it is asked. |

### Phase 3 — executable checks

Designed in [nfr-phase-3-executable-checks.md](./nfr-phase-3-executable-checks.md).

| Where | Change |
| --- | --- |
| Stack plugins (`neo-azure-platform` #67, `neo-ops` #68) | Check templates per NFR category. |
| Operations loop `[target]` (#14) | SLO-shaped NFRs as telemetry on the Operations → Specification edge. |

Phases 1 and 2 need nothing that is not already in the tree. Phase 3 waits on the stack plugins
and the Operations loop.

---

## Risks

- **Gate fatigue.** Neo's own system model flags the BE gate as a saturation risk
  ([stocks and flows § 5](../../design/system-models/neo-agentic-sdlc-stocks-flows.md#5-stock-interactions--where-loops-will-form)). Mitigation:
  standing NFRs apply by default, so the BE reviews only *additions and waivers*, never re-approves
  the register per feature. The coverage matrix is reviewed as part of the task set the BE already
  approves as a whole.
- **Checklist theater.** Teams paste "secure, performant, scalable". Mitigation: the admission
  rule rejects any NFR without a measure and a proving layer.
- **Fake per-task proof.** Mitigation: the proving-layer field and explicit deferral make "this
  cannot be proved here" a legitimate, visible answer instead of an invented unit test.
- **Register drift.** A standing register nobody maintains becomes a fiction agents still obey.
  Mitigation: every record has an owner and a source; a waiver carries a revisit condition.
- **Prompt-only enforcement.** Like every Neo gate today, the coverage check is enforced by agent
  prose and human approval, not by a tool. This is an accepted, known risk for Phases 1–2 (open
  question 3); the formats are fixed so a tool check stays possible in Phase 3.

---

## Open questions

1. **Who signs a waiver of a standing NFR? — Resolved.** The human BE signs PRD- and feature-tier
   waivers. Waiving a **standing** NFR also needs the record's Owner — the register owner. No
   Architect role is added.
   - **Still open:** whether standing NFRs warrant an **Architect** role pair (human + Neo agent).
     Neo's human roles are Product Engineer, Business Engineer, and Technical Engineer (glossary
     § Roles); there is no architect seat. This doc does not settle it.
2. **Register format. — Resolved.** Each record is a fixed-key Markdown block: a
   `### NFR-<PREFIX>-<NNN> — <title>` heading, then a ```` ```text ```` fence holding the keys in a
   fixed order (ID, Kind, Category, Statement, Source, Tier, Proving layer, Owner), with indented
   continuation lines allowed. The same block is used in the register, the PRD, and record
   excerpts, and it parses line by line, so Phase 3 can script it.
3. **Should coverage be machine-checked? — Resolved: not in Phases 1–2.** Coverage is enforced by
   agent prompts and BE approval. The formats are fixed now so a check stays possible; a CI check
   or template moves to Phase 3. Recorded as a known risk (§ Risks). A plugin cannot ship a
   workflow, and a consuming repo's CI cannot reach a plugin's install directory, so any such
   check would be a template the consuming repo adopts.
4. **Cross-PRD NFRs. — Out of scope.** Neo consumes one PRD at a time and nothing reads across
   PRDs. Standing NFRs solve the shared case; NFRs that emerge from the *combination* of PRDs
   (aggregate load, a shared data store) have no home. This is part of the broader multi-PRD gap,
   not something this proposal closes.

---

## Related

- [process-flow.md](../../concepts/process-flow.md) — owns the boundaries, the two fits, and the KPI
  falsifiability gate this proposal mirrors.
- [framework-gap-analysis.md](./framework-gap-analysis.md) — principle 1 (leaks live in soft
  handoffs) is the defect this proposal addresses.
- [task-handoff-schema.md](../reference/task-handoff-schema.md) — the carrier the `Constraints` field
  would extend.
- [stack-plugin-contract.md](../reference/stack-plugin-contract.md) — the project tier that would own
  the standing register.
