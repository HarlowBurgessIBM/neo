# ShiftSwap answer key — presenter only

Expected outcomes for eight swap requests against `seed/data/roster.sample.json`, evaluated under
`seed/docs/standards/fatigue-management-policy.md` §§ 3–4. **Do not copy this file or
`tools/reference-check.mjs` into the demo repository.** If an agent can read the answers, the
verification proves nothing.

The table is computed, not hand-written. To recompute it:

```bash
node tools/reference-check.mjs
```

It exits non-zero if any case no longer matches.

## The roster in one view

Roster period: Monday 8 March to Sunday 21 March 2027. Site time zone: `America/Chicago`. Site
clocks go forward one hour at 02:00 on Sunday 14 March 2027.

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

Each case has exactly one deciding finding, so a result that lists a second reason is wrong.

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

## Two things in the fixture that are easy to trip on

- Jerome Guidry's CDU field night on Sat 13 (`CDU-FLD1-0313-N`) runs 18:00 to 06:00 across the
  clock change. It is 11 scheduled hours, not 12 (§ 2, *scheduled hours*).
- Tom Broussard's published roster already carries 72 h in the week of 15 March. The published
  roster is not re-judged; only a swap's resulting schedule is. C5 is blocked because the swap
  takes him to 84 h.

## If the demo date moves past 8 March 2027

The roster would be in the past. Change the dates in `tools/build-roster.mjs`, regenerate, and
update the cases in `tools/reference-check.mjs`. C4 depends on a night when clocks go forward; the
next one after March 2027 is in March 2028 under current US rules.
