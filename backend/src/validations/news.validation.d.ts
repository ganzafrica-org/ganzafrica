import { z } from "zod";
export declare const createNewsSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        content: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<["published", "not_published"]>>;
        publish_date: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["all", "news", "blogs", "reports", "publications"]>;
        key_lessons: z.ZodOptional<z.ZodString>;
        media: z.ZodOptional<z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video"]>;
                url: z.ZodString;
                cover: z.ZodBoolean;
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
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }, {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        }, {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        title: string;
        category: "all" | "news" | "blogs" | "reports" | "publications";
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | undefined;
        status?: "published" | "not_published" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | undefined;
        key_lessons?: string | undefined;
    }, {
        content: string;
        title: string;
        category: "all" | "news" | "blogs" | "reports" | "publications";
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | undefined;
        status?: "published" | "not_published" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | undefined;
        key_lessons?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content: string;
        title: string;
        category: "all" | "news" | "blogs" | "reports" | "publications";
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | undefined;
        status?: "published" | "not_published" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | undefined;
        key_lessons?: string | undefined;
    };
}, {
    body: {
        content: string;
        title: string;
        category: "all" | "news" | "blogs" | "reports" | "publications";
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | undefined;
        status?: "published" | "not_published" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | undefined;
        key_lessons?: string | undefined;
    };
}>;
export declare const getNewsSchema: z.ZodObject<{
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
export declare const updateNewsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["published", "not_published"]>>;
        publish_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        category: z.ZodOptional<z.ZodEnum<["all", "news", "blogs", "reports", "publications"]>>;
        key_lessons: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        media: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video"]>;
                url: z.ZodString;
                cover: z.ZodBoolean;
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
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }, {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        }, {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        }>>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        content?: string | undefined;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | null | undefined;
        title?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | null | undefined;
        key_lessons?: string | null | undefined;
    }, {
        content?: string | undefined;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | null | undefined;
        title?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | null | undefined;
        key_lessons?: string | null | undefined;
    }>, {
        content?: string | undefined;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | null | undefined;
        title?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | null | undefined;
        key_lessons?: string | null | undefined;
    }, {
        content?: string | undefined;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | null | undefined;
        title?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | null | undefined;
        key_lessons?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content?: string | undefined;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | null | undefined;
        title?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | null | undefined;
        key_lessons?: string | null | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        content?: string | undefined;
        media?: {
            items: {
                cover: boolean;
                id: string;
                type: "video" | "image";
                url: string;
                order?: number | undefined;
                duration?: number | undefined;
                size?: number | undefined;
                thumbnailUrl?: string | undefined;
            }[];
        } | null | undefined;
        title?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: number[] | undefined;
        publish_date?: string | null | undefined;
        key_lessons?: string | null | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deleteNewsSchema: z.ZodObject<{
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
export declare const createTagSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
    };
}, {
    body: {
        name: string;
    };
}>;
export declare const deleteTagSchema: z.ZodObject<{
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
export declare const listNewsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodObject<{
        category: z.ZodOptional<z.ZodEnum<["all", "news", "blogs", "reports", "publications"]>>;
        status: z.ZodOptional<z.ZodEnum<["published", "not_published"]>>;
        search: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        offset: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortDir: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
        offset?: string | undefined;
        limit?: string | undefined;
        sortBy?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: string | undefined;
        sortDir?: "desc" | "asc" | undefined;
    }, {
        search?: string | undefined;
        offset?: string | undefined;
        limit?: string | undefined;
        sortBy?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: string | undefined;
        sortDir?: "desc" | "asc" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    query?: {
        search?: string | undefined;
        offset?: string | undefined;
        limit?: string | undefined;
        sortBy?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: string | undefined;
        sortDir?: "desc" | "asc" | undefined;
    } | undefined;
}, {
    query?: {
        search?: string | undefined;
        offset?: string | undefined;
        limit?: string | undefined;
        sortBy?: string | undefined;
        status?: "published" | "not_published" | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        tags?: string | undefined;
        sortDir?: "desc" | "asc" | undefined;
    } | undefined;
}>;
export declare const newsValidation: {
    createNewsSchema: z.ZodObject<{
        body: z.ZodObject<{
            title: z.ZodString;
            content: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<["published", "not_published"]>>;
            publish_date: z.ZodOptional<z.ZodString>;
            category: z.ZodEnum<["all", "news", "blogs", "reports", "publications"]>;
            key_lessons: z.ZodOptional<z.ZodString>;
            media: z.ZodOptional<z.ZodObject<{
                items: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodEnum<["image", "video"]>;
                    url: z.ZodString;
                    cover: z.ZodBoolean;
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
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }, {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            }, {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        }, "strip", z.ZodTypeAny, {
            content: string;
            title: string;
            category: "all" | "news" | "blogs" | "reports" | "publications";
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | undefined;
            status?: "published" | "not_published" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | undefined;
            key_lessons?: string | undefined;
        }, {
            content: string;
            title: string;
            category: "all" | "news" | "blogs" | "reports" | "publications";
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | undefined;
            status?: "published" | "not_published" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | undefined;
            key_lessons?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            content: string;
            title: string;
            category: "all" | "news" | "blogs" | "reports" | "publications";
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | undefined;
            status?: "published" | "not_published" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | undefined;
            key_lessons?: string | undefined;
        };
    }, {
        body: {
            content: string;
            title: string;
            category: "all" | "news" | "blogs" | "reports" | "publications";
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | undefined;
            status?: "published" | "not_published" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | undefined;
            key_lessons?: string | undefined;
        };
    }>;
    getNewsSchema: z.ZodObject<{
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
    updateNewsSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodEnum<["published", "not_published"]>>;
            publish_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            category: z.ZodOptional<z.ZodEnum<["all", "news", "blogs", "reports", "publications"]>>;
            key_lessons: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            media: z.ZodNullable<z.ZodOptional<z.ZodObject<{
                items: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodEnum<["image", "video"]>;
                    url: z.ZodString;
                    cover: z.ZodBoolean;
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
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }, {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            }, {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            }>>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        }, "strip", z.ZodTypeAny, {
            content?: string | undefined;
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | null | undefined;
            title?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | null | undefined;
            key_lessons?: string | null | undefined;
        }, {
            content?: string | undefined;
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | null | undefined;
            title?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | null | undefined;
            key_lessons?: string | null | undefined;
        }>, {
            content?: string | undefined;
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | null | undefined;
            title?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | null | undefined;
            key_lessons?: string | null | undefined;
        }, {
            content?: string | undefined;
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | null | undefined;
            title?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | null | undefined;
            key_lessons?: string | null | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            content?: string | undefined;
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | null | undefined;
            title?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | null | undefined;
            key_lessons?: string | null | undefined;
        };
        params: {
            id: string;
        };
    }, {
        body: {
            content?: string | undefined;
            media?: {
                items: {
                    cover: boolean;
                    id: string;
                    type: "video" | "image";
                    url: string;
                    order?: number | undefined;
                    duration?: number | undefined;
                    size?: number | undefined;
                    thumbnailUrl?: string | undefined;
                }[];
            } | null | undefined;
            title?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: number[] | undefined;
            publish_date?: string | null | undefined;
            key_lessons?: string | null | undefined;
        };
        params: {
            id: string;
        };
    }>;
    deleteNewsSchema: z.ZodObject<{
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
    createTagSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
        };
    }, {
        body: {
            name: string;
        };
    }>;
    deleteTagSchema: z.ZodObject<{
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
    listNewsSchema: z.ZodObject<{
        query: z.ZodOptional<z.ZodObject<{
            category: z.ZodOptional<z.ZodEnum<["all", "news", "blogs", "reports", "publications"]>>;
            status: z.ZodOptional<z.ZodEnum<["published", "not_published"]>>;
            search: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodString>;
            limit: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            offset: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            sortBy: z.ZodOptional<z.ZodString>;
            sortDir: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
        }, "strip", z.ZodTypeAny, {
            search?: string | undefined;
            offset?: string | undefined;
            limit?: string | undefined;
            sortBy?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: string | undefined;
            sortDir?: "desc" | "asc" | undefined;
        }, {
            search?: string | undefined;
            offset?: string | undefined;
            limit?: string | undefined;
            sortBy?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: string | undefined;
            sortDir?: "desc" | "asc" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        query?: {
            search?: string | undefined;
            offset?: string | undefined;
            limit?: string | undefined;
            sortBy?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: string | undefined;
            sortDir?: "desc" | "asc" | undefined;
        } | undefined;
    }, {
        query?: {
            search?: string | undefined;
            offset?: string | undefined;
            limit?: string | undefined;
            sortBy?: string | undefined;
            status?: "published" | "not_published" | undefined;
            category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
            tags?: string | undefined;
            sortDir?: "desc" | "asc" | undefined;
        } | undefined;
    }>;
};
export default newsValidation;
//# sourceMappingURL=news.validation.d.ts.map