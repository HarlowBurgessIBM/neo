---
name: neo-typescript-conventions
description: Use when writing or reviewing TypeScript source — .ts, .tsx, .mts or .cts files, tsconfig.json, or code compiled under strict options (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, verbatimModuleSyntax). Covers narrowing data that crosses a boundary (JSON, HTTP bodies, files, environment variables), strict-option pitfalls, exhaustive handling of unions, and date, time zone and duration arithmetic. Implementation and review phase; see neo-typescript-testing for tests.
---

# TypeScript conventions

Stack-level rules for writing and reviewing TypeScript. The consuming repository's `AGENTS.md`
owns its layout, commands and project conventions, and wins where the two disagree.

These rules come from what code review sent back on real runs. Most of those findings were one
defect: data from outside the program was trusted because a type said so.

## 1. Data that crosses a boundary is `unknown`

A TypeScript type is a claim the compiler cannot check at run time. Anything that arrives from
outside the module's own code is `unknown` until a function has checked it:

- `JSON.parse(...)` and `response.json()`, which both return `any`;
- HTTP request bodies, query strings and headers;
- files, environment variables, command-line arguments;
- browser storage and messages from another window or worker.

An HTTP response is a boundary **even when the same team wrote the server**. The client and the
server are built and deployed separately, and they drift.

Write a guard that proves the shape, and use its result. Do not cast.

```ts
interface Finding {
  rule: "3.1" | "3.2" | "3.3";
  hours: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFinding(value: unknown): Finding | undefined {
  if (!isRecord(value)) return undefined;
  const { rule, hours } = value;
  if (rule !== "3.1" && rule !== "3.2" && rule !== "3.3") return undefined;
  if (typeof hours !== "number" || !Number.isFinite(hours) || hours < 0) return undefined;
  return { rule, hours };
}

const body: unknown = JSON.parse(text);
const finding = parseFinding(body);
if (finding === undefined) {
  // Show or return an explicit "unrecognised response". Never render a guess.
}
```

What a guard must check, beyond the type:

- **Numbers:** finite, and an integer or non-negative where the meaning requires it. `NaN`
  passes `typeof x === "number"`.
- **Unions:** every allowed member, by name. An unknown member is an error, not a default.
- **Combinations:** fields that contradict each other (an "approved" outcome that also carries
  failures) are rejected.
- **Arrays:** every element, not just that it is an array.

Reject bad data; do not repair it. A guard returns the typed value or a failure the caller must
handle. If the project already uses a schema library, use that instead of hand-written guards.

`as` is for the cases the compiler cannot express, such as `as const`. `value as Thing` on data
from outside is a review blocker.

## 2. Strict options change how code is written

Read `tsconfig.json` before writing. Under these options, the usual shortcuts do not compile, and
the right fix is to narrow the value, not to silence the compiler.

| Option | What changes | Write this |
| --- | --- | --- |
| `noUncheckedIndexedAccess` | `items[i]` and `record[key]` are `T \| undefined` | Narrow before use: `const first = items[0]; if (first === undefined) return …`. Prefer `for … of` and destructuring with a check |
| `exactOptionalPropertyTypes` | `{ note?: string }` does not accept `note: undefined` | Leave the key out: `{ ...base, ...(note !== undefined ? { note } : {}) }` |
| `verbatimModuleSyntax` | A type-only import must say so | `import type { Shift } from "./types"` or `import { type Shift, parse } from "./types"` |
| `strict` (`useUnknownInCatchVariables`) | `catch (error)` is `unknown` | `error instanceof Error ? error.message : String(error)` |

Never use `any`, `// @ts-ignore`, `// @ts-expect-error` without a reason on the same line, or a
non-null `!` on a value that can be absent. Each one turns a compile-time failure into a
run-time one.

Use `satisfies` to check a literal against a type without widening it:

```ts
const limits = { minRestHours: 11, maxWindowHours: 72 } satisfies Record<string, number>;
```

## 3. Model alternatives as a discriminated union

When a value is one of several shapes, give every shape a literal tag, and handle them with a
`switch` that fails to compile when a shape is added.

