"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, X } from "lucide-react";
import Container from "@/components/layout/container";
import axios from "axios";
import apiClient from "@/lib/api-client";
import { useParams, useSearchParams } from "next/navigation";
import { trackNewsArticleView, trackVideoEvent } from "@/components/analytics/google-analytics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeLink = Link as unknown as React.ComponentType<any>;

type SvgIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const CalendarIcon = Calendar as unknown as SvgIconComponent;
const ArrowLeftIcon = ArrowLeft as unknown as SvgIconComponent;
const XIcon = X as unknown as SvgIconComponent;

// Define the MediaItem type
interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video" | "other";
  cover?: boolean;
  order?: number;
  thumbnailUrl?: string;
}

// Main article type (matches the /news API response shape)
interface Article {
  id: string;
  title: string;
  content?: string;
  description?: string;
  publish_date?: string;
  tags?: { id: string; name: string }[];
  highlights?: string[];
  media?: {
    items?: MediaItem[];
  };
}

// Shared helper functions (must be defined before components that use them)
const generateSlug = (title: string) => {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Accepts any object that may contain media items (Article or related article)
const getCoverImage = (
  article: { media?: { items?: MediaItem[] } } | null | undefined,
): string | null => {
  try {
    if (!article?.media?.items?.length) return null;

    const coverImage = article.media.items.find(
      (mediaItem: MediaItem) => mediaItem.cover === true && mediaItem.type === "image",
    );
    if (coverImage?.url) return coverImage.url;

    const firstImage = article.media.items.find(
      (mediaItem: MediaItem) => mediaItem.type === "image",
    );
    return firstImage?.url || null;
  } catch (error) {
    console.error("Error getting cover image:", error);
    return null;
  }
};

const getMediaItems = (
  article: { media?: { items?: MediaItem[] } } | null | undefined,
): MediaItem[] => {
  try {
    if (!article?.media?.items?.length) return [];
    return [...article.media.items].sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error getting media items:", error);
    return [];
  }
};

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

      await new Promise((resolve) => setTimeout(resolve, delay));

      return axiosInstance(config);
    }
  }

  return Promise.reject(err);
});

// Throttled axios instance for API requests
interface ThrottledAxios {
  get: (url: string, config?: Record<string, any>) => Promise<any>;
}

const throttledAxios: ThrottledAxios = {
  get: (url, config = {}) => {
    return axiosInstance.get(url, config);
  },
};

// Component that uses useSearchParams
// Extracted components - move these outside the main component file or to a separate components file
interface RelatedArticle {
  id: string;
  title: string;
  publish_date?: string;
  tags?: { id: string; name: string }[];
  media?: {
    items?: MediaItem[];
  };
}

interface RelatedArticleCardProps {
  item: RelatedArticle;
}

