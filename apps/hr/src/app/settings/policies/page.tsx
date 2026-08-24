"use client";

import { useMemo, useState } from "react";
import { Search, Plus, MoreVertical, Send, ClipboardList, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { PolicyFormSheet } from "@/components/sections/settings/policy-form-sheet";
import { PolicyPublishConfirm } from "@/components/sections/settings/policy-publish-confirm";
import { PolicyAckReport } from "@/components/sections/settings/policy-ack-report";
import { usePolicies, useDeletePolicy } from "@/hooks/usePolicies";
import type { Policy } from "@/types/api";

function getStatusBadge(policy: Policy) {
  if (policy.status === "PUBLISHED") {
    return (
      <Badge className="bg-green-100 text-green-800 border-0 rounded-full px-3 py-1">
        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2" />
        Published {policy.isActive === false ? "(superseded)" : ""}
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-100 text-orange-800 border-0 rounded-full px-3 py-1">Draft</Badge>
  );
}

export default function PoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [publishingPolicy, setPublishingPolicy] = useState<Policy | null>(null);
  const [ackReportPolicy, setAckReportPolicy] = useState<Policy | null>(null);

  const { data: policiesResponse, isLoading, isError } = usePolicies({ limit: 200 });
  const deletePolicy = useDeletePolicy();

  const policyList: Policy[] = Array.isArray(policiesResponse)
    ? policiesResponse
    : Array.isArray(policiesResponse?.data)
      ? policiesResponse.data
      : [];

  const filteredPolicies = useMemo(
    () =>
      policyList.filter((policy) => {
        const title = (policy.title ?? policy.name ?? "").toLowerCase();
        const query = searchTerm.toLowerCase();
        return !query || title.includes(query);
      }),
    [policyList, searchTerm],
  );

  return (
    <div className="flex flex-col justify-center items-center w-full bg-background min-h-screen">
      <div className="px-6 py-6 flex flex-col w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Policies</h1>
            <p className="text-sm text-muted-foreground">
              Publish policies and track acknowledgements.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPolicy(null);
              setFormOpen(true);
            }}
            className="bg-black hover:bg-gray-900 text-white rounded-md px-4 py-2 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add new
          </Button>
        </div>

        <div className="mb-4 relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search policies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Total {filteredPolicies.length} items
        </div>
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading...
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center py-12 text-red-500">
            Failed to load policies.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                    Downloads
                  </th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map((policy) => (
                  <tr
                    key={policy.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setAckReportPolicy(policy)}
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-blue-600 hover:underline">
                        {policy.title ?? policy.name}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {policy.policyCategory ?? policy.category ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      v{policy.version ?? "—"}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(policy)}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {policy.downloads ?? 0}
                    </td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingPolicy(policy);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {policy.status === "DRAFT" && (
                            <DropdownMenuItem onClick={() => setPublishingPolicy(policy)}>
                              <Send className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setAckReportPolicy(policy)}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Acknowledgements
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (window.confirm(`Delete "${policy.title}"?`)) {
                                deletePolicy.mutate(policy.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredPolicies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No policies yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReusableSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        maxWidth="w-full sm:max-w-2xl"
        title={editingPolicy ? "Edit Policy" : "New Policy Draft"}
      >
        <PolicyFormSheet
          policy={editingPolicy}
          onDone={() => {
            setFormOpen(false);
            setEditingPolicy(null);
          }}
        />
      </ReusableSheet>

      <ReusableSheet
        open={!!publishingPolicy}
        onOpenChange={(open) => !open && setPublishingPolicy(null)}
        maxWidth="w-full sm:max-w-md"
        title="Publish policy"
      >
        {publishingPolicy && (
          <PolicyPublishConfirm
            policy={publishingPolicy}
            onDone={() => setPublishingPolicy(null)}
          />
        )}
      </ReusableSheet>

      <ReusableSheet
        open={!!ackReportPolicy}
        onOpenChange={(open) => !open && setAckReportPolicy(null)}
        maxWidth="w-full sm:max-w-lg"
        title={ackReportPolicy ? `${ackReportPolicy.title} — Acknowledgements` : "Acknowledgements"}
      >
        {ackReportPolicy && <PolicyAckReport policy={ackReportPolicy} />}
      </ReusableSheet>
    </div>
  );
}
