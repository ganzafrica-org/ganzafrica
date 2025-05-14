"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamTypeValidation = exports.teamValidation = exports.listTeamsSchema = exports.deleteTeamSchema = exports.updateTeamSchema = exports.getTeamSchema = exports.createTeamSchema = exports.deleteTeamTypeSchema = exports.updateTeamTypeSchema = exports.getTeamTypeSchema = exports.createTeamTypeSchema = void 0;
const zod_1 = require("zod");
// Common ID parameter validation
const idParam = zod_1.z.object({
    id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
        message: "ID must be a number",
    }),
});
// Schema for creating a new team type
exports.createTeamTypeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Team type name must be at least 2 characters long")
            .max(100, "Team type name must be at most 100 characters long"),
        description: zod_1.z.string().optional(),
    }),
});
// Schema for getting a team type by ID
exports.getTeamTypeSchema = zod_1.z.object({
    params: idParam,
});
// Schema for updating a team type
exports.updateTeamTypeSchema = zod_1.z.object({
    params: idParam,
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(2, "Team type name must be at least 2 characters long")
            .max(100, "Team type name must be at most 100 characters long")
            .optional(),
        description: zod_1.z.string().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a team type
exports.deleteTeamTypeSchema = zod_1.z.object({
    params: idParam,
});
// Schema for creating a new team
exports.createTeamSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Name must be at least 2 characters long")
            .max(200, "Name must be at most 200 characters long"),
        position: zod_1.z
            .string()
            .max(200, "Position must be at most 200 characters long")
            .optional(),
        photo_url: zod_1.z.string().url("Photo URL must be a valid URL").optional(),
        bio: zod_1.z.string().optional(),
        email: zod_1.z.string().email("Email must be a valid email address").optional(),
        profile_link: zod_1.z.string().url("Profile link must be a valid URL").optional(),
        skills: zod_1.z.array(zod_1.z.string()).optional(),
        team_type_id: zod_1.z.number({
            required_error: "Team type ID is required",
            invalid_type_error: "Team type ID must be a number",
        }),
    }),
});
// Schema for getting a team by ID
exports.getTeamSchema = zod_1.z.object({
    params: idParam,
});
// Schema for updating a team
exports.updateTeamSchema = zod_1.z.object({
    params: idParam,
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(2, "Name must be at least 2 characters long")
            .max(200, "Name must be at most 200 characters long")
            .optional(),
        position: zod_1.z
            .string()
            .max(200, "Position must be at most 200 characters long")
            .optional(),
        photo_url: zod_1.z
            .string()
            .url("Photo URL must be a valid URL")
            .optional()
            .nullable(),
        bio: zod_1.z.string().optional().nullable(),
        email: zod_1.z
            .string()
            .email("Email must be a valid email address")
            .optional()
            .nullable(),
        profile_link: zod_1.z
            .string()
            .url("Profile link must be a valid URL")
            .optional()
            .nullable(),
        skills: zod_1.z.array(zod_1.z.string()).optional().nullable(),
        team_type_id: zod_1.z
            .number({
            invalid_type_error: "Team type ID must be a number",
        })
            .optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a team
exports.deleteTeamSchema = zod_1.z.object({
    params: idParam,
});
// Schema for listing teams with optional team type filter
exports.listTeamsSchema = zod_1.z.object({
    query: zod_1.z.object({
        team_type_id: zod_1.z
            .string()
            .refine((value) => !isNaN(parseInt(value)), {
            message: "Team type ID must be a number",
        })
            .optional(),
    }),
});
// Export all team validation schemas
exports.teamValidation = {
    createTeamSchema: exports.createTeamSchema,
    getTeamSchema: exports.getTeamSchema,
    updateTeamSchema: exports.updateTeamSchema,
    deleteTeamSchema: exports.deleteTeamSchema,
    listTeamsSchema: exports.listTeamsSchema,
};
// Export all team type validation schemas
exports.teamTypeValidation = {
    createTeamTypeSchema: exports.createTeamTypeSchema,
    getTeamTypeSchema: exports.getTeamTypeSchema,
    updateTeamTypeSchema: exports.updateTeamTypeSchema,
    deleteTeamTypeSchema: exports.deleteTeamTypeSchema,
};
// Default export
exports.default = {
    teamValidation: exports.teamValidation,
    teamTypeValidation: exports.teamTypeValidation,
};
