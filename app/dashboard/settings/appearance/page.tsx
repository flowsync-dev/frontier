"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { useToast } from "@/hooks/use-toast"
import { Paintbrush, Eye, Save } from "lucide-react"
import Link from "next/link"

const THEME_PRESETS = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and modern with lots of whitespace",
    primaryColor: "#1e293b",
    secondaryColor: "#64748b",
    accentColor: "#0ea5e9",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold colors that stand out",
    primaryColor: "#ec4899",
    secondaryColor: "#8b5cf6",
    accentColor: "#f59e0b",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate and trustworthy",
    primaryColor: "#1e40af",
    secondaryColor: "#6366f1",
    accentColor: "#10b981",
  },
  {
    id: "earthy",
    name: "Earthy",
    description: "Natural and organic tones",
    primaryColor: "#78350f",
    secondaryColor: "#92400e",
    accentColor: "#059669",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated and refined",
    primaryColor: "#831843",
    secondaryColor: "#9333ea",
    accentColor: "#d946ef",
  },
]

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Modern Sans-Serif)" },
  { value: "Playfair Display", label: "Playfair Display (Elegant Serif)" },
  { value: "Poppins", label: "Poppins (Friendly Sans-Serif)" },
  { value: "Merriweather", label: "Merriweather (Classic Serif)" },
  { value: "Montserrat", label: "Montserrat (Geometric Sans-Serif)" },
]

const LAYOUT_OPTIONS = [
  { value: "grid-2", label: "2 Columns" },
  { value: "grid-3", label: "3 Columns" },
  { value: "grid-4", label: "4 Columns" },
  { value: "list", label: "List View" },
]

const CARD_STYLES = [
  { value: "elevated", label: "Elevated (Shadow)" },
  { value: "bordered", label: "Bordered" },
  { value: "flat", label: "Flat" },
]

const BUTTON_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp Corners" },
  { value: "pill", label: "Pill Shape" },
]

const LOGO_POSITIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
]

export default function AppearancePage() {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Theme configuration state
  const [themePreset, setThemePreset] = useState("minimal")
  const [primaryColor, setPrimaryColor] = useState("#6366f1")
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6")
  const [accentColor, setAccentColor] = useState("#ec4899")
  const [fontHeading, setFontHeading] = useState("Inter")
  const [fontBody, setFontBody] = useState("Inter")
  const [logoPosition, setLogoPosition] = useState("center")
  const [showBanner, setShowBanner] = useState(true)
  const [layoutStyle, setLayoutStyle] = useState("grid-3")
  const [cardStyle, setCardStyle] = useState("elevated")
  const [buttonStyle, setButtonStyle] = useState("rounded")

  useEffect(() => {
    loadStore()
  }, [])

  async function loadStore() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      const { data, error } = await supabase.from("stores").select("*").eq("owner_id", user?.id).single()

      if (error) throw error

      setStore(data)
      setThemePreset(data.theme_preset || "minimal")
      setPrimaryColor(data.primary_color || "#6366f1")
      setSecondaryColor(data.secondary_color || "#8b5cf6")
      setAccentColor(data.accent_color || "#ec4899")
      setFontHeading(data.font_heading || "Inter")
      setFontBody(data.font_body || "Inter")
      setLogoPosition(data.logo_position || "center")
      setShowBanner(data.show_banner ?? true)
      setLayoutStyle(data.layout_style || "grid-3")
      setCardStyle(data.card_style || "elevated")
      setButtonStyle(data.button_style || "rounded")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load store appearance settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("stores")
        .update({
          theme_preset: themePreset,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          font_heading: fontHeading,
          font_body: fontBody,
          logo_position: logoPosition,
          show_banner: showBanner,
          layout_style: layoutStyle,
          card_style: cardStyle,
          button_style: buttonStyle,
        })
        .eq("id", store.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Appearance settings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appearance settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function applyPreset(preset: any) {
    setThemePreset(preset.id)
    setPrimaryColor(preset.primaryColor)
    setSecondaryColor(preset.secondaryColor)
    setAccentColor(preset.accentColor)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Store Appearance</h1>
          <p className="text-muted-foreground mt-2">Customize how your store looks to customers</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/store/${store?.slug}`} target="_blank">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Eye className="w-4 h-4" />
              Preview Store
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="w-5 h-5" />
                Theme Presets
              </CardTitle>
              <CardDescription>Choose a pre-designed theme or customize your own</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      themePreset === preset.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primaryColor }} />
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondaryColor }} />
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accentColor }} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Customize your color scheme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Choose fonts for your store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Heading Font</label>
                  <select
                    value={fontHeading}
                    onChange={(e) => setFontHeading(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Body Font</label>
                  <select
                    value={fontBody}
                    onChange={(e) => setFontBody(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout & Style */}
          <Card>
            <CardHeader>
              <CardTitle>Layout & Style</CardTitle>
              <CardDescription>Customize how products are displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product Layout</label>
                <div className="grid grid-cols-2 gap-3">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLayoutStyle(option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        layoutStyle === option.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Card Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {CARD_STYLES.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCardStyle(option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        cardStyle === option.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Button Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {BUTTON_STYLES.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setButtonStyle(option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        buttonStyle === option.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Logo Position</label>
                <div className="grid grid-cols-3 gap-3">
                  {LOGO_POSITIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLogoPosition(option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        logoPosition === option.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="showBanner"
                  checked={showBanner}
                  onChange={(e) => setShowBanner(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="showBanner" className="text-sm font-medium text-foreground cursor-pointer">
                  Show store banner image
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your changes look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 space-y-4">
                {/* Header Preview */}
                <div
                  className={`p-4 rounded-lg flex items-center ${
                    logoPosition === "left"
                      ? "justify-start"
                      : logoPosition === "right"
                        ? "justify-end"
                        : "justify-center"
                  }`}
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="text-white font-bold text-lg" style={{ fontFamily: fontHeading }}>
                    {store?.name}
                  </div>
                </div>

                {/* Banner Preview */}
                {showBanner && (
                  <div
                    className="h-24 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  />
                )}

                {/* Product Card Preview */}
                <div
                  className={`rounded-lg overflow-hidden ${
                    cardStyle === "elevated"
                      ? "shadow-md"
                      : cardStyle === "bordered"
                        ? "border-2 border-border"
                        : "border border-border"
                  }`}
                >
                  <div className="h-32 bg-muted" />
                  <div className="p-3 space-y-2">
                    <h4 className="font-semibold text-sm" style={{ fontFamily: fontHeading, color: primaryColor }}>
                      Product Name
                    </h4>
                    <p className="text-xs text-muted-foreground" style={{ fontFamily: fontBody }}>
                      Product description goes here
                    </p>
                    <button
                      className={`w-full py-2 text-xs font-medium text-white ${
                        buttonStyle === "rounded"
                          ? "rounded-md"
                          : buttonStyle === "sharp"
                            ? "rounded-none"
                            : "rounded-full"
                      }`}
                      style={{ backgroundColor: accentColor }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-xs text-muted-foreground text-center">
                  Preview is simplified. Visit your store to see full changes.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
