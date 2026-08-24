import { Badge } from "@/components/ui/badge";
import type { EmployeeLifecycleStatus } from "@/types/api";

export const getStatusBadge = (status: EmployeeLifecycleStatus | string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Pending</Badge>;
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

/** Free-text country names (as entered on the employee's own profile) mapped to ISO 3166-1 alpha-2. */
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  rwanda: "RW",
  kenya: "KE",
  uganda: "UG",
  tanzania: "TZ",
  burundi: "BI",
  "democratic republic of congo": "CD",
  drc: "CD",
  "republic of congo": "CG",
  congo: "CG",
  "south sudan": "SS",
  sudan: "SD",
  ethiopia: "ET",
  somalia: "SO",
  nigeria: "NG",
  ghana: "GH",
  "south africa": "ZA",
  egypt: "EG",
  morocco: "MA",
  senegal: "SN",
  zambia: "ZM",
  zimbabwe: "ZW",
  malawi: "MW",
  mozambique: "MZ",
  "united kingdom": "GB",
  uk: "GB",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  canada: "CA",
  france: "FR",
  germany: "DE",
  belgium: "BE",
  netherlands: "NL",
  india: "IN",
  china: "CN",
  "united arab emirates": "AE",
};

/** Regional-indicator flag emoji from an ISO 3166-1 alpha-2 code, e.g. "RW" -> 🇷🇼. */
function codeToFlagEmoji(code: string): string {
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/**
 * Employees have a real free-text country field (home_country, set from the employee's own
 * profile) — this is the source of truth for the directory/sheet flag, not the contract currency
 * (many currencies like USD/EUR aren't tied to one country). Unrecognized/unlisted country names
 * still show a neutral globe rather than nothing, so a typo doesn't just disappear.
 */
export function countryToFlag(country?: string | null): { flag: string; label: string } | null {
  if (!country) return null;
  const code = COUNTRY_NAME_TO_CODE[country.trim().toLowerCase()];
  if (code) return { flag: codeToFlagEmoji(code), label: country };
  return { flag: "🌍", label: country };
}
