"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatNaira } from "@/lib/currency"

interface SalesVelocityChartProps {
  data: Array<{
    date: string
    sales: number
    revenue: number
  }>
}

export function SalesVelocityChart({ data }: SalesVelocityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Velocity Trend</CardTitle>
        <CardDescription>Daily sales and revenue over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === "Revenue") return formatNaira(value)
                return value
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Sales Count" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
