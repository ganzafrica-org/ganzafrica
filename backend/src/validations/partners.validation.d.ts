import { z } from "zod";
export declare const createPartnerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        logo: z.ZodOptional<z.ZodString>;
        website_url: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    }, {
        name: string;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    };
}, {
    body: {
        name: string;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    };
}>;
export declare const getPartnerSchema: z.ZodObject<{
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
export declare const updatePartnerSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        logo: z.ZodOptional<z.ZodString>;
        website_url: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    }, {
        name?: string | undefined;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    }>, {
        name?: string | undefined;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    }, {
        name?: string | undefined;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        name?: string | undefined;
        location?: string | undefined;
        logo?: string | undefined;
        website_url?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deletePartnerSchema: z.ZodObject<{
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
export declare const partnerValidation: {
    createPartnerSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            logo: z.ZodOptional<z.ZodString>;
            website_url: z.ZodOptional<z.ZodString>;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        }, {
            name: string;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        };
    }, {
        body: {
            name: string;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        };
    }>;
    getPartnerSchema: z.ZodObject<{
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
    updatePartnerSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            logo: z.ZodOptional<z.ZodString>;
            website_url: z.ZodOptional<z.ZodString>;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        }, {
            name?: string | undefined;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        }>, {
            name?: string | undefined;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        }, {
            name?: string | undefined;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name?: string | undefined;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        };
        params: {
            id: string;
        };
    }, {
        body: {
            name?: string | undefined;
            location?: string | undefined;
            logo?: string | undefined;
            website_url?: string | undefined;
        };
        params: {
            id: string;
        };
    }>;
    deletePartnerSchema: z.ZodObject<{
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
export default partnerValidation;
//# sourceMappingURL=partners.validation.d.ts.map