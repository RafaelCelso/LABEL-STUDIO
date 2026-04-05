"use client"

import { useEffect, useState } from "react"
import {
  formatAgeIndication,
  parseAgeIndication,
  type AgeIndicationUnit,
} from "@/constants/age-options"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type Props = {
  value: string
  onChange: (next: string) => void
  fieldClassName: string
  idPrefix?: string
}

export function LabelAgeIndicationField({ value, onChange, fieldClassName, idPrefix = "age-ind" }: Props) {
  const parsed = parseAgeIndication(value)
  const [numStr, setNumStr] = useState(() => (parsed ? String(parsed.n) : ""))
  const [unit, setUnit] = useState<AgeIndicationUnit>(() => parsed?.unit ?? "years")

  useEffect(() => {
    const p = parseAgeIndication(value)
    if (p) {
      setNumStr(String(p.n))
      setUnit(p.unit)
    } else if (!value.trim()) {
      setNumStr("")
      setUnit("years")
    }
  }, [value])

  const commit = (rawN: string, u: AgeIndicationUnit) => {
    const trimmed = rawN.trim()
    if (trimmed === "") {
      onChange("")
      return
    }
    const n = parseInt(trimmed, 10)
    if (Number.isNaN(n) || n < 0) return
    if (n > 999) return
    onChange(formatAgeIndication(n, u))
  }

  const idNum = `${idPrefix}-num`
  const idMeses = `${idPrefix}-meses`
  const idAnos = `${idPrefix}-anos`
  const radioName = `${idPrefix}-unit`

  const radioClass =
    "size-4 shrink-0 cursor-pointer border-border bg-background accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"

  return (
    <div className="space-y-3">
      <Input
        id={idNum}
        type="text"
        inputMode="numeric"
        value={numStr}
        onChange={(e) => {
          const t = e.target.value.replace(/\D/g, "")
          setNumStr(t)
          if (t === "") {
            onChange("")
            return
          }
          const n = parseInt(t, 10)
          if (!Number.isNaN(n) && n >= 0 && n <= 999) {
            onChange(formatAgeIndication(n, unit))
          }
        }}
        onBlur={() => commit(numStr, unit)}
        className={cn("h-11", fieldClassName)}
        placeholder="Ex.: 3"
        autoComplete="off"
        aria-label="Valor da indicação etária"
      />

      <div
        className="flex flex-wrap items-center gap-6"
        role="radiogroup"
        aria-label="Unidade da indicação etária"
      >
        <label
          htmlFor={idMeses}
          className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
        >
          <input
            id={idMeses}
            type="radio"
            name={radioName}
            value="months"
            checked={unit === "months"}
            onChange={() => {
              const next: AgeIndicationUnit = "months"
              setUnit(next)
              if (numStr.trim() !== "") commit(numStr, next)
            }}
            className={radioClass}
          />
          Meses
        </label>
        <label
          htmlFor={idAnos}
          className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
        >
          <input
            id={idAnos}
            type="radio"
            name={radioName}
            value="years"
            checked={unit === "years"}
            onChange={() => {
              const next: AgeIndicationUnit = "years"
              setUnit(next)
              if (numStr.trim() !== "") commit(numStr, next)
            }}
            className={radioClass}
          />
          Anos
        </label>
      </div>
    </div>
  )
}
