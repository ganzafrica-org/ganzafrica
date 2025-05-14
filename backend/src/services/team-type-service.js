"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamTypeService = void 0;
exports.createTeamType = createTeamType;
exports.getTeamTypeById = getTeamTypeById;
exports.updateTeamType = updateTeamType;
exports.deleteTeamType = deleteTeamType;
exports.listTeamTypes = listTeamTypes;
const client_1 = require("../db/client");
const teams_1 = require("../db/schema/teams");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("TeamTypeService");
// Create a new team type
async function createTeamType(teamTypeData) {
    try {
        // Check if a team type with the same name already exists
        const existingTeamType = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.name, teamTypeData.name))
            .limit(1);
        if (existingTeamType.length > 0) {
            throw new middlewares_1.AppError(`Team type with name '${teamTypeData.name}' already exists`, 409);
        }
        // Insert the team type
        await client_1.db.insert(teams_1.team_types).values({
            name: teamTypeData.name,
            description: teamTypeData.description || null,
            created_at: new Date(),
            updated_at: new Date(),
        });
        // Get the created team type
        const createdTeamType = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.name, teamTypeData.name))
            .limit(1);
        if (!createdTeamType.length) {
            throw new middlewares_1.AppError("Failed to create team type", 500);
        }
        return mapToTeamTypeOutput(createdTeamType[0]);
    }
    catch (error) {
        logger.error("Error creating team type", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create team type", 500);
    }
}
// Get team type by ID
async function getTeamTypeById(id) {
    try {
        const result = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, id))
            .limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("Team type not found", 404);
        }
        return mapToTeamTypeOutput(result[0]);
    }
    catch (error) {
        logger.error(`Error getting team type by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get team type", 500);
    }
}
// Update team type
async function updateTeamType(id, teamTypeData) {
    try {
        // Check if team type exists
        const existingTeamType = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, id))
            .limit(1);
        if (!existingTeamType.length) {
            throw new middlewares_1.AppError("Team type not found", 404);
        }
        // If updating name, check if the new name already exists
        if (teamTypeData.name && teamTypeData.name !== existingTeamType[0].name) {
            const nameExists = await client_1.db
                .select()
                .from(teams_1.team_types)
                .where((0, drizzle_orm_1.eq)(teams_1.team_types.name, teamTypeData.name))
                .limit(1);
            if (nameExists.length > 0) {
                throw new middlewares_1.AppError(`Team type with name '${teamTypeData.name}' already exists`, 409);
            }
        }
        // Update team type
        await client_1.db
            .update(teams_1.team_types)
            .set({
            ...teamTypeData,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, id));
        // Get updated team type
        const updatedTeamType = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, id))
            .limit(1);
        return mapToTeamTypeOutput(updatedTeamType[0]);
    }
    catch (error) {
        logger.error(`Error updating team type: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update team type", 500);
    }
}
// Delete team type
async function deleteTeamType(id) {
    try {
        // Check if team type exists
        const existingTeamType = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, id))
            .limit(1);
        if (!existingTeamType.length) {
            throw new middlewares_1.AppError("Team type not found", 404);
        }
        // Delete the team type
        await client_1.db.delete(teams_1.team_types).where((0, drizzle_orm_1.eq)(teams_1.team_types.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting team type: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete team type", 500);
    }
}
// List all team types
async function listTeamTypes() {
    try {
        const result = await client_1.db.select().from(teams_1.team_types);
        return result.map(mapToTeamTypeOutput);
    }
    catch (error) {
        logger.error("Error listing team types", error);
        throw new middlewares_1.AppError("Failed to list team types", 500);
    }
}
// Helper function to map database team type to TeamTypeOutput
function mapToTeamTypeOutput(teamType) {
    return {
        id: teamType.id,
        name: teamType.name,
        description: teamType.description,
        created_at: teamType.created_at,
        updated_at: teamType.updated_at,
    };
}
// Export the service functions
exports.teamTypeService = {
    createTeamType,
    getTeamTypeById,
    updateTeamType,
    deleteTeamType,
    listTeamTypes,
};
// Default export for the service object
exports.default = exports.teamTypeService;
