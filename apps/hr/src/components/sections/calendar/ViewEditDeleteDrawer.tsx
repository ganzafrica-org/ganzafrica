"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Calendar, Clock, FileText, User, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { LeaveRequest, PublicHoliday, LeaveType, LeaveStatus } from "@/types/leave";
import { useLeaveContext } from "./LeaveContext";
import { formatDate, getDaysBetween } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";

type DrawerMode = "VIEW" | "EDIT" | "DELETE";

interface ViewEditDeleteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: LeaveRequest | PublicHoliday | null;
  type: "LEAVE" | "HOLIDAY";
}

export function ViewEditDeleteDrawer({ isOpen, onClose, item, type }: ViewEditDeleteDrawerProps) {
  const [mode, setMode] = useState<DrawerMode>("VIEW");
  const {
    updateLeaveRequest,
    deleteLeaveRequest,
    updatePublicHoliday,
    deletePublicHoliday,
    getTeamMemberById,
  } = useLeaveContext();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && item) {
      setMode("VIEW");
      setFormData({ ...item });
    }
  }, [isOpen, item]);

  if (!item) return null;

  const isHoliday = type === "HOLIDAY";
  const holidayItem = item as PublicHoliday;
  const leaveItem = item as LeaveRequest;
  const employee = !isHoliday ? getTeamMemberById(leaveItem.employeeId) : null;

  const handleSave = () => {
    if (isHoliday) {
      updatePublicHoliday(formData as PublicHoliday);
    } else {
      updateLeaveRequest(formData as LeaveRequest);
    }
    setMode("VIEW");
  };

  const handleDelete = () => {
    if (isHoliday) {
      deletePublicHoliday(item.id);
    } else {
      deleteLeaveRequest(item.id);
    }
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const duration = getDaysBetween(
    new Date(formData?.startDate || item.startDate),
    new Date(formData?.endDate || item.endDate),
  );

  const LEAVE_TYPES: LeaveType[] = [
    "Annual Leave",
    "Sick Leave",
    "Casual",
    "Emergency",
    "Paid",
    "Study Leave",
    "Maternity Leave",
  ];
  const STATUSES: LeaveStatus[] = ["Pending", "Approved", "Rejected", "Used"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full bg-white shadow-2xl z-[101] w-full max-w-md flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h2 id="drawer-title" className="text-xl font-bold text-gray-900">
                {mode === "VIEW"
                  ? isHoliday
                    ? "Holiday Details"
                    : "Leave Request"
                  : mode === "EDIT"
                    ? "Edit Details"
                    : "Confirm Delete"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {mode === "VIEW" && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${isHoliday ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {isHoliday ? <Calendar size={24} /> : <User size={24} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {isHoliday ? holidayItem.name : employee?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isHoliday
                          ? "Public Holiday"
                          : `${employee?.department} · ${leaveItem.leaveType}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Type
                      </p>
                      <Badge
                        variant="secondary"
                        className={
                          isHoliday ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                        }
                      >
                        {isHoliday ? "Public Holiday" : leaveItem.leaveType}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "Approved" || item.status === "Used"
                            ? "border-green-200 text-green-700 bg-green-50"
                            : item.status === "Pending"
                              ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                              : "border-red-200 text-red-700 bg-red-50"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date Range
                    </p>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={16} className="text-gray-400" />
                      <span>
                        {formatDate(new Date(item.startDate))} -{" "}
                        {formatDate(new Date(item.endDate))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Duration
                    </p>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={16} className="text-gray-400" />
                      <span>
                        {duration} {duration === 1 ? "day" : "days"}
                      </span>
                    </div>
                  </div>

                  {!isHoliday && leaveItem.notes && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Reason/Notes
                      </p>
                      <div className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                        <FileText size={16} className="text-gray-400 mt-1 shrink-0" />
                        <span>{leaveItem.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === "EDIT" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Title / Name</label>
                    <Input
                      value={isHoliday ? formData.name : employee?.name}
                      disabled={!isHoliday}
                      onChange={(e) => isHoliday && handleChange("name", e.target.value)}
                    />
                  </div>

                  {!isHoliday && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Leave Type</label>
                      <Select
                        value={formData.leaveType}
                        onValueChange={(v) => handleChange("leaveType", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAVE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Start Date</label>
                      <Input
                        type="date"
                        value={new Date(formData.startDate).toISOString().split("T")[0]}
                        onChange={(e) => handleChange("startDate", new Date(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">End Date</label>
                      <Input
                        type="date"
                        value={new Date(formData.endDate).toISOString().split("T")[0]}
                        onChange={(e) => handleChange("endDate", new Date(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => handleChange("status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {isHoliday
                          ? ["Used", "Upcoming"].map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))
                          : STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!isHoliday && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Notes</label>
                      <Textarea
                        value={formData.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        placeholder="Add some notes..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              )}

              {mode === "DELETE" && (
                <div className="space-y-6 text-center py-8">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
                    <p className="text-gray-500">
                      Do you really want to delete this {isHoliday ? "holiday" : "leave request"}?
                      <br />
                      This action cannot be undone.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {isHoliday ? holidayItem.name : employee?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(new Date(item.startDate))} - {formatDate(new Date(item.endDate))}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t bg-gray-50 shrink-0">
              {mode === "VIEW" && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setMode("EDIT")}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setMode("DELETE")}
                  >
                    Delete
                  </Button>
                </div>
              )}
              {mode === "EDIT" && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setMode("VIEW")}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
              {mode === "DELETE" && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setMode("VIEW")}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                    Yes, Delete
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
