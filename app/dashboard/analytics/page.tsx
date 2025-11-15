"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatNaira } from "@/lib/currency"
import { DateRangeSelector } from "@/components/analytics/date-range-selector"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { ProductBreakdown } from "@/components/analytics/product-breakdown"
import { CRMFunnelChart } from "@/components/analytics/crm-funnel-chart"
import { Download, TrendingUp, ShoppingCart, Package, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface Sale {
  id: string
  product_name?: string
  total_amount: number
  created_at: string
  customer_email: string
  products?: { name: string }
}

interface Lead {
  id: string
  stage: string
  created_at: string
}

export default function AnalyticsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"today" | "7days" | "30days" | "custom">("30days")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user?.id).single()

      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select(`
          *,
          products (name)
        `)
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })

      if (salesError) throw salesError

      const { data: leadsData, error: leadsError } = await supabase
        .from("crm_leads")
        .select("*")
        .eq("store_id", store.id)

      if (leadsError) throw leadsError

      setSales(salesData || [])
      setLeads(leadsData || [])
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load analytics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function getDateRange() {
    const now = new Date()
    let from = new Date()

    switch (dateRange) {
      case "today":
        from.setHours(0, 0, 0, 0)
        break
      case "7days":
        from.setDate(from.getDate() - 7)
        break
      case "30days":
        from.setDate(from.getDate() - 30)
        break
      case "custom":
        if (customFrom) from = new Date(customFrom)
        break
    }

    let to = new Date(now)
    if (dateRange === "custom" && customTo) {
      to = new Date(customTo)
      to.setHours(23, 59, 59, 999)
    }

    return { from, to }
  }

  function filterSalesByDate(sales: Sale[]) {
    const { from, to } = getDateRange()
    return sales.filter((sale) => {
      const saleDate = new Date(sale.created_at)
      return saleDate >= from && saleDate <= to
    })
  }

  function filterLeadsByDate(leads: Lead[]) {
    const { from, to } = getDateRange()
    return leads.filter((lead) => {
      const leadDate = new Date(lead.created_at)
      return leadDate >= from && leadDate <= to
    })
  }

  const filteredSales = filterSalesByDate(sales)
  const filteredLeads = filterLeadsByDate(leads)

  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
  const totalSales = filteredSales.length
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
  const uniqueCustomers = new Set(filteredSales.map((s) => s.customer_email)).size

  const totalLeads = filteredLeads.length
  const acquiredLeads = filteredLeads.filter((l) => l.stage === "acquired").length
  const conversingLeads = filteredLeads.filter((l) => l.stage === "conversing").length
  const soldLeads = filteredLeads.filter((l) => l.stage === "sold").length
  const lostLeads = filteredLeads.filter((l) => l.stage === "lost").length
  const conversionRate = totalLeads > 0 ? (soldLeads / totalLeads) * 100 : 0

  const { from, to } = getDateRange()
  const revenueData = []
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    const daySales = filteredSales.filter((s) => s.created_at.startsWith(dateStr))
    const revenue = daySales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
    revenueData.push({
      date: new Date(dateStr).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
      revenue,
    })
  }

  const productMap = new Map<string, { sales: number; revenue: number }>()
  filteredSales.forEach((sale) => {
    const productName = sale.products?.name || "Unknown"
    const current = productMap.get(productName) || { sales: 0, revenue: 0 }
    productMap.set(productName, {
      sales: current.sales + 1,
      revenue: current.revenue + Number.parseFloat(String(sale.total_amount)),
    })
  })

  const productData = Array.from(productMap.entries())
    .map(([name, data]) => ({
      name: name.length > 20 ? name.substring(0, 20) + "..." : name,
      ...data,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const funnelData = [
    { stage: "Acquired", count: acquiredLeads, color: "#10b981" },
    { stage: "Conversing", count: conversingLeads, color: "#3b82f6" },
    { stage: "Sold", count: soldLeads, color: "#8b5cf6" },
    { stage: "Lost", count: lostLeads, color: "#ef4444" },
  ]

  function exportAnalytics() {
    const csv = [
      ["Analytics Report", new Date().toLocaleDateString("en-NG")],
      [],
      ["Sales Metrics"],
      ["Total Revenue", formatNaira(totalRevenue)],
      ["Total Sales", totalSales],
      ["Average Order Value", formatNaira(avgOrderValue)],
      ["Unique Customers", uniqueCustomers],
      [],
      ["CRM Metrics"],
      ["Total Leads", totalLeads],
      ["Acquired", acquiredLeads],
      ["Conversing", conversingLeads],
      ["Sold", soldLeads],
      ["Lost", lostLeads],
      ["Conversion Rate", `${conversionRate.toFixed(1)}%`],
      [],
      ["Daily Revenue"],
      ["Date", "Revenue"],
      ...revenueData.map((d) => [d.date, d.revenue]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <Skeleton className="h-32 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your store performance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/analytics/advanced">
            <Button variant="outline" className="gap-2 bg-transparent">
              Advanced Analytics
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={exportAnalytics}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangeSelector
            selectedRange={dateRange}
            onRangeChange={setDateRange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomChange={(from, to) => {
              setCustomFrom(from)
              setCustomTo(to)
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(avgOrderValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Customers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">CRM Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Acquired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acquiredLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversingLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <RevenueChart data={revenueData} className="w-full" />

      {productData.length > 0 && (
        <div className="grid grid-cols-1 gap-8">
          <ProductBreakdown data={productData} />
        </div>
      )}

      {totalLeads > 0 && (
        <div className="grid grid-cols-1 gap-8">
          <CRMFunnelChart data={funnelData} />
        </div>
      )}
    </div>
  )
}