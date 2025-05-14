import { z } from "zod";
export declare const createTestimonialSchema: z.ZodObject<{
    body: z.ZodObject<{
        author_name: z.ZodString;
        position: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        occupation: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        rating: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        author_name: string;
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        rating?: number | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    }, {
        description: string;
        author_name: string;
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        rating?: number | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        description: string;
        author_name: string;
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        rating?: number | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    };
}, {
    body: {
        description: string;
        author_name: string;
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        rating?: number | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    };
}>;
export declare const getTestimonialSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const updateTestimonialSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        author_name: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        occupation: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        rating: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        author_name?: string | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    }, {
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        author_name?: string | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    }>, {
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        author_name?: string | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    }, {
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        author_name?: string | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        author_name?: string | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        position?: string | undefined;
        image?: string | undefined;
        date?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        author_name?: string | undefined;
        company?: string | undefined;
        occupation?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deleteTestimonialSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const testimonialValidation: {
    createTestimonialSchema: z.ZodObject<{
        body: z.ZodObject<{
            author_name: z.ZodString;
            position: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
            description: z.ZodString;
            company: z.ZodOptional<z.ZodString>;
            occupation: z.ZodOptional<z.ZodString>;
            date: z.ZodOptional<z.ZodString>;
            rating: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            author_name: string;
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            rating?: number | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        }, {
            description: string;
            author_name: string;
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            rating?: number | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            description: string;
            author_name: string;
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            rating?: number | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        };
    }, {
        body: {
            description: string;
            author_name: string;
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            rating?: number | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        };
    }>;
    getTestimonialSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            id: string;
        };
    }, {
        params: {
            id: string;
        };
    }>;
    updateTestimonialSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            author_name: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            company: z.ZodOptional<z.ZodString>;
            occupation: z.ZodOptional<z.ZodString>;
            date: z.ZodOptional<z.ZodString>;
            rating: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            description?: string | undefined;
            rating?: number | undefined;
            author_name?: string | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        }, {
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            description?: string | undefined;
            rating?: number | undefined;
            author_name?: string | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        }>, {
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            description?: string | undefined;
            rating?: number | undefined;
            author_name?: string | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        }, {
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            description?: string | undefined;
            rating?: number | undefined;
            author_name?: string | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            description?: string | undefined;
            rating?: number | undefined;
            author_name?: string | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        };
        params: {
            id: string;
        };
    }, {
        body: {
            position?: string | undefined;
            image?: string | undefined;
            date?: string | undefined;
            description?: string | undefined;
            rating?: number | undefined;
            author_name?: string | undefined;
            company?: string | undefined;
            occupation?: string | undefined;
        };
        params: {
            id: string;
        };
    }>;
    deleteTestimonialSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            id: string;
        };
    }, {
        params: {
            id: string;
        };
    }>;
};
export default testimonialValidation;
//# sourceMappingURL=testimonials.validation.d.ts.map