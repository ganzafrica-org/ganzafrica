export type CreateRoleInput = {
    name: string;
    description?: string;
};
export type UpdateRoleInput = {
    name?: string;
    description?: string;
};
export type RoleOutput = {
    id: number;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
};
export type UserRoleOutput = {
    id: number;
    user_id: number;
    role_id: number;
    role_name: string;
    created_at: Date;
    updated_at: Date;
};
export declare function createRole(roleData: CreateRoleInput): Promise<RoleOutput>;
export declare function getRoleById(id: number): Promise<RoleOutput>;
export declare function getRoleByName(name: string): Promise<RoleOutput>;
export declare function updateRole(id: number, roleData: UpdateRoleInput): Promise<RoleOutput>;
export declare function deleteRole(id: number): Promise<boolean>;
export declare function listRoles(): Promise<RoleOutput[]>;
export declare function assignRoleToUser(userId: number, roleId: number): Promise<UserRoleOutput>;
export declare function replaceUserRole(userId: number, newRoleId: number): Promise<UserRoleOutput>;
export declare function removeRoleFromUser(userId: number, roleId: number): Promise<boolean>;
export declare function getUserRoles(userId: number): Promise<UserRoleOutput[]>;
export declare const roleService: {
    createRole: typeof createRole;
    getRoleById: typeof getRoleById;
    getRoleByName: typeof getRoleByName;
    updateRole: typeof updateRole;
    deleteRole: typeof deleteRole;
    listRoles: typeof listRoles;
    assignRoleToUser: typeof assignRoleToUser;
    removeRoleFromUser: typeof removeRoleFromUser;
    getUserRoles: typeof getUserRoles;
    replaceUserRole: typeof replaceUserRole;
};
export default roleService;
//# sourceMappingURL=roles.service.d.ts.map