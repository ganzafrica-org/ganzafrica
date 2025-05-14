"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleValidation = exports.removeRoleSchema = exports.assignRoleSchema = exports.getUserRolesSchema = exports.deleteRoleSchema = exports.updateRoleSchema = exports.getRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new role
exports.createRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Role name must be at least 2 characters long")
            .max(100, "Role name must be at most 100 characters long"),
        description: zod_1.z.string().optional(),
    }),
});
// Schema for getting a role by ID
exports.getRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for updating a role
exports.updateRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(2, "Role name must be at least 2 characters long")
            .max(100, "Role name must be at most 100 characters long")
            .optional(),
        description: zod_1.z.string().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a role
exports.deleteRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for getting user roles
exports.getUserRolesSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "User ID must be a number",
        }),
    }),
});
// Schema for assigning role to user
exports.assignRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "User ID must be a number",
        }),
        roleId: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "Role ID must be a number",
        }),
    }),
});
// Schema for removing role from user
exports.removeRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "User ID must be a number",
        }),
        roleId: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "Role ID must be a number",
        }),
    }),
});
// Export all role validation schemas
exports.roleValidation = {
    createRoleSchema: exports.createRoleSchema,
    getRoleSchema: exports.getRoleSchema,
    updateRoleSchema: exports.updateRoleSchema,
    deleteRoleSchema: exports.deleteRoleSchema,
    getUserRolesSchema: exports.getUserRolesSchema,
    assignRoleSchema: exports.assignRoleSchema,
    removeRoleSchema: exports.removeRoleSchema,
};
exports.default = exports.roleValidation;
