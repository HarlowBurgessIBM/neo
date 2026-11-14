import fc from "fast-check";
import { expect, test } from "vitest";
import { POLICY_REVISION } from "./index";

// Toolchain smoke tests. Replace them when the rules engine lands.

test("exposes the policy revision", () => {
  expect(POLICY_REVISION).toBe("VE-HSSE-STD-014 rev 3");
});

test("fast-check is wired for property tests", () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a));
});
