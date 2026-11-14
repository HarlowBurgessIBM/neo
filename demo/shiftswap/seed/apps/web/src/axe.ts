import axe from "axe-core";

/**
 * The automated accessibility check named by VE-IT-STD-007 § 4.2: run axe-core
 * against a rendered view, limited to the WCAG A/AA rule tags, and return the
 * violations. A view passes when the returned array is empty.
 */
export const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export async function wcagViolations(node: Element) {
  const results = await axe.run(node, {
    runOnly: { type: "tag", values: WCAG_AA_TAGS },
  });
  return results.violations;
}
