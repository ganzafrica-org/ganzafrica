"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Download,
  Eye,
  Heart,
  Star,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  FileText,
  User,
  Share2,
} from "lucide-react";
import { resourcesApi, type ResourceDetail } from "@/lib/api/alumni";

const getDepartmentColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "career development":
      return "from-emerald-500 to-green-600";
    case "entrepreneurship":
      return "from-blue-500 to-cyan-600";
    case "product management":
      return "from-amber-500 to-orange-600";
    case "land management":
      return "from-green-600 to-emerald-700";
    case "agriculture":
      return "from-lime-500 to-green-600";
    case "environmental conservation":
      return "from-teal-500 to-cyan-600";
    case "water resources":
      return "from-blue-500 to-blue-700";
    case "climate action":
      return "from-indigo-500 to-purple-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const ResourceDetailSkeleton = () => (
  <div className="space-y-6">
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-20 w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = parseInt(params.id as string, 10);

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setIsLoading(true);
        const response = await resourcesApi.getOne(resourceId);
        setResource(response.resource);
        setUserRating(response.resource.userRating || 0);
      } catch (error) {
        console.error("Failed to fetch resource:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(resourceId)) {
      fetchResource();
    }
  }, [resourceId]);

  const handleLike = async () => {
    if (!resource) return;

    try {
      const result = await resourcesApi.toggleLike(resource.id);
      setResource({
        ...resource,
        likes: result.likes,
        hasLiked: result.liked,
      });
    } catch (error) {
      console.error("Failed to like resource:", error);
    }
  };

  const handleDownload = async () => {
    if (!resource) return;

    try {
      await resourcesApi.trackDownload(resource.id);
      setResource({
        ...resource,
        downloads: resource.downloads + 1,
      });

      // Open the file URL
      window.open(resource.fileUrl, "_blank");
    } catch (error) {
      console.error("Failed to track download:", error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!resource) return;

    try {
      const result = await resourcesApi.rate(resource.id, rating);
      setUserRating(rating);
      setResource({
        ...resource,
        rating: result.rating,
        ratingCount: result.ratingCount,
        userRating: rating,
      });
    } catch (error) {
      console.error("Failed to rate resource:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>
        <ResourceDetailSkeleton />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource not found</h3>
            <p className="text-gray-600 mb-4">
              The resource you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button
              onClick={() => router.push("/resources")}
              className="bg-green-primary hover:bg-green-600"
            >
              Browse Resources
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Resources
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resource Header */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {resource.isFeatured && (
                    <Badge className="bg-green-primary text-white border-0 mb-2">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={`bg-gradient-to-br ${getDepartmentColor(resource.category)} text-white border-0`}
                    >
                      {resource.category}
                    </Badge>
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">{resource.description}</p>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Eye className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-900">{resource.views}</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Download className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-900">{resource.downloads}</div>
                  <div className="text-xs text-gray-600">Downloads</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Heart className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-900">{resource.likes}</div>
                  <div className="text-xs text-gray-600">Likes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-900">{resource.rating}</div>
                  <div className="text-xs text-gray-600">({resource.ratingCount} ratings)</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-green-primary hover:bg-green-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resource
                </Button>
                <Button
                  variant={resource.hasLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className={
                    resource.hasLiked
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                  }
                >
                  <Heart className={`h-4 w-4 mr-2 ${resource.hasLiked ? "fill-current" : ""}`} />
                  {resource.hasLiked ? "Liked" : "Like"}
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {resource.externalUrl && (
                  <Button
                    variant="outline"
                    asChild
                    className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                  >
                    <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Rating Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate this resource</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="text-sm text-gray-600 ml-2">
                      You rated this {userRating} star
                      {userRating !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Contributed by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback
                    className={`bg-gradient-to-br ${getDepartmentColor(resource.category)} text-white font-semibold`}
                  >
                    {resource.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">{resource.author.name}</div>
                  {resource.author.title && (
                    <div className="text-sm text-gray-600">{resource.author.title}</div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                asChild
              >
                <Link href={`/directory?search=${resource.author.name}`}>
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Resource Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Resource Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resource.fileType && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Format
                  </span>
                  <span className="font-medium text-gray-900">{resource.fileType}</span>
                </div>
              )}
              {resource.fileSize && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Size</span>
                  <span className="font-medium text-gray-900">{resource.fileSize}</span>
                </div>
              )}
              {resource.pages && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pages</span>
                  <span className="font-medium text-gray-900">{resource.pages}</span>
                </div>
              )}
              {resource.duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{resource.duration}</span>
                </div>
              )}
              {resource.estimatedTime && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Est. Time
                  </span>
                  <span className="font-medium text-gray-900">{resource.estimatedTime}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm pt-3 border-t">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Added
                </span>
                <span className="font-medium text-gray-900">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
