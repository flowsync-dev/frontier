"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CRMFunnelChartProps {
  data: Array<{
    stage: string
    count: number
    color: string
  }>
}

export function CRMFunnelChart({ data }: CRMFunnelChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM Lead Funnel</CardTitle>
        <CardDescription>Lead distribution across funnel stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
