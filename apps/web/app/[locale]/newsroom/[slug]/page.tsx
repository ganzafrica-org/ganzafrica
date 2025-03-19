"use client";

import React from 'react';
import Container from '@/components/layout/container';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getNewsBySlug } from '@/app/lib/news-data';

interface CategoryBadge {
  label: string;
  color: string;
}

const CategoryBadge = ({ label, color }: CategoryBadge) => (
  <div 
    className={`px-6 py-2 rounded-full text-sm font-medium ${color}`}
  >
    {label}
  </div>
);

interface PageProps {
  params: {
    slug: string;
  };
}

export default function NewsDetailsPage({ params }: PageProps) {
  const newsData = getNewsBySlug(params.slug);

  if (!newsData) {
    return (
      <main className="bg-white min-h-screen py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been moved.</p>
            <Link 
              href="/newsroom" 
              className="inline-flex items-center text-primary-green hover:text-primary-green/80"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Newsroom
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const categories = [
    { 
      label: newsData.category === 'Blogs' ? 'Blog' : newsData.category, 
      color: newsData.category === 'Blogs' || newsData.category === 'News' 
        ? 'bg-[#FFB800] text-black' 
        : 'bg-primary-green text-white'
    }
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[480px]">
        <Image
          src={newsData.image}
          alt={newsData.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content Section */}
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          {/* Back Button */}
          <Link 
            href="/newsroom" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Newsroom
          </Link>

          {/* Categories */}
          <div className="flex gap-4 mb-8">
            {categories.map((category: CategoryBadge, index: number) => (
              <CategoryBadge 
                key={index}
                label={category.label}
                color={category.color}
              />
            ))}
          </div>

          {/* Title */}
          <h1 className="text-[40px] font-bold text-gray-900 mb-4 leading-tight">
            {newsData.title}
          </h1>

          {/* Date */}
          <div className="text-gray-600 mb-12">
            {newsData.date}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {newsData.content.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className="text-gray-600 mb-6 text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
} 