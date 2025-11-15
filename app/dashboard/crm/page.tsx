"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getCurrentUser } from "@/lib/auth-actions"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Users, TrendingUp, CheckCircle, XCircle, LayoutGrid, TableIcon } from "lucide-react"
import { LeadCard } from "@/components/crm/lead-card"
import { AddLeadDialog } from "@/components/crm/add-lead-dialog"
import { ManageStagesDialog } from "@/components/crm/manage-stages-dialog"
import { LeadTable } from "@/components/crm/lead-table"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [stagesDialogOpen, setStagesDialogOpen] = useState(false)
  const [view, setView] = useState<"board" | "table">("board")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      const { data: storeData } = await supabase.from("stores").select("id").eq("owner_id", user?.id).single()

      if (!storeData) throw new Error("Store not found")

      const { data: stagesData, error: stagesError } = await supabase
        .from("crm_funnel_stages")
        .select("*")
        .eq("store_id", storeData.id)
        .order("order_index")

      if (stagesError) throw stagesError
      setStages(stagesData || [])

      const { data: leadsData, error: leadsError } = await supabase
        .from("crm_leads")
        .select("*")
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: false })

      if (leadsError) throw leadsError
      setLeads(leadsData || [])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load CRM data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function getLeadsByStage(stage: string) {
    return leads.filter((lead) => lead.stage === stage.toLowerCase())
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search),
  )

  const totalLeads = leads.length
  const conversingLeads = leads.filter((l) => l.stage === "conversing").length
  const soldLeads = leads.filter((l) => l.stage === "sold").length
  const lostLeads = leads.filter((l) => l.stage === "lost").length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-96">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Relationship Management</h1>
          <p className="text-muted-foreground mt-2">Manage your leads and customer pipeline</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 border border-border rounded-lg p-1">
            <Button
              variant={view === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("board")}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
              className="gap-2"
            >
              <TableIcon className="w-4 h-4" />
              Table
            </Button>
          </div>
          <Button variant="outline" onClick={() => setStagesDialogOpen(true)} className="bg-transparent">
            Manage Stages
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversing</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversingLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lost</CardTitle>
            <XCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lostLeads}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search leads by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const stageLeads = search
              ? filteredLeads.filter((l) => l.stage === stage.name.toLowerCase())
              : getLeadsByStage(stage.name)

            return (
              <Card key={stage.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{stage.name}</CardTitle>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: stage.color }} />
                  </div>
                  <p className="text-sm text-muted-foreground">{stageLeads.length} leads</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 overflow-auto max-h-[600px]">
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onUpdate={loadData} />
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No leads in this stage</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <LeadTable leads={search ? filteredLeads : leads} stages={stages} onUpdate={loadData} />
      )}

      <AddLeadDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={loadData} />
      <ManageStagesDialog
        open={stagesDialogOpen}
        onOpenChange={setStagesDialogOpen}
        stages={stages}
        onUpdate={loadData}
      />
    </div>
  )
}