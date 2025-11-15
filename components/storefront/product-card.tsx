"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatNaira } from "@/lib/currency"
import { ShoppingCart } from "lucide-react"
import { getCardClassName, getButtonClassName } from "@/lib/store-theme"

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl?: string
  storeSlug: string
  onAddToCart?: () => void
  theme?: {
    cardStyle: string
    buttonStyle: string
    accentColor: string
    fontHeading: string
    fontBody: string
  }
}

export function ProductCard({
  id,
  name,
  description,
  price,
  stock,
  imageUrl,
  storeSlug,
  onAddToCart,
  theme,
}: ProductCardProps) {
  const cardClass = theme ? getCardClassName(theme.cardStyle) : "shadow-md hover:shadow-lg"
  const buttonClass = theme ? getButtonClassName(theme.buttonStyle) : "rounded-md"

  return (
    <Card className={`overflow-hidden transition-all duration-300 flex flex-col h-full ${cardClass}`}>
      {imageUrl && (
        <div className="w-full h-48 bg-muted overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg?height=192&width=400&query=product"}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2" style={{ fontFamily: theme?.fontHeading }}>
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1" style={{ fontFamily: theme?.fontBody }}>
          {description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold" style={{ color: theme?.accentColor || "#ec4899" }}>
              {formatNaira(price)}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {stock > 0 ? `${stock} left` : "Out of stock"}
            </span>
          </div>

          <div className="flex gap-2">
            <Link href={`/store/${storeSlug}/product/${id}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                View Details
              </Button>
            </Link>
            <Button
              size="sm"
              disabled={stock === 0}
              onClick={onAddToCart}
              className={`gap-2 ${buttonClass}`}
              style={{ backgroundColor: theme?.accentColor || "#ec4899" }}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
