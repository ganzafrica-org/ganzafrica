import { z } from 'zod';
export declare const createFellowshipSchema: z.ZodObject<{
    body: z.ZodObject<z.objectUtil.extendShape<{
        title: z.ZodString;
        description: z.ZodString;
        type: z.ZodEnum<["fellowship", "employment"]>;
        status: z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>;
        location_type: z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>;
        location: z.ZodOptional<z.ZodString>;
        application_deadline: z.ZodEffects<z.ZodString, string, string>;
        eligibility_criteria: z.ZodOptional<z.ZodObject<{
            countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            min_education_level: z.ZodOptional<z.ZodString>;
            experience_years: z.ZodOptional<z.ZodNumber>;
            skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }>>;
        custom_questions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            question: z.ZodString;
            field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            is_required: z.ZodDefault<z.ZodBoolean>;
            max_length: z.ZodOptional<z.ZodNumber>;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, "many">>;
        category_id: z.ZodOptional<z.ZodNumber>;
    }, {
        type: z.ZodLiteral<"fellowship">;
        fellowship_details: z.ZodObject<{
            program_name: z.ZodString;
            cohort: z.ZodOptional<z.ZodString>;
            fellowship_type: z.ZodOptional<z.ZodString>;
            learning_outcomes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            program_structure: z.ZodOptional<z.ZodObject<{
                phases: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodString;
                    duration_weeks: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }, {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }>, "many">>;
                activities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            }, {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            program_name: string;
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        }, {
            program_name: string;
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        }>;
    }>, "strip", z.ZodTypeAny, {
        title: string;
        type: "fellowship";
        status: "published" | "draft" | "closed" | "cancelled";
        fellowship_details: {
            program_name: string;
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        };
        description: string;
        location_type: "remote" | "onsite" | "hybrid";
        application_deadline: string;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
    }, {
        title: string;
        type: "fellowship";
        fellowship_details: {
            program_name: string;
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        };
        description: string;
        application_deadline: string;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        type: "fellowship";
        status: "published" | "draft" | "closed" | "cancelled";
        fellowship_details: {
            program_name: string;
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        };
        description: string;
        location_type: "remote" | "onsite" | "hybrid";
        application_deadline: string;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
    };
}, {
    body: {
        title: string;
        type: "fellowship";
        fellowship_details: {
            program_name: string;
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        };
        description: string;
        application_deadline: string;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
    };
}>;
export declare const createEmploymentSchema: z.ZodObject<{
    body: z.ZodObject<z.objectUtil.extendShape<{
        title: z.ZodString;
        description: z.ZodString;
        type: z.ZodEnum<["fellowship", "employment"]>;
        status: z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>;
        location_type: z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>;
        location: z.ZodOptional<z.ZodString>;
        application_deadline: z.ZodEffects<z.ZodString, string, string>;
        eligibility_criteria: z.ZodOptional<z.ZodObject<{
            countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            min_education_level: z.ZodOptional<z.ZodString>;
            experience_years: z.ZodOptional<z.ZodNumber>;
            skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }>>;
        custom_questions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            question: z.ZodString;
            field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            is_required: z.ZodDefault<z.ZodBoolean>;
            max_length: z.ZodOptional<z.ZodNumber>;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, "many">>;
        category_id: z.ZodOptional<z.ZodNumber>;
    }, {
        type: z.ZodLiteral<"employment">;
        employment_details: z.ZodObject<{
            position_level: z.ZodOptional<z.ZodString>;
            employment_type: z.ZodString;
            department: z.ZodOptional<z.ZodString>;
            responsibilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            qualifications: z.ZodOptional<z.ZodObject<{
                required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            }, {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            employment_type: string;
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            department?: string | undefined;
        }, {
            employment_type: string;
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            department?: string | undefined;
        }>;
    }>, "strip", z.ZodTypeAny, {
        title: string;
        type: "employment";
        status: "published" | "draft" | "closed" | "cancelled";
        description: string;
        location_type: "remote" | "onsite" | "hybrid";
        application_deadline: string;
        employment_details: {
            employment_type: string;
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            department?: string | undefined;
        };
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
    }, {
        title: string;
        type: "employment";
        description: string;
        application_deadline: string;
        employment_details: {
            employment_type: string;
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            department?: string | undefined;
        };
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        type: "employment";
        status: "published" | "draft" | "closed" | "cancelled";
        description: string;
        location_type: "remote" | "onsite" | "hybrid";
        application_deadline: string;
        employment_details: {
            employment_type: string;
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            department?: string | undefined;
        };
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
    };
}, {
    body: {
        title: string;
        type: "employment";
        description: string;
        application_deadline: string;
        employment_details: {
            employment_type: string;
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            department?: string | undefined;
        };
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
    };
}>;
export declare const getOpportunitySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
    }, "strip", z.ZodTypeAny, {
        id: number;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: number;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const updateFellowshipSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
    }, "strip", z.ZodTypeAny, {
        id: number;
    }, {
        id: string;
    }>;
    body: z.ZodObject<z.objectUtil.extendShape<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["fellowship", "employment"]>>;
        status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>>;
        location_type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>>;
        location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        application_deadline: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        eligibility_criteria: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            min_education_level: z.ZodOptional<z.ZodString>;
            experience_years: z.ZodOptional<z.ZodNumber>;
            skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }>>>;
        custom_questions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            question: z.ZodString;
            field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            is_required: z.ZodDefault<z.ZodBoolean>;
            max_length: z.ZodOptional<z.ZodNumber>;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, "many">>>;
        category_id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, {
        type: z.ZodOptional<z.ZodLiteral<"fellowship">>;
        fellowship_details: z.ZodOptional<z.ZodObject<{
            program_name: z.ZodOptional<z.ZodString>;
            cohort: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            fellowship_type: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            learning_outcomes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            program_structure: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                phases: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodString;
                    duration_weeks: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }, {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }>, "many">>;
                activities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            }, {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            }>>>;
        }, "strip", z.ZodTypeAny, {
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            program_name?: string | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        }, {
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            program_name?: string | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        }>>;
    }>, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        type?: "fellowship" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        fellowship_details?: {
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            program_name?: string | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        } | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
    }, {
        title?: string | undefined;
        type?: "fellowship" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        fellowship_details?: {
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            program_name?: string | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        } | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title?: string | undefined;
        type?: "fellowship" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        fellowship_details?: {
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            program_name?: string | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        } | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
    };
    params: {
        id: number;
    };
}, {
    body: {
        title?: string | undefined;
        type?: "fellowship" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        fellowship_details?: {
            learning_outcomes?: string[] | undefined;
            program_structure?: {
                activities?: string[] | undefined;
                phases?: {
                    name: string;
                    description: string;
                    duration_weeks: number;
                }[] | undefined;
            } | undefined;
            program_name?: string | undefined;
            cohort?: string | undefined;
            fellowship_type?: string | undefined;
        } | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const updateEmploymentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
    }, "strip", z.ZodTypeAny, {
        id: number;
    }, {
        id: string;
    }>;
    body: z.ZodObject<z.objectUtil.extendShape<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["fellowship", "employment"]>>;
        status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>>;
        location_type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>>;
        location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        application_deadline: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        eligibility_criteria: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            min_education_level: z.ZodOptional<z.ZodString>;
            experience_years: z.ZodOptional<z.ZodNumber>;
            skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }, {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        }>>>;
        custom_questions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            question: z.ZodString;
            field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            is_required: z.ZodDefault<z.ZodBoolean>;
            max_length: z.ZodOptional<z.ZodNumber>;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }, {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }>, "many">>>;
        category_id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, {
        type: z.ZodOptional<z.ZodLiteral<"employment">>;
        employment_details: z.ZodOptional<z.ZodObject<{
            position_level: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            employment_type: z.ZodOptional<z.ZodString>;
            department: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            responsibilities: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            qualifications: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            }, {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            }>>>;
        }, "strip", z.ZodTypeAny, {
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            employment_type?: string | undefined;
            department?: string | undefined;
        }, {
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            employment_type?: string | undefined;
            department?: string | undefined;
        }>>;
    }>, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        type?: "employment" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
        employment_details?: {
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            employment_type?: string | undefined;
            department?: string | undefined;
        } | undefined;
    }, {
        title?: string | undefined;
        type?: "employment" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
        employment_details?: {
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            employment_type?: string | undefined;
            department?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title?: string | undefined;
        type?: "employment" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            is_required: boolean;
            id?: string | undefined;
            options?: string[] | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
        employment_details?: {
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            employment_type?: string | undefined;
            department?: string | undefined;
        } | undefined;
    };
    params: {
        id: number;
    };
}, {
    body: {
        title?: string | undefined;
        type?: "employment" | undefined;
        status?: "published" | "draft" | "closed" | "cancelled" | undefined;
        eligibility_criteria?: {
            experience_years?: number | undefined;
            countries?: string[] | undefined;
            skills_required?: string[] | undefined;
            other_requirements?: string[] | undefined;
            min_education_level?: string | undefined;
        } | undefined;
        custom_questions?: {
            order: number;
            question: string;
            field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
            id?: string | undefined;
            options?: string[] | undefined;
            is_required?: boolean | undefined;
            max_length?: number | undefined;
        }[] | undefined;
        description?: string | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        location_type?: "remote" | "onsite" | "hybrid" | undefined;
        application_deadline?: string | undefined;
        employment_details?: {
            responsibilities?: string[] | undefined;
            qualifications?: {
                required?: string[] | undefined;
                preferred?: string[] | undefined;
            } | undefined;
            position_level?: string | undefined;
            employment_type?: string | undefined;
            department?: string | undefined;
        } | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const generalApplicationSchema: z.ZodObject<{
    body: z.ZodObject<{
        first_name: z.ZodString;
        last_name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        national_id: z.ZodString;
        city: z.ZodString;
        country: z.ZodString;
        education_level: z.ZodEnum<["high_school", "associate_degree", "bachelors_degree", "masters_degree", "doctorate", "professional_certification", "other"]>;
        field_of_study: z.ZodString;
        career_experience: z.ZodString;
        cv_url: z.ZodString;
        supporting_docs_url: z.ZodOptional<z.ZodString>;
        motivation: z.ZodString;
        five_year_vision: z.ZodString;
        desired_impact: z.ZodString;
        community_role: z.ZodString;
        national_strategy: z.ZodString;
        how_ganzafrica_can_help: z.ZodString;
        contribution_to_ganzafrica: z.ZodString;
        data_processing_consent: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
        user_id: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        phone: string;
        country: string;
        education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
        field_of_study: string;
        first_name: string;
        last_name: string;
        motivation: string;
        city: string;
        national_id: string;
        career_experience: string;
        cv_url: string;
        five_year_vision: string;
        desired_impact: string;
        community_role: string;
        national_strategy: string;
        how_ganzafrica_can_help: string;
        contribution_to_ganzafrica: string;
        data_processing_consent: boolean;
        user_id?: number | undefined;
        supporting_docs_url?: string | undefined;
    }, {
        email: string;
        phone: string;
        country: string;
        education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
        field_of_study: string;
        first_name: string;
        last_name: string;
        motivation: string;
        city: string;
        national_id: string;
        career_experience: string;
        cv_url: string;
        five_year_vision: string;
        desired_impact: string;
        community_role: string;
        national_strategy: string;
        how_ganzafrica_can_help: string;
        contribution_to_ganzafrica: string;
        data_processing_consent: boolean;
        user_id?: number | undefined;
        supporting_docs_url?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        phone: string;
        country: string;
        education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
        field_of_study: string;
        first_name: string;
        last_name: string;
        motivation: string;
        city: string;
        national_id: string;
        career_experience: string;
        cv_url: string;
        five_year_vision: string;
        desired_impact: string;
        community_role: string;
        national_strategy: string;
        how_ganzafrica_can_help: string;
        contribution_to_ganzafrica: string;
        data_processing_consent: boolean;
        user_id?: number | undefined;
        supporting_docs_url?: string | undefined;
    };
}, {
    body: {
        email: string;
        phone: string;
        country: string;
        education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
        field_of_study: string;
        first_name: string;
        last_name: string;
        motivation: string;
        city: string;
        national_id: string;
        career_experience: string;
        cv_url: string;
        five_year_vision: string;
        desired_impact: string;
        community_role: string;
        national_strategy: string;
        how_ganzafrica_can_help: string;
        contribution_to_ganzafrica: string;
        data_processing_consent: boolean;
        user_id?: number | undefined;
        supporting_docs_url?: string | undefined;
    };
}>;
export declare const applicationSubmissionSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
    }, "strip", z.ZodTypeAny, {
        id: number;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        full_name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        gender: z.ZodOptional<z.ZodEnum<["male", "female", "non_binary", "prefer_not_to_say", "other"]>>;
        nationality: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        education_level: z.ZodOptional<z.ZodEnum<["high_school", "associate_degree", "bachelors_degree", "masters_degree", "doctorate", "professional_certification", "other"]>>;
        institution: z.ZodOptional<z.ZodString>;
        field_of_study: z.ZodOptional<z.ZodString>;
        graduation_year: z.ZodOptional<z.ZodNumber>;
        certifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        custom_answers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        full_name: string;
        phone?: string | undefined;
        gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
        nationality?: string | undefined;
        country?: string | undefined;
        education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
        institution?: string | undefined;
        field_of_study?: string | undefined;
        graduation_year?: number | undefined;
        certifications?: string[] | undefined;
        custom_answers?: Record<string, any> | undefined;
    }, {
        email: string;
        full_name: string;
        phone?: string | undefined;
        gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
        nationality?: string | undefined;
        country?: string | undefined;
        education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
        institution?: string | undefined;
        field_of_study?: string | undefined;
        graduation_year?: number | undefined;
        certifications?: string[] | undefined;
        custom_answers?: Record<string, any> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        full_name: string;
        phone?: string | undefined;
        gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
        nationality?: string | undefined;
        country?: string | undefined;
        education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
        institution?: string | undefined;
        field_of_study?: string | undefined;
        graduation_year?: number | undefined;
        certifications?: string[] | undefined;
        custom_answers?: Record<string, any> | undefined;
    };
    params: {
        id: number;
    };
}, {
    body: {
        email: string;
        full_name: string;
        phone?: string | undefined;
        gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
        nationality?: string | undefined;
        country?: string | undefined;
        education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
        institution?: string | undefined;
        field_of_study?: string | undefined;
        graduation_year?: number | undefined;
        certifications?: string[] | undefined;
        custom_answers?: Record<string, any> | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const updateApplicationStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
    }, "strip", z.ZodTypeAny, {
        id: number;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        status: z.ZodEnum<["submitted", "under_review", "shortlisted", "interviewed", "accepted", "rejected", "waitlisted", "withdrawn"]>;
    }, "strip", z.ZodTypeAny, {
        status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
    }, {
        status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
    };
    params: {
        id: number;
    };
}, {
    body: {
        status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
    };
    params: {
        id: string;
    };
}>;
export declare const applicationReviewSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
    }, "strip", z.ZodTypeAny, {
        id: number;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        score: z.ZodOptional<z.ZodNumber>;
        comments: z.ZodOptional<z.ZodString>;
        recommendation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        score?: number | undefined;
        comments?: string | undefined;
        recommendation?: string | undefined;
    }, {
        score?: number | undefined;
        comments?: string | undefined;
        recommendation?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        score?: number | undefined;
        comments?: string | undefined;
        recommendation?: string | undefined;
    };
    params: {
        id: number;
    };
}, {
    body: {
        score?: number | undefined;
        comments?: string | undefined;
        recommendation?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const opportunityValidation: {
    createFellowshipSchema: z.ZodObject<{
        body: z.ZodObject<z.objectUtil.extendShape<{
            title: z.ZodString;
            description: z.ZodString;
            type: z.ZodEnum<["fellowship", "employment"]>;
            status: z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>;
            location_type: z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>;
            location: z.ZodOptional<z.ZodString>;
            application_deadline: z.ZodEffects<z.ZodString, string, string>;
            eligibility_criteria: z.ZodOptional<z.ZodObject<{
                countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                min_education_level: z.ZodOptional<z.ZodString>;
                experience_years: z.ZodOptional<z.ZodNumber>;
                skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }>>;
            custom_questions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                question: z.ZodString;
                field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                is_required: z.ZodDefault<z.ZodBoolean>;
                max_length: z.ZodOptional<z.ZodNumber>;
                order: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, "many">>;
            category_id: z.ZodOptional<z.ZodNumber>;
        }, {
            type: z.ZodLiteral<"fellowship">;
            fellowship_details: z.ZodObject<{
                program_name: z.ZodString;
                cohort: z.ZodOptional<z.ZodString>;
                fellowship_type: z.ZodOptional<z.ZodString>;
                learning_outcomes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                program_structure: z.ZodOptional<z.ZodObject<{
                    phases: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        description: z.ZodString;
                        duration_weeks: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }, {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }>, "many">>;
                    activities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                }, {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                program_name: string;
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            }, {
                program_name: string;
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            }>;
        }>, "strip", z.ZodTypeAny, {
            title: string;
            type: "fellowship";
            status: "published" | "draft" | "closed" | "cancelled";
            fellowship_details: {
                program_name: string;
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            };
            description: string;
            location_type: "remote" | "onsite" | "hybrid";
            application_deadline: string;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
        }, {
            title: string;
            type: "fellowship";
            fellowship_details: {
                program_name: string;
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            };
            description: string;
            application_deadline: string;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            title: string;
            type: "fellowship";
            status: "published" | "draft" | "closed" | "cancelled";
            fellowship_details: {
                program_name: string;
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            };
            description: string;
            location_type: "remote" | "onsite" | "hybrid";
            application_deadline: string;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
        };
    }, {
        body: {
            title: string;
            type: "fellowship";
            fellowship_details: {
                program_name: string;
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            };
            description: string;
            application_deadline: string;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
        };
    }>;
    createEmploymentSchema: z.ZodObject<{
        body: z.ZodObject<z.objectUtil.extendShape<{
            title: z.ZodString;
            description: z.ZodString;
            type: z.ZodEnum<["fellowship", "employment"]>;
            status: z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>;
            location_type: z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>;
            location: z.ZodOptional<z.ZodString>;
            application_deadline: z.ZodEffects<z.ZodString, string, string>;
            eligibility_criteria: z.ZodOptional<z.ZodObject<{
                countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                min_education_level: z.ZodOptional<z.ZodString>;
                experience_years: z.ZodOptional<z.ZodNumber>;
                skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }>>;
            custom_questions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                question: z.ZodString;
                field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                is_required: z.ZodDefault<z.ZodBoolean>;
                max_length: z.ZodOptional<z.ZodNumber>;
                order: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, "many">>;
            category_id: z.ZodOptional<z.ZodNumber>;
        }, {
            type: z.ZodLiteral<"employment">;
            employment_details: z.ZodObject<{
                position_level: z.ZodOptional<z.ZodString>;
                employment_type: z.ZodString;
                department: z.ZodOptional<z.ZodString>;
                responsibilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                qualifications: z.ZodOptional<z.ZodObject<{
                    required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                }, {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                employment_type: string;
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                department?: string | undefined;
            }, {
                employment_type: string;
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                department?: string | undefined;
            }>;
        }>, "strip", z.ZodTypeAny, {
            title: string;
            type: "employment";
            status: "published" | "draft" | "closed" | "cancelled";
            description: string;
            location_type: "remote" | "onsite" | "hybrid";
            application_deadline: string;
            employment_details: {
                employment_type: string;
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                department?: string | undefined;
            };
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
        }, {
            title: string;
            type: "employment";
            description: string;
            application_deadline: string;
            employment_details: {
                employment_type: string;
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                department?: string | undefined;
            };
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            title: string;
            type: "employment";
            status: "published" | "draft" | "closed" | "cancelled";
            description: string;
            location_type: "remote" | "onsite" | "hybrid";
            application_deadline: string;
            employment_details: {
                employment_type: string;
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                department?: string | undefined;
            };
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
        };
    }, {
        body: {
            title: string;
            type: "employment";
            description: string;
            application_deadline: string;
            employment_details: {
                employment_type: string;
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                department?: string | undefined;
            };
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
        };
    }>;
    getOpportunitySchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
        }, "strip", z.ZodTypeAny, {
            id: number;
        }, {
            id: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            id: number;
        };
    }, {
        params: {
            id: string;
        };
    }>;
    updateFellowshipSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
        }, "strip", z.ZodTypeAny, {
            id: number;
        }, {
            id: string;
        }>;
        body: z.ZodObject<z.objectUtil.extendShape<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodEnum<["fellowship", "employment"]>>;
            status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>>;
            location_type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>>;
            location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            application_deadline: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            eligibility_criteria: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                min_education_level: z.ZodOptional<z.ZodString>;
                experience_years: z.ZodOptional<z.ZodNumber>;
                skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }>>>;
            custom_questions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                question: z.ZodString;
                field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                is_required: z.ZodDefault<z.ZodBoolean>;
                max_length: z.ZodOptional<z.ZodNumber>;
                order: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, "many">>>;
            category_id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        }, {
            type: z.ZodOptional<z.ZodLiteral<"fellowship">>;
            fellowship_details: z.ZodOptional<z.ZodObject<{
                program_name: z.ZodOptional<z.ZodString>;
                cohort: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                fellowship_type: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                learning_outcomes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
                program_structure: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    phases: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        description: z.ZodString;
                        duration_weeks: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }, {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }>, "many">>;
                    activities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                }, {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                }>>>;
            }, "strip", z.ZodTypeAny, {
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                program_name?: string | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            }, {
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                program_name?: string | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            }>>;
        }>, "strip", z.ZodTypeAny, {
            title?: string | undefined;
            type?: "fellowship" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            fellowship_details?: {
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                program_name?: string | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            } | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
        }, {
            title?: string | undefined;
            type?: "fellowship" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            fellowship_details?: {
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                program_name?: string | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            } | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            title?: string | undefined;
            type?: "fellowship" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            fellowship_details?: {
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                program_name?: string | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            } | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
        };
        params: {
            id: number;
        };
    }, {
        body: {
            title?: string | undefined;
            type?: "fellowship" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            fellowship_details?: {
                learning_outcomes?: string[] | undefined;
                program_structure?: {
                    activities?: string[] | undefined;
                    phases?: {
                        name: string;
                        description: string;
                        duration_weeks: number;
                    }[] | undefined;
                } | undefined;
                program_name?: string | undefined;
                cohort?: string | undefined;
                fellowship_type?: string | undefined;
            } | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
        };
        params: {
            id: string;
        };
    }>;
    updateEmploymentSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
        }, "strip", z.ZodTypeAny, {
            id: number;
        }, {
            id: string;
        }>;
        body: z.ZodObject<z.objectUtil.extendShape<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodEnum<["fellowship", "employment"]>>;
            status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["draft", "published", "closed", "cancelled"]>>>;
            location_type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["remote", "onsite", "hybrid"]>>>;
            location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            application_deadline: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            eligibility_criteria: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                countries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                min_education_level: z.ZodOptional<z.ZodString>;
                experience_years: z.ZodOptional<z.ZodNumber>;
                skills_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                other_requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }, {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            }>>>;
            custom_questions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                question: z.ZodString;
                field_type: z.ZodEnum<["text", "textarea", "select", "multiselect", "checkbox", "radio", "file"]>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                is_required: z.ZodDefault<z.ZodBoolean>;
                max_length: z.ZodOptional<z.ZodNumber>;
                order: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }, {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }>, "many">>>;
            category_id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        }, {
            type: z.ZodOptional<z.ZodLiteral<"employment">>;
            employment_details: z.ZodOptional<z.ZodObject<{
                position_level: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                employment_type: z.ZodOptional<z.ZodString>;
                department: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                responsibilities: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
                qualifications: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                    required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                }, {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                }>>>;
            }, "strip", z.ZodTypeAny, {
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                employment_type?: string | undefined;
                department?: string | undefined;
            }, {
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                employment_type?: string | undefined;
                department?: string | undefined;
            }>>;
        }>, "strip", z.ZodTypeAny, {
            title?: string | undefined;
            type?: "employment" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
            employment_details?: {
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                employment_type?: string | undefined;
                department?: string | undefined;
            } | undefined;
        }, {
            title?: string | undefined;
            type?: "employment" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
            employment_details?: {
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                employment_type?: string | undefined;
                department?: string | undefined;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            title?: string | undefined;
            type?: "employment" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                is_required: boolean;
                id?: string | undefined;
                options?: string[] | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
            employment_details?: {
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                employment_type?: string | undefined;
                department?: string | undefined;
            } | undefined;
        };
        params: {
            id: number;
        };
    }, {
        body: {
            title?: string | undefined;
            type?: "employment" | undefined;
            status?: "published" | "draft" | "closed" | "cancelled" | undefined;
            eligibility_criteria?: {
                experience_years?: number | undefined;
                countries?: string[] | undefined;
                skills_required?: string[] | undefined;
                other_requirements?: string[] | undefined;
                min_education_level?: string | undefined;
            } | undefined;
            custom_questions?: {
                order: number;
                question: string;
                field_type: "text" | "select" | "textarea" | "checkbox" | "file" | "radio" | "multiselect";
                id?: string | undefined;
                options?: string[] | undefined;
                is_required?: boolean | undefined;
                max_length?: number | undefined;
            }[] | undefined;
            description?: string | undefined;
            category_id?: number | undefined;
            location?: string | undefined;
            location_type?: "remote" | "onsite" | "hybrid" | undefined;
            application_deadline?: string | undefined;
            employment_details?: {
                responsibilities?: string[] | undefined;
                qualifications?: {
                    required?: string[] | undefined;
                    preferred?: string[] | undefined;
                } | undefined;
                position_level?: string | undefined;
                employment_type?: string | undefined;
                department?: string | undefined;
            } | undefined;
        };
        params: {
            id: string;
        };
    }>;
    applicationSubmissionSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
        }, "strip", z.ZodTypeAny, {
            id: number;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            full_name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            gender: z.ZodOptional<z.ZodEnum<["male", "female", "non_binary", "prefer_not_to_say", "other"]>>;
            nationality: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            education_level: z.ZodOptional<z.ZodEnum<["high_school", "associate_degree", "bachelors_degree", "masters_degree", "doctorate", "professional_certification", "other"]>>;
            institution: z.ZodOptional<z.ZodString>;
            field_of_study: z.ZodOptional<z.ZodString>;
            graduation_year: z.ZodOptional<z.ZodNumber>;
            certifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            custom_answers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            full_name: string;
            phone?: string | undefined;
            gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
            nationality?: string | undefined;
            country?: string | undefined;
            education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
            institution?: string | undefined;
            field_of_study?: string | undefined;
            graduation_year?: number | undefined;
            certifications?: string[] | undefined;
            custom_answers?: Record<string, any> | undefined;
        }, {
            email: string;
            full_name: string;
            phone?: string | undefined;
            gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
            nationality?: string | undefined;
            country?: string | undefined;
            education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
            institution?: string | undefined;
            field_of_study?: string | undefined;
            graduation_year?: number | undefined;
            certifications?: string[] | undefined;
            custom_answers?: Record<string, any> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            email: string;
            full_name: string;
            phone?: string | undefined;
            gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
            nationality?: string | undefined;
            country?: string | undefined;
            education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
            institution?: string | undefined;
            field_of_study?: string | undefined;
            graduation_year?: number | undefined;
            certifications?: string[] | undefined;
            custom_answers?: Record<string, any> | undefined;
        };
        params: {
            id: number;
        };
    }, {
        body: {
            email: string;
            full_name: string;
            phone?: string | undefined;
            gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
            nationality?: string | undefined;
            country?: string | undefined;
            education_level?: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification" | undefined;
            institution?: string | undefined;
            field_of_study?: string | undefined;
            graduation_year?: number | undefined;
            certifications?: string[] | undefined;
            custom_answers?: Record<string, any> | undefined;
        };
        params: {
            id: string;
        };
    }>;
    generalApplicationSchema: z.ZodObject<{
        body: z.ZodObject<{
            first_name: z.ZodString;
            last_name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodString;
            national_id: z.ZodString;
            city: z.ZodString;
            country: z.ZodString;
            education_level: z.ZodEnum<["high_school", "associate_degree", "bachelors_degree", "masters_degree", "doctorate", "professional_certification", "other"]>;
            field_of_study: z.ZodString;
            career_experience: z.ZodString;
            cv_url: z.ZodString;
            supporting_docs_url: z.ZodOptional<z.ZodString>;
            motivation: z.ZodString;
            five_year_vision: z.ZodString;
            desired_impact: z.ZodString;
            community_role: z.ZodString;
            national_strategy: z.ZodString;
            how_ganzafrica_can_help: z.ZodString;
            contribution_to_ganzafrica: z.ZodString;
            data_processing_consent: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
            user_id: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            phone: string;
            country: string;
            education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
            field_of_study: string;
            first_name: string;
            last_name: string;
            motivation: string;
            city: string;
            national_id: string;
            career_experience: string;
            cv_url: string;
            five_year_vision: string;
            desired_impact: string;
            community_role: string;
            national_strategy: string;
            how_ganzafrica_can_help: string;
            contribution_to_ganzafrica: string;
            data_processing_consent: boolean;
            user_id?: number | undefined;
            supporting_docs_url?: string | undefined;
        }, {
            email: string;
            phone: string;
            country: string;
            education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
            field_of_study: string;
            first_name: string;
            last_name: string;
            motivation: string;
            city: string;
            national_id: string;
            career_experience: string;
            cv_url: string;
            five_year_vision: string;
            desired_impact: string;
            community_role: string;
            national_strategy: string;
            how_ganzafrica_can_help: string;
            contribution_to_ganzafrica: string;
            data_processing_consent: boolean;
            user_id?: number | undefined;
            supporting_docs_url?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            email: string;
            phone: string;
            country: string;
            education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
            field_of_study: string;
            first_name: string;
            last_name: string;
            motivation: string;
            city: string;
            national_id: string;
            career_experience: string;
            cv_url: string;
            five_year_vision: string;
            desired_impact: string;
            community_role: string;
            national_strategy: string;
            how_ganzafrica_can_help: string;
            contribution_to_ganzafrica: string;
            data_processing_consent: boolean;
            user_id?: number | undefined;
            supporting_docs_url?: string | undefined;
        };
    }, {
        body: {
            email: string;
            phone: string;
            country: string;
            education_level: "other" | "high_school" | "associate_degree" | "bachelors_degree" | "masters_degree" | "doctorate" | "professional_certification";
            field_of_study: string;
            first_name: string;
            last_name: string;
            motivation: string;
            city: string;
            national_id: string;
            career_experience: string;
            cv_url: string;
            five_year_vision: string;
            desired_impact: string;
            community_role: string;
            national_strategy: string;
            how_ganzafrica_can_help: string;
            contribution_to_ganzafrica: string;
            data_processing_consent: boolean;
            user_id?: number | undefined;
            supporting_docs_url?: string | undefined;
        };
    }>;
    updateApplicationStatusSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
        }, "strip", z.ZodTypeAny, {
            id: number;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            status: z.ZodEnum<["submitted", "under_review", "shortlisted", "interviewed", "accepted", "rejected", "waitlisted", "withdrawn"]>;
        }, "strip", z.ZodTypeAny, {
            status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
        }, {
            status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
        };
        params: {
            id: number;
        };
    }, {
        body: {
            status: "rejected" | "under_review" | "shortlisted" | "waitlisted" | "withdrawn" | "submitted" | "interviewed" | "accepted";
        };
        params: {
            id: string;
        };
    }>;
    applicationReviewSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, number, string>;
        }, "strip", z.ZodTypeAny, {
            id: number;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            score: z.ZodOptional<z.ZodNumber>;
            comments: z.ZodOptional<z.ZodString>;
            recommendation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            score?: number | undefined;
            comments?: string | undefined;
            recommendation?: string | undefined;
        }, {
            score?: number | undefined;
            comments?: string | undefined;
            recommendation?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            score?: number | undefined;
            comments?: string | undefined;
            recommendation?: string | undefined;
        };
        params: {
            id: number;
        };
    }, {
        body: {
            score?: number | undefined;
            comments?: string | undefined;
            recommendation?: string | undefined;
        };
        params: {
            id: string;
        };
    }>;
};
export default opportunityValidation;
//# sourceMappingURL=opportunity.d.ts.map