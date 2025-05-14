export type CreateTeamInput = {
    name: string;
    position?: string;
    photo_url?: string;
    bio?: string;
    email?: string;
    profile_link?: string;
    skills?: string[];
    team_type_id: number;
};
export type UpdateTeamInput = {
    name?: string;
    position?: string;
    photo_url?: string;
    bio?: string;
    email?: string;
    profile_link?: string;
    skills?: string[];
    team_type_id?: number;
};
export type TeamOutput = {
    id: number;
    name: string;
    position: string | null;
    photo_url: string | null;
    bio: string | null;
    email: string | null;
    profile_link: string | null;
    skills: string[] | null;
    team_type_id: number;
    team_type?: {
        id: number;
        name: string;
    };
    created_at: Date;
    updated_at: Date;
};
export declare function createTeam(teamData: CreateTeamInput): Promise<TeamOutput>;
export declare function getTeamById(id: number): Promise<TeamOutput>;
export declare function updateTeam(id: number, teamData: UpdateTeamInput): Promise<TeamOutput>;
export declare function deleteTeam(id: number): Promise<boolean>;
export declare function listTeams(teamTypeId?: number, sortBy?: string, sortOrder?: string): Promise<TeamOutput[]>;
export declare const teamService: {
    createTeam: typeof createTeam;
    getTeamById: typeof getTeamById;
    updateTeam: typeof updateTeam;
    deleteTeam: typeof deleteTeam;
    listTeams: typeof listTeams;
};
export default teamService;
//# sourceMappingURL=team-service.d.ts.map