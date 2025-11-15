interface Sale {
  id: string
  buyer_name: string
  product_name: string
  total_amount: number
  created_at: string
  status: string
  payment_method?: string
}

export function exportToCSV(sales: Sale[], storeName: string) {
  const headers = ["Date", "Buyer", "Product", "Amount (₦)", "Payment Method", "Status"]
  const rows = sales.map((sale) => [
    new Date(sale.created_at).toLocaleDateString("en-NG"),
    sale.buyer_name,
    sale.product_name,
    Math.round(Number.parseFloat(sale.total_amount)).toString(),
    sale.payment_method || "Unknown",
    sale.status,
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${storeName}-sales-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
