"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2 } from "lucide-react";
import { InstanceTable } from "@/components/processes/instance-table";
import { useProcesses } from "@/hooks/useProcesses";

export default function OnboardingPage() {
  const [status, setStatus] = useState("in_progress");
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useProcesses({
    type: "onboarding",
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Onboarding</h1>
          <p className="text-sm text-muted-foreground">
            Checklists start automatically when an offer is accepted.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/settings/onboarding-templates">
            <Settings2 className="mr-1.5 size-4" /> Templates
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="mb-4 flex justify-end">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <InstanceTable rows={rows} type="onboarding" isLoading={isLoading} isError={isError} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
