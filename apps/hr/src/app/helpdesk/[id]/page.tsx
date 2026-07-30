"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TicketDetail } from "@/components/sections/helpdesk/ticket-detail";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <div className="flex w-full flex-col gap-4">
      <Link
        href="/helpdesk"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900"
      >
        <ArrowLeft className="size-4" /> Back to help desk
      </Link>
      {id ? <TicketDetail ticketId={id} /> : null}
    </div>
  );
}
