"use client"

import { ExportForm } from "@/components/export/export-form"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth-actions"
import { createBrowserClient } from "@supabase/ssr"

export default function ExportsPage() {
  const [storeId, setStoreId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStore = async () => {
      const user = await getCurrentUser()
      if (user) {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,

          process.env.SUPABASE_SERVICE_ROLE_KEY!,

          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data } = await supabase.from("stores").select("id").eq("owner_id", user.id).single()

        if (data) {
          setStoreId(data.id)
        }
      }
      setIsLoading(false)
    }

    fetchStore()
  }, [])

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Export Hub</h1>
        <p className="text-muted-foreground mt-2">Export your data in multiple formats for analysis and backup</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <ExportForm storeId={storeId} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Export Options</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-medium text-foreground mb-1">CSV</h3>
              <p className="text-sm text-muted-foreground">Best for spreadsheets and data analysis</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-medium text-foreground mb-1">XLSX</h3>
              <p className="text-sm text-muted-foreground">Excel format with formatting and formulas</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-medium text-foreground mb-1">PDF</h3>
              <p className="text-sm text-muted-foreground">Professional reports ready to share</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-medium text-foreground mb-1">DOCX</h3>
              <p className="text-sm text-muted-foreground">Word documents for editing and customization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
