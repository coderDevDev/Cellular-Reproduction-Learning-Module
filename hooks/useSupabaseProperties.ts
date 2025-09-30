"use client"

import { useState, useEffect } from "react"
import { PropertiesAPI } from "@/lib/api/properties"
import { TenantsAPI } from "@/lib/api/tenants"
import type { Database } from "@/types/database"

type Property = Database["public"]["Tables"]["properties"]["Row"]
type Tenant = Database["public"]["Tables"]["tenants"]["Row"]

export function useSupabaseProperties(ownerId: string | null) {
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ownerId) {
      setLoading(false)
      return
    }

    loadData()
  }, [ownerId])

  const loadData = async () => {
    if (!ownerId) return

    try {
      setLoading(true)
      setError(null)

      const [propertiesResult, tenantsResult] = await Promise.all([
        PropertiesAPI.getProperties(ownerId),
        TenantsAPI.getTenants(ownerId),
      ])

      if (propertiesResult.success) {
        setProperties(propertiesResult.data)
      } else {
        setError(propertiesResult.message || "Failed to load properties")
      }

      if (tenantsResult.success) {
        setTenants(tenantsResult.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addProperty = async (propertyData: any) => {
    if (!ownerId) return null

    try {
      const result = await PropertiesAPI.createProperty({
        ...propertyData,
        owner_id: ownerId,
      })

      if (result.success && result.data) {
        setProperties((prev) => [result.data!, ...prev])
        return result.data
      } else {
        setError(result.message)
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add property")
      return null
    }
  }

  const updateProperty = async (id: string, updates: any) => {
    try {
      const result = await PropertiesAPI.updateProperty(id, updates)

      if (result.success && result.data) {
        setProperties((prev) => prev.map((property) => (property.id === id ? result.data! : property)))
        return result.data
      } else {
        setError(result.message)
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update property")
      return null
    }
  }

  const deleteProperty = async (id: string) => {
    try {
      const result = await PropertiesAPI.deleteProperty(id)

      if (result.success) {
        setProperties((prev) => prev.filter((property) => property.id !== id))
        setTenants((prev) => prev.filter((tenant) => tenant.property_id !== id))
        return true
      } else {
        setError(result.message)
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete property")
      return false
    }
  }

  const getPropertyTenants = (propertyId: string) => {
    return tenants.filter((tenant) => tenant.property_id === propertyId)
  }

  return {
    properties,
    tenants,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyTenants,
    refetch: loadData,
  }
}
