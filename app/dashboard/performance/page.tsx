"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNaira } from "@/lib/currency"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart } from "recharts"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface PerformanceMetric {
  label: string
  value: string | number
  change: number
  icon: React.ElementType
  trend: "up" | "down"
}

export default function PerformancePage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([])
  const [productsData, setProductsData] = useState<Array<{ name: string; sales: number }>>([])
  const [conversionRate, setConversionRate] = useState(0)
  const [avgOrderValue, setAvgOrderValue] = useState(0)
  const [repeatCustomerRate, setRepeatCustomerRate] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    loadPerformanceData()
  }, [])

  async function loadPerformanceData() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user?.id).single()

      const { data: allSales } = await supabase
        .from("sales")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })

      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      const currentMonthSales = allSales?.filter((s) => new Date(s.created_at) >= currentMonthStart) || []
      const lastMonthSales =
        allSales?.filter((s) => new Date(s.created_at) >= lastMonthStart && new Date(s.created_at) <= lastMonthEnd) ||
        []

      const currentRevenue = currentMonthSales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
      const lastRevenue = lastMonthSales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
      const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0

      const { data: products } = await supabase.from("products").select("*").eq("store_id", store.id)

      const activeProducts = products?.filter((p) => p.is_active).length || 0
      const totalProducts = products?.length || 0
      const productsChange = totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0

      const { data: leads } = await supabase.from("crm_leads").select("*").eq("store_id", store.id)

      const totalLeads = leads?.length || 0
      const soldLeads = leads?.filter((l) => l.stage === "sold").length || 0
      const conversionRate = totalLeads > 0 ? (soldLeads / totalLeads) * 100 : 0

      const totalOrders = currentMonthSales.length
      const lastMonthOrders = lastMonthSales.length
      const ordersChange = lastMonthOrders > 0 ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0

      const uniqueCustomers = new Set(allSales?.map((s) => s.customer_email)).size
      const avgOrderValue = currentMonthSales.length > 0 ? currentRevenue / currentMonthSales.length : 0

      const customerPurchases = new Map<string, number>()
      allSales?.forEach((sale) => {
        const count = customerPurchases.get(sale.customer_email) || 0
        customerPurchases.set(sale.customer_email, count + 1)
      })
      const repeatCustomers = Array.from(customerPurchases.values()).filter((count) => count > 1).length
      const repeatCustomerRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0

      setMetrics([
        {
          label: "Monthly Revenue",
          value: formatNaira(currentRevenue),
          change: revenueChange,
          icon: DollarSign,
          trend: revenueChange >= 0 ? "up" : "down",
        },
        {
          label: "Total Orders",
          value: totalOrders,
          change: ordersChange,
          icon: ShoppingCart,
          trend: ordersChange >= 0 ? "up" : "down",
        },
        {
          label: "Unique Customers",
          value: uniqueCustomers,
          change: 0,
          icon: Users,
          trend: "up",
        },
        {
          label: "Active Products",
          value: activeProducts,
          change: productsChange,
          icon: Package,
          trend: "up",
        },
      ])

      const monthlyRevenue = []
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const monthSales =
          allSales?.filter((s) => new Date(s.created_at) >= monthStart && new Date(s.created_at) <= monthEnd) || []
        const revenue = monthSales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
        monthlyRevenue.push({
          month: monthStart.toLocaleDateString("en-NG", { month: "short" }),
          revenue,
        })
      }

      const productSales = new Map<string, number>()
      allSales?.forEach((sale) => {
        const count = productSales.get(sale.product_name || "Unknown") || 0
        productSales.set(sale.product_name || "Unknown", count + 1)
      })
      const topProducts = Array.from(productSales.entries())
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)

      setRevenueData(monthlyRevenue)
      setProductsData(topProducts)
      setConversionRate(conversionRate)
      setAvgOrderValue(avgOrderValue)
      setRepeatCustomerRate(repeatCustomerRate)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Store Performance</h1>
        <p className="text-muted-foreground mt-2">Monitor your store's key performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <metric.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change !== 0 && (
                <div
                  className={`flex items-center gap-1 text-sm mt-1 ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(metric.change).toFixed(1)}%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{conversionRate.toFixed(1)}%</div>
            <Progress value={conversionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Leads converted to sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatNaira(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repeat Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{repeatCustomerRate.toFixed(1)}%</div>
            <Progress value={repeatCustomerRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Customer retention rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatNaira(value as number)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Revenue Target</span>
              <span className="font-medium">{formatNaira(1000000)}</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Customer Acquisition Goal</span>
              <span className="font-medium">150 customers</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Products Sold Target</span>
              <span className="font-medium">200 units</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 