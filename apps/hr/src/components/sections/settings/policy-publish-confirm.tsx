"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishPolicy } from "@/hooks/usePolicies";
import type { Policy } from "@/types/api";

interface PolicyPublishConfirmProps {
  policy: Policy;
  onDone: () => void;
}

export function PolicyPublishConfirm({ policy, onDone }: PolicyPublishConfirmProps) {
  const publishPolicy = usePublishPolicy();

  const handlePublish = async () => {
    await publishPolicy.mutateAsync(policy.id);
    onDone();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Publishing bumps the version</p>
            <p className="text-sm text-amber-800 mt-1">
              Every employee who already acknowledged an earlier version will need to re-acknowledge
              this one. The previous published version is deactivated.
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-700">
          <p>
            Policy: <span className="font-medium">{policy.title}</span>
          </p>
          <p>
            Current version: <span className="font-medium">v{policy.version}</span>
          </p>
        </div>
      </div>
      <div className="flex w-full gap-3 p-6 border-t border-slate-200">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onDone}
          disabled={publishPolicy.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePublish}
          disabled={publishPolicy.isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {publishPolicy.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish policy
        </Button>
      </div>
    </div>
  );
}
