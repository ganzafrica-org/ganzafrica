'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  role: string;
  organization: string;
  quote: string;
  category: string;
  status: string;
  imageUrl?: string;
}

export default function EditTestimonialPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    organization: '',
    quote: '',
    category: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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

    setFormData(mockTestimonial);
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real application, make an API call to update the testimonial
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Testimonial updated successfully');
      router.push('/testimonials');
    } catch (error) {
      toast.error('Failed to update testimonial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Testimonial</h1>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                id="quote"
                name="quote"
                value={formData.quote}
                onChange={handleInputChange}
                required
                className="h-32"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary-green hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Testimonial'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 