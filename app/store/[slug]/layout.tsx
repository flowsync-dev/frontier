import type React from "react"
import { getSupabaseServer } from "@/lib/supabase-server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Home, Store } from "lucide-react"

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await getSupabaseServer()

  console.log("[v0] Fetching store with slug:", slug)

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  console.log("[v0] Store fetch result:", { store, error })

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <Store className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Store Not Found</h1>
            <p className="text-muted-foreground text-lg">
              The store you're looking for doesn't exist or hasn't been published yet.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="default" className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Are you the store owner?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
                Sign in to your dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const logoPosition = store.logo_position || "center"
  const primaryColor = store.primary_color || "#6366f1"
  const buttonStyle = store.button_style || "rounded"

  const justifyClass =
    logoPosition === "left"
      ? "justify-between"
      : logoPosition === "right"
        ? "justify-between flex-row-reverse"
        : "justify-center"

  const buttonRadius =
    buttonStyle === "rounded" ? "rounded-md" : buttonStyle === "sharp" ? "rounded-none" : "rounded-full"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav
        className="border-b border-border bg-card sticky top-0 z-50 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4 ${justifyClass}`}>
          <Link
            href={`/store/${slug}`}
            className="text-2xl font-bold text-white"
            style={{ fontFamily: store.font_heading || "Inter" }}
          >
            {store.name}
          </Link>
          {logoPosition !== "center" && (
            <Link href={`/store/${slug}/cart`}>
              <Button
                variant="outline"
                className={`gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 ${buttonRadius}`}
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">{children}</main>
    </div>
  )
}
