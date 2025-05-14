"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqValidation = exports.deleteFaqSchema = exports.updateFaqSchema = exports.getFaqSchema = exports.createFaqSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new FAQ
exports.createFaqSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z
            .string()
            .min(5, "Question must be at least 5 characters long")
            .max(500, "Question must be at most 500 characters long"),
        answer: zod_1.z
            .string()
            .min(5, "Answer must be at least 5 characters long")
            .max(2000, "Answer must be at most 2000 characters long"),
        is_active: zod_1.z.boolean().optional(),
    }),
});
// Schema for getting an FAQ by ID
exports.getFaqSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for updating an FAQ
exports.updateFaqSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
    body: zod_1.z
        .object({
        question: zod_1.z
            .string()
            .min(5, "Question must be at least 5 characters long")
            .max(500, "Question must be at most 500 characters long")
            .optional(),
        answer: zod_1.z
            .string()
            .min(5, "Answer must be at least 5 characters long")
            .max(2000, "Answer must be at most 2000 characters long")
            .optional(),
        is_active: zod_1.z.boolean().optional(),
        view_count: zod_1.z.number().int().min(0).optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting an FAQ
exports.deleteFaqSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Export all FAQ validation schemas
exports.faqValidation = {
    createFaqSchema: exports.createFaqSchema,
    getFaqSchema: exports.getFaqSchema,
    updateFaqSchema: exports.updateFaqSchema,
    deleteFaqSchema: exports.deleteFaqSchema,
};
exports.default = exports.faqValidation;
