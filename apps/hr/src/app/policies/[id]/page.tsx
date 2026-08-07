"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePolicies, useAcknowledgePolicy } from "@/hooks/usePolicies";
import { policiesService } from "@/services/policies.service";

export default function EmployeePolicyReaderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  // Reuse the annotated (myAcknowledged) list rather than the plain getPolicy fetch, so the
  // acknowledged/required badge here always matches what the list page just showed.
  const { data, isLoading } = usePolicies({ active: true, limit: 200 });
  const acknowledge = useAcknowledgePolicy();

  const policies = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const policy = policies.find((p) => p.id === params.id);

  if (isLoading) {
    return <div className="w-full flex justify-center py-12 text-muted-foreground">Loading…</div>;
  }

  if (!policy) {
    return (
      <div className="w-full flex flex-col items-center py-12 gap-3">
        <p className="text-muted-foreground">Policy not found.</p>
        <Button variant="outline" onClick={() => router.push("/policies")}>
          Back to Policies
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl px-6 py-8 pb-28">
        <button
          onClick={() => router.push("/policies")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Policies
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{policy.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              v{policy.version} · {policy.policyCategory ?? policy.category}
            </p>
          </div>
          {policy.myAcknowledged ? (
            <Badge className="bg-green-100 text-green-800 gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Acknowledged
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800">Required</Badge>
          )}
        </div>

        <Button variant="outline" size="sm" asChild className="mb-6">
          <a
            href={policiesService.downloadUrl(policy.id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            Download attached file
          </a>
        </Button>

        <div className="bg-white rounded-lg border border-gray-200 p-6 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
          {policy.content || "No content provided."}
        </div>
      </div>

      {/* Sticky acknowledge bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] px-6 py-4 flex justify-center">
        <div className="w-full max-w-3xl flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {policy.myAcknowledged
              ? "You've acknowledged this policy."
              : "By clicking below, you confirm you have read and understood this policy."}
          </p>
          <Button
            disabled={policy.myAcknowledged || acknowledge.isPending}
            onClick={() => acknowledge.mutate(policy.id)}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-70"
          >
            {acknowledge.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {policy.myAcknowledged ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Acknowledged
              </>
            ) : (
              "I have read and understood"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
