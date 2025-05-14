import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        remember_me: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        remember_me?: boolean | undefined;
    }, {
        email: string;
        password: string;
        remember_me?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
        remember_me?: boolean | undefined;
    };
}, {
    body: {
        email: string;
        password: string;
        remember_me?: boolean | undefined;
    };
}>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        confirm_password: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        password: string;
        confirm_password: string;
    }, {
        name: string;
        email: string;
        password: string;
        confirm_password: string;
    }>, {
        name: string;
        email: string;
        password: string;
        confirm_password: string;
    }, {
        name: string;
        email: string;
        password: string;
        confirm_password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        email: string;
        password: string;
        confirm_password: string;
    };
}, {
    body: {
        name: string;
        email: string;
        password: string;
        confirm_password: string;
    };
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
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
export declare const resetPasswordSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        token: z.ZodString;
        password: z.ZodString;
        confirm_password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        token: string;
        confirm_password: string;
    }, {
        password: string;
        token: string;
        confirm_password: string;
    }>, {
        password: string;
        token: string;
        confirm_password: string;
    }, {
        password: string;
        token: string;
        confirm_password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        token: string;
        confirm_password: string;
    };
}, {
    body: {
        password: string;
        token: string;
        confirm_password: string;
    };
}>;
export declare const verifyEmailSchema: z.ZodObject<{
    body: z.ZodObject<{
        token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        token: string;
    }, {
        token: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        token: string;
    };
}, {
    body: {
        token: string;
    };
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        refresh_token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refresh_token: string;
    }, {
        refresh_token: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        refresh_token: string;
    };
}, {
    body: {
        refresh_token: string;
    };
}>;
//# sourceMappingURL=auth.validation.d.ts.map