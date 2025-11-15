"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { ProductCard } from "@/components/storefront/product-card"
import { StoreFooter } from "@/components/storefront/store-footer"
import { useToast } from "@/hooks/use-toast"
import { getLayoutColumns } from "@/lib/store-theme"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url?: string
}

interface Store {
  name: string
  description: string
  email?: string
  phone?: string
  layout_style?: string
  primary_color?: string
  secondary_color?: string
  font_heading?: string
  font_body?: string
  show_banner?: boolean
  banner_url?: string
  card_style?: string
  button_style?: string
  accent_color?: string
}

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadStoreAndProducts()
  }, [slug])

  async function loadStoreAndProducts() {
    try {
      const supabase = getSupabaseClient()

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single()

      if (storeError) throw new Error("Store not found")

      setStore(storeData)

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeData.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (productsError) throw productsError

      setProducts(productsData || [])
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load store",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    })
  }

  if (loading) {
    return <div className="text-center py-12">Loading store...</div>
  }

  if (!store) {
    return <div className="text-center py-12">Store not found</div>
  }

  const layoutColumns = getLayoutColumns(store.layout_style || "grid-3")
  const primaryColor = store.primary_color || "#6366f1"
  const secondaryColor = store.secondary_color || "#8b5cf6"
  const fontHeading = store.font_heading || "Inter"
  const fontBody = store.font_body || "Inter"
  const showBanner = store.show_banner ?? true

  return (
    <>
      <div className="space-y-12">
        {/* Store Banner */}
        {showBanner && store.banner_url && (
          <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden">
            <img src={store.banner_url || "/placeholder.svg"} alt={store.name} className="w-full h-full object-cover" />
          </div>
        )}
        {showBanner && !store.banner_url && (
          <div
            className="w-full h-48 md:h-64 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          />
        )}

        {/* Store Header */}
        <div className="text-center space-y-4 py-8">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: fontHeading, color: primaryColor }}
          >
            {store.name}
          </h1>
          {store.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty" style={{ fontFamily: fontBody }}>
              {store.description}
            </p>
          )}
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: fontHeading }}>
            Featured Products
          </h2>
          {products.length > 0 ? (
            <div className={`grid ${layoutColumns} gap-6`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  stock={product.stock}
                  imageUrl={product.image_url}
                  storeSlug={slug}
                  onAddToCart={() => addToCart(product)}
                  theme={{
                    cardStyle: store.card_style || "elevated",
                    buttonStyle: store.button_style || "rounded",
                    accentColor: store.accent_color || "#ec4899",
                    fontHeading,
                    fontBody,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No products available yet</p>
            </div>
          )}
        </div>
      </div>

      <StoreFooter storeName={store.name} email={store.email} phone={store.phone} description={store.description} />
    </>
  )
}
