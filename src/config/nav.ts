export type NavStatus = "live" | "planned" | "tba";
export type NavIcon = "code" | "report" | "check" | "terminal" | "memory" | "test" | "auth" | "database" | "api" | "graph" | "book" | "roadmap" | "history" | "article" | "question" | "shield" | "contact" | "info" | "price" | "x";
export type NavGroupId = "product" | "use-cases" | "resources" | "company";
export type NavItem = { id: string; label: string; href: string; description: string; icon: NavIcon; status: NavStatus; group: NavGroupId; category?: string; liveSoon?: boolean };
export type NavGroup = { id: NavGroupId; label: string; items: readonly NavItem[] };
const item = (id: string, label: string, href: string, description: string, icon: NavIcon, status: NavStatus, group: NavGroupId, category?: string, liveSoon = false): NavItem => ({ id, label, href, description, icon, status, group, category, liveSoon });

export const productItems = [
  item("code", "NodeDots Code", "/#hero-title", "Impact reports on every GitHub pull request.", "code", "live", "product", undefined, true),
  item("impact-reports", "Pull request impact reports", "/#how-it-works", "What a change touches, misses, or breaks.", "report", "live", "product", undefined, true),
  item("ai-verification", "AI code verification", "/#preview", "Check what a coding agent forgot.", "check", "live", "product", undefined, true),
  item("pre-flight-cli", "Pre-flight CLI", "/product/pre-flight-cli", "Local checks before you push. Source preview.", "terminal", "live", "product"),
  item("software-memory", "Software memory", "/product/software-memory", "Why does this exist? What changes with it?", "memory", "planned", "product"),
] as const;
export const useCaseItems = [
  item("missed-work", "Catch what a pull request missed", "/#preview", "Review the work around a code change.", "report", "live", "use-cases", "Review and merge", true),
  item("agent-changes", "Verify AI-generated changes", "/#problem-title", "Look for the work a coding agent left behind.", "check", "live", "use-cases", "Review and merge", true),
  item("untested-changes", "Find untested behavior changes", "/#preview", "Review missing tests before merging.", "test", "live", "use-cases", "Review and merge", true),
  item("auth-migration", "Switch auth providers (Firebase to Clerk)", "/#auth-example", "Follow a new identity into billing and tests.", "auth", "live", "use-cases", "Migrate safely", true),
  item("database-migration", "Change database schemas and migrations", "/#migration-example", "Review schema assumptions and missing backfills.", "database", "live", "use-cases", "Migrate safely", true),
  item("api-contracts", "Update API contracts without drift", "/#api-example", "Check assumptions between routes and callers.", "api", "live", "use-cases", "Migrate safely", true),
  item("why-this-file", "Why does this file exist?", "/product/why-this-file", "Explore the purpose and history of a file.", "memory", "planned", "use-cases", "Understand your system"),
  item("dependencies", "See what depends on this", "/#how-it-works", "Review affected code and its evidence.", "graph", "live", "use-cases", "Understand your system", true),
  item("architecture-drift", "Spot architecture drift", "/product/architecture-drift", "Explore changes that move away from the intended architecture.", "graph", "planned", "use-cases", "Understand your system"),
] as const;
export const resourceItems = [
  item("docs", "Docs", "/doc", "Connect GitHub, review changes, and prepare releases.", "book", "live", "resources"),
  item("roadmap", "Roadmap", "/vision", "What's next for NodeDots.", "roadmap", "live", "resources"),
  item("changelog", "Changelog", "/resources/changelog", "Public release notes are to be announced.", "history", "tba", "resources"),
  item("blog", "Blog", "/resources/blog", "Product stories and practical examples are to be announced.", "article", "tba", "resources"),
  item("faq", "FAQ", "/#faq", "Answers about the product and early access.", "question", "live", "resources"),
  item("security", "Security and data handling", "/security", "Current repository access, data handling, and reporting guidance.", "shield", "live", "resources"),
  item("contact", "Contact", "/contact", "Find NodeDots and join the conversation.", "contact", "live", "resources"),
] as const;
export const companyItems = [
  item("about", "About", "/about", "What NodeDots is building and who it is for.", "info", "live", "company"),
  { ...resourceItems[6], group: "company" as const },
  item("privacy", "Privacy", "/privacy", "Waitlist, GitHub account, and repository data handling.", "shield", "live", "company"),
  item("legal", "Legal & trust", "/legal", "Terms, cookies, security, and analysis disclosures.", "shield", "live", "company"),
] as const;
export const navGroups: readonly NavGroup[] = [
  { id: "product", label: "Product", items: productItems },
  { id: "use-cases", label: "Use cases", items: useCaseItems },
  { id: "resources", label: "Resources", items: resourceItems },
  { id: "company", label: "Company", items: companyItems },
];
export const pricingItem = item("pricing", "Pricing", "/pricing", "Pricing to be announced. Waitlist members get first access.", "price", "tba", "resources");
export const directItems = [resourceItems[0], pricingItem] as const;
export const navActions = {
  example: item("example", "See an example", "/#preview", "Explore an illustrative pull request review.", "report", "live", "product"),
  join: item("join", "Join the waitlist", "/waitlist#join", "Get notified when early access opens.", "contact", "live", "company"),
  roadmap: item("whats-next", "What's next", "/vision", "Explore future directions.", "roadmap", "live", "resources"),
  social: item("x", "Follow the story on X", "https://x.com/nodedots", "@nodedots on X (opens in a new tab)", "x", "live", "company"),
};
export const navText = {
  brand: "NodeDots", home: "NodeDots home", navigation: "Main navigation", footer: "Footer navigation",
  openMenu: "Open navigation", closeMenu: "Close navigation", skip: "Skip to main content",
  planned: "Planned", tba: "TBA", liveSoon: "Live soon", copyright: "NodeDots",
  tagline: "Connect the dots before you act.",
  trademark: "Logos are trademarks of their respective owners. No affiliation or endorsement implied.",
};
export const githubProject = { label: "GitHub", repo: "0x-Sigmoid/nodedots", href: "https://github.com/0x-Sigmoid/nodedots", description: "NodeDots on GitHub (opens in a new tab)" } as const;
export const allNavItems: readonly NavItem[] = [...navGroups.flatMap(group => group.items), ...directItems, ...Object.values(navActions)];
export const comingSoonItems = allNavItems.filter(entry => entry.status !== "live");
export const getNavBadge = (entry: NavItem) => entry.status === "planned" ? navText.planned : entry.status === "tba" ? navText.tba : entry.liveSoon ? navText.liveSoon : null;
