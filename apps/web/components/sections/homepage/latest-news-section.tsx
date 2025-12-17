'use client';

import React, { useState, useEffect } from 'react';
import { DecoratedHeading } from '@/components/layout/headertext';
import { CalendarDays, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDict } from '@/context/dictionary';

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
}

// Define color scheme for "Read more" links (matching project cards)
const LINK_COLORS = ['#f8b712', '#009758', '#073392'];

// Helper function to get link color
const getLinkColor = (index: number) => {
  return LINK_COLORS[index % LINK_COLORS.length];
};

export default function NewsSection({ locale }: NewsSectionProps) {
  const dict = useDict();
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
        }).catch(error => {
          console.warn('API error, using fallback data', error.message);
          // Use fallback news instead of empty array
          setNewsItems(getFallbackNews());
          setLoading(false);
          return null;
        });
        
        if (response) {
          if (response.data.news && response.data.news.length > 0) {
            setNewsItems(response.data.news);
            setError(null);
          } else {
            // If API returns empty array, use fallback news
            console.info('No news from API, using fallback data');
            setNewsItems(getFallbackNews());
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Unable to load news');
        // Set fallback news in case of error
        setNewsItems(getFallbackNews());
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Fallback news
  const getFallbackNews = () => {
    return [
      {
        id: 1,
        title: 'Sustainable Agriculture Workshop',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        summary: 'Join us for a hands-on workshop on sustainable farming techniques.',
        image_url: '/images/ganzafrica-fellows.jpg',
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
        image_url: '/images/ganzafrica-fellows.jpg',
        status: 'published',
        author_id: 2,
        author_name: 'Jane Smith',
        category_id: 2,
        category_name: 'Announcements',
        tags: ['partnership', 'sustainability'],
        publish_date: '2025-04-12T14:30:00.000Z',
        created_at: '2025-04-11T10:15:00.000Z',
        updated_at: '2025-04-11T10:15:00.000Z'
      },
      {
        id: 3,
        title: 'Community Outreach Program Success',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        summary: 'Our recent community outreach program exceeded all expectations.',
        image_url: '/images/ganzafrica-fellows.jpg',
        status: 'published',
        author_id: 3,
        author_name: 'David Johnson',
        category_id: 3,
        category_name: 'Success Stories',
        tags: ['community', 'outreach', 'impact'],
        publish_date: '2025-04-08T11:00:00.000Z',
        created_at: '2025-04-07T16:30:00.000Z',
        updated_at: '2025-04-07T16:30:00.000Z'
      }
    ];
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength = 100) => {
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
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="h-12 w-72 bg-gray-200 animate-pulse rounded-md mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse perspective-wrapper">
                <div className="h-48 bg-gray-200 perspective-element"></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-4"></div>
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show no news available message
  if (!loading && newsItems.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <DecoratedHeading
              firstText={dict?.news?.heading_first ?? "Latest"}
              secondText={dict?.news?.heading_second ?? "News"}
              className="mx-auto"
            />
          </div>
          
          {/* No News Message */}
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No News Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We don't have any news articles at the moment. Please check back later for updates.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <DecoratedHeading
            firstText={dict?.news?.heading_first ?? "Latest"}
            secondText={dict?.news?.heading_second ?? "News"}
            className="mx-auto"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center text-red-500 mb-8" role="alert">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((newsItem, index) => {
            const slug = generateSlug(newsItem.title);
            const linkColor = getLinkColor(index);
            
            return (
              <motion.div 
                key={newsItem.id} 
                className="news-card perspective-wrapper"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* Image with perspective effect */}
                <div className="perspective-element">
                  <div 
                    className="perspective-image" 
                    style={{ 
                      backgroundImage: `url(${getImageUrl(newsItem)})`,
                      backgroundColor: '#117B34', // Backup color if image fails
                    }}
                  >
                    {/* Category badge */}
                    {newsItem.category_name && (
                      <span className="absolute top-3 left-3 bg-primary-green text-white text-xs font-semibold px-2.5 py-1 rounded-sm z-10">
                        {newsItem.category_name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-5 bg-white">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formatDate(newsItem.publish_date)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                    {newsItem.title}
                  </h3>

                  {/* Summary or truncated content */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {newsItem.summary || truncateText(newsItem.content)}
                  </p>

                  {/* Read more link - styled like project cards */}
                  <Link
                    href={`/${locale}/newsroom/${slug}`}
                    className="inline-flex items-center text-sm font-medium group transition-opacity duration-300"
                    style={{ color: linkColor }}
                  >
                    <span className="border-b border-transparent group-hover:border-current transition-all duration-300">
                      {dict?.news?.read_more ?? "Read more"}
                    </span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View all news button */}
        {newsItems.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/newsroom"
              className={cn(
                "inline-flex items-center gap-2",
                "bg-primary-green hover:bg-primary-green/90",
                "text-white py-2.5 px-6 rounded-lg",
                "transition-all duration-300 hover:shadow-lg",
                "text-sm font-medium"
              )}
            >
              <span>{dict?.news?.view_all ?? "View All News"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Custom CSS for the perspective effect and button styling */}
      <style jsx global>{`
        .news-card {
          position: relative;
          border-radius: 5px;
          background: white;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .news-card:hover {
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }
        
        .perspective-wrapper {
          perspective: 1000px;
        }
        
        .perspective-element {
          position: relative;
          height: 180px;
          width: 100%;
          overflow: hidden;
          transform-style: preserve-3d;
          border-radius: 5px 5px 0 0;
        }
        
        .perspective-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          border-radius: 5px 5px 0 0;
          transform: translateZ(0) rotateY(-5deg) scale(1.05);
          transform-origin: right center;
          box-shadow: -8px 5px 10px rgba(0,0,0,0.1);
          transition: all 0.5s ease;
        }
        
        .news-card:hover .perspective-image {
          transform: translateZ(10px) rotateY(-8deg) scale(1.08);
        }
        
        @media (max-width: 768px) {
          .news-card {
            max-width: 320px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}