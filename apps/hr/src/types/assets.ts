export type AssetCategory = "laptop" | "phone" | "monitor" | "tablet" | "other";

export type AssetStatus = "assigned" | "available" | "maintenance" | "retired" | "lost";

export type AssetCondition = "excellent" | "good" | "fair" | "poor";

export type RequestType = "new" | "replacement" | "additional";

export type RequestStatus = "pending" | "approved" | "rejected" | "fulfilled";

export type RequestUrgency = "high" | "medium" | "low";

// ─── Maintenance ────────────────────────────────────────────────────────────

export interface MaintenanceRecord {
  date: string;
  type: string;
  cost: number;
  notes?: string;
}

// ─── Asset ──────────────────────────────────────────────────────────────────

export interface AssetSpecifications {
  processor?: string;
  ram?: string;
  storage?: string;
  screen?: string;
  camera?: string;
  battery?: string;
  size?: string;
  resolution?: string;
  connectivity?: string;
  features?: string;
  [key: string]: string | undefined;
}

export interface Asset {
  id: number;
  assetTag: string;
  name: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  warranty: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  assignedTo: string | null;
  assignedDate: string | null;
  department: string | null;
  specifications: AssetSpecifications;
  maintenanceHistory: MaintenanceRecord[];
}

export interface AssetCategoryStats {
  category: string;
  count: number;
  value: number;
  fill: string;
}

export interface AssetConditionStats {
  condition: AssetCondition;
  count: number;
  percentage: number;
}

export interface MonthlyAssetActivity {
  month: string;
  purchased: number;
  retired: number;
  maintenance: number;
}
