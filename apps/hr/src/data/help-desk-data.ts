export const ticketsData = [
  {
    id: "HD-001",
    title: "Password Reset Request",
    description: "Unable to log into email account after vacation",
    category: "IT Support",
    priority: "medium",
    status: "open",
    submittedBy: "Marie Claire Nsengimana",
    submittedByEmail: "marie.nsengimana@ganzafrica.org",
    assignedTo: "IT Support Team",
    createdAt: "2024-12-10T09:00:00Z",
    updatedAt: "2024-12-10T14:30:00Z",
    department: "Agriculture",
    tags: ["password", "email", "access"],
    urgency: "medium",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Marie Claire Nsengimana",
        message:
          "I can't access my email after returning from vacation. Getting authentication errors.",
        timestamp: "2024-12-10T09:00:00Z",
      },
      {
        id: 2,
        author: "IT Support",
        message: "We've reset your password. Please check your recovery email for new credentials.",
        timestamp: "2024-12-10T14:30:00Z",
      },
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "HD-002",
    title: "Leave Balance Inquiry",
    description: "Need clarification on remaining annual leave days",
    category: "HR",
    priority: "low",
    status: "resolved",
    submittedBy: "David Niyonkuru",
    submittedByEmail: "david.niyonkuru@ganzafrica.org",
    assignedTo: "Jean Baptiste Mukamana",
    createdAt: "2024-12-08T11:00:00Z",
    updatedAt: "2024-12-09T16:00:00Z",
    department: "Fellowship Program",
    tags: ["leave", "balance", "inquiry"],
    urgency: "low",
    satisfaction: 5,
    messages: [
      {
        id: 1,
        author: "David Niyonkuru",
        message: "Can you please check my current leave balance? I'm planning time off next month.",
        timestamp: "2024-12-08T11:00:00Z",
      },
      {
        id: 2,
        author: "Jean Baptiste Mukamana",
        message:
          "You have 12 days of annual leave remaining. I'll send the detailed breakdown to your email.",
        timestamp: "2024-12-09T16:00:00Z",
      },
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "HD-003",
    title: "Equipment Malfunction",
    description: "Office printer not working, urgent documents need printing",
    category: "Facilities",
    priority: "high",
    status: "in_progress",
    submittedBy: "Grace Mukamana",
    submittedByEmail: "grace.mukamana@ganzafrica.org",
    assignedTo: "Facilities Team",
    createdAt: "2024-12-10T13:45:00Z",
    updatedAt: "2024-12-10T15:20:00Z",
    department: "Environment",
    tags: ["printer", "equipment", "urgent"],
    urgency: "high",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Grace Mukamana",
        message:
          "The main office printer is showing error codes and won't print. We have urgent reports due today.",
        timestamp: "2024-12-10T13:45:00Z",
      },
      {
        id: 2,
        author: "Facilities Team",
        message:
          "Technician dispatched. Should be resolved within 2 hours. Temporary printer available in Conference Room B.",
        timestamp: "2024-12-10T15:20:00Z",
      },
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "HD-004",
    title: "Training Request",
    description: "Request for Excel advanced training for team",
    category: "Training",
    priority: "low",
    status: "open",
    submittedBy: "Emmanuel Nshimiyimana",
    submittedByEmail: "emmanuel.nshimiyimana@ganzafrica.org",
    assignedTo: "HR Training Team",
    createdAt: "2024-12-09T10:30:00Z",
    updatedAt: "2024-12-09T10:30:00Z",
    department: "Land Management",
    tags: ["training", "excel", "team"],
    urgency: "low",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Emmanuel Nshimiyimana",
        message:
          "Our team needs advanced Excel training for data analysis. Can we schedule this for next month?",
        timestamp: "2024-12-09T10:30:00Z",
      },
    ],
    videoUrl: null,
  },
  {
    id: "HD-005",
    title: "Payroll Discrepancy",
    description: "Overtime hours not reflected correctly in last payslip",
    category: "Payroll",
    priority: "high",
    status: "escalated",
    submittedBy: "Alice Uwimana",
    submittedByEmail: "alice.uwimana@ganzafrica.org",
    assignedTo: "finance Team",
    createdAt: "2024-12-07T14:00:00Z",
    updatedAt: "2024-12-10T11:00:00Z",
    department: "Environment",
    tags: ["payroll", "overtime", "discrepancy"],
    urgency: "high",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Alice Uwimana",
        message:
          "My payslip shows 5 hours of overtime but I worked 12 hours last week. Please review.",
        timestamp: "2024-12-07T14:00:00Z",
      },
      {
        id: 2,
        author: "HR Team",
        message:
          "Escalated to finance. They will review attendance records and respond within 48 hours.",
        timestamp: "2024-12-10T11:00:00Z",
      },
    ],
    videoUrl: null,
  },
];

