"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

interface StoreCardProps {
  id: string
  name: string
  slug: string
  description: string
  logoUrl?: string
  productCount: number
}

export function StoreCard({ id, name, slug, description, logoUrl, productCount }: StoreCardProps) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
      {logoUrl && (
        <img src={logoUrl || "/placeholder.svg"} alt={name} className="w-16 h-16 rounded-lg mb-4 object-cover" />
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4" />
          <span>{productCount} products</span>
        </div>
      </div>

      <Link href={`/store/${slug}`}>
        <Button className="w-full">Visit Store</Button>
      </Link>
    </div>
  )
}
