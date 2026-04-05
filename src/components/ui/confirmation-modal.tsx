"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] animate-in bg-black/45 backdrop-blur-sm fade-in duration-200" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[201] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "animate-in rounded-2xl p-5 sm:p-6 shadow-2xl fade-in zoom-in-95 duration-200",
            "bg-card/95 border border-border backdrop-blur-xl",
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-destructive/15 p-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogPrimitive.Close asChild>
                <button className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-2">
              <DialogPrimitive.Title className="text-xl font-semibold leading-tight text-foreground">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <DialogPrimitive.Close asChild>
                <Button
                  variant="outline"
                  className="rounded-xl border-border font-semibold hover:bg-muted"
                >
                  {cancelText}
                </Button>
              </DialogPrimitive.Close>
              <Button
                type="button"
                onClick={async () => {
                  await Promise.resolve(onConfirm());
                  onClose();
                }}
                className="rounded-xl border-none bg-destructive font-semibold text-white hover:bg-destructive/80"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
