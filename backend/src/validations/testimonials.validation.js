"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonialValidation = exports.deleteTestimonialSchema = exports.updateTestimonialSchema = exports.getTestimonialSchema = exports.createTestimonialSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new testimonial
exports.createTestimonialSchema = zod_1.z.object({
    body: zod_1.z.object({
        author_name: zod_1.z
            .string()
            .min(2, "Author name must be at least 2 characters long")
            .max(200, "Author name must be at most 200 characters long"),
        position: zod_1.z
            .string()
            .max(200, "Position must be at most 200 characters long")
            .optional(),
        image: zod_1.z.string().optional(),
        description: zod_1.z
            .string()
            .min(10, "Description must be at least 10 characters long"),
        company: zod_1.z
            .string()
            .max(200, "Company must be at most 200 characters long")
            .optional(),
        occupation: zod_1.z
            .string()
            .max(200, "Occupation must be at most 200 characters long")
            .optional(),
        date: zod_1.z
            .string()
            .datetime({ message: "Date must be a valid ISO datetime string" })
            .optional(),
        rating: zod_1.z
            .number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5")
            .optional(),
    }),
});
// Schema for getting a testimonial by ID
exports.getTestimonialSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for updating a testimonial
exports.updateTestimonialSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
    body: zod_1.z
        .object({
        author_name: zod_1.z
            .string()
            .min(2, "Author name must be at least 2 characters long")
            .max(200, "Author name must be at most 200 characters long")
            .optional(),
        position: zod_1.z
            .string()
            .max(200, "Position must be at most 200 characters long")
            .optional(),
        image: zod_1.z.string().optional(),
        description: zod_1.z
            .string()
            .min(10, "Description must be at least 10 characters long")
            .optional(),
        company: zod_1.z
            .string()
            .max(200, "Company must be at most 200 characters long")
            .optional(),
        occupation: zod_1.z
            .string()
            .max(200, "Occupation must be at most 200 characters long")
            .optional(),
        date: zod_1.z
            .string()
            .datetime({ message: "Date must be a valid ISO datetime string" })
            .optional(),
        rating: zod_1.z
            .number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5")
            .optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a testimonial
exports.deleteTestimonialSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Export all testimonial validation schemas
exports.testimonialValidation = {
    createTestimonialSchema: exports.createTestimonialSchema,
    getTestimonialSchema: exports.getTestimonialSchema,
    updateTestimonialSchema: exports.updateTestimonialSchema,
    deleteTestimonialSchema: exports.deleteTestimonialSchema,
};
exports.default = exports.testimonialValidation;
