"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import {
  useLeavePolicies,
  useSavePolicy,
  useDeletePolicy,
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
} from "@/hooks/useLeaveBalances";
import type { EmploymentType, LeaveTypeName } from "@/services/leave-balances.service";

const EMPLOYMENT_TYPES: EmploymentType[] = ["fellow", "analyst", "staff", "contractor", "intern"];

const LEAVE_TYPES: LeaveTypeName[] = [
  "ANNUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "OTHER",
];

function PolicyForm() {
  const [employmentType, setEmploymentType] = useState<EmploymentType>("staff");
  const [type, setType] = useState<LeaveTypeName>("ANNUAL");
  const [annualDays, setAnnualDays] = useState("18");
  const [maxCarryOver, setMaxCarryOver] = useState("5");

  const save = useSavePolicy();

  return (
    <div className="grid gap-3 sm:grid-cols-5 sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="policy-employment">Employment type</Label>
        <Select
          value={employmentType}
          onValueChange={(v) => setEmploymentType(v as EmploymentType)}
        >
          <SelectTrigger id="policy-employment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="policy-type">Leave type</Label>
        <Select value={type} onValueChange={(v) => setType(v as LeaveTypeName)}>
          <SelectTrigger id="policy-type">
            <SelectValue />
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

      <div className="space-y-1.5">
        <Label htmlFor="policy-days">Days / year</Label>
        <Input
          id="policy-days"
          type="number"
          min={0}
          value={annualDays}
          onChange={(e) => setAnnualDays(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="policy-carry">Max carry-over</Label>
        <Input
          id="policy-carry"
          type="number"
          min={0}
          value={maxCarryOver}
          onChange={(e) => setMaxCarryOver(e.target.value)}
        />
      </div>

      <Button
        onClick={() =>
          save.mutate({
            employment_type: employmentType,
            type,
            annual_days: Number(annualDays),
            max_carry_over: Number(maxCarryOver),
          })
        }
        disabled={save.isPending}
      >
        <Plus className="mr-1.5 size-4" /> Save
      </Button>
    </div>
  );
}

function HolidayForm() {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const create = useCreateHoliday();

  return (
    <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="holiday-date">Date</Label>
        <Input
          id="holiday-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="holiday-name">Name</Label>
        <Input
          id="holiday-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Liberation Day"
        />
      </div>
      <Button
        onClick={() => {
          create.mutate({ date, name });
          setDate("");
          setName("");
        }}
        disabled={!date || !name || create.isPending}
      >
        <Plus className="mr-1.5 size-4" /> Add holiday
      </Button>
    </div>
  );
}

export default function LeaveSettingsPage() {
  const { data: policies = [], isLoading } = useLeavePolicies();
  const { data: holidays = [] } = useHolidays();
  const deletePolicy = useDeletePolicy();
  const deleteHoliday = useDeleteHoliday();

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Time off settings</h1>
        <p className="text-sm text-muted-foreground">
          Entitlements per employment type, and the holidays excluded from working-day counts.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Leave policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PolicyForm />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employment type</TableHead>
                <TableHead>Leave type</TableHead>
                <TableHead className="text-right">Days / year</TableHead>
                <TableHead className="text-right">Max carry-over</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && policies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No policies yet — employees cannot request balance-tracked leave until one
                    exists.
                  </TableCell>
                </TableRow>
              )}
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="capitalize">{policy.employment_type}</TableCell>
                  <TableCell>{policy.type}</TableCell>
                  <TableCell className="text-right">{Number(policy.annual_days)}</TableCell>
                  <TableCell className="text-right">{Number(policy.max_carry_over)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePolicy.mutate(policy.id)}
                      aria-label="Delete policy"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Public holidays</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <HolidayForm />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No holidays configured.
                  </TableCell>
                </TableRow>
              )}
              {holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>{holiday.date}</TableCell>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHoliday.mutate(holiday.id)}
                      aria-label="Delete holiday"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