const RelatedArticleCard = ({ item }: RelatedArticleCardProps) => {
  const itemSlug = generateSlug(item.title);
  const imageUrl = getCoverImage(item);

  return (
    <SafeLink
      href={`/newsroom/${itemSlug}`}
      aria-label="More about Ganza's news and updates"
      className="block group"
    >
      <div className="relative bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-[16/10]">
          {imageUrl ? (
            <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Tag badge */}
          {item.tags && item.tags.length > 0 && (
            <div className="absolute bottom-2 left-2 px-3 py-1 bg-[#00A651] text-white rounded-full text-xs font-medium">
              {item.tags[0]?.name || "Unknown"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {formatDate(item.publish_date)}
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
        </div>
      </div>
    </SafeLink>
  );
};

interface MediaThumbnailProps {
  mediaItem: MediaItem;
  index: number;
  onClick: (mediaItem: MediaItem) => void;
}

const MediaThumbnail = ({ mediaItem, index, onClick }: MediaThumbnailProps) => {
  return (
    <div
      className="cursor-pointer rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
      onClick={() => onClick(mediaItem)}
    >
      {mediaItem.type === "image" ? (
        <div className="aspect-[16/10] group">
          <img
            src={mediaItem.url}
            alt={`Media ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : mediaItem.type === "video" ? (
        <div className="relative aspect-[16/10] bg-black group">
          <img
            src={mediaItem.thumbnailUrl || mediaItem.url}
            alt={`Video ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#00A651]"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Unknown media type</span>
        </div>
      )}
    </div>
  );
};

// Main component with all hooks at the top
const NewsDetailsContent = () => {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY EARLY RETURNS
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { slug } = params;

  // State hooks
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);

  // Get API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

  // ALL useEffect hooks
  useEffect(() => {
    const fetchArticleBySlug = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/news");

        if (response.data && response.data.news) {
          const articles = response.data.news;
          const foundArticle = articles.find(
            (article: { title: any }) => generateSlug(article.title) === slug,
          );

          if (foundArticle) {
            setArticle(foundArticle);
            trackNewsArticleView(foundArticle.title, foundArticle.tags?.[0]?.name);

            if (foundArticle.tags && foundArticle.tags.length > 0) {
              const mainTag = foundArticle.tags[0];
              const related = articles
                .filter(
                  (a: any) =>
                    a.id !== foundArticle.id && a.tags?.some((tag: any) => tag.id === mainTag.id),
                )
                .slice(0, 3);
              setRelatedArticles(related);
            }
            setError(false);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching article details:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticleBySlug();
    }
  }, [slug, API_BASE_URL]);

  // Loading and Error states - NOW SAFE after all hooks
  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A651]"></div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <Container className="py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
            <p className="text-gray-600 mb-8">
              The article you're looking for may have been removed or doesn't exist.
            </p>
            <SafeLink
              href={`/newsroom`}
              aria-label="Back to the list of all news and updates"
              className="inline-flex items-center px-6 py-3 bg-[#00A651] text-white rounded-md hover:bg-[#008f46] transition-colors"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back to Newsroom
            </SafeLink>
          </div>
        </Container>
      </main>
    );
  }

  // All helper functions now live at the top of this file (shared between components)
  const processContentWithWordBreaks = (htmlContent: string) => {
    const isHTML = /<[a-z][\s\S]*>/i.test(htmlContent);
    // ... rest of the function remains the same
    if (isHTML) {
      return htmlContent
        .replace(/(<p>)(.*?)(<\/p>)/gs, (match, openTag, content, closeTag) => {
          const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
          let processedContent = "";
          let wordCount = 0;
          let currentChunk = "";

          sentences.forEach((sentence: string) => {
            const trimmedSentence: string = sentence.trim();
            const sentenceWordCount: number = trimmedSentence.split(/\s+/).length;

            if (wordCount + sentenceWordCount > 100 && wordCount > 0) {
              processedContent += currentChunk + "<br /><br />";
              currentChunk = trimmedSentence;
              wordCount = sentenceWordCount;
            } else {
              currentChunk += (currentChunk ? " " : "") + trimmedSentence;
              wordCount += sentenceWordCount;
            }
          });

          if (currentChunk) {
            processedContent += currentChunk;
          }

          return `${openTag}${processedContent}${closeTag}<div class="my-6"></div>`;
        })
        .replace(
          /<h([1-6])>(.*?)<\/h\1>/g,
          (match, level, content) => `<h${level} class="mt-8 mb-4">${content}</h${level}>`,
        );
    } else {
      // Plain text processing logic...
      const paragraphs = htmlContent.split(/\n\n|\r\n\r\n/);
      let processedHTML = "";

      paragraphs.forEach((paragraph) => {
        if (paragraph.trim() === "") return;
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        let processedParagraph = "<p>";
        let wordCount = 0;
        let currentChunk = "";

        sentences.forEach((sentence) => {
          const trimmedSentence = sentence.trim();
          const sentenceWordCount = trimmedSentence.split(/\s+/).length;

          if (wordCount + sentenceWordCount > 100 && wordCount > 0) {
            processedParagraph += currentChunk + "<br /><br />";
            currentChunk = trimmedSentence;
            wordCount = sentenceWordCount;
          } else {
            currentChunk += (currentChunk ? " " : "") + trimmedSentence;
            wordCount += sentenceWordCount;
          }
        });

        if (currentChunk) {
          processedParagraph += currentChunk;
        }

        processedParagraph += '</p><div class="my-6"></div>';
        processedHTML += processedParagraph;
      });

      return processedHTML;
    }
  };

  const handleMediaClick = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedMedia(null);
  };

  // Derived values
  const mainImageUrl = getCoverImage(article);
  const allMediaItems = getMediaItems(article);
  const displayTitle = article.title;
  const displayContent =
    article.content || article.description || "No content available for this article.";

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          {mainImageUrl ? (
            <img src={mainImageUrl} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#004D40] to-[#00A651]"></div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-10 z-20">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags?.map((tag) => (
              <span
                key={tag.id}
                className="px-4 py-1 bg-[#FFB800] text-white rounded-full text-sm font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold max-w-4xl">
            {displayTitle}
          </h1>
          <div className="flex items-center mt-4 text-white/80">
            <CalendarIcon className="h-5 w-5 mr-2" />
            {formatDate(article.publish_date)}
          </div>
        </div>
      </section>

      {/* Rest of JSX remains the same but using extracted components */}
      <Container className="py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3">
            <SafeLink
              href={`/newsroom`}
              className="inline-flex items-center text-[#00A651] hover:text-[#008f46] mb-6 transition-colors"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back to Newsroom
            </SafeLink>

            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div
                className="prose prose-lg max-w-none prose-headings:mb-6 prose-headings:mt-8 prose-p:my-4 prose-p:leading-relaxed prose-img:my-8 prose-img:rounded-lg prose-hr:my-10"
                dangerouslySetInnerHTML={{
                  __html: processContentWithWordBreaks(displayContent),
                }}
              />

              {allMediaItems.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Media Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allMediaItems.map((mediaItem, index) => (
                      <MediaThumbnail
                        key={mediaItem.id || index}
                        mediaItem={mediaItem}
                        index={index}
                        onClick={handleMediaClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share section remains the same */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Share this article</h3>
              <div className="flex gap-3">{/* Social share buttons */}</div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-6 bg-[#00A651] rounded-full mr-2"></span>
                  Related Articles
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map((item) => (
                    <RelatedArticleCard key={item.id} item={item} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <SafeLink
                    href={`/newsroom`}
                    className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-[#00A651] border border-[#00A651] rounded-md hover:bg-[#00A651] hover:text-white transition-colors"
                  >
                    View All News
                  </SafeLink>
                </div>
              </div>
            )}

            {article.highlights && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-6 bg-[#FFB800] rounded-full mr-2"></span>
                  Key Highlights
                </h3>
                <ul className="space-y-3">
                  {article.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <div className="min-w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center text-white text-xs mr-3 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{highlight}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* MediaGalleryModal component - you should also extract this to be outside */}
      {isGalleryOpen && selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeGallery}
        >
          <div
            className="relative max-w-6xl w-full h-auto mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
              onClick={closeGallery}
            >
              <XIcon className="w-6 h-6 text-white" />
            </button>
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Media preview"
                className="max-h-[85vh] max-w-full object-contain mx-auto"
              />
            ) : selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                controls
                className="max-h-[85vh] max-w-full mx-auto bg-black"
                poster={selectedMedia.thumbnailUrl}
                onPlay={() => trackVideoEvent("play", article?.title || "Unknown Video")}
                onPause={() => trackVideoEvent("pause", article?.title || "Unknown Video")}
                onEnded={() => trackVideoEvent("complete", article?.title || "Unknown Video")}
              />
            ) : (
              <div className="bg-gray-200 p-10 rounded-lg text-center">
                <p>Unsupported media type</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

// Main page component with Suspense wrapper
const NewsDetailsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A651]"></div>
        </div>
      }
    >
      <NewsDetailsContent />
    </Suspense>
  );
};

export default NewsDetailsPage;
