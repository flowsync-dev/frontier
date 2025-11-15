"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const id = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadProduct() {
      try {
        const supabase = getSupabaseClient()

        // Get store
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single()

        if (storeError) throw new Error("Store not found")
        setStore(storeData)

        // Get product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("store_id", storeData.id)
          .eq("is_active", true)
          .single()

        if (productError) throw new Error("Product not found")
        setProduct(productData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug, id])

  function handleAddToCart() {
    if (!product) return

    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Check if product already in cart
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        storeId: store.id,
        storeSlug: slug,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    router.push(`/store/${slug}/cart`)
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error || "Product not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {(product.image_urls?.length > 0 || product.image_url) && (
          <>
            <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.image_urls?.[selectedImage] || product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.image_urls?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
          <p className="text-muted-foreground mt-2">{product.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">${Number.parseFloat(product.price).toFixed(2)}</CardTitle>
            <CardDescription>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.stock > 0 && (
              <>
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  />
                </div>
                <Button onClick={handleAddToCart} className="w-full" size="lg">
                  Add to Cart
                </Button>
              </>
            )}
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
