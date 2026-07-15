"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  ExternalLink,
  Eye,
  ThumbsUp,
  MessageSquare,
  Send,
  Trash2,
  Heart,
} from "lucide-react";
import { achievementsApi, AchievementDetail } from "@/lib/api/alumni";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

const getDepartmentColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case "recognition":
      return "from-yellow-500 to-orange-600";
    case "professional":
      return "from-blue-500 to-cyan-600";
    case "business milestone":
      return "from-emerald-500 to-green-600";
    case "academic":
      return "from-purple-500 to-indigo-600";
    case "competition":
      return "from-red-500 to-pink-600";
    case "community":
      return "from-indigo-500 to-purple-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const DetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-10 w-full" />
    <div className="flex gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <Skeleton className="h-40 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

export default function AchievementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const achievementId = parseInt(params.id as string, 10);

  const [achievement, setAchievement] = useState<AchievementDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        setIsLoading(true);
        const response = await achievementsApi.getOne(achievementId);
        setAchievement(response.achievement);
      } catch (error) {
        console.error("Failed to fetch achievement:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(achievementId)) {
      fetchAchievement();
    }
  }, [achievementId]);

  const handleLike = async () => {
    if (!achievement) return;

    try {
      const result = await achievementsApi.toggleLike(achievement.id);
      setAchievement({
        ...achievement,
        likes: result.likes,
        hasLiked: result.liked,
      });
    } catch (error) {
      console.error("Failed to like achievement:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!achievement || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const response = await achievementsApi.addComment(achievement.id, commentText);
      setAchievement({
        ...achievement,
        comments: [response.comment, ...achievement.comments],
      });
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!achievement) return;

    try {
      await achievementsApi.deleteComment(achievement.id, commentId);
      setAchievement({
        ...achievement,
        comments: achievement.comments.filter((c) => c.id !== commentId),
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-6 flex items-center justify-center">
        <Card className="text-center p-12">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Achievement Not Found</h2>
            <p className="text-gray-600 mb-6">
              The achievement you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/achievements">Back to Achievements</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Main Achievement Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Header with Avatar and Info */}
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="w-20 h-20">
                {achievement.achiever.avatar ? (
                  <AvatarImage src={achievement.achiever.avatar} alt={achievement.achiever.name} />
                ) : (
                  <AvatarFallback
                    className={`bg-gradient-to-br ${getDepartmentColor(achievement.category)} text-white font-semibold text-2xl`}
                  >
                    {achievement.achiever.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{achievement.title}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className="font-semibold">{achievement.achiever.name}</span>
                  {achievement.achiever.title && (
                    <>
                      <span>•</span>
                      <span>{achievement.achiever.title}</span>
                    </>
                  )}
                  {achievement.achiever.company && (
                    <>
                      <span>•</span>
                      <span>{achievement.achiever.company}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    className={`bg-gradient-to-br ${getDepartmentColor(achievement.category)} text-white border-0`}
                  >
                    {achievement.category}
                  </Badge>
                  {achievement.type && <Badge variant="secondary">{achievement.type}</Badge>}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-6 text-gray-600 flex-wrap">
                {achievement.organization && (
                  <span className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-orange-500" />
                    {achievement.organization}
                  </span>
                )}
                {achievement.location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    {achievement.location}
                  </span>
                )}
                {achievement.date && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    {new Date(achievement.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>

              {achievement.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {achievement.description}
                  </p>
                </div>
              )}

              {achievement.tags && achievement.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {achievement.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-6 text-gray-500">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">{achievement.views}</span>
                  <span className="text-sm">views</span>
                </span>
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  <span className="font-medium">{achievement.likes}</span>
                  <span className="text-sm">likes</span>
                </span>
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">{achievement.comments.length}</span>
                  <span className="text-sm">comments</span>
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant={achievement.hasLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className={
                    achievement.hasLiked
                      ? "bg-blue-secondary hover:bg-blue-primary"
                      : "border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                  }
                >
                  <Heart className={`h-4 w-4 mr-2 ${achievement.hasLiked ? "fill-current" : ""}`} />
                  {achievement.hasLiked ? "Liked" : "Like"}
                </Button>
                {achievement.link && (
                  <Button
                    variant="outline"
                    className="border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white"
                    asChild
                  >
                    <a href={achievement.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Source
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({achievement.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment Form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts or congratulations..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                className="border-slate-200 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="bg-green-primary hover:bg-green-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {achievement.comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                achievement.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      {comment.user.avatar ? (
                        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm">
                          {comment.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{comment.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {user && comment.user.id.toString() === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
