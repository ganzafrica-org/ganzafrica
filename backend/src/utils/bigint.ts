/**
 * Returns a number if the input can be safely represented as an integer
 */
export function toDbId(id: string | number | bigint | undefined | null): string | number | undefined {
    if (id === undefined || id === null) {
        return undefined;
    }

    // If it's already a number, return it directly
    if (typeof id === 'number' && Number.isInteger(id)) {
        return id;
    }

    // For string or bigint, convert to string first
    const strId = id.toString();
    
    // Try to convert to integer if possible
    const numId = Number(strId);
    if (Number.isInteger(numId) && !Number.isNaN(numId) && String(numId) === strId) {
        return numId;
    }

    // Otherwise return as string to maintain precision
    return strId;
}

/**
 * Convert a database ID to a string or number for API responses
 */
export function toApiId(id: string | number | bigint | null | undefined): string | number | null {
    if (id === null || id === undefined) {
        return null;
    }

    // If it's already a number, return it directly
    if (typeof id === 'number' && Number.isInteger(id)) {
        return id;
    }

    // For string or bigint, convert to string first
    const strId = id.toString();
    
    // Try to convert to integer if possible
    const numId = Number(strId);
    if (Number.isInteger(numId) && !Number.isNaN(numId) && String(numId) === strId) {
        return numId;
    }

    // Otherwise return as string
    return strId;
}

/**
 * Convert an array of database IDs to API format (strings or numbers)
 */
export function toApiIdArray(ids: (string | number | bigint)[]): (string | number)[] {
    return ids.map(id => {
        // If it's already a number, return it directly
        if (typeof id === 'number' && Number.isInteger(id)) {
            return id;
        }

        // For string or bigint, convert to string first
        const strId = id.toString();
        
        // Try to convert to integer if possible
        const numId = Number(strId);
        if (Number.isInteger(numId) && !Number.isNaN(numId) && String(numId) === strId) {
            return numId;
        }

        // Otherwise return as string
        return strId;
    });
}