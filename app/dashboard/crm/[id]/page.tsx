"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"
import { ArrowLeft, Mail, Phone, MessageSquare, ShoppingBag, TrendingUp, Calendar } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  stage: string
  total_purchases: number
  created_at: string
  notes?: string
  store_id: string
}

interface FunnelStage {
  id: string
  name: string
  color: string
}

interface Sale {
  id: string
  total_amount: number
  created_at: string
  product_name?: string
}

interface Interaction {
  id: string
  interaction_type: string
  notes?: string
  created_at: string
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [lead, setLead] = useState<Lead | null>(null)
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user?.id).single()

      const { data: leadData, error: leadError } = await supabase
        .from("crm_leads")
        .select("*")
        .eq("id", resolvedParams.id)
        .eq("store_id", store.id)
        .single()

      if (leadError) throw leadError
      setLead(leadData)

      const { data: stagesData } = await supabase
        .from("crm_funnel_stages")
        .select("*")
        .eq("store_id", store.id)
        .order("order_index")

      setStages(stagesData || [])

      const { data: salesData } = await supabase
        .from("sales")
        .select("id, total_amount, created_at, product_name")
        .eq("store_id", store.id)
        .or(`customer_email.eq.${leadData.email},customer_phone.eq.${leadData.phone}`)
        .order("created_at", { ascending: false })

      setSales(salesData || [])

      const { data: interactionsData } = await supabase
        .from("crm_interactions")
        .select("*")
        .eq("lead_id", resolvedParams.id)
        .order("created_at", { ascending: false })

      setInteractions(interactionsData || [])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load lead details",
        variant: "destructive",
      })
      router.push("/dashboard/crm")
    } finally {
      setLoading(false)
    }
  }

  async function saveLead() {
    if (!lead) return

    setSaving(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("crm_leads")
        .update({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          whatsapp: lead.whatsapp,
          stage: lead.stage,
          notes: lead.notes,
        })
        .eq("id", lead.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Lead updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update lead",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0
  const lastPurchase = sales.length > 0 ? new Date(sales[0].created_at) : null

  const salesByMonth = sales.reduce((acc: Record<string, number>, sale) => {
    const month = new Date(sale.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" })
    acc[month] = (acc[month] || 0) + Number.parseFloat(String(sale.total_amount))
    return acc
  }, {})

  const chartData = Object.entries(salesByMonth).map(([month, revenue]) => ({
    month,
    revenue,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground">Lead Details & Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(avgOrderValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Purchase</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastPurchase ? lastPurchase.toLocaleDateString("en-NG") : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-3" />
                <Input
                  id="email"
                  type="email"
                  value={lead.email || ""}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="flex gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-3" />
                <Input
                  id="phone"
                  value={lead.phone || ""}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="flex gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-3" />
                <Input
                  id="whatsapp"
                  value={lead.whatsapp || ""}
                  onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select value={lead.stage} onValueChange={(value) => setLead({ ...lead, stage: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.name.toLowerCase()}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={lead.notes || ""}
                onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                rows={4}
              />
            </div>

            <Button onClick={saveLead} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNaira(value as number)} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">{sale.product_name || "Order"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString("en-NG")}
                        </p>
                      </div>
                      <p className="font-semibold">{formatNaira(sale.total_amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}