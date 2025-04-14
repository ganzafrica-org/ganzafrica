'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu';
import { Grid2X2, List, MoreVertical, Plus, Pencil, Trash2, Archive, Star, Edit2, Eye, Quote, Search, Filter, ArrowUp, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowRight } from 'lucide-react';
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

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  category: string;
  status: string;
  imageUrl?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
}

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'CEO',
    organization: 'Tech Corp',
    quote: 'GanzAfrica has been transformative for our agricultural initiatives. Their innovative approach has helped us increase crop yields by 40% while reducing water usage.',
    category: 'Agriculture',
    status: 'published',
    imageUrl: '/images/ganzafrica-fellows.jpg',
    media: [
      {
        type: 'image',
        url: '/images/ganzafrica-fellows.jpg',
        thumbnail: '/images/ganzafrica-fellows.jpg'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Project Manager',
    organization: 'Green Earth Initiative',
    quote: 'The climate adaptation strategies we developed with GanzAfrica have become a model for sustainable development across the region.',
    category: 'Climate',
    status: 'published',
    imageUrl: '/images/ganzafrica-fellows.jpg',
    media: [
      {
        type: 'image',
        url: '/images/ganzafrica-fellows.jpg',
        thumbnail: '/images/ganzafrica-fellows.jpg'
      }
    ]
  },
  {
    id: '3',
    name: 'Emmanuel Kwesi',
    role: 'Community Leader',
    organization: 'Rural Development Council',
    quote: "The water access program has been life-changing for our community. We've seen dramatic improvements in health and agricultural productivity.",
    category: 'Water',
    status: 'draft',
    imageUrl: '/images/ganzafrica-fellows.jpg',
    media: [
      {
        type: 'image',
        url: '/images/ganzafrica-fellows.jpg',
        thumbnail: '/images/ganzafrica-fellows.jpg'
      }
    ]
  },
  {
    id: '4',
    name: 'Dr. Amina Hassan',
    role: 'Research Director',
    organization: 'Agricultural Research Institute',
    quote: "GanzAfrica's data-driven approach to agricultural optimization has revolutionized how we think about sustainable farming practices.",
    category: 'Agriculture',
    status: 'published',
    imageUrl: '/images/ganzafrica-fellows.jpg',
    media: [
      {
        type: 'image',
        url: '/images/ganzafrica-fellows.jpg',
        thumbnail: '/images/ganzafrica-fellows.jpg'
      }
    ]
  },
  {
    id: '5',
    name: 'Michael Chen',
    role: 'Sustainability Officer',
    organization: 'Global Climate Fund',
    quote: 'The commitment to sustainable development and measurable impact makes GanzAfrica a standout partner in climate action.',
    category: 'Climate',
    status: 'archived',
    imageUrl: '/images/ganzafrica-fellows.jpg',
    media: [
      {
        type: 'image',
        url: '/images/ganzafrica-fellows.jpg',
        thumbnail: '/images/ganzafrica-fellows.jpg'
      }
    ]
  },
  {
    id: '6',
    name: 'Grace Mutua',
    role: 'Small Business Owner',
    organization: 'Green Farms Co-op',
    quote: "The modern farming techniques we learned through GanzAfrica's support have doubled our income and opened new market opportunities.",
    category: 'Agriculture',
    status: 'published',
    imageUrl: '/images/ganzafrica-fellows.jpg',
    media: [
      {
        type: 'image',
        url: '/images/ganzafrica-fellows.jpg',
        thumbnail: '/images/ganzafrica-fellows.jpg'
      }
    ]
  }
];

