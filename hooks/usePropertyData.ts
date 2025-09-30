"use client"

import { useState, useEffect } from "react"
import type { Property, Tenant, LeaseAgreement } from "@/types/property"
import { mockProperties, mockTenants, mockLeaseAgreements } from "@/data/mockData"

export function usePropertyData() {
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [leaseAgreements, setLeaseAgreements] = useState<LeaseAgreement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperties(mockProperties)
      setTenants(mockTenants)
      setLeaseAgreements(mockLeaseAgreements)
      setLoading(false)
    }, 1000)
  }, [])

  // Property CRUD operations
  const addProperty = (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
    const defaultThumbnail =
      property.thumbnail ||
      (property.type === "residential"
        ? "/placeholder.svg?height=200&width=300&text=Residential+Property"
        : property.type === "commercial"
          ? "/placeholder.svg?height=200&width=300&text=Commercial+Property"
          : property.type === "dormitory"
            ? "/placeholder.svg?height=200&width=300&text=Dormitory+Property"
            : "/placeholder.svg?height=200&width=300&text=Property+Image")

    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      thumbnail: property.thumbnail || defaultThumbnail,
      images: property.images.length > 0 ? property.images : [defaultThumbnail],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setProperties((prev) => [...prev, newProperty])
    return newProperty
  }

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((property) =>
        property.id === id ? { ...property, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : property,
      ),
    )
  }

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((property) => property.id !== id))
    // Also remove related tenants and lease agreements
    setTenants((prev) => prev.filter((tenant) => tenant.propertyId !== id))
    setLeaseAgreements((prev) => prev.filter((lease) => lease.propertyId !== id))
  }

  // Tenant CRUD operations
  const addTenant = (tenant: Omit<Tenant, "id" | "createdAt">) => {
    const newTenant: Tenant = {
      ...tenant,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setTenants((prev) => [...prev, newTenant])

    // Update property occupied units
    updateProperty(tenant.propertyId, {
      occupiedUnits: properties.find((p) => p.id === tenant.propertyId)?.occupiedUnits! + 1,
    })

    return newTenant
  }

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants((prev) => prev.map((tenant) => (tenant.id === id ? { ...tenant, ...updates } : tenant)))
  }

  const deleteTenant = (id: string) => {
    const tenant = tenants.find((t) => t.id === id)
    if (tenant) {
      setTenants((prev) => prev.filter((t) => t.id !== id))
      // Update property occupied units
      updateProperty(tenant.propertyId, {
        occupiedUnits: properties.find((p) => p.id === tenant.propertyId)?.occupiedUnits! - 1,
      })
      // Remove related lease agreements
      setLeaseAgreements((prev) => prev.filter((lease) => lease.tenantId !== id))
    }
  }

  // Lease Agreement CRUD operations
  const addLeaseAgreement = (lease: Omit<LeaseAgreement, "id">) => {
    const newLease: LeaseAgreement = {
      ...lease,
      id: Date.now().toString(),
    }
    setLeaseAgreements((prev) => [...prev, newLease])
    return newLease
  }

  const updateLeaseAgreement = (id: string, updates: Partial<LeaseAgreement>) => {
    setLeaseAgreements((prev) => prev.map((lease) => (lease.id === id ? { ...lease, ...updates } : lease)))
  }

  const deleteLeaseAgreement = (id: string) => {
    setLeaseAgreements((prev) => prev.filter((lease) => lease.id !== id))
  }

  // Helper functions
  const getPropertyTenants = (propertyId: string) => {
    return tenants.filter((tenant) => tenant.propertyId === propertyId)
  }

  const getPropertyLeases = (propertyId: string) => {
    return leaseAgreements.filter((lease) => lease.propertyId === propertyId)
  }

  const getTenantLease = (tenantId: string) => {
    return leaseAgreements.find((lease) => lease.tenantId === tenantId)
  }

  return {
    properties,
    tenants,
    leaseAgreements,
    loading,
    // CRUD operations
    addProperty,
    updateProperty,
    deleteProperty,
    addTenant,
    updateTenant,
    deleteTenant,
    addLeaseAgreement,
    updateLeaseAgreement,
    deleteLeaseAgreement,
    // Helper functions
    getPropertyTenants,
    getPropertyLeases,
    getTenantLease,
  }
}
