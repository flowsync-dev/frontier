"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { StoreCard } from "@/components/directory/store-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Store {
  id: string
  name: string
  slug: string
  description: string
  logo_url?: string
  product_count?: number
}

export default function DirectoryPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStores = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,

        process.env.SUPABASE_SERVICE_ROLE_KEY!,

        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

      )

      const { data } = await supabase
        .from("stores")
        .select(
          `
          id,
          name,
          slug,
          description,
          logo_url,
          products(count)
        `,
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (data) {
        const formattedStores = data.map((store: any) => ({
          ...store,
          product_count: store.products?.[0]?.count || 0,
        }))
        setStores(formattedStores)
        setFilteredStores(formattedStores)
      }
      setIsLoading(false)
    }

    fetchStores()
  }, [])

  useEffect(() => {
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredStores(filtered)
  }, [searchQuery, stores])

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Frontier Directory</h1>
          <p className="text-lg text-muted-foreground">Discover amazing stores from Nigerian entrepreneurs</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading stores...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stores found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                id={store.id}
                name={store.name}
                slug={store.slug}
                description={store.description || ""}
                logoUrl={store.logo_url}
                productCount={store.product_count || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
