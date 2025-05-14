"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerValidation = exports.deletePartnerSchema = exports.updatePartnerSchema = exports.getPartnerSchema = exports.createPartnerSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new partner
exports.createPartnerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Partner name must be at least 2 characters long")
            .max(200, "Partner name must be at most 200 characters long"),
        logo: zod_1.z.string().optional(),
        website_url: zod_1.z.string().url("Website URL must be a valid URL").optional(),
        location: zod_1.z
            .string()
            .max(255, "Location must be at most 255 characters long")
            .optional(),
    }),
});
// Schema for getting a partner by ID
exports.getPartnerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for updating a partner
exports.updatePartnerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(2, "Partner name must be at least 2 characters long")
            .max(200, "Partner name must be at most 200 characters long")
            .optional(),
        logo: zod_1.z.string().optional(),
        website_url: zod_1.z.string().url("Website URL must be a valid URL").optional(),
        location: zod_1.z
            .string()
            .max(255, "Location must be at most 255 characters long")
            .optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a partner
exports.deletePartnerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Export all partner validation schemas
exports.partnerValidation = {
    createPartnerSchema: exports.createPartnerSchema,
    getPartnerSchema: exports.getPartnerSchema,
    updatePartnerSchema: exports.updatePartnerSchema,
    deletePartnerSchema: exports.deletePartnerSchema,
};
exports.default = exports.partnerValidation;
