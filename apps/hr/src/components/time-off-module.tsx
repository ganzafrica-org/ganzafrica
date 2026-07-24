import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Check, X, FileText, Plus } from "lucide-react";

const timeOffRequests = [
  {
    id: 1,
    employee: "Bagus Fikri",
    type: "Public Holiday",
    start: "26 Dec 2023",
    end: "27 Dec 2023",
    reason: "To participate in family gathering...",
    attachment: "Public Holiday-Lea...",
    status: "Pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bagus",
  },
  {
    id: 2,
    employee: "Ihdizein",
    type: "Sick Leave",
    start: "18 Sep 2023",
    end: "20 Sep 2023",
    reason: "Dealing with migraine attacks ch...",
    attachment: "Sick-Leave.pdf",
    status: "Pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ihdizein",
  },
  {
    id: 3,
    employee: "Mufti Hidayat",
    type: "Maternity Leave",
    start: "17 Sep 2023",
    end: "21 Sep 2023",
    reason: "To prepare for childbirth and ens...",
    attachment: "Maternity-Leave.pdf",
    status: "Pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mufti",
  },
  {
    id: 4,
    employee: "Fauzan Ardiansyah",
    type: "Annual Leave",
    start: "25 Aug 2023",
    end: "29 Aug 2023",
    reason: "To take a planned vacation and t...",
    attachment: "Annual-Leave.pdf",
    status: "Rejected",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fauzan",
  },
  {
    id: 5,
    employee: "Raihan Fikri",
    type: "Annual Leave",
    start: "25 Aug 2023",
    end: "29 Aug 2023",
    reason: "To prioritize personal health and...",
    attachment: "Annual-Leave.pdf",
    status: "Approved",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raihan",
  },
];

export function TimeOffModule() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Time Off Request{" "}
          <span className="bg-slate-200 text-slate-600 text-sm px-2 py-0.5 rounded-full ml-2">
            551
          </span>
        </h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Time Off Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Approval Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">Requested</p>
                <p className="text-2xl font-bold">265</p>
                <p className="text-[10px] text-emerald-500">+12 vs yesterday</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-slate-800">3</p>
                <p className="text-[10px] text-red-500">-6 vs yesterday</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Rejected</p>
                <p className="text-2xl font-bold text-slate-800">4</p>
                <p className="text-[10px] text-red-500">-2 vs yesterday</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-800">18</p>
                <p className="text-[10px] text-red-500">-6 vs yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Time Off Request Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Public Holiday", value: 80, count: 21 },
              { label: "Sick Leave", value: 60, count: 30 },
              { label: "Maternity Leave", value: 40, count: 12 },
              { label: "Annual Leave", value: 10, count: 0 },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium uppercase tracking-tight text-slate-500">
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search Time Off Request"
              className="pl-10 h-9 bg-slate-50 border-none focus-visible:ring-1"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            Month Period
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            All Status
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              General Setting
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 text-xs">
              Approve all
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                Employee
              </TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                Time Off Type
              </TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                Start Date & End Date
              </TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                Reason
              </TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                Attachment
              </TableHead>
              <TableHead className="text-right text-[10px] uppercase font-bold tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeOffRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={req.avatar} />
                      <AvatarFallback>{req.employee[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{req.employee}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">{req.type}</TableCell>
                <TableCell className="text-sm text-slate-500">
                  {req.start} to {req.end}
                </TableCell>
                <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">
                  {req.reason}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                    <FileText className="w-3 h-3" /> {req.attachment}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {req.status === "Pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-3"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </Button>
                    </div>
                  ) : (
                    <Badge
                      className={
                        req.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }
                    >
                      {req.status}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
