"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertTriangle } from "lucide-react"

interface ProfitSummaryProps {
  totalProfit: number
  lowStockProducts: number
}

export function ProfitSummary({ totalProfit, lowStockProducts }: ProfitSummaryProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">₦{totalProfit.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Based on cost and selling prices</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{lowStockProducts}</div>
          <p className="text-xs text-muted-foreground">Products below threshold</p>
        </CardContent>
      </Card>
    </div>
  )
}
