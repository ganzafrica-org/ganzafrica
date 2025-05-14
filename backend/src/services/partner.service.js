"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerService = void 0;
exports.createPartner = createPartner;
exports.getPartnerById = getPartnerById;
exports.updatePartner = updatePartner;
exports.deletePartner = deletePartner;
exports.listPartners = listPartners;
const client_1 = require("../db/client");
const partners_1 = require("../db/schema/partners");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("PartnerService");
// Create a new partner
async function createPartner(partnerData) {
    try {
        // Check if a partner with the same name already exists
        const existingPartner = await client_1.db
            .select()
            .from(partners_1.partners)
            .where((0, drizzle_orm_1.eq)(partners_1.partners.name, partnerData.name))
            .limit(1);
        if (existingPartner.length > 0) {
            throw new middlewares_1.AppError(`Partner with name '${partnerData.name}' already exists`, 409);
        }
        // Insert the partner
        await client_1.db.insert(partners_1.partners).values({
            name: partnerData.name,
            logo: partnerData.logo || null,
            website_url: partnerData.website_url || null,
            location: partnerData.location || null,
            created_at: new Date(),
            updated_at: new Date(),
        });
        // Get the created partner
        const createdPartner = await client_1.db
            .select()
            .from(partners_1.partners)
            .where((0, drizzle_orm_1.eq)(partners_1.partners.name, partnerData.name))
            .limit(1);
        if (!createdPartner.length) {
            throw new middlewares_1.AppError("Failed to create partner", 500);
        }
        return mapToPartnerOutput(createdPartner[0]);
    }
    catch (error) {
        logger.error("Error creating partner", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create partner", 500);
    }
}
// Get partner by ID
async function getPartnerById(id) {
    try {
        const result = await client_1.db
            .select()
            .from(partners_1.partners)
            .where((0, drizzle_orm_1.eq)(partners_1.partners.id, id))
            .limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("Partner not found", 404);
        }
        return mapToPartnerOutput(result[0]);
    }
    catch (error) {
        logger.error(`Error getting partner by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get partner", 500);
    }
}
// Update partner
async function updatePartner(id, partnerData) {
    try {
        // Check if partner exists
        const existingPartner = await client_1.db
            .select()
            .from(partners_1.partners)
            .where((0, drizzle_orm_1.eq)(partners_1.partners.id, id))
            .limit(1);
        if (!existingPartner.length) {
            throw new middlewares_1.AppError("Partner not found", 404);
        }
        // If updating name, check if the new name already exists
        if (partnerData.name && partnerData.name !== existingPartner[0].name) {
            const nameExists = await client_1.db
                .select()
                .from(partners_1.partners)
                .where((0, drizzle_orm_1.eq)(partners_1.partners.name, partnerData.name))
                .limit(1);
            if (nameExists.length > 0) {
                throw new middlewares_1.AppError(`Partner with name '${partnerData.name}' already exists`, 409);
            }
        }
        // Update partner
        await client_1.db
            .update(partners_1.partners)
            .set({
            ...partnerData,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(partners_1.partners.id, id));
        // Get updated partner
        const updatedPartner = await client_1.db
            .select()
            .from(partners_1.partners)
            .where((0, drizzle_orm_1.eq)(partners_1.partners.id, id))
            .limit(1);
        return mapToPartnerOutput(updatedPartner[0]);
    }
    catch (error) {
        logger.error(`Error updating partner: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update partner", 500);
    }
}
// Delete partner
async function deletePartner(id) {
    try {
        // Check if partner exists
        const existingPartner = await client_1.db
            .select()
            .from(partners_1.partners)
            .where((0, drizzle_orm_1.eq)(partners_1.partners.id, id))
            .limit(1);
        if (!existingPartner.length) {
            throw new middlewares_1.AppError("Partner not found", 404);
        }
        // Delete the partner
        await client_1.db.delete(partners_1.partners).where((0, drizzle_orm_1.eq)(partners_1.partners.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting partner: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete partner", 500);
    }
}
// List all partners
async function listPartners() {
    try {
        const result = await client_1.db.select().from(partners_1.partners);
        return result.map(mapToPartnerOutput);
    }
    catch (error) {
        logger.error("Error listing partners", error);
        throw new middlewares_1.AppError("Failed to list partners", 500);
    }
}
// Helper function to map database partner to PartnerOutput type
function mapToPartnerOutput(partner) {
    return {
        id: partner.id,
        name: partner.name,
        logo: partner.logo,
        website_url: partner.website_url,
        location: partner.location,
        created_at: partner.created_at,
        updated_at: partner.updated_at,
    };
}
// Export the service functions
exports.partnerService = {
    createPartner,
    getPartnerById,
    updatePartner,
    deletePartner,
    listPartners,
};
// Default export for the service object
exports.default = exports.partnerService;
