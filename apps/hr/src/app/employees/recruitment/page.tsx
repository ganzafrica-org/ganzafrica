import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, PhoneCall, MessageSquare, ChevronRight, Folder } from "lucide-react";
import { ongoingProcess, jobOpenings } from "@/data/recruitment-data";

const Page = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
           <Briefcase className="w-6 h-6 text-blue-600" /> Recruitment
        </h2>
        <Button variant="link" className="text-orange-500 font-bold gap-1">View All <ChevronRight className="w-4 h-4"/></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="bg-blue-50 border-blue-100">
            <CardContent className="pt-6">
               <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <Briefcase className="w-4 h-4 text-blue-600" />
               </div>
               <p className="text-2xl font-bold text-slate-900">5</p>
               <p className="text-xs text-slate-500 font-medium">Job Opening</p>
            </CardContent>
         </Card>
         <Card className="bg-purple-50 border-purple-100">
            <CardContent className="pt-6">
               <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <Users className="w-4 h-4 text-purple-600" />
               </div>
               <p className="text-2xl font-bold text-slate-900">60</p>
               <p className="text-xs text-slate-500 font-medium">New Candidates</p>
            </CardContent>
         </Card>
         <Card className="bg-orange-50 border-orange-100">
            <CardContent className="pt-6">
               <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <PhoneCall className="w-4 h-4 text-orange-600" />
               </div>
               <p className="text-2xl font-bold text-slate-900">40</p>
               <p className="text-xs text-slate-500 font-medium">Invited for interview</p>
            </CardContent>
         </Card>
         <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="pt-6">
               <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
               </div>
               <p className="text-2xl font-bold text-slate-900">20</p>
               <p className="text-xs text-slate-500 font-medium">Waiting for feedbacks</p>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
               <TableHeader className="bg-slate-50">
                  <TableRow>
                     <TableHead className="text-[10px] uppercase font-bold tracking-wider">Job</TableHead>
                     <TableHead className="text-[10px] uppercase font-bold tracking-wider">Total Candidates</TableHead>
                     <TableHead className="text-[10px] uppercase font-bold tracking-wider text-center">Vacancies</TableHead>
                     <TableHead className="text-[10px] uppercase font-bold tracking-wider">Date Expired</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {jobOpenings.map((job) => (
                     <TableRow key={job.id}>
                        <TableCell className="font-bold text-slate-800">{job.title}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2 text-slate-500 text-sm">
                              <Folder className="w-4 h-4" /> {job.candidates}
                           </div>
                        </TableCell>
                        <TableCell className="text-center text-slate-700 font-medium">{job.vacancies}</TableCell>
                        <TableCell className="text-slate-500 text-sm">{job.expired}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-blue-900 mb-6">Ongoing process</h3>
            <div className="space-y-6">
               {ongoingProcess.map((person) => (
                  <div key={person.id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-slate-100">
                           <AvatarImage src={person.avatar} />
                           <AvatarFallback>{person.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                           <p className="text-sm font-bold text-slate-800">{person.name}</p>
                           <p className="text-xs text-slate-400 font-medium">{person.role}</p>
                        </div>
                     </div>
                     <Badge className={
                        person.status === 'Offer sent' ? 'bg-blue-50 text-blue-500 border-none shadow-none font-bold' :
                        person.status === 'Task Test' ? 'bg-orange-50 text-orange-400 border-none shadow-none font-bold' :
                        'bg-purple-50 text-purple-500 border-none shadow-none font-bold'
                     }>
                        {person.status}
                     </Badge>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

export default Page;