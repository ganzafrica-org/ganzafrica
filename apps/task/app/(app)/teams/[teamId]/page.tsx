"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/button";
import { TeamMember } from "@/lib/types";
import { initialMembers, initialTasks } from "@/lib/sample-data";
import { taskTeamsApi, TaskTeam, TaskProject } from "@/lib/api/task-teams";
import { ArrowLeft, Folder, Users, Clock, Loader2 } from "lucide-react";

export default function TeamDetailPage(): React.JSX.Element {
  const [members] = useState<TeamMember[]>(initialMembers);
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;
  
  const [team, setTeam] = useState<TaskTeam | null>(null);
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load team details
      const teamResponse = await taskTeamsApi.getTeamById(parseInt(teamId));
      setTeam(teamResponse.team);
      
      // Load team projects
      const projectsResponse = await taskTeamsApi.listProjects(parseInt(teamId));
      setProjects(projectsResponse.projects || []);
    } catch (error: any) {
      console.error('Error loading team data:', error);
      setError(error.response?.data?.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout 
        members={members} 
        tasks={initialTasks} 
        title="Loading..."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#076297' }} />
        </div>
      </PageLayout>
    );
  }

  if (error || !team) {
    return (
      <PageLayout 
        members={members} 
        tasks={initialTasks} 
        title="Team Not Found"
      >
        <div className="text-center py-8">
          <p style={{ color: '#6b7280' }}>{error || 'Team not found.'}</p>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => router.push('/teams')}
            className="mt-4"
          >
            Back to Teams
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      members={members} 
      tasks={initialTasks} 
      title={team.name}
      headerAction={
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push('/teams')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      }
    >
      {/* Team Overview */}
      <div 
        className="p-4 mb-6"
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '7px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: team.color || '#073392', borderRadius: '7px' }}
          >
            <Users className="w-8 h-8" style={{ color: '#ffffff' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1f2937' }}>{team.name}</h2>
            <p className="text-lg mb-4" style={{ color: '#6b7280' }}>{team.description || 'No description'}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: team.color || '#073392' }} />
                <span style={{ color: '#4b5563' }}>{team.member_count || 0} members</span>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" style={{ color: team.color || '#073392' }} />
                <span style={{ color: '#4b5563' }}>{projects.length} projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/teams/${teamId}/projects/${project.id}`)}
            className="p-4 cursor-pointer transition-all"
            style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '7px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
            }}
          >
            {/* Project Header */}
            <div className="flex items-start gap-3 mb-3">
              <div 
                className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: project.color || team.color || '#073392', borderRadius: '7px' }}
              >
                <Folder className="w-6 h-6" style={{ color: '#ffffff' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1" style={{ color: '#1f2937' }}>{project.name}</h3>
                <p className="text-sm line-clamp-2" style={{ color: '#6b7280' }}>{project.description || 'No description'}</p>
              </div>
            </div>

            {/* Project Stats */}
            <div className="flex items-center gap-4 mb-3 text-sm" style={{ color: '#4b5563' }}>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{project.member_count || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 rounded text-xs font-medium" style={{ 
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
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8">
          <Folder className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d5db' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#374151' }}>No Projects Yet</h3>
          <p style={{ color: '#6b7280' }}>This team doesn't have any projects yet.</p>
        </div>
      )}
    </PageLayout>
  );
}
