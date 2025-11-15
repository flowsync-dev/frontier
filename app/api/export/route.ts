import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.SUPABASE_SERVICE_ROLE_KEY!,

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { storeId, format, dataType, dateRange } = await request.json()

  try {
    let data: any[] = []

    if (dataType === "products" || dataType === "all") {
      const { data: products } = await supabase.from("products").select("*").eq("store_id", storeId)

      data = [...data, ...(products || [])]
    }

    if (dataType === "sales" || dataType === "all") {
      let query = supabase.from("sales").select("*").eq("store_id", storeId)

      if (dateRange.start) {
        query = query.gte("created_at", dateRange.start)
      }
      if (dateRange.end) {
        query = query.lte("created_at", dateRange.end)
      }

      const { data: sales } = await query

      data = [...data, ...(sales || [])]
    }

    // Convert to CSV format (simple implementation)
    const csv = convertToCSV(data)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="export.${format}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(",")),
  ].join("\n")

  return csv
}
