"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Search,
    Plus,
    FileText,
    MoreVertical,
    Calendar as CalendarIcon,
    Download
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { mockDocuments, mockDocumentRevisions } from "@/data/employee-data";

import { DataTable, ColumnDef } from "@/components/sections/table-component"
import { ReusableSheet } from "@/components/sections/sheets/sheet-component"
import { DocumentSheet } from "@/components/sections/sheets/document-sheet"

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Active':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
        case 'Expired':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
        case 'Pending':
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

export default function DocumentsPage() {
    const [date, setDate] = useState<Date>()
    const [selectedDoc, setSelectedDoc] = useState<any>(null)
    const [showSheet, setShowSheet] = useState(false)

    const columns: ColumnDef<any>[] = [
        {
            key: "name",
            header: "Document Name",
            sortable: true,
            render: (name) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-dark" />
                    {name}
                </div>
            )
        },
        {
            key: "employee",
            header: "Employee",
            sortable: true
        },
        {
            key: "category",
            header: "Category",
            sortable: true
        },
        {
            key: "uploadDate",
            header: "Upload Date",
            sortable: true
        },
        {
            key: "expiryDate",
            header: "Expiry Date",
            sortable: true
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (status) => getStatusBadge(status)
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (_, doc) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedDoc(doc); setShowSheet(true); }}>View</DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    return (
        <div className="min-h-screen p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-big font-bold text-slate-900 dark:text-white">Employee Documents</h1>
                    <Button className="bg-brand-accent hover:bg-emerald-600 text-brand-dark font-bold">
                        <Plus className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                </div>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex flex-wrap gap-3 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search documents..." className="pl-10 border-slate-200" />
                                </div>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[180px] border-slate-200">
                                        <SelectValue placeholder="All Employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Employees</SelectItem>
                                        <SelectItem value="jb">Jean Baptiste</SelectItem>
                                        <SelectItem value="mc">Marie Claire</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[180px] border-slate-200">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="legal">Legal</SelectItem>
                                        <SelectItem value="performance">Performance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal border-slate-200",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <DataTable
                    columns={columns}
                    data={mockDocuments}
                    onRowClick={(doc) => {
                        setSelectedDoc(doc)
                        setShowSheet(true)
                    }}
                    showToolbar={false}
                    className="border-0 shadow-sm overflow-hidden"
                />

                {showSheet && selectedDoc && (
                    <ReusableSheet
                        open={showSheet}
                        onOpenChange={setShowSheet}
                        title="Revision History"
                        description={selectedDoc.name}
                        maxWidth="w-full sm:max-w-4xl"
                        footer={
                            <div className="flex w-full gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowSheet(false)}>
                                    Close
                                </Button>
                                <Button className="flex-1 bg-brand-accent hover:bg-emerald-600 text-brand-dark font-bold">
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </div>
                        }
                    >
                        <DocumentSheet
                            documentName={selectedDoc.name}
                            revisions={mockDocumentRevisions[selectedDoc.id] ?? []}
                        />
                    </ReusableSheet>
                )}
            </div>
        </div>
    )
}
