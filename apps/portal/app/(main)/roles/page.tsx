'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Search, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  createdAt: string;
}

// Mock permissions data grouped by module
const mockPermissions: { [key: string]: Permission[] } = {
  'User Management': [
    { id: 'create_user', name: 'Create User', description: 'Can create new users', module: 'User Management' },
    { id: 'edit_user', name: 'Edit User', description: 'Can edit existing users', module: 'User Management' },
    { id: 'delete_user', name: 'Delete User', description: 'Can delete users', module: 'User Management' },
    { id: 'view_users', name: 'View Users', description: 'Can view user list', module: 'User Management' },
  ],
  'Project Management': [
    { id: 'create_project', name: 'Create Project', description: 'Can create new projects', module: 'Project Management' },
    { id: 'edit_project', name: 'Edit Project', description: 'Can edit existing projects', module: 'Project Management' },
    { id: 'delete_project', name: 'Delete Project', description: 'Can delete projects', module: 'Project Management' },
    { id: 'view_projects', name: 'View Projects', description: 'Can view project list', module: 'Project Management' },
  ],
  'Role Management': [
    { id: 'create_role', name: 'Create Role', description: 'Can create new roles', module: 'Role Management' },
    { id: 'edit_role', name: 'Edit Role', description: 'Can edit existing roles', module: 'Role Management' },
    { id: 'delete_role', name: 'Delete Role', description: 'Can delete roles', module: 'Role Management' },
    { id: 'view_roles', name: 'View Roles', description: 'Can view role list', module: 'Role Management' },
  ],
};

// Mock roles data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: ['create_user', 'edit_user', 'delete_user', 'view_users', 'create_project', 'edit_project', 'delete_project', 'view_projects'],
    usersCount: 3,
    createdAt: '2024-02-15',
  },
  {
    id: '2',
    name: 'Project Manager',
    description: 'Can manage projects and view users',
    permissions: ['view_users', 'create_project', 'edit_project', 'view_projects'],
    usersCount: 5,
    createdAt: '2024-02-16',
  },
  {
    id: '3',
    name: 'User',
    description: 'Basic user access',
    permissions: ['view_projects'],
    usersCount: 12,
    createdAt: '2024-02-17',
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: [],
  });

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const role: Role = {
      id: (roles.length + 1).toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions || [],
      usersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRoles([...roles, role]);
    setIsCreateDialogOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
    toast.success('Role created successfully');
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedRole) return;
    
    setRoles(roles.filter(r => r.id !== selectedRole.id));
    setIsDeleteDialogOpen(false);
    setSelectedRole(null);
    toast.success('Role deleted successfully');
  };

  const handlePermissionToggle = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions?.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...(prev.permissions || []), permissionId],
    }));
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-green hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Add a new role and assign permissions. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Role Name *
                  </label>
                  <Input
                    placeholder="Enter role name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Description *
                  </label>
                  <Input
                    placeholder="Enter role description"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-4">Permissions</h4>
                <div className="space-y-6">
                  {Object.entries(mockPermissions).map(([module, permissions]) => (
                    <div key={module} className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">{module}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={permission.id}
                              checked={newRole.permissions?.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <label
                              htmlFor={permission.id}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              <div className="font-medium mb-1">{permission.name}</div>
                              <p className="text-gray-500 text-xs">{permission.description}</p>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole} className="bg-primary-green hover:bg-green-700">
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{role.name}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary-green hover:bg-green-50"
                  title="Edit role"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  title="Delete role"
                  onClick={() => handleDeleteClick(role)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>{role.permissions.length} permissions</span>
                <span className="text-gray-300">•</span>
                <span>{role.usersCount} users</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {role.permissions.slice(0, 3).map((permissionId) => {
                  const permission = Object.values(mockPermissions)
                    .flat()
                    .find(p => p.id === permissionId);
                  return permission ? (
                    <Badge key={permission.id} variant="secondary" className="text-xs">
                      {permission.name}
                    </Badge>
                  ) : null;
                })}
                {role.permissions.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{role.permissions.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                Created on {new Date(role.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
              {selectedRole?.usersCount > 0 && (
                <p className="mt-2 text-red-600">
                  Warning: This role is currently assigned to {selectedRole.usersCount} users.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 