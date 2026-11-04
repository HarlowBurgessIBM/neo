<!--
  Implementation plan for nfr-first-class-support.md. Not a contract.
  Every file:line locator below is pinned to commit da2542b on docs/nfr-first-class-support.
  Re-verify locators against the tree before editing if anything has landed since.
-->

# Plan — First-class NFR support (Phases 1–2 in full, Phase 3 outline)

## Context

`docs/contributing/design/nfr-first-class-support.md` (branch `docs/nfr-first-class-support`, tip `da2542b`)
proposes making NFRs first-class. Today nothing below the PRD can carry one. This plan turns the proposal
into commits. Each rule lands once, in its owning doc or skill. Copilot is the only harness. Plugins stay
self-contained. Nothing is built, so the checks are the validator, manifest parsing, links, and a live
install.

All three open questions were put to the user, and the recommended default was chosen for each (§2).

---

## 1. Verified current state

### Leak table — confirmed, with locators

| Stage | Locator | Verdict |
| --- | --- | --- |
| PRD | `prd-template.md:115-121` ("Technical Considerations" bullets); `scope-definition.md:39-48` (constraints table, Type/Source), `:76` (constraints are discovered and cited); `neo.product.coach.agent.md:76-87` (compliance, abuse/failure, service-level probes) | Confirmed |
| Segmentation | `neo.business-engineer.agent.md:95-97` (justification per segment), `:102-103` ("the segment text and any context it needs") | Confirmed |
| Feature | `neo-feature-authoring/SKILL.md:12-16` (fields), `:43-53` (template); no constraints field | Confirmed |
| Task | `task-handoff-schema.md:54-62` (fields incl. Depends on); `neo-task-authoring/SKILL.md:12-15` | Confirmed |
| Code review | `neo.code-reviewer.agent.md:16,26` (judges against `AGENTS.md` only) | Confirmed |
| Verification | `neo-verification-template/SKILL.md:27-38` (layers), `:43` (traces only the criteria handed to it) | Confirmed |

### Design premises that are wrong or stale. Fix them in U0 and plan against the fixed versions.

