/**
 * Utility functions for handling BigInt conversions
 *
 * These functions help to work around Drizzle ORM's compatibility issues with BigInt
 */

/**
 * Convert a BigInt, string ID, or number to a number for Drizzle ORM compatibility
 */
export function toDbId(id: string | number | bigint | undefined | null): number | undefined {
    if (id === undefined || id === null) {
        return undefined;
    }

    if (typeof id === 'bigint') {
        return Number(id);
    }

    if (typeof id === 'string') {
        return parseInt(id, 10);
    }

    return id;
}

/**
 * Convert a database ID (number) to a string for API responses
 */
export function toApiId(id: number | bigint | null | undefined): string | null {
    if (id === null || id === undefined) {
        return null;
    }

    return id.toString();
}

/**
 * Convert an array of database IDs to API format (strings)
 */
export function toApiIdArray(ids: (number | bigint)[]): string[] {
    return ids.map(id => id.toString());
}