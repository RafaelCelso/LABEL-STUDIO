"use client"

import { useEffect, useMemo, useState } from "react"
import type { LabelData } from "@/types/label"
import {
  formatCmProportion,
  parseCmDimensions,
  PROPORTION_PRESET_CM,
} from "@/types/label-layout"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

const PRESET_WIDE = PROPORTION_PRESET_CM.wide
const PRESET_SQUARE = PROPORTION_PRESET_CM.square
const CUSTOM_VALUE = "custom"

const projectFieldClass =
  "rounded-xl border border-input bg-background font-medium text-foreground caret-foreground shadow-sm placeholder:text-muted-foreground transition-[box-shadow,border-color] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0"

function normalizeCmString(p: string): string | null {
  const d = parseCmDimensions(p)
  if (!d) return null
  return formatCmProportion(d.wCm, d.hCm)
}

function selectKindFromProportion(proportion: string): "wide" | "square" | "custom" {
  if (proportion === "5:2 (Padrão)" || normalizeCmString(proportion) === normalizeCmString(PRESET_WIDE)) {
    return "wide"
  }
  if (proportion === "1:1 (Quadrado)" || normalizeCmString(proportion) === normalizeCmString(PRESET_SQUARE)) {
    return "square"
  }
  if (parseCmDimensions(proportion)) return "custom"
  return "wide"
}

function formatDimCm(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const r = Math.round(n * 100) / 100
  return String(r).replace(/\.?0+$/, "")
}

/** Texto exibido no select: sempre termina em ` cm`, nunca `cm:…`. */
function formatDimensionsLabel(wCm: number, hCm: number): string {
  return `${formatDimCm(wCm)} × ${formatDimCm(hCm)} cm`
}

type Props = {
  data: LabelData
  onChange: (field: keyof LabelData, value: string) => void
  fieldClassName?: string
}

export function LabelProportionFields({ data, onChange, fieldClassName }: Props) {
  /** Mantém a UI em “Personalizado” mesmo se as medidas coincidirem com um preset (ex.: 10×4). */
  const [lockCustomUi, setLockCustomUi] = useState(false)

  const kindFromData = useMemo(
    () => selectKindFromProportion(data.proportion),
    [data.proportion],
  )

  const selectValue = useMemo(() => {
    if (lockCustomUi) return CUSTOM_VALUE
    if (kindFromData === "wide") return PRESET_WIDE
    if (kindFromData === "square") return PRESET_SQUARE
    return CUSTOM_VALUE
  }, [kindFromData, lockCustomUi])

  const [customW, setCustomW] = useState("10")
  const [customH, setCustomH] = useState("4")

  useEffect(() => {
    const d = parseCmDimensions(data.proportion)
    if (d) {
      setCustomW(String(d.wCm))
      setCustomH(String(d.hCm))
    } else if (data.proportion === "5:2 (Padrão)") {
      setCustomW("10")
      setCustomH("4")
    } else if (data.proportion === "1:1 (Quadrado)") {
      setCustomW("8")
      setCustomH("8")
    }
  }, [data.proportion])

  const applyCustomFromStrings = (wStr: string, hStr: string) => {
    const w = parseFloat(wStr.replace(",", "."))
    const h = parseFloat(hStr.replace(",", "."))
    if (!(w > 0) || !(h > 0)) return
    if (w > 500 || h > 500) return
    onChange("proportion", formatCmProportion(w, h))
  }

  const triggerLabel = useMemo(() => {
    const d = parseCmDimensions(data.proportion)
    if (selectValue === CUSTOM_VALUE && d) {
      return formatDimensionsLabel(d.wCm, d.hCm)
    }
    if (selectValue === PRESET_WIDE) return "10 × 4 cm"
    if (selectValue === PRESET_SQUARE) return "8 × 8 cm"
    return "Selecione…"
  }, [data.proportion, selectValue])

  const fc = fieldClassName ?? projectFieldClass

  const showCustomInputs = selectValue === CUSTOM_VALUE

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Proporção</Label>
        <p className="text-sm text-muted-foreground">
          Informe <strong className="text-foreground">largura</strong> e <strong className="text-foreground">altura</strong> em{" "}
          <strong className="text-foreground">centímetros</strong>, ou escolha um preset.
        </p>
        <Select
          value={selectValue}
          onValueChange={(val) => {
            if (val === PRESET_WIDE) {
              setLockCustomUi(false)
              onChange("proportion", PRESET_WIDE)
            } else if (val === PRESET_SQUARE) {
              setLockCustomUi(false)
              onChange("proportion", PRESET_SQUARE)
            } else if (val === CUSTOM_VALUE) {
              setLockCustomUi(true)
              applyCustomFromStrings(customW, customH)
            }
          }}
        >
          <SelectTrigger className={cn("w-full h-11", fc)}>
            <span className="line-clamp-1 flex-1 text-left text-sm">{triggerLabel}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PRESET_WIDE}>10 × 4 cm (formato largo)</SelectItem>
            <SelectItem value={PRESET_SQUARE}>8 × 8 cm (quadrado)</SelectItem>
            <SelectItem value={CUSTOM_VALUE}>Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showCustomInputs ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dimensões personalizadas</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Altura (cm)
              </Label>
              <Input
                inputMode="decimal"
                value={customH}
                onChange={(e) => {
                  const v = e.target.value
                  setCustomH(v)
                  const w = customW
                  const wNum = parseFloat(w.replace(",", "."))
                  const hNum = parseFloat(v.replace(",", "."))
                  if (wNum > 0 && hNum > 0 && wNum <= 500 && hNum <= 500) {
                    onChange("proportion", formatCmProportion(wNum, hNum))
                  }
                }}
                onBlur={() => applyCustomFromStrings(customW, customH)}
                className={cn("h-11", fc)}
                placeholder="Ex.: 6"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Largura (cm)
              </Label>
              <Input
                inputMode="decimal"
                value={customW}
                onChange={(e) => {
                  const v = e.target.value
                  setCustomW(v)
                  const h = customH
                  const wNum = parseFloat(v.replace(",", "."))
                  const hNum = parseFloat(h.replace(",", "."))
                  if (wNum > 0 && hNum > 0 && wNum <= 500 && hNum <= 500) {
                    onChange("proportion", formatCmProportion(wNum, hNum))
                  }
                }}
                onBlur={() => applyCustomFromStrings(customW, customH)}
                className={cn("h-11", fc)}
                placeholder="Ex.: 12"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
