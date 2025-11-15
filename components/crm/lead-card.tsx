"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatNaira } from "@/lib/currency"
import { Mail, Phone, MessageCircle, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface LeadCardProps {
  lead: {
    id: string
    name: string
    email?: string
    phone?: string
    whatsapp?: string
    stage: string
    total_purchases: number
    notes?: string
  }
  onUpdate: () => void
}

export function LeadCard({ lead, onUpdate }: LeadCardProps) {
  const { toast } = useToast()

  async function moveStage(newStage: string) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("crm_leads")
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", lead.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Moved ${lead.name} to ${newStage}`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead stage",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-sm">{lead.name}</h4>
            {lead.total_purchases > 0 && (
              <p className="text-xs text-muted-foreground">{formatNaira(lead.total_purchases)} spent</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => moveStage("acquired")}>Move to Acquired</DropdownMenuItem>
              <DropdownMenuItem onClick={() => moveStage("conversing")}>Move to Conversing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => moveStage("sold")}>Move to Sold</DropdownMenuItem>
              <DropdownMenuItem onClick={() => moveStage("lost")}>Move to Lost</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.whatsapp && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="w-3 h-3" />
              <span>{lead.whatsapp}</span>
            </div>
          )}
        </div>

        {lead.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 border-t border-border pt-2">{lead.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
