"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Mail, FileText } from "lucide-react"

interface ReportSchedulerProps {
  storeId: string
}

export function ReportScheduler({ storeId }: ReportSchedulerProps) {
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly")
  const [format, setFormat] = useState<"pdf" | "docx" | "xlsx" | "csv">("pdf")
  const [sendEmail, setSendEmail] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSchedule = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/reports/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          frequency,
          format,
          sendEmail,
        }),
      })

      if (response.ok) {
        alert("Report scheduled successfully!")
      }
    } catch (error) {
      console.error("Error scheduling report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Automated Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Frequency</label>
          <div className="flex gap-3">
            {(["weekly", "monthly"] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  frequency === freq
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border hover:border-accent"
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            {(["pdf", "docx", "xlsx", "csv"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  format === fmt
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border hover:border-accent"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <input
            type="checkbox"
            id="sendEmail"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="sendEmail" className="text-sm text-foreground cursor-pointer flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send report to my email
          </label>
        </div>

        <Button onClick={handleSchedule} disabled={isLoading} className="w-full">
          {isLoading ? "Scheduling..." : "Schedule Report"}
        </Button>
      </CardContent>
    </Card>
  )
}
