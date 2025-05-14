import { z } from "zod";
export declare const createFaqSchema: z.ZodObject<{
    body: z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodString;
        is_active: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        question: string;
        answer: string;
        is_active?: boolean | undefined;
    }, {
        question: string;
        answer: string;
        is_active?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        question: string;
        answer: string;
        is_active?: boolean | undefined;
    };
}, {
    body: {
        question: string;
        answer: string;
        is_active?: boolean | undefined;
    };
}>;
export declare const getFaqSchema: z.ZodObject<{
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
export declare const updateFaqSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        question: z.ZodOptional<z.ZodString>;
        answer: z.ZodOptional<z.ZodString>;
        is_active: z.ZodOptional<z.ZodBoolean>;
        view_count: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        question?: string | undefined;
        answer?: string | undefined;
        is_active?: boolean | undefined;
        view_count?: number | undefined;
    }, {
        question?: string | undefined;
        answer?: string | undefined;
        is_active?: boolean | undefined;
        view_count?: number | undefined;
    }>, {
        question?: string | undefined;
        answer?: string | undefined;
        is_active?: boolean | undefined;
        view_count?: number | undefined;
    }, {
        question?: string | undefined;
        answer?: string | undefined;
        is_active?: boolean | undefined;
        view_count?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        question?: string | undefined;
        answer?: string | undefined;
        is_active?: boolean | undefined;
        view_count?: number | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        question?: string | undefined;
        answer?: string | undefined;
        is_active?: boolean | undefined;
        view_count?: number | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deleteFaqSchema: z.ZodObject<{
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
export declare const faqValidation: {
    createFaqSchema: z.ZodObject<{
        body: z.ZodObject<{
            question: z.ZodString;
            answer: z.ZodString;
            is_active: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            question: string;
            answer: string;
            is_active?: boolean | undefined;
        }, {
            question: string;
            answer: string;
            is_active?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            question: string;
            answer: string;
            is_active?: boolean | undefined;
        };
    }, {
        body: {
            question: string;
            answer: string;
            is_active?: boolean | undefined;
        };
    }>;
    getFaqSchema: z.ZodObject<{
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
    updateFaqSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            question: z.ZodOptional<z.ZodString>;
            answer: z.ZodOptional<z.ZodString>;
            is_active: z.ZodOptional<z.ZodBoolean>;
            view_count: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            question?: string | undefined;
            answer?: string | undefined;
            is_active?: boolean | undefined;
            view_count?: number | undefined;
        }, {
            question?: string | undefined;
            answer?: string | undefined;
            is_active?: boolean | undefined;
            view_count?: number | undefined;
        }>, {
            question?: string | undefined;
            answer?: string | undefined;
            is_active?: boolean | undefined;
            view_count?: number | undefined;
        }, {
            question?: string | undefined;
            answer?: string | undefined;
            is_active?: boolean | undefined;
            view_count?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            question?: string | undefined;
            answer?: string | undefined;
            is_active?: boolean | undefined;
            view_count?: number | undefined;
        };
        params: {
            id: string;
        };
    }, {
        body: {
            question?: string | undefined;
            answer?: string | undefined;
            is_active?: boolean | undefined;
            view_count?: number | undefined;
        };
        params: {
            id: string;
        };
    }>;
    deleteFaqSchema: z.ZodObject<{
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
export default faqValidation;
//# sourceMappingURL=faqs.d.ts.map