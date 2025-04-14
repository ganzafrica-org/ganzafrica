'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ArrowLeft, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';

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

export default function ViewMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the member data from an API
    // For now, we'll use mock data
    const fetchMember = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in a real app, this would come from an API
        const mockMember: TeamMember = {
          id: params.id,
          name: 'Dr. Jane Smith',
          role: 'Chairperson',
          department: 'Advisory Board',
          email: 'jane.smith@example.com',
          bio: 'Dr. Jane Smith has over 20 years of experience in agricultural development and sustainable farming practices. She has led numerous initiatives across Africa focusing on climate-resilient agriculture.',
          linkedin: 'https://linkedin.com/in/janesmith',
          twitter: 'https://twitter.com/janesmith',
          category: 'Advisory Board',
          imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
        };
        
        setMember(mockMember);
      } catch (error) {
        console.error('Error fetching member:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [params.id]);

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teams">
            <Button variant="ghost" size="icon" title="Back to teams">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teams">
            <Button variant="ghost" size="icon" title="Back to teams">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Member Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/teams">
          <Button variant="ghost" size="icon" title="Back to teams">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Team Member Details</h1>
          <p className="text-gray-600">View detailed information about {member.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 ring-2 ring-offset-2 ring-primary-green mb-4">
                <AvatarImage 
                  src={member.imageUrl} 
                  alt={member.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary-green text-white text-2xl">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
              <Badge className={getCategoryColor(member.category)}>
                {member.category}
              </Badge>
              <div className="flex gap-4 mt-4">
                {member.linkedin && (
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-6 w-6" />
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
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1">{member.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1">{member.department}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{member.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                <p className="mt-1 whitespace-pre-line">{member.bio}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 