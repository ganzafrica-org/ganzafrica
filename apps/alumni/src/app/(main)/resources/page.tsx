"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Search,
  Download,
  ExternalLink,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  resourcesApi,
  type Resource,
  type ResourceStats,
  type ResourceFilters,
  type Pagination,
} from "@/lib/api/alumni";
import { uploadFile, formatFileSize, getFileCategory } from "@/lib/api/upload";

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

// Skeleton Components
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const ResourcesListSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Stats Cards Component
const StatsCards = ({ stats }: { stats: ResourceStats }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-100">
          Total Resources
        </CardTitle>
        <BookOpen className="h-5 w-5 text-emerald-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.totalResources}</div>
        <p className="text-xs text-emerald-100 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Available resources
        </p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">
          Featured
        </CardTitle>
        <Star className="h-5 w-5 text-blue-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.featuredResources}</div>
        <p className="text-xs text-blue-100">Highlighted resources</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">
          Total Downloads
        </CardTitle>
        <Download className="h-5 w-5 text-amber-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.totalDownloads}</div>
        <p className="text-xs text-amber-100">Community engagement</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-purple-100">
          Categories
        </CardTitle>
        <BookOpen className="h-5 w-5 text-purple-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.categoriesCount}</div>
        <p className="text-xs text-purple-100">Topic areas</p>
      </CardContent>
    </Card>
  </div>
);

