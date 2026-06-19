import { useState, useMemo, ReactNode } from "react";

// shadcn/ui imports
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// lucide-react icons
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & COLUMN DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
    key: string;
    header: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    className?: string;
    render?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    title?: string;
    description?: string;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    onRowClick?: (row: T) => void;
    className?: string;
    showToolbar?: boolean;
    showPagination?: boolean;
    columnsToHide?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SORT ICON
// ─────────────────────────────────────────────────────────────────────────────
function SortIcon({ colKey, sortKey, sortDir }: { colKey: string; sortKey: string | null; sortDir: "asc" | "desc" }) {
    if (sortKey !== colKey)
        return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc"
        ? <ArrowUp   className="ml-1.5 h-3.5 w-3.5 text-primary" />
        : <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TABLE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function DataTable<T extends Record<string, any>>({
                              columns,
                              data,
                              title,
                              description,
                              pageSizeOptions   = [10, 20, 50],
                              defaultPageSize   = 10,
                              searchable        = true,
                              searchPlaceholder = "Search…",
                              onRowClick,
                              className,
                              showToolbar = true,
                              showPagination = true,
                              columnsToHide = [],
                          }: DataTableProps<T>) {
    const [query,    setQuery]    = useState("");
    const [sortKey,  setSortKey]  = useState<string | null>(null);
    const [sortDir,  setSortDir]  = useState<"asc" | "desc">("asc");
    const [page,     setPage]     = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [hidden,   setHidden]   = useState<Set<string>>(() => new Set(columnsToHide));

    const visibleCols = useMemo(() => columns.filter(c => !hidden.has(c.key)), [columns, hidden]);

    // Filter
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter(row =>
            columns.some(col => String(row[col.key] ?? "").toLowerCase().includes(q))
        );
    }, [data, query, columns]);

    // Sort
    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sortKey], bv = b[sortKey];
            const cmp = typeof av === "number" && typeof bv === "number" 
                ? av - bv 
                : String(av ?? "").localeCompare(String(bv ?? ""));
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortKey, sortDir]);

    // Paginate
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage   = Math.min(page, totalPages);
    const pageRows   = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
    const from       = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const to         = Math.min(safePage * pageSize, sorted.length);

    const handleSort = (col: ColumnDef<T>) => {
        if (!col.sortable) return;
        if (sortKey === col.key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(col.key); setSortDir("asc"); }
        setPage(1);
    };

    const toggleColumn = (key: string) =>
        setHidden(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });

    const alignClass = (a?: string) =>
        a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

    return (
        <div className={cn("space-y-4", className)}>
            {/* Title block */}
            {(title || description) && (
                <div>
                    {title       && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
                    {description && <p  className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}

            {/* Toolbar */}
            {showToolbar && (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    {searchable && (
                        <div className="relative max-w-xs w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={query}
                                onChange={e => { setQuery(e.target.value); setPage(1); }}
                                className="pl-8 pr-8 h-9"
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(""); setPage(1); }}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {visibleCols.map(col => (
                                <TableHead
                                    key={col.key}
                                    onClick={() => handleSort(col)}
                                    className={cn(
                                        alignClass(col.align),
                                        col.sortable ? "cursor-pointer select-none hover:bg-muted/50 transition-colors" : "",
                                        "whitespace-nowrap h-11"
                                    )}
                                >
                                    <span className="inline-flex items-center">
                                        {col.header}
                                        {col.sortable && (
                                            <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                                        )}
                                    </span>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {pageRows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleCols.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageRows.map((row, ri) => (
                                <TableRow 
                                    key={row.id ?? ri} 
                                    onClick={() => onRowClick?.(row)}
                                    className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                                >
                                    {visibleCols.map(col => (
                                        <TableCell
                                            key={col.key}
                                            className={cn(alignClass(col.align), col.className)}
                                        >
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : (row[col.key] ?? "—")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer / Pagination */}
            {showPagination && (
            <div className="flex items-center justify-between gap-4 flex-wrap px-2">
                <p className="text-sm text-muted-foreground">
                    {sorted.length === 0
                        ? "No results"
                        : `Showing ${from}–${to} of ${sorted.length} row${sorted.length !== 1 ? "s" : ""}`}
                    {filtered.length !== data.length && (
                        <span className="ml-1 opacity-60">(filtered from {data.length})</span>
                    )}
                </p>

                <div className="flex items-center gap-6">
                    {/* Rows per page */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={val => { setPageSize(Number(val)); setPage(1); }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {pageSizeOptions.map(n => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page number */}
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Page {safePage} of {totalPages}
                    </span>

                    {/* Nav buttons */}
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => setPage(1)} disabled={safePage === 1}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}