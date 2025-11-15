"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseClient } from "@/lib/supabase-client";
import { getCurrentUser } from "@/lib/auth-actions";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, Paintbrush, Store, Sparkles, ArrowRight } from 'lucide-react';
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const THEME_PRESETS = [
  {
    id: "minimal",
    name: "Minimal",
    primaryColor: "#1e293b",
    secondaryColor: "#64748b",
    accentColor: "#0ea5e9",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    primaryColor: "#ec4899",
    secondaryColor: "#8b5cf6",
    accentColor: "#f59e0b",
  },
  {
    id: "professional",
    name: "Professional",
    primaryColor: "#1e40af",
    secondaryColor: "#6366f1",
    accentColor: "#10b981",
  },
  {
    id: "earthy",
    name: "Earthy",
    primaryColor: "#78350f",
    secondaryColor: "#92400e",
    accentColor: "#059669",
  },
  {
    id: "elegant",
    name: "Elegant",
    primaryColor: "#831843",
    secondaryColor: "#9333ea",
    accentColor: "#d946ef",
  },
];

export default function SettingsPage() {
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState("minimal");
  const [primaryColor, setPrimaryColor] = useState("#1e293b");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [accentColor, setAccentColor] = useState("#0ea5e9");

  async function loadStore() {
    try {
      const supabase = getSupabaseClient();
      const user = await getCurrentUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (err) {
        console.log("Error loading store:", err);
      }

      if (data) {
        setHasStore(true);
        setStore(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setWhatsappNumber(data.whatsapp_number || "");
        setIsPublished(data.is_published || false);
        setSelectedTheme(data.theme_preset || "minimal");
        setPrimaryColor(data.primary_color || "#1e293b");
        setSecondaryColor(data.secondary_color || "#64748b");
        setAccentColor(data.accent_color || "#0ea5e9");
      } else {
        setHasStore(false);
      }
    } catch (err) {
      console.error("[v0] Error in loadStore:", err);
      toast({
        title: "Error",
        description: "Failed to load store information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStore();
  }, []);

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: user.id,
          email: user.email,
          name,
          description,
          whatsappNumber,
          themePreset: selectedTheme,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create store");
      }

      if (!result.store?.slug) {
        throw new Error("Store created but slug is missing");
      }

      setStore(result.store);
      setHasStore(true);

      toast({
        title: "Store Created! 🎉",
        description: "Your store has been successfully set up. Start adding products!",
      });
    } catch (err) {
      console.error("[v0] Error creating store:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create store",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStore(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          storeId: store.id,
          updates: {
            name,
            description,
            whatsapp_number: whatsappNumber,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update store");
      }

      setStore(result.store);

      toast({
        title: "Success",
        description: "Store settings updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish() {
    setSaving(true);

    try {
      const newPublished = !isPublished;

      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          storeId: store.id,
          updates: {
            is_published: newPublished,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update store visibility");
      }

      setStore(result.store);
      setIsPublished(newPublished);

      toast({
        title: "Success",
        description: newPublished
          ? "Your store is now live and visible to customers! 🎉"
          : "Your store has been unpublished",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update visibility",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateTheme() {
    setSaving(true);

    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          storeId: store.id,
          updates: {
            theme_preset: selectedTheme,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            accent_color: accentColor,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update theme");
      }

      setStore(result.store);

      toast({
        title: "Success",
        description: "Theme updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update theme",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function applyThemePreset(themeId: string) {
    const preset = THEME_PRESETS.find((p) => p.id === themeId);
    if (preset) {
      setSelectedTheme(themeId);
      setPrimaryColor(preset.primaryColor);
      setSecondaryColor(preset.secondaryColor);
      setAccentColor(preset.accentColor);
    }
  }

  function copyStoreUrl() {
    const url = `${window.location.origin}/store/${store?.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Store URL copied to clipboard",
    });
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Skeleton className="h-12 w-full max-w-md" />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasStore === false) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Set Up Your Store</h1>
          <p className="text-lg text-muted-foreground">Let's get your online store ready in just a few steps</p>
        </div>

        <form onSubmit={handleCreateStore} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                Store Information
              </CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Store Name *</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fashion Hub Nigeria"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Store Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-[80px]"
                  placeholder="Describe what you sell..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp Number *</label>
                <Input
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
                <p className="text-xs text-muted-foreground">Customers will contact you via WhatsApp to complete orders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                Choose Your Theme
              </CardTitle>
              <CardDescription>Pick a style that matches your brand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyThemePreset(preset.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${selectedTheme === preset.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div className="flex gap-1 mb-3">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primaryColor }} />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondaryColor }} />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accentColor }} />
                    </div>
                    <h3 className="font-semibold text-sm">{preset.name}</h3>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center pt-4">
            <Button type="submit" size="lg" disabled={saving} className="gap-2 min-w-[200px]">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Store...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create My Store
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Store Configuration</h1>
          <p className="text-muted-foreground mt-2">Manage your store settings and appearance</p>
        </div>
        <div className="flex gap-2">
          {store?.slug ? (
            <Link href={`/store/${store.slug}`} target="_blank">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Eye className="w-4 h-4" />
                View Store
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="gap-2 bg-transparent">
              <Eye className="w-4 h-4" />
              Loading...
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="store">Store Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Visibility</CardTitle>
              <CardDescription>Control whether your store is visible to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{isPublished ? "Store is Published" : "Store is Unpublished"}</p>
                  <p className="text-sm text-muted-foreground">{isPublished ? "Your store is live and visible to everyone" : "Your store is hidden from customers"}</p>
                </div>
                <Button onClick={handleTogglePublish} disabled={saving} variant={isPublished ? "outline" : "default"}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    isPublished ? "Unpublish" : "Publish"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Update your store details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateStore} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Store Name</label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Store Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-[100px]"
                    placeholder="Tell customers about your store..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp Number</label>
                  <Input
                    id="whatsapp"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+234 XXX XXX XXXX"
                  />
                  <p className="text-xs text-muted-foreground">Customers will be redirected to this WhatsApp number after checkout</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="url" className="text-sm font-medium">Store URL</label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      value={store?.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/store/${store.slug}` : "Loading..."}
                      readOnly
                      className="bg-muted"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={copyStoreUrl} className="gap-2 bg-transparent" disabled={!store?.slug}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paintbrush className="w-5 h-5" />
                    Theme Presets
                  </CardTitle>
                  <CardDescription>Choose a pre-designed theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyThemePreset(preset.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${selectedTheme === preset.id ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.primaryColor }} />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.secondaryColor }} />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.accentColor }} />
                        </div>
                        <h3 className="font-semibold text-sm">{preset.name}</h3>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Colors</CardTitle>
                  <CardDescription>Fine-tune your color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded border cursor-pointer" />
                        <Input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Secondary</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-12 rounded border cursor-pointer" />
                        <Input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Accent</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-12 rounded border cursor-pointer" />
                        <Input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="text-xs" />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleUpdateTheme} disabled={saving} className="w-full mt-6">
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Theme"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Live preview of your theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: primaryColor }}>
                      <div className="text-white font-bold text-center">{store?.name || "Store Name"}</div>
                    </div>
                    <div className="h-20 rounded-lg" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
                    <div className="border rounded-lg overflow-hidden">
                      <div className="h-24 bg-muted" />
                      <div className="p-3 space-y-2">
                        <h4 className="font-semibold text-sm" style={{ color: primaryColor }}>Sample Product</h4>
                        <p className="text-xs text-muted-foreground">Product description</p>
                        <button className="w-full py-2 text-xs font-medium text-white rounded" style={{ backgroundColor: accentColor }}>Add to Cart</button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}