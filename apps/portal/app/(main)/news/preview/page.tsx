"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PreviewData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage: {
    url: string;
    width: number;
    height: number;
  } | null;
  publishDate: string;
}

export default function NewsPreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featuredImage: null,
    publishDate: new Date().toISOString()
  });

  const router = useRouter();

  useEffect(() => {
    // Get preview data from sessionStorage
    const storedData = sessionStorage.getItem('newsPreview');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setPreviewData(parsedData);
    }
  }, []);

  const formattedDate = previewData.publishDate ? new Date(previewData.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[480px] bg-gray-100">
        {previewData.featuredImage?.url ? (
          <div className="relative w-full h-full">
            <img
              src={previewData.featuredImage.url}
              alt={previewData.title}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No featured image
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Back Button */}
        <Button 
          variant="ghost"
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Editor
        </Button>

        {/* Preview Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            This is a preview of how your article will look when published. You can go back to make changes.
          </p>
        </div>

        {/* Categories */}
        {previewData.category && (
          <div className="flex gap-4 mb-8">
            <span className="px-4 py-1.5 bg-primary-green text-white rounded-full text-sm font-medium">
              {previewData.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-[40px] font-bold text-gray-900 mb-4 leading-tight">
          {previewData.title}
        </h1>

        {/* Date */}
        <div className="text-gray-600 mb-12">
          {formattedDate}
        </div>

        {/* Excerpt */}
        {previewData.excerpt && (
          <div className="prose prose-lg max-w-none mb-8 text-gray-600 text-lg leading-relaxed italic">
            {previewData.excerpt}
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: previewData.content }}
        />
      </div>
    </main>
  );
} 