export const clarityHeadlineLines = ["Catch What Your", "Pull Request Missed."] as const;
export const clarityHeadline = clarityHeadlineLines.join(" ");
export const clarityDescription = "NodeDots checks every pull request against your whole codebase and flags what it breaks, forgets, or leaves untested, before you merge.";
export const clarityTitle = "NodeDots: Catch What Your Pull Request Missed";
export const clarityTrust = "Early access. One email when it opens.";
export const scenarioCaptions: Record<string, string> = {
  auth: "In this example, a developer replaces Firebase Auth with Clerk. NodeDots finds the one place that still uses the old ID.",
  deletion: "In this example, a developer adds account deletion. NodeDots finds the billing, uploaded files, and sessions left behind.",
  roles: "In this example, a developer adds team roles. NodeDots finds an outdated selector, missing permission tests, and a migration that needs a backfill.",
};
