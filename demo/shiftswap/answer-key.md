# ShiftSwap answer key — presenter only

Expected outcomes for eleven swap requests against `seed/data/roster.sample.json`, evaluated under
`seed/docs/standards/fatigue-management-policy.md` §§ 3–4. **Do not copy this file or
`tools/reference-check.mjs` into the demo repository.** If an agent can read the answers, the
verification proves nothing.

The table is computed, not hand-written. To recompute it:

```bash
node tools/reference-check.mjs
```

It exits non-zero if any case no longer matches.

## The roster in one view

Site time zone: `America/Chicago`. Site clocks go forward one hour at 02:00 on Sunday 14 March 2027.

| Fact | Value |
| --- | --- |
| Export time (`exportedAt`) | `2027-03-07T08:00:00Z`, which is 02:00 site time on Sunday 7 March |
| Coverage (`coverage`) | Monday 1 March to Sunday 28 March 2027 |
| Swaps that can be determined | Both shifts start between 7 March and 22 March |
| Local verification clock (`SHIFTSWAP_NOW`) | `2027-03-07T14:00:00Z` |
| Export currency limit | 26 hours |

The last three rows come from `client-followup/docs/discovery/pilot-kickoff-decisions.md` § 3.

| Unit | Day shift | Night shift |
| --- | --- | --- |
| Crude Distillation Unit (CDU) | 06:00–18:00 | 18:00–06:00 |
| Hydrocracker Unit (HCU) | 05:00–17:00 | 17:00–05:00 |

The one-hour stagger between the units is what produces the 11-hour quick turn.

## The cases

"Gives" and "takes" are from the requester's side. Days are in March 2027.

| # | Requester gives | Requester takes | Expected | Deciding rule and value |
| --- | --- | --- | --- | --- |
| C1 | Maya Thibodeaux: CDU console night, Thu 18 (`CDU-CON1-0318-N`) | Luis Fontenot's CDU console night, Fri 19 (`CDU-CON1-0319-N`) | **Auto-approved** | Nothing triggered. § 4.3 |
| C2 | Aisha Okafor: HCU console night, Fri 12 (`HCU-CON2-0312-N`) | Priya Raman's HCU console day, Wed 10 (`HCU-CON1-0310-D`) | **Needs review** | Aisha: exactly 11 h off duty after her CDU day on Tue 9. § 4.2(a) |
| C3 | Maya Thibodeaux: CDU console day, Wed 10 (`CDU-CON1-0310-D`) | Luis Fontenot's CDU console day, Fri 12 (`CDU-CON1-0312-D`) | **Blocked** | Luis (the *counterpart*): 0 h off duty after his Tue 9 night. § 3.1 |
| C4 | Maya Thibodeaux: CDU console day, Wed 10 (`CDU-CON1-0310-D`) | Dwayne Hebert's HCU console day, Sun 14 (`HCU-CON1-0314-D`) | **Blocked** | Maya: 10 h elapsed off duty after her CDU day on Sat 13. § 3.1 |
| C5 | Tom Broussard: CDU field day, Tue 9 (`CDU-FLD1-0309-D`) | Jerome Guidry's CDU field day, Thu 18 (`CDU-FLD1-0318-D`) | **Blocked** | Tom: 84 h in the seven days from Mon 15. § 3.2 |
| C6 | Aisha Okafor: CDU console day, Mon 8 (`CDU-CON2-0308-D`) | Dwayne Hebert's HCU console day, Wed 17 (`HCU-CON1-0317-D`) | **Needs review** | Aisha: 72 h in the seven days from Mon 15. § 4.2(b) |
| C7 | Priya Raman: HCU console day, Mon 8 (`HCU-CON1-0308-D`) | Dwayne Hebert's HCU console day, Wed 17 (`HCU-CON1-0317-D`) | **Blocked** | Priya: HCU console qualification valid through 15 March, shift is on the 17th. § 3.3 |
| C8 | Luis Fontenot: CDU console day, Fri 12 (`CDU-CON1-0312-D`) | Aisha Okafor's HCU console night, Fri 12 (`HCU-CON2-0312-N`) | **Blocked** | Luis: holds no HCU console qualification. § 3.3 |
| C9 | Maya Thibodeaux: CDU console night, Thu 18 (`CDU-CON1-0318-N`) | Luis Fontenot's CDU console day, Fri 26 (`CDU-CON1-0326-D`) | **Cannot determine** | The seven-day windows around 26 March run past the end of coverage. Kickoff decisions § 3.6 |
| C10 | The same swap as C1, with the clock at `2027-03-08T12:00:00Z` | — | **Cannot determine** | The export is 28 hours old; the limit is 26. Kickoff decisions § 3.5 |
| C11 | Maya Thibodeaux: CDU console night, Thu 18 (`CDU-CON1-0318-N`) | Nadia Trahan's FCC console day, Thu 18 (`FCC-CON1-0318-D`) | **Refused** | The FCC is outside the pilot units, so the swap is not checked at all. PRD requirement A1 |

Each case has exactly one deciding finding, so a result that lists a second reason is wrong. C1 to
C9 and C11 are evaluated with the clock at `2027-03-07T14:00:00Z`.

## What each case is for

- **C1** is the swap a supervisor should never have to touch. It is the value case.
- **C2 and C6** sit exactly on a limit and inside the review band. They catch an off-by-one in
  either direction: 11 h is permitted, and 72 h is permitted.
- **C3** fails on the counterpart, not the requester. It catches an engine that only checks the
  person who asked.
- **C4 is the one to show.** Maya's day shift ends at 18:00 on Saturday; Dwayne's shift starts at
  05:00 on Sunday. The clocks read 11 hours apart, but only 10 hours pass, because the clocks go
  forward that night. An engine that subtracts wall-clock times returns *needs review* and lets a
  breach through to a supervisor. The standard defines the off-duty period as elapsed time (§ 2).
- **C5** needs the seven-day window to be evaluated on the schedule *after* the swap.
- **C7** and **C8** separate an expired qualification from one never held.
- **C11** is the scope boundary. The export covers the whole site; the pilot is two units. Nadia
  Trahan and her four FCC shifts exist in the sample only for this case.
- **C9** and **C10** are the "no false safe" cases. C10 is C1 with a stale export: the same swap
  that was approved must now come back as *cannot determine*, not approved.

## Two things in the fixture that are easy to trip on

- Jerome Guidry's CDU field night on Sat 13 (`CDU-FLD1-0313-N`) runs 18:00 to 06:00 across the
  clock change. It is 11 scheduled hours, not 12 (§ 2, *scheduled hours*).
- Tom Broussard's published roster already carries 72 h in the week of 15 March. The published
  roster is not re-judged; only a swap's resulting schedule is. C5 is blocked because the swap
  takes him to 84 h.

## If the demo date moves

The application clock is set with `SHIFTSWAP_NOW`, so the real date does not matter. To use a
different roster period, change the dates in `tools/build-roster.mjs`, regenerate, and update the
cases in `tools/reference-check.mjs`. C4 depends on a night when clocks go forward.
