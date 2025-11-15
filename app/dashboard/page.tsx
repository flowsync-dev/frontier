import { getSupabaseServer } from "@/lib/supabase-server"
import { getCurrentUser } from "@/lib/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Eye, ShoppingCart, TrendingUp, Package, BarChart3 } from "lucide-react"
import { formatNaira } from "@/lib/currency"
import { StatCard } from "@/components/dashboard/stat-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  const supabase = await getSupabaseServer()

  const { data: store } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle()

  if (!store) {
    redirect("/dashboard/settings")
  }

  const { data: products } = await supabase.from("products").select("*").eq("store_id", store.id)

  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  const totalRevenue = sales?.reduce((sum, sale) => sum + Number.parseFloat(sale.total_amount), 0) || 0
  const totalProducts = products?.length || 0
  const totalSales = sales?.length || 0
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const chartData = last7Days.map((date) => {
    const daySales = sales?.filter((s) => s.created_at.startsWith(date)) || []
    const revenue = daySales.reduce((sum, s) => sum + Number.parseFloat(s.total_amount), 0)
    return { date: new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }), revenue }
  })

  const recentSales = (sales || []).slice(0, 5).map((sale) => ({
    id: sale.id,
    buyer_name: sale.buyer_name,
    product_name: sale.product_name,
    total_amount: sale.total_amount,
    created_at: sale.created_at,
    status: sale.status,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">Here's an overview of your store performance</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
        <Link href={`/store/${store.slug}`}>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Eye className="w-4 h-4" />
            View Store
          </Button>
        </Link>
        <Link href="/dashboard/sales">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ShoppingCart className="w-4 h-4" />
            Create Sale
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatNaira(totalRevenue)}
          icon={<TrendingUp className="w-4 h-4" />}
          description={`${totalSales} sales`}
        />
        <StatCard
          title="Total Sales"
          value={totalSales}
          icon={<ShoppingCart className="w-4 h-4" />}
          description="All time"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-4 h-4" />}
          description="Active products"
        />
        <StatCard
          title="Avg Order Value"
          value={formatNaira(avgOrderValue)}
          icon={<BarChart3 className="w-4 h-4" />}
          description="Per transaction"
        />
        <StatCard title="Store Views" value="0" icon={<Eye className="w-4 h-4" />} description="This month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <div>
          <RecentSales sales={recentSales} />
        </div>
      </div>

      {/* Store information card */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Your store details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Store Name</p>
            <p className="font-medium">{store.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Store URL</p>
            <p className="font-medium">frontier.local/{store.slug}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{store.is_published ? "Published" : "Draft"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
