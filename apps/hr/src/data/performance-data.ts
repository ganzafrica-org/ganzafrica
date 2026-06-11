export const performanceData = [
    {
        id: 1,
        employeeId: "GZ001",
        name: "Jean Baptiste Mukamana",
        department: "Human Resources",
        position: "HR Manager",
        manager: "Sarah Uwimana",
        currentRating: 4.2,
        previousRating: 3.8,
        reviewPeriod: "Q4 2024",
        reviewDate: "2024-12-15",
        status: "completed",
        projectPerformance: 4.3,
        attendanceScore: 4.1,
        supervisorRating: 4.2,
        goals: [
            { title: "Improve recruitment efficiency", progress: 85, status: "on_track", dueDate: "2024-12-31" },
            { title: "Implement new HRMS", progress: 100, status: "completed", dueDate: "2024-11-30" },
            { title: "Reduce time-to-hire", progress: 70, status: "on_track", dueDate: "2024-12-31" }
        ],
        competencies: {
            leadership: 4.5,
            communication: 4.0,
            technical: 4.2,
            teamwork: 4.3,
            innovation: 3.8
        },
        feedback: "Excellent leadership skills and successful HRMS implementation. Focus on improving recruitment metrics.",
        projects: [
            { name: "HRMS Implementation", completion: 100, rating: 4.5 },
            { name: "Recruitment Process Optimization", completion: 75, rating: 4.0 }
        ]
    },
    {
        id: 2,
        employeeId: "GZ002",
        name: "Marie Claire Nsengimana",
        department: "Agriculture",
        position: "Agricultural Specialist",
        manager: "David Nshimiyimana",
        currentRating: 4.5,
        previousRating: 4.1,
        reviewPeriod: "Q4 2024",
        reviewDate: "2024-12-20",
        status: "in_progress",
        projectPerformance: 4.7,
        attendanceScore: 4.4,
        supervisorRating: 4.3,
        goals: [
            { title: "Increase crop yield by 15%", progress: 95, status: "on_track", dueDate: "2024-12-31" },
            { title: "Train 20 farmers", progress: 80, status: "on_track", dueDate: "2024-12-15" },
            { title: "Research new farming techniques", progress: 60, status: "behind", dueDate: "2024-12-30" }
        ],
        competencies: {
            leadership: 4.0,
            communication: 4.7,
            technical: 4.8,
            teamwork: 4.2,
            innovation: 4.3
        },
        feedback: "Outstanding technical expertise and farmer engagement. Exceeded crop yield targets.",
        projects: [
            { name: "Sustainable Farming Initiative", completion: 90, rating: 4.8 },
            { name: "Farmer Training Program", completion: 80, rating: 4.5 }
        ]
    },
    {
        id: 3,
        employeeId: "GZ003",
        name: "David Niyonkuru",
        department: "Fellowship Program",
        position: "Youth Fellow",
        manager: "Grace Uwimana",
        currentRating: 3.8,
        previousRating: 3.5,
        reviewPeriod: "Q4 2024",
        reviewDate: "2024-12-25",
        status: "scheduled",
        projectPerformance: 3.9,
        attendanceScore: 3.7,
        supervisorRating: 3.8,
        goals: [
            { title: "Complete fellowship project", progress: 75, status: "on_track", dueDate: "2024-12-31" },
            { title: "Develop community partnerships", progress: 90, status: "on_track", dueDate: "2024-12-20" },
            { title: "Attend skills training", progress: 100, status: "completed", dueDate: "2024-11-30" }
        ],
        competencies: {
            leadership: 3.5,
            communication: 4.0,
            technical: 3.8,
            teamwork: 4.2,
            innovation: 3.7
        },
        feedback: "Strong community engagement and project management skills. Ready for increased responsibilities.",
        projects: [
            { name: "Community Development Project", completion: 75, rating: 4.0 },
            { name: "Youth Engagement Initiative", completion: 85, rating: 3.8 }
        ]
    }
]

