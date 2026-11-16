// Presenter tool — NOT part of the seed. Keep it out of the demo repo so no agent reads it.
// Independently evaluates the scripted swap cases against the fixture, following
// seed/docs/standards/fatigue-management-policy.md §§ 3–4, and prints the answer key.
// Usage: node tools/reference-check.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const roster = JSON.parse(
  readFileSync(fileURLToPath(new URL("../seed/data/roster.sample.json", import.meta.url)), "utf8"),
);
const TZ = roster.site.timeZone;
const HOUR = 3_600_000;

// --- site-local wall clock -> instant -------------------------------------------------
const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, hourCycle: "h23",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
});
function offsetAt(ms) {
  const p = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
}
function toInstant(local) {
  const [d, t] = local.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, day, h, min);
  let ms = wall - offsetAt(wall);
  ms = wall - offsetAt(ms);
  return ms;
}
const dayNumber = (local) => Math.round(Date.parse(local.slice(0, 10) + "T00:00:00Z") / (24 * HOUR));

// --- policy --------------------------------------------------------------------------
const MIN_REST_H = 11, REVIEW_REST_H = 12, MAX_7DAY_H = 72, REVIEW_7DAY_H = 60;

function evaluateEmployee(employeeNumber, shifts, receivedShiftId) {
  const op = roster.operators.find((o) => o.employeeNumber === employeeNumber);
  const mine = shifts
    .filter((s) => s.employeeNumber === employeeNumber)
    .map((s) => ({ ...s, startMs: toInstant(s.start), endMs: toInstant(s.end) }))
    .sort((a, b) => a.startMs - b.startMs);
  const findings = [];

  // § 3.3 qualification for the shift received
  const received = mine.find((s) => s.shiftId === receivedShiftId);
  const qual = op.qualifications.find((x) => x.unit === received.unit && x.role === received.role);
  if (!qual) findings.push({ rule: "3.3", level: "BLOCK", detail: `no ${received.unit} ${received.role} qualification` });
  else if (qual.validThrough < received.start.slice(0, 10))
    findings.push({ rule: "3.3", level: "BLOCK", detail: `${received.unit} ${received.role} qualification expired ${qual.validThrough}` });

  // § 3.1 off-duty period (elapsed)
  let minRest = Infinity;
  for (let i = 1; i < mine.length; i += 1) {
    const rest = (mine[i].startMs - mine[i - 1].endMs) / HOUR;
    if (rest < minRest) minRest = rest;
    if (rest < MIN_REST_H)
      findings.push({ rule: "3.1", level: "BLOCK", detail: `${rest}h off duty between ${mine[i - 1].shiftId} and ${mine[i].shiftId}` });
    else if (rest < REVIEW_REST_H)
      findings.push({ rule: "4.2(a)", level: "REVIEW", detail: `${rest}h off duty between ${mine[i - 1].shiftId} and ${mine[i].shiftId}` });
  }

  // § 3.2 scheduled hours in any 7 consecutive calendar days (by shift start date, elapsed hours)
  let maxHours = 0, maxFrom = null;
  for (const anchor of mine) {
    const from = dayNumber(anchor.start);
    const hours = mine
      .filter((s) => dayNumber(s.start) >= from && dayNumber(s.start) <= from + 6)
      .reduce((sum, s) => sum + (s.endMs - s.startMs) / HOUR, 0);
    if (hours > maxHours) { maxHours = hours; maxFrom = anchor.start.slice(0, 10); }
  }
  if (maxHours > MAX_7DAY_H) findings.push({ rule: "3.2", level: "BLOCK", detail: `${maxHours}h in the 7 days from ${maxFrom}` });
  else if (maxHours > REVIEW_7DAY_H) findings.push({ rule: "4.2(b)", level: "REVIEW", detail: `${maxHours}h in the 7 days from ${maxFrom}` });

  return { name: op.name, minRest, maxHours, findings };
}

// Pilot kickoff decisions § 3: the local verification clock, the 26-hour currency limit, and
// the rule that every seven-day window around a swapped shift must lie inside the export.
const LOCAL_CLOCK = "2027-03-07T14:00:00Z";
const MAX_EXPORT_AGE_H = 26;

function cannotDetermine(give, take, now) {
  const reasons = [];
  const ageH = (Date.parse(now) - Date.parse(roster.exportedAt)) / HOUR;
  if (ageH > MAX_EXPORT_AGE_H) reasons.push(`roster export is ${ageH}h old (limit ${MAX_EXPORT_AGE_H}h)`);
  const from = dayNumber(roster.coverage.from), to = dayNumber(roster.coverage.to);
  for (const s of [give, take]) {
    const d = dayNumber(s.start);
    if (d - 6 < from || d + 6 > to)
      reasons.push(`seven-day windows around ${s.shiftId} extend outside export coverage ${roster.coverage.from}..${roster.coverage.to}`);
  }
  return reasons;
}

