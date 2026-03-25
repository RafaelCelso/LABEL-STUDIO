"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: ConfirmationModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <DialogPrimitive.Content 
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "bg-white p-6 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogPrimitive.Close asChild>
                <button className="rounded-full p-1.5 hover:bg-slate-100 transition-colors text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-2">
              <DialogPrimitive.Title className="text-xl font-bold text-slate-900 leading-tight">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-slate-500 leading-relaxed">
                {description}
              </DialogPrimitive.Description>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <DialogPrimitive.Close asChild>
                <Button 
                   variant="outline" 
                   className="rounded-xl font-semibold border-slate-200 hover:bg-slate-50"
                >
                  {cancelText}
                </Button>
              </DialogPrimitive.Close>
              <Button
                type="button"
                onClick={async () => {
                  await Promise.resolve(onConfirm())
                  onClose()
                }}
                className="rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white border-none"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
