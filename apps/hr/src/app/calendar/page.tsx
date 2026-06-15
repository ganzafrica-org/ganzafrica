'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";

const events = [
  { id: 1, title: "Meeting with the IT team...", time: "08:00 - 10:00", type: "On-site", date: new Date(2025, 0, 2), color: "bg-green-500" },
  { id: 2, title: "Flagship review...", time: "09:00 - 11:00", type: "On-site", date: new Date(2025, 0, 2), color: "bg-cyan-400" },
  { id: 3, title: "Thierry meeting...", time: "08:00 - 10:00", type: "Online", date: new Date(2025, 0, 7), color: "bg-emerald-400" },
  { id: 4, title: "Beneficials meeting...", time: "08:00 - 09:00", type: "On-site", date: new Date(2025, 0, 10), color: "bg-green-300" },
  { id: 5, title: "Uzuli presentation review", time: "08:00 - 10:00", type: "On-site", date: new Date(2025, 0, 10), color: "bg-purple-300" },
  { id: 6, title: "Submition of P&Q Ltd reports", time: "09:00 - 10:00", type: "Home office", date: new Date(2025, 0, 16), color: "bg-sky-300" },
  { id: 7, title: "Skillbuilder checkup with Doris", time: "08:00 - 10:00", type: "On-site", date: new Date(2025, 0, 22), color: "bg-amber-300" },
  { id: 8, title: "Remarks on GA...", time: "08:00 - 10:00", type: "On-site", date: new Date(2025, 0, 25), color: "bg-orange-300" },
];

const Page = () => {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 0, 9));

  return (
    <div className="w-full min-h-screen mt-5">
      <div className="flex gap-4 h-[calc(100vh-12rem)] dark:text-white">
      <div className="w-80 space-y-6 flex flex-col">
        <Button className="w-full bg-green-50 text-brand-accent hover:bg-green-100 border border-green-200 font-bold h-12 dark:bg-green-950/40 dark:text-green-200 dark:hover:bg-green-950/60 dark:border-green-900/60">
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </Button>
        
        <Card className="border-slate-200 shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-950 rounded-lg">
           <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
              />
           </CardContent>
        </Card>

        <div className="space-y-4 flex-1 overflow-auto dark:bg-slate-950">
           <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between dark:text-slate-300">
                 My Calendar <Plus className="w-3 h-3 cursor-pointer" />
              </h3>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer group">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-3 h-3 rounded-full border-2", i % 2 === 0 ? "bg-purple-400 border-purple-100" : "bg-green-400 border-green-100")} />
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Master Schedule</span>
                  </div>
                  <Users className="w-3 h-3 text-slate-300 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-200" />
                </div>
              ))}
           </div>
        </div>
      </div>

      <Card className="w-[50%] flex-1 border-slate-200 shadow-sm flex flex-col overflow-hidden dark:border-slate-800 dark:bg-slate-950 rounded-lg">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
               </div>
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">January 9, 2025</h3>
            </div>
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1 dark:bg-slate-800">
               <Button variant="ghost" size="sm" className="text-xs px-4 h-7">List view</Button>
               <Button variant="secondary" size="sm" className="text-xs px-4 h-7 bg-white shadow-sm font-bold dark:bg-slate-900 dark:shadow-none">Month</Button>
               <Button variant="ghost" size="sm" className="text-xs px-4 h-7">Week</Button>
               <Button variant="ghost" size="sm" className="text-xs px-4 h-7">Day</Button>
            </div>
         </div>

        <div className="flex-1 overflow-auto bg-white p-0 dark:bg-slate-900">
           <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
               {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 border-r border-slate-100 last:border-r-0 dark:text-slate-300 dark:border-slate-800">
                     {day}
                  </div>
               ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 h-full">
               {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - 0; // Adjust for January 2025
                  const isCurrentMonth = dayNum > 0 && dayNum <= 31;
                  const displayDay = isCurrentMonth ? dayNum : (dayNum <= 0 ? 31 + dayNum : dayNum - 31);
                  const cellDate = new Date(2025, 0, displayDay);
                  const cellEvents = events.filter(e => e.date.getDate() === cellDate.getDate() && e.date.getMonth() === cellDate.getMonth());

                  return (
                     <div key={i} className={cn(
                        "min-h-[120px] p-2 border-r border-b border-slate-100 last:border-r-0 relative group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors dark:border-slate-800",
                        !isCurrentMonth && "text-slate-300 dark:text-slate-600"
                     )}>
                        <span className={cn(
                           "text-xs font-bold",
                           displayDay === 9 && isCurrentMonth ? "bg-brand-accent text-white w-6 h-6 flex items-center justify-center rounded-full" : "text-slate-400 dark:text-slate-300"
                        )}>
                           {displayDay.toString().padStart(2, '0')}
                        </span>
                        
                        <div className="mt-2 space-y-1">
                           {cellEvents.map(event => (
                              <div key={event.id} className={cn(
                                 "text-[10px] p-1.5 rounded-lg text-white font-medium truncate shadow-sm cursor-pointer hover:brightness-95",
                                 event.color
                              )}>
                                 <p className="truncate">{event.title}</p>
                                 <p className="opacity-80 text-[8px]">{event.time} • {event.type}</p>
                              </div>
                           ))}
                           {cellEvents.length > 2 && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-300 font-bold text-center mt-1 cursor-pointer hover:text-brand-accent transition-colors">
                                 +{cellEvents.length - 2} more
                              </p>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </Card>
      </div>
    </div>
  );
}

export default Page;