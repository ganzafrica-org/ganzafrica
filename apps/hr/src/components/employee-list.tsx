import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter, MoreVertical, ExternalLink } from "lucide-react";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

const employees = [
  {
    id: 1,
    name: "Santi Cazorla",
    email: "hello@santi.com",
    role: "Software Engineer",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Santi",
    tickets: 16,
    overdue: 4,
    responseTime: "25:00",
    totalTime: "1:32:08",
    location: "United Kingdom, Europe",
    timezone: "UTC+07:00",
    language: "English, Italian",
  },
  {
    id: 2,
    name: "Arlene McCoy",
    email: "arlenemccoy@mail.com",
    role: "Product Manager",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arlene",
  },
  {
    id: 3,
    name: "Jerome Bell",
    email: "jeromebell@mail.com",
    role: "Designer",
    status: "On Leave",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jerome",
  },
  {
    id: 4,
    name: "Cody Fisher",
    email: "codyfisher@mail.com",
    role: "QA Engineer",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cody",
  },
  {
    id: 5,
    name: "Leslie Alexander",
    email: "leslie@mail.com",
    role: "HR Specialist",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leslie",
  },
  {
    id: 6,
    name: "Robert Fox",
    email: "robertfox@mail.com",
    role: "Sales Executive",
    status: "Inactive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
  },
  {
    id: 7,
    name: "Esther Howard",
    email: "esther@mail.com",
    role: "Support Lead",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Esther",
  },
];

export function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Employees{" "}
          <span className="text-slate-400 font-normal text-lg ml-2">{employees.length} Total</span>
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" /> Date Created
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search employees..."
            className="pl-10 border-none shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-6 w-px bg-slate-200 mx-2" />
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-4">
          Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[40px]">
                <Input type="checkbox" className="w-4 h-4" />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees
              .filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((employee) => (
                <TableRow
                  key={employee.id}
                  className="cursor-pointer hover:bg-slate-50 group"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <TableCell>
                    <Input
                      type="checkbox"
                      className="w-4 h-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-slate-100">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{employee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{employee.email}</TableCell>
                  <TableCell className="text-slate-500">{employee.role || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.status === "Active" ? "default" : "secondary"}
                      className={
                        employee.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50"
                          : "bg-orange-50 text-orange-700 border-orange-100"
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <ReusableSheet
        open={!!selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
        maxWidth="sm:max-w-[600px]"
      >
        {selectedEmployee && (
          <ScrollArea className="h-full">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400 uppercase tracking-wider font-semibold">
                  Employee Preview <span className="ml-2 lowercase font-normal">4 of 342</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-blue-600 border-blue-200"
                  >
                    View Full Details <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 border-4 border-slate-50 shadow-sm">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback>{selectedEmployee.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-slate-900">{selectedEmployee.name}</h3>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">
                      ● Active
                    </Badge>
                  </div>
                  <p className="text-slate-500 flex items-center gap-2">
                    <span className="text-emerald-500">Microsoft</span> • Joined 5 days ago
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 py-6 border-y border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                    Tickets
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {selectedEmployee.tickets || 16}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                    Overdue Ticket
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {selectedEmployee.overdue || 4}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                    Avg. Response Time
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-slate-800">
                      {selectedEmployee.responseTime || "25:00"}
                    </p>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-1 rounded">
                      2% Faster
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                    Total Response Time
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {selectedEmployee.totalTime || "1:32:08"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Employee Details
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Source</p>
                    <p className="text-sm font-medium text-slate-700">Contact us form</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Response Time</p>
                    <Badge className="bg-red-50 text-red-600 border-red-100 font-normal">
                      ● Slow response
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Phone Number</p>
                    <p className="text-sm font-medium text-blue-600">(209) 555-0104</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      Microsoft
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-medium text-blue-600">{selectedEmployee.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Description</p>
                    <p className="text-sm font-medium text-slate-300">Add Description</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Activity
                  </h4>
                  <Button variant="ghost" size="sm" className="text-blue-600 text-xs font-bold">
                    View More Activity
                  </Button>
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          <span className="font-bold text-slate-900">{selectedEmployee.name}</span>{" "}
                          was added to contacts
                        </p>
                        <p className="text-xs text-slate-400 mt-1">11:12 AM - May 17, 2023</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </ReusableSheet>
    </div>
  );
}
