"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePolicies } from "@/hooks/usePolicies";

export default function EmployeePoliciesPage() {
  const router = useRouter();
  // "active" -> published + currently-active only (excludes superseded prior versions).
  const { data, isLoading, isError } = usePolicies({ active: true, limit: 100 });

  const policies = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const pending = policies.filter((p) => !p.myAcknowledged);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Company Policies</h1>
        <p className="text-sm text-gray-600 mt-1">
          Read and acknowledge each policy below.{" "}
          {pending.length > 0 && (
            <span className="text-amber-700 font-medium">
              {pending.length} awaiting your acknowledgement.
            </span>
          )}
        </p>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
        {isError && <p className="mt-8 text-sm text-red-500">Failed to load policies.</p>}

        {!isLoading && !isError && (
          <div className="mt-6 space-y-3">
            {policies.length === 0 && (
              <p className="text-sm text-gray-500">No published policies yet.</p>
            )}
            {policies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => router.push(`/policies/${policy.id}`)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                <div>
                  <p className="font-medium text-gray-900">{policy.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    v{policy.version} · {policy.policyCategory ?? policy.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {policy.myAcknowledged ? (
                    <Badge className="bg-green-100 text-green-800 gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Acknowledged
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 gap-1">
                      <FileWarning className="h-3.5 w-3.5" />
                      Required
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
