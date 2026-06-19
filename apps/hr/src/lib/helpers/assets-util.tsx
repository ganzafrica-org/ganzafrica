import { Badge } from "@/components/ui/badge"
import {
    Laptop,
    Monitor,
    Smartphone,
    Package
} from "lucide-react"
import {AssetStatus} from "@/data/assets-data";

export const getStatusBadge = (status: AssetStatus) => {
    return status === "yes" ? (
        <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">Yes</Badge>
    ) : (
        <Badge className="rounded-full bg-red-100 px-3 py-1 text-red-700 hover:bg-red-100">No</Badge>
    )
}

export const formatCurrency = (amount: number) => {
    if (!amount) return "N/A"

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export const formatDateLabel = (value: string) => {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(value))
}

// Update the parameter type to be optional
export const getDeviceIcon = (deviceType?: string | null) => {
    // If deviceType is undefined or null, we default to an empty string.
    // Calling .toLowerCase() on an empty string is safe.
    const label = (deviceType ?? "").toLowerCase();

    if (label.includes("phone")) return <Smartphone className="h-4 w-4 text-[#134e48]" />
    if (label.includes("monitor")) return <Monitor className="h-4 w-4 text-[#134e48]" />

    // Default to Laptop or another fallback icon if the type is unknown/empty
    return <Laptop className="h-4 w-4 text-[#134e48]" />
}

export const toDateInputValue = (value: string) => {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return ""
    if (normalized === "n/a" || normalized === "no expiry" || normalized === "no expiration") return ""
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim()
    return ""
}

export const getAntivirusExpiryValue = (hasAntivirus: AssetStatus, antivirusExpiry: string) => {
    if (hasAntivirus === "no") return "N/A"
    return antivirusExpiry ? antivirusExpiry : "N/A"
}

export const getOfficeExpiryValue = (hasMicrosoftOffice: AssetStatus, officeExpiry: string) => {
    if (hasMicrosoftOffice === "no") return "N/A"
    return officeExpiry ? officeExpiry : "No expiry"
}


// NEW ASSET PAGE HELPERS

export const getConditionBadge = (condition: string) => {
    switch (condition) {
        case 'excellent':
            return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
        case 'good':
            return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
        case 'fair':
            return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
        case 'poor':
            return <Badge className="bg-red-100 text-red-800">Poor</Badge>
        default:
            return <Badge variant="outline">{condition}</Badge>
    }
}

export const getRequestStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
        case 'approved':
            return <Badge className="bg-green-100 text-green-800">Approved</Badge>
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
        case 'fulfilled':
            return <Badge className="bg-blue-100 text-blue-800">Fulfilled</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

export const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
        case 'high':
            return <Badge className="bg-red-100 text-red-800">High</Badge>
        case 'medium':
            return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
        case 'low':
            return <Badge className="bg-green-100 text-green-800">Low</Badge>
        default:
            return <Badge variant="outline">{urgency}</Badge>
    }
}

export const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'laptop':
            return <Laptop className="h-4 w-4" />
        case 'phone':
            return <Smartphone className="h-4 w-4" />
        case 'monitor':
            return <Monitor className="h-4 w-4" />
        default:
            return <Package className="h-4 w-4" />
    }
}