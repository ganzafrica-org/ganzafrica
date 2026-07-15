import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRatingColor, getStarRating } from "./performance-table";

interface PerformanceFeedbackListProps {
  data: any[];
}

const PerformanceFeedbackList = ({ data }: PerformanceFeedbackListProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {data.map((feedback) => (
          <Card
            key={feedback.id}
            className="hover:shadow-lg transition-all duration-300 border border-slate-200"
          >
            <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-base">{feedback.employeeName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs ${
                        feedback.feedbackType === "360_review"
                          ? "bg-purple-100 text-purple-800"
                          : feedback.feedbackType === "peer_review"
                            ? "bg-blue-100 text-blue-800"
                            : feedback.feedbackType === "project_feedback"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {feedback.feedbackType.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {feedback.reviewerRole}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getRatingColor(feedback.rating)}`}>
                    {feedback.rating}
                  </div>
                  <div className="flex">{getStarRating(feedback.rating)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Feedback from {feedback.reviewer}</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">{feedback.feedback}</p>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Category Ratings</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(feedback.categories).map(([category, rating]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center p-2 bg-slate-50 rounded"
                    >
                      <span className="capitalize">{category}</span>
                      <span className={`font-medium ${getRatingColor(rating as number)}`}>
                        {rating as React.ReactNode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t text-xs text-muted-foreground">
                <span>{new Date(feedback.date).toLocaleDateString()}</span>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  <Eye className="h-3 w-3 mr-1" />
                  View Full
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50 rounded-t-lg border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            Feedback Summary
          </CardTitle>
          <CardDescription>Overview of feedback patterns and trends</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-2xl font-bold text-green-600">4.1</div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-xs text-muted-foreground">Across all feedback</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
              <div className="text-2xl font-bold text-purple-600">89%</div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-xs text-muted-foreground">Feedback requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default PerformanceFeedbackList;
