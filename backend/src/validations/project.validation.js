"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProjectsSchema = exports.removeProjectMemberSchema = exports.addProjectMemberSchema = exports.listProjectsSchema = exports.deleteProjectSchema = exports.getProjectSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.fileValidationSchema = void 0;
const zod_1 = require("zod");
// Base project status validation
const projectStatusEnum = zod_1.z.enum(["planned", "active", "completed", "cancelled", "on_hold"]);
// Project member role validation
const projectMemberRoleEnum = zod_1.z.enum(["lead", "member", "supervisor", "contributor"]);
// Media tag validation
const mediaTagEnum = zod_1.z.enum(["feature", "description", "others"]);
// Project media item validation
const mediaItemSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    type: zod_1.z.enum(["image", "video"]),
    url: zod_1.z.string().min(1, "URL is required"),
    cover: zod_1.z.boolean().default(false),
    tag: mediaTagEnum.optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    size: zod_1.z.number().optional(),
    duration: zod_1.z.number().optional(),
    thumbnailUrl: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
});
// Project goal item validation
const goalItemSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    completed: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional(),
});
// Project outcome item validation
const outcomeItemSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    status: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
});
// Project member validation - Changed from user_id to team_id
const projectMemberSchema = zod_1.z.object({
    team_id: zod_1.z.number().int().positive("Team ID is required"),
    role: projectMemberRoleEnum,
    start_date: zod_1.z.string().transform((val) => new Date(val)),
    end_date: zod_1.z
        .string()
        .transform((val) => new Date(val))
        .optional(),
});
// Project partner validation
const projectPartnerSchema = zod_1.z.object({
    partner_id: zod_1.z.number().int().positive("Partner ID is required"),
});
// Project document validation
const projectDocumentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Document name is required"),
    file_url: zod_1.z.string().min(1, "File URL is required"),
    file_size: zod_1.z.number().optional(),
});
// File validation schema for middleware
exports.fileValidationSchema = zod_1.z.object({
    fieldname: zod_1.z.string(),
    originalname: zod_1.z.string().min(1, "Original filename is required"),
    encoding: zod_1.z.string(),
    mimetype: zod_1.z.string().refine((mime) => 
    // List of allowed mime types
    [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'text/plain',
        'text/csv'
    ].includes(mime), {
        message: "Unsupported file type. Only PDF, Word, Excel, PowerPoint, images, and text files are allowed."
    }),
    size: zod_1.z.number().max(10 * 1024 * 1024, "File size must be less than 10MB"),
    buffer: zod_1.z.instanceof(Buffer).optional(),
    stream: zod_1.z.any().optional(),
    destination: zod_1.z.string().optional(),
    filename: zod_1.z.string().optional(),
    path: zod_1.z.string().optional(),
});
// Create project validation - updated to handle files
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Project name is required"),
        description: zod_1.z.string().optional(),
        status: projectStatusEnum,
        start_date: zod_1.z.string().transform((val) => new Date(val)),
        end_date: zod_1.z
            .string()
            .transform((val) => new Date(val))
            .optional(),
        category_id: zod_1.z.number().int().positive("Category ID is required"),
        partner_id: zod_1.z.number().int().positive().optional(),
        location: zod_1.z.string().optional(),
        impacted_people: zod_1.z.number().int().optional(),
        // These fields might be strings in multipart/form-data
        goals: zod_1.z.union([
            zod_1.z.object({
                items: zod_1.z.array(goalItemSchema)
            }),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for goals");
                }
            })
        ]).optional(),
        outcomes: zod_1.z.union([
            zod_1.z.object({
                items: zod_1.z.array(outcomeItemSchema)
            }),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for outcomes");
                }
            })
        ]).optional(),
        media: zod_1.z.union([
            zod_1.z.object({
                items: zod_1.z.array(mediaItemSchema)
            }),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for media");
                }
            })
        ]).optional(),
        other_information: zod_1.z.union([
            zod_1.z.record(zod_1.z.any()),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for other_information");
                }
            })
        ]).optional(),
        members: zod_1.z.union([
            zod_1.z.array(projectMemberSchema),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for members");
                }
            })
        ]).optional(),
        partners: zod_1.z.union([
            zod_1.z.array(projectPartnerSchema),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for partners");
                }
            })
        ]).optional(),
        documents: zod_1.z.array(projectDocumentSchema).optional(),
    }),
    files: zod_1.z.array(exports.fileValidationSchema).optional(),
});
// Update project validation - updated to handle files
exports.updateProjectSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Project ID is required"),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional().nullable(),
        status: projectStatusEnum.optional(),
        start_date: zod_1.z
            .string()
            .transform((val) => new Date(val))
            .optional(),
        end_date: zod_1.z
            .string()
            .transform((val) => new Date(val))
            .optional()
            .nullable(),
        category_id: zod_1.z.number().int().positive().optional(),
        partner_id: zod_1.z.number().int().positive().optional(),
        location: zod_1.z.string().optional(),
        impacted_people: zod_1.z.number().int().optional(),
        // These fields might be strings in multipart/form-data
        goals: zod_1.z.union([
            zod_1.z.object({
                items: zod_1.z.array(goalItemSchema)
            }),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for goals");
                }
            })
        ]).optional(),
        outcomes: zod_1.z.union([
            zod_1.z.object({
                items: zod_1.z.array(outcomeItemSchema)
            }),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for outcomes");
                }
            })
        ]).optional(),
        media: zod_1.z.union([
            zod_1.z.object({
                items: zod_1.z.array(mediaItemSchema)
            }),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for media");
                }
            })
        ]).optional(),
        other_information: zod_1.z.union([
            zod_1.z.record(zod_1.z.any()),
            zod_1.z.string().transform(val => {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    throw new Error("Invalid JSON for other_information");
                }
            })
        ]).optional(),
    }),
    files: zod_1.z.array(exports.fileValidationSchema).optional(),
});
// Rest of the validation schemas remain the same
exports.getProjectSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Project ID is required"),
    }),
});
exports.deleteProjectSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Project ID is required"),
    }),
});
exports.listProjectsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1)),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10)),
        search: zod_1.z.string().optional(),
        sort_by: zod_1.z.string().optional(),
        sort_order: zod_1.z.enum(["asc", "desc"]).optional(),
        status: zod_1.z.string().optional(),
        team_id: zod_1.z.string().optional(), // Changed from member_id to team_id
        category_id: zod_1.z.string().optional(),
        partner_id: zod_1.z.string().optional(), // Added partner_id
    }),
});
// Add project member validation
exports.addProjectMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Project ID is required"),
    }),
    body: projectMemberSchema,
});
// Remove project member validation
exports.removeProjectMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Project ID is required"),
        userId: zod_1.z.string().min(1, "Team ID is required"), // Changed parameter name description
    }),
});
// Import projects validation
exports.importProjectsSchema = zod_1.z.object({
    body: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1, "Project name is required"),
        description: zod_1.z.string().optional(),
        status: projectStatusEnum,
        start_date: zod_1.z.string().transform((val) => new Date(val)),
        end_date: zod_1.z
            .string()
            .transform((val) => new Date(val))
            .optional(),
        category_id: zod_1.z.number().int().positive("Category ID is required"),
        partner_id: zod_1.z.number().int().positive().optional(),
        location: zod_1.z.string().optional(),
        impacted_people: zod_1.z.number().int().optional(),
        // New fields
        goals: zod_1.z.object({
            items: zod_1.z.array(goalItemSchema)
        }).optional(),
        outcomes: zod_1.z.object({
            items: zod_1.z.array(outcomeItemSchema)
        }).optional(),
        media: zod_1.z.object({
            items: zod_1.z.array(mediaItemSchema)
        }).optional(),
        other_information: zod_1.z.record(zod_1.z.any()).optional(),
        members: zod_1.z.array(projectMemberSchema).optional(),
        partners: zod_1.z.array(projectPartnerSchema).optional(),
        documents: zod_1.z.array(projectDocumentSchema).optional(),
    }))
        .min(1, "At least one project is required"),
});
