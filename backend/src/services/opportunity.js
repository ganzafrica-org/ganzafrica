"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityService = void 0;
exports.createOpportunity = createOpportunity;
exports.getOpportunityById = getOpportunityById;
exports.updateOpportunity = updateOpportunity;
exports.updateOpportunityStatus = updateOpportunityStatus;
exports.deleteOpportunity = deleteOpportunity;
exports.listOpportunities = listOpportunities;
exports.submitApplication = submitApplication;
exports.getApplicationById = getApplicationById;
exports.listApplications = listApplications;
exports.updateApplicationStatus = updateApplicationStatus;
exports.listAllApplications = listAllApplications;
exports.submitApplicationReview = submitApplicationReview;
const client_1 = require("../db/client");
const opportunities_1 = require("../db/schema/opportunities");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const uuid_1 = require("uuid");
const logger = new config_1.Logger('OpportunityService');
// Opportunity service functions
// Create a new opportunity
async function createOpportunity(opportunityData) {
    try {
        // Begin a transaction
        return await client_1.db.transaction(async (tx) => {
            // Process custom questions - add IDs if not provided
            const customQuestions = opportunityData.custom_questions?.map(q => ({
                ...q,
                id: q.id || (0, uuid_1.v4)() // Generate UUID for questions without ID
            }));
            // Prepare dates
            const applicationDeadline = new Date(opportunityData.application_deadline).toISOString();
            // Insert opportunity record
            const [createdOpportunity] = await tx.insert(opportunities_1.opportunities).values({
                title: opportunityData.title,
                description: opportunityData.description,
                type: opportunityData.type,
                status: opportunityData.status || 'draft',
                location_type: opportunityData.location_type || 'remote',
                location: opportunityData.location,
                application_deadline: applicationDeadline,
                eligibility_criteria: opportunityData.eligibility_criteria,
                custom_questions: customQuestions,
                category_id: opportunityData.category_id,
                created_by: opportunityData.created_by,
                created_at: new Date(),
                updated_at: new Date()
            }).returning();
            let typeDetails = null;
            // Insert type-specific details based on opportunity type
            if (opportunityData.type === 'fellowship' && opportunityData.fellowship_details) {
                const [fellowshipDetail] = await tx.insert(opportunities_1.fellowship_details).values({
                    opportunity_id: createdOpportunity.id,
                    program_name: opportunityData.fellowship_details.program_name,
                    cohort: opportunityData.fellowship_details.cohort,
                    fellowship_type: opportunityData.fellowship_details.fellowship_type,
                    learning_outcomes: opportunityData.fellowship_details.learning_outcomes,
                    program_structure: opportunityData.fellowship_details.program_structure,
                    created_at: new Date(),
                    updated_at: new Date()
                }).returning();
                typeDetails = fellowshipDetail;
            }
            else if (opportunityData.type === 'employment' && opportunityData.employment_details) {
                const [employmentDetail] = await tx.insert(opportunities_1.employment_details).values({
                    opportunity_id: createdOpportunity.id,
                    position_level: opportunityData.employment_details.position_level,
                    employment_type: opportunityData.employment_details.employment_type,
                    department: opportunityData.employment_details.department,
                    responsibilities: opportunityData.employment_details.responsibilities,
                    qualifications: opportunityData.employment_details.qualifications,
                    created_at: new Date(),
                    updated_at: new Date()
                }).returning();
                typeDetails = employmentDetail;
            }
            // Return the complete opportunity with type-specific details directly
            // instead of making another database call
            return {
                ...createdOpportunity,
                [opportunityData.type === 'fellowship' ? 'fellowship_details' : 'employment_details']: typeDetails
            };
        });
    }
    catch (error) {
        logger.error('Error creating opportunity', error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to create opportunity', 500);
    }
}
// Get opportunity by ID
async function getOpportunityById(id) {
    try {
        // Fetch the opportunity
        const opportunityResult = await client_1.db.select()
            .from(opportunities_1.opportunities)
            .where((0, drizzle_orm_1.eq)(opportunities_1.opportunities.id, id))
            .limit(1);
        if (!opportunityResult.length) {
            throw new middlewares_1.AppError('Opportunity not found', 404);
        }
        const opportunity = opportunityResult[0];
        // Fetch type-specific details
        let typeDetails = null;
        if (opportunity.type === 'fellowship') {
            const fellowshipResult = await client_1.db.select()
                .from(opportunities_1.fellowship_details)
                .where((0, drizzle_orm_1.eq)(opportunities_1.fellowship_details.opportunity_id, id))
                .limit(1);
            typeDetails = fellowshipResult.length ? fellowshipResult[0] : null;
        }
        else if (opportunity.type === 'employment') {
            const employmentResult = await client_1.db.select()
                .from(opportunities_1.employment_details)
                .where((0, drizzle_orm_1.eq)(opportunities_1.employment_details.opportunity_id, id))
                .limit(1);
            typeDetails = employmentResult.length ? employmentResult[0] : null;
        }
        // Return combined data
        return {
            ...opportunity,
            [opportunity.type === 'fellowship' ? 'fellowship_details' : 'employment_details']: typeDetails
        };
    }
    catch (error) {
        logger.error(`Error getting opportunity by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to get opportunity', 500);
    }
}
// Update opportunity
async function updateOpportunity(id, updateData) {
    try {
        // Check if opportunity exists and get its type
        const existingOpportunity = await getOpportunityById(id);
        if (!existingOpportunity) {
            throw new middlewares_1.AppError('Opportunity not found', 404);
        }
        return await client_1.db.transaction(async (tx) => {
            // Update custom questions - preserve IDs or generate new ones
            let customQuestions = undefined;
            if (updateData.custom_questions) {
                customQuestions = updateData.custom_questions.map(q => ({
                    ...q,
                    id: q.id || (0, uuid_1.v4)() // Generate UUID for questions without ID
                }));
            }
            // Prepare dates
            const applicationDeadline = updateData.application_deadline
                ? new Date(updateData.application_deadline).toISOString()
                : undefined;
            // Update the base opportunity record
            await tx.update(opportunities_1.opportunities)
                .set({
                ...(updateData.title && { title: updateData.title }),
                ...(updateData.description && { description: updateData.description }),
                ...(updateData.status && { status: updateData.status }),
                ...(updateData.location_type && { location_type: updateData.location_type }),
                ...(updateData.location !== undefined && { location: updateData.location }),
                ...(applicationDeadline && { application_deadline: applicationDeadline }),
                ...(updateData.eligibility_criteria && { eligibility_criteria: updateData.eligibility_criteria }),
                ...(customQuestions && { custom_questions: customQuestions }),
                ...(updateData.category_id !== undefined && { category_id: updateData.category_id }),
                updated_at: new Date()
            })
                .where((0, drizzle_orm_1.eq)(opportunities_1.opportunities.id, id));
            // Update type-specific details
            if (existingOpportunity.type === 'fellowship' && updateData.fellowship_details) {
                // Check if fellowship details exist
                const existingDetails = await tx.select()
                    .from(opportunities_1.fellowship_details)
                    .where((0, drizzle_orm_1.eq)(opportunities_1.fellowship_details.opportunity_id, id))
                    .limit(1);
                if (existingDetails.length) {
                    // Update existing fellowship details
                    await tx.update(opportunities_1.fellowship_details)
                        .set({
                        ...(updateData.fellowship_details.program_name && {
                            program_name: updateData.fellowship_details.program_name
                        }),
                        ...(updateData.fellowship_details.cohort !== undefined && {
                            cohort: updateData.fellowship_details.cohort
                        }),
                        ...(updateData.fellowship_details.fellowship_type !== undefined && {
                            fellowship_type: updateData.fellowship_details.fellowship_type
                        }),
                        ...(updateData.fellowship_details.learning_outcomes && {
                            learning_outcomes: updateData.fellowship_details.learning_outcomes
                        }),
                        ...(updateData.fellowship_details.program_structure && {
                            program_structure: updateData.fellowship_details.program_structure
                        }),
                        updated_at: new Date()
                    })
                        .where((0, drizzle_orm_1.eq)(opportunities_1.fellowship_details.opportunity_id, id));
                }
                else {
                    // Insert new fellowship details
                    await tx.insert(opportunities_1.fellowship_details).values({
                        opportunity_id: id,
                        program_name: updateData.fellowship_details.program_name,
                        cohort: updateData.fellowship_details.cohort,
                        fellowship_type: updateData.fellowship_details.fellowship_type,
                        learning_outcomes: updateData.fellowship_details.learning_outcomes,
                        program_structure: updateData.fellowship_details.program_structure,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }
            }
            else if (existingOpportunity.type === 'employment' && updateData.employment_details) {
                // Check if employment details exist
                const existingDetails = await tx.select()
                    .from(opportunities_1.employment_details)
                    .where((0, drizzle_orm_1.eq)(opportunities_1.employment_details.opportunity_id, id))
                    .limit(1);
                if (existingDetails.length) {
                    // Update existing employment details
                    await tx.update(opportunities_1.employment_details)
                        .set({
                        ...(updateData.employment_details.position_level !== undefined && {
                            position_level: updateData.employment_details.position_level
                        }),
                        ...(updateData.employment_details.employment_type && {
                            employment_type: updateData.employment_details.employment_type
                        }),
                        ...(updateData.employment_details.department !== undefined && {
                            department: updateData.employment_details.department
                        }),
                        ...(updateData.employment_details.responsibilities && {
                            responsibilities: updateData.employment_details.responsibilities
                        }),
                        ...(updateData.employment_details.qualifications && {
                            qualifications: updateData.employment_details.qualifications
                        }),
                        updated_at: new Date()
                    })
                        .where((0, drizzle_orm_1.eq)(opportunities_1.employment_details.opportunity_id, id));
                }
                else {
                    // Insert new employment details
                    await tx.insert(opportunities_1.employment_details).values({
                        opportunity_id: id,
                        position_level: updateData.employment_details.position_level,
                        employment_type: updateData.employment_details.employment_type,
                        department: updateData.employment_details.department,
                        responsibilities: updateData.employment_details.responsibilities,
                        qualifications: updateData.employment_details.qualifications,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }
            }
            // Return the updated opportunity
            return getOpportunityById(id);
        });
    }
    catch (error) {
        logger.error(`Error updating opportunity: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to update opportunity', 500);
    }
}
// Update opportunity status
async function updateOpportunityStatus(id, status) {
    try {
        // Check if opportunity exists
        const existingOpportunity = await getOpportunityById(id);
        if (!existingOpportunity) {
            throw new middlewares_1.AppError('Opportunity not found', 404);
        }
        // Update the status
        await client_1.db.update(opportunities_1.opportunities)
            .set({
            status: status,
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(opportunities_1.opportunities.id, id));
        // Return the updated opportunity
        return getOpportunityById(id);
    }
    catch (error) {
        logger.error(`Error updating opportunity status: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to update opportunity status', 500);
    }
}
// Delete opportunity
async function deleteOpportunity(id) {
    try {
        // Check if opportunity exists
        const existingOpportunity = await getOpportunityById(id);
        if (!existingOpportunity) {
            throw new middlewares_1.AppError('Opportunity not found', 404);
        }
        // Delete the opportunity (cascade will handle dependent records)
        await client_1.db.delete(opportunities_1.opportunities)
            .where((0, drizzle_orm_1.eq)(opportunities_1.opportunities.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting opportunity: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to delete opportunity', 500);
    }
}
// List opportunities with optional filters
async function listOpportunities(filters) {
    try {
        // Build query conditions based on filters
        const conditions = [];
        if (filters.type) {
            conditions.push((0, drizzle_orm_1.eq)(opportunities_1.opportunities.type, filters.type));
        }
        if (filters.status) {
            conditions.push((0, drizzle_orm_1.eq)(opportunities_1.opportunities.status, filters.status));
        }
        if (filters.category_id) {
            conditions.push((0, drizzle_orm_1.eq)(opportunities_1.opportunities.category_id, filters.category_id));
        }
        // Execute query with conditions
        const opportunitiesResult = conditions.length > 0
            ? await client_1.db.select().from(opportunities_1.opportunities).where((0, drizzle_orm_1.and)(...conditions))
            : await client_1.db.select().from(opportunities_1.opportunities);
        // Get all unique opportunity IDs
        const opportunityIds = opportunitiesResult.map(opp => opp.id);
        // If no opportunities found, return empty array
        if (opportunityIds.length === 0) {
            return [];
        }
        // Fetch all related fellowship details in a single query
        const fellowshipDetailsResult = await client_1.db.select()
            .from(opportunities_1.fellowship_details)
            .where((0, drizzle_orm_1.inArray)(opportunities_1.fellowship_details.opportunity_id, opportunityIds));
        const fellowshipDetailsMap = fellowshipDetailsResult.reduce((map, detail) => {
            map[detail.opportunity_id] = detail;
            return map;
        }, {});
        // Fetch all related employment details in a single query
        const employmentDetailsResult = await client_1.db.select()
            .from(opportunities_1.employment_details)
            .where((0, drizzle_orm_1.inArray)(opportunities_1.employment_details.opportunity_id, opportunityIds));
        const employmentDetailsMap = employmentDetailsResult.reduce((map, detail) => {
            map[detail.opportunity_id] = detail;
            return map;
        }, {});
        // Combine opportunity data with type-specific details
        return opportunitiesResult.map(opportunity => {
            const detailsKey = opportunity.type === 'fellowship' ? 'fellowship_details' : 'employment_details';
            const details = opportunity.type === 'fellowship'
                ? fellowshipDetailsMap[opportunity.id]
                : employmentDetailsMap[opportunity.id];
            return {
                ...opportunity,
                [detailsKey]: details || null
            };
        });
    }
    catch (error) {
        logger.error('Error listing opportunities', error);
        throw new middlewares_1.AppError('Failed to list opportunities', 500);
    }
}
// Application-related functions
// Submit a new application (can be general or for a specific opportunity)
async function submitApplication(applicationData) {
    try {
        // If opportunity_id is provided, check if opportunity exists and is published
        if (applicationData.opportunity_id) {
            const opportunity = await getOpportunityById(applicationData.opportunity_id);
            if (!opportunity) {
                throw new middlewares_1.AppError('Opportunity not found', 404);
            }
            if (opportunity.status !== 'published') {
                throw new middlewares_1.AppError('Applications can only be submitted for published opportunities', 400);
            }
            // Validate custom answers against opportunity's custom questions
            if (opportunity.custom_questions && opportunity.custom_questions.length > 0) {
                const requiredQuestions = opportunity.custom_questions
                    .filter((q) => q.is_required)
                    .map((q) => q.id);
                // Ensure all required questions have answers
                if (requiredQuestions.length > 0) {
                    const providedAnswers = Object.keys(applicationData.custom_answers || {});
                    const missingRequiredQuestions = requiredQuestions.filter((id) => !providedAnswers.includes(id));
                    if (missingRequiredQuestions.length > 0) {
                        throw new middlewares_1.AppError('All required questions must be answered', 400);
                    }
                }
            }
        }
        // Insert application record with GanzAfrica specific fields
        const [createdApplication] = await client_1.db.insert(opportunities_1.applications).values({
            // Personal Information
            first_name: applicationData.first_name,
            last_name: applicationData.last_name,
            email: applicationData.email,
            phone: applicationData.phone,
            national_id: applicationData.national_id,
            city: applicationData.city,
            country: applicationData.country,
            // Education & Experience
            education_level: applicationData.education_level,
            field_of_study: applicationData.field_of_study,
            career_experience: applicationData.career_experience,
            cv_url: applicationData.cv_url,
            supporting_docs_url: applicationData.supporting_docs_url,
            // Vision & Motivation
            motivation: applicationData.motivation,
            five_year_vision: applicationData.five_year_vision,
            // Community Impact
            desired_impact: applicationData.desired_impact,
            community_role: applicationData.community_role,
            national_strategy: applicationData.national_strategy,
            // Programme Relevance
            how_ganzafrica_can_help: applicationData.how_ganzafrica_can_help,
            contribution_to_ganzafrica: applicationData.contribution_to_ganzafrica,
            data_processing_consent: applicationData.data_processing_consent,
            // Optional fields - only populated for opportunity-specific applications
            opportunity_id: applicationData.opportunity_id,
            custom_answers: applicationData.custom_answers || {},
            // Status and tracking
            status: 'submitted',
            submission_date: new Date(),
            user_id: applicationData.user_id,
            // Timestamps
            created_at: new Date(),
            updated_at: new Date()
        }).returning();
        return createdApplication;
    }
    catch (error) {
        logger.error('Error submitting application', error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to submit application', 500);
    }
}
// Get application by ID
async function getApplicationById(id) {
    try {
        const applicationResult = await client_1.db.select()
            .from(opportunities_1.applications)
            .where((0, drizzle_orm_1.eq)(opportunities_1.applications.id, id))
            .limit(1);
        if (!applicationResult.length) {
            throw new middlewares_1.AppError('Application not found', 404);
        }
        // Get reviews for this application
        const reviewsResult = await client_1.db.select()
            .from(opportunities_1.application_reviews)
            .where((0, drizzle_orm_1.eq)(opportunities_1.application_reviews.application_id, id));
        // Return application with reviews
        return {
            ...applicationResult[0],
            reviews: reviewsResult
        };
    }
    catch (error) {
        logger.error(`Error getting application by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to get application', 500);
    }
}
// List applications for an opportunity with optional status filter
async function listApplications(opportunityId, status) {
    try {
        // Check if opportunity exists
        const opportunity = await getOpportunityById(opportunityId);
        if (!opportunity) {
            throw new middlewares_1.AppError('Opportunity not found', 404);
        }
        // Build query conditions
        const conditions = [(0, drizzle_orm_1.eq)(opportunities_1.applications.opportunity_id, opportunityId)];
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(opportunities_1.applications.status, status));
        }
        // Fetch applications
        return await client_1.db.select()
            .from(opportunities_1.applications)
            .where((0, drizzle_orm_1.and)(...conditions));
    }
    catch (error) {
        logger.error(`Error listing applications for opportunity: ${opportunityId}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to list applications', 500);
    }
}
// Update application status
async function updateApplicationStatus(id, status) {
    try {
        // Check if application exists
        const application = await getApplicationById(id);
        if (!application) {
            throw new middlewares_1.AppError('Application not found', 404);
        }
        // Update status
        await client_1.db.update(opportunities_1.applications)
            .set({
            status: status,
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(opportunities_1.applications.id, id));
        // Return updated application
        return getApplicationById(id);
    }
    catch (error) {
        logger.error(`Error updating application status: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to update application status', 500);
    }
}
/**
 * List all applications across all opportunities with optional filtering
 */
async function listAllApplications(status, page = 1, limit = 10) {
    try {
        const offset = (page - 1) * limit;
        // Build query - using the full select() method instead of variable assignment
        // This avoids TypeScript losing type information through assignments
        // First, build the basic query
        const baseQuery = client_1.db.select().from(opportunities_1.applications);
        // Apply filters if needed
        const filteredQuery = status
            ? baseQuery.where((0, drizzle_orm_1.eq)(opportunities_1.applications.status, status))
            : baseQuery;
        // Apply pagination and execute
        const applicationResults = await filteredQuery.limit(limit).offset(offset);
        // Get total count for pagination
        const countResult = status
            ? await client_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(opportunities_1.applications).where((0, drizzle_orm_1.eq)(opportunities_1.applications.status, status))
            : await client_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(opportunities_1.applications);
        const totalCount = Number(countResult[0]?.count || 0);
        // Get all opportunity IDs from the results
        const opportunityIds = [...new Set(applicationResults.filter(app => app.opportunity_id).map(app => app.opportunity_id))];
        // Fetch opportunity details for these IDs
        const opportunityDetails = opportunityIds.length > 0
            ? await client_1.db.select().from(opportunities_1.opportunities).where((0, drizzle_orm_1.inArray)(opportunities_1.opportunities.id, opportunityIds.filter((id) => id !== null)))
            : [];
        // Create map of opportunity details
        const opportunityMap = {};
        opportunityDetails.forEach(opportunity => {
            opportunityMap[opportunity.id] = opportunity;
        });
        // Enhance applications with opportunity title
        const enhancedApplications = applicationResults.map(app => ({
            ...app,
            opportunity_title: app.opportunity_id ? (opportunityMap[app.opportunity_id]?.title || 'Unknown Opportunity') : 'General Application'
        }));
        return {
            items: enhancedApplications,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        };
    }
    catch (error) {
        logger.error('Error listing all applications', error);
        throw new middlewares_1.AppError('Failed to list applications', 500);
    }
}
// Submit application review
async function submitApplicationReview(reviewData) {
    try {
        // Check if application exists
        const application = await getApplicationById(reviewData.application_id);
        if (!application) {
            throw new middlewares_1.AppError('Application not found', 404);
        }
        // Check if reviewer has already reviewed this application
        const existingReview = await client_1.db.select()
            .from(opportunities_1.application_reviews)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(opportunities_1.application_reviews.application_id, reviewData.application_id), (0, drizzle_orm_1.eq)(opportunities_1.application_reviews.reviewer_id, reviewData.reviewer_id)))
            .limit(1);
        if (existingReview.length > 0) {
            // Update existing review
            await client_1.db.update(opportunities_1.application_reviews)
                .set({
                score: reviewData.score,
                comments: reviewData.comments,
                recommendation: reviewData.recommendation,
                updated_at: new Date()
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(opportunities_1.application_reviews.application_id, reviewData.application_id), (0, drizzle_orm_1.eq)(opportunities_1.application_reviews.reviewer_id, reviewData.reviewer_id)));
            // Return updated review
            const updatedReview = await client_1.db.select()
                .from(opportunities_1.application_reviews)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(opportunities_1.application_reviews.application_id, reviewData.application_id), (0, drizzle_orm_1.eq)(opportunities_1.application_reviews.reviewer_id, reviewData.reviewer_id)))
                .limit(1);
            return updatedReview[0];
        }
        else {
            // Create new review
            const [createdReview] = await client_1.db.insert(opportunities_1.application_reviews).values({
                application_id: reviewData.application_id,
                reviewer_id: reviewData.reviewer_id,
                score: reviewData.score,
                comments: reviewData.comments,
                recommendation: reviewData.recommendation,
                created_at: new Date(),
                updated_at: new Date()
            }).returning();
            return createdReview;
        }
    }
    catch (error) {
        logger.error(`Error submitting application review: ${reviewData.application_id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError('Failed to submit application review', 500);
    }
}
// Export the service functions
exports.opportunityService = {
    createOpportunity,
    getOpportunityById,
    updateOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    listOpportunities,
    submitApplication,
    getApplicationById,
    listApplications,
    updateApplicationStatus,
    submitApplicationReview,
    listAllApplications
};
// Default export for the service object
exports.default = exports.opportunityService;
