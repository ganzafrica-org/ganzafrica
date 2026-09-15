// HR/admin's settings quick-access grid. "Roles and permissions", "Billing, payments &
// balances", "Entities", "Groups", and "Expenses & adjustments" were removed — none had a real
// backend behind them (Billing/Entities/Groups/Expenses had no page at all; Roles was a fully
// static mock disconnected from the real RBAC system, which lives in Settings > Roles is not
// this — see backend/scripts/seed-rbac.ts).
export const quick_access_items = [
  {
    icon: "✓",
    title: "Approval policies",
    description: "Manage and customize approval policies",
    path: "/settings/policies",
  },
  {
    icon: "⏰",
    title: "Time off",
    description: "Manage your organization's policies for holidays, illness and other time off",
    path: "/settings/leave",
  },
  {
    icon: "📊",
    title: "Onboarding settings",
    description:
      "Visualize the steps your workers need to take when onboarding to your organization",
    path: "/settings/onboarding-templates",
  },
  {
    icon: "✍️",
    title: "Document signing",
    description: "Configure how contracts and documents are routed for signature",
    path: "/settings/signing",
  },
];
