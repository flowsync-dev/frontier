import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StorePreviewProps {
  storeName: string
  description: string
  storeUrl: string
  isPublished: boolean
}

export function StorePreview({ storeName, description, storeUrl, isPublished }: StorePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{storeName}</h2>
              <p className="text-sm text-muted-foreground mt-1">{description || "No description yet"}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Store URL</p>
              <p className="font-mono text-sm break-all">{storeUrl}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isPublished ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm font-medium">{isPublished ? "Published" : "Draft"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPublished ? "Your store is visible to customers" : "Your store is not visible to customers"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
