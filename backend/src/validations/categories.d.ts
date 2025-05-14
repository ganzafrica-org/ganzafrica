import { z } from "zod";
export declare const createCategorySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        description?: string | undefined;
    };
}, {
    body: {
        name: string;
        description?: string | undefined;
    };
}>;
export declare const getCategorySchema: z.ZodObject<{
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
export declare const updateCategorySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        description?: string | undefined;
    }, {
        name?: string | undefined;
        description?: string | undefined;
    }>, {
        name?: string | undefined;
        description?: string | undefined;
    }, {
        name?: string | undefined;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deleteCategorySchema: z.ZodObject<{
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
export declare const categoryValidation: {
    createCategorySchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            description?: string | undefined;
        }, {
            name: string;
            description?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
            description?: string | undefined;
        };
    }, {
        body: {
            name: string;
            description?: string | undefined;
        };
    }>;
    getCategorySchema: z.ZodObject<{
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
    updateCategorySchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            description?: string | undefined;
        }, {
            name?: string | undefined;
            description?: string | undefined;
        }>, {
            name?: string | undefined;
            description?: string | undefined;
        }, {
            name?: string | undefined;
            description?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name?: string | undefined;
            description?: string | undefined;
        };
        params: {
            id: string;
        };
    }, {
        body: {
            name?: string | undefined;
            description?: string | undefined;
        };
        params: {
            id: string;
        };
    }>;
    deleteCategorySchema: z.ZodObject<{
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
export default categoryValidation;
//# sourceMappingURL=categories.d.ts.map