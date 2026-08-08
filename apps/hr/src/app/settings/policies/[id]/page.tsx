"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { PolicyPublishConfirm } from "@/components/sections/settings/policy-publish-confirm";
import { PolicyAckReport } from "@/components/sections/settings/policy-ack-report";
import { usePolicy } from "@/hooks/usePolicies";
import { policiesService } from "@/services/policies.service";

export default function PolicyDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: policy, isLoading } = usePolicy(params.id);
  const [publishOpen, setPublishOpen] = useState(false);

  if (isLoading) {
    return <div className="w-full flex justify-center py-12 text-muted-foreground">Loading…</div>;
  }

  if (!policy) {
    return (
      <div className="w-full flex flex-col items-center py-12 gap-3">
        <p className="text-muted-foreground">Policy not found.</p>
        <Button variant="outline" onClick={() => router.push("/settings/policies")}>
          Back to Policies
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center">
      <div className="w-[80%] mx-auto py-6">
        <button
          onClick={() => router.push("/settings/policies")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Policies
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{policy.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              v{policy.version} ·{" "}
              <Badge
                className={
                  policy.status === "PUBLISHED"
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }
              >
                {policy.status}
              </Badge>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a
                href={policiesService.downloadUrl(policy.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
            {policy.status === "DRAFT" && (
              <Button onClick={() => setPublishOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 whitespace-pre-wrap text-sm text-gray-700">
          {policy.content || "No content provided."}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold px-6 pt-6">Acknowledgements</h2>
          <PolicyAckReport policy={policy} />
        </div>
      </div>

      <ReusableSheet
        open={publishOpen}
        onOpenChange={setPublishOpen}
        maxWidth="w-full sm:max-w-md"
        title="Publish policy"
      >
        <PolicyPublishConfirm policy={policy} onDone={() => setPublishOpen(false)} />
      </ReusableSheet>
    </div>
  );
}