function evaluateSwap(requesterGives, requesterTakes, now = LOCAL_CLOCK) {
  const give = roster.shifts.find((s) => s.shiftId === requesterGives);
  const take = roster.shifts.find((s) => s.shiftId === requesterTakes);
  if (!give || !take) throw new Error(`unknown shift in ${requesterGives} / ${requesterTakes}`);
  const blockers = cannotDetermine(give, take, now);
  if (blockers.length) {
    const name = (n) => roster.operators.find((o) => o.employeeNumber === n).name;
    return {
      requester: { name: name(give.employeeNumber) }, counterpart: { name: name(take.employeeNumber) },
      outcome: "CANNOT DETERMINE", findings: blockers.map((detail) => ({ level: "UNKNOWN", rule: "B3", who: "data", detail })),
    };
  }
  const requester = give.employeeNumber, counterpart = take.employeeNumber;
  const after = roster.shifts.map((s) =>
    s.shiftId === give.shiftId ? { ...s, employeeNumber: counterpart }
    : s.shiftId === take.shiftId ? { ...s, employeeNumber: requester } : s);
  const r = evaluateEmployee(requester, after, take.shiftId);
  const c = evaluateEmployee(counterpart, after, give.shiftId);
  const all = [...r.findings.map((f) => ({ ...f, who: r.name })), ...c.findings.map((f) => ({ ...f, who: c.name }))];
  const outcome = all.some((f) => f.level === "BLOCK") ? "BLOCKED" : all.length ? "NEEDS REVIEW" : "AUTO-APPROVED";
  return { requester: r, counterpart: c, outcome, findings: all };
}

// --- baseline: the published roster itself must be clean -------------------------------
let baselineIssues = 0;
for (const op of roster.operators) {
  const first = roster.shifts.find((s) => s.employeeNumber === op.employeeNumber);
  const res = evaluateEmployee(op.employeeNumber, roster.shifts, first.shiftId);
  const hard = res.findings.filter((f) => f.level === "BLOCK" && f.rule !== "3.3");
  const soft = res.findings.filter((f) => f.level === "REVIEW");
  console.log(`baseline  ${op.name.padEnd(16)} min rest ${String(res.minRest).padStart(4)}h  max 7-day ${String(res.maxHours).padStart(3)}h  ${[...hard, ...soft].map((f) => `${f.level} ${f.rule}`).join(", ") || "clean"}`);
  baselineIssues += hard.length;
}
if (baselineIssues) { console.error("baseline roster has hard violations"); process.exit(1); }

// --- scripted cases ------------------------------------------------------------------
const cases = [
  ["C1", "CDU-CON1-0318-N", "CDU-CON1-0319-N", "AUTO-APPROVED", "like-for-like night swap, ample rest and hours"],
  ["C2", "HCU-CON2-0312-N", "HCU-CON1-0310-D", "NEEDS REVIEW", "quick turn across units: exactly 11h off duty"],
  ["C3", "CDU-CON1-0310-D", "CDU-CON1-0312-D", "BLOCKED", "counterpart would come straight off a night shift (0h)"],
  ["C4", "CDU-CON1-0310-D", "HCU-CON1-0314-D", "BLOCKED", "clock-change night: 11h on the wall clock, 10h elapsed"],
  ["C5", "CDU-FLD1-0309-D", "CDU-FLD1-0318-D", "BLOCKED", "seventh shift in seven days: 84h"],
  ["C6", "CDU-CON2-0308-D", "HCU-CON1-0317-D", "NEEDS REVIEW", "sixth shift in seven days: 72h"],
  ["C7", "HCU-CON1-0308-D", "HCU-CON1-0317-D", "BLOCKED", "qualification expired two days before the shift"],
  ["C8", "CDU-CON1-0312-D", "HCU-CON2-0312-N", "BLOCKED", "requester has never held the qualification"],
  ["C9", "CDU-CON1-0318-N", "CDU-CON1-0326-D", "CANNOT DETERMINE", "shift too close to the end of the export for its seven-day windows"],
  ["C10", "CDU-CON1-0318-N", "CDU-CON1-0319-N", "CANNOT DETERMINE", "same swap as C1, asked 28 hours after the export", "2027-03-08T12:00:00Z"],
];

let failed = 0;
console.log("");
for (const [id, gives, takes, expected, why, now] of cases) {
  const res = evaluateSwap(gives, takes, now);
  const ok = res.outcome === expected;
  if (!ok) failed += 1;
  console.log(`${id.padEnd(3)} ${ok ? "ok      " : "MISMATCH"} ${res.outcome.padEnd(16)} ${res.requester.name} gives ${gives}, takes ${takes} from ${res.counterpart.name}`);
  console.log(`      intent: ${why}`);
  for (const f of res.findings) console.log(`      ${f.level.padEnd(6)} § ${f.rule.padEnd(6)} ${f.who}: ${f.detail}`);
}
process.exit(failed ? 1 : 0);
