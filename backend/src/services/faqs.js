"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqService = void 0;
exports.createFaq = createFaq;
exports.getFaqById = getFaqById;
exports.incrementViewCount = incrementViewCount;
exports.updateFaq = updateFaq;
exports.deleteFaq = deleteFaq;
exports.listFaqs = listFaqs;
const client_1 = require("../db/client");
const faqs_1 = require("../db/schema/faqs");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("FaqService");
// Create a new FAQ
// Create a new FAQ
async function createFaq(faqData) {
    try {
        // Insert the FAQ
        await client_1.db.insert(faqs_1.faqs).values({
            question: faqData.question,
            answer: faqData.answer,
            is_active: faqData.is_active !== undefined ? faqData.is_active : true,
            view_count: 0,
            created_at: new Date(),
            updated_at: new Date(),
        });
        const createdFaq = await client_1.db
            .select()
            .from(faqs_1.faqs)
            .where((0, drizzle_orm_1.eq)(faqs_1.faqs.question, faqData.question))
            .orderBy((0, drizzle_orm_1.desc)(faqs_1.faqs.created_at))
            .limit(1);
        if (!createdFaq.length) {
            throw new middlewares_1.AppError("Failed to create FAQ", 500);
        }
        return mapToFaqOutput(createdFaq[0]);
    }
    catch (error) {
        logger.error("Error creating FAQ", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create FAQ", 500);
    }
}
// Get FAQ by ID
async function getFaqById(id) {
    try {
        const result = await client_1.db.select().from(faqs_1.faqs).where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id)).limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("FAQ not found", 404);
        }
        return mapToFaqOutput(result[0]);
    }
    catch (error) {
        logger.error(`Error getting FAQ by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get FAQ", 500);
    }
}
// Increment view count for an FAQ
async function incrementViewCount(id) {
    try {
        const result = await client_1.db.select().from(faqs_1.faqs).where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id)).limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("FAQ not found", 404);
        }
        await client_1.db
            .update(faqs_1.faqs)
            .set({
            view_count: result[0].view_count + 1,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error incrementing view count for FAQ: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to increment view count", 500);
    }
}
// Update FAQ
async function updateFaq(id, faqData) {
    try {
        // Check if FAQ exists
        const existingFaq = await client_1.db
            .select()
            .from(faqs_1.faqs)
            .where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id))
            .limit(1);
        if (!existingFaq.length) {
            throw new middlewares_1.AppError("FAQ not found", 404);
        }
        // Update FAQ
        await client_1.db
            .update(faqs_1.faqs)
            .set({
            ...faqData,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id));
        // Get updated FAQ
        const updatedFaq = await client_1.db
            .select()
            .from(faqs_1.faqs)
            .where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id))
            .limit(1);
        return mapToFaqOutput(updatedFaq[0]);
    }
    catch (error) {
        logger.error(`Error updating FAQ: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update FAQ", 500);
    }
}
// Delete FAQ
async function deleteFaq(id) {
    try {
        // Check if FAQ exists
        const existingFaq = await client_1.db
            .select()
            .from(faqs_1.faqs)
            .where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id))
            .limit(1);
        if (!existingFaq.length) {
            throw new middlewares_1.AppError("FAQ not found", 404);
        }
        // Delete the FAQ
        await client_1.db.delete(faqs_1.faqs).where((0, drizzle_orm_1.eq)(faqs_1.faqs.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting FAQ: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete FAQ", 500);
    }
}
async function listFaqs(activeOnly = false) {
    try {
        // Instead of conditionally modifying the query, create different queries
        const result = activeOnly
            ? await client_1.db.select().from(faqs_1.faqs).where((0, drizzle_orm_1.eq)(faqs_1.faqs.is_active, true))
            : await client_1.db.select().from(faqs_1.faqs);
        return result.map(mapToFaqOutput);
    }
    catch (error) {
        logger.error("Error listing FAQs", error);
        throw new middlewares_1.AppError("Failed to list FAQs", 500);
    }
}
// Helper function to map database FAQ to FaqOutput type
function mapToFaqOutput(faq) {
    return {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        is_active: faq.is_active,
        view_count: faq.view_count,
        created_by: faq.created_by,
        created_at: faq.created_at,
        updated_at: faq.updated_at,
    };
}
// Export the service functions
exports.faqService = {
    createFaq,
    getFaqById,
    updateFaq,
    deleteFaq,
    listFaqs,
    incrementViewCount,
};
exports.default = exports.faqService;
