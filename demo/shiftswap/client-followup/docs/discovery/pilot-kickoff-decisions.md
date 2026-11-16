# ShiftSwap pilot — kickoff decisions

> **Fictional demo content.** The people, the refinery, and every figure here were invented for the
> ShiftSwap demonstration.

| | |
| --- | --- |
| Meeting held | 2026-11-16 |
| Recorded by | Port Alder IT Applications |
| Present | Dana Whitlock (Operations Manager, sponsor); Simone Arceneaux (HSSE Manager); Marcus Ellery (IT Applications Lead); Renee Landry and Carl Nguyen (shift supervisors); Hannah Beaulieu (Site Scheduler); Gloria Menard (Payroll Supervisor); the Business Engineer |
| Purpose | Answer the open questions in the draft requirements document for the ShiftSwap pilot |

Each decision below was made in the meeting by the person named in its section heading.

## 1. Sponsor decisions — Dana Whitlock

1.1 **The pilot is approved.** Crude Distillation Unit and Hydrocracker Unit, control-room desktops.
Dana read the recommendation to defer and the reasons given for proceeding, and agrees with
proceeding.

1.2 **Business Engineer.** Dana delegates three decisions to the Business Engineer assigned by IT
Applications: accepting the requirements document, signing off features, and approving task sets.
Dana reviews the results herself at the end of the pilot.

1.3 **Pilot window.** Four weeks, the same length as the tally. It starts on a Monday; the date is
set once the application is running for pilot users. If fewer than 30 swaps are approved in the
window, the measures that divide by approved swaps are reported as inconclusive.

1.4 **Targets.** For swaps that breach the minimum off-duty period, for supervisor handling time,
and for swaps not entered in the scheduling system before the shift, the result must be strictly
better than the tally baseline. For swaps that put an operator on a unit or role without a current
qualification, the target is zero: one is a failure.

1.5 **Supervisor time on swaps nobody reviews.** A swap approved without supervisor review is
recorded as zero supervisor minutes and is included in the median. The median for reviewed swaps
is also reported on its own.

1.6 **Telling operators.** In-application status only for the pilot. A swap that needs no review
is answered when the second operator agrees. No time target is set for reviewed swaps; the pilot
records request, agreement, and decision times so that one can be set later.

1.7 **Dates.** No dates are set for build milestones. They are sequenced, not scheduled. How many
requests arrive around a shift change stays unknown until the pilot records it.

## 2. HSSE decisions — Simone Arceneaux

2.1 **Training days.** Under revision 3 of VE-HSSE-STD-014, scheduled hours and off-duty periods
are calculated from shifts on the published roster only. Training counts only where it is rostered
as a shift. Both supervisors have been told to apply this reading. Whether training time should
count is a question for revision 4 and is not part of the pilot.

2.2 **Who decided, when nobody reviewed.** For a swap approved under § 4.3 without supervisor
review, the record names the decider as the system acting under VE-HSSE-STD-014 § 4.3 at the
stated revision, with the time at which both employees had agreed. That satisfies § 4.5.

2.3 **How the tally's breaches were found.** HSSE compared the roster as swapped — scheduled
off-duty periods and qualifications — and not the hours actually worked. Breaches caused by
holdovers were not counted. The pilot review uses the same method.

2.4 **Holdovers.** A separate HSSE review, outside the pilot.

2.5 **Qualification changes during the day.** A qualification that lapses or is renewed is not
visible until the next export. That is accepted for the pilot.

## 3. Roster export — Marcus Ellery and Hannah Beaulieu

3.1 **When.** The scheduling system exports the roster nightly at 02:00 site time. The file carries
`exportedAt`, a UTC instant.

3.2 **Coverage.** Each export covers four calendar weeks, Monday to Sunday, starting with the week
that contains the export date. The file carries `coverage` with the first and last site-time dates.
The export is complete for that range: an operator with no shift starting on a covered date is
off duty that day.

3.3 **Qualifications.** The export carries every operator's qualifications with their valid-through
dates, taken from the training records system immediately before the export runs.

3.4 **The sample.** `data/roster.sample.json` has the same structure as the production export.
Hannah compared its fields with a production file.

3.5 **Currency.** A check result is definitive only if the export is no more than **26 hours** old
when the check is made. With an older export the result is "cannot determine".

3.6 **Horizon.** A swap can be determined only where every seven-day window that contains either
swapped shift lies inside the export's coverage. That means each swapped shift starts at least six
days after the first covered date and at least six days before the last. In the sample, those are
shifts starting from 7 March to 22 March 2027.

3.7 **Swaps not yet in an export.** ShiftSwap applies its own approved swaps on top of the export
when it checks a later request. A request that involves an employee or a shift in another request
that is still undecided cannot be determined until that request is decided.

3.8 **Testing with the sample.** The local environment sets the application clock to
`2027-03-07T14:00:00Z`, which is 08:00 site time on the morning of the sample's export.

## 4. Scheduler entry — Hannah Beaulieu and Dana Whitlock

4.1 **Who enters.** Hannah enters approved swaps in the scheduling system. There is no integration
for the pilot. The supervisor of the unit whose swapped shift starts first is responsible for
making sure Hannah has the swap. ShiftSwap's list of approved swaps awaiting entry is what both of
them work from.

4.2 **Confirmation.** Entry is confirmed when a later export shows both shifts against the swapped
operators. That is the next day at the earliest.

4.3 **The measure.** Whether swaps reached the scheduler in time is judged by payroll's review, as
it was for the tally. Gloria Menard runs that review. ShiftSwap's list is supporting information.

## 5. IT decisions — Marcus Ellery

5.1 **Tier.** ShiftSwap is a Tier 3 application under VE-IT-STD-007 § 6.

5.2 **Where the pilot runs.** On the Tier 3 production platform, behind the site access gateway.
IT provisions it; that is not part of the build. There is still no staging environment. Until the
platform is provisioned, verification is done in the local environment.

5.3 **Peak request rate.** For the performance requirement in VE-IT-STD-007 § 5, the peak request
rate for ShiftSwap is **2 requests per second**.

5.4 **Field tablets.** Marcus agrees that the tablet requirement (NFR-COMPAT-002) should be waived
for the pilot and will sign a waiver with the Business Engineer at feature sign-off, on these
terms. Rationale: the pilot is used from control-room desktops only. Residual risk: the
application is unverified on tablets and must not be used outside the control rooms. Owner: Marcus
Ellery. Revisit: before any use outside the control rooms, or at the end-of-pilot decision,
whichever comes first. This note is not the waiver.

5.5 **Auditors.** The gateway has no auditor role. For the pilot, decision records are visible to
the `shift-supervisor` role only, and auditors receive extracts from IT on request.

5.6 **Retention.** Marcus will add a standing record for the three-year retention of decision
records at the register's next revision. Until then the requirement is met by never deleting a
decision record. No purge is to be built.
