"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { useToast } from "@/hooks/use-toast"

interface AddLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddLeadDialog({ open, onOpenChange, onSuccess }: AddLeadDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  function validateForm() {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format"
    }

    if (phone && !/^(\+234|0)[0-9]{10}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid Nigerian phone number"
    }

    if (whatsapp && !/^(\+234|0)[0-9]{10}$/.test(whatsapp.replace(/\s/g, ""))) {
      newErrors.whatsapp = "Invalid WhatsApp number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleClose() {
    setName("")
    setEmail("")
    setPhone("")
    setWhatsapp("")
    setNotes("")
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

      if (!user) {
        throw new Error("You must be signed in to add leads")
      }

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (storeError) throw storeError
      if (!storeData) throw new Error("Store not found")

      const { error } = await supabase.from("crm_leads").insert({
        store_id: storeData.id,
        name,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        notes: notes || null,
        stage: "acquired",
        source: "manual",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Lead added successfully",
      })

      handleClose()
      onSuccess()
    } catch (error) {
      console.error("[v0] Add lead error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add lead",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              required
              placeholder="John Doe"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: "" })
              }}
              placeholder="john@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (errors.phone) setErrors({ ...errors, phone: "" })
              }}
              placeholder="+234 XXX XXX XXXX"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp
            </label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value)
                if (errors.whatsapp) setErrors({ ...errors, whatsapp: "" })
              }}
              placeholder="+234 XXX XXX XXXX"
              className={errors.whatsapp ? "border-red-500" : ""}
            />
            {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              rows={3}
              placeholder="Additional information about this lead..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
