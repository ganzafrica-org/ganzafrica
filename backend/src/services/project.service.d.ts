export type CreateProjectInput = {
    name: string;
    description?: string;
    status: string;
    start_date: Date;
    end_date?: Date;
    category_id: number;
    partner_id?: number;
    members?: ProjectMemberInput[];
    partners?: ProjectPartnerInput[];
    documents?: ProjectDocumentInput[];
    location?: string;
    goals?: {
        items: Array<{
            id: string;
            title: string;
            description: string;
            completed?: boolean;
            order?: number;
        }>;
    };
    outcomes?: {
        items: Array<{
            id: string;
            title: string;
            description: string;
            status?: string;
            order?: number;
        }>;
    };
    media?: {
        items: Array<{
            id: string;
            type: "image" | "video";
            url: string;
            cover: boolean;
            tag?: "feature" | "description" | "others";
            title?: string;
            description?: string;
            size?: number;
            duration?: number;
            thumbnailUrl?: string;
            order?: number;
        }>;
    };
    other_information?: {
        [key: string]: any;
    };
};
export type UpdateProjectInput = {
    name?: string;
    description?: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
    category_id?: number;
    partner_id?: number;
    location?: string;
    goals?: {
        items: Array<{
            id: string;
            title: string;
            description: string;
            completed?: boolean;
            order?: number;
        }>;
    };
    outcomes?: {
        items: Array<{
            id: string;
            title: string;
            description: string;
            status?: string;
            order?: number;
        }>;
    };
    media?: {
        items: Array<{
            id: string;
            type: "image" | "video";
            url: string;
            cover: boolean;
            tag?: "feature" | "description" | "others";
            title?: string;
            description?: string;
            size?: number;
            duration?: number;
            thumbnailUrl?: string;
            order?: number;
        }>;
    };
    other_information?: {
        [key: string]: any;
    };
};
export type ProjectOutput = {
    id: number;
    name: string;
    description: string | null;
    status: string;
    start_date: Date;
    end_date: Date | null;
    category_id: number;
    partner_id: number | null;
    created_at: Date;
    updated_at: Date;
    location?: string | null;
    goals?: {
        items: Array<{
            id: string;
            title: string;
            description: string;
            completed?: boolean;
            order?: number;
        }>;
    };
    outcomes?: {
        items: Array<{
            id: string;
            title: string;
            description: string;
            status?: string;
            order?: number;
        }>;
    };
    media?: {
        items: Array<{
            id: string;
            type: "image" | "video";
            url: string;
            cover: boolean;
            tag?: "feature" | "description" | "others";
            title?: string;
            description?: string;
            size?: number;
            duration?: number;
            thumbnailUrl?: string;
            order?: number;
        }>;
    };
    other_information?: {
        [key: string]: any;
    };
    members?: ProjectMemberOutput[];
    documents?: ProjectDocumentOutput[];
    partners?: ProjectPartnerOutput[];
};
export type ProjectMemberInput = {
    team_id: number;
    role: string;
    start_date: Date;
    end_date?: Date;
};
export type ProjectMemberOutput = {
    id: number;
    project_id: number;
    team_id: number;
    role: string;
    start_date: Date;
    end_date?: Date | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    team?: {
        id: number;
        name: string;
        position?: string | null;
        photo_url?: string | null;
        bio?: string | null;
        email?: string | null;
    };
};
export type ProjectDocumentInput = {
    name: string;
    file_url: string;
    file_size?: number;
};
export type ProjectDocumentOutput = {
    id: number;
    project_id: number;
    name: string;
    file_url: string;
    file_size?: number | null;
    created_at: Date;
    updated_at: Date;
};
export type ProjectPartnerInput = {
    partner_id: number;
};
export type ProjectPartnerOutput = {
    id: number;
    project_id: number;
    partner_id: number;
    created_at: Date;
    updated_at: Date;
    partner?: {
        id: number;
        name: string;
        logo?: string | null;
        website_url?: string | null;
        location?: string | null;
    };
};
type ProjectSearchParams = {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    status?: string;
    team_id?: number;
    category_id?: number;
    partner_id?: number;
};
export declare function createProject(projectData: CreateProjectInput): Promise<ProjectOutput>;
export declare function getProjectById(id: number): Promise<ProjectOutput>;
export declare function updateProject(id: number, projectData: UpdateProjectInput): Promise<ProjectOutput>;
export declare function deleteProject(id: number): Promise<boolean>;
export declare function listProjects(params: ProjectSearchParams): Promise<{
    projects: ProjectOutput[];
    total: number;
}>;
export declare const projectService: {
    createProject: typeof createProject;
    getProjectById: typeof getProjectById;
    updateProject: typeof updateProject;
    deleteProject: typeof deleteProject;
    listProjects: typeof listProjects;
};
export default projectService;
//# sourceMappingURL=project.service.d.ts.map