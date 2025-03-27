"use client";

import React, { useState } from 'react';
import Container from '@/components/layout/container';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { newsItems, generateSlug } from '@/app/lib/news-data';
import type { NewsItem } from '@/app/lib/news-data';

type NewsCategory = 'all' | 'news' | 'blogs' | 'reports' | 'publications';

const NavigationItem = ({ 
  label, 
  isActive,
  onClick 
}: { 
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button 
    onClick={onClick}
    className={`relative group flex items-center gap-2 px-4 py-2 font-bold text-lg transition-colors duration-300 ${
      isActive ? 'text-black' : 'text-gray-600 hover:text-black'
    }`}
  >
    {label !== "All" && (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.16669 10H15.8334M15.8334 10L10.8334 5M15.8334 10L10.8334 15" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
    {label === "All" && (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.16669 10H15.8334M15.8334 10L10.8334 5M15.8334 10L10.8334 15" stroke="#FFB800" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
    {label}
    {isActive && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB800] rounded-full" />
    )}
    {!isActive && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB800] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    )}
  </button>
);

const NewsCard = ({ item }: { item: NewsItem }) => {
  const slug = generateSlug(item.title);
  
  return (
    <Link href={`/newsroom/${slug}`} className="block group">
      <div className="relative bg-white rounded-[24px] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative aspect-[16/10]">
          {/* Image Container */}
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Green overlay with 50% opacity */}
          <div className="absolute inset-0 bg-[#005C3D] opacity-50"></div>
          
          {/* Date Badge - White background with green text */}
          <div className="absolute top-4 left-4 px-4 py-1 bg-white text-primary-green rounded-full text-sm font-medium">
            {item.date}
          </div>

          {/* Category Label - Transparent background with yellow border and text */}
          <div className="absolute top-[52px] left-4 px-4 py-1 bg-transparent text-secondary-yellow border border-secondary-yellow rounded-full text-sm font-medium">
            {item.category}
          </div>

          {/* Arrow Button */}
          <div className="absolute top-4 right-4">
            <div className="relative w-10 h-10 rounded-full bg-[#FFB800] flex items-center justify-center cursor-pointer transform transition-all duration-300 ease-out hover:scale-110 hover:rotate-12 hover:bg-primary-green">
              <ArrowUpRight className="w-5 h-5 text-white transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

const NewsroomPage = () => {
  const [activeFilter, setActiveFilter] = useState<NewsCategory>('all');

  const filteredItems = newsItems.filter(item => 
    activeFilter === 'all' ? true : item.category.toLowerCase().replace(' ', '-') === activeFilter
  );

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/team.png"
            alt="Ganz Africa Newsroom"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
            Empowering Africa's Future Through Transformative
          </h1>
          <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6">
            NEWS &UPDATES
          </h2>
        </div>
      </section>

      <Container className="py-12">
        {/* Navigation */}
        <nav className="mb-12 flex items-center justify-center space-x-12 overflow-x-auto pb-4 scrollbar-hide border-b border-gray-200">
          <NavigationItem 
            label="All" 
            isActive={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')}
          />
          <NavigationItem 
            label="News" 
            isActive={activeFilter === 'news'} 
            onClick={() => setActiveFilter('news')}
          />
          <NavigationItem 
            label="Blogs" 
            isActive={activeFilter === 'blogs'} 
            onClick={() => setActiveFilter('blogs')}
          />
          <NavigationItem 
            label="Reports" 
            isActive={activeFilter === 'reports'} 
            onClick={() => setActiveFilter('reports')}
          />
          <NavigationItem 
            label="Publications" 
            isActive={activeFilter === 'publications'} 
            onClick={() => setActiveFilter('publications')}
          />
        </nav>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </main>
  );
};

export default NewsroomPage;