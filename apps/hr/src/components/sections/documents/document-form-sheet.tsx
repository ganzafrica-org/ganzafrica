"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
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
import { AccessBuilder } from "@/components/sections/documents/access-builder";
import { useCreateDocument, useUpdateDocument } from "@/hooks/useDocuments";
import {
  DOCUMENT_CATEGORIES,
  type DocumentACL,
  type DocumentCategory,
  type HrDocument,
} from "@/types/api";

interface DocumentFormSheetProps {
  document: HrDocument | null;
  onDone: () => void;
}

const EMPTY_ACL: DocumentACL = {};

export function DocumentFormSheet({ document, onDone }: DocumentFormSheetProps) {
  const isEditing = !!document;
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(document?.document_name ?? "");
  // "Leave Attachment" documents (punch-list #5) aren't created/edited through this generic
  // form — they don't appear in the lists this sheet opens from — so an editable category here is
  // always one of DOCUMENT_CATEGORIES, never that value.
  const [category, setCategory] = useState<DocumentCategory | "">(
    document?.category && document.category !== "Leave Attachment" ? document.category : "",
  );
  const [description, setDescription] = useState(document?.description ?? "");
  const [department, setDepartment] = useState(document?.department ?? "");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">(
    (document?.status as "PUBLISHED" | "DRAFT") ?? "PUBLISHED",
  );
  const [access, setAccess] = useState<DocumentACL>(document?.access ?? EMPTY_ACL);
  const [contractId, setContractId] = useState(document?.contract_id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(document?.document_name ?? "");
    setCategory(
      document?.category && document.category !== "Leave Attachment" ? document.category : "",
    );
    setDescription(document?.description ?? "");
    setDepartment(document?.department ?? "");
    setStatus((document?.status as "PUBLISHED" | "DRAFT") ?? "PUBLISHED");
    setAccess(document?.access ?? EMPTY_ACL);
    setContractId(document?.contract_id ?? "");
    setFile(null);
  }, [document]);

  const isSaving = createDocument.isPending || updateDocument.isPending;

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !category || !description.trim() || !department.trim()) {
      setError("Name, category, description and department are required.");
      return;
    }
    if (category === "Contract Templates" && !contractId.trim()) {
      setError("Contract Templates must specify a linked contractId.");
      return;
    }
    if (!isEditing && !file) {
      setError("A file is required.");
      return;
    }

    try {
      if (isEditing && document) {
        await updateDocument.mutateAsync({
          id: document.id,
          payload: {
            document_name: name,
            category: category as DocumentCategory,
            description,
            department,
            status,
            access,
            contractId: category === "Contract Templates" ? contractId : undefined,
          },
          file,
        });
      } else {
        await createDocument.mutateAsync({
          payload: {
            document_name: name,
            category: category as DocumentCategory,
            description,
            department,
            status,
            access,
            contractId: category === "Contract Templates" ? contractId : undefined,
          },
          file: file as File,
        });
      }
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save document.");
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="docName" className="text-sm font-medium">
              Document Name *
            </Label>
            <Input
              id="docName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Employee Handbook 2024"
              className="border-slate-200 focus:border-blue-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">
              Department *
            </Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Operations"
              className="border-slate-200 focus:border-blue-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document..."
            rows={3}
            className="border-slate-200 focus:border-blue-400"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "PUBLISHED" | "DRAFT")}>
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {category === "Contract Templates" && (
          <div className="space-y-2">
            <Label htmlFor="contractId" className="text-sm font-medium">
              Linked Contract ID *
            </Label>
            <Input
              id="contractId"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              placeholder="Contract UUID this document is attached to"
              className="border-slate-200 focus:border-blue-400"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Document File {isEditing ? "(leave blank to keep the current file)" : "*"}
          </Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100/60 transition-colors"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                <FileText className="h-5 w-5 text-blue-500" />
                {file.name}
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <div className="text-sm">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Stored privately — never a public URL.</p>
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

        <AccessBuilder value={access} onChange={setAccess} />
      </div>

      <div className="flex w-full gap-3 p-6 border-t border-slate-200">
        <Button
          variant="outline"
          className="flex-1 border-slate-200 text-slate-600 hover:bg-white"
          onClick={onDone}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white shadow-md"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isEditing ? "Save Changes" : "Upload Document"}
        </Button>
      </div>
    </div>
  );
}
