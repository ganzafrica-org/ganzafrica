'use client';

import React, { useState, useEffect } from 'react';
import { DecoratedHeading } from '@/components/layout/headertext';
import { CalendarDays, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

// Interface for the news data from the API
interface NewsItem {
  id: number;
  title: string;
  content: string;
  summary: string;
  image_url: string;
  media?: {
    items?: { cover?: boolean; type?: string; url?: string }[];
  };
  status: string;
  author_id: number;
  author_name: string;
  category_id: number;
  category_name: string;
  tags: string[];
  publish_date: string;
  created_at: string;
  updated_at: string;
}

interface NewsResponse {
  news: NewsItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface NewsSectionProps {
  locale: string;
  dict: any;
}

export default function NewsSection({ locale, dict }: NewsSectionProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to generate a slug
  const generateSlug = (title: string) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Fetch news from API
  useEffect(() => {
    console.log("useEffect triggered");
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<NewsResponse>('/news', {
          params: {
            status: 'published',
            limit: 3, // Show only 3 latest news
            sortBy: 'publish_date',
            sortDir: 'desc'
          }
        });
        console.log(response.data.news);

        setNewsItems(response.data.news);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
        // Set fallback news in case of error
        setNewsItems([
          {
            id: 1,
            title: 'Sustainable Agriculture Workshop',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            summary: 'Join us for a hands-on workshop on sustainable farming techniques.',
            image_url: '/images/news-1.jpg',
            status: 'published',
            author_id: 1,
            author_name: 'John Doe',
            category_id: 1,
            category_name: 'Events',
            tags: ['farming', 'workshop', 'sustainability'],
            publish_date: '2025-04-15T09:00:00.000Z',
            created_at: '2025-04-10T09:00:00.000Z',
            updated_at: '2025-04-10T09:00:00.000Z'
          },
          {
            id: 2,
            title: 'New Partnership Announcement',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            summary: 'We are excited to announce our new partnership with Sustainable Futures.',
            image_url: '/images/news-2.jpg',
            status: 'published',
            author_id: 2,
            author_name: 'Jane Smith',
            category_id: 2,
            category_name: 'Announcements',
            tags: ['partnership', 'sustainability'],
            publish_date: '2025-04-12T14:30:00.000Z',
            created_at: '2025-04-11T10:15:00.000Z',
            updated_at: '2025-04-11T10:15:00.000Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Helper function to format date
// Helper function to format date using string manipulation
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  // Helper function to truncate text
  const truncateText = (text: string, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Function to get the best available image for a news item
  const getImageUrl = (newsItem: NewsItem): string => {
    try {
      // First priority: Check if media.items exists and has cover image
      if (newsItem.media?.items?.length) {
        // Try to find a cover image first
        const coverImage = newsItem.media.items.find(item => 
          item.cover === true && item.type === 'image' && item.url
        );
        
        if (coverImage && coverImage.url) {
          return coverImage.url;
        }
        
        // If no cover image, try the first image
        const firstImage = newsItem.media.items.find(item => 
          item.type === 'image' && item.url
        );
        
        if (firstImage && firstImage.url) {
          return firstImage.url;
        }
      }
      
      // Second priority: Use image_url if available
      if (newsItem.image_url) {
        return newsItem.image_url;
      }
      
      // Fallback to default image
      return '/images/default-news.jpg';
    } catch (error) {
      console.error('Error getting image URL:', error);
      return '/images/default-news.jpg';
    }
  };

  // Show loading skeleton
  if (loading && newsItems.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 w-72 bg-gray-200 animate-pulse rounded-md mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full"></div>
                    <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-4"></div>
                  <div className="h-10 w-36 bg-gray-200 animate-pulse rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <DecoratedHeading
            firstText={dict?.news?.heading_first ?? "Latest"}
            secondText={dict?.news?.heading_second ?? "News"}
            className="mx-auto"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center text-red-500 mb-8">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((newsItem) => {
            const slug = generateSlug(newsItem.title);
            return (
              <div key={newsItem.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                <div className="relative h-48">
                  {/* Image with enhanced image finding logic */}
                  <div className="w-full h-full">
                    <img
                      src={getImageUrl(newsItem)}
                      alt={newsItem.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = '/images/default-news.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Category badge */}
                  {newsItem.category_name && (
                    <span className="absolute top-3 left-3 bg-primary-green text-white text-xs font-medium px-2.5 py-1 rounded z-10">
                      {newsItem.category_name}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formatDate(newsItem.publish_date)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2">
                    {newsItem.title}
                  </h3>

                  {/* Summary or truncated content */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {newsItem.summary || truncateText(newsItem.content)}
                  </p>

                  {/* Read more button - Now using Link and slug */}
                  <Link
                    href={`/${locale}/newsroom/${slug}`}
                    className="inline-flex items-center gap-2 text-primary-orange font-medium rounded-full px-4 py-2 border border-primary-orange hover:bg-primary-orange hover:text-white transition-colors"
                  >
                    <span>{dict?.news?.read_more ?? "Read More"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all news button */}
        {newsItems.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href={`/${locale}/newsroom`}
              className="inline-flex items-center gap-2 bg-primary-green text-white font-medium rounded-full px-6 py-3 hover:bg-primary-green/90 transition-colors"
            >
              <span>{dict?.news?.view_all ?? "View All News"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}