```ts
type Result =
  | { outcome: "approved" }
  | { outcome: "refused"; reasons: string[] }
  | { outcome: "unknown"; missing: string };

function describe(result: Result): string {
  switch (result.outcome) {
    case "approved":
      return "Approved";
    case "refused":
      return `Refused: ${result.reasons.join(", ")}`;
    case "unknown":
      return `Cannot determine: ${result.missing}`;
    default: {
      const unreachable: never = result;
      return unreachable;
    }
  }
}
```

Do not model alternatives with optional fields or pairs of booleans. They allow combinations
that mean nothing, and section 1 then has to reject them at run time.

Use a union for failures the caller is expected to handle. Throw only for bugs and for
conditions nothing can recover from.

## 4. Dates, time zones and durations

Keep three things apart:

| Thing | What it is | Represent it as |
| --- | --- | --- |
| **Instant** | A point on the timeline | A `Date`, or milliseconds since the epoch |
| **Local date-time** | A wall-clock reading with no zone, e.g. `2027-03-14T05:00` | A string, with the zone carried beside it |
| **Calendar date** | A day in some zone, e.g. `2027-03-14` | A string |

Rules:

- **Durations are computed on instants.** Subtracting two wall-clock readings is wrong on any
  day the clocks change.
- **Never pass a local date-time to `new Date(...)` or `Date.parse(...)`.** An ISO string with
  no offset is read in the time zone of the machine running the code, so the answer changes
  between a laptop and a server. Parse only strings that end in `Z` or carry an offset.
- **Validate the format yourself.** `Date.parse` accepts many strings. Match the exact shape
  first, then check the result is not `NaN`.
- **Calendar-date arithmetic is done on dates,** not by adding 24-hour blocks to an instant.
  A calendar day is 23 or 25 hours long twice a year.
- **Pass the current time in.** Logic takes `now` as an argument. Only the outermost layer
  reads the clock.

Converting a local date-time in a named zone to an instant, with no library:

```ts
/** Milliseconds to add to an instant to get the zone's wall-clock reading at that instant. */
function offsetAt(instantMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instantMs));
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);
  const wall = Date.UTC(
    get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"),
  );
  return wall - instantMs;
}

/**
 * Every instant at which the zone's clocks show this reading, earliest first.
 * One instant normally; none for a reading the clocks skip; two for a reading they repeat.
 */
function instantsOf(
  year: number, month: number, day: number, hour: number, minute: number, timeZone: string,
): number[] {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const dayMs = 24 * 60 * 60 * 1000;
  const candidates = new Set([offsetAt(wall - dayMs, timeZone), offsetAt(wall + dayMs, timeZone)]);
  return [...candidates]
    .map((offset) => wall - offset)
    .filter((instant) => instant + offsetAt(instant, timeZone) === wall)
    .sort((a, b) => a - b);
}
```

Two readings need a decision, and the code must make it on purpose:

- **A reading that does not exist** (the hour skipped when clocks go forward). `instantsOf`
  returns an empty array. Treat it as invalid input unless the project says otherwise.
- **A reading that happens twice** (the hour repeated when clocks go back). `instantsOf`
  returns two instants. Do not pick one silently: apply the project's rule, or treat the
  reading as ambiguous input.

`Intl.DateTimeFormat` throws a `RangeError` for an unknown zone name. Catch it at the boundary
and treat the zone as invalid input.

If the runtime provides `Temporal`, prefer it to the code above. Check that it exists in the
project's supported runtimes first, and do not add a polyfill or a date library without the
project's agreement.

## 5. Review checklist

A reviewer checks the change against this list and reports each miss as a finding.

- Data from outside is typed `unknown` and narrowed by a guard or schema. No cast stands in for
  a check.
- Guards check number ranges, every union member, every array element, and contradictory
  combinations.
- No `any`, `@ts-ignore`, or non-null `!` was added. Indexed access is narrowed.
- A `switch` over a union has a `never` default. A new union member breaks the build.
- No duration is computed from wall-clock readings. No local date-time reaches `new Date` or
  `Date.parse`.
- Logic takes the current time as an argument and does not read the clock.
- Type-only imports use `import type`.
