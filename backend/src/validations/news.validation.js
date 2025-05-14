"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsValidation = exports.listNewsSchema = exports.deleteTagSchema = exports.createTagSchema = exports.deleteNewsSchema = exports.updateNewsSchema = exports.getNewsSchema = exports.createNewsSchema = void 0;
const zod_1 = require("zod");
// Media item schema
const mediaItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(["image", "video"]),
    url: zod_1.z.string().url("Invalid URL format"),
    cover: zod_1.z.boolean(),
    size: zod_1.z.number().optional(),
    duration: zod_1.z.number().optional(),
    thumbnailUrl: zod_1.z.string().url("Invalid URL format").optional(),
    order: zod_1.z.number().optional(),
});
// Media schema
const mediaSchema = zod_1.z.object({
    items: zod_1.z.array(mediaItemSchema),
});
// Schema for creating a new news item
exports.createNewsSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .min(3, "Title must be at least 3 characters long")
            .max(255, "Title must be at most 255 characters long"),
        content: zod_1.z.string().min(10, "Content must be at least 10 characters long"),
        status: zod_1.z.enum(["published", "not_published"]).optional(),
        publish_date: zod_1.z.string().datetime().optional(),
        category: zod_1.z.enum(["all", "news", "blogs", "reports", "publications"]),
        key_lessons: zod_1.z.string().optional(),
        media: mediaSchema.optional(),
        tags: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    }),
});
// Schema for getting a news item by ID
exports.getNewsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for updating a news item
exports.updateNewsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
    body: zod_1.z
        .object({
        title: zod_1.z
            .string()
            .min(3, "Title must be at least 3 characters long")
            .max(255, "Title must be at most 255 characters long")
            .optional(),
        content: zod_1.z
            .string()
            .min(10, "Content must be at least 10 characters long")
            .optional(),
        status: zod_1.z.enum(["published", "not_published"]).optional(),
        publish_date: zod_1.z.string().datetime().optional().nullable(),
        category: zod_1.z
            .enum(["all", "news", "blogs", "reports", "publications"])
            .optional(),
        key_lessons: zod_1.z.string().optional().nullable(),
        media: mediaSchema.optional().nullable(),
        tags: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a news item
exports.deleteNewsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for creating a new tag
exports.createTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Tag name must be at least 2 characters long")
            .max(50, "Tag name must be at most 50 characters long"),
    }),
});
// Schema for deleting a tag
exports.deleteTagSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for listing news with filters
exports.listNewsSchema = zod_1.z.object({
    query: zod_1.z
        .object({
        category: zod_1.z
            .enum(["all", "news", "blogs", "reports", "publications"])
            .optional(),
        status: zod_1.z.enum(["published", "not_published"]).optional(),
        search: zod_1.z.string().optional(),
        tags: zod_1.z.string().optional(), // Comma-separated list of tag IDs
        limit: zod_1.z
            .string()
            .refine((val) => !isNaN(Number(val)), {
            message: "Limit must be a number",
        })
            .optional(),
        offset: zod_1.z
            .string()
            .refine((val) => !isNaN(Number(val)), {
            message: "Offset must be a number",
        })
            .optional(),
        sortBy: zod_1.z.string().optional(),
        sortDir: zod_1.z.enum(["asc", "desc"]).optional(),
    })
        .optional(),
});
// Export all news validation schemas
exports.newsValidation = {
    createNewsSchema: exports.createNewsSchema,
    getNewsSchema: exports.getNewsSchema,
    updateNewsSchema: exports.updateNewsSchema,
    deleteNewsSchema: exports.deleteNewsSchema,
    createTagSchema: exports.createTagSchema,
    deleteTagSchema: exports.deleteTagSchema,
    listNewsSchema: exports.listNewsSchema,
};
// Default export for validation object
exports.default = exports.newsValidation;
