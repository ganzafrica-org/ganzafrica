import { Asset, AssetCategory, RequestStatus, RequestType, RequestUrgency } from "@/types/assets"

export type AssetStatus = "yes" | "no" 

export type AssetRecord = {
    id: number
    serialNumber: string
    deviceType: string
    generation: string
    core: string
    ram: string
    hardDisk: string
    purchasePrice: number
    hasAntivirus: AssetStatus
    antivirusExpiry: string
    hasMicrosoftOffice: AssetStatus
    officeExpiry: string
    assignedTo: string
    issues: AssetStatus
    explainIssue: string
    assignedDate: string
}

export type AssetDraft = Omit<Asset, "id"> & { id?: number }
 
export const defaultDraft: AssetDraft = {
    assetTag: "",
    name: "",
    category: "laptop",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: 0,
    currentValue: 0,
    warranty: "",
    status: "available",
    condition: "excellent",
    location: "",
    assignedTo: null,
    assignedDate: null,
    department: null,
    specifications: {},
    maintenanceHistory: [],
}

export interface AssetRequest {
    id: number
    employeeId: string
    employeeName: string
    department: string
    requestType: RequestType
    assetCategory: AssetCategory
    justification: string
    urgency: RequestUrgency
    requestDate: string
    status: RequestStatus
    approver: string
    budget: number
}

export const initialAssets: AssetRecord[] = [
    {
        id: 1,
        serialNumber: "FHN6QDU004L",
        deviceType: "Laptop (ASUS M16)",
        generation: "AMD 6th Generation",
        core: "Ryzen 7",
        ram: "16 GB",
        hardDisk: "500 GB",
        purchasePrice: 1244,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Joseph Gatete Beliio",
        issues: "no",
        explainIssue: "",
        assignedDate: "2026-01-12",
    },
    {
        id: 2,
        serialNumber: "U30GZZA14A",
        deviceType: "Laptop (HP EliteBook)",
        generation: "Intel 11th Generation",
        core: "i7",
        ram: "8 GB",
        hardDisk: "500 GB",
        purchasePrice: 0,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "UNASSIGNED",
        issues: "no",
        explainIssue: "",
        assignedDate: "2026-02-08",
    },
    {
        id: 3,
        serialNumber: "TZP2J4VXA",
        deviceType: "Laptop (HP Spectre)",
        generation: "Intel 11th Generation",
        core: "i7",
        ram: "16 GB",
        hardDisk: "1 TB",
        purchasePrice: 1744,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Rosette Uwase",
        issues: "no",
        explainIssue: "",
        assignedDate: "2026-02-25",
    },
    {
        id: 4,
        serialNumber: "PF3WNX3K",
        deviceType: "Laptop (Lenovo ThinkPad)",
        generation: "Intel 11th Generation",
        core: "i5",
        ram: "8 GB",
        hardDisk: "256 GB",
        purchasePrice: 980,
        hasAntivirus: "no",
        antivirusExpiry: "N/A",
        hasMicrosoftOffice: "no",
        officeExpiry: "N/A",
        assignedTo: "UNASSIGNED",
        issues: "no",
        explainIssue: "",
        assignedDate: "2026-03-04",
    },
    {
        id: 5,
        serialNumber: "PFC25TXT8",
        deviceType: "Laptop (Lenovo ThinkBook)",
        generation: "Intel 11th Generation",
        core: "i7",
        ram: "16 GB",
        hardDisk: "1 TB",
        purchasePrice: 1350,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Triscia Ujenewanda",
        issues: "no",
        explainIssue: "Fixed screen issue",
        assignedDate: "2026-03-18",
    },
    {
        id: 6,
        serialNumber: "PF4K5JJR",
        deviceType: "Laptop (HP EliteBook)",
        generation: "Intel 12th Generation",
        core: "i7",
        ram: "16 GB",
        hardDisk: "1 TB",
        purchasePrice: 1500,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Serge Bizo",
        issues: "no",
        explainIssue: "",
        assignedDate: "2026-04-02",
    },
    {
        id: 7,
        serialNumber: "PF8ZBYMN",
        deviceType: "Laptop (Lenovo ThinkBook)",
        generation: "Intel 12th Generation",
        core: "i7",
        ram: "8 GB",
        hardDisk: "1 TB",
        purchasePrice: 1290,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Deborah",
        issues: "no",
        explainIssue: "",
        assignedDate: "2026-04-07",
    },
    {
        id: 8,
        serialNumber: "PFL4LT79",
        deviceType: "Laptop (Lenovo ThinkBook)",
        generation: "Intel 12th Generation",
        core: "i7",
        ram: "16 GB",
        hardDisk: "1 TB",
        purchasePrice: 1460,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Divine",
        issues: "no",
        explainIssue: "Has ventilation issue on the right side",
        assignedDate: "2026-04-11",
    },
    {
        id: 9,
        serialNumber: "PF4K2BRN",
        deviceType: "Laptop (Lenovo V14)",
        generation: "Intel 12th Generation",
        core: "i7",
        ram: "8 GB",
        hardDisk: "500 GB",
        purchasePrice: 1015,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Nolda",
        issues: "yes",
        explainIssue: "The mouse is not working",
        assignedDate: "2026-04-15",
    },
    {
        id: 10,
        serialNumber: "PFX9WAPX",
        deviceType: "Laptop (Lenovo ThinkPad)",
        generation: "Intel 15th Generation",
        core: "Ultra 7",
        ram: "16 GB",
        hardDisk: "1 TB",
        purchasePrice: 1785,
        hasAntivirus: "yes",
        antivirusExpiry: "2027-08-01",
        hasMicrosoftOffice: "yes",
        officeExpiry: "No expiry",
        assignedTo: "Didier Ngemaje",
        issues: "no",
        explainIssue: "",
        assignedDate: "2026-04-16",
    },
]

