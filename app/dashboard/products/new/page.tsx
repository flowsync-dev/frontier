"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProductForm, type ProductData } from "@/components/products/product-form"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"

import { useToast } from "@/hooks/use-toast"



export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  async function uploadImage(file: File, storeId: string): Promise<string | null> {
    try {
      const supabase = getSupabaseClient()
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${storeId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images') // Make sure this bucket exists in Supabase
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  async function handleSubmit(data: ProductData) {
    setIsLoading(true)
    


  async function handleSubmit(data: ProductData) {
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()


      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create products",
          variant: "destructive",
        })
        return
      }

      // Get user's store
      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", user.id)
        .single()

      if (storeError || !store) {
        console.error('Store error:', storeError)
        toast({
          title: "Error",
          description: "Store not found. Please create a store first.",
          variant: "destructive",
        })
        return
      }

      console.log('Store:', store)

      // Handle image upload if there's a file
      let uploadedImageUrl = data.image_url
      
      // If data.image_url is actually a File object (from file input)
      if (data.image_url && typeof data.image_url !== 'string') {
        toast({
          title: "Uploading image...",
          description: "Please wait while we upload your image",
        })
        
        uploadedImageUrl = await uploadImage(data.image_url as any, store.id)
        
        if (!uploadedImageUrl) {
          toast({
            title: "Warning",
            description: "Image upload failed, but product will be created without image",
            variant: "destructive",
          })
        }
      }

      console.log({
          store_id: store.id,
          name: data.name,
          description: data.description || null,
          price: Number(data.price),
          stock: Number(data.stock),
          category: data.category || null,
          is_active: data.is_active ?? true,
          image_url: uploadedImageUrl || null,
          image_urls: data.image_urls || [],
        })

      // Insert product
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          store_id: store.id,
          name: data.name,
          description: data.description || null,
          price: Number(data.price),
          stock: Number(data.stock),
          category: data.category || null,
          is_active: data.is_active ?? true,
          image_url: uploadedImageUrl || null,
          image_urls: data.image_urls || [],
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        toast({
          title: "Error",
          description: `Failed to create product: ${insertError.message}`,
          variant: "destructive",
        })
        return
      }

      console.log('Product created:', newProduct)

      toast({
        title: "Success! 🎉",
        description: "Product created successfully",
      })

      router.push("/dashboard/products")
      
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })

      const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user?.id).single()

      const { error } = await supabase.from("products").insert({
        store_id: store.id,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        is_active: data.is_active,
        image_url: data.image_url || null,
        image_urls: data.image_urls || [],
      })

      if (error) throw error
      router.push("/dashboard/products")

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
        <p className="text-muted-foreground mt-2">Create a new product for your store</p>
      </div>
      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )

}

}
