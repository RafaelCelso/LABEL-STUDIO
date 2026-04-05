"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NoticeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  confirmText?: string
}

export function NoticeModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Entendi",
}: NoticeModalProps) {
  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-in bg-black/45 backdrop-blur-sm fade-in duration-200" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
            "auth-frost-panel-strong animate-in rounded-2xl p-6 shadow-2xl fade-in zoom-in-95 duration-200",
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="shrink-0 rounded-full bg-primary/15 p-2">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-2 pr-2">
              <DialogPrimitive.Title className="text-lg font-semibold leading-tight text-foreground">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            </div>

            <div className="flex justify-end pt-2">
              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  className="auth-cta-glow rounded-xl border-none bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {confirmText}
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