// Assets page data

export const assetsData = [
    {
        id: 1,
        assetTag: "GZ-LT-001",
        name: "Dell Latitude 5520",
        category: "laptop",
        brand: "Dell",
        model: "Latitude 5520",
        serialNumber: "DL5520001",
        purchaseDate: "2024-01-15",
        purchasePrice: 1200,
        currentValue: 900,
        warranty: "2026-01-15",
        status: "assigned",
        condition: "excellent",
        location: "Kigali Office",
        assignedTo: "Jean Baptiste Mukamana",
        assignedDate: "2024-01-20",
        department: "Human Resources",
        specifications: {
            processor: "Intel i7-11th Gen",
            ram: "16GB DDR4",
            storage: "512GB SSD",
            screen: "15.6 inch FHD"
        },
        maintenanceHistory: [
            { date: "2024-06-15", type: "Software Update", cost: 0, notes: "OS and security updates" }
        ]
    },
    {
        id: 2,
        assetTag: "GZ-LT-002",
        name: "MacBook Pro 16",
        category: "laptop",
        brand: "Apple",
        model: "MacBook Pro 16-inch",
        serialNumber: "MBP16002",
        purchaseDate: "2024-02-01",
        purchasePrice: 2500,
        currentValue: 2000,
        warranty: "2026-02-01",
        status: "assigned",
        condition: "excellent",
        location: "Musanze Office",
        assignedTo: "Marie Claire Nsengimana",
        assignedDate: "2024-02-05",
        department: "Agriculture",
        specifications: {
            processor: "Apple M2 Pro",
            ram: "32GB Unified Memory",
            storage: "1TB SSD",
            screen: "16.2 inch Retina"
        },
        maintenanceHistory: []
    },
    {
        id: 3,
        assetTag: "GZ-PH-001",
        name: "iPhone 14 Pro",
        category: "phone",
        brand: "Apple",
        model: "iPhone 14 Pro",
        serialNumber: "IP14P001",
        purchaseDate: "2024-03-10",
        purchasePrice: 1100,
        currentValue: 850,
        warranty: "2025-03-10",
        status: "assigned",
        condition: "good",
        location: "Kigali Office",
        assignedTo: "David Niyonkuru",
        assignedDate: "2024-03-15",
        department: "Fellowship Program",
        specifications: {
            storage: "256GB",
            screen: "6.1 inch Super Retina XDR",
            camera: "48MP Triple Camera",
            battery: "All-day battery life"
        },
        maintenanceHistory: []
    },
    {
        id: 4,
        assetTag: "GZ-MON-001",
        name: "Dell UltraSharp Monitor",
        category: "monitor",
        brand: "Dell",
        model: "U2722DE",
        serialNumber: "DU27001",
        purchaseDate: "2024-01-20",
        purchasePrice: 400,
        currentValue: 320,
        warranty: "2027-01-20",
        status: "available",
        condition: "excellent",
        location: "Storage Room",
        assignedTo: null,
        assignedDate: null,
        department: null,
        specifications: {
            size: "27 inch",
            resolution: "2560x1440 QHD",
            connectivity: "USB-C, HDMI, DisplayPort",
            features: "Height adjustable, Swivel"
        },
        maintenanceHistory: []
    },
    {
        id: 5,
        assetTag: "GZ-LT-003",
        name: "HP EliteBook 850",
        category: "laptop",
        brand: "HP",
        model: "EliteBook 850 G8",
        serialNumber: "HP850003",
        purchaseDate: "2023-11-15",
        purchasePrice: 1300,
        currentValue: 750,
        warranty: "2025-11-15",
        status: "maintenance",
        condition: "fair",
        location: "IT Department",
        assignedTo: null,
        assignedDate: null,
        department: null,
        specifications: {
            processor: "Intel i7-10th Gen",
            ram: "16GB DDR4",
            storage: "256GB SSD",
            screen: "15.6 inch FHD"
        },
        maintenanceHistory: [
            { date: "2024-12-10", type: "Hardware Repair", cost: 200, notes: "Keyboard replacement" }
        ]
    }
]

