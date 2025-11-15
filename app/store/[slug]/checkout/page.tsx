"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase-client"
import { formatNaira } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { toast } = useToast()

  const [cart, setCart] = useState<CartItem[]>([])
  const [store, setStore] = useState<any>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const cartData = JSON.parse(localStorage.getItem("cart") || "[]")
      setCart(cartData)

      const supabase = getSupabaseClient()
      const { data: storeData, error } = await supabase.from("stores").select("*").eq("slug", slug).maybeSingle()

      if (error) throw error
      if (!storeData) throw new Error("Store not found")
      setStore(storeData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load checkout data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {}

    if (!customerName.trim()) {
      newErrors.customerName = "Name is required"
    }

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = "Invalid email format"
    }

    if (!customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required"
    } else if (!/^(\+234|0)[0-9]{10}$/.test(customerPhone.replace(/\s/g, ""))) {
      newErrors.customerPhone = "Invalid Nigerian phone number"
    }

    if (!customerAddress.trim()) {
      newErrors.customerAddress = "Delivery address is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      const supabase = getSupabaseClient()

      if (!store.whatsapp_number) {
        toast({
          title: "Configuration Error",
          description: "Store WhatsApp number not configured. Please contact the store owner.",
          variant: "destructive",
        })
        setProcessing(false)
        return
      }

      let leadData = null

      if (customerEmail || customerPhone) {
        const { data: existingLead, error: leadError } = await supabase
          .from("crm_leads")
          .select("*")
          .eq("store_id", store.id)
          .or(`email.eq.${customerEmail || ""},phone.eq.${customerPhone || ""}`)
          .maybeSingle()

        if (leadError) {
          console.error("[v0] Lead lookup error:", leadError)
        }

        if (existingLead) {
          leadData = existingLead
          // Update existing lead with latest info
          await supabase
            .from("crm_leads")
            .update({
              name: customerName,
              email: customerEmail || existingLead.email,
              phone: customerPhone || existingLead.phone,
              whatsapp: customerPhone || existingLead.whatsapp,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingLead.id)
        }
      }

      // Create new lead if doesn't exist, categorized as "unidentified"
      if (!leadData) {
        const { data: newLead, error: createLeadError } = await supabase
          .from("crm_leads")
          .insert({
            store_id: store.id,
            name: customerName || "Unknown Customer",
            email: customerEmail || null,
            phone: customerPhone || null,
            whatsapp: customerPhone || null,
            stage: "unidentified",
            source: "checkout",
            notes: `Auto-created from checkout. Address: ${customerAddress}`,
          })
          .select()
          .maybeSingle()

        if (createLeadError) {
          console.error("[v0] Lead creation error:", createLeadError)
        } else {
          leadData = newLead
        }
      }

      const salesResults = []
      for (const item of cart) {
        // Check stock availability first
        const { data: product, error: stockError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .maybeSingle()

        if (stockError || !product) {
          throw new Error(`Product ${item.name} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Only ${product.stock} available.`)
        }

        // Create sale and update stock atomically
        const { data: sale, error: saleError } = await supabase
          .from("sales")
          .insert({
            store_id: store.id,
            product_id: item.id,
            customer_email: customerEmail,
            customer_name: customerName,
            quantity: item.quantity,
            total_amount: item.price * item.quantity,
            status: "pending",
            lead_id: leadData?.id || null,
          })
          .select()
          .maybeSingle()

        if (saleError) throw saleError

        // Update stock
        const { error: updateStockError } = await supabase
          .from("products")
          .update({ stock: product.stock - item.quantity })
          .eq("id", item.id)

        if (updateStockError) throw updateStockError

        salesResults.push(sale)
      }

      // Clear cart only after successful order
      localStorage.removeItem("cart")

      // Redirect to WhatsApp
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const orderDetails = cart.map((item) => `${item.name} x${item.quantity}`).join(", ")
      const message = encodeURIComponent(
        `Hello! I just placed an order on ${store.name}.\n\nOrder Details:\n${orderDetails}\n\nTotal: ${formatNaira(total)}\n\nName: ${customerName}\nPhone: ${customerPhone}\nAddress: ${customerAddress}`,
      )
      const whatsappUrl = `https://wa.me/${store.whatsapp_number.replace(/[^0-9]/g, "")}?text=${message}`
      window.location.href = whatsappUrl
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
      })
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading checkout...</div>
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button onClick={() => router.push(`/store/${slug}`)}>Continue Shopping</Button>
      </div>
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground mt-2">Complete your order details</p>
      </div>

      {!store?.whatsapp_number && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Store WhatsApp number is not configured. Please contact the store owner to complete your order.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleCheckout} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </label>
              <Input
                id="name"
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
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
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

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value)
                  if (errors.customerPhone) setErrors({ ...errors, customerPhone: "" })
                }}
                required
                placeholder="+234 XXX XXX XXXX"
                className={errors.customerPhone ? "border-red-500" : ""}
              />
              {errors.customerPhone && <p className="text-xs text-red-500">{errors.customerPhone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Delivery Address *
              </label>
              <textarea
                id="address"
                value={customerAddress}
                onChange={(e) => {
                  setCustomerAddress(e.target.value)
                  if (errors.customerAddress) setErrors({ ...errors, customerAddress: "" })
                }}
                required
                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.customerAddress ? "border-red-500" : "border-input"}`}
                rows={3}
                placeholder="Enter your delivery address"
              />
              {errors.customerAddress && <p className="text-xs text-red-500">{errors.customerAddress}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">{formatNaira(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={processing || !store?.whatsapp_number} className="w-full gap-2" size="lg">
          {processing ? (
            "Processing..."
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              Complete Order via WhatsApp
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You will be redirected to WhatsApp to confirm your order with {store?.name}
        </p>
      </form>
    </div>
  )
}
