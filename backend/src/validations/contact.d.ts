import { z } from "zod";
export declare const createContactSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        message: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        message: string;
        location?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        email: string;
        message: string;
        location?: string | undefined;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        email: string;
        message: string;
        location?: string | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        name: string;
        email: string;
        message: string;
        location?: string | undefined;
        phone?: string | undefined;
    };
}>;
export declare const getContactSchema: z.ZodObject<{
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
export declare const updateContactSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        status: z.ZodOptional<z.ZodString>;
        is_resolved: z.ZodOptional<z.ZodBoolean>;
        responded_at: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        is_resolved?: boolean | undefined;
        responded_at?: string | null | undefined;
    }, {
        status?: string | undefined;
        is_resolved?: boolean | undefined;
        responded_at?: string | null | undefined;
    }>, {
        status?: string | undefined;
        is_resolved?: boolean | undefined;
        responded_at?: string | null | undefined;
    }, {
        status?: string | undefined;
        is_resolved?: boolean | undefined;
        responded_at?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status?: string | undefined;
        is_resolved?: boolean | undefined;
        responded_at?: string | null | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        status?: string | undefined;
        is_resolved?: boolean | undefined;
        responded_at?: string | null | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deleteContactSchema: z.ZodObject<{
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
export declare const listContactsSchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodOptional<z.ZodString>;
        is_resolved: z.ZodOptional<z.ZodEffects<z.ZodString, "true" | "false", string>>;
        location: z.ZodOptional<z.ZodString>;
        sort_by: z.ZodOptional<z.ZodString>;
        sort_order: z.ZodOptional<z.ZodEffects<z.ZodString, "desc" | "asc", string>>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        location?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        is_resolved?: "true" | "false" | undefined;
    }, {
        status?: string | undefined;
        location?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: string | undefined;
        is_resolved?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        status?: string | undefined;
        location?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        is_resolved?: "true" | "false" | undefined;
    };
}, {
    query: {
        status?: string | undefined;
        location?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: string | undefined;
        is_resolved?: string | undefined;
    };
}>;
export declare const newsletterSubscribeSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
    };
}, {
    body: {
        email: string;
    };
}>;
export declare const newsletterUnsubscribeSchema: z.ZodObject<{
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
export declare const listNewsletterSubscribersSchema: z.ZodObject<{
    query: z.ZodObject<{
        active_only: z.ZodOptional<z.ZodEffects<z.ZodString, "true" | "false", string>>;
        sort_by: z.ZodOptional<z.ZodString>;
        sort_order: z.ZodOptional<z.ZodEffects<z.ZodString, "desc" | "asc", string>>;
    }, "strip", z.ZodTypeAny, {
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        active_only?: "true" | "false" | undefined;
    }, {
        sort_by?: string | undefined;
        sort_order?: string | undefined;
        active_only?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        active_only?: "true" | "false" | undefined;
    };
}, {
    query: {
        sort_by?: string | undefined;
        sort_order?: string | undefined;
        active_only?: string | undefined;
    };
}>;
export declare const contactValidation: {
    createContactSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            message: z.ZodString;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            message: string;
            location?: string | undefined;
            phone?: string | undefined;
        }, {
            name: string;
            email: string;
            message: string;
            location?: string | undefined;
            phone?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
            email: string;
            message: string;
            location?: string | undefined;
            phone?: string | undefined;
        };
    }, {
        body: {
            name: string;
            email: string;
            message: string;
            location?: string | undefined;
            phone?: string | undefined;
        };
    }>;
    getContactSchema: z.ZodObject<{
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
    updateContactSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            status: z.ZodOptional<z.ZodString>;
            is_resolved: z.ZodOptional<z.ZodBoolean>;
            responded_at: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            is_resolved?: boolean | undefined;
            responded_at?: string | null | undefined;
        }, {
            status?: string | undefined;
            is_resolved?: boolean | undefined;
            responded_at?: string | null | undefined;
        }>, {
            status?: string | undefined;
            is_resolved?: boolean | undefined;
            responded_at?: string | null | undefined;
        }, {
            status?: string | undefined;
            is_resolved?: boolean | undefined;
            responded_at?: string | null | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            status?: string | undefined;
            is_resolved?: boolean | undefined;
            responded_at?: string | null | undefined;
        };
        params: {
            id: string;
        };
    }, {
        body: {
            status?: string | undefined;
            is_resolved?: boolean | undefined;
            responded_at?: string | null | undefined;
        };
        params: {
            id: string;
        };
    }>;
    deleteContactSchema: z.ZodObject<{
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
    listContactsSchema: z.ZodObject<{
        query: z.ZodObject<{
            status: z.ZodOptional<z.ZodString>;
            is_resolved: z.ZodOptional<z.ZodEffects<z.ZodString, "true" | "false", string>>;
            location: z.ZodOptional<z.ZodString>;
            sort_by: z.ZodOptional<z.ZodString>;
            sort_order: z.ZodOptional<z.ZodEffects<z.ZodString, "desc" | "asc", string>>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            location?: string | undefined;
            sort_by?: string | undefined;
            sort_order?: "desc" | "asc" | undefined;
            is_resolved?: "true" | "false" | undefined;
        }, {
            status?: string | undefined;
            location?: string | undefined;
            sort_by?: string | undefined;
            sort_order?: string | undefined;
            is_resolved?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        query: {
            status?: string | undefined;
            location?: string | undefined;
            sort_by?: string | undefined;
            sort_order?: "desc" | "asc" | undefined;
            is_resolved?: "true" | "false" | undefined;
        };
    }, {
        query: {
            status?: string | undefined;
            location?: string | undefined;
            sort_by?: string | undefined;
            sort_order?: string | undefined;
            is_resolved?: string | undefined;
        };
    }>;
    newsletterSubscribeSchema: z.ZodObject<{
        body: z.ZodObject<{
            email: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
        }, {
            email: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            email: string;
        };
    }, {
        body: {
            email: string;
        };
    }>;
    newsletterUnsubscribeSchema: z.ZodObject<{
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
    listNewsletterSubscribersSchema: z.ZodObject<{
        query: z.ZodObject<{
            active_only: z.ZodOptional<z.ZodEffects<z.ZodString, "true" | "false", string>>;
            sort_by: z.ZodOptional<z.ZodString>;
            sort_order: z.ZodOptional<z.ZodEffects<z.ZodString, "desc" | "asc", string>>;
        }, "strip", z.ZodTypeAny, {
            sort_by?: string | undefined;
            sort_order?: "desc" | "asc" | undefined;
            active_only?: "true" | "false" | undefined;
        }, {
            sort_by?: string | undefined;
            sort_order?: string | undefined;
            active_only?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        query: {
            sort_by?: string | undefined;
            sort_order?: "desc" | "asc" | undefined;
            active_only?: "true" | "false" | undefined;
        };
    }, {
        query: {
            sort_by?: string | undefined;
            sort_order?: string | undefined;
            active_only?: string | undefined;
        };
    }>;
};
export default contactValidation;
//# sourceMappingURL=contact.d.ts.map