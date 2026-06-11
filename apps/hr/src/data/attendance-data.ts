export const attendanceData = [
    {
        id: 1,
        employeeId: "GZ001",
        name: "Jean Baptiste Mukamana",
        department: "Human Resources",
        date: "2024-12-10",
        checkIn: "08:15",
        checkOut: "17:30",
        totalHours: "9h 15m",
        status: "present",
        attendanceType: "office",
        location: "Kigali Office",
        project: "HR System Implementation",
        task: "Employee onboarding review",
        managerApproval: true,
        overtime: "1h 15m",
        breaks: "1h 00m",
        leaveStatus: null
    },
    {
        id: 2,
        employeeId: "GZ002",
        name: "Marie Claire Nsengimana",
        department: "Agriculture",
        date: "2024-12-10",
        checkIn: "08:45",
        checkOut: "17:15",
        totalHours: "8h 30m",
        status: "late",
        attendanceType: "field",
        location: "Musanze Field Site",
        project: "Sustainable Farming Initiative",
        task: "Field data collection",
        managerApproval: true,
        overtime: "0h 00m",
        breaks: "1h 00m",
        leaveStatus: null
    },
    {
        id: 3,
        employeeId: "GZ003",
        name: "David Niyonkuru",
        department: "Fellowship Program",
        date: "2024-12-10",
        checkIn: "09:00",
        checkOut: "18:00",
        totalHours: "9h 00m",
        status: "present",
        attendanceType: "training",
        location: "Youth Development Workshop",
        project: "Fellowship Training Program",
        task: "Attend leadership workshop",
        managerApproval: true,
        overtime: "1h 00m",
        breaks: "1h 00m",
        leaveStatus: null
    },
    {
        id: 4,
        employeeId: "GZ004",
        name: "Grace Mukamana",
        department: "Environment",
        date: "2024-12-10",
        checkIn: "-",
        checkOut: "-",
        totalHours: "0h 00m",
        status: "on_leave",
        attendanceType: "leave",
        location: "-",
        project: "Climate Adaptation Project",
        task: "-",
        managerApproval: false,
        overtime: "0h 00m",
        breaks: "0h 00m",
        leaveStatus: "Annual Leave"
    },
    {
        id: 5,
        employeeId: "GZ005",
        name: "Emmanuel Nshimiyimana",
        department: "Land Management",
        date: "2024-12-10",
        checkIn: "-",
        checkOut: "-",
        totalHours: "0h 00m",
        status: "pending_approval",
        attendanceType: "no_task",
        location: "Remote",
        project: "Land Registry System",
        task: "No tasks assigned",
        managerApproval: false,
        overtime: "0h 00m",
        breaks: "0h 00m",
        leaveStatus: null
    }
]

export const weeklyAttendanceData = [
    { day: "Mon", present: 78, late: 5, absent: 2, onLeave: 3 },
    { day: "Tue", present: 80, late: 3, absent: 2, onLeave: 3 },
    { day: "Wed", present: 82, late: 2, absent: 1, onLeave: 2 },
    { day: "Thu", present: 79, late: 4, absent: 2, onLeave: 3 },
    { day: "Fri", present: 75, late: 6, absent: 4, onLeave: 3 },
]

export const attendanceTypesData = [
    { type: "Office", count: 45, percentage: 52 },
    { type: "Field Work", count: 28, percentage: 32 },
    { type: "Training/Events", count: 8, percentage: 9 },
    { type: "Remote", count: 6, percentage: 7 }
]

export const eventAttendanceData = [
    {
        id: 1,
        eventName: "Climate Change Workshop",
        date: "2024-12-10",
        type: "Training",
        targetGroup: "All Staff",
        totalInvited: 85,
        attendees: 72,
        status: "ongoing"
    },
    {
        id: 2,
        eventName: "Youth Leadership Seminar",
        date: "2024-12-08",
        type: "Workshop",
        targetGroup: "Fellows",
        totalInvited: 25,
        attendees: 23,
        status: "completed"
    },
    {
        id: 3,
        eventName: "Quarterly Review Meeting",
        date: "2024-12-05",
        type: "Meeting",
        targetGroup: "Management",
        totalInvited: 12,
        attendees: 11,
        status: "completed"
    }
]
