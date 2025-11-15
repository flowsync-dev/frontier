import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNaira } from "@/lib/currency"

interface Sale {
  id: string
  buyer_name: string
  product_name: string
  total_amount: number
  created_at: string
  status: string
}

interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>Your latest transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No sales yet. Start by adding products to your store.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium text-sm">{sale.buyer_name}</p>
                  <p className="text-xs text-muted-foreground">{sale.product_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatNaira(sale.total_amount)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
