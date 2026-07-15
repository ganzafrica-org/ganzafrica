"use client";

import React from "react";
import { Plus, MoreVertical, Edit, Eye, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface KnowledgeBaseProps {
  faqData: any[];
}

export const KnowledgeBase = ({ faqData }: KnowledgeBaseProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">
            Frequently asked questions and self-service resources
          </p>
        </div>
        <Button>
          <Plus className=" h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {faqData.map((faq) => (
          <Card
            key={faq.id}
            className="hover:shadow-md transition-all duration-300 border border-slate-200"
          >
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-emerald-50">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    {faq.category}
                  </Badge>
                  <CardTitle className="text-base leading-tight">{faq.question}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Stats
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {faq.answer}
              </p>

              <div className="flex flex-wrap gap-1">
                {faq.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                <div className="flex items-center gap-3">
                  <span>{faq.views} views</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {faq.helpful}
                  </span>
                </div>
                <span>Updated {new Date(faq.lastUpdated).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-green-600">
                  {Math.round((faq.helpful / faq.views) * 100)}% helpful
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  <Eye className="h-3 w-3 mr-1" />
                  View Full
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
