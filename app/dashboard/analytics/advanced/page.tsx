"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatNaira } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { ProductPerformanceChart } from "@/components/analytics/product-performance-chart"
import { CohortAnalysisTable } from "@/components/analytics/cohort-analysis-table"
import { SalesVelocityChart } from "@/components/analytics/sales-velocity-chart"
import { CustomerSegmentation } from "@/components/analytics/customer-segmentation"

export default function AdvancedAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user?.id).single()
      setStore(storeData)

      // Load products with full details
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: false })

      // Load all sales with product info
      const { data: salesData } = await supabase
        .from("sales")
        .select(`
          *,
          products (name, price)
        `)
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: false })

      setProducts(productsData || [])
      setSales(salesData || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load advanced analytics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate product-level metrics
  const productMetrics = products.map((product) => {
    const productSales = sales.filter((s) => s.product_id === product.id)
    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0)
    const revenue = productSales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
    const avgPrice = productSales.length > 0 ? revenue / totalSold : product.price

    // Calculate sales velocity (sales per day since product creation)
    const daysSinceCreation = Math.max(
      1,
      Math.floor((Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    )
    const velocity = totalSold / daysSinceCreation

    // Stock turnover rate
    const turnoverRate = product.stock > 0 ? (totalSold / (totalSold + product.stock)) * 100 : 100

    return {
      id: product.id,
      name: product.name,
      totalSold,
      revenue,
      avgPrice,
      velocity,
      turnoverRate,
      stock: product.stock,
      isActive: product.is_active,
    }
  })

  // Calculate cohort analysis (customers grouped by first purchase month)
  const customerCohorts = new Map<string, Set<string>>()
  sales.forEach((sale) => {
    const month = new Date(sale.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short" })
    if (!customerCohorts.has(month)) {
      customerCohorts.set(month, new Set())
    }
    customerCohorts.get(month)?.add(sale.customer_email)
  })

  // Customer segmentation by purchase frequency
  const customerPurchases = new Map<string, number>()
  sales.forEach((sale) => {
    const count = customerPurchases.get(sale.customer_email) || 0
    customerPurchases.set(sale.customer_email, count + 1)
  })

  const oneTimeBuyers = Array.from(customerPurchases.values()).filter((count) => count === 1).length
  const repeatBuyers = Array.from(customerPurchases.values()).filter((count) => count > 1 && count <= 3).length
  const loyalBuyers = Array.from(customerPurchases.values()).filter((count) => count > 3).length

  // Sales velocity over time (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  const velocityData = last30Days.map((date) => {
    const daySales = sales.filter((s) => s.created_at.startsWith(date))
    return {
      date: new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
      sales: daySales.length,
      revenue: daySales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0),
    }
  })

  function exportAdvancedAnalytics() {
    const csv = [
      ["Advanced Analytics Report", new Date().toLocaleDateString("en-NG")],
      [],
      ["Product Performance"],
      ["Product", "Total Sold", "Revenue", "Velocity (per day)", "Turnover Rate %", "Stock"],
      ...productMetrics.map((p) => [
        p.name,
        p.totalSold,
        p.revenue,
        p.velocity.toFixed(2),
        p.turnoverRate.toFixed(1),
        p.stock,
      ]),
      [],
      ["Customer Segmentation"],
      ["One-Time Buyers", oneTimeBuyers],
      ["Repeat Buyers (2-3 purchases)", repeatBuyers],
      ["Loyal Buyers (4+ purchases)", loyalBuyers],
      [],
      ["Cohort Analysis"],
      ["Month", "New Customers"],
      ...Array.from(customerCohorts.entries()).map(([month, customers]) => [month, customers.size]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `advanced-analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="text-center py-12">Loading advanced analytics...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/analytics">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep insights into products and customers</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent" onClick={exportAdvancedAnalytics}>
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {productMetrics.sort((a, b) => b.revenue - a.revenue)[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">By revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Turnover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {productMetrics.length > 0
                ? (productMetrics.reduce((sum, p) => sum + p.turnoverRate, 0) / productMetrics.length).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Stock turnover rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loyal Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{loyalBuyers}</div>
            <p className="text-xs text-muted-foreground mt-1">4+ purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {customerPurchases.size > 0
                ? (((repeatBuyers + loyalBuyers) / customerPurchases.size) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Repeat purchase rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance */}
      <ProductPerformanceChart data={productMetrics.slice(0, 10)} />

      {/* Sales Velocity */}
      <SalesVelocityChart data={velocityData} />

      {/* Customer Segmentation */}
      <CustomerSegmentation oneTime={oneTimeBuyers} repeat={repeatBuyers} loyal={loyalBuyers} />

      {/* Cohort Analysis */}
      <CohortAnalysisTable
        cohorts={Array.from(customerCohorts.entries()).map(([month, customers]) => ({
          month,
          newCustomers: customers.size,
        }))}
      />

      {/* Product Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Details</CardTitle>
          <CardDescription>Detailed metrics for all products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-right p-3 font-medium">Units Sold</th>
                  <th className="text-right p-3 font-medium">Revenue</th>
                  <th className="text-right p-3 font-medium">Velocity</th>
                  <th className="text-right p-3 font-medium">Turnover</th>
                  <th className="text-right p-3 font-medium">Stock</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {productMetrics
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-right">{product.totalSold}</td>
                      <td className="p-3 text-right font-medium">{formatNaira(product.revenue)}</td>
                      <td className="p-3 text-right">{product.velocity.toFixed(2)}/day</td>
                      <td className="p-3 text-right">{product.turnoverRate.toFixed(1)}%</td>
                      <td className="p-3 text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
