"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus } from "lucide-react"
import { formatNaira } from "@/lib/currency"
import { SalesAnalytics } from "@/components/sales/sales-analytics"
import { exportToCSV } from "@/lib/export-sales"
import { useToast } from "@/hooks/use-toast"
import { LogSaleDialog } from "@/components/sales/log-sale-dialog"

interface Sale {
  id: string
  customer_name: string
  customer_email: string
  quantity: number
  total_amount: number
  created_at: string
  status: string
  products?: { name: string }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [storeName, setStoreName] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [logSaleDialogOpen, setLogSaleDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSales()
  }, [])

  useEffect(() => {
    filterSales()
  }, [sales, searchTerm, filterStatus, dateFrom, dateTo])

  async function loadSales() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to view sales",
          variant: "destructive",
        })
        return
      }

      const { data: store } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle()

      if (!store) {
        toast({
          title: "No Store Found",
          description: "Please create a store first",
          variant: "destructive",
        })
        return
      }

      setStoreName(store.name)

      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          products (name)
        `)
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load sales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function filterSales() {
    let filtered = sales

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((s) => s.status === filterStatus)
    }

    if (dateFrom) {
      filtered = filtered.filter((s) => new Date(s.created_at) >= new Date(dateFrom))
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((s) => new Date(s.created_at) <= endDate)
    }

    setFilteredSales(filtered)
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number.parseFloat(String(s.total_amount)), 0)
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground mt-2">Track all your sales and orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLogSaleDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Log Sale
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => exportToCSV(filteredSales, storeName)}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <SalesAnalytics totalRevenue={totalRevenue} totalSales={sales.length} avgOrderValue={avgOrderValue} />

      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
          <CardDescription>{filteredSales.length} sales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-64">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "completed" | "pending")}
                className="px-3 py-2 border border-input rounded-md text-sm mt-1"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
            </div>
          </div>

          {filteredSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-sm">{new Date(sale.created_at).toLocaleDateString("en-NG")}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{sale.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{sale.products?.name || "N/A"}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell className="font-medium">
                      {formatNaira(Number.parseFloat(String(sale.total_amount)))}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          sale.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sales found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <LogSaleDialog open={logSaleDialogOpen} onOpenChange={setLogSaleDialogOpen} onSuccess={loadSales} />
    </div>
  )
}
