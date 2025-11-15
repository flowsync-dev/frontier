"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ManageStagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stages: Array<{ id: string; name: string; color: string; order_index: number }>
  onUpdate: () => void
}

export function ManageStagesDialog({ open, onOpenChange, stages }: ManageStagesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Funnel Stages</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="font-medium">{stage.name}</span>
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            Default stages: Acquired, Conversing, Sold, Lost. Custom stage management coming soon!
          </p>
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
