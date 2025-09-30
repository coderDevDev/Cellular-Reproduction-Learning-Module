import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database"

type Tenant = Database["public"]["Tables"]["tenants"]["Row"]
type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"]
type TenantUpdate = Database["public"]["Tables"]["tenants"]["Update"]

export class TenantsAPI {
  static async getTenants(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          user:users(*),
          property:properties(*)
        `)
        .eq("properties.owner_id", ownerId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Get tenants error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch tenants",
        data: [],
      }
    }
  }

  static async getTenant(id: string) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          user:users(*),
          property:properties(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data }
    } catch (error) {
      console.error("Get tenant error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch tenant",
        data: null,
      }
    }
  }

  static async createTenant(tenant: Omit<TenantInsert, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .insert([tenant])
        .select(`
          *,
          user:users(*),
          property:properties(*)
        `)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Update property occupied units
      await supabase.rpc("increment_occupied_units", {
        property_id: tenant.property_id,
      })

      return {
        success: true,
        message: "Tenant created successfully",
        data,
      }
    } catch (error) {
      console.error("Create tenant error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create tenant",
        data: null,
      }
    }
  }

  static async updateTenant(id: string, updates: TenantUpdate) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          user:users(*),
          property:properties(*)
        `)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        success: true,
        message: "Tenant updated successfully",
        data,
      }
    } catch (error) {
      console.error("Update tenant error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update tenant",
        data: null,
      }
    }
  }

  static async deleteTenant(id: string) {
    try {
      // Get tenant data first to update property occupied units
      const { data: tenant } = await supabase.from("tenants").select("property_id").eq("id", id).single()

      const { error } = await supabase.from("tenants").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      // Update property occupied units
      if (tenant) {
        await supabase.rpc("decrement_occupied_units", {
          property_id: tenant.property_id,
        })
      }

      return {
        success: true,
        message: "Tenant deleted successfully",
      }
    } catch (error) {
      console.error("Delete tenant error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete tenant",
      }
    }
  }

  static async getTenantByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          property:properties(*)
        `)
        .eq("user_id", userId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data }
    } catch (error) {
      console.error("Get tenant by user ID error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch tenant data",
        data: null,
      }
    }
  }
}
