import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        role_id: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>>;
        avatar_url: z.ZodOptional<z.ZodString>;
        email_verified: z.ZodOptional<z.ZodBoolean>;
        sendVerificationEmail: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        password: string;
        role_id?: number | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }, {
        name: string;
        email: string;
        password: string;
        role_id?: string | number | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }>, {
        name: string;
        email: string;
        password: string;
        role_id?: number | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }, {
        name: string;
        email: string;
        password: string;
        role_id?: string | number | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        email: string;
        password: string;
        role_id?: number | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    };
}, {
    body: {
        name: string;
        email: string;
        password: string;
        role_id?: string | number | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    };
}>;
export declare const updateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        RoleId: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>>;
        avatar_url: z.ZodOptional<z.ZodString>;
        email_verified: z.ZodOptional<z.ZodBoolean>;
        is_active: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        is_active?: boolean | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        RoleId?: number | undefined;
    }, {
        name?: string | undefined;
        is_active?: boolean | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        RoleId?: string | number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        is_active?: boolean | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        RoleId?: number | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        name?: string | undefined;
        is_active?: boolean | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        RoleId?: string | number | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const getUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
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
export declare const deleteUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
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
export declare const listUsersSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        search: z.ZodOptional<z.ZodString>;
        sort_by: z.ZodOptional<z.ZodString>;
        sort_order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
        role_id: z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>;
        is_active: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        is_active: boolean;
        search?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        role_id?: number | undefined;
    }, {
        search?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        is_active?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        role_id?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        is_active: boolean;
        search?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        role_id?: number | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        is_active?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
        role_id?: string | undefined;
    };
}>;
export declare const importUsersSchema: z.ZodObject<{
    body: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        role_id: z.ZodNumber;
        avatar_url: z.ZodOptional<z.ZodString>;
        email_verified: z.ZodOptional<z.ZodBoolean>;
        sendVerificationEmail: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        password: string;
        role_id: number;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }, {
        name: string;
        email: string;
        password: string;
        role_id: number;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        email: string;
        password: string;
        role_id: number;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }[];
}, {
    body: {
        name: string;
        email: string;
        password: string;
        role_id: number;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        sendVerificationEmail?: boolean | undefined;
    }[];
}>;
//# sourceMappingURL=user.validation.d.ts.map