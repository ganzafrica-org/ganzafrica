import { Badge } from "@/components/ui/badge"
import {
    Laptop,
    Monitor,
    Smartphone
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
