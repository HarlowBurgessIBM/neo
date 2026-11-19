---
name: neo-typescript-testing
description: Use when writing or reviewing tests for TypeScript code — .test.ts, .test.tsx, .spec.ts or .spec.tsx files, Vitest configuration, or property-based tests with fast-check. Covers boundary examples, property tests, deterministic time, checking that a test can fail, and response fixtures shared between a server and its client. Test phase; see neo-typescript-conventions for the code under test.
---

# Testing TypeScript

Stack-level rules for writing and reviewing tests with Vitest and fast-check. The consuming
repository's `AGENTS.md` owns the test commands and where tests live.

A task's validation criteria are machine-checkable statements. Each one needs a test that would
fail if the criterion stopped holding.

## 1. Name the test after the criterion

A verifier maps test titles back to criteria. Put the criterion's distinguishing words in the
title: the rule, the subject and the value.

- ✗ `it("works for step 4")`
- ✓ `it("blocks a swap that leaves 10 h off duty across the clock change (§ 3.1)")`

One criterion may need several tests. A test that covers two criteria hides which one broke.

## 2. Test both sides of every limit

For each limit in the criteria, write an example exactly at the limit, one just inside and one
just outside, using the smallest unit the code handles.

```ts
import { describe, expect, it } from "vitest";

describe("minimum off-duty period of 11 h", () => {
  it("passes at exactly 11 h", () => {
    expect(restFinding(11 * 60)).toBeUndefined();
  });
  it("fails at 10 h 59 min", () => {
    expect(restFinding(11 * 60 - 1)).toEqual({ rule: "3.1", minutes: 659 });
  });
});
```

Assert the exact value. `toBeTruthy()` and `toBeDefined()` pass for wrong answers.

## 3. Property tests for rules and parsers

Use fast-check where a statement should hold for every input, alongside the named examples.
Keep the examples: a property does not replace the case the criterion names.

| Kind of property | Use it for | Shape |
| --- | --- | --- |
| Invariant | Limits and classifications | "the result is a failure if and only if the total exceeds the limit" |
| Symmetry | Operations on two parties | "swapping the two inputs gives the same outcome" |
| Round trip | Parsers and formatters | "parse(format(x)) equals x" |
| Never throws | Anything that reads outside data | "for any JSON value, the parser returns a result and does not throw" |
| Model | Arithmetic with a simple slow answer | "the fast function equals the obvious one" |

```ts
import fc from "fast-check";
import { expect, it } from "vitest";

it("is stale if and only if the age exceeds the limit", () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 100 * 3_600_000 }), (ageMs) => {
      expect(isStale(ageMs)).toBe(ageMs > 26 * 3_600_000);
    }),
  );
});

it("never throws on arbitrary input", () => {
  fc.assert(
    fc.property(fc.jsonValue(), (value) => {
      expect(() => parseExport(value)).not.toThrow();
    }),
  );
});
```

Rules for generators:

- **Generate valid inputs directly.** Build a date from generated integers; do not generate
  anything and filter most of it away.
- **Make the boundary likely.** Draw from a range that straddles the limit.
- **Say what the generator cannot produce.** If a property cannot reach a case, cover that case
  with an example and note it.

When a property fails, fast-check prints the smallest failing input, a seed and a path. Add the
failing input as a named example before fixing the code. To replay, pass
`{ seed, path }` as the second argument to `fc.assert`.

## 4. Time is an input

- Pass the current time to the code under test as a fixed instant, written with a `Z`:
  `new Date("2027-03-07T14:00:00Z")`. Do not read the real clock in a test.
- Where the code handles durations or local times, include one case on each side of a clock
  change, and one that spans it.
- Do not use fake timers to test pure date logic. They are for code that schedules work.
- A test that depends on the machine's time zone is a defect. Name the zone in the input.

## 5. Prove the test can fail

A test that cannot fail proves nothing. Before relying on one:

- **Absence needs a positive control.** A test that asserts something is *not* present (no
  personal data in the logs, no extra routes, no writes) must first show that its detector
  finds a planted instance.

  ```ts
  it("finds a planted employee number, then finds none in the real logs", () => {
    expect(personalValuesIn("user 104417 signed in")).toEqual(["104417"]);
    expect(personalValuesIn(capturedLogs)).toEqual([]);
  });
  ```

- **Loops need a count.** A test that asserts inside a loop passes when the loop runs zero
  times. Assert how many cases ran.
- **Filters need a floor.** A filtered run that selects no tests exits successfully.
- **Async needs to be awaited.** Return or `await` every promise, or the assertion runs after
  the test has passed.

## 6. Share response fixtures between server and client

When a server and its client are tested separately, nothing proves they agree. Commit the
server's responses for the named cases as fixture files, and use the same files on both sides:

- the server test asserts that its response **equals** the committed fixture;
- the client test renders or parses **from** the committed fixture.

Neither side imports the other's code. A change to the response shape then fails on one side
until both are updated. Fixtures are produced by the builder, so they prove agreement, not
correctness: the expected figures still come from the criteria.

## 7. Review checklist

A reviewer checks the tests against this list and reports each miss as a finding.

- Every validation criterion has a test whose title names it.
- Each limit has examples at, just inside and just outside it.
- Properties accompany the examples and do not replace them. Any case a generator cannot reach
  has its own example.
- No test reads the real clock or depends on the machine's time zone.
- Every "nothing is present" test has a positive control. Every loop of assertions checks its
  count.
- Assertions compare exact values.
- Server and client tests for the same response use one committed fixture.
