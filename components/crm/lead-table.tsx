"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Trash2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  stage: string
  total_purchases: number
  created_at: string
  notes?: string
}

interface FunnelStage {
  id: string
  name: string
  color: string
  order_index: number
}

interface LeadTableProps {
  leads: Lead[]
  stages: FunnelStage[]
  onUpdate: () => void
}

export function LeadTable({ leads, stages, onUpdate }: LeadTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  function getStageColor(stage: string) {
    const stageData = stages.find((s) => s.name.toLowerCase() === stage.toLowerCase())
    return stageData?.color || "#6b7280"
  }

  async function deleteLead(leadId: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return

    setLoading(leadId)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("crm_leads").delete().eq("id", leadId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete lead",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Total Purchases</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email || "-"}</TableCell>
                <TableCell>{lead.phone || lead.whatsapp || "-"}</TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: getStageColor(lead.stage),
                      color: "white",
                    }}
                  >
                    {lead.stage}
                  </Badge>
                </TableCell>
                <TableCell>{formatNaira(lead.total_purchases)}</TableCell>
                <TableCell>{new Date(lead.created_at).toLocaleDateString("en-NG")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={loading === lead.id}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/${lead.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteLead(lead.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
