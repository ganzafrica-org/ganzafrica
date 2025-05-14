import { z } from "zod";
export declare const createTeamTypeSchema: z.ZodObject<{
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
export declare const getTeamTypeSchema: z.ZodObject<{
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
export declare const updateTeamTypeSchema: z.ZodObject<{
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
export declare const deleteTeamTypeSchema: z.ZodObject<{
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
export declare const createTeamSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        position: z.ZodOptional<z.ZodString>;
        photo_url: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        profile_link: z.ZodOptional<z.ZodString>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        team_type_id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        team_type_id: number;
        position?: string | undefined;
        email?: string | undefined;
        photo_url?: string | undefined;
        skills?: string[] | undefined;
        bio?: string | undefined;
        profile_link?: string | undefined;
    }, {
        name: string;
        team_type_id: number;
        position?: string | undefined;
        email?: string | undefined;
        photo_url?: string | undefined;
        skills?: string[] | undefined;
        bio?: string | undefined;
        profile_link?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        team_type_id: number;
        position?: string | undefined;
        email?: string | undefined;
        photo_url?: string | undefined;
        skills?: string[] | undefined;
        bio?: string | undefined;
        profile_link?: string | undefined;
    };
}, {
    body: {
        name: string;
        team_type_id: number;
        position?: string | undefined;
        email?: string | undefined;
        photo_url?: string | undefined;
        skills?: string[] | undefined;
        bio?: string | undefined;
        profile_link?: string | undefined;
    };
}>;
export declare const getTeamSchema: z.ZodObject<{
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
export declare const updateTeamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodString>;
        photo_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        profile_link: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        skills: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        team_type_id: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        position?: string | undefined;
        name?: string | undefined;
        email?: string | null | undefined;
        photo_url?: string | null | undefined;
        team_type_id?: number | undefined;
        skills?: string[] | null | undefined;
        bio?: string | null | undefined;
        profile_link?: string | null | undefined;
    }, {
        position?: string | undefined;
        name?: string | undefined;
        email?: string | null | undefined;
        photo_url?: string | null | undefined;
        team_type_id?: number | undefined;
        skills?: string[] | null | undefined;
        bio?: string | null | undefined;
        profile_link?: string | null | undefined;
    }>, {
        position?: string | undefined;
        name?: string | undefined;
        email?: string | null | undefined;
        photo_url?: string | null | undefined;
        team_type_id?: number | undefined;
        skills?: string[] | null | undefined;
        bio?: string | null | undefined;
        profile_link?: string | null | undefined;
    }, {
        position?: string | undefined;
        name?: string | undefined;
        email?: string | null | undefined;
        photo_url?: string | null | undefined;
        team_type_id?: number | undefined;
        skills?: string[] | null | undefined;
        bio?: string | null | undefined;
        profile_link?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        position?: string | undefined;
        name?: string | undefined;
        email?: string | null | undefined;
        photo_url?: string | null | undefined;
        team_type_id?: number | undefined;
        skills?: string[] | null | undefined;
        bio?: string | null | undefined;
        profile_link?: string | null | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        position?: string | undefined;
        name?: string | undefined;
        email?: string | null | undefined;
        photo_url?: string | null | undefined;
        team_type_id?: number | undefined;
        skills?: string[] | null | undefined;
        bio?: string | null | undefined;
        profile_link?: string | null | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deleteTeamSchema: z.ZodObject<{
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
export declare const listTeamsSchema: z.ZodObject<{
    query: z.ZodObject<{
        team_type_id: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        team_type_id?: string | undefined;
    }, {
        team_type_id?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        team_type_id?: string | undefined;
    };
}, {
    query: {
        team_type_id?: string | undefined;
    };
}>;
export declare const teamValidation: {
    createTeamSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            position: z.ZodOptional<z.ZodString>;
            photo_url: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            profile_link: z.ZodOptional<z.ZodString>;
            skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            team_type_id: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            team_type_id: number;
            position?: string | undefined;
            email?: string | undefined;
            photo_url?: string | undefined;
            skills?: string[] | undefined;
            bio?: string | undefined;
            profile_link?: string | undefined;
        }, {
            name: string;
            team_type_id: number;
            position?: string | undefined;
            email?: string | undefined;
            photo_url?: string | undefined;
            skills?: string[] | undefined;
            bio?: string | undefined;
            profile_link?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
            team_type_id: number;
            position?: string | undefined;
            email?: string | undefined;
            photo_url?: string | undefined;
            skills?: string[] | undefined;
            bio?: string | undefined;
            profile_link?: string | undefined;
        };
    }, {
        body: {
            name: string;
            team_type_id: number;
            position?: string | undefined;
            email?: string | undefined;
            photo_url?: string | undefined;
            skills?: string[] | undefined;
            bio?: string | undefined;
            profile_link?: string | undefined;
        };
    }>;
    getTeamSchema: z.ZodObject<{
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
    updateTeamSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodString>;
            photo_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            profile_link: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            skills: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            team_type_id: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            position?: string | undefined;
            name?: string | undefined;
            email?: string | null | undefined;
            photo_url?: string | null | undefined;
            team_type_id?: number | undefined;
            skills?: string[] | null | undefined;
            bio?: string | null | undefined;
            profile_link?: string | null | undefined;
        }, {
            position?: string | undefined;
            name?: string | undefined;
            email?: string | null | undefined;
            photo_url?: string | null | undefined;
            team_type_id?: number | undefined;
            skills?: string[] | null | undefined;
            bio?: string | null | undefined;
            profile_link?: string | null | undefined;
        }>, {
            position?: string | undefined;
            name?: string | undefined;
            email?: string | null | undefined;
            photo_url?: string | null | undefined;
            team_type_id?: number | undefined;
            skills?: string[] | null | undefined;
            bio?: string | null | undefined;
            profile_link?: string | null | undefined;
        }, {
            position?: string | undefined;
            name?: string | undefined;
            email?: string | null | undefined;
            photo_url?: string | null | undefined;
            team_type_id?: number | undefined;
            skills?: string[] | null | undefined;
            bio?: string | null | undefined;
            profile_link?: string | null | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            position?: string | undefined;
            name?: string | undefined;
            email?: string | null | undefined;
            photo_url?: string | null | undefined;
            team_type_id?: number | undefined;
            skills?: string[] | null | undefined;
            bio?: string | null | undefined;
            profile_link?: string | null | undefined;
        };
        params: {
            id: string;
        };
    }, {
        body: {
            position?: string | undefined;
            name?: string | undefined;
            email?: string | null | undefined;
            photo_url?: string | null | undefined;
            team_type_id?: number | undefined;
            skills?: string[] | null | undefined;
            bio?: string | null | undefined;
            profile_link?: string | null | undefined;
        };
        params: {
            id: string;
        };
    }>;
    deleteTeamSchema: z.ZodObject<{
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
    listTeamsSchema: z.ZodObject<{
        query: z.ZodObject<{
            team_type_id: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        }, "strip", z.ZodTypeAny, {
            team_type_id?: string | undefined;
        }, {
            team_type_id?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        query: {
            team_type_id?: string | undefined;
        };
    }, {
        query: {
            team_type_id?: string | undefined;
        };
    }>;
};
export declare const teamTypeValidation: {
    createTeamTypeSchema: z.ZodObject<{
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
    getTeamTypeSchema: z.ZodObject<{
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
    updateTeamTypeSchema: z.ZodObject<{
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
    deleteTeamTypeSchema: z.ZodObject<{
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
declare const _default: {
    teamValidation: {
        createTeamSchema: z.ZodObject<{
            body: z.ZodObject<{
                name: z.ZodString;
                position: z.ZodOptional<z.ZodString>;
                photo_url: z.ZodOptional<z.ZodString>;
                bio: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                profile_link: z.ZodOptional<z.ZodString>;
                skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                team_type_id: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                name: string;
                team_type_id: number;
                position?: string | undefined;
                email?: string | undefined;
                photo_url?: string | undefined;
                skills?: string[] | undefined;
                bio?: string | undefined;
                profile_link?: string | undefined;
            }, {
                name: string;
                team_type_id: number;
                position?: string | undefined;
                email?: string | undefined;
                photo_url?: string | undefined;
                skills?: string[] | undefined;
                bio?: string | undefined;
                profile_link?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            body: {
                name: string;
                team_type_id: number;
                position?: string | undefined;
                email?: string | undefined;
                photo_url?: string | undefined;
                skills?: string[] | undefined;
                bio?: string | undefined;
                profile_link?: string | undefined;
            };
        }, {
            body: {
                name: string;
                team_type_id: number;
                position?: string | undefined;
                email?: string | undefined;
                photo_url?: string | undefined;
                skills?: string[] | undefined;
                bio?: string | undefined;
                profile_link?: string | undefined;
            };
        }>;
        getTeamSchema: z.ZodObject<{
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
        updateTeamSchema: z.ZodObject<{
            params: z.ZodObject<{
                id: z.ZodEffects<z.ZodString, string, string>;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            body: z.ZodEffects<z.ZodObject<{
                name: z.ZodOptional<z.ZodString>;
                position: z.ZodOptional<z.ZodString>;
                photo_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                profile_link: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                skills: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
                team_type_id: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                position?: string | undefined;
                name?: string | undefined;
                email?: string | null | undefined;
                photo_url?: string | null | undefined;
                team_type_id?: number | undefined;
                skills?: string[] | null | undefined;
                bio?: string | null | undefined;
                profile_link?: string | null | undefined;
            }, {
                position?: string | undefined;
                name?: string | undefined;
                email?: string | null | undefined;
                photo_url?: string | null | undefined;
                team_type_id?: number | undefined;
                skills?: string[] | null | undefined;
                bio?: string | null | undefined;
                profile_link?: string | null | undefined;
            }>, {
                position?: string | undefined;
                name?: string | undefined;
                email?: string | null | undefined;
                photo_url?: string | null | undefined;
                team_type_id?: number | undefined;
                skills?: string[] | null | undefined;
                bio?: string | null | undefined;
                profile_link?: string | null | undefined;
            }, {
                position?: string | undefined;
                name?: string | undefined;
                email?: string | null | undefined;
                photo_url?: string | null | undefined;
                team_type_id?: number | undefined;
                skills?: string[] | null | undefined;
                bio?: string | null | undefined;
                profile_link?: string | null | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            body: {
                position?: string | undefined;
                name?: string | undefined;
                email?: string | null | undefined;
                photo_url?: string | null | undefined;
                team_type_id?: number | undefined;
                skills?: string[] | null | undefined;
                bio?: string | null | undefined;
                profile_link?: string | null | undefined;
            };
            params: {
                id: string;
            };
        }, {
            body: {
                position?: string | undefined;
                name?: string | undefined;
                email?: string | null | undefined;
                photo_url?: string | null | undefined;
                team_type_id?: number | undefined;
                skills?: string[] | null | undefined;
                bio?: string | null | undefined;
                profile_link?: string | null | undefined;
            };
            params: {
                id: string;
            };
        }>;
        deleteTeamSchema: z.ZodObject<{
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
        listTeamsSchema: z.ZodObject<{
            query: z.ZodObject<{
                team_type_id: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            }, "strip", z.ZodTypeAny, {
                team_type_id?: string | undefined;
            }, {
                team_type_id?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            query: {
                team_type_id?: string | undefined;
            };
        }, {
            query: {
                team_type_id?: string | undefined;
            };
        }>;
    };
    teamTypeValidation: {
        createTeamTypeSchema: z.ZodObject<{
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
        getTeamTypeSchema: z.ZodObject<{
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
        updateTeamTypeSchema: z.ZodObject<{
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
        deleteTeamTypeSchema: z.ZodObject<{
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
};
export default _default;
//# sourceMappingURL=team-validation.d.ts.map