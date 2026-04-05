"use client"

import { useState } from "react"
import type { LabelData } from "@/types/label"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NoticeModal } from "@/components/ui/notice-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PACKAGING_COLOR_BOX_CAIXA_NOTICE,
  PACKAGING_COLOR_BOX_VARIANTS,
  PACKAGING_MAIN_OPTIONS,
  packagingColorBoxVariantForSelect,
  packagingMainForSelect,
} from "@/constants/packaging-options"

type Props = {
  data: LabelData
  onPatch: (patch: Partial<LabelData>) => void
  fieldClassName: string
}

export function LabelPackagingFields({ data, onPatch, fieldClassName }: Props) {
  const [caixaNoticeOpen, setCaixaNoticeOpen] = useState(false)

  const mainValue = packagingMainForSelect(data.packagingType)
  const variantValue = packagingColorBoxVariantForSelect(data.packagingColorBoxVariant)

  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Tipo de Embalagem do Produto
        </Label>
        <Select
          value={mainValue}
          onValueChange={(val) => {
            const v = val || ""
            onPatch({
              packagingType: v,
              ...(v !== "Color Box" ? { packagingColorBoxVariant: "" } : {}),
              ...(v !== "Outro" ? { packagingOther: "" } : {}),
            })
          }}
        >
          <SelectTrigger className={cn("w-full", fieldClassName)}>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {PACKAGING_MAIN_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.packagingType === "Color Box" ? (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tipo de Color Box
          </Label>
          <Select
            value={variantValue}
            onValueChange={(val) => {
              const v = val || ""
              onPatch({ packagingColorBoxVariant: v })
              if (v === "Caixa") setCaixaNoticeOpen(true)
            }}
          >
            <SelectTrigger className={cn("w-full", fieldClassName)}>
              <SelectValue placeholder="Selecione Caixa ou Windowbox..." />
            </SelectTrigger>
            <SelectContent>
              {PACKAGING_COLOR_BOX_VARIANTS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {data.packagingType === "Outro" ? (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Nome da embalagem
          </Label>
          <Input
            value={data.packagingOther}
            onChange={(e) => onPatch({ packagingOther: e.target.value })}
            className={cn("w-full", fieldClassName)}
            placeholder="Digite o tipo de embalagem"
          />
        </div>
      ) : null}

      <NoticeModal
        isOpen={caixaNoticeOpen}
        onClose={() => setCaixaNoticeOpen(false)}
        title="Aviso — embalagem tipo caixa"
        description={PACKAGING_COLOR_BOX_CAIXA_NOTICE}
      />
    </>
  )
}