// Resource Card Component
const ResourceCard = ({ resource }: { resource: Resource }) => (
  <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 h-full flex flex-col">
    <CardContent className="p-6 flex-1 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {resource.isFeatured && (
              <Badge className="bg-green-primary text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge
              className={`bg-gradient-to-br ${getDepartmentColor(resource.category)} text-white border-0`}
            >
              {resource.type}
            </Badge>
          </div>
          <Link href={`/resources/${resource.id}`}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
              {resource.title}
            </h3>
          </Link>
          <p className="text-gray-700 text-sm mb-3 line-clamp-3 flex-1">
            {resource.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="font-medium">By {resource.author.name}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-auto">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {resource.views}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {resource.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {resource.likes}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {resource.rating}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{resource.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <span>Format: {resource.fileType || "N/A"}</span>
          <span>{resource.estimatedTime || "N/A"}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            asChild
            className="flex-1 bg-green-primary hover:bg-green-600"
          >
            <Link href={`/resources/${resource.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Contribution Form Component
const ContributeResourceForm = ({
  categories,
  types,
  onSubmit,
  onCancel,
}: {
  categories: string[];
  types: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    fileUrl: "",
    fileType: "",
    fileSize: "",
    thumbnailUrl: "",
    tags: "",
    estimatedTime: "",
    pages: "",
    duration: "",
    externalUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      // Update form data with uploaded file info
      setFormData({
        ...formData,
        fileUrl: result.file.url,
        fileType: getFileCategory(result.file.type),
        fileSize: formatFileSize(result.file.size),
      });

      setIsUploading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setSelectedFile(null);
      alert("Failed to upload file. Please try again.");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setFormData({
      ...formData,
      fileUrl: "",
      fileType: "",
      fileSize: "",
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.type ||
      !formData.category ||
      !formData.fileUrl
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        fileUrl: formData.fileUrl,
        fileType: formData.fileType || undefined,
        fileSize: formData.fileSize || undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : undefined,
        estimatedTime: formData.estimatedTime || undefined,
        pages: formData.pages ? parseInt(formData.pages, 10) : undefined,
        duration: formData.duration || undefined,
        externalUrl: formData.externalUrl || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
        <CardTitle className="text-xl text-slate-800">
          Contribute a Resource
        </CardTitle>
        <CardDescription>
          Share valuable resources with the GanzAfrica alumni community!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Complete Guide to Career Transition"
              className="border-slate-200"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Describe what this resource covers and who would benefit from it..."
            rows={4}
            className="border-slate-200"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger className="border-slate-200">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Method Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Resource File <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant={uploadMethod === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMethod("upload")}
              className={
                uploadMethod === "upload"
                  ? "bg-green-primary hover:bg-green-600"
                  : ""
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMethod === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMethod("url")}
              className={
                uploadMethod === "url"
                  ? "bg-green-primary hover:bg-green-600"
                  : ""
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Provide URL
            </Button>
          </div>

          {uploadMethod === "upload" ? (
            <div className="space-y-3">
              {!selectedFile ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-green-primary transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, Images, or Videos (max 100MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-green-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Input
              placeholder="https://example.com/resource.pdf"
              className="border-slate-200"
              value={formData.fileUrl}
              onChange={(e) =>
                setFormData({ ...formData, fileUrl: e.target.value })
              }
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">File Type</label>
            <Input
              placeholder="e.g., PDF"
              className="border-slate-200"
              value={formData.fileType}
              onChange={(e) =>
                setFormData({ ...formData, fileType: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">File Size</label>
            <Input
              placeholder="e.g., 2.4 MB"
              className="border-slate-200"
              value={formData.fileSize}
              onChange={(e) =>
                setFormData({ ...formData, fileSize: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Time</label>
            <Input
              placeholder="e.g., 2 hours"
              className="border-slate-200"
              value={formData.estimatedTime}
              onChange={(e) =>
                setFormData({ ...formData, estimatedTime: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pages (for documents)</label>
            <Input
              type="number"
              placeholder="e.g., 45"
              className="border-slate-200"
              value={formData.pages}
              onChange={(e) =>
                setFormData({ ...formData, pages: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (for videos)</label>
            <Input
              placeholder="e.g., 3.5 hours"
              className="border-slate-200"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <Input
            placeholder="e.g., Career, Transition, Salary, Skills"
            className="border-slate-200"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">External URL (optional)</label>
          <Input
            placeholder="https://example.com/original-source"
            className="border-slate-200"
            value={formData.externalUrl}
            onChange={(e) =>
              setFormData({ ...formData, externalUrl: e.target.value })
            }
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            className="bg-green-primary hover:bg-green-600"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.title ||
              !formData.description ||
              !formData.type ||
              !formData.category ||
              !formData.fileUrl
            }
          >
            {isSubmitting ? "Submitting..." : "Contribute Resource"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-slate-200"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AlumniResources() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "12", 10);
  const initialCategory = searchParams.get("category") || "all";
  const initialType = searchParams.get("type") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";

  // State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageLimit] = useState(initialLimit);
  const [showContributeForm, setShowContributeForm] = useState(false);

  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [filters, setFilters] = useState<ResourceFilters | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update URL params
  const updateUrlParams = useCallback(
    (params: Record<string, string | number>) => {
      const newParams = new URLSearchParams();

      newParams.set("page", params.page?.toString() || "1");
      newParams.set("limit", params.limit?.toString() || "12");

      if (params.category && params.category !== "all") {
        newParams.set("category", params.category.toString());
      }
      if (params.type && params.type !== "all") {
        newParams.set("type", params.type.toString());
      }
      if (params.search && params.search !== "") {
        newParams.set("search", params.search.toString());
      }
      if (params.sort && params.sort !== "newest") {
        newParams.set("sort", params.sort.toString());
      }

      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await resourcesApi.getStats();
        setStats(response.stats);
      } catch (error) {
        console.error("Failed to fetch resource stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoadingResources(true);
        const response = await resourcesApi.getAll({
          page: currentPage,
          limit: pageLimit,
          category: selectedCategory,
          type: selectedType,
          search: debouncedSearch,
          sort: sortBy,
        });

        setResources(response.resources);
        setPagination(response.pagination);
        setFilters(response.filters);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setIsLoadingResources(false);
      }
    };

    fetchResources();
  }, [
    currentPage,
    pageLimit,
    selectedCategory,
    selectedType,
    debouncedSearch,
    sortBy,
  ]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams({
      page: currentPage,
      limit: pageLimit,
      category: selectedCategory,
      type: selectedType,
      search: debouncedSearch,
      sort: sortBy,
    });
  }, [
    currentPage,
    pageLimit,
    selectedCategory,
    selectedType,
    debouncedSearch,
    sortBy,
    updateUrlParams,
  ]);

  // Reset to page 1 when filters change
  const handleFilterChange = (
    setter: (value: string) => void,
    value: string,
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleContributeResource = async (data: any) => {
    try {
      await resourcesApi.create(data);
      setShowContributeForm(false);
      // Refresh stats and resources
      const [statsRes, resourcesRes] = await Promise.all([
        resourcesApi.getStats(),
        resourcesApi.getAll({
          page: 1,
          limit: pageLimit,
          sort: "newest",
        }),
      ]);
      setStats(statsRes.stats);
      setResources(resourcesRes.resources);
      setPagination(resourcesRes.pagination);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to create resource:", error);
    }
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Resource Library
          </h1>
          <p className="text-gray-600">
            Access curated resources from our expert alumni
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowContributeForm(!showContributeForm)}
            className="bg-green-primary hover:bg-green-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Contribute Resource
          </Button>
        </div>
      </div>

      {/* Contribution Form */}
      {showContributeForm && (
        <ContributeResourceForm
          categories={
            filters?.categories || [
              "Career Development",
              "Entrepreneurship",
              "Product Management",
              "Land Management",
              "Agriculture",
              "Environmental Conservation",
              "Water Resources",
              "Climate Action",
            ]
          }
          types={
            filters?.types || [
              "Guide",
              "Template",
              "Video Course",
              "Toolkit",
              "Report",
              "Cheat Sheet",
              "Case Study",
            ]
          }
          onSubmit={handleContributeResource}
          onCancel={() => setShowContributeForm(false)}
        />
      )}

      {/* Quick Stats */}
      {isLoadingStats ? (
        <StatsSkeleton />
      ) : (
        stats && <StatsCards stats={stats} />
      )}

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                value={selectedCategory}
                onValueChange={(v) =>
                  handleFilterChange(setSelectedCategory, v)
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filters?.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedType}
                onValueChange={(v) => handleFilterChange(setSelectedType, v)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filters?.types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count & Pagination Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination
            ? `Showing ${(currentPage - 1) * pagination.limit + 1}-${Math.min(currentPage * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} resources`
            : "Loading..."}
        </p>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={!pagination.hasMore}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Resource Cards */}
      {isLoadingResources ? (
        <ResourcesListSkeleton />
      ) : resources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing filters
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bottom Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={!pagination.hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
