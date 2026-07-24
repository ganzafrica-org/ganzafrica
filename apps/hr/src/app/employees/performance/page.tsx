"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, Target, MessageSquare, BarChart3, CheckCircle } from "lucide-react";
import { PerformanceStats } from "@/components/sections/performance/performance-stats";
import { PerformanceSearch } from "@/components/sections/performance/performance-search";
import { PerformanceTable } from "@/components/sections/performance/performance-table";
import { PerformanceOKRList } from "@/components/sections/performance/performance-okr-list";
import PerformanceFeedbackList from "@/components/sections/performance/performance-feedback-list";
import { PerformanceAnalytics } from "@/components/sections/performance/performance-analytics";
import { PerformanceDetailDialog } from "@/components/sections/performance/performance-detail-dialog";
import {
  performanceData,
  okrData,
  feedbackData,
  performanceTrendsData,
  departmentPerformanceData,
} from "@/data/performance-data";

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const filteredPerformance = performanceData.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || record.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="w-full flex justify-center p-6 bg-transparent">
      <div className="flex flex-col space-y-6 w-[80%]">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Performance Management
          </h1>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
            >
              <Download className="h-4 w-4" /> Export Reports
            </Button>
            <Button>
              <Plus className="h-4 w-4" /> New Review Cycle
            </Button>
          </div>
        </div>

        <div className="w-full">
          <PerformanceStats />
        </div>

        <Tabs defaultValue="reviews" className="flex flex-col gap-10 w-full">
          <TabsList className="bg-white shadow-sm border w-full flex flex-row">
            <TabsTrigger
              value="reviews"
              className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Performance Reviews
            </TabsTrigger>
            <TabsTrigger
              value="okrs"
              className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Target className="h-4 w-4 mr-2" /> OKRs & Goals
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> 360° Feedback
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="flex flex-col space-y-6">
            <PerformanceSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
            />
            <PerformanceTable
              data={filteredPerformance}
              onViewDetails={setSelectedEmployee}
              onConductReview={(emp) => {
                setSelectedEmployee(emp);
                setShowReviewDialog(true);
              }}
            />
          </TabsContent>

          <TabsContent value="okrs" className="flex flex-col space-y-6">
            <PerformanceOKRList data={okrData} />
          </TabsContent>

          <TabsContent value="feedback" className="flex flex-col space-y-6">
            <PerformanceFeedbackList data={feedbackData} />
          </TabsContent>

          <TabsContent value="analytics" className="flex flex-col space-y-6">
            <PerformanceAnalytics
              performanceTrendsData={performanceTrendsData}
              departmentPerformanceData={departmentPerformanceData}
            />
          </TabsContent>
        </Tabs>

        <PerformanceDetailDialog
          employee={selectedEmployee}
          open={!!selectedEmployee && !showReviewDialog}
          onOpenChange={(open) => !open && setSelectedEmployee(null)}
          onConductReview={() => setShowReviewDialog(true)}
        />
      </div>
    </div>
  );
};

export default Page;
