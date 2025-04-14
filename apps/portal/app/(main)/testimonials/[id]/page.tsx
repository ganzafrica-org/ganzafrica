'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { ArrowLeft, Edit2, Quote } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  category: string;
  status: string;
  imageUrl?: string;
}

export default function TestimonialViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    // In a real application, fetch the testimonial data from your API
    // For now, we'll use mock data
    const mockTestimonial = {
      id: params.id,
      name: 'John Doe',
      role: 'CEO',
      organization: 'Tech Corp',
      quote: 'GanzAfrica has been transformative for our agricultural initiatives. Their innovative approach has helped us increase crop yields by 40% while reducing water usage.',
      category: 'Agriculture',
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
    };

    setTestimonial(mockTestimonial);
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!testimonial) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">View Testimonial</h1>
        </div>
        <Button
          onClick={() => router.push(`/testimonials/edit/${testimonial.id}`)}
          className="bg-primary-green hover:bg-green-700"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Testimonial
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto p-8 relative">
        <div className="absolute top-8 right-8 text-gray-400">
          <Quote size={48} />
        </div>

        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24 ring-4 ring-offset-4 ring-primary-green">
            <AvatarImage 
              src={testimonial.imageUrl} 
              alt={testimonial.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary-green text-white text-xl">
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold mb-2">{testimonial.name}</h2>
            <p className="text-lg text-gray-600 mb-4">
              {testimonial.role} at {testimonial.organization}
            </p>
            <div className="flex gap-3">
              <Badge variant="secondary" className="text-sm">
                {testimonial.category}
              </Badge>
              <Badge className={`text-sm ${getStatusColor(testimonial.status)}`}>
                {testimonial.status}
              </Badge>
            </div>
          </div>
        </div>

        <blockquote className="text-xl text-gray-700 mb-8 italic relative pl-6 border-l-4 border-primary-green">
          "{testimonial.quote}"
        </blockquote>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">{testimonial.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{testimonial.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Organization</dt>
              <dd className="mt-1 text-sm text-gray-900">{testimonial.organization}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">{testimonial.role}</dd>
            </div>
          </dl>
        </div>
      </Card>
    </div>
  );
} 