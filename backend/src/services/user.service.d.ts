import { User, CreateUserInput, UpdateUserInput } from "./types";
/**
 * Create a new user
 */
export declare const createUser: (userData: CreateUserInput) => Promise<User>;
/**
 * Get user by ID
 */
export declare const getUserById: (id: number | string) => Promise<User>;
/**
 * Get user by email
 */
export declare const getUserByEmail: (email: string) => Promise<User>;
/**
 * Update user
 */
export declare const updateUser: (id: number | string, userData: UpdateUserInput) => Promise<User>;
/**
 * Delete user (soft delete)
 */
export declare const deleteUser: (id: number | string) => Promise<void>;
/**
 * List users with filtering and pagination
 */
export declare const listUsers: (params: any) => Promise<{
    users: Record<string, unknown>[];
    total: number;
}>;
/**
 * Import multiple users (for bulk operations)
 */
export declare const importUsers: (usersData: CreateUserInput[]) => Promise<{
    successful: number;
    failed: number;
    errors: any[];
}>;
//# sourceMappingURL=user.service.d.ts.map