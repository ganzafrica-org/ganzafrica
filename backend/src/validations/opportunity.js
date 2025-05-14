"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityValidation = exports.applicationReviewSchema = exports.updateApplicationStatusSchema = exports.applicationSubmissionSchema = exports.generalApplicationSchema = exports.updateEmploymentSchema = exports.updateFellowshipSchema = exports.getOpportunitySchema = exports.createEmploymentSchema = exports.createFellowshipSchema = void 0;
const zod_1 = require("zod");
// Common validation for custom questions
const customQuestionSchema = zod_1.z.object({
    id: zod_1.z.string().optional(), // Optional because it might be auto-generated
    question: zod_1.z.string().min(2, 'Question must be at least 2 characters long'),
    field_type: zod_1.z.enum(['text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'file']),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    is_required: zod_1.z.boolean().default(false),
    max_length: zod_1.z.number().positive().optional(),
    order: zod_1.z.number().nonnegative()
}).refine((data) => {
    // If field type requires options, ensure they are provided
    if (['select', 'multiselect', 'checkbox', 'radio'].includes(data.field_type)) {
        return Array.isArray(data.options) && data.options.length > 0;
    }
    return true;
}, {
    message: 'Options are required for select, multiselect, checkbox, and radio field types',
    path: ['options']
});
// Common validation for basic opportunity fields
const baseOpportunitySchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(5, 'Title must be at least 5 characters long')
        .max(200, 'Title must be at most 200 characters long'),
    description: zod_1.z.string()
        .min(10, 'Description must be at least 10 characters long'),
    type: zod_1.z.enum(['fellowship', 'employment']),
    status: zod_1.z.enum(['draft', 'published', 'closed', 'cancelled']).default('draft'),
    location_type: zod_1.z.enum(['remote', 'onsite', 'hybrid']).default('remote'),
    location: zod_1.z.string().optional(),
    application_deadline: zod_1.z.string()
        .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    eligibility_criteria: zod_1.z.object({
        countries: zod_1.z.array(zod_1.z.string()).optional(),
        min_education_level: zod_1.z.string().optional(),
        experience_years: zod_1.z.number().nonnegative().optional(),
        skills_required: zod_1.z.array(zod_1.z.string()).optional(),
        other_requirements: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    custom_questions: zod_1.z.array(customQuestionSchema).optional(),
    category_id: zod_1.z.number().positive().optional()
});
// Fellowship-specific validation
const fellowshipDetailsSchema = zod_1.z.object({
    program_name: zod_1.z.string()
        .min(2, 'Program name must be at least 2 characters long')
        .max(200, 'Program name must be at most 200 characters long'),
    cohort: zod_1.z.string().max(100).optional(),
    fellowship_type: zod_1.z.string().max(100).optional(),
    learning_outcomes: zod_1.z.array(zod_1.z.string()).optional(),
    program_structure: zod_1.z.object({
        phases: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            duration_weeks: zod_1.z.number().positive()
        })).optional(),
        activities: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
// Employment-specific validation
const employmentDetailsSchema = zod_1.z.object({
    position_level: zod_1.z.string().max(100).optional(),
    employment_type: zod_1.z.string()
        .min(2, 'Employment type must be at least 2 characters long')
        .max(100, 'Employment type must be at most 100 characters long'),
    department: zod_1.z.string().max(100).optional(),
    responsibilities: zod_1.z.array(zod_1.z.string()).optional(),
    qualifications: zod_1.z.object({
        required: zod_1.z.array(zod_1.z.string()).optional(),
        preferred: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
// Define params schema that transforms the ID into a number
const idParamsSchema = zod_1.z.object({
    id: zod_1.z.string()
        .refine(value => !isNaN(parseInt(value)), {
        message: 'ID must be a number'
    })
        .transform(val => parseInt(val)) // This transforms the string to a number
});
// Schema for creating a fellowship opportunity
exports.createFellowshipSchema = zod_1.z.object({
    body: baseOpportunitySchema.merge(zod_1.z.object({
        type: zod_1.z.literal('fellowship'),
        fellowship_details: fellowshipDetailsSchema
    }))
});
// Schema for creating an employment opportunity
exports.createEmploymentSchema = zod_1.z.object({
    body: baseOpportunitySchema.merge(zod_1.z.object({
        type: zod_1.z.literal('employment'),
        employment_details: employmentDetailsSchema
    }))
});
// Schema for getting an opportunity by ID
exports.getOpportunitySchema = zod_1.z.object({
    params: idParamsSchema
});
// Schema for updating a fellowship opportunity
exports.updateFellowshipSchema = zod_1.z.object({
    params: idParamsSchema,
    body: baseOpportunitySchema.partial().merge(zod_1.z.object({
        type: zod_1.z.literal('fellowship').optional(),
        fellowship_details: fellowshipDetailsSchema.partial().optional()
    }))
});
// Schema for updating an employment opportunity
exports.updateEmploymentSchema = zod_1.z.object({
    params: idParamsSchema,
    body: baseOpportunitySchema.partial().merge(zod_1.z.object({
        type: zod_1.z.literal('employment').optional(),
        employment_details: employmentDetailsSchema.partial().optional()
    }))
});
// GanzAfrica Application Schema - with all required fields for GENERAL applications
exports.generalApplicationSchema = zod_1.z.object({
    body: zod_1.z.object({
        // Personal Information
        first_name: zod_1.z.string().min(2, 'First name must be at least 2 characters long'),
        last_name: zod_1.z.string().min(2, 'Last name must be at least 2 characters long'),
        email: zod_1.z.string().email('Invalid email format'),
        phone: zod_1.z.string().min(6, 'Phone number must be at least 6 characters long'),
        national_id: zod_1.z.string().min(3, 'National ID must be at least 3 characters long'),
        city: zod_1.z.string().min(2, 'City must be at least 2 characters long'),
        country: zod_1.z.string().min(2, 'Country must be at least 2 characters long'),
        // Education & Experience
        education_level: zod_1.z.enum([
            'high_school',
            'associate_degree',
            'bachelors_degree',
            'masters_degree',
            'doctorate',
            'professional_certification',
            'other'
        ]),
        field_of_study: zod_1.z.string().min(2, 'Field of study must be at least 2 characters long'),
        career_experience: zod_1.z.string().min(10, 'Career experience must be at least 10 characters long'),
        cv_url: zod_1.z.string().min(5, 'CV upload is required'),
        supporting_docs_url: zod_1.z.string().optional(),
        // Vision & Motivation
        motivation: zod_1.z.string().min(10, 'Motivation must be at least 10 characters long'),
        five_year_vision: zod_1.z.string().min(10, 'Five-year vision must be at least 10 characters long'),
        // Community Impact
        desired_impact: zod_1.z.string().min(10, 'Desired impact must be at least 10 characters long'),
        community_role: zod_1.z.string().min(10, 'Community role must be at least 10 characters long'),
        national_strategy: zod_1.z.string().min(10, 'National strategy contribution must be at least 10 characters long'),
        // Programme Relevance
        how_ganzafrica_can_help: zod_1.z.string().min(10, 'This field must be at least 10 characters long'),
        contribution_to_ganzafrica: zod_1.z.string().min(10, 'This field must be at least 10 characters long'),
        data_processing_consent: zod_1.z.boolean().refine(val => val === true, {
            message: 'You must consent to data processing to submit your application'
        }),
        // Optional fields for opportunity-specific applications
        user_id: zod_1.z.number().optional(),
    })
});
// Schema for application submission
exports.applicationSubmissionSchema = zod_1.z.object({
    params: idParamsSchema,
    body: zod_1.z.object({
        // Standard required fields
        full_name: zod_1.z.string()
            .min(2, 'Full name must be at least 2 characters long')
            .max(200, 'Full name must be at most 200 characters long'),
        email: zod_1.z.string().email('Invalid email format'),
        phone: zod_1.z.string().optional(),
        gender: zod_1.z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say', 'other']).optional(),
        nationality: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        education_level: zod_1.z.enum([
            'high_school',
            'associate_degree',
            'bachelors_degree',
            'masters_degree',
            'doctorate',
            'professional_certification',
            'other'
        ]).optional(),
        institution: zod_1.z.string().optional(),
        field_of_study: zod_1.z.string().optional(),
        graduation_year: zod_1.z.number().int().positive().optional(),
        certifications: zod_1.z.array(zod_1.z.string()).optional(),
        // Custom answers - schema will be validated dynamically based on opportunity questions
        custom_answers: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
    })
});
// Schema for updating application status
exports.updateApplicationStatusSchema = zod_1.z.object({
    params: idParamsSchema,
    body: zod_1.z.object({
        status: zod_1.z.enum([
            'submitted',
            'under_review',
            'shortlisted',
            'interviewed',
            'accepted',
            'rejected',
            'waitlisted',
            'withdrawn'
        ])
    })
});
// Schema for submitting application review
exports.applicationReviewSchema = zod_1.z.object({
    params: idParamsSchema,
    body: zod_1.z.object({
        score: zod_1.z.number().min(1).max(10).optional(),
        comments: zod_1.z.string().optional(),
        recommendation: zod_1.z.string().optional()
    })
});
// Export all opportunity validation schemas
exports.opportunityValidation = {
    createFellowshipSchema: exports.createFellowshipSchema,
    createEmploymentSchema: exports.createEmploymentSchema,
    getOpportunitySchema: exports.getOpportunitySchema,
    updateFellowshipSchema: exports.updateFellowshipSchema,
    updateEmploymentSchema: exports.updateEmploymentSchema,
    applicationSubmissionSchema: exports.applicationSubmissionSchema,
    generalApplicationSchema: exports.generalApplicationSchema,
    updateApplicationStatusSchema: exports.updateApplicationStatusSchema,
    applicationReviewSchema: exports.applicationReviewSchema
};
exports.default = exports.opportunityValidation;
