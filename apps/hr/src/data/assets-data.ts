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

export type AssetDraft = {
    serialNumber: string
    deviceType: string
    generation: string
    core: string
    ram: string
    hardDisk: string
    purchasePrice: string
    hasAntivirus: AssetStatus
    antivirusExpiry: string // YYYY-MM-DD or ""
    hasMicrosoftOffice: AssetStatus
    officeExpiry: string // YYYY-MM-DD or ""
    assignedTo: string
    issues: AssetStatus
    explainIssue: string
    assignedDate: string // YYYY-MM-DD
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