"use server"

import { getSupabaseServer } from "./supabase-server"
import { getSupabaseAdmin } from "./supabase-admin"

// ==================== Types ====================

export type User = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Store = {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  theme_color: string
  is_published: boolean
  whatsapp_number: string | null
  category: string
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  image_urls: string[]
  stock: number
  is_active: boolean
  cost_price: number | null
  low_stock_level: number | null
  created_at: string
  updated_at: string
}

export type Sale = {
  id: string
  store_id: string
  product_id: string
  customer_email: string
  customer_name: string | null
  quantity: number
  total_amount: number
  stripe_payment_id: string | null
  status: string
  lead_id: string | null
  created_at: string
  updated_at: string
}

export type CRMLead = {
  id: string
  store_id: string
  name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  source: string | null
  stage: string
  notes: string | null
  total_purchases: number
  last_contacted_at: string | null
  created_at: string
  updated_at: string
}

export type CRMInteraction = {
  id: string
  lead_id: string
  store_id: string
  type: string
  content: string | null
  created_by: string | null
  created_at: string
}

export type CRMFunnelStage = {
  id: string
  store_id: string
  name: string
  color: string
  order_index: number
  is_default: boolean
  created_at: string
}

export type ScheduledReport = {
  id: string
  store_id: string
  report_type: string
  frequency: string
  email: string
  is_active: boolean
  last_sent_at: string | null
  created_at: string
}

// ==================== User Queries ====================

export async function getUserById(userId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

  if (error) throw error
  return data as User | null
}

export async function getUserByEmail(email: string) {
  const admin = await getSupabaseAdmin()
  const { data, error } = await admin.from("users").select("*").eq("email", email).maybeSingle()

  if (error) throw error
  return data as User | null
}

export async function createUser(user: { id: string; email: string; full_name: string }) {
  const admin = await getSupabaseAdmin()
  const { data, error } = await admin.from("users").insert(user).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create user")
  return data as User
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("User not found")
  return data as User
}

// ==================== Store Queries ====================

export async function getStoreByOwnerId(ownerId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("stores").select("*").eq("owner_id", ownerId).maybeSingle()

  if (error) throw error
  return data as Store | null
}

export async function getStoreById(storeId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("stores").select("*").eq("id", storeId).maybeSingle()

  if (error) throw error
  return data as Store | null
}

export async function getStoreBySlug(slug: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error) throw error
  return data as Store | null
}

export async function getAllPublishedStores() {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Store[]
}

export async function createStore(store: {
  owner_id: string
  name: string
  slug: string
  description?: string
  category?: string
}) {
  const admin = await getSupabaseAdmin()
  const { data, error } = await admin.from("stores").insert(store).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create store")
  return data as Store
}

export async function updateStore(storeId: string, updates: Partial<Store>) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("stores")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", storeId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Store not found")
  return data as Store
}

export async function deleteStore(storeId: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from("stores").delete().eq("id", storeId)

  if (error) throw error
}

// ==================== Product Queries ====================

export async function getProductsByStoreId(storeId: string, activeOnly = false) {
  const supabase = await getSupabaseServer()
  let query = supabase.from("products").select("*").eq("store_id", storeId)

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data as Product[]
}

export async function getProductById(productId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle()

  if (error) throw error
  return data as Product | null
}

export async function getPublicProductsByStoreId(storeId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Product[]
}

export async function createProduct(product: {
  store_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  image_urls?: string[]
  stock?: number
  cost_price?: number
  low_stock_level?: number
}) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("products").insert(product).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create product")
  return data as Product
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Product not found")
  return data as Product
}

export async function toggleProductStatus(productId: string, currentStatus: boolean) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: !currentStatus })
    .eq("id", productId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Product not found")
  return data as Product
}

export async function deleteProducts(productIds: string[]) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from("products").delete().in("id", productIds)

  if (error) throw error
}

export async function updateProductStock(productId: string, quantity: number) {
  const supabase = await getSupabaseServer()

  // Get current stock
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!product) throw new Error("Product not found")

  const newStock = product.stock - quantity

  if (newStock < 0) throw new Error("Insufficient stock")

  const { data, error } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to update stock")
  return data as Product
}

// ==================== Sales Queries ====================

