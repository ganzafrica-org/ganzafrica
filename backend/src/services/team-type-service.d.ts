export type CreateTeamTypeInput = {
    name: string;
    description?: string;
};
export type UpdateTeamTypeInput = {
    name?: string;
    description?: string;
};
export type TeamTypeOutput = {
    id: number;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
};
export declare function createTeamType(teamTypeData: CreateTeamTypeInput): Promise<TeamTypeOutput>;
export declare function getTeamTypeById(id: number): Promise<TeamTypeOutput>;
export declare function updateTeamType(id: number, teamTypeData: UpdateTeamTypeInput): Promise<TeamTypeOutput>;
export declare function deleteTeamType(id: number): Promise<boolean>;
export declare function listTeamTypes(): Promise<TeamTypeOutput[]>;
export declare const teamTypeService: {
    createTeamType: typeof createTeamType;
    getTeamTypeById: typeof getTeamTypeById;
    updateTeamType: typeof updateTeamType;
    deleteTeamType: typeof deleteTeamType;
    listTeamTypes: typeof listTeamTypes;
};
export default teamTypeService;
//# sourceMappingURL=team-type-service.d.ts.map