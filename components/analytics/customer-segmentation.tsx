"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CustomerSegmentationProps {
  oneTime: number
  repeat: number
  loyal: number
}

export function CustomerSegmentation({ oneTime, repeat, loyal }: CustomerSegmentationProps) {
  const data = [
    { name: "One-Time Buyers", value: oneTime, color: "#ef4444" },
    { name: "Repeat Buyers", value: repeat, color: "#f59e0b" },
    { name: "Loyal Customers", value: loyal, color: "#10b981" },
  ]

  const total = oneTime + repeat + loyal

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segmentation</CardTitle>
        <CardDescription>Breakdown of customers by purchase frequency</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">One-Time Buyers</span>
                <span className="text-lg font-bold">{oneTime}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${total > 0 ? (oneTime / total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {total > 0 ? ((oneTime / total) * 100).toFixed(1) : 0}% of total customers
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Repeat Buyers</span>
                <span className="text-lg font-bold">{repeat}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${total > 0 ? (repeat / total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {total > 0 ? ((repeat / total) * 100).toFixed(1) : 0}% of total customers
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Loyal Customers</span>
                <span className="text-lg font-bold">{loyal}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${total > 0 ? (loyal / total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {total > 0 ? ((loyal / total) * 100).toFixed(1) : 0}% of total customers
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
