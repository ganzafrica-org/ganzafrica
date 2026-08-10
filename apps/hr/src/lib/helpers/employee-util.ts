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
