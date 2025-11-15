"use client"

import { Button } from "@/components/ui/button"

interface DateRangeSelectorProps {
  selectedRange: "today" | "7days" | "30days" | "custom"
  onRangeChange: (range: "today" | "7days" | "30days" | "custom") => void
  customFrom?: string
  customTo?: string
  onCustomChange?: (from: string, to: string) => void
}

export function DateRangeSelector({
  selectedRange,
  onRangeChange,
  customFrom,
  customTo,
  onCustomChange,
}: DateRangeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedRange === "today" ? "default" : "outline"}
          onClick={() => onRangeChange("today")}
          className={selectedRange !== "today" ? "bg-transparent" : ""}
        >
          Today
        </Button>
        <Button
          variant={selectedRange === "7days" ? "default" : "outline"}
          onClick={() => onRangeChange("7days")}
          className={selectedRange !== "7days" ? "bg-transparent" : ""}
        >
          Last 7 Days
        </Button>
        <Button
          variant={selectedRange === "30days" ? "default" : "outline"}
          onClick={() => onRangeChange("30days")}
          className={selectedRange !== "30days" ? "bg-transparent" : ""}
        >
          Last 30 Days
        </Button>
        <Button
          variant={selectedRange === "custom" ? "default" : "outline"}
          onClick={() => onRangeChange("custom")}
          className={selectedRange !== "custom" ? "bg-transparent" : ""}
        >
          Custom
        </Button>
      </div>

      {selectedRange === "custom" && onCustomChange && (
        <div className="flex gap-4">
          <div>
            <label className="text-sm font-medium">From</label>
            <input
              type="date"
              value={customFrom || ""}
              onChange={(e) => onCustomChange(e.target.value, customTo || "")}
              className="px-3 py-2 border border-input rounded-md text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">To</label>
            <input
              type="date"
              value={customTo || ""}
              onChange={(e) => onCustomChange(customFrom || "", e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm mt-1"
            />
          </div>
        </div>
      )}
    </div>
  )
}
