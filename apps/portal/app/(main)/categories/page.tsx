"use client";

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string;
  section: string;
  color: string;
  usageCount: number;
}

// Mock data for initial categories
const mockCategories: Category[] = [
  // FAQs Categories
  {
    id: '1',
    name: 'General',
    description: 'General questions about GanzAfrica and our services',
    section: 'FAQs',
    color: 'bg-blue-100 text-blue-800',
    usageCount: 5
  },
  {
    id: '2',
    name: 'Food System',
    description: 'Questions about our food system initiatives and programs',
    section: 'FAQs',
    color: 'bg-green-100 text-green-800',
    usageCount: 8
  },
  {
    id: '3',
    name: 'Climate Adaptation',
    description: 'Information about our climate adaptation strategies',
    section: 'FAQs',
    color: 'bg-orange-100 text-orange-800',
    usageCount: 6
  },
  // Project Categories
  {
    id: '4',
    name: 'Agriculture',
    description: 'Agricultural development and farming projects',
    section: 'Projects',
    color: 'bg-emerald-100 text-emerald-800',
    usageCount: 12
  },
  {
    id: '5',
    name: 'Technology',
    description: 'Technology and innovation projects',
    section: 'Projects',
    color: 'bg-purple-100 text-purple-800',
    usageCount: 7
  },
  // Testimonial Categories
  {
    id: '6',
    name: 'Water',
    description: 'Water access and management testimonials',
    section: 'Testimonials',
    color: 'bg-cyan-100 text-cyan-800',
    usageCount: 4
  }
];

const sections = ['All', 'FAQs', 'Projects', 'Testimonials', 'News'];
const colorOptions = [
  { name: 'Blue', value: 'bg-blue-100 text-blue-800' },
  { name: 'Green', value: 'bg-green-100 text-green-800' },
  { name: 'Orange', value: 'bg-orange-100 text-orange-800' },
  { name: 'Purple', value: 'bg-purple-100 text-purple-800' },
  { name: 'Pink', value: 'bg-pink-100 text-pink-800' },
  { name: 'Cyan', value: 'bg-cyan-100 text-cyan-800' },
  { name: 'Emerald', value: 'bg-emerald-100 text-emerald-800' },
  { name: 'Yellow', value: 'bg-yellow-100 text-yellow-800' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    section: '',
    color: colorOptions[0].value
  });

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === 'All' || category.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.section || !newCategory.color) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCategoryObj: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCategory.name,
      description: newCategory.description,
      section: newCategory.section,
      color: newCategory.color,
      usageCount: 0
    };

    setCategories([...categories, newCategoryObj]);
    setIsAddDialogOpen(false);
    setNewCategory({ name: '', description: '', section: '', color: colorOptions[0].value });
    toast.success('Category added successfully');
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category && category.usageCount > 0) {
      toast.error(`Cannot delete category "${category.name}" as it is being used by ${category.usageCount} items`);
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Category deleted successfully');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-600">Manage categories across all sections</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-green hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category that can be used across different sections of the application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select
                  value={newCategory.section}
                  onValueChange={(value) => setNewCategory({ ...newCategory, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.filter(s => s !== 'All').map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={newCategory.color}
                  onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded ${color.value.split(' ')[0]} mr-2`} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter category description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} className="bg-primary-green hover:bg-green-700">
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-10"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${category.color.split(' ')[0]}`} />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                <Badge className={category.color}>{category.section}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Used in {category.usageCount} {category.usageCount === 1 ? 'item' : 'items'}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => {/* Handle edit */}}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.usageCount > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
          <p className="text-gray-500">No categories match your current filters.</p>
        </div>
      )}
    </div>
  );
} 