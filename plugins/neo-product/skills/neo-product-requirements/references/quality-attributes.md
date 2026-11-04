# Quality Attributes (NFR Elicitation)

The record format, categories, admission rule, tiers, and waiver rule are owned by the **`neo-nfr-authoring`** skill
(shipped in this plugin). This reference is the elicitation procedure only — it turns what the Product loop already
probes into NFR records for the PRD's Non-Functional Requirements section. Load `neo-nfr-authoring` before you start.

## When to Use

- Writing the PRD's **Non-Functional Requirements** section
- Turning compliance, failure-exposure, or service-level answers into records instead of prose
- Converting the Technical and Regulatory rows of the scope constraints table ([scope-definition.md](./scope-definition.md) § 3)
- Reviewing a PRD whose NFRs read as aspirations ("fast", "secure", "scalable")

## Procedure

### 1. Read the Standing Register

Find the standing NFR register named in the consuming repo's `AGENTS.md`. **Reference it; don't copy it.** Its records
apply to every feature unless waived at feature sign-off. If `AGENTS.md` names no register, the PRD says
`Standing NFRs: none` — do not guess a path.

### 2. Walk the Ten Categories

Ask one probing question per category. Reuse what the Product Coach has already asked — the regulatory and compliance,
abuse and failure exposure, and service-level probes — rather than asking twice.

| Category        | Probing question                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------- |
| performance     | Under what load must which interaction respond, and how fast at which percentile?                  |
| reliability     | What availability, recovery time, or data-loss window does the business commit to?                 |
| security        | What boundary must never be crossed — network exposure, identity provider, secret handling?        |
| privacy         | What personal data is touched, and where may it be stored, shown, or retained?                     |
| compliance      | Which regulation, mandated timeline, or audit obligation does this capability fall under?          |
| operability     | What must operators be able to see, alert on, or roll back when this fails?                        |
| maintainability | What existing pattern, platform, or dependency policy must the solution conform to?                |
| compatibility   | Which clients, versions, or integrations must keep working unchanged?                              |
| accessibility   | Which accessibility standard and conformance level applies to the user-facing surface?             |
| cost            | What run-cost ceiling or unit-cost target binds the solution?                                      |

A category with no binding answer is skipped, not padded. Only real constraints become records.

### 3. Write Each Answer as a Scenario

- **Quality attribute** — stimulus, environment, response, and a numeric **response measure**.
- **Constraint** — the boundary, and how a violation is observed.

### 4. Classify Its Kind

`quality-attribute` or `constraint`, per `neo-nfr-authoring`.

### 5. Cite a Discovered Source

The regulation, ADR, SLA, customer standard, or policy assignment, with a locator. Sources are discovered, never
invented — a source you did not retrieve this session is not a source (`neo-evidence-standard`).

### 6. Assign the Proving Layer and Stage

The lowest layer that can genuinely prove it, and the earliest stage that can run that layer. An emergent NFR (p95
under load, availability) is not provable at `task` — say so with a later stage.

### 7. Run the Admission Test

Apply the admission rule from `neo-nfr-authoring`. A candidate that fails — no measure, no source, no proving layer, or
no Owner — goes to the PRD's **Open Questions**, naming what is missing. Never fill the gap by guessing.

### 8. Write the Record into the PRD

One record block per admissible PRD-tier NFR, in the Non-Functional Requirements section of
[../assets/prd-template.md](../assets/prd-template.md). If none is needed beyond the register, write `Standing only`.

## Output Format

1. The `Standing NFRs:` line — the register path, or `none`
2. One `neo-nfr-authoring` record block per PRD-tier NFR, or the literal `Standing only`
3. Open Questions entries for every inadmissible candidate and every request to loosen a standing NFR

## Rules

- The record format, admission rule, and tiers are `neo-nfr-authoring`'s — reference them, do not restate or vary them
- A PRD may **tighten** a standing NFR but never loosen it; a loosening request goes to Open Questions, where it becomes
  a waiver decision at feature sign-off
- Timeline and budget constraints stay in the scope definition — they constrain the *project*, not the *system*
- Never write to the standing register; a candidate standing NFR is proposed to the register owner
- Every record carries an Owner — an NFR nobody owns cannot be waived or settled
