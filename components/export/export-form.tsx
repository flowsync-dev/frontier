"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Loader2 } from "lucide-react"

interface ExportFormProps {
  storeId: string
}

export function ExportForm({ storeId }: ExportFormProps) {
  const [format, setFormat] = useState<"pdf" | "docx" | "xlsx" | "csv">("csv")
  const [dataType, setDataType] = useState<"products" | "sales" | "all">("all")
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          format,
          dataType,
          dateRange,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `frontier-export-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Your Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            {(["csv", "xlsx", "pdf", "docx"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  format === fmt
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border hover:border-accent"
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Data Type</label>
          <div className="space-y-2">
            {(["products", "sales", "all"] as const).map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50"
              >
                <input
                  type="radio"
                  name="dataType"
                  value={type}
                  checked={dataType === type}
                  onChange={(e) => setDataType(e.target.value as typeof dataType)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground capitalize">{type === "all" ? "All Data" : type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Date Range (Optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
        </div>

        <Button onClick={handleExport} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
