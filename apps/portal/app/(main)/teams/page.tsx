"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu';
import { Grid2X2, List, MoreVertical, Plus, Pencil, Trash2, UserPlus, Eye, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@workspace/ui/components/badge';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
  category: 'Advisory Board' | 'Our Team' | 'Mentors' | 'Fellows' | 'Alumni';
  imageUrl?: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Dr. Jane Smith',
    role: 'Chairperson',
    department: 'Advisory Board',
    email: 'jane.smith@example.com',
    bio: 'Dr. Jane Smith has over 20 years of experience in agricultural development and sustainable farming practices. She has led numerous initiatives across Africa focusing on climate-resilient agriculture.',
    linkedin: 'https://linkedin.com/in/janesmith',
    twitter: 'https://twitter.com/janesmith',
    category: 'Advisory Board',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
  },
  {
    id: '2',
    name: 'John Doe',
    role: 'Program Director',
    department: 'Our Team',
    email: 'john.doe@example.com',
    bio: 'John Doe brings extensive experience in program management and strategic planning. He has successfully led multiple international development projects focusing on sustainable agriculture and rural development.',
    category: 'Our Team',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    role: 'Senior Mentor',
    department: 'Mentors',
    email: 'sarah.johnson@example.com',
    bio: 'Sarah Johnson is a passionate mentor with expertise in agricultural technology and innovation. She has helped numerous startups and projects implement sustainable farming solutions.',
    category: 'Mentors',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256'
  },
  {
    id: '4',
    name: 'Michael Chen',
    role: 'Research Fellow',
    department: 'Fellows',
    email: 'michael.chen@example.com',
    bio: 'Michael Chen specializes in climate-smart agriculture and data analysis. His research focuses on developing predictive models for crop yields under changing climate conditions.',
    category: 'Fellows',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256'
  },
  {
    id: '5',
    name: 'Grace Mutua',
    role: 'Alumni',
    department: 'Alumni',
    email: 'grace.mutua@example.com',
    bio: 'Grace Mutua is an alumna who has gone on to establish a successful agricultural consulting firm. She continues to collaborate with the organization on various community development projects.',
    category: 'Alumni',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256'
  }
];

export default function TeamsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All Members');

  const categories = [
    'All Members',
    'Advisory Board',
    'Our Team',
    'Mentors',
    'Fellows',
    'Alumni'
  ];

  const filteredMembers = activeCategory === 'All Members'
    ? teamMembers
    : teamMembers.filter(member => member.category === activeCategory);

  const handleView = (member: TeamMember) => {
    router.push(`/teams/${member.id}`);
    toast.info('Viewing team member details');
  };

  const handleEdit = (member: TeamMember) => {
    router.push(`/teams/edit/${member.id}`);
    toast.info('Opening team member for editing');
  };

  const handleDeleteClick = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedMember) return;
    
    setTeamMembers(prev => prev.filter(m => m.id !== selectedMember.id));
    setDeleteDialogOpen(false);
    setSelectedMember(null);
    toast.success('Team member deleted successfully');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Advisory Board':
        return 'bg-purple-100 text-purple-800';
      case 'Our Team':
        return 'bg-blue-100 text-blue-800';
      case 'Mentors':
        return 'bg-green-100 text-green-800';
      case 'Fellows':
        return 'bg-yellow-100 text-yellow-800';
      case 'Alumni':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="p-6 flex flex-col relative">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary-green">
              <AvatarImage 
                src={member.imageUrl} 
                alt={member.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary-green text-white">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <Badge className={getCategoryColor(member.category)}>
              {member.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{member.bio}</p>
          <div className="flex gap-2 mb-4">
            {member.linkedin && (
              <a 
                href={member.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600"
                title="LinkedIn Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
            )}
            {member.twitter && (
              <a 
                href={member.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-400"
                title="Twitter Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
            )}
          </div>
          <div className="flex items-center justify-end mt-auto border-t pt-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="View member"
                onClick={() => handleView(member)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary-green hover:bg-green-50"
                title="Edit member"
                onClick={() => handleEdit(member)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:bg-red-50"
                title="Delete member"
                onClick={() => handleDeleteClick(member)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary-green">
              <AvatarImage 
                src={member.imageUrl} 
                alt={member.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary-green text-white">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(member.category)}>
                    {member.category}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{member.bio}</p>
              <div className="flex gap-2 mb-4">
                {member.linkedin && (
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600"
                    title="LinkedIn Profile"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </a>
                )}
                {member.twitter && (
                  <a 
                    href={member.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-400"
                    title="Twitter Profile"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                )}
              </div>
              <div className="flex items-center justify-end mt-4 border-t pt-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    title="View member"
                    onClick={() => handleView(member)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary-green hover:bg-green-50"
                    title="Edit member"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    title="Delete member"
                    onClick={() => handleDeleteClick(member)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-600">Manage your organization's team members</p>
        </div>
        <div className="flex gap-4">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid2X2 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
          <Link href="/teams/add-member">
            <Button className="bg-primary-green hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'secondary' : 'outline'}
            onClick={() => setActiveCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {viewMode === 'grid' ? renderGridView() : renderListView()}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team member? This action cannot be undone.
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