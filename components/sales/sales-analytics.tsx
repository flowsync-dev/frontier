import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNaira } from "@/lib/currency"
import { TrendingUp, ShoppingCart, Package, Clock } from "lucide-react"

interface SalesAnalyticsProps {
  totalRevenue: number
  totalSales: number
  avgOrderValue: number
  mostSoldProduct?: string
  lastSaleTime?: string
}

export function SalesAnalytics({
  totalRevenue,
  totalSales,
  avgOrderValue,
  mostSoldProduct,
  lastSaleTime,
}: SalesAnalyticsProps) {
  return (
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
          <p className="text-xs text-muted-foreground mt-1">{totalSales} sales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(avgOrderValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Sold</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{mostSoldProduct || "-"}</div>
          <p className="text-xs text-muted-foreground mt-1">Top product</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Sale</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sm">{lastSaleTime || "-"}</div>
          <p className="text-xs text-muted-foreground mt-1">Most recent</p>
        </CardContent>
      </Card>
    </div>
  )
}
