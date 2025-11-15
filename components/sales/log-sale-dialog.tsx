"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface LogSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function LogSaleDialog({ open, onOpenChange, onSuccess }: LogSaleDialogProps) {
  const [products, setProducts] = useState<any[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadProducts()
    }
  }, [open])

  async function loadProducts() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in",
          variant: "destructive",
        })
        return
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (storeError) throw storeError
      if (!store) {
        toast({
          title: "Error",
          description: "Store not found",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase.from("products").select("*").eq("store_id", store.id).eq("is_active", true)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("[v0] Load products error:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {}

    if (!selectedProduct) {
      newErrors.selectedProduct = "Please select a product"
    }

    if (quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1"
    }

    // Check stock availability
    const product = products.find((p) => p.id === selectedProduct)
    if (product && quantity > product.stock) {
      newErrors.quantity = `Only ${product.stock} units available in stock`
    }

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required"
    }

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = "Invalid email format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleClose() {
    setCustomerName("")
    setCustomerEmail("")
    setSelectedProduct("")
    setQuantity(1)
    setErrors({})
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      if (!user) throw new Error("You must be signed in")

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (storeError) throw storeError
      if (!store) throw new Error("Store not found")

      const product = products.find((p) => p.id === selectedProduct)
      if (!product) throw new Error("Product not found")

      const { data: currentProduct, error: stockCheckError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", product.id)
        .maybeSingle()

      if (stockCheckError) throw stockCheckError
      if (!currentProduct) throw new Error("Product not found")
      if (currentProduct.stock < quantity) {
        throw new Error(`Insufficient stock. Only ${currentProduct.stock} units available.`)
      }

      const totalAmount = product.price * quantity
      console.log({
        store_id: store.id,
        product_id: product.id,
        customer_name: customerName,
        customer_email: customerEmail || null,
        quantity,
        total_amount: totalAmount,
        status: "completed",
      })

      const { error: saleError } = await supabase.from("sales").insert({
        store_id: store.id,
        product_id: product.id,
        customer_name: customerName,
        customer_email: customerEmail || null,
        quantity,
        total_amount: totalAmount,
        status: "completed",
      })

      if (saleError) throw saleError

      // Update product stock
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: currentProduct.stock - quantity })
        .eq("id", product.id)

      if (stockError) throw stockError

      toast({
        title: "Success",
        description: "Sale logged successfully",
      })

      handleClose()
      onSuccess()
    } catch (error) {
      console.error("[v0] Log sale error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log sale",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedProductData = products.find((p) => p.id === selectedProduct)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Manual Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {products.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No active products found. Please add products first.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="product" className="text-sm font-medium">
              Product *
            </label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value)
                if (errors.selectedProduct) setErrors({ ...errors, selectedProduct: "" })
              }}
              required
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.selectedProduct ? "border-red-500" : "border-input"}`}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} disabled={product.stock === 0}>
                  {product.name} - ₦{product.price.toLocaleString()} ({product.stock} in stock)
                </option>
              ))}
            </select>
            {errors.selectedProduct && <p className="text-xs text-red-500">{errors.selectedProduct}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity *
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProductData?.stock || 999}
              value={quantity}
              onChange={(e) => {
                setQuantity(Number.parseInt(e.target.value) || 1)
                if (errors.quantity) setErrors({ ...errors, quantity: "" })
              }}
              required
              className={errors.quantity ? "border-red-500" : ""}
            />
            {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
            {selectedProductData && (
              <p className="text-xs text-muted-foreground">{selectedProductData.stock} units available</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="customer-name" className="text-sm font-medium">
              Customer Name *
            </label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value)
                if (errors.customerName) setErrors({ ...errors, customerName: "" })
              }}
              required
              placeholder="John Doe"
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="customer-email" className="text-sm font-medium">
              Customer Email
            </label>
            <Input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value)
                if (errors.customerEmail) setErrors({ ...errors, customerEmail: "" })
              }}
              placeholder="john@example.com"
              className={errors.customerEmail ? "border-red-500" : ""}
            />
            {errors.customerEmail && <p className="text-xs text-red-500">{errors.customerEmail}</p>}
          </div>

          {selectedProduct && selectedProductData && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold">₦{(selectedProductData.price * quantity).toLocaleString()}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={saving || products.length === 0}>
              {saving ? "Logging..." : "Log Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
