import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { App } from "./App";
import { wcagViolations } from "./axe";

// Toolchain smoke tests. Replace them when the first real view lands.

test("renders the application heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "ShiftSwap" })).toBeTruthy();
});

test("the skeleton view has no axe-core WCAG A/AA violations", async () => {
  const { container } = render(<App />);
  expect(await wcagViolations(container)).toEqual([]);
});
