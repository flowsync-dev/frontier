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

  const { storeId, frequency, format, sendEmail } = await request.json()

  // Calculate next send date
  const now = new Date()
  const nextSendAt = new Date(now)
  if (frequency === "weekly") {
    nextSendAt.setDate(nextSendAt.getDate() + 7)
  } else {
    nextSendAt.setMonth(nextSendAt.getMonth() + 1)
  }

  const { error } = await supabase.from("scheduled_reports").insert({
    store_id: storeId,
    frequency,
    format,
    send_email: sendEmail,
    next_send_at: nextSendAt.toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
