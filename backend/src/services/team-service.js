"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamService = void 0;
exports.createTeam = createTeam;
exports.getTeamById = getTeamById;
exports.updateTeam = updateTeam;
exports.deleteTeam = deleteTeam;
exports.listTeams = listTeams;
const client_1 = require("../db/client");
const teams_1 = require("../db/schema/teams");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("TeamService");
// Create a new team member
async function createTeam(teamData) {
    try {
        // Check if the team type exists
        const teamType = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, teamData.team_type_id))
            .limit(1);
        if (!teamType.length) {
            throw new middlewares_1.AppError(`Team type with ID ${teamData.team_type_id} does not exist`, 400);
        }
        // Check if a team member with the same name already exists
        const existingTeam = await client_1.db
            .select()
            .from(teams_1.teams)
            .where((0, drizzle_orm_1.eq)(teams_1.teams.name, teamData.name))
            .limit(1);
        if (existingTeam.length > 0) {
            throw new middlewares_1.AppError(`Team member with name '${teamData.name}' already exists`, 409);
        }
        // Insert the team and get the ID
        const insertResult = await client_1.db
            .insert(teams_1.teams)
            .values({
            name: teamData.name,
            position: teamData.position || null,
            photo_url: teamData.photo_url || null,
            bio: teamData.bio || null,
            email: teamData.email || null,
            profile_link: teamData.profile_link || null,
            skills: teamData.skills || null,
            team_type_id: teamData.team_type_id,
            created_at: new Date(),
            updated_at: new Date(),
        })
            .returning({ id: teams_1.teams.id });
        const newId = insertResult[0].id;
        // Get the created team with the correct ID
        const createdTeam = await client_1.db
            .select()
            .from(teams_1.teams)
            .where((0, drizzle_orm_1.eq)(teams_1.teams.id, newId))
            .limit(1);
        if (!createdTeam.length) {
            throw new middlewares_1.AppError("Failed to create team member", 500);
        }
        return mapToTeamOutput(createdTeam[0], teamType[0]);
    }
    catch (error) {
        logger.error("Error creating team member", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create team member", 500);
    }
}
// Get team by ID
async function getTeamById(id) {
    try {
        const result = await client_1.db
            .select()
            .from(teams_1.teams)
            .where((0, drizzle_orm_1.eq)(teams_1.teams.id, id))
            .limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("Team member not found", 404);
        }
        // Get the team type
        const teamType = await client_1.db
            .select()
            .from(teams_1.team_types)
            .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, result[0].team_type_id))
            .limit(1);
        return mapToTeamOutput(result[0], teamType[0]);
    }
    catch (error) {
        logger.error(`Error getting team by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get team member", 500);
    }
}
// Update team
async function updateTeam(id, teamData) {
    try {
        // Check if team exists
        const existingTeam = await client_1.db
            .select()
            .from(teams_1.teams)
            .where((0, drizzle_orm_1.eq)(teams_1.teams.id, id))
            .limit(1);
        if (!existingTeam.length) {
            throw new middlewares_1.AppError("Team member not found", 404);
        }
        // If updating name, check if the new name already exists (excluding current team)
        if (teamData.name && teamData.name !== existingTeam[0].name) {
            const nameExists = await client_1.db
                .select()
                .from(teams_1.teams)
                .where((0, drizzle_orm_1.eq)(teams_1.teams.name, teamData.name))
                .limit(1);
            if (nameExists.length > 0) {
                throw new middlewares_1.AppError(`Team member with name '${teamData.name}' already exists`, 409);
            }
        }
        // If updating team type, check if it exists
        let teamType = null;
        if (teamData.team_type_id) {
            teamType = await client_1.db
                .select()
                .from(teams_1.team_types)
                .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, teamData.team_type_id))
                .limit(1);
            if (!teamType.length) {
                throw new middlewares_1.AppError(`Team type with ID ${teamData.team_type_id} does not exist`, 400);
            }
        }
        else {
            teamType = await client_1.db
                .select()
                .from(teams_1.team_types)
                .where((0, drizzle_orm_1.eq)(teams_1.team_types.id, existingTeam[0].team_type_id))
                .limit(1);
        }
        // Update team
        await client_1.db
            .update(teams_1.teams)
            .set({
            name: teamData.name || existingTeam[0].name,
            position: teamData.position !== undefined
                ? teamData.position
                : existingTeam[0].position,
            photo_url: teamData.photo_url !== undefined
                ? teamData.photo_url
                : existingTeam[0].photo_url,
            bio: teamData.bio !== undefined ? teamData.bio : existingTeam[0].bio,
            email: teamData.email !== undefined ? teamData.email : existingTeam[0].email,
            profile_link: teamData.profile_link !== undefined
                ? teamData.profile_link
                : existingTeam[0].profile_link,
            skills: teamData.skills !== undefined
                ? teamData.skills
                : existingTeam[0].skills,
            team_type_id: teamData.team_type_id || existingTeam[0].team_type_id,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(teams_1.teams.id, id));
        // Get updated team
        const updatedTeam = await client_1.db
            .select()
            .from(teams_1.teams)
            .where((0, drizzle_orm_1.eq)(teams_1.teams.id, id))
            .limit(1);
        return mapToTeamOutput(updatedTeam[0], teamType[0]);
    }
    catch (error) {
        logger.error(`Error updating team: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update team member", 500);
    }
}
// Delete team
async function deleteTeam(id) {
    try {
        // Check if team exists
        const existingTeam = await client_1.db
            .select()
            .from(teams_1.teams)
            .where((0, drizzle_orm_1.eq)(teams_1.teams.id, id))
            .limit(1);
        if (!existingTeam.length) {
            throw new middlewares_1.AppError("Team member not found", 404);
        }
        // Delete the team
        await client_1.db.delete(teams_1.teams).where((0, drizzle_orm_1.eq)(teams_1.teams.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting team: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete team member", 500);
    }
}
// List all teams
// List all teams
async function listTeams(teamTypeId, sortBy = 'created_at', sortOrder = 'desc') {
    try {
        // Define query parameters
        const whereConditions = teamTypeId ? [(0, drizzle_orm_1.eq)(teams_1.teams.team_type_id, teamTypeId)] : [];
        // Define order by based on sort parameters
        let orderByConditions = [];
        // Handle sorting based on the column
        switch (sortBy) {
            case 'name':
                orderByConditions = sortOrder.toLowerCase() === 'asc'
                    ? [(0, drizzle_orm_1.asc)(teams_1.teams.name), (0, drizzle_orm_1.desc)(teams_1.teams.created_at)]
                    : [(0, drizzle_orm_1.desc)(teams_1.teams.name), (0, drizzle_orm_1.desc)(teams_1.teams.created_at)];
                break;
            case 'team_type_id':
                orderByConditions = sortOrder.toLowerCase() === 'asc'
                    ? [(0, drizzle_orm_1.asc)(teams_1.teams.team_type_id), (0, drizzle_orm_1.desc)(teams_1.teams.created_at)]
                    : [(0, drizzle_orm_1.desc)(teams_1.teams.team_type_id), (0, drizzle_orm_1.desc)(teams_1.teams.created_at)];
                break;
            case 'updated_at':
                orderByConditions = sortOrder.toLowerCase() === 'asc'
                    ? [(0, drizzle_orm_1.asc)(teams_1.teams.updated_at), (0, drizzle_orm_1.desc)(teams_1.teams.created_at)]
                    : [(0, drizzle_orm_1.desc)(teams_1.teams.updated_at), (0, drizzle_orm_1.desc)(teams_1.teams.created_at)];
                break;
            case 'created_at':
            default:
                orderByConditions = sortOrder.toLowerCase() === 'asc'
                    ? [(0, drizzle_orm_1.asc)(teams_1.teams.created_at)]
                    : [(0, drizzle_orm_1.desc)(teams_1.teams.created_at)];
                break;
        }
        // Execute the query in a single call to avoid chaining issues
        const teamsResult = await client_1.db
            .select()
            .from(teams_1.teams)
            .where(whereConditions.length > 0 ? whereConditions[0] : undefined)
            .orderBy(...orderByConditions);
        // Get all team types
        const teamTypesResult = await client_1.db.select().from(teams_1.team_types);
        // Create a map of team types by ID for quick lookup
        const teamTypesMap = teamTypesResult.reduce((map, type) => {
            map[type.id] = type;
            return map;
        }, {});
        return teamsResult.map((team) => mapToTeamOutput(team, teamTypesMap[team.team_type_id]));
    }
    catch (error) {
        logger.error("Error listing teams", error);
        throw new middlewares_1.AppError("Failed to list team members", 500);
    }
}
// Helper function to map database team to TeamOutput type
function mapToTeamOutput(team, teamType) {
    return {
        id: team.id,
        name: team.name,
        position: team.position,
        photo_url: team.photo_url,
        bio: team.bio,
        email: team.email,
        profile_link: team.profile_link,
        skills: team.skills,
        team_type_id: team.team_type_id,
        team_type: teamType
            ? {
                id: teamType.id,
                name: teamType.name,
            }
            : undefined,
        created_at: team.created_at,
        updated_at: team.updated_at,
    };
}
// Export the service functions
exports.teamService = {
    createTeam,
    getTeamById,
    updateTeam,
    deleteTeam,
    listTeams,
};
// Default export for the service object
exports.default = exports.teamService;
