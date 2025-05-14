import { z } from "zod";
export declare const createRoleSchema: z.ZodObject<{
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
export declare const getRoleSchema: z.ZodObject<{
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
export declare const updateRoleSchema: z.ZodObject<{
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
export declare const deleteRoleSchema: z.ZodObject<{
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
export declare const getUserRolesSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
    }, {
        userId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        userId: string;
    };
}, {
    params: {
        userId: string;
    };
}>;
export declare const assignRoleSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodEffects<z.ZodString, string, string>;
        roleId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        roleId: string;
    }, {
        userId: string;
        roleId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        userId: string;
        roleId: string;
    };
}, {
    params: {
        userId: string;
        roleId: string;
    };
}>;
export declare const removeRoleSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodEffects<z.ZodString, string, string>;
        roleId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        roleId: string;
    }, {
        userId: string;
        roleId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        userId: string;
        roleId: string;
    };
}, {
    params: {
        userId: string;
        roleId: string;
    };
}>;
export declare const roleValidation: {
    createRoleSchema: z.ZodObject<{
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
    getRoleSchema: z.ZodObject<{
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
    updateRoleSchema: z.ZodObject<{
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
    deleteRoleSchema: z.ZodObject<{
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
    getUserRolesSchema: z.ZodObject<{
        params: z.ZodObject<{
            userId: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            userId: string;
        }, {
            userId: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            userId: string;
        };
    }, {
        params: {
            userId: string;
        };
    }>;
    assignRoleSchema: z.ZodObject<{
        params: z.ZodObject<{
            userId: z.ZodEffects<z.ZodString, string, string>;
            roleId: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            roleId: string;
        }, {
            userId: string;
            roleId: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            userId: string;
            roleId: string;
        };
    }, {
        params: {
            userId: string;
            roleId: string;
        };
    }>;
    removeRoleSchema: z.ZodObject<{
        params: z.ZodObject<{
            userId: z.ZodEffects<z.ZodString, string, string>;
            roleId: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            roleId: string;
        }, {
            userId: string;
            roleId: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            userId: string;
            roleId: string;
        };
    }, {
        params: {
            userId: string;
            roleId: string;
        };
    }>;
};
export default roleValidation;
//# sourceMappingURL=roles.validation.d.ts.map