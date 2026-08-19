"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  File,
  Archive as ArchiveIcon,
  Lock,
  MoreVertical,
  Folder,
  TrendingUp,
  FileCog,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { DataTable, ColumnDef } from "@/components/sections/table-component";
import { DocumentFormSheet } from "@/components/sections/documents/document-form-sheet";
import { DocumentDetailSheet } from "@/components/sections/documents/document-detail-sheet";
import { StatsHeader } from "@/components/sections/header";
import { useDocuments, useArchiveDocument } from "@/hooks/useDocuments";
import { usePolicies } from "@/hooks/usePolicies";
import { documentsService } from "@/services/documents.service";
import { policiesService } from "@/services/policies.service";
import { useAuth } from "@/hooks/useAuth";
import { DOCUMENT_CATEGORIES, type HrDocument, type Policy } from "@/types/api";

/** A row from another module (currently just policies) shown in the unified feed read-only —
 *  it isn't an hr_documents row, so document-specific actions (edit/archive/versioned view) are
 *  swapped for a plain download + a link back to the owning module (see `documentColumns`). */
type DocRow = HrDocument & { source: "document" | "policy"; sourceId: string };

function policyToDocRow(p: Policy): DocRow {
  return {
    id: `policy-${p.id}`,
    document_name: p.title ?? p.policy_name ?? p.name ?? "Untitled policy",
    category: "Policies & Procedures",
    version: p.version ?? "1",
    description: p.content ?? "",
    department: "—",
    fileSize: p.fileSize ?? "—",
    downloads: p.downloads ?? 0,
    status: (p.status as HrDocument["status"]) ?? "PUBLISHED",
    access: {},
    contract_id: null,
    modifiedAt: p.modifiedAt ?? p.last_edited ?? new Date().toISOString(),
    createdBy: { id: null, fullName: "" },
    source: "policy",
    sourceId: p.id,
  };
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Contract Templates": File,
  "Policies & Procedures": FileText,
  "Forms & Applications": FileText,
  "Training Materials": ArchiveIcon,
  "Compliance & Legal": Lock,
  "Onboarding Materials": FileText,
};

const CATEGORY_RESTRICTED: Record<string, boolean> = {
  "Contract Templates": true,
  "Compliance & Legal": true,
};

