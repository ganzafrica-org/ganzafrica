import { LeaveCalendar } from "@/components/sections/calendar/LeaveCalendar";
import { LeaveProvider } from "@/components/sections/calendar/LeaveContext";
export const metadata = {
  title: "Leave Calendar",
  description: "Team leave management calendar",
};

export default function LeaveCalendarPage() {
  return (
    <LeaveProvider>
      <LeaveCalendar />
    </LeaveProvider>
  );
}