export const assetRequests = [
    {
        id: 1,
        employeeId: "GZ006",
        employeeName: "Grace Mukamana",
        department: "Environment",
        requestType: "new",
        assetCategory: "laptop",
        justification: "Need laptop for field data collection and analysis",
        urgency: "medium",
        requestDate: "2024-12-08",
        status: "pending",
        approver: "Sarah Uwimana",
        budget: 1500
    },
    {
        id: 2,
        employeeId: "GZ007",
        employeeName: "Emmanuel Nshimiyimana",
        department: "Land Management",
        requestType: "replacement",
        assetCategory: "phone",
        justification: "Current phone has battery issues and poor camera quality",
        urgency: "low",
        requestDate: "2024-12-05",
        status: "approved",
        approver: "Sarah Uwimana",
        budget: 800
    },
    {
        id: 3,
        employeeId: "GZ003",
        employeeName: "David Niyonkuru",
        department: "Fellowship Program",
        requestType: "additional",
        assetCategory: "monitor",
        justification: "Need external monitor for better productivity",
        urgency: "low",
        requestDate: "2024-12-07",
        status: "pending",
        approver: "Grace Uwimana",
        budget: 300
    }
]

export const assetCategoryData = [
    { category: "Laptops", count: 25, value: 28500, fill: "#10b981" },
    { category: "Phones", count: 18, value: 14400, fill: "#3b82f6" },
    { category: "Monitors", count: 15, value: 4800, fill: "#f59e0b" },
    { category: "Tablets", count: 8, value: 3200, fill: "#8b5cf6" },
    { category: "Other", count: 12, value: 2400, fill: "#ef4444" },
]

export const assetConditionData = [
    { condition: "Excellent", count: 45, percentage: 58 },
    { condition: "Good", count: 25, percentage: 32 },
    { condition: "Fair", count: 6, percentage: 8 },
    { condition: "Poor", count: 2, percentage: 2 },
]

export const monthlyAssetData = [
    { month: "Jul", purchased: 5, retired: 2, maintenance: 3 },
    { month: "Aug", purchased: 8, retired: 1, maintenance: 5 },
    { month: "Sep", purchased: 3, retired: 4, maintenance: 2 },
    { month: "Oct", purchased: 12, retired: 2, maintenance: 7 },
    { month: "Nov", purchased: 6, retired: 3, maintenance: 4 },
    { month: "Dec", purchased: 4, retired: 1, maintenance: 6 },
]
