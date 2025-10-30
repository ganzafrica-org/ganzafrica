"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/button";
import { ErrorModal } from "@/components/error-modal";
import { UserAvatar } from "@/components/user-avatar";
import { TeamMember } from "@/lib/types";
import { taskTeamsApi, TaskTeam } from "@/lib/api/task-teams";
import { portalDataApi, PortalTeam, PortalProject } from "@/lib/api/portal-data";
import { usersApi, User } from "@/lib/api/users";
import { Users, Briefcase, X, Plus, Minus, MoreVertical, Loader2, Check, UserPlus } from "lucide-react";
import { TruncatedText } from "@/components/truncated-text";
import { isCurrentUserAdminOrManager, getCurrentUserRole } from "@/lib/auth-utils";

export default function TeamsPage(): React.JSX.Element {
  const router = useRouter();
  
  // Check if current user can edit a specific team
  const canEditTeam = (team: TaskTeam): boolean => {
    // Only Admin/Manager can edit teams
    return isCurrentUserAdminOrManager();
  };

  // Check if current user is assigned to a team
  const isCurrentUserAssignedToTeam = (team: TaskTeam): boolean => {
    if (!team.members) return false;
    
    // Admin and Manager can always manage teams
    if (isCurrentUserAdminOrManager()) return true;
    
    // Get current user ID from localStorage
    try {
      const currentUserId = parseInt(localStorage.getItem('task_user_id') || localStorage.getItem('user_id') || '0');
      if (currentUserId === 0) return false;
      
      // Check if current user is a member of this team
      return team.members.some(member => member.user_id === currentUserId);
    } catch (error) {
      console.error('Error checking team assignment:', error);
      return false;
    }
  };
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [teams, setTeams] = useState<TaskTeam[]>([]);
  const [portalTeams, setPortalTeams] = useState<PortalTeam[]>([]);
  const [portalProjects, setPortalProjects] = useState<PortalProject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<TaskTeam | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [loadingTeamDetails, setLoadingTeamDetails] = useState(false);
  const [editTeamData, setEditTeamData] = useState({
    name: '',
    description: '',
    color: '#073392',
  });
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<number[]>([]);
  const [selectedProjectsToAdd, setSelectedProjectsToAdd] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#073392',
    lead: '',
    members: [] as string[],
    projects: [] as string[]
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  // Load teams and portal data on mount
  useEffect(() => {
    loadTeams();
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      setLoadingData(true);
      
      // Get users from the system
      const usersResponse = await usersApi.listUsers({ limit: 100, is_active: true });
      setUsers(usersResponse.users || []);
      
      // Get all projects
      const projectsResponse = await portalDataApi.getAllProjects({ limit: 100 });
      setPortalProjects(projectsResponse.projects || []);
    } catch (error: any) {
      console.error('Error loading portal data:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Loading Data',
        message: error.response?.data?.message || 'Failed to load users and projects.',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await taskTeamsApi.listTeams();
      setTeams(response.teams || []);
    } catch (error: any) {
      console.error('Error loading teams:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Loading Teams',
        message: error.response?.data?.message || 'Failed to load teams. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: number) => {
    try {
      setLoadingTeamDetails(true);
      const response = await taskTeamsApi.getTeamById(teamId);
      setSelectedTeamForDetails(response.team);
      setIsDetailsModalOpen(true);
    } catch (error: any) {
      console.error('Error loading team details:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Loading Team Details',
        message: error.response?.data?.message || 'Failed to load team details. Please try again.',
      });
    } finally {
      setLoadingTeamDetails(false);
    }
  };

  const handleCreateTeam = async () => {
    // Check if user can create teams
    if (!isCurrentUserAdminOrManager()) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'Only administrators and managers can create teams',
      });
      return;
    }

    if (!newTeam.name.trim()) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please enter a team name',
      });
      return;
    }

    try {
      setCreating(true);
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setErrorModal({
          isOpen: true,
          title: 'Authentication Error',
          message: 'User not found. Please log in again.',
        });
        return;
      }

      // Prepare members array with actual user information
      const members = newTeam.members.map(memberId => {
        const user = users.find(u => u.id.toString() === memberId);
        return {
          user_id: parseInt(memberId),
          name: user?.name || '',
          position: user?.role_name || 'none'
        };
      });
      
      // Prepare projects array
      const projects = newTeam.projects.map(projectId => {
        const project = portalProjects.find(p => p.id.toString() === projectId);
        if (project) {
          return {
            name: project.name,
            description: project.description || '',
            status: (project.status === 'active' ? 'active' : 
                    project.status === 'completed' ? 'completed' :
                    project.status === 'planned' ? 'planning' : 'planning') as 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold',
            start_date: project.start_date,
            end_date: project.end_date,
            color: newTeam.color,
          };
        }
        return null;
      }).filter(p => p !== null) as Array<{
        name: string;
        description: string;
        status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
        start_date: string;
        end_date?: string;
        color: string;
      }>;

      // Create team with members and projects in one request
      await taskTeamsApi.createTeam({
        name: newTeam.name,
        description: newTeam.description,
        color: newTeam.color,
        created_by: parseInt(user.id),
        status: 'active',
        members: members.length > 0 ? members : undefined,
        projects: projects.length > 0 ? projects : undefined,
      });

      // Reset form and reload teams
      setNewTeam({
        name: '',
        description: '',
        color: '#073392',
        lead: '',
        members: [],
        projects: []
      });
      setIsAddTeamModalOpen(false);
      loadTeams();
    } catch (error: any) {
      console.error('Error creating team:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Creating Team',
        message: error.response?.data?.message || 'Failed to create team. Please try again.',
      });
    } finally {
      setCreating(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    teamId: number;
    teamName: string;
  }>({
    isOpen: false,
    teamId: 0,
    teamName: '',
  });

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    setDeleteConfirm({
      isOpen: true,
      teamId,
      teamName,
    });
  };

  const confirmDelete = async () => {
    // Check if user can delete teams
    if (!isCurrentUserAdminOrManager()) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'Only administrators and managers can delete teams',
      });
      setDeleteConfirm({ isOpen: false, teamId: 0, teamName: '' });
      return;
    }

    try {
      await taskTeamsApi.deleteTeam(deleteConfirm.teamId);
      setDeleteConfirm({ isOpen: false, teamId: 0, teamName: '' });
      loadTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Deleting Team',
        message: error.response?.data?.message || 'Failed to delete team. Please try again.',
      });
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeamForDetails || !editTeamData.name.trim()) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please enter a team name',
      });
      return;
    }

    // Check if user can edit this team
    if (!isCurrentUserAdminOrManager()) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'Only administrators and managers can edit teams',
      });
      return;
    }

    try {
      setCreating(true);
      await taskTeamsApi.updateTeam(selectedTeamForDetails.id, {
        name: editTeamData.name,
        description: editTeamData.description,
        color: editTeamData.color,
      });

      setIsEditingTeam(false);
      setIsDetailsModalOpen(false);
      loadTeams();
    } catch (error: any) {
      console.error('Error updating team:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Updating Team',
        message: error.response?.data?.message || 'Failed to update team. Please try again.',
      });
    } finally {
      setCreating(false);
    }
  };

  // Load all users for member selection
  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await usersApi.listUsers();
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Loading Users',
        message: 'Failed to load users. Please try again.',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load all projects for project selection
  const loadAllProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await taskTeamsApi.listAllProjects();
      setAllProjects(response.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Loading Projects',
        message: 'Failed to load projects. Please try again.',
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  // Add members to team
  const handleAddMembersToTeam = async () => {
    if (selectedMembersToAdd.length === 0) {
      setErrorModal({
        isOpen: true,
        title: 'No Members Selected',
        message: 'Please select at least one member to add.',
      });
      return;
    }

    // Check if user can add members to this team
    if (!selectedTeamForDetails || !isCurrentUserAssignedToTeam(selectedTeamForDetails)) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You are not assigned to this team. Only team members can add other members.',
      });
      return;
    }

    try {
      setCreating(true);
      for (const userId of selectedMembersToAdd) {
        await taskTeamsApi.addTeamMember(selectedTeamForDetails!.id, userId, 'member');
      }
      
      setIsAddingMember(false);
      setSelectedMembersToAdd([]);
      loadTeamDetails(selectedTeamForDetails!.id);
      
      setErrorModal({
        isOpen: true,
        title: 'Success',
        message: `Successfully added ${selectedMembersToAdd.length} member(s) to the team.`,
      });
    } catch (error: any) {
      console.error('Error adding members:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Adding Members',
        message: error.response?.data?.message || 'Failed to add members. Please try again.',
      });
    } finally {
      setCreating(false);
    }
  };

  // Remove member from team
  const handleRemoveTeamMember = async (userId: number, memberName: string) => {
    // Check if user can remove members from this team
    if (!selectedTeamForDetails || !isCurrentUserAssignedToTeam(selectedTeamForDetails)) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You are not assigned to this team. Only team members can remove other members.',
      });
      return;
    }

    try {
      await taskTeamsApi.removeTeamMember(selectedTeamForDetails!.id, userId);
      loadTeamDetails(selectedTeamForDetails!.id);
      
      setErrorModal({
        isOpen: true,
        title: 'Success',
        message: `Successfully removed ${memberName} from the team.`,
      });
    } catch (error: any) {
      console.error('Error removing member:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Removing Member',
        message: error.response?.data?.message || 'Failed to remove member. Please try again.',
      });
    }
  };

  // Add projects to team
  const handleAddProjectsToTeam = async () => {
    if (selectedProjectsToAdd.length === 0) {
      setErrorModal({
        isOpen: true,
        title: 'No Projects Selected',
        message: 'Please select at least one project to add.',
      });
      return;
    }

    // Check if user can add projects to this team
    if (!selectedTeamForDetails || !isCurrentUserAssignedToTeam(selectedTeamForDetails)) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You are not assigned to this team. Only team members can add projects.',
      });
      return;
    }

    try {
      setCreating(true);
      for (const projectId of selectedProjectsToAdd) {
        await taskTeamsApi.addProjectToTeam(selectedTeamForDetails!.id, projectId);
      }
      
      setIsAddingProject(false);
      setSelectedProjectsToAdd([]);
      loadTeamDetails(selectedTeamForDetails!.id);
      
      setErrorModal({
        isOpen: true,
        title: 'Success',
        message: `Successfully added ${selectedProjectsToAdd.length} project(s) to the team.`,
      });
    } catch (error: any) {
      console.error('Error adding projects:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Adding Projects',
        message: error.response?.data?.message || 'Failed to add projects. Please try again.',
      });
    } finally {
      setCreating(false);
    }
  };

  // Remove project from team
  const handleRemoveTeamProject = async (projectId: number, projectName: string) => {
    // Check if user can remove projects from this team
    if (!selectedTeamForDetails || !isCurrentUserAssignedToTeam(selectedTeamForDetails)) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You are not assigned to this team. Only team members can remove projects.',
      });
      return;
    }

    try {
      await taskTeamsApi.removeProjectFromTeam(selectedTeamForDetails!.id, projectId);
      loadTeamDetails(selectedTeamForDetails!.id);
      
      setErrorModal({
        isOpen: true,
        title: 'Success',
        message: `Successfully removed ${projectName} from the team.`,
      });
    } catch (error: any) {
      console.error('Error removing project:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Removing Project',
        message: error.response?.data?.message || 'Failed to remove project. Please try again.',
      });
    }
  };

  return (
    <PageLayout 
      members={[]} 
      tasks={[]} 
      title="Teams"
      headerAction={
        isCurrentUserAdminOrManager() ? (
        <Button
          variant="primary"
          size="md"
          showPlusIcon
          onClick={() => setIsAddTeamModalOpen(true)}
        >
          Add Team
        </Button>
        ) : null
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#076297' }} />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
          <p className="text-lg font-medium mb-2" style={{ color: '#6b7280' }}>No teams yet</p>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Create your first team to get started</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => router.push(`/teams/${team.id}`)}
            className="p-4 cursor-pointer transition-all relative"
            style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '7px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              minHeight: '140px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
            }}
          >
            {/* Three Dots Menu - Only show for admin/manager users */}
            {isCurrentUserAdminOrManager() && (
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === team.id ? null : team.id);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                style={{ borderRadius: '7px' }}
              >
                <MoreVertical className="w-5 h-5" style={{ color: '#6b7280' }} />
              </button>
              
              {/* Dropdown Menu */}
              {openMenuId === team.id && (
                <div
                  className="absolute right-0 mt-1 w-40 bg-white border shadow-lg z-10"
                  style={{ borderRadius: '7px', borderColor: '#e5e7eb' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadTeamDetails(team.id);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: '#374151' }}
                    disabled={loadingTeamDetails}
                  >
                    {loadingTeamDetails ? 'Loading...' : 'View Details'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                        router.push(`/teams/${team.id}`);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: '#374151' }}
                  >
                    Update
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                        handleDeleteTeam(team.id, team.name);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors"
                    style={{ color: '#dc2626' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            )}

            {/* Team Header */}
            <div className="flex items-start gap-3 mb-4 pr-8">
              <div 
                className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: team.color || '#073392', borderRadius: '7px' }}
              >
                <Users className="w-6 h-6" style={{ color: '#ffffff' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1" style={{ color: '#1f2937' }}>{team.name}</h3>
                <div className="text-sm" style={{ color: '#6b7280' }}>
                  <TruncatedText 
                    text={team.description || 'No description'} 
                    maxLength={100}
                    className=""
                    showToggle={false}
                  />
                </div>
              </div>
            </div>

            {/* Team Stats */}
            <div className="flex items-center gap-4 text-sm mt-4" style={{ color: '#4b5563' }}>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                  <span>{team.member_count || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                  <span>{team.project_count || 0} projects</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add Team Modal */}
      {isAddTeamModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsAddTeamModalOpen(false)}
        >
          <div
            className="bg-white shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto"
            style={{ borderRadius: '7px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between" style={{ borderColor: '#e5e7eb', borderRadius: '7px 7px 0 0' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Add New Team</h3>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                style={{ borderRadius: '7px' }}
              >
                <X className="w-5 h-5" style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#d1d5db', borderRadius: '7px' }}
                />
              </div>

              {/* Team Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Description *
                </label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Enter team description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#d1d5db', borderRadius: '7px' }}
                />
              </div>

              {/* Team Color */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Team Color
                </label>
                <div className="flex gap-2">
                  {[
                    { name: 'Dark Blue', value: '#073392' },
                    { name: 'Blue', value: '#2F88E1' },
                    { name: 'Green', value: '#005C30' },
                    { name: 'Secondary Green', value: '#009758' },
                    { name: 'Orange', value: '#F8B712' },
                    { name: 'Red', value: '#D42B1D' }
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewTeam({ ...newTeam, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newTeam.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Team Lead */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Team Lead
                </label>
                <input
                  type="text"
                  value={newTeam.lead}
                  onChange={(e) => setNewTeam({ ...newTeam, lead: e.target.value })}
                  placeholder="Enter team lead name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#d1d5db', borderRadius: '7px' }}
                />
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Team Members
                </label>
                <div className="space-y-2">
                  {loadingData ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#076297' }} />
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No users available</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {users.map((user) => (
                        <label key={user.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded" style={{ borderRadius: '7px' }}>
                          <input
                            type="checkbox"
                            checked={newTeam.members.includes(user.id.toString())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTeam({ ...newTeam, members: [...newTeam.members, user.id.toString()] });
                              } else {
                                setNewTeam({ ...newTeam, members: newTeam.members.filter(id => id !== user.id.toString()) });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2 flex-1">
                            <UserAvatar 
                              userId={user.id} 
                              size="md"
                              className="w-8 h-8"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium" style={{ color: '#374151' }}>{user.name}</div>
                              <div className="text-xs" style={{ color: '#6b7280' }}>{user.email}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Initial Projects */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Initial Projects
                </label>
                <div className="space-y-3">
                  {/* Selected Projects List */}
                  {newTeam.projects.length > 0 && (
                    <div className="space-y-2">
                      {newTeam.projects.map((projectId, index) => {
                        const project = portalProjects.find(p => p.id.toString() === projectId);
                        return project ? (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md" style={{ borderRadius: '7px' }}>
                            <div className="flex-1">
                              <span className="text-sm font-medium" style={{ color: '#374151' }}>{project.name}</span>
                              <span className="text-xs ml-2 px-2 py-0.5 rounded" style={{ 
                                backgroundColor: project.status === 'active' ? '#D1FAE5' : 
                                                project.status === 'completed' ? '#DBEAFE' : 
                                                project.status === 'planned' ? '#FEF3C7' : '#F3F4F6',
                                color: project.status === 'active' ? '#065F46' : 
                                       project.status === 'completed' ? '#1E40AF' : 
                                       project.status === 'planned' ? '#92400E' : '#374151'
                              }}>
                                {project.status}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const updatedProjects = newTeam.projects.filter((_, i) => i !== index);
                                setNewTeam({ ...newTeam, projects: updatedProjects });
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              style={{ borderRadius: '7px' }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Project Selector */}
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        const projectId = e.target.value;
                        if (projectId && !newTeam.projects.includes(projectId)) {
                          setNewTeam({ ...newTeam, projects: [...newTeam.projects, projectId] });
                        }
                        e.target.value = ''; // Reset dropdown
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: '#d1d5db', borderRadius: '7px' }}
                      disabled={loadingData}
                    >
                      <option value="">Select a project to add...</option>
                      {portalProjects
                        .filter(p => !newTeam.projects.includes(p.id.toString()))
                        .map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name} ({project.status})
                          </option>
                        ))}
                    </select>
                    {loadingData && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#076297' }} />
                      </div>
                    )}
                  </div>

                  {newTeam.projects.length === 0 && !loadingData && (
                    <p className="text-sm text-gray-500 text-center py-2">No projects selected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end space-x-3" style={{ borderColor: '#e5e7eb', borderRadius: '0 0 7px 7px' }}>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                style={{ borderRadius: '7px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={creating}
                className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#076297', borderRadius: '7px' }}
              >
                {creating ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
      />

      {/* Delete Confirmation Modal */}
      <ErrorModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteConfirm.teamName}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText="Delete"
        showCancel={true}
      />

      {/* Team Details Modal */}
      {isDetailsModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="bg-white shadow-2xl w-[700px] max-h-[85vh] overflow-y-auto"
            style={{ borderRadius: '7px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between" style={{ borderColor: '#e5e7eb', borderRadius: '7px 7px 0 0' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 flex items-center justify-center"
                  style={{ backgroundColor: isEditingTeam ? editTeamData.color : selectedTeamForDetails?.color || '#073392', borderRadius: '7px' }}
                >
                  <Users className="w-6 h-6" style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>
                    {loadingTeamDetails ? 'Loading...' : (isEditingTeam ? 'Edit Team' : selectedTeamForDetails?.name || 'Team Details')}
                  </h3>
                  <p className="text-sm" style={{ color: '#6b7280' }}>Team Details</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingTeam && !loadingTeamDetails && selectedTeamForDetails && isCurrentUserAdminOrManager() && (
                  <button
                    onClick={() => {
                      setEditTeamData({
                        name: selectedTeamForDetails.name,
                        description: selectedTeamForDetails.description || '',
                        color: selectedTeamForDetails.color || '#073392',
                      });
                      setIsEditingTeam(true);
                    }}
                    className="px-3 py-1.5 text-sm rounded-md border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#d1d5db', color: '#374151', borderRadius: '7px' }}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setIsEditingTeam(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  style={{ borderRadius: '7px' }}
                >
                  <X className="w-5 h-5" style={{ color: '#6b7280' }} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {loadingTeamDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#076297' }} />
                  <span className="ml-2 text-gray-600">Loading team details...</span>
                </div>
              ) : selectedTeamForDetails ? (
                <>
                  {/* Team Information */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>Team Information</h4>
                {isEditingTeam ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Name *</label>
                      <input
                        type="text"
                        value={editTeamData.name}
                        onChange={(e) => setEditTeamData({ ...editTeamData, name: e.target.value })}
                        placeholder="Enter team name"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: '#d1d5db', borderRadius: '7px' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Description</label>
                      <textarea
                        value={editTeamData.description}
                        onChange={(e) => setEditTeamData({ ...editTeamData, description: e.target.value })}
                        placeholder="Enter team description"
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: '#d1d5db', borderRadius: '7px' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-2" style={{ color: '#6b7280' }}>Team Color</label>
                      <div className="flex gap-2">
                        {[
                          { name: 'Dark Blue', value: '#073392' },
                          { name: 'Blue', value: '#2F88E1' },
                          { name: 'Green', value: '#005C30' },
                          { name: 'Secondary Green', value: '#009758' },
                          { name: 'Orange', value: '#F8B712' },
                          { name: 'Red', value: '#D42B1D' }
                        ].map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setEditTeamData({ ...editTeamData, color: color.value })}
                            className={`w-8 h-8 rounded-full border-2 ${
                              editTeamData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium" style={{ color: '#6b7280' }}>Name</label>
                      <p className="text-sm font-medium" style={{ color: '#1f2937' }}>{selectedTeamForDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium" style={{ color: '#6b7280' }}>Description</label>
                      <div className="text-sm" style={{ color: '#1f2937' }}>
                        <TruncatedText 
                          text={selectedTeamForDetails.description || 'No description'} 
                          maxLength={170}
                          className=""
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-xs font-medium" style={{ color: '#6b7280' }}>Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: selectedTeamForDetails.color || '#073392', border: '1px solid #e5e7eb' }}></div>
                          <span className="text-sm" style={{ color: '#1f2937' }}>{selectedTeamForDetails.color || '#073392'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium" style={{ color: '#6b7280' }}>Status</label>
                        <p className="text-sm capitalize mt-1" style={{ color: '#1f2937' }}>{selectedTeamForDetails.status}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold" style={{ color: '#374151' }}>
                  Team Members ({selectedTeamForDetails.member_count || 0})
                </h4>
                  {isEditingTeam && selectedTeamForDetails && isCurrentUserAssignedToTeam(selectedTeamForDetails) && (
                    <button
                      onClick={() => {
                        loadAllUsers();
                        setIsAddingMember(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#d1d5db', color: '#374151', borderRadius: '7px' }}
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </button>
                  )}
                </div>
                
                {isAddingMember && (
                  <div className="mb-4 p-4 border rounded-lg" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                    <h5 className="text-sm font-medium mb-3" style={{ color: '#374151' }}>Add Members to Team</h5>
                    {loadingUsers ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#076297' }} />
                        <span className="ml-2 text-sm" style={{ color: '#6b7280' }}>Loading users...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {allUsers.filter(user => !selectedTeamForDetails.members?.some(member => member.user_id === user.id)).map((user) => (
                          <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedMembersToAdd.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembersToAdd([...selectedMembersToAdd, user.id]);
                                } else {
                                  setSelectedMembersToAdd(selectedMembersToAdd.filter(id => id !== user.id));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                style={{ backgroundColor: selectedTeamForDetails.color || '#073392' }}
                              >
                                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: '#374151' }}>{user.name}</p>
                                <p className="text-xs" style={{ color: '#6b7280' }}>{user.email}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {allUsers.filter(user => !selectedTeamForDetails.members?.some(member => member.user_id === user.id)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">All users are already in this team</p>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setIsAddingMember(false);
                          setSelectedMembersToAdd([]);
                        }}
                        className="px-3 py-1.5 text-sm rounded-md border transition-colors"
                        style={{ borderColor: '#d1d5db', borderRadius: '7px', color: '#374151' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMembersToTeam}
                        disabled={selectedMembersToAdd.length === 0 || creating}
                        className="px-3 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                      >
                        {creating ? 'Adding...' : `Add Selected (${selectedMembersToAdd.length})`}
                      </button>
                    </div>
                  </div>
                )}

                {selectedTeamForDetails.members && selectedTeamForDetails.members.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeamForDetails.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                          style={{ backgroundColor: selectedTeamForDetails.color || '#076297' }}
                        >
                          {member.name ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: '#1f2937' }}>{member.name || 'Unknown'}</p>
                          {member.position && (
                            <p className="text-xs" style={{ color: '#6b7280' }}>{member.position}</p>
                          )}
                        </div>
                        <span className="text-xs px-2 py-1 rounded" style={{ 
                          backgroundColor: '#E0E7FF',
                          color: '#3730A3'
                        }}>
                          {member.role}
                        </span>
                        {isEditingTeam && selectedTeamForDetails && isCurrentUserAssignedToTeam(selectedTeamForDetails) && (
                          <button
                            onClick={() => handleRemoveTeamMember(member.user_id, member.name || 'this member')}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Remove from team"
                          >
                            <X className="w-4 h-4" style={{ color: '#dc2626' }} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No members</p>
                )}
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold" style={{ color: '#374151' }}>
                  Projects ({selectedTeamForDetails.project_count || 0})
                </h4>
                  {isEditingTeam && selectedTeamForDetails && isCurrentUserAssignedToTeam(selectedTeamForDetails) && (
                    <button
                      onClick={() => {
                        loadAllProjects();
                        setIsAddingProject(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#d1d5db', color: '#374151', borderRadius: '7px' }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  )}
                </div>

                {isAddingProject && (
                  <div className="mb-4 p-4 border rounded-lg" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                    <h5 className="text-sm font-medium mb-3" style={{ color: '#374151' }}>Add Projects to Team</h5>
                    {loadingProjects ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#076297' }} />
                        <span className="ml-2 text-sm" style={{ color: '#6b7280' }}>Loading projects...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {allProjects.filter(project => !selectedTeamForDetails.projects?.some(teamProject => teamProject.id === project.id)).map((project) => (
                          <label key={project.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProjectsToAdd.includes(project.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProjectsToAdd([...selectedProjectsToAdd, project.id]);
                                } else {
                                  setSelectedProjectsToAdd(selectedProjectsToAdd.filter(id => id !== project.id));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center"
                                style={{ backgroundColor: project.color || '#073392' }}
                              >
                                <Briefcase className="w-4 h-4" style={{ color: '#ffffff' }} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: '#374151' }}>{project.name}</p>
                                <p className="text-xs" style={{ color: '#6b7280' }}>{project.description || 'No description'}</p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded capitalize" style={{ 
                                backgroundColor: project.status === 'active' ? '#D1FAE5' : 
                                                 project.status === 'completed' ? '#DBEAFE' : 
                                                 project.status === 'planning' ? '#FEF3C7' : '#F3F4F6',
                                color: project.status === 'active' ? '#065F46' : 
                                       project.status === 'completed' ? '#1E40AF' : 
                                       project.status === 'planning' ? '#92400E' : '#374151'
                              }}>
                                {project.status}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {allProjects.filter(project => !selectedTeamForDetails.projects?.some(teamProject => teamProject.id === project.id)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">All projects are already in this team</p>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setIsAddingProject(false);
                          setSelectedProjectsToAdd([]);
                        }}
                        className="px-3 py-1.5 text-sm rounded-md border transition-colors"
                        style={{ borderColor: '#d1d5db', borderRadius: '7px', color: '#374151' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddProjectsToTeam}
                        disabled={selectedProjectsToAdd.length === 0 || creating}
                        className="px-3 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                      >
                        {creating ? 'Adding...' : `Add Selected (${selectedProjectsToAdd.length})`}
                      </button>
                    </div>
                  </div>
                )}

                {selectedTeamForDetails.projects && selectedTeamForDetails.projects.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeamForDetails.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                        style={{ borderColor: '#e5e7eb' }}
                      >
                        <div
                          className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 cursor-pointer"
                          style={{ backgroundColor: project.color || selectedTeamForDetails.color || '#073392' }}
                        onClick={() => {
                          router.push(`/teams/${selectedTeamForDetails.id}/projects/${project.id}`);
                          setIsDetailsModalOpen(false);
                        }}
                        >
                          <Briefcase className="w-5 h-5" style={{ color: '#ffffff' }} />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => {
                          router.push(`/teams/${selectedTeamForDetails.id}/projects/${project.id}`);
                          setIsDetailsModalOpen(false);
                        }}>
                          <p className="text-sm font-medium" style={{ color: '#1f2937' }}>{project.name}</p>
                          <div className="text-xs" style={{ color: '#6b7280' }}>
                            <TruncatedText 
                              text={project.description || 'No description'} 
                              maxLength={100}
                              className=""
                              showToggle={false}
                            />
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded capitalize" style={{ 
                          backgroundColor: project.status === 'active' ? '#D1FAE5' : 
                                           project.status === 'completed' ? '#DBEAFE' : 
                                           project.status === 'planning' ? '#FEF3C7' : '#F3F4F6',
                          color: project.status === 'active' ? '#065F46' : 
                                 project.status === 'completed' ? '#1E40AF' : 
                                 project.status === 'planning' ? '#92400E' : '#374151'
                        }}>
                          {project.status}
                        </span>
                        {isEditingTeam && selectedTeamForDetails && isCurrentUserAssignedToTeam(selectedTeamForDetails) && (
                          <button
                            onClick={() => handleRemoveTeamProject(project.id, project.name)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Remove from team"
                          >
                            <X className="w-4 h-4" style={{ color: '#dc2626' }} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No projects</p>
                )}
              </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Failed to load team details</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end space-x-3" style={{ borderColor: '#e5e7eb', borderRadius: '0 0 7px 7px' }}>
              {loadingTeamDetails ? (
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  style={{ borderRadius: '7px' }}
                >
                  Close
                </button>
              ) : isEditingTeam ? (
                <>
                  <button
                    onClick={() => setIsEditingTeam(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    style={{ borderRadius: '7px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTeam}
                    disabled={creating}
                    className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                  >
                    {creating ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    style={{ borderRadius: '7px' }}
                  >
                    Close
                  </button>
                  {selectedTeamForDetails && (
                    <button
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        router.push(`/teams/${selectedTeamForDetails!.id}`);
                      }}
                      className="px-4 py-2 text-white rounded-md transition-colors"
                      style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                    >
                      View Full Details
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
