"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonialService = void 0;
exports.createTestimonial = createTestimonial;
exports.getTestimonialById = getTestimonialById;
exports.updateTestimonial = updateTestimonial;
exports.deleteTestimonial = deleteTestimonial;
exports.listTestimonials = listTestimonials;
const client_1 = require("../db/client");
const testimonials_1 = require("../db/schema/testimonials");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("TestimonialService");
// Create a new testimonial
async function createTestimonial(testimonialData) {
    try {
        // Insert the testimonial
        const insertResult = await client_1.db
            .insert(testimonials_1.testimonials)
            .values({
            author_name: testimonialData.author_name,
            position: testimonialData.position || null,
            image: testimonialData.image || null,
            description: testimonialData.description,
            company: testimonialData.company || null,
            occupation: testimonialData.occupation || null,
            date: testimonialData.date
                ? new Date(testimonialData.date)
                : new Date(),
            rating: testimonialData.rating || null,
            created_at: new Date(),
            updated_at: new Date(),
        })
            .returning();
        if (!insertResult.length) {
            throw new middlewares_1.AppError("Failed to create testimonial", 500);
        }
        return mapToTestimonialOutput(insertResult[0]);
    }
    catch (error) {
        logger.error("Error creating testimonial", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create testimonial", 500);
    }
}
// Get testimonial by ID
async function getTestimonialById(id) {
    try {
        const result = await client_1.db
            .select()
            .from(testimonials_1.testimonials)
            .where((0, drizzle_orm_1.eq)(testimonials_1.testimonials.id, id))
            .limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("Testimonial not found", 404);
        }
        return mapToTestimonialOutput(result[0]);
    }
    catch (error) {
        logger.error(`Error getting testimonial by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get testimonial", 500);
    }
}
// Update testimonial
async function updateTestimonial(id, testimonialData) {
    try {
        // Check if testimonial exists
        const existingTestimonial = await client_1.db
            .select()
            .from(testimonials_1.testimonials)
            .where((0, drizzle_orm_1.eq)(testimonials_1.testimonials.id, id))
            .limit(1);
        if (!existingTestimonial.length) {
            throw new middlewares_1.AppError("Testimonial not found", 404);
        }
        // Prepare date field if provided
        const updateData = { ...testimonialData };
        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }
        // Update testimonial
        const updateResult = await client_1.db
            .update(testimonials_1.testimonials)
            .set({
            ...updateData,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(testimonials_1.testimonials.id, id))
            .returning();
        if (!updateResult.length) {
            throw new middlewares_1.AppError("Failed to update testimonial", 500);
        }
        return mapToTestimonialOutput(updateResult[0]);
    }
    catch (error) {
        logger.error(`Error updating testimonial: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update testimonial", 500);
    }
}
// Delete testimonial
async function deleteTestimonial(id) {
    try {
        // Check if testimonial exists
        const existingTestimonial = await client_1.db
            .select()
            .from(testimonials_1.testimonials)
            .where((0, drizzle_orm_1.eq)(testimonials_1.testimonials.id, id))
            .limit(1);
        if (!existingTestimonial.length) {
            throw new middlewares_1.AppError("Testimonial not found", 404);
        }
        // Delete the testimonial
        await client_1.db.delete(testimonials_1.testimonials).where((0, drizzle_orm_1.eq)(testimonials_1.testimonials.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting testimonial: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete testimonial", 500);
    }
}
// List all testimonials
async function listTestimonials() {
    try {
        const result = await client_1.db.select().from(testimonials_1.testimonials);
        return result.map(mapToTestimonialOutput);
    }
    catch (error) {
        logger.error("Error listing testimonials", error);
        throw new middlewares_1.AppError("Failed to list testimonials", 500);
    }
}
// Helper function to map database testimonial to TestimonialOutput type
function mapToTestimonialOutput(testimonial) {
    return {
        id: testimonial.id,
        author_name: testimonial.author_name,
        position: testimonial.position,
        image: testimonial.image,
        description: testimonial.description,
        company: testimonial.company,
        occupation: testimonial.occupation,
        date: testimonial.date,
        rating: testimonial.rating,
        created_at: testimonial.created_at,
        updated_at: testimonial.updated_at,
    };
}
// Export the service functions
exports.testimonialService = {
    createTestimonial,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial,
    listTestimonials,
};
// Default export for the service object
exports.default = exports.testimonialService;
