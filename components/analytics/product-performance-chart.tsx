"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatNaira } from "@/lib/currency"

interface ProductPerformanceChartProps {
  data: Array<{
    name: string
    totalSold: number
    revenue: number
    velocity: number
  }>
}

export function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance Comparison</CardTitle>
        <CardDescription>Top 10 products by units sold and revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === "revenue") return formatNaira(value)
                return value
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="totalSold" fill="#3b82f6" name="Units Sold" />
            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (₦)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