export default function TestimonialsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All Testimonials');

  const categories = [
    'All Testimonials',
    'Agriculture',
    'Climate',
    'Water',
    'Published',
    'Draft',
    'Archived'
  ];

  const filteredTestimonials = activeCategory === 'All Testimonials'
    ? testimonials
    : testimonials.filter(testimonial => 
        testimonial.category === activeCategory || 
        testimonial.status.toLowerCase() === activeCategory.toLowerCase()
      );

  const handleView = (testimonial: Testimonial) => {
    router.push(`/testimonials/${testimonial.id}`);
    toast.info('Viewing testimonial details');
  };

  const handleEdit = (testimonial: Testimonial) => {
    router.push(`/testimonials/edit/${testimonial.id}`);
    toast.info('Opening testimonial for editing');
  };

  const handleDeleteClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedTestimonial) return;
    
    // Remove the testimonial from the state
    setTestimonials(prev => prev.filter(t => t.id !== selectedTestimonial.id));
    
    // Close the dialog
    setDeleteDialogOpen(false);
    setSelectedTestimonial(null);
    
    // Show success message
    toast.success('Testimonial deleted successfully');
  };

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

  const renderMediaPreview = (media: Testimonial['media']) => {
    if (!media || media.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {media.map((item, index) => (
          <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={item.url}
              alt={`Media ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTestimonials.map((testimonial) => (
        <Card key={testimonial.id} className="p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 text-gray-400">
            <Quote size={24} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary-green">
              <AvatarImage 
                src={testimonial.imageUrl} 
                alt={testimonial.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary-green text-white">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{testimonial.name}</h3>
              <p className="text-sm text-gray-600">
                {testimonial.role} at {testimonial.organization}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary">{testimonial.category}</Badge>
            <Badge className={getStatusColor(testimonial.status)}>
              {testimonial.status}
            </Badge>
          </div>
          <blockquote className="text-gray-700 mb-4 flex-grow italic relative pl-4 border-l-2 border-primary-green">
            "{testimonial.quote}"
          </blockquote>
          {renderMediaPreview(testimonial.media)}
          <div className="flex items-center justify-end mt-4 border-t pt-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="View testimonial"
                onClick={() => handleView(testimonial)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary-green hover:bg-green-50"
                title="Edit testimonial"
                onClick={() => handleEdit(testimonial)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:bg-red-50"
                title="Delete testimonial"
                onClick={() => handleDeleteClick(testimonial)}
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
      {filteredTestimonials.map((testimonial) => (
        <Card key={testimonial.id} className="p-6 relative">
          <div className="absolute top-4 right-4 text-gray-400">
            <Quote size={24} />
          </div>
          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary-green">
              <AvatarImage 
                src={testimonial.imageUrl} 
                alt={testimonial.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary-green text-white">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.organization}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{testimonial.category}</Badge>
                  <Badge className={getStatusColor(testimonial.status)}>
                    {testimonial.status}
                  </Badge>
                </div>
              </div>
              <blockquote className="text-gray-700 mb-4 italic relative pl-4 border-l-2 border-primary-green">
                "{testimonial.quote}"
              </blockquote>
              {renderMediaPreview(testimonial.media)}
              <div className="flex items-center justify-end mt-4 border-t pt-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    title="View testimonial"
                    onClick={() => handleView(testimonial)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary-green hover:bg-green-50"
                    title="Edit testimonial"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    title="Delete testimonial"
                    onClick={() => handleDeleteClick(testimonial)}
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
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-gray-500 text-sm">Testimonials List</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUp className="w-4 h-4 mr-2" />
            Import Testimonials
          </button>
          <Link href="/testimonials/add-testimonial" className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800">
            Add Testimonial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

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

      <div className="flex justify-end mb-4">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input 
            type="text" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full pl-10 p-2.5" 
            placeholder="Search testimonials"
          />
        </div>
        <button className="ml-2 p-2.5 bg-green-700 text-white rounded" title="Filter testimonials">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-end mb-4">
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
      </div>

      {viewMode === 'grid' ? renderGridView() : renderListView()}

      <div className="flex items-center justify-between py-3">
        <div className="text-sm text-gray-500">
          Showing {filteredTestimonials.length} out of {testimonials.length} entries
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100" title="First page">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100" title="Previous page">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-2 w-8 h-8 rounded-md bg-green-700 text-white flex items-center justify-center">
            1
          </button>
          <button className="p-2 w-8 h-8 rounded-md hover:bg-gray-100 text-gray-700 flex items-center justify-center">
            2
          </button>
          <button className="p-2 w-8 h-8 rounded-md hover:bg-gray-100 text-gray-700 flex items-center justify-center">
            3
          </button>
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100" title="Next page">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100" title="Last page">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
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