1. **Baseline SHA.** `0a835d0` does not resolve in this clone. FACT: it is the head SHA of
   [HarlowBurgessIBM/neo#1](https://github.com/HarlowBurgessIBM/neo/pull/1), which has since merged as `2131b19`. The content
   claims still hold. Change the baseline to `2131b19`.
2. **"`NFR` returns no hits anywhere."** It now hits in `todo.md:76-77`, `docs/README.md:40`, and
   `docs/contributing/README.md:53-54,65`, all of them pointers to the design doc. There are still zero hits
   under `plugins/`. Reword the claim to "no shipped content".
3. **`NFR-OBS-001` in the worked example (design:179).** "Observability" is not in the fixed category list
   (design:71). Add a category→prefix map and rename the record to `NFR-OPS-001` (operability).
4. **"load test" is not a layer.** The design says the proving layer comes from the verification
   layer table (design:75), but the example uses `load test` (design:167,189). The table at
   `neo-verification-template/SKILL.md:27-36` has no load or performance row. Add one in U11.
5. **Missing `neo.technical-engineer`.** The reviewer reviews only what the TE assigns it
   (`neo.technical-engineer.agent.md:118`, `neo.code-reviewer.agent.md:17`). Unless the TE forwards the
   carrier issue's constraints, the reviewer check (design:117) cannot fire. Add the TE to U10.
6. **Other agents the design omits.** `neo.feature-agent` must change, because its procedure lists the fields it
   drafts (`:19-25`). `neo.product.coach` must change, because it drafts the PRD. `neo.product.engineer` must
   change, because a researcher answers only the question it is asked (`neo.product.researcher.agent.md:25-28`)
   and the PE writes those questions (`neo.product.engineer.agent.md:95-96`). `neo.verification-loop` must
   change, because it reads only validation criteria (`:63`).
7. **"The NFR table replaces Technical Considerations" is too broad.** The Architecture, Integrations,
   and Data bullets (`prd-template.md:117-119`) are context, not NFRs. Keep them. Move only Performance and
   Security/Compliance (`:120-121`) into the new NFR section.
8. **`process-flow.md` has no Segmentation, Feature sign-off, or Verification-plan gate section.** Its
   gates are Boundary 0 (`:42-52`), Boundary 1 (`:67-77`), Boundary 2 (`:108-118`, `[target]`), and
   Boundary 3 (`:153-159`, `[target]`). Each check goes on the nearest owning boundary (U8). The check in the
   verification plan is owned by `neo-verification-template`.
9. **Skills cannot link to docs at runtime.** `docs/` does not ship (`docs/README.md:56`). So the
   *content* of each check lives in the skill, and `process-flow.md` owns only *where* each check
   sits, who owns the gate, and where a failure routes. It links to the skill for the check itself.
   This follows the precedent of `neo-feature-authoring:37-39`, which owns its own sign-off rule.
10. **The duplicated skill must be self-contained.** `neo-product` does not ship
    `neo-verification-template`, so `neo-nfr-authoring` lists the layer *names* inline. The layer
    definitions stay with the verification template.

---

## 2. Decisions

| # | Question | Decision |
| --- | --- | --- |
| 1 | Waiver authority | **User chose the default.** The human BE signs PRD- and feature-tier waivers. A **standing** waiver also needs the record's Owner, the register owner. No Architect role. The Architect role-pair question stays an open item in the design doc. |
| 2 | Register format | **User chose the default.** Each record is a fixed-key Markdown block: a `### NFR-<PREFIX>-<NNN> — <title>` heading, then a ```` ```text ```` fence holding the keys in a fixed order. Indented continuation lines are allowed. The same block is used in the register, the PRD, and record excerpts. It can be parsed line by line, so Phase 3 can script it. |
| 3 | Machine-checked coverage | **User chose the default.** Phase 2 is enforced by prompts and BE approval. The formats are fixed now so a check stays possible. A CI check or template moves to Phase 3. This is recorded as a known risk. Note that a plugin cannot ship a workflow, and a consuming repo's CI cannot reach a plugin's install directory. |
| 4 | Cross-PRD NFRs | **Out of scope, confirmed.** Nothing here reads across PRDs. Standing NFRs cover the shared case. |
| — | Skill name | **`neo-nfr-authoring` conforms.** It has the `neo-` prefix, it is kebab-case, and the directory name equals the frontmatter `name:` (`plugin-contract.md:249-255,274-276`). It parallels `neo-feature-authoring` and `neo-task-authoring`. It is Neo-authored, not vendored. Frontmatter uses only `name` and `description`; any other top-level key is a hard error on spec-conformant paths (`plugin-contract.md:270-273`). |
| — | Branch | **`feat/nfr-first-class-support`, cut from `docs/nfr-first-class-support` (`da2542b`).** The design doc then travels with the work, and U0 corrects it in the same history. No PR exists yet for the docs branch (FACT: the only PR is #1, merged). If the docs branch merges first, rebase the feature branch onto `main`. Phase 2 goes on `feat/nfr-coverage-gates`, cut from the Phase 1 branch, with its PR stacked on the Phase 1 PR. **Harness note:** this session's push target is only `docs/nfr-first-class-support`. The implementing session must be allowed to push the `feat/` branches. |

Proving-layer names, used inline in the skill and as the verification-template layer names:
`unit/property`, `contract`, `integration`, `static-analysis`, `policy-as-code`, `load/performance`
(new, U11), `runtime-eval`, `formal`, `live-procedure`.

Category→prefix map:
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

---

## 3. Work units, in commit order

The type and scope of each commit follow repo history (`docs(design)`, `feat(verification)`, `fix(agents)`).
Do **not** use `!` or `BREAKING CHANGE`. `scripts/bump-versions.py:35-40` would bump the major version.

### PR A — Phase 1: traceability (U0–U7, on `feat/nfr-first-class-support`)

#### U0 — `docs(design): correct NFR proposal premises and record decisions`
- **File:** `docs/contributing/design/nfr-first-class-support.md`
- **Baseline (`:10-11`):** change `0a835d0` to `2131b19`.
- **"No hits" claim (`:32`):** reword to "no shipped content under `plugins/`".
- **§1:** add the category→prefix map.
- **§6:** rename `NFR-OBS-001` to `NFR-OPS-001`. Change `load test` to `load/performance`.
- **Changes by file:** add the agents from §1 items 5–6, the validator unit, and the new layer.
- **Open questions:** mark Q1–Q3 resolved with the §2 answers. Leave the Architect pair as an open item. Mark Q4 out of scope.
- **Status stays "proposal"** until U13.

#### U1 — `ci(validate): fail when a skill duplicated across plugins drifts`
- **`scripts/validate-plugins.py`:** add `check_duplicated_skills()`, called from `main()` (`:742-748`).
  - Group `plugins/*/skills/<name>/` directories by `<name>`.
  - For every name that appears in two or more plugins, require identical relative file sets and byte-identical contents.
  - Error format: `[skills] <name> differs between plugins/a and plugins/b: <relpath>`.
  - The check is generic, with no list to maintain. Today it covers `neo-evidence-standard`, which is identical (FACT: `diff -q` is clean). After U2 it also covers `neo-nfr-authoring`.
- **`AGENTS.md` § Checks**, the "Plugins validate" bullet: add one clause about the new check.
- **`plugin-contract.md:106-111`**, the list of what the validator enforces: add the same clause.
- **Safe alone.**

#### U2 — `feat(nfr): add neo-nfr-authoring skill to neo-core and neo-product`

**New file:** `plugins/neo-core/skills/neo-nfr-authoring/SKILL.md`, plus a byte-identical copy under `plugins/neo-product/skills/`.
Use one file only, with no assets, so there is less to keep in step.

Frontmatter:
```yaml
---
name: neo-nfr-authoring
description: Use when writing, reviewing, or checking coverage of a non-functional requirement (NFR) — a PRD's NFR section, a standing NFR register, a feature's Constraints field, a task's NFR-tagged validation criteria, a task-set coverage matrix, or an NFR waiver. Defines the NFR record, categories, tiers, the admission rule, the waiver rule, and the coverage-matrix format. Load whenever an artifact states, carries, waives, or proves an NFR.
---
```

The skill owns sections 2–9. Everything else links to it.

1. **What an NFR is.** A constraint *on* delivery, not something delivered. Enabler work is an ordinary PRD.
2. **The record.**
   - Fields table, with the eight required fields from design §1.
   - Optional fields: `Tightens:` (a standing ID) and `Status:` (`active` | `retired`).
   - ID grammar is `NFR-<PREFIX>-<NNN>`. IDs are never reused. Retire a record; never delete or renumber it.
   - Category→prefix map.
   - `Proving layer:` is written as `<layer> · <stage>`. Layer is one of the inline names. Stage is `task`, `feature-verification`, or `operations`.
   - **The fixed-key record template**, keys in order: ID, Kind, Category, Statement, Source, Tier, Proving layer, Owner.
3. **Admission rule.**
   - An NFR is admissible only with a measure (a full quality-attribute scenario with a numeric response measure) or an observable violation, plus a cited source, a proving layer and stage, and an Owner.
   - The source must be a `FACT` with a locator, per `neo-evidence-standard`.
   - Words like "secure", "scalable", "highly available", "performant", or "robust" with no measure are rejected.
   - An inadmissible NFR becomes an **open question** in its artifact. It is never dropped silently.
4. **Tiers.**
   - Table: standing, prd, feature, task.
   - A lower tier may tighten a standing NFR but never loosen it; loosening is a waiver.
   - The standing register lives in the **consuming repo**. The suggested path is `docs/design/quality/nfr-register.md`, linked from that repo's `AGENTS.md`. Its header names the register owner.
   - Agents **propose** register entries and never write them.
   - Neo ships no NFR content.
5. **Dispositions.**
   - The applicable set is every active standing NFR, plus the PRD NFRs attached to the segment, plus the feature-tier NFRs.
   - Each one is `mapped`, `waived`, or `n/a — <reason>`.
6. **Waiver rule.**
   - Required fields: ID, rationale, residual risk, owner, revisit (an expiry or a condition), and signed-by.
   - PRD- and feature-tier waivers are signed by the BE. A standing waiver is signed by the BE **and** the record Owner.
   - If any field is missing, it is not a waiver and the NFR still applies.
   - Agents draft waivers and never sign them. An expired waiver lapses, and the NFR applies again.
7. **Carrier forms.**
   - Feature: a `Constraints:` block with one line per NFR and its disposition.
   - Task: a `Constraints:` line.
   - Tagged criterion: `- [NFR-SEC-002] <machine-checkable statement>`.
   - Deferral: `NFR-PERF-001 (deferred → feature-verification · load/performance)`.
8. **Coverage matrix format.**

   | NFR | Tier | Disposition | Proving stage · layer | Covered by / Deferred to |
   | --- | --- | --- | --- | --- |
   | NFR-SEC-002 | standing | mapped | task · policy-as-code | #T2 criterion 2 |
   | NFR-PERF-001 | prd | mapped | feature-verification · load/performance | deferred → feature-verification · load/performance |
   | NFR-OPS-001 | standing | waived | — | — |

   Rules:
   - Every applicable NFR has exactly one row.
   - A row that is `mapped` with stage `task` needs at least one tagged criterion.
   - A row with a later stage needs a deferral.
   - A row with neither is **uncovered**, and the task set cannot be approved.
9. **Coverage checks by artifact.** The skill defines each check. `process-flow.md` places each one at a gate.
   - **PRD:** records or "standing only", all admissible.
   - **Segmentation:** every PRD NFR is attached to at least one segment, or is n/a with a reason. An NFR is never its own segment.
   - **Feature:** every applicable NFR has a disposition.
   - **Task set:** the matrix has no uncovered row.
   - **Carrier issue:** `## Constraints` is present.
   - **Review:** no mapped task-stage NFR is violated. A deferred NFR is a finding only if the change makes it unprovable.
   - **Verification plan:** every in-stage NFR has at least one case at or above its proving layer. A missing environment means `Blocked` plus residual risk with the record Owner, never `Pass`.
   - **Feature verified:** every `feature-verification` deferral has a recorded result.
10. **Worked example.** The corrected design §6: `NFR-SEC-002` (standing), `NFR-PERF-001` (PRD tier),
    the `NFR-OPS-001` waiver, the task with a tagged criterion, and the matrix.
11. **Anti-patterns.**
    - Checklist theater.
    - A fake per-task proof of an emergent NFR.
    - An agent writing to the register.
    - A waiver with no owner.
    - Marking a deferral as `Pass`.

**Ripple in the same commit.** These lists count or name components; see §5.
- `AGENTS.md:93-94`: change `"Installed 4 skills."` to `"Installed 5 skills."`, in both lines.
- `plugin-contract.md:289-297`: list the skill in both plugins, and say "`neo-evidence-standard` and `neo-nfr-authoring` are duplicated".
- `stack-plugin-contract.md`:
  - **Tier table `:53`:** add the project tier entry "standing NFR register (suggested `docs/design/quality/nfr-register.md`)".
  - **New paragraph after `:84`:** the register is the consumer's obligation. Neo ships the format and the gates, and agents never write the register. This is design §2, Phase 1 row.
  - **What ships `:107-119`:** add two rows, one for `neo-core` ("Duplicated into `neo-product`") and one for `neo-product` ("Copy of `neo-core`'s; keep in step — CI-checked").
- `plugins/neo-core/README.md:24-29`: add a skill bullet.
- `plugins/neo-product/README.md:45-51`: add a row to the skills table.
- `README.md:18-23`:
  - `neo-core` line: add `neo-nfr-authoring`.
  - `neo-product` line: "its own copies of `neo-evidence-standard` and `neo-nfr-authoring`".
- `docs/glossary.md`:
  - New section `## Non-functional requirements`, between Proof (`:59-67`) and Loops. It holds **NFR**, **NFR register**, **Waiver**, and **Coverage matrix**, each `[live]`, one sentence each, linking to the skill.
  - Under Artifacts (`:79-87`): add a **neo-nfr-authoring** entry.
- Owner tables:
  - `docs/README.md:47-53`: add the row "NFR record, tiers, admission, waivers, coverage matrix | the `neo-nfr-authoring` skill, shipped in both plugins".
  - `docs/contributing/README.md:59-72`: add the same row.
- `plugins/neo-core/plugin.json` description: before ", with lifecycle-logging hooks", insert ", the neo-nfr-authoring skill that carries non-functional requirements through every gate".
- `plugins/neo-product/plugin.json` description: change "…Systems Thinking specialists, with lifecycle-logging hooks." to "…Systems Thinking specialists and PRD NFR authoring, with lifecycle-logging hooks."
- Marketplace descriptions don't list skills. Leave them.

**Safe alone.** No agent loads the skill yet. It is discoverable by its description, and harmless.

#### U3 — `feat(product-requirements): capture NFRs as admissible records in the PRD`
- **`assets/prd-template.md:115-121`:**
  - Keep the Architecture, Integrations, and Data bullets. Drop Performance and Security/Compliance.
  - Add a new `## Non-Functional Requirements` section right after it, with:
    - a line: `Standing NFRs: <register path> apply unless waived at feature sign-off` (or "none").
    - one record block per PRD-tier NFR, or the literal `Standing only`.
    - a note that the PRD may tighten a standing NFR but never loosen it; any loosening request goes to Open Questions.
- **`references/scope-definition.md` §3 (`:39-48`):** the Technical and Regulatory rows become NFR records, which link to `quality-attributes.md`. The Timeline and Budget rows stay. Output-format item 3 (`:68`) becomes "Constraints table (project constraints only; system constraints are NFR records)".
- **New `references/quality-attributes.md`:**
  - **When to Use.**
  - **Procedure:**
    1. Read the standing register named in the consuming repo's `AGENTS.md`. Reference it; don't copy it.
    2. Walk the ten categories, one probing question each, reusing the Coach's compliance, failure, and service-level probes.
    3. Write each answer as a quality-attribute scenario.
    4. Classify its kind.
    5. Cite a discovered source.
    6. Assign the proving layer and stage.
    7. Run the admission test from `neo-nfr-authoring`; a failure becomes an Open Question.
    8. Write the record into the PRD section.
  - **Output Format** and **Rules.** The record format, admission rule, and tiers are referenced from `neo-nfr-authoring`, not restated.
- **`SKILL.md`:**
  - Draft question `:67`: add "…and quality-attribute requirements (see quality-attributes.md)".
  - Review rubric "Technical grounding" `:119`: add "NFRs stated as admissible records".
  - References table `:189-199`: add a row.
- **`references/prd-assembly.md`:**
  - Minimum-viable list `:11-19`: add item 6, "NFR section — records or 'Standing only'", and change "five" to "six".
  - Quality Check `:27-39`: add the row "NFRs admissible".
- **`neo.product.coach.agent.md` at the PRD drafting paragraph (`~:129`):** "Load `neo-nfr-authoring` when drafting the NFR section."
- **`neo.product.engineer.agent.md` Phase 5 gate (`:190-196`):** add the bullet "States its NFRs as admissible records, or 'Standing only'."
- **Safe alone.** Until U7, the BE reads the PRD NFR section as prose, which is no worse than today.

#### U4 — `feat(spec): add a Constraints field to features, tasks, and the task handoff schema`
- **`neo-feature-authoring/SKILL.md`:**
  - **Fields (`:12-16`):** add **Constraints**, every applicable NFR with a disposition, linking to `neo-nfr-authoring`.
  - **Sign-off gate (`:39`):** ready-to-work also needs every applicable NFR to be mapped, waived, or n/a with a reason. A standing waiver needs the register owner's signature too.
  - **Template (`:43-53`):** add the `Constraints:` block.
- **`neo-task-authoring/SKILL.md`:**
  - **Fields (`:12-15`):** add **Constraints**, the parent feature's mapped NFRs that this task touches, each either proved here or deferred.
  - **Validation rules (`:19-35`):** a criterion that proves an NFR is prefixed `[NFR-ID]`. An emergent NFR is deferred, never faked.
  - **Template (`:68-75`).**
- **`task-handoff-schema.md`:**
  - **§2 row:** `Constraints`, required on emit (may be `None`), source `neo-nfr-authoring` plus this doc. Note that it must reach the reviewer.
  - **§3 table:** add the field.
  - **§3 canonical body:** add
    `## Constraints` / `- NFR-SEC-002 — mapped — <one-line statement> — source: <path>` / `- NFR-PERF-001 — deferred → feature-verification · load/performance — <statement>` / `<!-- or: None -->`.
    The statement and source are included because kickoff prompts must be standalone (`neo.business-engineer.agent.md:159-160`).
  - **§4 ADO:** a `Constraints` block inside the Description field. **Needs a live check:** whether ADO renders a Markdown heading there.
  - **§5 emitter:** writes the section always.
  - **§5 consumer:** a **soft consumer**. An absent section is treated as `None (undeclared)` and reported in the PR body, not refused. The TE accepts any issue (`neo.technical-engineer.agent.md:3`), so a hard refusal would break hand-filed issues.
  - **§6:** point to `neo-nfr-authoring`.
- **Linking only:**
  - `docs/guides/filing-work.md`: add one bullet under Feature (after `:27`) and one under Task (after `:41`).
  - `docs/glossary.md:53,55`: Feature and Task gain "Constraints".
  - `docs/concepts/architecture.md:63`: add a feature bullet.
  - `docs/getting-started.md:37` and `docs/guides/using-neo.md:21,68`: field summaries gain "constraints".
- **Must land in the same PR as U5–U7.** U4 adds a field that agents only emit once U5–U7 land.

#### U5 — `feat(feature-agent): draft an NFR disposition for every applicable constraint`
- **`neo.feature-agent.agent.md`:**
  - After `:15`: "Load **neo-nfr-authoring**."
  - New step after step 4 (`:22`), **Draft Constraints**:
    - List every NFR handed in, plus the standing register, with a proposed disposition.
    - Draft waivers with every field and flag them for signature, including the register owner for a standing waiver.
    - Propose feature-tier NFRs only if they are admissible.
  - Done (`:29`): add "Constraints".
  - Never (`:31-37`): "Never sign or presume a waiver."
- No change to `tools:`. Do **not** write "child session", "spawn … session", or `base_branch` in the body; the validator's `_SPAWN_PROMPT_RE` (`validate-plugins.py:143-151`) would fail CI.

#### U6 — `feat(task-planner): carry feature constraints onto tasks as tagged criteria or deferrals`
- **`neo.task-planner.agent.md`:**
  - `:14`: also load **neo-nfr-authoring**.
  - Step 1 (`:18`): refuse a feature whose Constraints are missing or lack dispositions, just as it refuses an unsigned feature.
  - Step 4 (`:21`): give each task a Constraints line and the tagged criteria.
  - Never (`:32-36`): "Never drop a mapped NFR — each appears on at least one task's Constraints or as a deferral."
- Tools stay `[read, search, edit, execute]`. `execute` is present, so the validator passes.

#### U7 — `feat(business-engineer): carry NFRs from segmentation to carrier issue and kickoff`
- **`neo.business-engineer.agent.md`:**
  - **After `:60`:** "Load `neo-nfr-authoring` before step 1."
  - **Step 1 (`:92-98`):**
    - Read the register path from the consuming repo's `AGENTS.md`, and record "none" if it is absent.
    - Show an **NFR × segment attachment** with the proposed segmentation.
    - Surface any unattached NFR to the human: attach it, or mark it n/a with a reason.
    - Never make a cross-cutting NFR its own segment.
  - **Step 2 (`:100-107`):**
    - The Feature Agent prompt carries the full attached records and the register path.
    - A feature with an NFR that has no disposition is not signable.
    - For a standing waiver, collect the register owner's sign-off through the human and record who signed.
  - **Step 4 (`:117-124`):** each issue carries `## Constraints` per the schema.
  - **Step 5 kickoff (`:130-132`):** include the constraints with their statements, measures, and deferrals, and the instruction to give them to review.
  - **Fallback paragraph (`:83-86`):** add `neo-nfr-authoring` to the restated contract.
  - **Rules (`:153-176`):** add "NFRs travel: segment → feature → task → carrier issue → kickoff; none is dropped silently."
- The tools already include `create_session`, so nothing changes there.

### PR B — Phase 2: gates (U8–U13, on `feat/nfr-coverage-gates`, stacked on PR A)

#### U8 — `docs(process-flow): add NFR coverage checks to the boundary gates`
Every check below links to `neo-nfr-authoring` § Coverage checks. `process-flow.md` owns only where each check sits, the gate owner, and the failure route.
- **Boundary 0 entry gate (`:42-46`):** add the PRD check.
- **Boundary 0, new short paragraph:** "On segmentation." The BE drafts the attachment, and the human approves it. **On failure** (`:51-52`), re-segment or mark n/a with a reason.
- **Boundary 1:**
  - Item 1 (`:69`) gains the dispositions.
  - New item 4: the coverage matrix accompanies the approved set with no uncovered row.
  - Item 2 (`:70-71`) mentions Constraints.
- **Boundary 2, item 3 (`:113-114`):** the reviewer also checks the carrier's Constraints. The status stays `[target]`.
- **Boundary 3 (`:153-155`):** every `feature-verification` deferral has a recorded result. `Blocked` counts as residual risk with an owner, never `Pass`.
- **Operations → Specification edge (`:205-209`):** operations-stage NFRs ride this edge `[target]`. This is the hook for Phase 3.
- **The two fits (after `:227`):** one sentence on how NFR proof splits across the two fits.

#### U9 — `feat(task-planner): emit the NFR coverage matrix with the proposed task set`
- **Task planner:**
  - Steps 4 and 6 (`:21,23`): emit the matrix, using the skill's format, and iterate it with the BE.
  - Done (`:28`): the approved set **and** a matrix with no uncovered row.
- **BE:**
  - Step 3 (`:109-115`): present the matrix verbatim with the split. The set is approved together with its matrix.
  - Step 4: persist the matrix on the parent feature as a `gh issue comment` (through `execute`) headed `## NFR coverage matrix`. A comment is append-only, so it does not clobber the feature body.
- **These two must land together.** The BE presents what the planner emits.

#### U10 — `feat(review): check each change against its carrier issue's constraints`
- **`neo.technical-engineer.agent.md`:**
  - Step 1 (`:87`): read `## Constraints`. If it is absent, record `None (undeclared)`.
  - Step 4 (`:112`): the writer gets the constraints that are relevant to its unit.
  - Step 5 (`:118`): the reviewer assignment adds the constraints.
  - Stacking kickoff (`:106`): restate the constraints.
  - Step 6 (`:126`): the PR body lists the NFRs checked and the NFRs deferred.
- **`neo.code-reviewer.agent.md`:**
  - Load `neo-nfr-authoring`.
  - Scope (`:17`): the assignment includes Constraints.
  - What to check (`:26`): add **constraints**, using the skill's review check. A violated mapped NFR is a `blocker`.
  - Output (`:41-46`): add an `NFRs checked` line.
- `neo.implementation-planner` is unchanged. Tagged criteria already reach it as acceptance criteria (`task-handoff-schema.md:148-155`).
- **TE and reviewer must land together.** The reviewer expects input that only the TE sends.

#### U11 — `feat(verification): trace NFRs to cases and block on missing environments`
- **`neo-verification-template/SKILL.md`:**
  - **Layer table (`:27-36`):** add the row `Load / performance tests | latency percentiles, throughput, saturation under a stated load profile | quality-attribute NFRs with a response measure under load; needs an environment that sustains the profile, else Blocked`.
  - **Workflow step 2 (`:43`):** in-stage NFRs trace to at least one case, with the NFR ID in Procedure. Deferred NFRs are listed in Scope.
  - **New subsection "NFR traceability"**, after the case-matrix rules (`:68-72`): a case never passes on a layer below the record's proving layer. For a missing environment, mark it `Blocked` and make the record Owner the residual-risk owner.
  - **Template Scope (`:123-127`):** add the line "NFRs in scope / deferred".
  - **Checklist (`:164-172`):** add one item.
- **`neo.verification-loop.agent.md`:**
  - Load `neo-nfr-authoring` (`:25-27`).
  - Step 2 (`:63`): read the target's Constraints, or for a feature target, the matrix comment.
  - Step 3 (`:73-77`): trace the NFRs.
  - Step 5 (`:104-105`): the report includes NFR rows.
  - This agent has **no** `create_session`, so the spawn-phrase trap applies.
- Leave `assets/example.md` unchanged. It is a worked example tied to one repository.
- **Template and agent must land together.**

#### U12 — `feat(product-researcher): harvest candidate standing NFRs in brownfield discovery`
- **`neo.product.researcher.agent.md`:**
  - Scope example (`:25-27`): add "which standing NFRs already bind this area?"
  - New short section, **Harvesting standing NFRs:**
    - Look in ADRs, IaC, policy assignments, and SLAs.
    - Report each candidate as a `FACT` record block with a locator.
    - Never write the register; candidates go to the register owner.
    - Load `neo-nfr-authoring`.
  - Tools stay unchanged; `execute` is present.
- **`neo.product.engineer.agent.md` Phase 0 typical questions (`:95-96`):** add the standing-NFR question.
- **Safe alone.**

#### U13 — `docs: mark first-class NFRs accepted and true up inventories`
- **Design doc:** change the status to "accepted — landed in <PR A>, <PR B>".
- **"(proposal)" labels:** drop them in `docs/contributing/README.md:53,65` and `docs/README.md:40`.
- **`todo.md:76-77`:** point to the shipped skill. Leave `todo.md:16` as it is; it is a historical count.

---

## 4. Cross-plugin duplication

| File | Copies | How to keep them in step |
| --- | --- | --- |
| `skills/neo-nfr-authoring/SKILL.md` | `neo-core`, `neo-product` | Byte-identical, enforced by the U1 validator check. Edit one copy, then `cp` it to the other in the same commit. |
| `skills/neo-evidence-standard/SKILL.md` | both (existing) | Now enforced by U1 too. Today the copies are identical. |

Nothing else is duplicated. `quality-attributes.md` is product-only. The verification template is core-only.

## 5. Ripple checklist (all in U2 unless noted)

| Item | Change |
| --- | --- |
| `AGENTS.md:93-94` | 4 → 5 skills, for each plugin |
| `plugin-contract.md` | §4 list `:289-297` (U2); validator clause `:106-111` (U1) |
| `stack-plugin-contract.md` | What ships plus the project tier |
| READMEs | Both plugin READMEs and the root README |
| Glossary and hubs | Glossary (U2, U4); `docs/README.md` and `docs/contributing/README.md` owner rows (U2) and status (U13) |
| `plugin.json` descriptions | Both |
| `scripts/bump-versions.py` and `version-bump.yml` | **No change.** The bump happens after merge and is derived from commit types: `feat` gives a minor bump to both plugins. Don't hand-edit `version`. `ci`/`docs` commits outside `plugins/` don't bump. |

## 6. Agent prompt changes — summary

| Agent | Step changed | Skill load | Passes downstream |
| --- | --- | --- | --- |
| business-engineer | 1, 2, 3 (U9), 4, 5, fallback, rules | `neo-nfr-authoring` | Feature Agent prompt: the attached records plus the register path. Carrier issue: `## Constraints`. Kickoff: the constraints with their statements. Feature issue: the matrix comment. |
| feature-agent | new "Draft Constraints" step | same | A `Constraints:` block on the feature |
| task-planner | 1, 4 (U6); 4, 6, Done (U9) | same | Per-task Constraints, tagged criteria, the matrix |
| technical-engineer | 1, 4, 5, 6, stacking | — (forwards only) | Constraints to the writer and reviewer; PR body NFR lines |
| code-reviewer | Scope, What to check, Output | same | `NFRs checked` in the verdict |
| verification-loop | 2, 3, 5 | same | NFR rows in the gate report |
| product.coach | PRD drafting | same | The PRD NFR section |
| product.engineer | Phase 0 questions, Phase 5 gate | — | A standing-NFR research question |
| product.researcher | Scope, new harvest section | same (product copy) | Candidate record blocks, labeled `FACT` |

**No new `tools:` entries anywhere.** Skills are loaded through prose, as every existing agent already does. Every touched agent that names
`search` or `web` already has `execute` (`neo.product.researcher.agent.md:10`, `neo.task-planner.agent.md:5`,
`neo.feature-agent.agent.md:6`, `neo.code-reviewer.agent.md:6`).

**Spawn-phrase trap.** Only the BE and TE may contain "child session" or `base_branch`.

## 7. Validation per unit

Run after **every** unit:
```bash
for f in .github/plugin/marketplace.json plugins/*/plugin.json plugins/*/hooks/hooks.json; do python3 -c "import json;json.load(open('$f'))" && echo "ok  $f" || echo "BAD $f"; done
python3 scripts/validate-plugins.py
```

Link check after every docs-touching unit. There is no link checker in the repo, so use this one-off script:
```bash
python3 - <<'EOF'
import re,pathlib
bad=[]
for p in pathlib.Path('.').rglob('*.md'):
    if '.git' in p.parts: continue
    for t in re.findall(r'\]\(([^)#\s]+)(?:#[^)]*)?\)', p.read_text(errors='ignore')):
        if '://' in t or t.startswith('mailto:'): continue
        if not (p.parent/t).resolve().exists(): bad.append(f'{p}: {t}')
print('\n'.join(bad) or 'links ok')
EOF
```

Unit-specific checks:
- **U1:** temporarily change one byte in a product copy of `neo-evidence-standard`. The validator must fail with `[skills] neo-evidence-standard differs…`. Revert, and don't commit the change.
- **U2:** run `cmp` on the two `neo-nfr-authoring/SKILL.md` copies. Check that `rg -n "^(name|description):" …/neo-nfr-authoring/SKILL.md` shows exactly two keys.
- **U2 live install.** The Copilot CLI is **not installed in this container**, so run this on a dev machine:
  ```bash
  export COPILOT_HOME=$(mktemp -d)
  copilot plugin marketplace add .
  copilot plugin install neo-core@neo      # expect: Installed 5 skills.
  copilot plugin install neo-product@neo   # expect: Installed 5 skills.
  copilot plugin list
  copilot -p "List the exact names of every skill available to you and nothing else."   # both lists include neo-nfr-authoring
  ```
  Re-run it after any later unit that touches a manifest. None is planned.
- **U5–U7, U9–U12:** check for spawn phrases in the agents that can't spawn:
  `rg -n -i "child session|base_branch" plugins/neo-core/agents/neo.{feature-agent,task-planner,code-reviewer,verification-loop}.agent.md plugins/neo-product/agents/neo.product.researcher.agent.md`
  It must return nothing.

## 8. End-to-end dry run (by hand, after PR B; needs the desktop app for the BE steps)

Set up a throwaway consuming repo:
- An `AGENTS.md` that links `docs/design/quality/nfr-register.md`.
- A register holding `NFR-SEC-002` and `NFR-OPS-001`, both standing, with the platform lead as Owner.
- `docs/adr/0007-network-isolation.md`.

| # | Step | Check to prove the NFR survived |
| --- | --- | --- |
| 1 | PRD (Product Coach) | The NFR section has an `NFR-PERF-001` block that passes admission and references the register. Negative test: add "must be scalable". It must land in Open Questions, not as a record. |
| 2 | Segment (Neo BE) | The attachment table maps PERF-001 to the checkout segment. An unattached NFR is put to the human. No segment exists just for an NFR. |
| 3 | Feature (Feature Agent) | Constraints shows SEC-002 mapped (standing), PERF-001 mapped, and OPS-001 waived with all six waiver fields. The BE asks for the register owner's signature on OPS-001. Negative test: drop the waiver owner. The agent must treat OPS-001 as applicable. |
| 4 | Task set (Task Planner) | The matrix has three rows. SEC-002 is covered by `[NFR-SEC-002]` on the persistence task. PERF-001 is deferred to feature-verification · load/performance. OPS-001 is waived. Negative test: delete the tagged criterion. The row must show as uncovered, and the BE agent must refuse to present the set as approvable. |
| 5 | Carrier issue | `## Constraints` is present, in canonical form with statements. The feature issue has the `## NFR coverage matrix` comment. |
| 6 | Kickoff | The `get_session` prompt contains the constraints and the instruction to pass them to review. |
| 7 | Review | Commit IaC with `publicNetworkAccess: Enabled`. The reviewer returns a `blocker` that cites NFR-SEC-002. The TE assignment text includes the Constraints. |
| 8 | PR body | Lists SEC-002 as checked and PERF-001 as deferred. |
| 9 | Verification (Verification Loop, feature target) | The plan has a PERF-001 case at load/performance. With no staging environment, the case is `Blocked`, and the residual-risk owner is the BE (the PERF-001 owner). The gate is not `Pass`. A unit test is not accepted as a substitute. |
| 10 | Boundary 3 | The BE sees the PERF-001 deferral without a recorded result, so the feature does not deploy. |

## 9. Risks and rollback

**Safe alone:** U0, U1, U2, U3, U8 (docs only), U12.

**Must land together:**
- U4 + U5 + U6 + U7. Otherwise the schema has a field that no agent emits. All of PR A ships together.
- U9: the planner and BE edits.
- U10: the TE and reviewer edits.
- U11: the template and agent edits.

**An agent loading a skill that doesn't exist.** U2 comes before every agent unit, and no agent unit merges without it. What a
Copilot agent does when prose names a skill that isn't installed is **undocumented; it needs a live check**. INFERENCE: it
proceeds without the skill, silently, which is the failure this design exists to stop. So never revert U2 on its own.

**Issues filed before this change** have no `## Constraints`. The soft consumer from U4 reports them as `None (undeclared)` instead
of refusing them.

**Docs audit.** The weekly audit flags paths that "no longer exist"
(`.github/workflows/docs-consistency-audit.md:30`). INFERENCE: it may flag `docs/design/quality/nfr-register.md`. Always write it as
"in the consuming repo", as the existing `docs/design/requirements/` references do.

**Enforcement is prompt-only** (decision 3), and this is recorded as a risk in the design doc.

**Gate fatigue.** The BE reviews only additions and waivers. The matrix is reviewed as part of the set, not separately.

**Rollback.** Revert the PR. Reverting U2 restores the "4 skills" counts, so revert the whole PR, not a single unit.

## 10. Phase 3 outline (not designed here)

Dependencies:
- `neo-azure-platform` (#67) and `neo-ops` (#68) stack plugins: check templates per category.
- The Operations loop (#14, upstream): SLO-shaped NFRs as telemetry on the Operations → Specification edge.
- The consuming-repo CI check deferred by decision 3.

Interfaces Phase 1–2 leave for Phase 3:
- **The fixed category list and prefix map.** Stack check templates key on these.
- **The proving-layer names** (`policy-as-code`, `load/performance`, …). Stack skills declare which layer they serve and are found by **description matching**. Core never names a stack skill (`stack-plugin-contract.md:155-163`).
- **The fixed-key record block, the canonical `## Constraints` section, and the matrix table.** All three can be parsed line by line, which is what a CI check would read.
- **The `operations` stage plus the record Owner.** These feed SLO and policy telemetry, and a breach routes as an input on the Operations → Specification edge (U8 hook, `process-flow.md:205-209`).
- **The matrix "Covered by" column.** A stack check can fill it with a check ID.
