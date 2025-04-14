'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardHeader, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Mock categories with their respective colors
const categories = [
  { name: 'General', color: 'bg-blue-100 text-blue-800' },
  { name: 'Food System', color: 'bg-green-100 text-green-800' },
  { name: 'Climate Adaptation', color: 'bg-orange-100 text-orange-800' },
  { name: 'Data & Evidence', color: 'bg-purple-100 text-purple-800' },
  { name: 'Co-creation', color: 'bg-pink-100 text-pink-800' },
];

// Mock FAQs data
const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'What is GanzAfrica\'s mission?',
    answer: 'GanzAfrica is dedicated to transforming African agriculture through innovative solutions, data-driven approaches, and sustainable practices that benefit local communities.',
    category: 'General'
  },
  {
    id: '2',
    question: 'How can I participate in the food system initiatives?',
    answer: 'You can participate by joining our programs, attending workshops, or partnering with us on agricultural projects. Contact our team for more information.',
    category: 'Food System'
  },
  {
    id: '3',
    question: 'What climate adaptation strategies do you implement?',
    answer: 'We implement various strategies including drought-resistant farming techniques, water conservation methods, and sustainable land management practices.',
    category: 'Climate Adaptation'
  },
  {
    id: '4',
    question: 'How do you collect and analyze agricultural data?',
    answer: 'We use advanced monitoring systems, field surveys, and digital tools to collect data. Our team of experts analyzes this data to provide actionable insights.',
    category: 'Data & Evidence'
  },
  {
    id: '5',
    question: 'What is the co-creation process?',
    answer: 'Our co-creation process involves working directly with communities to develop solutions that address their specific needs and challenges.',
    category: 'Co-creation'
  }
];

export default function FAQsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [faqs, setFaqs] = useState(mockFAQs);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <Link href="/faqs/add">
          <Button className="bg-primary-green hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Categories */}
        <div className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
          <h2 className="font-semibold text-gray-700 mb-4">Categories</h2>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === null 
                  ? 'bg-primary-green text-white' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === category.name 
                    ? 'bg-primary-green text-white' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - FAQs */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* FAQs List */}
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <Card 
                key={faq.id} 
                className={`overflow-hidden transition-shadow hover:shadow-md ${
                  expandedId === faq.id ? 'ring-1 ring-primary-green' : ''
                }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => toggleExpand(faq.id)}
                >
                  <CardHeader className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3 flex-1">
                      <h3 className="font-medium text-gray-900 flex-1">{faq.question}</h3>
                      <Badge className={`${getCategoryColor(faq.category)} text-xs`}>
                        {faq.category}
                      </Badge>
                      {expandedId === faq.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                </button>
                {expandedId === faq.id && (
                  <CardContent className="px-4 py-3 bg-gray-50 border-t text-sm">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            
            {filteredFAQs.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg">
                <p className="text-gray-500">No FAQs found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 