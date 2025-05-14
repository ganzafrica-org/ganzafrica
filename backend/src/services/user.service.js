"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importUsers = exports.listUsers = exports.deleteUser = exports.updateUser = exports.getUserByEmail = exports.getUserById = exports.createUser = void 0;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const auth_service_1 = require("./auth.service");
const email_service_1 = require("../services/email.service");
const auth_service_2 = require("./auth.service");
/**
 * Create a new user
 */
const createUser = async (userData) => {
    // Check if email already exists
    const existingUser = await client_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.email, userData.email),
    });
    if (existingUser) {
        throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }
    if (existingUser) {
        throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }
    // Hash password
    const password_hash = await (0, auth_service_1.hashPassword)(userData.password);
    // Insert user into database
    const [newUser] = await client_1.db
        .insert(schema_1.users)
        .values({
        email: userData.email,
        name: userData.name,
        password_hash,
        role_id: userData.role_id,
        email_verified: userData.email_verified || false,
        avatar_url: userData.avatar_url,
        created_at: new Date(),
        updated_at: new Date(),
    })
        .returning();
    if (!newUser) {
        throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
    // Send verification email if requested and not already verified
    if (userData.sendVerificationEmail && !userData.email_verified) {
        try {
            // Create a verification token (24 hour expiry)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            const token = await (0, auth_service_2.createToken)({
                id: newUser.id.toString(),
                type: "verify_email", // assuming this is the token type for email verification
            }, "24h");
            // Send the verification email
            await (0, email_service_1.sendVerificationEmail)(newUser.email, {
                token,
                expiresAt,
            });
            // Optionally also send a welcome email
            await (0, email_service_1.sendWelcomeEmail)(newUser.email, newUser.name);
        }
        catch (error) {
            console.error("Failed to send verification email:", error);
            // Don't fail the user creation if email sending fails
        }
    }
    return newUser;
};
exports.createUser = createUser;
/**
 * Get user by ID
 */
const getUserById = async (id) => {
    const user = await client_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.id, Number(id)),
    });
    if (!user) {
        throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.NOT_FOUND, 404);
    }
    return user;
};
exports.getUserById = getUserById;
/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
    const user = await client_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
    });
    if (!user) {
        throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.NOT_FOUND, 404);
    }
    return user;
};
exports.getUserByEmail = getUserByEmail;
/**
 * Update user
 */
const updateUser = async (id, userData) => {
    const [updatedUser] = await client_1.db
        .update(schema_1.users)
        .set({
        ...userData,
        // No need to cast role_id as it's now a direct integer
        updated_at: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(id)))
        .returning();
    if (!updatedUser) {
        throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.NOT_FOUND, 404);
    }
    return updatedUser;
};
exports.updateUser = updateUser;
/**
 * Delete user (soft delete)
 */
const deleteUser = async (id) => {
    // Implement as soft delete using is_active field
    const [updatedUser] = await client_1.db
        .update(schema_1.users)
        .set({
        is_active: false,
        updated_at: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(id)))
        .returning();
    if (!updatedUser) {
        throw new middlewares_1.AppError(config_1.constants.ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }
};
exports.deleteUser = deleteUser;
/**
 * List users with filtering and pagination
 */
const listUsers = async (params) => {
    const { page = 1, limit = 10, search, sort_by = "created_at", sort_order = "desc", role_id, is_active, } = params;
    // Build where conditions
    const whereConditions = [];
    if (search) {
        whereConditions.push(`(u.name ILIKE '%${search}%' OR u.email ILIKE '%${search}%')`);
    }
    if (role_id) {
        whereConditions.push(`u.role_id = ${role_id}`);
    }
    if (typeof is_active === "boolean") {
        whereConditions.push(`u.is_active = ${is_active}`);
    }
    // Build where clause
    const whereClause = whereConditions.length
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";
    // Count total matching users
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    console.log("Count query:", countQuery);
    const countResults = await client_1.db.execute(countQuery);
    console.log("Count results:", countResults);
    const total = parseInt(String(countResults.rows?.[0]?.total || "0"), 10);
    // Get paginated users
    const offset = (page - 1) * limit;
    const usersQuery = `
    SELECT u.*, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ${whereClause}
    ORDER BY u.${sort_by} ${sort_order === "asc" ? "ASC" : "DESC"}
    LIMIT ${limit} OFFSET ${offset}
  `;
    console.log("Users query:", usersQuery);
    const usersResults = await client_1.db.execute(usersQuery);
    console.log("Users results structure:", Object.keys(usersResults));
    // Return the users and total
    return {
        users: usersResults.rows || [],
        total,
    };
};
exports.listUsers = listUsers;
/**
 * Import multiple users (for bulk operations)
 */
const importUsers = async (usersData) => {
    const results = {
        successful: 0,
        failed: 0,
        errors: [],
    };
    // Process each user
    for (const userData of usersData) {
        try {
            await (0, exports.createUser)(userData);
            results.successful++;
        }
        catch (error) {
            results.failed++;
            results.errors.push({
                email: userData.email,
                error: error instanceof middlewares_1.AppError ? error.message : "Unknown error",
            });
        }
    }
    return results;
};
exports.importUsers = importUsers;
