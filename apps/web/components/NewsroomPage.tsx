"use client";

import apiClient from "@/lib/api-client";

declare global {
  interface Window {
    lastAxiosRequestTime?: number;
    lastNewsFetchTime?: number;
  }
}

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/container";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import HeaderBelt from "@/components/layout/headerBelt";
import axios from 'axios';
import { useParams } from "next/navigation";
import { TranslatableText } from "@/components/translate/TranslatableText";
import { trackPageView, trackEvent } from "@/components/analytics/google-analytics";

// Normalize Next.js Link typing across React type versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeLink = Link as unknown as React.ComponentType<any>;

// Normalize Next.js Image typing across React type versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeImage = Image as unknown as React.ComponentType<any>;

// Normalize lucide icon component types across React type versions
// type SvgIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
// const ArrowUpRightIcon = ArrowUpRight as unknown as SvgIconComponent;

// Create an axios instance with retry configuration
const axiosInstance = axios.create({
  timeout: 10000,
});

// Add a retry interceptor
axiosInstance.interceptors.response.use(undefined, async (err) => {
  const { config, response } = err;

  if ((response && response.status === 429) || !response) {
    const maxRetries = 3;
    config.retryCount = config.retryCount || 0;

    if (config.retryCount < maxRetries) {
      config.retryCount += 1;

      const delay = Math.pow(2, config.retryCount) * 1000;
      console.log(`Retrying request (${config.retryCount}/${maxRetries}) after ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));

      return axiosInstance(config);
    }
  }

  return Promise.reject(err);
});

// Add a request interceptor to add a delay between requests
axiosInstance.interceptors.request.use(async (config) => {
  const now = Date.now();
  const lastRequestTime = window.lastAxiosRequestTime || 0;
  const minRequestInterval = 300; // minimum ms between requests

  if (now - lastRequestTime < minRequestInterval) {
    const delayMs = minRequestInterval - (now - lastRequestTime);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  window.lastAxiosRequestTime = Date.now();

  return config;
});

// Add a request throttling mechanism
const pendingRequests: Record<string, Promise<any>> = {};

interface ThrottledAxiosConfig {
  params?: Record<string, any>;
  timeout?: number; // Add timeout property
}

interface ThrottledAxios {
  get: (url: string, config?: ThrottledAxiosConfig) => Promise<any>;
  delete: (url: string, config?: ThrottledAxiosConfig) => Promise<any>;
}

const throttledAxios: ThrottledAxios = {
  get: (url, config = {}) => {
    const key = `${url}${JSON.stringify(config.params || {})}`;

    if (pendingRequests[key]) {
      return pendingRequests[key];
    }

    const request = axiosInstance.get(url, config)
        .finally(() => {
          delete pendingRequests[key];
        });

    pendingRequests[key] = request;
    return request;
  },
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  }
};

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

const NavigationItem = ({
                          label,
                          isActive,
                          onClick,
                          count,
                        }: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}) => (
    <button
        onClick={onClick}
        className={`relative group flex items-center gap-2 px-4 py-2 font-bold text-lg transition-colors duration-300 ${
            isActive ? "text-black" : "text-gray-600 hover:text-black"
        }`}
    >
      {label !== "All" && (
          <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
          >
            <path
                d="M4.16669 10H15.8334M15.8334 10L10.8334 5M15.8334 10L10.8334 15"
                stroke="currentColor"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
          </svg>
      )}
      {label === "All" && (
          <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
          >
            <path
                d="M4.16669 10H15.8334M15.8334 10L10.8334 5M15.8334 10L10.8334 15"
                stroke="#FFB800"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
          </svg>
      )}
      {label}
      {count !== undefined && (
          <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
              isActive ? "bg-[#FFB800] text-white" : "bg-gray-200 text-gray-600"
          }`}>
        {count}
      </span>
      )}
      {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB800] rounded-full" />
      )}
      {!isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB800] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      )}
    </button>
);

