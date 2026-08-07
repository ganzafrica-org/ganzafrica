"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePolicy, useUpdatePolicy } from "@/hooks/usePolicies";
import type { Policy } from "@/types/api";

const POLICY_CATEGORIES = ["GENERAL", "HR", "IT", "FINANCE", "COMPLIANCE", "OTHER"] as const;

interface PolicyFormSheetProps {
  policy: Policy | null;
  onDone: () => void;
}

export function PolicyFormSheet({ policy, onDone }: PolicyFormSheetProps) {
  const isEditing = !!policy;
  const createPolicy = useCreatePolicy();
  const updatePolicy = useUpdatePolicy();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(policy?.title ?? "");
  const [content, setContent] = useState(policy?.content ?? "");
  const [category, setCategory] = useState(policy?.category ?? "General");
  const [policyCategory, setPolicyCategory] = useState(policy?.policyCategory ?? "GENERAL");
  const [version, setVersion] = useState(policy?.version ?? "1");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(policy?.title ?? "");
    setContent(policy?.content ?? "");
    setCategory(policy?.category ?? "General");
    setPolicyCategory(policy?.policyCategory ?? "GENERAL");
    setVersion(policy?.version ?? "1");
    setFile(null);
  }, [policy]);

  const isSaving = createPolicy.isPending || updatePolicy.isPending;

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim() || !version.trim()) {
      setError("Title and version are required.");
      return;
    }
    if (!isEditing && !file) {
      setError("A file is required for a new policy.");
      return;
    }

    try {
      if (isEditing && policy) {
        await updatePolicy.mutateAsync({
          id: policy.id,
          payload: { title, content, category, policyCategory, version },
          file,
        });
      } else {
        await createPolicy.mutateAsync({
          payload: { title, content, category, policyCategory, version, status: "DRAFT" },
          file: file as File,
        });
      }
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save policy.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Code of Conduct"
            className="border-slate-200 focus:border-blue-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Content
          </Label>
          <Textarea
            id="content"
            value={content ?? ""}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Policy body text..."
            className="border-slate-200 focus:border-blue-400"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Policy Category</Label>
            <Select value={policyCategory} onValueChange={setPolicyCategory}>
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POLICY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category label
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-slate-200 focus:border-blue-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="version" className="text-sm font-medium">
            Version *
          </Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="border-slate-200 focus:border-blue-400 max-w-[120px]"
          />
          {isEditing && (
            <p className="text-xs text-slate-500">
              The version bumps automatically when this draft is published.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Attached file {isEditing ? "(leave blank to keep the current file)" : "*"}
          </Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100/60 transition-colors"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                <FileText className="h-5 w-5 text-blue-500" />
                {file.name}
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <span className="text-sm text-blue-600 font-medium">Click to upload</span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="flex w-full gap-3 p-6 border-t border-slate-200">
        <Button variant="outline" className="flex-1" onClick={onDone} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 bg-black hover:bg-gray-900 text-white"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Policy Draft"}
        </Button>
      </div>
    </div>
  );
}
