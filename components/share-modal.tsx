"use client"

import { useState } from "react"
import { Copy, Check, Globe, Link as LinkIcon, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  shareToken: string | null
  onUpdate: (newToken: string | null) => void
}

export function ShareModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  shareToken,
  onUpdate,
}: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/share/${shareToken}`
    : ""

  const handleToggleShare = async () => {
    setIsGenerating(true)
    try {
      const newToken = shareToken ? null : crypto.randomUUID()
      
      const { error } = await supabase
        .from('projects')
        .update({ public_share_token: newToken })
        .eq('id', projectId)

      if (error) throw error

      onUpdate(newToken)
      toast.success(newToken ? "Public sharing enabled" : "Public sharing disabled")
    } catch (error) {
      console.error("Error toggling share:", error)
      toast.error("Failed to update sharing settings")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Link copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRotateToken = async () => {
    if (!shareToken) return
    setIsGenerating(true)
    try {
      const newToken = crypto.randomUUID()
      const { error } = await supabase
        .from('projects')
        .update({ public_share_token: newToken })
        .eq('id', projectId)

      if (error) throw error

      onUpdate(newToken)
      toast.success("Share link refreshed")
    } catch (error) {
      console.error("Error rotating token:", error)
      toast.error("Failed to refresh link")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Share Project
          </DialogTitle>
          <DialogDescription>
            Make "{projectName}" visible to anyone with the link.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Public Access</div>
              <div className="text-xs text-muted-foreground">
                {shareToken ? "Anyone with the link can view this board" : "Only you can access this project"}
              </div>
            </div>
            <Button 
              variant={shareToken ? "destructive" : "default"} 
              size="sm"
              onClick={handleToggleShare}
              disabled={isGenerating}
            >
              {shareToken ? "Disable" : "Enable"}
            </Button>
          </div>

          {shareToken && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="h-9 text-xs"
                />
                <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="xs" 
                  className="text-[10px] text-muted-foreground gap-1.5 h-7 hover:text-primary"
                  onClick={handleRotateToken}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  Refresh Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
