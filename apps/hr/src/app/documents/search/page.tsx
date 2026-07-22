"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Archive, Clock, ShieldAlert } from "lucide-react";
import { useDocumentSearch, useRetentionPreview, useSetRetention } from "@/hooks/useDocumentsPlus";

export default function DocumentSearchRetentionPage() {
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data: search, isLoading: searching, isError: searchError } = useDocumentSearch(submitted);
  const {
    data: retention,
    isLoading: loadingRetention,
    isError: retentionError,
  } = useRetentionPreview();

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      {/* Search-in-file */}
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Search className="h-6 w-6 text-[#045F3C]" />
          Search documents
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search by title, description, or text inside the document file.
        </p>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(term);
          }}
        >
          <Input
            placeholder="e.g. annual leave, probation, code of conduct…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Search documents"
          />
          <Button type="submit" className="bg-[#045F3C] hover:bg-[#034d31]">
            Search
          </Button>
        </form>

        <div className="mt-4 space-y-3">
          {searching &&
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}

          {searchError && <p className="text-sm text-red-600">Search failed. Please try again.</p>}

          {!searching && submitted && search && search.total === 0 && (
            <p className="text-sm text-slate-500">No documents matched “{submitted}”.</p>
          )}

          {!searching &&
            search?.results.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-start gap-3 py-4">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-900">{r.document_name}</p>
                      <Badge variant="secondary">{r.category}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{r.description}</p>
                    {r.snippet && (
                      <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-slate-600">
                        …matched in file: {r.snippet}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      {/* Retention */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Archive className="h-5 w-5 text-[#045F3C]" />
              Retention — documents due for archiving
            </CardTitle>
            <CardDescription>
              Documents past their retention date are soft-archived automatically (never deleted).
              Compliance &amp; Legal and Contract Templates are excluded from auto-archiving.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRetention && (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            )}

            {retentionError && (
              <p className="flex items-center gap-2 text-sm text-red-600">
                <ShieldAlert className="h-4 w-4" />
                Could not load retention preview.
              </p>
            )}

            {!loadingRetention && retention && retention.count === 0 && (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                Nothing is due for archiving right now.
              </p>
            )}

            {!loadingRetention && retention?.due.map((d) => <RetentionRow key={d.id} doc={d} />)}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function RetentionRow({
  doc,
}: {
  doc: { id: string; document_name: string; category: string; retain_until: string | null };
}) {
  const setRetention = useSetRetention();
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{doc.document_name}</p>
        <p className="text-xs text-slate-500">
          {doc.category}
          {doc.retain_until && ` · due ${new Date(doc.retain_until).toLocaleDateString()}`}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={setRetention.isPending}
        onClick={() => setRetention.mutate({ id: doc.id, retainUntil: null })}
        title="Clear the retention date so this document is kept indefinitely"
      >
        Keep indefinitely
      </Button>
    </div>
  );
}
