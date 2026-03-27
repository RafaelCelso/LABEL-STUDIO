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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2",
            "bg-white p-6 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200",
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="p-2 bg-blue-50 rounded-full shrink-0">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="rounded-full p-1.5 hover:bg-slate-100 transition-colors text-slate-400 shrink-0"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-2 pr-2">
              <DialogPrimitive.Title className="text-lg font-bold text-slate-900 leading-tight">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {description}
              </DialogPrimitive.Description>
            </div>

            <div className="flex justify-end pt-2">
              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white border-none"
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
