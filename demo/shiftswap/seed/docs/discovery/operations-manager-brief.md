# Shift swaps at Port Alder — brief from Operations

> **Fictional demo content.** The people, the refinery, and every figure here were invented for the
> ShiftSwap demonstration.

| | |
| --- | --- |
| From | Dana Whitlock, Operations Manager, Port Alder Refinery |
| To | Port Alder IT Applications |
| Date | 2026-11-06 |

## What is going wrong

1. Operators arrange shift swaps between themselves by text message and then ask a shift
   supervisor to approve. The supervisor records the swap in a shared spreadsheet.
2. Nobody checks the fatigue limits or the operator's qualification at the time of approval.
   The supervisor relies on memory. We find breaches afterwards, if we find them at all.
3. The near miss in September (PA-NM-2026-0193, summary in this folder) was a swap that left an
   operator short of rest.
4. Approved swaps often do not reach the scheduler before the shift is worked, and payroll has to
   be corrected.

Figures for items 2 and 4 are in the four-week tally in `supervisor-interviews.md`.

## What I am asking for

5. Find out whether this is worth solving with software, and if so what should exist. I have not
   decided that we should build anything.

## Constraints I already know about

6. The site scheduling system remains the system of record for the roster. It has no swap
   workflow. It exports the published roster as a JSON file every night; a sample is in
   `data/roster.sample.json`.
7. There is no budget this fiscal year for new vendor licences or modules.
8. If we pilot something, the pilot is the Crude Distillation Unit and the Hydrocracker Unit,
   used from control-room desktops. Field tablets come later, if the pilot works.
9. The fatigue standard (VE-HSSE-STD-014) is not negotiable and is not changing for this.

## How I will judge it

10. I am not interested in usage numbers. Operators and supervisors will use whatever we tell them
    to use, so how many people use it tells me nothing about whether it helped.
11. I care about three things: swaps that breach the fatigue standard or a qualification, the
    supervisor time each swap takes, and swaps that never reach the scheduler in time.

## Who to talk to

12. Shift supervisors Renee Landry (Crude) and Carl Nguyen (Hydrocracker). HSSE Manager Simone
    Arceneaux owns the fatigue standard. Marcus Ellery owns the IT engineering standard.