export const faqData = [
  {
    id: 1,
    category: "Leave Management",
    question: "How do I request annual leave?",
    answer:
      "You can request annual leave through the HR portal under 'Leave Management' or by filling out the leave request form and submitting it to your manager for approval.",
    views: 156,
    helpful: 142,
    tags: ["leave", "annual", "request"],
    lastUpdated: "2024-11-15",
  },
  {
    id: 2,
    category: "IT Support",
    question: "I forgot my password, how do I reset it?",
    answer:
      "Use the 'Forgot Password' link on the login page or contact IT support at it@ganzafrica.org. For urgent access, call extension 101.",
    views: 203,
    helpful: 189,
    tags: ["password", "reset", "login"],
    lastUpdated: "2024-12-01",
  },
  {
    id: 3,
    category: "Payroll",
    question: "When are salaries paid each month?",
    answer:
      "Salaries are paid on the 25th of each month. If the 25th falls on a weekend or holiday, payment will be made on the preceding business day.",
    views: 89,
    helpful: 84,
    tags: ["salary", "payroll", "payment"],
    lastUpdated: "2024-10-20",
  },
  {
    id: 4,
    category: "Benefits",
    question: "What health insurance coverage do I have?",
    answer:
      "All employees are covered by our comprehensive health insurance plan. For detailed coverage information, contact HR or check your employee handbook.",
    views: 134,
    helpful: 128,
    tags: ["insurance", "health", "benefits"],
    lastUpdated: "2024-11-30",
  },
  {
    id: 5,
    category: "Travel",
    question: "How do I request travel approval?",
    answer:
      "Submit a travel request through the finance portal at least 2 weeks before your intended travel date. Include destination, purpose, and estimated costs.",
    views: 78,
    helpful: 73,
    tags: ["travel", "approval", "request"],
    lastUpdated: "2024-12-05",
  },
  {
    id: 6,
    category: "Equipment",
    question: "How do I report equipment issues?",
    answer:
      "Create a helpdesk ticket under 'Facilities' category or email facilities@ganzafrica.org with details about the equipment problem.",
    views: 95,
    helpful: 87,
    tags: ["equipment", "facilities", "maintenance"],
    lastUpdated: "2024-11-28",
  },
];

export const ticketVolumeData = [
  { month: "Jul", tickets: 45, resolved: 42, avgTime: 2.3 },
  { month: "Aug", tickets: 52, resolved: 48, avgTime: 2.1 },
  { month: "Sep", tickets: 38, resolved: 36, avgTime: 1.9 },
  { month: "Oct", tickets: 67, resolved: 63, avgTime: 2.8 },
  { month: "Nov", tickets: 43, resolved: 41, avgTime: 2.2 },
  { month: "Dec", tickets: 59, resolved: 54, avgTime: 2.4 },
];

export const categoryDistribution = [
  { category: "IT Support", count: 23, fill: "#10b981" },
  { category: "HR", count: 18, fill: "#3b82f6" },
  { category: "Facilities", count: 12, fill: "#f59e0b" },
  { category: "Payroll", count: 8, fill: "#ef4444" },
  { category: "Training", count: 6, fill: "#8b5cf6" },
  { category: "Other", count: 4, fill: "#6b7280" },
];

export const resolutionTimeData = [
  { priority: "Low", avgHours: 48, target: 72 },
  { priority: "Medium", avgHours: 24, target: 48 },
  { priority: "High", avgHours: 8, target: 24 },
  { priority: "Critical", avgHours: 2, target: 4 },
];

export const satisfactionData = [
  { rating: "5 Stars", count: 45, fill: "#10b981" },
  { rating: "4 Stars", count: 23, fill: "#3b82f6" },
  { rating: "3 Stars", count: 8, fill: "#f59e0b" },
  { rating: "2 Stars", count: 3, fill: "#ef4444" },
  { rating: "1 Star", count: 1, fill: "#6b7280" },
];
