import { z } from "zod";
export declare const fileValidationSchema: z.ZodObject<{
    fieldname: z.ZodString;
    originalname: z.ZodString;
    encoding: z.ZodString;
    mimetype: z.ZodEffects<z.ZodString, string, string>;
    size: z.ZodNumber;
    buffer: z.ZodOptional<z.ZodType<Buffer<ArrayBuffer>, z.ZodTypeDef, Buffer<ArrayBuffer>>>;
    stream: z.ZodOptional<z.ZodAny>;
    destination: z.ZodOptional<z.ZodString>;
    filename: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    size: number;
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    path?: string | undefined;
    stream?: any;
    buffer?: Buffer<ArrayBuffer> | undefined;
    destination?: string | undefined;
    filename?: string | undefined;
}, {
    size: number;
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    path?: string | undefined;
    stream?: any;
    buffer?: Buffer<ArrayBuffer> | undefined;
    destination?: string | undefined;
    filename?: string | undefined;
}>;
export declare const createProjectSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["planned", "active", "completed", "cancelled", "on_hold"]>;
        start_date: z.ZodEffects<z.ZodString, Date, string>;
        end_date: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        category_id: z.ZodNumber;
        partner_id: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodString>;
        impacted_people: z.ZodOptional<z.ZodNumber>;
        goals: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                completed: z.ZodOptional<z.ZodBoolean>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        }, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        }>, z.ZodEffects<z.ZodString, any, string>]>>;
        outcomes: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                status: z.ZodOptional<z.ZodString>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        }, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        }>, z.ZodEffects<z.ZodString, any, string>]>>;
        media: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video"]>;
                url: z.ZodString;
                cover: z.ZodDefault<z.ZodBoolean>;
                tag: z.ZodOptional<z.ZodEnum<["feature", "description", "others"]>>;
                title: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodNumber>;
                duration: z.ZodOptional<z.ZodNumber>;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }, {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        }, {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        }>, z.ZodEffects<z.ZodString, any, string>]>>;
        other_information: z.ZodOptional<z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodEffects<z.ZodString, any, string>]>>;
        members: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            team_id: z.ZodNumber;
            role: z.ZodEnum<["lead", "member", "supervisor", "contributor"]>;
            start_date: z.ZodEffects<z.ZodString, Date, string>;
            end_date: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        }, "strip", z.ZodTypeAny, {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: Date;
            team_id: number;
            end_date?: Date | undefined;
        }, {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: string;
            team_id: number;
            end_date?: string | undefined;
        }>, "many">, z.ZodEffects<z.ZodString, any, string>]>>;
        partners: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            partner_id: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            partner_id: number;
        }, {
            partner_id: number;
        }>, "many">, z.ZodEffects<z.ZodString, any, string>]>>;
        documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            file_url: z.ZodString;
            file_size: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }, {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: Date;
        media?: any;
        description?: string | undefined;
        location?: string | undefined;
        partners?: any;
        members?: any;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: any;
        outcomes?: any;
        other_information?: any;
        end_date?: Date | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }, {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: string;
        media?: string | {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        description?: string | undefined;
        location?: string | undefined;
        partners?: string | {
            partner_id: number;
        }[] | undefined;
        members?: string | {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: string;
            team_id: number;
            end_date?: string | undefined;
        }[] | undefined;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: string | Record<string, any> | undefined;
        end_date?: string | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fieldname: z.ZodString;
        originalname: z.ZodString;
        encoding: z.ZodString;
        mimetype: z.ZodEffects<z.ZodString, string, string>;
        size: z.ZodNumber;
        buffer: z.ZodOptional<z.ZodType<Buffer<ArrayBuffer>, z.ZodTypeDef, Buffer<ArrayBuffer>>>;
        stream: z.ZodOptional<z.ZodAny>;
        destination: z.ZodOptional<z.ZodString>;
        filename: z.ZodOptional<z.ZodString>;
        path: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }, {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: Date;
        media?: any;
        description?: string | undefined;
        location?: string | undefined;
        partners?: any;
        members?: any;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: any;
        outcomes?: any;
        other_information?: any;
        end_date?: Date | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    };
    files?: {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }[] | undefined;
}, {
    body: {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: string;
        media?: string | {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        description?: string | undefined;
        location?: string | undefined;
        partners?: string | {
            partner_id: number;
        }[] | undefined;
        members?: string | {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: string;
            team_id: number;
            end_date?: string | undefined;
        }[] | undefined;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: string | Record<string, any> | undefined;
        end_date?: string | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    };
    files?: {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }[] | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        status: z.ZodOptional<z.ZodEnum<["planned", "active", "completed", "cancelled", "on_hold"]>>;
        start_date: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        end_date: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>>;
        category_id: z.ZodOptional<z.ZodNumber>;
        partner_id: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodString>;
        impacted_people: z.ZodOptional<z.ZodNumber>;
        goals: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                completed: z.ZodOptional<z.ZodBoolean>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        }, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        }>, z.ZodEffects<z.ZodString, any, string>]>>;
        outcomes: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                status: z.ZodOptional<z.ZodString>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        }, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        }>, z.ZodEffects<z.ZodString, any, string>]>>;
        media: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video"]>;
                url: z.ZodString;
                cover: z.ZodDefault<z.ZodBoolean>;
                tag: z.ZodOptional<z.ZodEnum<["feature", "description", "others"]>>;
                title: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodNumber>;
                duration: z.ZodOptional<z.ZodNumber>;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }, {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        }, {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        }>, z.ZodEffects<z.ZodString, any, string>]>>;
        other_information: z.ZodOptional<z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodEffects<z.ZodString, any, string>]>>;
    }, "strip", z.ZodTypeAny, {
        media?: any;
        name?: string | undefined;
        status?: "completed" | "active" | "planned" | "cancelled" | "on_hold" | undefined;
        description?: string | null | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        goals?: any;
        outcomes?: any;
        other_information?: any;
        start_date?: Date | undefined;
        end_date?: Date | null | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }, {
        media?: string | {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        name?: string | undefined;
        status?: "completed" | "active" | "planned" | "cancelled" | "on_hold" | undefined;
        description?: string | null | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        goals?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: string | Record<string, any> | undefined;
        start_date?: string | undefined;
        end_date?: string | null | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fieldname: z.ZodString;
        originalname: z.ZodString;
        encoding: z.ZodString;
        mimetype: z.ZodEffects<z.ZodString, string, string>;
        size: z.ZodNumber;
        buffer: z.ZodOptional<z.ZodType<Buffer<ArrayBuffer>, z.ZodTypeDef, Buffer<ArrayBuffer>>>;
        stream: z.ZodOptional<z.ZodAny>;
        destination: z.ZodOptional<z.ZodString>;
        filename: z.ZodOptional<z.ZodString>;
        path: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }, {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    body: {
        media?: any;
        name?: string | undefined;
        status?: "completed" | "active" | "planned" | "cancelled" | "on_hold" | undefined;
        description?: string | null | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        goals?: any;
        outcomes?: any;
        other_information?: any;
        start_date?: Date | undefined;
        end_date?: Date | null | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    };
    params: {
        id: string;
    };
    files?: {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }[] | undefined;
}, {
    body: {
        media?: string | {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        name?: string | undefined;
        status?: "completed" | "active" | "planned" | "cancelled" | "on_hold" | undefined;
        description?: string | null | undefined;
        category_id?: number | undefined;
        location?: string | undefined;
        goals?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: string | {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: string | Record<string, any> | undefined;
        start_date?: string | undefined;
        end_date?: string | null | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    };
    params: {
        id: string;
    };
    files?: {
        size: number;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        path?: string | undefined;
        stream?: any;
        buffer?: Buffer<ArrayBuffer> | undefined;
        destination?: string | undefined;
        filename?: string | undefined;
    }[] | undefined;
}>;
export declare const getProjectSchema: z.ZodObject<{
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
export declare const deleteProjectSchema: z.ZodObject<{
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
export declare const listProjectsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        search: z.ZodOptional<z.ZodString>;
        sort_by: z.ZodOptional<z.ZodString>;
        sort_order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
        status: z.ZodOptional<z.ZodString>;
        team_id: z.ZodOptional<z.ZodString>;
        category_id: z.ZodOptional<z.ZodString>;
        partner_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        search?: string | undefined;
        status?: string | undefined;
        category_id?: string | undefined;
        team_id?: string | undefined;
        partner_id?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
    }, {
        search?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        status?: string | undefined;
        category_id?: string | undefined;
        team_id?: string | undefined;
        partner_id?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        search?: string | undefined;
        status?: string | undefined;
        category_id?: string | undefined;
        team_id?: string | undefined;
        partner_id?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        status?: string | undefined;
        category_id?: string | undefined;
        team_id?: string | undefined;
        partner_id?: string | undefined;
        sort_by?: string | undefined;
        sort_order?: "desc" | "asc" | undefined;
    };
}>;
export declare const addProjectMemberSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        team_id: z.ZodNumber;
        role: z.ZodEnum<["lead", "member", "supervisor", "contributor"]>;
        start_date: z.ZodEffects<z.ZodString, Date, string>;
        end_date: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    }, "strip", z.ZodTypeAny, {
        role: "lead" | "member" | "supervisor" | "contributor";
        start_date: Date;
        team_id: number;
        end_date?: Date | undefined;
    }, {
        role: "lead" | "member" | "supervisor" | "contributor";
        start_date: string;
        team_id: number;
        end_date?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        role: "lead" | "member" | "supervisor" | "contributor";
        start_date: Date;
        team_id: number;
        end_date?: Date | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        role: "lead" | "member" | "supervisor" | "contributor";
        start_date: string;
        team_id: number;
        end_date?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const removeProjectMemberSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        userId: string;
    }, {
        id: string;
        userId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
        userId: string;
    };
}, {
    params: {
        id: string;
        userId: string;
    };
}>;
export declare const importProjectsSchema: z.ZodObject<{
    body: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["planned", "active", "completed", "cancelled", "on_hold"]>;
        start_date: z.ZodEffects<z.ZodString, Date, string>;
        end_date: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        category_id: z.ZodNumber;
        partner_id: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodString>;
        impacted_people: z.ZodOptional<z.ZodNumber>;
        goals: z.ZodOptional<z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                completed: z.ZodOptional<z.ZodBoolean>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        }, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        }>>;
        outcomes: z.ZodOptional<z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                status: z.ZodOptional<z.ZodString>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }, {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        }, {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        }>>;
        media: z.ZodOptional<z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video"]>;
                url: z.ZodString;
                cover: z.ZodDefault<z.ZodBoolean>;
                tag: z.ZodOptional<z.ZodEnum<["feature", "description", "others"]>>;
                title: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodNumber>;
                duration: z.ZodOptional<z.ZodNumber>;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                order: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }, {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        }, {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        }>>;
        other_information: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        members: z.ZodOptional<z.ZodArray<z.ZodObject<{
            team_id: z.ZodNumber;
            role: z.ZodEnum<["lead", "member", "supervisor", "contributor"]>;
            start_date: z.ZodEffects<z.ZodString, Date, string>;
            end_date: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        }, "strip", z.ZodTypeAny, {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: Date;
            team_id: number;
            end_date?: Date | undefined;
        }, {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: string;
            team_id: number;
            end_date?: string | undefined;
        }>, "many">>;
        partners: z.ZodOptional<z.ZodArray<z.ZodObject<{
            partner_id: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            partner_id: number;
        }, {
            partner_id: number;
        }>, "many">>;
        documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            file_url: z.ZodString;
            file_size: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }, {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: Date;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        description?: string | undefined;
        location?: string | undefined;
        partners?: {
            partner_id: number;
        }[] | undefined;
        members?: {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: Date;
            team_id: number;
            end_date?: Date | undefined;
        }[] | undefined;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: Record<string, any> | undefined;
        end_date?: Date | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }, {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: string;
        media?: {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        description?: string | undefined;
        location?: string | undefined;
        partners?: {
            partner_id: number;
        }[] | undefined;
        members?: {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: string;
            team_id: number;
            end_date?: string | undefined;
        }[] | undefined;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: Record<string, any> | undefined;
        end_date?: string | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: Date;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        description?: string | undefined;
        location?: string | undefined;
        partners?: {
            partner_id: number;
        }[] | undefined;
        members?: {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: Date;
            team_id: number;
            end_date?: Date | undefined;
        }[] | undefined;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: Record<string, any> | undefined;
        end_date?: Date | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }[];
}, {
    body: {
        name: string;
        status: "completed" | "active" | "planned" | "cancelled" | "on_hold";
        category_id: number;
        start_date: string;
        media?: {
            items: {
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                cover?: boolean | undefined;
                duration?: number | undefined;
                title?: string | undefined;
                size?: number | undefined;
                description?: string | undefined;
                thumbnailUrl?: string | undefined;
                tag?: "description" | "feature" | "others" | undefined;
            }[];
        } | undefined;
        description?: string | undefined;
        location?: string | undefined;
        partners?: {
            partner_id: number;
        }[] | undefined;
        members?: {
            role: "lead" | "member" | "supervisor" | "contributor";
            start_date: string;
            team_id: number;
            end_date?: string | undefined;
        }[] | undefined;
        documents?: {
            name: string;
            file_url: string;
            file_size?: number | undefined;
        }[] | undefined;
        goals?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                completed?: boolean | undefined;
            }[];
        } | undefined;
        outcomes?: {
            items: {
                title: string;
                id: string;
                description: string;
                order?: number | undefined;
                status?: string | undefined;
            }[];
        } | undefined;
        other_information?: Record<string, any> | undefined;
        end_date?: string | undefined;
        partner_id?: number | undefined;
        impacted_people?: number | undefined;
    }[];
}>;
//# sourceMappingURL=project.validation.d.ts.map