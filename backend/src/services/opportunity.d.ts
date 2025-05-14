export type CreateOpportunityInput = {
    title: string;
    description: string;
    type: 'fellowship' | 'employment';
    status?: 'draft' | 'published' | 'closed' | 'cancelled';
    location_type?: string;
    location?: string;
    application_deadline: string | Date;
    eligibility_criteria?: {
        countries?: string[];
        min_education_level?: string;
        experience_years?: number;
        skills_required?: string[];
        other_requirements?: string[];
    };
    custom_questions?: Array<{
        id?: string;
        question: string;
        field_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file';
        options?: string[];
        is_required: boolean;
        max_length?: number;
        order: number;
    }>;
    category_id?: number;
    created_by: number;
    fellowship_details?: any;
    employment_details?: any;
};
export type UpdateOpportunityInput = Partial<Omit<CreateOpportunityInput, 'created_by'>>;
export type OpportunityFilters = {
    type?: string;
    status?: string;
    category_id?: number;
};
export type ApplicationInput = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    national_id: string;
    city: string;
    country: string;
    education_level: string;
    field_of_study: string;
    career_experience: string;
    cv_url: string;
    supporting_docs_url?: string;
    motivation: string;
    five_year_vision: string;
    desired_impact: string;
    community_role: string;
    national_strategy: string;
    how_ganzafrica_can_help: string;
    contribution_to_ganzafrica: string;
    data_processing_consent: boolean;
    opportunity_id?: number;
    custom_answers?: Record<string, any>;
    user_id?: number;
};
export type ReviewInput = {
    application_id: number;
    reviewer_id: number;
    score?: number;
    comments?: string;
    recommendation?: string;
};
export declare function createOpportunity(opportunityData: CreateOpportunityInput): Promise<any>;
export declare function getOpportunityById(id: number): Promise<any>;
export declare function updateOpportunity(id: number, updateData: UpdateOpportunityInput): Promise<any>;
export declare function updateOpportunityStatus(id: number, status: string): Promise<any>;
export declare function deleteOpportunity(id: number): Promise<boolean>;
export declare function listOpportunities(filters: OpportunityFilters): Promise<any[]>;
export declare function submitApplication(applicationData: ApplicationInput): Promise<any>;
export declare function getApplicationById(id: number): Promise<any>;
export declare function listApplications(opportunityId: number, status?: string): Promise<any[]>;
export declare function updateApplicationStatus(id: number, status: string): Promise<any>;
/**
 * List all applications across all opportunities with optional filtering
 */
export declare function listAllApplications(status?: string, page?: number, limit?: number): Promise<any>;
export declare function submitApplicationReview(reviewData: ReviewInput): Promise<any>;
export declare const opportunityService: {
    createOpportunity: typeof createOpportunity;
    getOpportunityById: typeof getOpportunityById;
    updateOpportunity: typeof updateOpportunity;
    updateOpportunityStatus: typeof updateOpportunityStatus;
    deleteOpportunity: typeof deleteOpportunity;
    listOpportunities: typeof listOpportunities;
    submitApplication: typeof submitApplication;
    getApplicationById: typeof getApplicationById;
    listApplications: typeof listApplications;
    updateApplicationStatus: typeof updateApplicationStatus;
    submitApplicationReview: typeof submitApplicationReview;
    listAllApplications: typeof listAllApplications;
};
export default opportunityService;
//# sourceMappingURL=opportunity.d.ts.map