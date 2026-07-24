"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Building,
  Clock,
  DollarSign,
  ExternalLink,
  Send,
  Globe,
  Eye,
  Calendar,
  User,
  CheckCircle,
} from "lucide-react";
import { jobsApi, type Job } from "@/lib/api/alumni";

const getSectorColor = (sector: string) => {
  switch (sector.toLowerCase()) {
    case "land":
      return "from-emerald-500 to-green-600";
    case "agriculture":
      return "from-amber-500 to-orange-600";
    case "environment":
      return "from-cyan-500 to-teal-600";
    case "communications":
      return "from-purple-500 to-indigo-600";
    case "ict":
      return "from-blue-500 to-cyan-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const formatSalary = (min: number | null, max: number | null, currency: string) => {
  if (!min && !max) return null;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  });
  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
  if (min) return `From ${formatter.format(min)}`;
  if (max) return `Up to ${formatter.format(max)}`;
  return null;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to strip HTML tags and clean up text
const stripHtml = (html: string | null): string => {
  if (!html) return "";

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  text = textarea.value;

  // Clean up extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
};

const JobDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded" />
      <Skeleton className="h-8 w-64" />
    </div>
    <Card>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const response = await jobsApi.getOne(parseInt(jobId));
        setJob(response.job);
      } catch (err) {
        setError("Failed to load job details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen">
        <JobDetailSkeleton />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen">
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || "Job not found"}</p>
            <Button onClick={() => router.push("/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/jobs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
          Job Details
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              {/* Job Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                    <p className="text-lg text-gray-600 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {job.company}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      variant={job.source === "internal" ? "default" : "secondary"}
                      className={job.source === "internal" ? "bg-green-primary" : ""}
                    >
                      {job.source === "internal" ? "Internal" : "External"}
                    </Badge>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-br ${getSectorColor(job.sector)} text-white`}
                    >
                      {job.sector}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-gray-600">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      {job.location}
                    </span>
                  )}
                  {job.jobType && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      {job.jobType}
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Globe className="h-4 w-4" />
                      Remote
                    </span>
                  )}
                  {job.experienceLevel && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4 text-purple-500" />
                      {job.experienceLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {stripHtml(job.description) || "No description available."}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-4">
              {salary && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-600">Salary</p>
                    <p className="font-semibold text-gray-900">{salary}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Views</p>
                  <p className="font-semibold text-gray-900">{job.views}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="font-semibold text-gray-900">{formatDate(job.createdAt)}</p>
                </div>
              </div>

              {job.deadline && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-semibold text-gray-900">{formatDate(job.deadline)}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <Button
                  className="w-full bg-green-primary hover:bg-green-600"
                  size="lg"
                  onClick={() => job.applicationUrl && window.open(job.applicationUrl, "_blank")}
                  disabled={!job.applicationUrl}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Apply Now
                </Button>

                {job.applicationUrl && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                    onClick={() => window.open(job.applicationUrl!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Original Posting
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <Button variant="outline" className="w-full" onClick={() => router.push("/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}
