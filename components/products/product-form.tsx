"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ImagePlus, X, Upload } from "lucide-react"

interface ProductFormProps {
  onSubmit: (data: ProductData) => Promise<void>
  initialData?: ProductData
  isLoading?: boolean
}

export interface ProductData {
  name: string
  description: string
  price: number
  stock: number
  category?: string
  is_active?: boolean
  image_url?: string | File  // Can be URL or File
  image_urls?: string[]
  image_file?: File  // Separate field for file upload
}

export function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ProductData>(
    initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      is_active: true,
      image_url: "",
      image_urls: [],
    },
  )
  const [newImageUrl, setNewImageUrl] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("Product name is required")
      return
    }

    if (formData.price <= 0) {
      setError("Price must be greater than 0")
      return
    }

    try {
      await onSubmit(formData)
      toast({
        title: "Success",
        description: initialData ? "Product updated successfully" : "Product created successfully",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Store file in form data
      setFormData({ ...formData, image_file: file })
    }
  }

  function addImageUrl() {
    if (newImageUrl && !formData.image_urls?.includes(newImageUrl)) {
      const updatedUrls = [...(formData.image_urls || []), newImageUrl]
      setFormData({ ...formData, image_urls: updatedUrls, image_url: updatedUrls[0] })
      setNewImageUrl("")
    }
  }

  function removeImageUrl(url: string) {
    const updatedUrls = formData.image_urls?.filter((u) => u !== url) || []
    setFormData({ ...formData, image_urls: updatedUrls, image_url: updatedUrls[0] || "" })
  }

  function removeUploadedImage() {
    setImagePreview(null)
    setFormData({ ...formData, image_file: undefined })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {initialData ? "Update your product details" : "Create a new product for your store"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Product Name *
            </label>
            <Input
              id="name"
              placeholder="e.g., Wireless Headphones"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-[100px]"
              rows={4}
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Main Product Image</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeUploadedImage}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-sm text-primary hover:underline"
                  >
                    Click to upload image
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Image URLs (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Images (URLs)</label>
            <p className="text-xs text-muted-foreground">Optional: Add more images via URL</p>
            <div className="flex gap-2">
              <Input
                placeholder="Paste image URL..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
              />
              <Button type="button" variant="outline" onClick={addImageUrl} className="gap-2 bg-transparent">
                <ImagePlus className="w-4 h-4" />
                Add
              </Button>
            </div>
            {formData.image_urls && formData.image_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.image_urls.map((url) => (
                  <div key={url} className="relative group">
                    <img
                      src={url || "/placeholder.svg"}
                      alt="Product"
                      className="w-full h-24 object-cover rounded-md border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImageUrl(url)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price (₦) *
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium">
                Stock Quantity *
              </label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="category"
              placeholder="e.g., Electronics"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-input"
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Active (visible to customers)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
