"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CohortAnalysisTableProps {
  cohorts: Array<{
    month: string
    newCustomers: number
  }>
}

export function CohortAnalysisTable({ cohorts }: CohortAnalysisTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Acquisition Cohorts</CardTitle>
        <CardDescription>New customers acquired each month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Month</th>
                <th className="text-right p-3 font-medium">New Customers</th>
                <th className="text-right p-3 font-medium">Growth</th>
              </tr>
            </thead>
            <tbody>
              {cohorts
                .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
                .map((cohort, index, arr) => {
                  const prevCohort = index > 0 ? arr[index - 1] : null
                  const growth = prevCohort
                    ? ((cohort.newCustomers - prevCohort.newCustomers) / prevCohort.newCustomers) * 100
                    : 0

                  return (
                    <tr key={cohort.month} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 font-medium">{cohort.month}</td>
                      <td className="p-3 text-right text-lg font-bold">{cohort.newCustomers}</td>
                      <td className="p-3 text-right">
                        {index > 0 && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              growth > 0
                                ? "bg-green-100 text-green-800"
                                : growth < 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {growth > 0 ? "+" : ""}
                            {growth.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
