"use client"

import { AlertCircle, TrendingUp } from "lucide-react"

interface ProfitBadgeProps {
  costPrice: number
  sellingPrice: number
  stock: number
  lowStockLevel: number
}

export function ProfitBadge({ costPrice, sellingPrice, stock, lowStockLevel }: ProfitBadgeProps) {
  const profitPerUnit = sellingPrice - costPrice
  const profitMargin = costPrice > 0 ? ((profitPerUnit / sellingPrice) * 100).toFixed(1) : 0
  const isLowStock = stock <= lowStockLevel

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-foreground">
          ₦{profitPerUnit.toFixed(2)} profit per unit ({profitMargin}%)
        </span>
      </div>
      {isLowStock && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent/10 border border-accent/20">
          <AlertCircle className="w-4 h-4 text-accent" />
          <span className="text-sm text-accent font-medium">Low stock: {stock} remaining</span>
        </div>
      )}
    </div>
  )
}
