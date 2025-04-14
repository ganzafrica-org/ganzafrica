/**
 * Convert a BigInt, string ID, or number to a string for Drizzle ORM compatibility
 */
export function toDbId(
  id: string | number | bigint | undefined | null,
): string | undefined {
  if (id === undefined || id === null) {
    return undefined;
  }

  // Convert to string to maintain precision
  return id.toString();
}

/**
 * Convert a database ID to a string for API responses
 */
export function toApiId(
  id: string | number | bigint | null | undefined,
): string | null {
  if (id === null || id === undefined) {
    return null;
  }

  return id.toString();
}

/**
 * Convert an array of database IDs to API format (strings)
 */
export function toApiIdArray(ids: (string | number | bigint)[]): string[] {
  return ids.map((id) => id.toString());
}
