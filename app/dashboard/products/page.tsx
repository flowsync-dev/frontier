"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Trash2, Eye, EyeOff } from "lucide-react"
import { formatNaira } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  is_active: boolean
  category?: string
  image_url?: string
  image_urls?: string[]
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, filterStatus])

  async function loadProducts() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to view products",
          variant: "destructive",
        })
        return
      }

      const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).maybeSingle()

      if (!store) {
        toast({
          title: "No Store Found",
          description: "Please create a store first",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function filterProducts() {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => (filterStatus === "active" ? p.is_active : !p.is_active))
    }

    setFilteredProducts(filtered)
  }

  async function toggleProductStatus(productId: string, currentStatus: boolean) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId)

      if (error) throw error

      setProducts(products.map((p) => (p.id === productId ? { ...p, is_active: !currentStatus } : p)))
      toast({
        title: "Success",
        description: `Product ${!currentStatus ? "activated" : "deactivated"}`,
      })
    } catch (err) {   
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update product",
        variant: "destructive",
      })
    }
  }

  async function deleteProducts(productIds: string[]) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("products").delete().in("id", productIds)

      if (error) throw error

      setProducts(products.filter((p) => !productIds.includes(p.id)))
      setSelectedProducts(new Set())
      toast({
        title: "Success",
        description: `${productIds.length} product(s) deleted`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete products",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your store's products</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>{filteredProducts.length} products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="gap-2"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {selectedProducts.size > 0 && (
              <Button variant="destructive" size="sm" onClick={() => deleteProducts(Array.from(selectedProducts))}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedProducts.size})
              </Button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(new Set(filteredProducts.map((p) => p.id)))
                        } else {
                          setSelectedProducts(new Set())
                        }
                      }}
                      className="rounded border-input"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedProducts)
                          if (e.target.checked) {
                            newSelected.add(product.id)
                          } else {
                            newSelected.delete(product.id)
                          }
                          setSelectedProducts(newSelected)
                        }}
                        className="rounded border-input"
                      />
                    </TableCell>
                    <TableCell className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded border border-border"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.category || "-"}</TableCell>
                    <TableCell>{formatNaira(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                      >
                        {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Link href={`/dashboard/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No products found</p>
              <Link href="/dashboard/products/new">
                <Button>Create your first product</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
