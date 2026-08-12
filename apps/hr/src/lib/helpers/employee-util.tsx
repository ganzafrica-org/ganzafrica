import { Badge } from "@/components/ui/badge";
import type { EmployeeLifecycleStatus } from "@/types/api";

export const getStatusBadge = (status: EmployeeLifecycleStatus | string) => {
  switch (status) {
    case "onboarding":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Onboarding</Badge>;
    case "active":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "on_leave":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">On Leave</Badge>;
    case "offboarding":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Offboarding</Badge>;
    case "exited":
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Exited</Badge>;
    default:
      return <Badge variant="outline">{status ?? "—"}</Badge>;
  }
};

/** Mirrors backend/src/services/hr/employees-core.service.ts's buildInitials — same fallback rules for Unicode/missing names. */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName ?? "").trim().split(/\s+/).filter(Boolean)[0]?.[0] ?? "";
  const last = (lastName ?? "").trim().split(/\s+/).filter(Boolean)[0]?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "NA";
}

/** Same rule, for call sites that only have a combined display name (e.g. "Ada Lovelace"). */
export function getInitialsFromName(fullName?: string | null): string {
  const [first, last] = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  return getInitials(first, last);
}
