"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Inbox, LifeBuoy, Plus } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/sections/helpdesk/ticket-badges";
import { RaiseTicketDialog } from "@/components/sections/helpdesk/raise-ticket-dialog";
import { useMyTickets, useTriageTickets } from "@/hooks/useHelpdesk";
import { useAuth } from "@/hooks/useAuth";
import type { Ticket, TicketCategory, TicketStatus } from "@/services/helpdesk.service";

function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Inbox className="size-8 text-slate-300" />
        <p className="text-sm text-muted-foreground">No tickets here.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Raised</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((t) => (
          <TableRow key={t.id}>
            <TableCell>
              <Link
                href={`/helpdesk/${t.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {t.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{t.category}</TableCell>
            <TableCell>
              <PriorityBadge priority={t.priority} />
            </TableCell>
            <TableCell>
              <StatusBadge status={t.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">{t.createdAt.slice(0, 10)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MyTicketsTab() {
  const { data: tickets = [], isLoading, isError } = useMyTickets();
  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  if (isError) return <p className="py-12 text-center text-red-500">Failed to load.</p>;
  return <TicketTable tickets={tickets} />;
}

function TriageTab() {
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const {
    data: tickets = [],
    isLoading,
    isError,
  } = useTriageTickets({
    status: status === "all" ? undefined : (status as TicketStatus),
    category: category === "all" ? undefined : (category as TicketCategory),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="REOPENED">Reopened</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="FACILITIES">Facilities</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Loading…</p>
      ) : isError ? (
        <p className="py-12 text-center text-red-500">Failed to load.</p>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}

export default function HelpdeskPage() {
  const [raiseOpen, setRaiseOpen] = useState(false);
  const { user } = useAuth();
  const canTriage = user?.role === "HR" || user?.role === "IT";

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <LifeBuoy className="size-6" /> Help desk
          </h1>
          <p className="text-sm text-muted-foreground">
            Raise a request; triage staff pick it up and keep you posted.
          </p>
        </div>
        <Button onClick={() => setRaiseOpen(true)}>
          <Plus className="mr-1.5 size-4" /> Raise ticket
        </Button>
      </div>

      {canTriage ? (
        <Tabs defaultValue="triage" className="w-full">
          <TabsList>
            <TabsTrigger value="triage">Triage queue</TabsTrigger>
            <TabsTrigger value="mine">My tickets</TabsTrigger>
          </TabsList>
          <TabsContent value="triage">
            <Card className="shadow-sm">
              <CardContent className="overflow-x-auto p-6">
                <TriageTab />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mine">
            <Card className="shadow-sm">
              <CardContent className="overflow-x-auto p-6">
                <MyTicketsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="overflow-x-auto p-6">
            <MyTicketsTab />
          </CardContent>
        </Card>
      )}

      <RaiseTicketDialog open={raiseOpen} onOpenChange={setRaiseOpen} />
    </div>
  );
}