interface NewsItem {
  id: string;
  title: string;
  content?: string;
  description?: string;
  publish_date?: string;
  tags?: { id: string; name: string }[];
  media?: {
    items?: { cover?: boolean; type?: string; url?: string }[];
  };
}

const NewsCard = ({ item }: { item: NewsItem }) => {
  const slug = generateSlug(item.title);

  // Format date - using publish_date field
  interface FormatDateOptions {
    month: 'short' | 'long' | 'numeric' | '2-digit';
    day: 'numeric' | '2-digit';
    year: 'numeric' | '2-digit';
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const options: FormatDateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getFirstTag = (tags: string | any[] | undefined) => {
    if (!tags || !tags.length) return "News";
    return tags[0].name;
  };

  // Function to get the cover image from media items
  const getCoverImage = () => {
    try {
      // Check if media and items exist
      if (!item.media?.items?.length) {
        return null;
      }

      // Find the cover image (the one with cover: true)
      const coverImage = item.media.items.find(mediaItem =>
          mediaItem.cover === true && mediaItem.type === 'image'
      );

      // Return the cover image URL if found
      if (coverImage && coverImage.url) {
        return coverImage.url;
      }

      // If no cover image is found, try to get the first image
      const firstImage = item.media.items.find(mediaItem =>
          mediaItem.type === 'image'
      );

      if (firstImage && firstImage.url) {
        return firstImage.url;
      }

      return null;
    } catch (error) {
      console.error('Error getting cover image:', error);
      return null;
    }
  };

  // Get the cover image URL
  const imageUrl = getCoverImage();

  return (
      <Link href={`/newsroom/${slug}`} className="block group">
        <div className="relative bg-white rounded-md overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl border border-gray-200">
          <div className="relative aspect-[16/10]">
            {/* Image Container - Modified to push images down for better face visibility */}
            <div className="w-full h-full overflow-hidden">
              {imageUrl ? (
                  <div className="w-full h-full relative" style={{ transform: 'translateY(-15%)' }}>
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-[130%] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                    />
                  </div>
              ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400"><TranslatableText>No image</TranslatableText></span>
                  </div>
              )}
            </div>

            {/* Green overlay with reduced opacity to ensure image is visible */}
            <div className="absolute inset-0 bg-[#005C3D] opacity-30"></div>

            {/* Date Badge - White background with green text */}
            <div className="absolute top-4 left-4 px-4 py-1 bg-white text-primary-green rounded-full text-sm font-medium z-10">
              {formatDate(item.publish_date)}
            </div>

            {/* Category Label - Transparent background with yellow border and text */}
            <div className="absolute top-[52px] left-4 px-4 py-1 bg-transparent text-secondary-yellow border border-secondary-yellow rounded-full text-sm font-medium z-10">
              {getFirstTag(item.tags)}
            </div>

            {/* Arrow Button */}
            <div className="absolute top-4 right-4 z-10">
              <div className="relative w-10 h-10 rounded-full bg-[#FFB800] flex items-center justify-center cursor-pointer transform transition-all duration-300 ease-out hover:scale-110 hover:rotate-12 hover:bg-primary-green">
                <ArrowUpRight
                    className="w-5 h-5 text-white transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.5}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                <TranslatableText>{item.title}</TranslatableText>
            </h3>
            <p className="text-gray-600 line-clamp-2"><TranslatableText>{item.content?.substring(0, 150) || item.description || "Read more about this news article."}</TranslatableText></p>
          </div>
        </div>
      </Link>
  );
};

// Updated component - instead of receiving props directly, use hooks to get necessary data
const NewsroomPage = () => {
  // Use useParams from the URL
  const params = useParams();

  // Could add dictionary loading here if needed
  // const dict = {} // Replace with your dictionary loading logic

  const [activeFilter, setActiveFilter] = useState("all");
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState(false);

  // Track page view
  useEffect(() => {
    trackPageView('/newsroom', 'Newsroom');
  }, []);

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiClient.get('/news/tags');
        if (response.data && Array.isArray(response.data.tags)) {
          setTags(response.data.tags);
        } else if (Array.isArray(response.data)) {
          setTags(response.data);
        } else {
          console.error('Unexpected tags response format:', response.data);
          setTags([]);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError(true);
        setTags([]);
      }
    };

    fetchTags();
  }, []);

  // Fetch all news
  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        setLoading(true);

        const params = {
          page: 1,
          limit: 50, // Get a reasonable number of articles
          sort_by: 'publish_date',
          sort_order: 'desc',
          status: 'published' // Only show published articles
        };

        console.log('Fetching all news with params:', params);

        const response = await apiClient.get('/news', { params });

        console.log('API response:', response.data);

        if (response.data && response.data.news) {
          const newsData = response.data.news || [];
          setAllNews(newsData);

          // Calculate tag counts from the fetched data
          const counts: Record<string, number> = { all: newsData.length };

          newsData.forEach((article: { tags: any[]; }) => {
            if (article.tags && Array.isArray(article.tags)) {
              article.tags.forEach(tag => {
                counts[tag.id as string] = (counts[tag.id as string] || 0) + 1;
              });
            }
          });

          setTagCounts(counts);
          setError(false);
        } else {
          setAllNews([]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(true);
        setAllNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  // Filter news based on activeFilter
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredNews(allNews);
    } else {
      const tagId = activeFilter;
      const filtered = allNews.filter(article =>
          article.tags &&
          Array.isArray(article.tags) &&
          article.tags.some(tag => tag.id.toString() === tagId)
      );
      setFilteredNews(filtered);
    }
  }, [activeFilter, allNews]);

  return (
      <main className="min-h-screen">
    {/* Hero Section */}
<section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden z-0">
  <div className="absolute inset-0">
    <div className="relative w-full h-[130%]" style={{ transform: 'translateY(-18%)' }}>
      <Image
        src="/images/DSC_1430.JPG"
        alt="Ganz Africa Newsroom"
        fill
        className="object-cover object-top"
        priority
      />
    </div>
  </div>

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/70 z-10"></div>

  {/* Content */}
  <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
  <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-8">
      <TranslatableText>NEWS &UPDATES</TranslatableText>
    </h2>
    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight">
    <TranslatableText>Sharing Our Progress and  Transformative Impact</TranslatableText>
    </h1>

  </div>
</section>
        <div className="w-full overflo-hidden z-10">
          <div className="flex justify-center">
            <HeaderBelt />
          </div>
        </div>

        <Container className="py-12">
          {/* Navigation */}
          <nav className="mb-12 flex items-center justify-center space-x-12 overflow-x-auto pb-4 scrollbar-hide">
            <NavigationItem
                label={<TranslatableText>All</TranslatableText>}
                isActive={activeFilter === "all"}
                onClick={() => {
                    setActiveFilter("all");
                    trackEvent('newsroom_filter_change', { filter: 'all' });
                }}
                count={tagCounts.all}
            />
            {tags.map(tag => (
                <NavigationItem
                    key={tag.id}
                    label={tag.name}
                    isActive={activeFilter === tag.id.toString()}
                    onClick={() => {
                        setActiveFilter(tag.id.toString());
                        trackEvent('newsroom_filter_change', { filter: tag.name });
                    }}
                    count={tagCounts[tag.id] || 0}
                />
            ))}
          </nav>

          {/* News Grid */}
          {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB800]"></div>
              </div>
          ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-gray-800"><TranslatableText>Unable to load news</TranslatableText></h3>
                <p className="text-gray-600 mt-2"><TranslatableText>We're experiencing technical difficulties. Please try again later.</TranslatableText></p>
              </div>
          ) : filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-gray-800"><TranslatableText>No news articles found</TranslatableText></h3>
                <p className="text-gray-600 mt-2"><TranslatableText>Please check back later for updates or try another category.</TranslatableText></p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item) => (
                    <NewsCard key={item.id} item={item} />
                ))}
              </div>
          )}
        </Container>
      </main>
  );
};

export default NewsroomPage;