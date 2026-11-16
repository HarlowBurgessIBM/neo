// Presenter tool — NOT part of the seed. Regenerates seed/data/roster.sample.json.
// Usage: node tools/build-roster.mjs
// All people, numbers and shifts are fictional.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PATTERNS = {
  CDU: { D: ["06:00", "18:00"], N: ["18:00", "06:00"] },
  HCU: { D: ["05:00", "17:00"], N: ["17:00", "05:00"] },
};

const operators = [
  { employeeNumber: "104417", name: "Maya Thibodeaux", qualifications: [q("CDU", "CONSOLE", "2028-01-31"), q("HCU", "CONSOLE", "2027-09-30")] },
  { employeeNumber: "102286", name: "Luis Fontenot", qualifications: [q("CDU", "CONSOLE", "2027-12-31"), q("CDU", "FIELD", "2028-06-30")] },
  { employeeNumber: "107903", name: "Priya Raman", qualifications: [q("HCU", "CONSOLE", "2027-03-15"), q("HCU", "FIELD", "2028-04-30")] },
  { employeeNumber: "101152", name: "Dwayne Hebert", qualifications: [q("CDU", "CONSOLE", "2027-11-30"), q("HCU", "CONSOLE", "2028-02-29")] },
  { employeeNumber: "106640", name: "Aisha Okafor", qualifications: [q("HCU", "CONSOLE", "2028-03-31"), q("CDU", "CONSOLE", "2027-10-31")] },
  { employeeNumber: "103078", name: "Tom Broussard", qualifications: [q("CDU", "FIELD", "2028-05-31"), q("HCU", "FIELD", "2027-08-31")] },
  { employeeNumber: "108529", name: "Jerome Guidry", qualifications: [q("CDU", "FIELD", "2028-01-31"), q("CDU", "CONSOLE", "2027-07-31")] },
];

const supervisors = [
  { employeeNumber: "100231", name: "Renee Landry", units: ["CDU"] },
  { employeeNumber: "100764", name: "Carl Nguyen", units: ["HCU"] },
];

// [employeeNumber, unit, role, day-of-March-2027, pattern]
const assignments = [
  // Maya Thibodeaux
  ...days("104417", "CDU", "CONSOLE", "D", [8, 9, 10, 13]),
  ...days("104417", "CDU", "CONSOLE", "N", [16, 17, 18]),
  // Luis Fontenot
  ...days("102286", "CDU", "CONSOLE", "N", [8, 9, 19, 20]),
  ...days("102286", "CDU", "CONSOLE", "D", [12, 15, 16]),
  // Priya Raman
  ...days("107903", "HCU", "CONSOLE", "D", [8, 9, 10]),
  ...days("107903", "HCU", "FIELD", "D", [16, 18]),
  ...days("107903", "HCU", "FIELD", "N", [20]),
  // Dwayne Hebert
  ...days("101152", "HCU", "CONSOLE", "N", [12, 20, 21]),
  ...days("101152", "HCU", "CONSOLE", "D", [14, 15, 16, 17]),
  // Aisha Okafor
  ...days("106640", "CDU", "CONSOLE", "D", [8, 9]),
  ...days("106640", "HCU", "CONSOLE", "N", [12, 18, 19, 20]),
  ...days("106640", "HCU", "CONSOLE", "D", [15, 16]),
  // Tom Broussard
  ...days("103078", "CDU", "FIELD", "D", [9, 10, 15, 16, 17]),
  ...days("103078", "CDU", "FIELD", "N", [19, 20, 21]),
  // Jerome Guidry
  ...days("108529", "CDU", "FIELD", "D", [11, 12, 18]),
  ...days("108529", "CDU", "FIELD", "N", [13]),

  // Lead-in and lead-out weeks. The export covers four calendar weeks, so that every
  // seven-day window around a shift in the two middle weeks is fully inside the data.
  // These are on 1–2 and 26–27 March only, which leaves every scripted outcome unchanged.
  ...days("104417", "CDU", "CONSOLE", "D", [1, 2]),
  ...days("104417", "CDU", "CONSOLE", "N", [26, 27]),
  ...days("102286", "CDU", "CONSOLE", "N", [1]),
  ...days("102286", "CDU", "CONSOLE", "D", [26, 27]),
  ...days("107903", "HCU", "CONSOLE", "D", [1, 2]),
  ...days("107903", "HCU", "FIELD", "D", [26, 27]),
  ...days("101152", "HCU", "CONSOLE", "N", [1, 2]),
  ...days("101152", "HCU", "CONSOLE", "D", [26]),
  ...days("106640", "HCU", "CONSOLE", "D", [2]),
  ...days("106640", "HCU", "CONSOLE", "N", [26, 27]),
  ...days("103078", "CDU", "FIELD", "N", [1]),
  ...days("103078", "CDU", "FIELD", "D", [26, 27]),
  ...days("108529", "CDU", "FIELD", "D", [1, 2]),
  ...days("108529", "CDU", "FIELD", "N", [27]),
];

function q(unit, role, validThrough) {
  return { unit, role, validThrough };
}
function days(employeeNumber, unit, role, pattern, list) {
  return list.map((day) => [employeeNumber, unit, role, day, pattern]);
}
const pad = (n) => String(n).padStart(2, "0");

const taken = new Set();
const shifts = assignments
  .map(([employeeNumber, unit, role, day, pattern]) => {
    const [startTime, endTime] = PATTERNS[unit][pattern];
    const endDay = pattern === "N" ? day + 1 : day;
    let position = 1;
    const idFor = (p) => `${unit}-${role === "CONSOLE" ? "CON" : "FLD"}${p}-03${pad(day)}-${pattern}`;
    while (taken.has(idFor(position))) position += 1;
    const shiftId = idFor(position);
    taken.add(shiftId);
    return {
      shiftId,
      unit,
      role,
      start: `2027-03-${pad(day)}T${startTime}`,
      end: `2027-03-${pad(endDay)}T${endTime}`,
      employeeNumber,
    };
  })
  .sort((a, b) => a.start.localeCompare(b.start) || a.shiftId.localeCompare(b.shiftId));

const roster = {
  _note:
    "FICTIONAL sample of the nightly roster export from the site scheduling system. " +
    "start/end are site-local wall-clock times with no UTC offset; see site.timeZone. " +
    "exportedAt is a UTC instant. coverage is the range of site-local dates the export is " +
    "complete for: an operator with no shift starting on a date in that range is off duty.",
  site: { name: "Port Alder Refinery", timeZone: "America/Chicago" },
  exportedAt: "2027-03-07T08:00:00Z",
  coverage: { from: "2027-03-01", to: "2027-03-28" },
  units: [
    { code: "CDU", name: "Crude Distillation Unit" },
    { code: "HCU", name: "Hydrocracker Unit" },
  ],
  operators,
  supervisors,
  shifts,
};

const out = fileURLToPath(new URL("../seed/data/roster.sample.json", import.meta.url));
writeFileSync(out, JSON.stringify(roster, null, 2) + "\n");
console.log(`wrote ${out}: ${operators.length} operators, ${shifts.length} shifts`);
