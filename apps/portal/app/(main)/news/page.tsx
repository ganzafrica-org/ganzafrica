"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import Image from "next/image";

// Mock data for news items
const mockNews = [
  {
    id: 1,
    title: "New Agricultural Development Initiative Launched",
    author: "John Doe",
    category: "Agriculture",
    publishDate: "2024-03-15",
    status: "published",
    featureImage: "/1.jpg"
  },
  {
    id: 2,
    title: "Climate Change Impact Study Results Released",
    author: "Jane Smith",
    category: "Climate",
    publishDate: "2024-03-14",
    status: "published",
    featureImage: "/1.jpg"
  },
  {
    id: 3,
    title: "Technology Innovation in Rural Communities",
    author: "Mike Johnson",
    category: "Technology",
    publishDate: "2024-03-13",
    status: "draft",
    featureImage: "/1.jpg"
  }
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handleImageError = (newsId: number) => {
    setFailedImages(prev => ({
      ...prev,
      [newsId]: true
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">News & Updates</h1>
          <p className="text-gray-500">Manage and publish news articles</p>
        </div>
        <Link href="/news/add-news">
          <Button className="bg-green-700 hover:bg-green-800">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create News
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* News table */}
      <div className="bg-white rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature Image
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockNews.map((news) => (
              <tr key={news.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                    {failedImages[news.id] ? (
                      <div className="w-full h-full bg-green-700 text-white flex items-center justify-center text-sm font-medium">
                        {news.category.slice(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <Image
                        src={news.featureImage}
                        alt={news.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                        onError={() => handleImageError(news.id)}
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{news.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{news.author}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{news.category}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{news.publishDate}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    news.status === "published" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {news.status.charAt(0).toUpperCase() + news.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => window.location.href = `/news/${news.id}`}
                        className="cursor-pointer"
                      >
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.location.href = `/news/${news.id}/edit`}
                        className="cursor-pointer"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          // Handle delete
                          console.log('Delete:', news.id);
                        }}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
