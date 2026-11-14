# Standing NFR register — ShiftSwap

> **Fictional demo content.** The owners named here are invented.

**Register owner:** Marcus Ellery, IT Applications Lead, Port Alder Refinery.

These are the standing non-functional requirements. Every feature inherits every `active` record
here unless a signed waiver says otherwise. Only the register owner changes this file; anyone else
proposes a record to the register owner. IDs are permanent and are never reused.

### NFR-PRIV-001 — No personal data in logs

```text
ID:            NFR-PRIV-001
Kind:          constraint
Category:      privacy
Statement:     No employee name, employee number, or contact detail appears in application logs,
               traces, or metrics. Violation observed as any personal value from the test data
               found in captured log output after every endpoint has been exercised.
Source:        docs/standards/engineering-standard.md § 2
Tier:          standing
Proving layer: integration · task
Owner:         Marcus Ellery (IT Applications Lead)
```

### NFR-COMP-001 — Decisions leave an append-only audit record

```text
ID:            NFR-COMP-001
Kind:          constraint
Category:      compliance
Statement:     Every state-changing business decision writes one audit record carrying the actor,
               a UTC timestamp, the action, the outcome, and the governing policy revision.
               Application code never updates or deletes an audit record. Violation observed as a
               decision with no matching audit record, a record missing one of those fields, or
               any update or delete issued against the audit store.
Source:        docs/standards/engineering-standard.md § 3;
               docs/standards/fatigue-management-policy.md § 4.5
Tier:          standing
Proving layer: integration · task
Owner:         Simone Arceneaux (HSSE Manager)
```

### NFR-A11Y-001 — Views pass the automated WCAG A/AA checks

```text
ID:            NFR-A11Y-001
Kind:          constraint
Category:      accessibility
Statement:     Every rendered view reports zero axe-core violations for the rules tagged wcag2a,
               wcag2aa, wcag21a, wcag21aa, and wcag22aa. Violation observed as a non-empty
               violations list for any view.
Source:        docs/standards/engineering-standard.md § 4.2
Tier:          standing
Proving layer: static-analysis · task
Owner:         Marcus Ellery (IT Applications Lead)
```

### NFR-PERF-001 — Interactive requests respond within 500 ms

```text
ID:            NFR-PERF-001
Kind:          quality-attribute
Category:      performance
Statement:     Stimulus: a user submits an interactive request. Environment: staging, at the peak
               request rate stated in the application's PRD, sustained for 10 minutes. Response:
               the request completes. Measure: p95 ≤ 500 ms.
Source:        docs/standards/engineering-standard.md § 5
Tier:          standing
Proving layer: load/performance · feature-verification
Owner:         Marcus Ellery (IT Applications Lead)
```

### NFR-REL-001 — Monthly availability

```text
ID:            NFR-REL-001
Kind:          quality-attribute
Category:      reliability
Statement:     Stimulus: the platform synthetic probe requests the health endpoint once a minute.
               Environment: production, excluding announced maintenance windows. Response:
               HTTP 200. Measure: at least 99.5% of probe minutes succeed in each calendar month.
Source:        docs/standards/engineering-standard.md § 6
Tier:          standing
Proving layer: live-procedure · operations
Owner:         Marcus Ellery (IT Applications Lead)
```

### NFR-COMPAT-001 — Works on control-room desktops

```text
ID:            NFR-COMPAT-001
Kind:          constraint
Category:      compatibility
Statement:     The application's verification steps complete on the current and previous major
               release of Microsoft Edge. Violation observed as any verification step that
               cannot be completed on that client.
Source:        docs/standards/engineering-standard.md § 7.1, § 7.3
Tier:          standing
Proving layer: live-procedure · feature-verification
Owner:         Marcus Ellery (IT Applications Lead)
```

### NFR-COMPAT-002 — Works on field tablets

```text
ID:            NFR-COMPAT-002
Kind:          constraint
Category:      compatibility
Statement:     The application's verification steps complete on the current and previous major
               release of Safari on iPadOS. Violation observed as any verification step that
               cannot be completed on that client.
Source:        docs/standards/engineering-standard.md § 7.2, § 7.3
Tier:          standing
Proving layer: live-procedure · feature-verification
Owner:         Marcus Ellery (IT Applications Lead)
```
