"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MapPin, CheckCircle2, AlertCircle } from "lucide-react"
import type { Segment } from "@/lib/types"

interface CustodyHandoffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  segment: Segment | null
  onConfirm: () => void
}

export function CustodyHandoffDialog({ open, onOpenChange, segment, onConfirm }: CustodyHandoffDialogProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [notes, setNotes] = useState("")
  const [parcelIntact, setParcelIntact] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)

  const canConfirm = verificationCode.length >= 4 && parcelIntact && photoTaken

  const handleConfirm = () => {
    onConfirm()
    setVerificationCode("")
    setNotes("")
    setParcelIntact(false)
    setPhotoTaken(false)
  }

  if (!segment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Custody Handoff</DialogTitle>
          <DialogDescription>Complete the handoff verification at the destination checkpoint</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Destination Info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Handoff Location</span>
            </div>
            <p className="mt-1 font-medium">{segment.to.name}</p>
            <p className="text-sm text-muted-foreground">{segment.to.city}</p>
            <Badge variant="outline" className="mt-2">
              {segment.to.type.replace("_", " ")}
            </Badge>
          </div>

          {/* Verification Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Checkpoint Verification Code</Label>
            <Input
              id="code"
              placeholder="Enter 4-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">Get this code from the checkpoint staff or system</p>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <Label>Handoff Checklist</Label>
            <div className="flex items-start gap-3">
              <Checkbox
                id="parcel-intact"
                checked={parcelIntact}
                onCheckedChange={(checked) => setParcelIntact(checked as boolean)}
              />
              <div>
                <label htmlFor="parcel-intact" className="text-sm font-medium cursor-pointer">
                  Parcel condition verified
                </label>
                <p className="text-xs text-muted-foreground">Package is intact with no visible damage</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="photo-taken"
                checked={photoTaken}
                onCheckedChange={(checked) => setPhotoTaken(checked as boolean)}
              />
              <div>
                <label htmlFor="photo-taken" className="text-sm font-medium cursor-pointer">
                  Photo evidence captured
                </label>
                <p className="text-xs text-muted-foreground">Photo of parcel at handoff location</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any observations or issues..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Verification Status */}
          <div
            className={`flex items-center gap-2 rounded-lg p-3 ${canConfirm ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
          >
            {canConfirm ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">
              {canConfirm ? "Ready to confirm handoff" : "Complete all requirements"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Confirm Handoff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
