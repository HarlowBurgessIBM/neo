import { defineConfig } from "vitest/config";

// One project per workspace. Run one layer with: npm test -- --project rules|api|web
export default defineConfig({
  test: {
    projects: ["packages/*", "apps/*"],
  },
});
