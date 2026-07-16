"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Timer, Clock, UserCheck, TrendingUp, CheckCircle } from "lucide-react";
import { AttendanceStats } from "@/components/sections/attendance/attendance-stats";
import { AttendanceSearch } from "@/components/sections/attendance/attendance-search";
import { AttendanceTable } from "@/components/sections/attendance/attendance-table";
import { EventAttendanceCards } from "@/components/sections/attendance/event-attendance-cards";
import { AttendanceAnalytics } from "@/components/sections/attendance/attendance-analytics";
import { PendingApprovals } from "@/components/sections/attendance/pending-approvals";
import {
  attendanceData,
  weeklyAttendanceData,
  attendanceTypesData,
  eventAttendanceData,
} from "@/data/attendance-data";

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filteredAttendance = attendanceData.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesType =
      attendanceTypeFilter === "all" || record.attendanceType === attendanceTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="w-full flex justify-center items-center p-6 bg-transparent">
      <div className="flex flex-col space-y-6 mx-auto w-[80%]">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button>
              <Timer className="h-4 w-4" /> Bulk Check-in
            </Button>
          </div>
        </div>

        <div className="w-full">
          <AttendanceStats />
        </div>

        <Tabs defaultValue="daily" className="flex flex-col gap-5 w-full">
          <TabsList className="bg-white shadow-sm border w-full flex flex-row">
            <TabsTrigger
              value="daily"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4 mr-2" /> Daily Attendance
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="flex-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <UserCheck className="h-4 w-4 mr-2" /> Event Attendance
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger
              value="approvals"
              className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="flex flex-col space-y-6">
            <AttendanceSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              attendanceTypeFilter={attendanceTypeFilter}
              setAttendanceTypeFilter={setAttendanceTypeFilter}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            <AttendanceTable data={filteredAttendance} selectedDate={selectedDate} />
          </TabsContent>

          <TabsContent value="events" className="flex flex-col space-y-6">
            <EventAttendanceCards data={eventAttendanceData} />
          </TabsContent>

          <TabsContent value="analytics" className="flex flex-col space-y-6">
            <AttendanceAnalytics
              weeklyAttendanceData={weeklyAttendanceData}
              attendanceTypesData={attendanceTypesData}
            />
          </TabsContent>

          <TabsContent value="approvals" className="flex flex-col space-y-6">
            <PendingApprovals data={attendanceData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
