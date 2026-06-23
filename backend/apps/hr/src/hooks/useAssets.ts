"use client"

import { useCallback, useEffect, useState } from "react"
import { assetsService } from "@/services/assets.service"
import type { Asset, AssetCategory } from "@/types/api"

export function useAssets(filters?: { assignedTo?: string; hasIssue?: "YES" | "NO"; isFlagged?: boolean }) {
  const [assets, setAssets]   = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await assetsService.getAssets(filters)
      setAssets(data)
    } catch {
      setError("Failed to load assets")
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  return { assets, loading, error, refetch: fetch }
}

export function useAssetCategories() {
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await assetsService.getCategories()
      setCategories(data)
    } catch {
      setError("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  // Group by parent_name for easy rendering: { Electronics: [...], Furniture: [...] }
  const grouped = categories.reduce<Record<string, AssetCategory[]>>((acc, cat) => {
    const key = cat.parent_name ?? "Other"
    if (!acc[key]) acc[key] = []
    acc[key].push(cat)
    return acc
  }, {})

  return { categories, grouped, loading, error, refetch: fetch }
}

export function useAssetDetail(id: string | null) {
  const [asset, setAsset]     = useState<Asset | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    assetsService.getAssetById(id)
      .then(setAsset)
      .catch(() => setError("Failed to load asset"))
      .finally(() => setLoading(false))
  }, [id])

  return { asset, loading, error }
}
