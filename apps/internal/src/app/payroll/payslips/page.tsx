"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  RefreshCw,
  Plus,
  Mail,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Payroll {
  id: number;
  name: string;
  email: string;
  payroll_period: string;
  date_of_payment: string;
  basic_salary: string;
  net_salary: string;
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  payslip_file_url?: string;
  payslip_file_key?: string;
}

export default function PayslipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL params
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sendingBulkEmails, setSendingBulkEmails] = useState(false);

  // Filters and pagination from URL
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const period = searchParams.get("period") || "";
  const emailSent = searchParams.get("email_sent") || "";

  // Initialize URL params on first load
  useEffect(() => {
    if (!searchParams.has("page") || !searchParams.has("limit")) {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("page")) params.set("page", "1");
      if (!params.has("limit")) params.set("limit", "20");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, []);

  // Update URL params
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`);
  };

  // Fetch payrolls
  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(period && { payroll_period: period }),
        ...(emailSent && { email_sent: emailSent }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payroll?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch payrolls");

      const data = await response.json();
      setPayrolls(data.data.map((item: any) => item.payroll));
      setTotalPages(data.pagination.total_pages);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      toast.error("Failed to load payrolls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [page, limit, search, period, emailSent]);

  const handleRefresh = () => {
    fetchPayrolls();
    toast.success("Refreshed");
  };

  const handleSearch = (value: string) => {
    updateParams({ search: value, page: "1" });
  };

  const handlePeriodFilter = (value: string) => {
    updateParams({ period: value, page: "1" });
  };

  const handleEmailSentFilter = (value: string) => {
    updateParams({ email_sent: value, page: "1" });
  };

  const handleLimitChange = (value: string) => {
    updateParams({ limit: value, page: "1" });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadCSV = async () => {
    if (!uploadFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payroll/upload-csv`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setUploadResult(result);
      toast.success(`Processed ${result.summary.total_rows} rows`);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Failed to upload CSV");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!uploadResult?.valid_records) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ payrolls: uploadResult.valid_records }),
        },
      );

      if (!response.ok) throw new Error("Failed to create payrolls");

      toast.success(
        `Created ${uploadResult.valid_records.length} payroll records`,
      );
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadResult(null);
      fetchPayrolls();
    } catch (error) {
      console.error("Error creating payrolls:", error);
      toast.error("Failed to create payrolls");
    }
  };

  const handleSendEmail = async (payrollId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payroll/send-emails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ payroll_ids: [payrollId] }),
        },
      );

      if (!response.ok) throw new Error("Failed to send email");

      toast.success("Email sending initiated");
      setTimeout(() => fetchPayrolls(), 2000);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    }
  };

  const handleBulkSendEmails = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one payroll");
      return;
    }

    try {
      setSendingBulkEmails(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payroll/send-emails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ payroll_ids: selectedIds }),
        },
      );

      if (!response.ok) throw new Error("Failed to send emails");

      toast.success(
        `Email sending initiated for ${selectedIds.length} payslips`,
      );
      setSelectedIds([]);
      setTimeout(() => fetchPayrolls(), 2000);
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setSendingBulkEmails(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === payrolls.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(payrolls.filter((p) => !p.email_sent).map((p) => p.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleViewPayslip = async (payrollId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payroll/${payrollId}/signed-url`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to get signed URL");

      const data = await response.json();
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error getting payslip URL:", error);
      toast.error("Failed to open payslip");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payslips</h1>
          <p className="text-gray-600 mt-2">
            Manage and send payslips to employees
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button onClick={handleBulkSendEmails} disabled={sendingBulkEmails}>
              <Mail className="w-4 h-4 mr-2" />
              Send {selectedIds.length} Email{selectedIds.length > 1 ? "s" : ""}
            </Button>
          )}
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <MonthYearPicker
            value={period}
            onChange={handlePeriodFilter}
            placeholder="Select period"
          />

          <Select value={emailSent} onValueChange={handleEmailSentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Email Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Sent</SelectItem>
              <SelectItem value="false">Not Sent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger>
              <SelectValue placeholder="Per Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-sm text-gray-600">
          Showing {payrolls.length} of {totalRecords} payrolls
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 border-b-2 border-gray-200">
            <TableRow>
              <TableHead className="w-12 font-semibold">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length ===
                      payrolls.filter((p) => !p.email_sent).length &&
                    payrolls.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Period</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right font-semibold">
                Basic Salary
              </TableHead>
              <TableHead className="text-right font-semibold">
                Net Salary
              </TableHead>
              <TableHead className="font-semibold">Email Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : payrolls.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  No payrolls found
                </TableCell>
              </TableRow>
            ) : (
              payrolls.map((payroll) => (
                <TableRow
                  key={payroll.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(payroll.id)}
                      onChange={() => handleSelectOne(payroll.id)}
                      disabled={payroll.email_sent}
                      className="w-4 h-4 cursor-pointer disabled:opacity-50"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{payroll.name}</TableCell>
                  <TableCell>{payroll.email}</TableCell>
                  <TableCell>{payroll.payroll_period}</TableCell>
                  <TableCell>{formatDate(payroll.date_of_payment)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payroll.basic_salary)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payroll.net_salary)}
                  </TableCell>
                  <TableCell>
                    {payroll.email_sent ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <XCircle className="w-4 h-4" />
                        Not Sent
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payroll.payslip_file_key && (
                        <button
                          onClick={() => handleViewPayslip(payroll.id)}
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                          title="View payslip"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendEmail(payroll.id)}
                        disabled={payroll.email_sent}
                        className="cursor-pointer"
                        title={
                          payroll.email_sent
                            ? "Email already sent"
                            : "Send payslip email"
                        }
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Payroll CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with payroll data. The system will validate
              emails against the database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading || uploadResult}
              />
            </div>

            {uploadFile && !uploadResult && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{uploadFile.name}</span>
              </div>
            )}

            {uploadResult && (
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded space-y-2">
                  <h4 className="font-semibold">Upload Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Rows</p>
                      <p className="text-lg font-semibold">
                        {uploadResult.summary.total_rows}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Valid</p>
                      <p className="text-lg font-semibold text-green-600">
                        {uploadResult.summary.valid_records}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Invalid</p>
                      <p className="text-lg font-semibold text-red-600">
                        {uploadResult.summary.invalid_records}
                      </p>
                    </div>
                  </div>
                </div>

                {uploadResult.invalid_records?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-800">
                          Invalid Records
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                          The following emails were not found in the database:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {uploadResult.invalid_records
                            .slice(0, 5)
                            .map((record: any, i: number) => (
                              <li key={i} className="text-red-600">
                                {record.email} - {record.name} ({record.error})
                              </li>
                            ))}
                          {uploadResult.invalid_records.length > 5 && (
                            <li className="text-red-600 font-semibold">
                              ... and {uploadResult.invalid_records.length - 5}{" "}
                              more
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {!uploadResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    setUploadFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadCSV}
                  disabled={!uploadFile || uploading}
                >
                  {uploading ? "Processing..." : "Process CSV"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    setUploadFile(null);
                    setUploadResult(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={
                    !uploadResult.valid_records ||
                    uploadResult.valid_records.length === 0
                  }
                >
                  Save {uploadResult.summary.valid_records} Valid Records
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => updateParams({ page: (page - 1).toString() })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: (page + 1).toString() })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