export const okrData = [
    {
        id: 1,
        quarter: "Q4 2024",
        objective: "Enhance HR Operational Efficiency",
        keyResults: [
            { title: "Reduce time-to-hire by 25%", progress: 80, target: 25, current: 20, status: "on_track" },
            { title: "Achieve 95% employee satisfaction", progress: 92, target: 95, current: 87, status: "on_track" },
            { title: "Complete HRMS implementation", progress: 100, target: 100, current: 100, status: "completed" }
        ],
        owner: "Jean Baptiste Mukamana",
        status: "on_track",
        department: "Human Resources"
    },
    {
        id: 2,
        quarter: "Q4 2024",
        objective: "Improve Agricultural Productivity",
        keyResults: [
            { title: "Increase crop yield by 15%", progress: 95, target: 15, current: 14.2, status: "on_track" },
            { title: "Train 50 farmers", progress: 88, target: 50, current: 44, status: "on_track" },
            { title: "Implement 3 new techniques", progress: 67, target: 3, current: 2, status: "behind" }
        ],
        owner: "Marie Claire Nsengimana",
        status: "on_track",
        department: "Agriculture"
    },
    {
        id: 3,
        quarter: "Q4 2024",
        objective: "Strengthen Community Partnerships",
        keyResults: [
            { title: "Establish 10 new partnerships", progress: 60, target: 10, current: 6, status: "behind" },
            { title: "Increase community engagement by 40%", progress: 75, target: 40, current: 30, status: "on_track" },
            { title: "Launch 2 community programs", progress: 100, target: 2, current: 2, status: "completed" }
        ],
        owner: "David Niyonkuru",
        status: "on_track",
        department: "Fellowship Program"
    }
]

export const feedbackData = [
    {
        id: 1,
        employeeId: "GZ001",
        employeeName: "Jean Baptiste Mukamana",
        feedbackType: "360_review",
        reviewer: "Sarah Uwimana",
        reviewerRole: "Manager",
        rating: 4.2,
        feedback: "Excellent leadership and strategic thinking. Great job on the HRMS implementation.",
        date: "2024-12-15",
        categories: { leadership: 4.5, communication: 4.0, collaboration: 4.3, results: 4.1 }
    },
    {
        id: 2,
        employeeId: "GZ001",
        employeeName: "Jean Baptiste Mukamana",
        feedbackType: "peer_review",
        reviewer: "Marie Claire Nsengimana",
        reviewerRole: "Colleague",
        rating: 4.0,
        feedback: "Very supportive colleague, always willing to help with HR matters. Great communication skills.",
        date: "2024-12-10",
        categories: { leadership: 4.0, communication: 4.2, collaboration: 4.5, results: 3.8 }
    },
    {
        id: 3,
        employeeId: "GZ002",
        employeeName: "Marie Claire Nsengimana",
        feedbackType: "project_feedback",
        reviewer: "David Nshimiyimana",
        reviewerRole: "Manager",
        rating: 4.7,
        feedback: "Outstanding performance on the sustainable farming initiative. Exceeded all targets and showed great innovation.",
        date: "2024-12-08",
        categories: { technical: 4.8, innovation: 4.6, results: 4.8, collaboration: 4.5 }
    },
    {
        id: 4,
        employeeId: "GZ003",
        employeeName: "David Niyonkuru",
        feedbackType: "mentor_feedback",
        reviewer: "Grace Uwimana",
        reviewerRole: "Mentor",
        rating: 3.9,
        feedback: "Shows great potential and enthusiasm. Good progress on community engagement projects. Areas for improvement in time management.",
        date: "2024-12-05",
        categories: { potential: 4.2, engagement: 4.0, growth: 3.8, execution: 3.7 }
    }
]

export const performanceTrendsData = [
    { quarter: "Q1 2024", avgRating: 3.8, goalCompletion: 75, attendance: 92, projectSuccess: 78 },
    { quarter: "Q2 2024", avgRating: 4.0, goalCompletion: 82, attendance: 94, projectSuccess: 85 },
    { quarter: "Q3 2024", avgRating: 4.1, goalCompletion: 78, attendance: 91, projectSuccess: 82 },
    { quarter: "Q4 2024", avgRating: 4.2, goalCompletion: 85, attendance: 93, projectSuccess: 88 },
]

export const departmentPerformanceData = [
    { department: "Agriculture", avgRating: 4.3, employees: 25, projectSuccess: 90, attendance: 95 },
    { department: "Environment", avgRating: 4.1, employees: 18, projectSuccess: 85, attendance: 92 },
    { department: "HR", avgRating: 4.2, employees: 5, projectSuccess: 88, attendance: 96 },
    { department: "Land Mgmt", avgRating: 3.9, employees: 12, projectSuccess: 82, attendance: 89 },
    { department: "Fellowship", avgRating: 3.8, employees: 15, projectSuccess: 78, attendance: 87 },
]