export async function getSalesByStoreId(storeId: string, dateRange?: { from: Date; to: Date }) {
  const supabase = await getSupabaseServer()
  let query = supabase.from("sales").select("*, products(name, image_url)").eq("store_id", storeId)

  if (dateRange) {
    query = query.gte("created_at", dateRange.from.toISOString()).lte("created_at", dateRange.to.toISOString())
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getSaleById(saleId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("sales")
    .select("*, products(name, image_url)")
    .eq("id", saleId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createSale(sale: {
  store_id: string
  product_id: string
  customer_email: string
  customer_name?: string
  quantity: number
  total_amount: number
  status?: string
  lead_id?: string
}) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("sales").insert(sale).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create sale")
  return data as Sale
}

export async function updateSale(saleId: string, updates: Partial<Sale>) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("sales")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", saleId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Sale not found")
  return data as Sale
}

// ==================== CRM Lead Queries ====================

export async function getLeadsByStoreId(storeId: string, stage?: string) {
  const supabase = await getSupabaseServer()
  let query = supabase.from("crm_leads").select("*").eq("store_id", storeId)

  if (stage) {
    query = query.eq("stage", stage)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data as CRMLead[]
}

export async function getLeadById(leadId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("crm_leads").select("*").eq("id", leadId).maybeSingle()

  if (error) throw error
  return data as CRMLead | null
}

export async function getLeadByEmail(storeId: string, email: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("store_id", storeId)
    .eq("email", email)
    .maybeSingle()

  if (error) throw error
  return data as CRMLead | null
}

export async function getLeadByPhone(storeId: string, phone: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("store_id", storeId)
    .eq("phone", phone)
    .maybeSingle()

  if (error) throw error
  return data as CRMLead | null
}

export async function createLead(lead: {
  store_id: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  source?: string
  stage?: string
  notes?: string
}) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("crm_leads").insert(lead).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create lead")
  return data as CRMLead
}

export async function updateLead(leadId: string, updates: Partial<CRMLead>) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("crm_leads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Lead not found")
  return data as CRMLead
}

export async function updateLeadStage(leadId: string, stage: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("crm_leads")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Lead not found")
  return data as CRMLead
}

export async function deleteLead(leadId: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from("crm_leads").delete().eq("id", leadId)

  if (error) throw error
}

export async function updateLeadPurchaseTotal(leadId: string, amount: number) {
  const supabase = await getSupabaseServer()

  // Get current total
  const { data: lead, error: fetchError } = await supabase
    .from("crm_leads")
    .select("total_purchases")
    .eq("id", leadId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!lead) throw new Error("Lead not found")

  const newTotal = (lead.total_purchases || 0) + amount

  const { data, error } = await supabase
    .from("crm_leads")
    .update({ total_purchases: newTotal })
    .eq("id", leadId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to update lead")
  return data as CRMLead
}

// ==================== CRM Interaction Queries ====================

export async function getInteractionsByLeadId(leadId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("crm_interactions")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as CRMInteraction[]
}

export async function createInteraction(interaction: {
  lead_id: string
  store_id: string
  type: string
  content?: string
  created_by?: string
}) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("crm_interactions").insert(interaction).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create interaction")
  return data as CRMInteraction
}

// ==================== CRM Funnel Stage Queries ====================

export async function getFunnelStagesByStoreId(storeId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("crm_funnel_stages")
    .select("*")
    .eq("store_id", storeId)
    .order("order_index", { ascending: true })

  if (error) throw error
  return data as CRMFunnelStage[]
}

export async function createFunnelStage(stage: {
  store_id: string
  name: string
  color?: string
  order_index: number
}) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("crm_funnel_stages").insert(stage).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create funnel stage")
  return data as CRMFunnelStage
}

export async function updateFunnelStage(stageId: string, updates: Partial<CRMFunnelStage>) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("crm_funnel_stages")
    .update(updates)
    .eq("id", stageId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Funnel stage not found")
  return data as CRMFunnelStage
}

export async function deleteFunnelStage(stageId: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from("crm_funnel_stages").delete().eq("id", stageId)

  if (error) throw error
}

// ==================== Scheduled Report Queries ====================

export async function getScheduledReportsByStoreId(storeId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("scheduled_reports")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as ScheduledReport[]
}

export async function createScheduledReport(report: {
  store_id: string
  report_type: string
  frequency: string
  email: string
}) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("scheduled_reports").insert(report).select().maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Failed to create scheduled report")
  return data as ScheduledReport
}

export async function updateScheduledReport(reportId: string, updates: Partial<ScheduledReport>) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("scheduled_reports")
    .update(updates)
    .eq("id", reportId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Scheduled report not found")
  return data as ScheduledReport
}

export async function deleteScheduledReport(reportId: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from("scheduled_reports").delete().eq("id", reportId)

  if (error) throw error
}
