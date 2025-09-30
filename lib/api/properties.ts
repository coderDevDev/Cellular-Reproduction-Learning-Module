import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database"

type Property = Database["public"]["Tables"]["properties"]["Row"]
type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"]
type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"]

export class PropertiesAPI {
  static async getProperties(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Get properties error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch properties",
        data: [],
      }
    }
  }

  static async getProperty(id: string) {
    try {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).single()

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data }
    } catch (error) {
      console.error("Get property error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch property",
        data: null,
      }
    }
  }

  static async createProperty(property: Omit<PropertyInsert, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase.from("properties").insert([property]).select().single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        success: true,
        message: "Property created successfully",
        data,
      }
    } catch (error) {
      console.error("Create property error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create property",
        data: null,
      }
    }
  }

  static async updateProperty(id: string, updates: PropertyUpdate) {
    try {
      const { data, error } = await supabase.from("properties").update(updates).eq("id", id).select().single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        success: true,
        message: "Property updated successfully",
        data,
      }
    } catch (error) {
      console.error("Update property error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update property",
        data: null,
      }
    }
  }

  static async deleteProperty(id: string) {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      return {
        success: true,
        message: "Property deleted successfully",
      }
    } catch (error) {
      console.error("Delete property error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete property",
      }
    }
  }

  static async getPropertyTenants(propertyId: string) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          user:users(*)
        `)
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Get property tenants error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch tenants",
        data: [],
      }
    }
  }
}
