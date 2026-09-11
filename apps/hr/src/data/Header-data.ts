import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  FileCog,
  CircleCheckBig,
  ClipboardCheck,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  Star,
  Target,
  CheckCircle,
  Trophy,
} from "lucide-react";
export type HeaderStat = {
  /** Required unless `content` is set. */
  icon?: LucideIcon | React.ReactElement;
  label: string;
  /** Required unless `content` is set. */
  value?: string;
  delta?: {
    direction: "up" | "down";
    value: string;
  };
  comparison?: string;
  /** When set, replaces the default icon/value layout for this card entirely (e.g. a progress
   *  ring instead of a number) — `icon`/`value`/`delta`/`comparison` are ignored. */
  content?: React.ReactNode;
};

export const defaultStats: HeaderStat[] = [
  {
    icon: Users,
    label: "Total Employee",
    value: "845",
    delta: { direction: "up", value: "12%" },
    comparison: "Compared to (364 last week)",
  },
  {
    icon: Wallet,
    label: "Total Leaves",
    value: "752",
    delta: { direction: "up", value: "18%" },
    comparison: "Compared to (642 last week)",
  },
  {
    icon: ClipboardCheck,
    label: "Attendance ViewEmployeeContents",
    value: "67%",
    delta: { direction: "down", value: "10%" },
    comparison: "Compared to (36% last week)",
  },
  {
    icon: Briefcase,
    label: "Job Applicants",
    value: "23K",
    delta: { direction: "up", value: "15%" },
    comparison: "Compared to (9K last week)",
  },
];

export const employeeStats: HeaderStat[] = [
  {
    icon: Users,
    label: "Total Employee",
    value: "50",
    delta: { direction: "up", value: "12%" },
    comparison: "Compared to (364 last week)",
  },
  {
    icon: Wallet,
    label: "Active workers",
    value: "91",
    delta: { direction: "up", value: "93%" },
    comparison: "of total workforce",
  },
  {
    icon: ClipboardCheck,
    label: "Departments",
    value: "8",
    delta: { direction: "down", value: "8" },
    comparison: "Active units",
  },
  {
    icon: Briefcase,
    label: "Countries",
    value: "3",
    comparison: "RW, ZW, BF",
  },
];

export const assetStats: HeaderStat[] = [
  {
    icon: Users,
    label: "Total Assets",
    value: "10",
    delta: { direction: "up", value: "12%" },
    comparison: "Compared to (364 last week)",
  },
  {
    icon: Wallet,
    label: "Assigned",
    value: "8",
    delta: { direction: "up", value: "18%" },
    comparison: "Compared to (642 last week)",
  },
  {
    icon: ClipboardCheck,
    label: "Unassigned",
    value: "2",
    delta: { direction: "down", value: "10%" },
    comparison: "Compared to (36% last week)",
  },
  {
    icon: Briefcase,
    label: "Assets Value",
    value: "$ 123,500",
    delta: { direction: "up", value: "15%" },
    comparison: "Compared to (9K last week)",
  },
];

export const HelpDeskStats: HeaderStat[] = [
  {
    icon: Users,
    label: "Open Tickets",
    value: "23",
    delta: { direction: "up", value: "5" },
    comparison: "new today",
  },
  {
    icon: Wallet,
    label: "Assigned",
    value: "8",
    delta: { direction: "up", value: "-0.5h" },
    comparison: "from last week",
  },
  {
    icon: ClipboardCheck,
    label: "Resolution Rate",
    value: "94%",
    comparison: "This Month",
  },
  {
    icon: Briefcase,
    label: "Customer Satisfaction",
    value: "4.6",
    delta: { direction: "up", value: "" },
    comparison: "Out of 5.0 rating",
  },
];

export const PerformanceStats: HeaderStat[] = [
  {
    icon: Star,
    label: "Average Rating",
    value: "4.2",
    delta: { direction: "up", value: "0.3" },
    comparison: "From last quarter",
  },
  {
    icon: Target,
    label: "Goal Completion",
    value: "85%",
    comparison: "Q4 2024 average",
  },
  {
    icon: CheckCircle,
    label: "Reviews Completed",
    value: "68",
    comparison: "15 pending reviews",
  },
  {
    icon: Trophy,
    label: "High Performers",
    value: "23",
    comparison: "Rating 4.5+ employees",
  },
];

export const PerformanceStats: HeaderStat[] = [
  {
    icon: Star,
    label: "Average Rating",
    value: "4.2",
    delta: { direction: "up", value: "0.3" },
    comparison: "From last quarter",
  },
  {
    icon: Target,
    label: "Goal Completion",
    value: "85%",
    comparison: "Q4 2024 average",
  },
  {
    icon: CheckCircle,
    label: "Reviews Completed",
    value: "68",
    comparison: "15 pending reviews",
  },
  {
    icon: Trophy,
    label: "High Performers",
    value: "23",
    comparison: "Rating 4.5+ employees",
  },
];

export const DocumentStats: HeaderStat[] = [
  {
    icon: Clock,
    label: "Total Documents",
    value: "6",
    comparison: "Awaiting Approval",
  },
  {
    icon: CircleCheckBig,
    label: "Categories",
    value: "5",
    comparison: "Document categories",
  },
  {
    icon: Calendar,
    label: "Downloads",
    value: "14",
    comparison: "Total Downloads",
  },
  {
    icon: FileCog,
    label: "Onboarding Templates",
    value: "7",
    comparison: "Active Templates",
  },
];