function getStatusBadge(status: string) {
  switch (status) {
    case "PUBLISHED":
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    case "DRAFT":
      return <Badge className="bg-orange-100 text-orange-800">Draft</Badge>;
    case "ARCHIVED":
      return <Badge className="bg-slate-100 text-slate-800">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function DocumentManagementPage() {
  const { roles } = useAuth();
  const canManage = roles.includes("hr") || roles.includes("admin");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<HrDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<HrDocument | null>(null);

  const { data, isLoading, isError } = useDocuments({ limit: 200 });
  const { data: policiesResponse } = usePolicies({ limit: 200 });
  const archiveDocument = useArchiveDocument();

  const policyRows: DocRow[] = (
    Array.isArray(policiesResponse) ? policiesResponse : (policiesResponse?.data ?? [])
  ).map(policyToDocRow);

  const allDocuments: DocRow[] = [
    ...(data?.data ?? []).map((d): DocRow => ({ ...d, source: "document", sourceId: d.id })),
    ...policyRows,
  ];

  const documentColumns: ColumnDef<DocRow>[] = [
    {
      key: "document_name",
      header: "Document",
      sortable: true,
      render: (_, doc) => {
        const Icon = CATEGORY_ICONS[doc.category] ?? File;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded">
              <Icon className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{doc.document_name}</span>
                {CATEGORY_RESTRICTED[doc.category] && <Lock className="h-3 w-3 text-amber-500" />}
              </div>
              <p className="text-xs text-muted-foreground">{doc.fileSize}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (category) => (
        <Badge variant="outline" className="capitalize">
          {category as string}
        </Badge>
      ),
    },
    {
      key: "version",
      header: "Version",
      sortable: true,
      render: (v) => <span className="text-sm font-medium">v{v as string}</span>,
    },
    {
      key: "modifiedAt",
      header: "Modified",
      sortable: true,
      render: (date) => (
        <span className="text-sm">{new Date(date as string).toLocaleDateString()}</span>
      ),
    },
    {
      key: "downloads",
      header: "Downloads",
      sortable: true,
      render: (downloads) => (
        <div className="flex items-center gap-1">
          <Download className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium">{downloads as number}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (status) => getStatusBadge(status as string),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, doc) =>
        doc.source === "policy" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a
                  href={policiesService.downloadUrl(doc.sourceId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </DropdownMenuItem>
              {canManage && (
                <DropdownMenuItem asChild>
                  <a href="/settings/policies">
                    <FileCog className="mr-2 h-4 w-4" />
                    Manage in Policies
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setViewingDocument(doc);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={documentsService.downloadUrl(doc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingDocument(doc);
                      setFormOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    disabled={doc.status === "ARCHIVED"}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Archive "${doc.document_name}"? It will be hidden from lists.`,
                        )
                      ) {
                        archiveDocument.mutate(doc.id);
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ];

  const toggleColumn = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleColumns = useMemo(
    () => documentColumns.filter((col) => !hidden.has(col.key)),
    [hidden, canManage],
  );

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch =
      doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const doc of allDocuments) counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
    return counts;
  }, [allDocuments]);

  const stats = useMemo(
    () => [
      { icon: FileText, label: "Total Documents", value: String(allDocuments.length) },
      { icon: Folder, label: "Categories", value: String(categoryCounts.size) },
      {
        icon: Download,
        label: "Total Downloads",
        value: String(allDocuments.reduce((sum, d) => sum + d.downloads, 0)),
      },
      {
        icon: FileCog,
        label: "Drafts",
        value: String(allDocuments.filter((d) => d.status === "DRAFT").length),
      },
    ],
    [allDocuments, categoryCounts],
  );

  useEffect(() => {
    const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null;
    const onScroll = () => setScrolled((mainEl ? mainEl.scrollTop : window.scrollY) > 10);
    onScroll();
    mainEl?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mainEl?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f6f8fb] dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="space-y-6">
        <StatsHeader
          title="Documents"
          subtitle={canManage ? "Manage GanzAfrica Documents" : "Documents shared with you"}
          scrolled={scrolled}
          stats={stats}
          ClassName="w-full"
        />
        <Tabs defaultValue="documents" className="w-full flex flex-col">
          <TabsList className="h-auto w-fit gap-1 rounded-xl bg-slate-200 p-1.5">
            <TabsTrigger
              value="documents"
              className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <FileText className="size-4 shrink-0" />
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Folder className="size-4 shrink-0" />
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <TrendingUp className="size-4 shrink-0" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <Card className="rounded-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[200px] border-slate-200">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {DOCUMENT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px] border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 h-9 ml-auto">
                          <SlidersHorizontal className="h-4 w-4" />
                          Columns
                          {hidden.size > 0 && (
                            <Badge variant="secondary" className="px-1.5 text-xs">
                              {hidden.size}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {documentColumns.map((col) => (
                          <DropdownMenuCheckboxItem
                            key={col.key}
                            checked={!hidden.has(col.key)}
                            onCheckedChange={() => toggleColumn(col.key)}
                            className="capitalize"
                          >
                            {col.header}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {canManage && (
                    <Button
                      variant="outline"
                      className="bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white h-full py-3"
                      onClick={() => {
                        setEditingDocument(null);
                        setFormOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Document
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {isLoading && <p className="px-2 text-sm text-muted-foreground">Loading documents…</p>}
            {isError && <p className="px-2 text-sm text-red-500">Failed to load documents.</p>}

            {!isLoading && !isError && (
              <DataTable
                columns={visibleColumns}
                data={filteredDocuments}
                onRowClick={(doc) =>
                  doc.source === "policy"
                    ? window.open(policiesService.downloadUrl(doc.sourceId), "_blank")
                    : setViewingDocument(doc)
                }
                searchable={false}
              />
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {DOCUMENT_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category] ?? File;
                return (
                  <Card
                    key={category}
                    className="hover:shadow-md transition-all duration-300 rounded-lg"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-lg bg-slate-100 shadow-sm">
                            <Icon className="h-6 w-6 text-slate-700" />
                          </div>
                          <div>
                            <p className="text-lg font-bold">{category}</p>
                            <p className="text-sm text-slate-600">
                              {categoryCounts.get(category) ?? 0} documents
                            </p>
                          </div>
                        </div>
                        {CATEGORY_RESTRICTED[category] && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-amber-700 text-xs">
                            <Lock className="h-3 w-3" />
                            Restricted
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm rounded-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <p className="text-lg font-bold">Most Downloaded</p>
                  </div>
                  {[...allDocuments]
                    .sort((a, b) => b.downloads - a.downloads)
                    .slice(0, 5)
                    .map((doc, index) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            #{index + 1}
                          </div>
                          <p className="text-sm font-medium">{doc.document_name}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {doc.downloads} downloads
                        </Badge>
                      </div>
                    ))}
                  {allDocuments.length === 0 && (
                    <p className="text-sm text-slate-400">No documents yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm rounded-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ArchiveIcon className="h-5 w-5 text-purple-600" />
                    <p className="text-lg font-bold">Category Distribution</p>
                  </div>
                  {DOCUMENT_CATEGORIES.map((category) => {
                    const count = categoryCounts.get(category) ?? 0;
                    const percentage = allDocuments.length
                      ? (count / allDocuments.length) * 100
                      : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>{category}</span>
                          <span className="font-medium">{count} docs</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <ReusableSheet
          open={formOpen}
          onOpenChange={setFormOpen}
          maxWidth="w-full sm:max-w-2xl"
          title={editingDocument ? "Edit Document" : "Upload New Document"}
        >
          <DocumentFormSheet
            document={editingDocument}
            onDone={() => {
              setFormOpen(false);
              setEditingDocument(null);
            }}
          />
        </ReusableSheet>

        <ReusableSheet
          open={!!viewingDocument}
          onOpenChange={(open) => !open && setViewingDocument(null)}
          maxWidth="w-full sm:max-w-xl"
          title={viewingDocument?.document_name ?? "Document"}
        >
          {viewingDocument && <DocumentDetailSheet document={viewingDocument} />}
        </ReusableSheet>
      </div>
    </div>
  );
}
