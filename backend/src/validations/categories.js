"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryValidation = exports.deleteCategorySchema = exports.updateCategorySchema = exports.getCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new category
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Category name must be at least 2 characters long")
            .max(100, "Category name must be at most 100 characters long"),
        description: zod_1.z.string().optional(),
    }),
});
// Schema for getting a category by ID
exports.getCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for updating a category
exports.updateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(2, "Category name must be at least 2 characters long")
            .max(100, "Category name must be at most 100 characters long")
            .optional(),
        description: zod_1.z.string().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a category
exports.deleteCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Export all category validation schemas
exports.categoryValidation = {
    createCategorySchema: exports.createCategorySchema,
    getCategorySchema: exports.getCategorySchema,
    updateCategorySchema: exports.updateCategorySchema,
    deleteCategorySchema: exports.deleteCategorySchema,
};
exports.default = exports.categoryValidation;
