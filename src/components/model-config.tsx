"use client"

import { useEffect, useMemo, useState } from "react"
import { getImporterById, getImporters, type ImporterListRow } from "@/app/actions/importer"
import { labelAddressFieldsFromImporter, labelSacLineFromImporter } from "@/lib/importer-address-for-label"
import { LabelData } from "@/types/label"
import { cn } from "@/lib/utils"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { countries } from "@/constants/countries"
import {
  CERTIFIER_AGE_RESTRICTION_OPTIONS,
  certifierAgeRestrictionForSelect,
} from "@/constants/age-options"
import { LabelAgeIndicationField } from "@/components/label-age-indication-field"
import { LabelPackagingFields } from "@/components/label-packaging-fields"
import { LabelProportionFields } from "@/components/label-proportion-fields"

const IMPORTER_ORPHAN_VALUE = "__orphan__"

/** Campos na vista de projeto — tokens do tema (coerente com auth / wizard). */
const projectFieldClass =
  "border border-input bg-background font-medium text-foreground caret-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0"

function parseMmYyyyMaskInput(raw: string): { formatted: string; digits: string } {
  const digits = raw.replace(/\D/g, "").slice(0, 6)
  let formatted = digits
  if (digits.length > 2) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  return { formatted, digits }
}

function monthErrorsForMmYyyy(digits: string): string[] {
  const errors: string[] = []
  if (digits.length >= 2) {
    const month = parseInt(digits.slice(0, 2), 10)
    if (month > 12) errors.push("Mês inválido (máx. 12)")
    else if (month === 0) errors.push("Mês inválido (00)")
  }
  return errors
}

interface ModelConfigProps {
  data: LabelData
  onChange: (field: keyof LabelData, value: any) => void
  onLabelPatch: (patch: Partial<LabelData>) => void
}

export function ModelConfig({ data, onChange, onLabelPatch }: ModelConfigProps) {
  const [expiryErrors, setExpiryErrors] = useState<string[]>([])
  const [manufactureDateErrors, setManufactureDateErrors] = useState<string[]>([])
  const [importerRows, setImporterRows] = useState<ImporterListRow[]>([])
  const [importersLoading, setImportersLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setImportersLoading(true)
      const rows = await getImporters()
      if (!cancelled) {
        setImporterRows(rows)
        setImportersLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const importerNamesInDb = useMemo(
    () => new Set(importerRows.map((r) => r.razao_social)),
    [importerRows]
  )

  const orphanImporter =
    data.importer.trim() !== "" && !importerNamesInDb.has(data.importer)
      ? data.importer
      : null

  /** Sempre string: evita Select alternar entre não controlado (`undefined`) e controlado. */
  const importerSelectValue =
    data.importerId || (orphanImporter ? IMPORTER_ORPHAN_VALUE : "")

  const handleImporterSelect = async (val: string) => {
    if (!val) {
      onLabelPatch({
        importerId: "",
        importer: "",
        importerAddressStreet: "",
        importerAddressCityState: "",
        importerAddressPostal: "",
        importerSacLine: "",
      })
      return
    }
    if (val === IMPORTER_ORPHAN_VALUE) return
    const full = await getImporterById(val)
    if (!full) return
    onLabelPatch({
      importerId: val,
      importer: full.razao_social,
      ...labelAddressFieldsFromImporter(full),
      importerSacLine: labelSacLineFromImporter(full),
    })
  }

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Modelo de Produto</h2>
        <h3 className="font-serif text-xl font-light text-foreground">Configuração do Modelo</h3>
      </div>

      {/* PROPORÇÃO */}
      <div className="space-y-4">
        <LabelProportionFields data={data} onChange={onChange} fieldClassName={projectFieldClass} />
      </div>

      {/* IDENTIDADE DO PRODUTO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Identidade do Produto</h4>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nome do Produto</Label>
            <Input 
              value={data.productName} 
              onChange={(e) => onChange("productName", e.target.value)} 
              className={cn(projectFieldClass)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Código</Label>
              <Input 
                value={data.code} 
                onChange={(e) => onChange("code", e.target.value)} 
                className={cn(projectFieldClass)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Marca</Label>
              <Input 
                value={data.brand} 
                onChange={(e) => onChange("brand", e.target.value)} 
                className={cn(projectFieldClass)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CLASSIFICAÇÃO ETÁRIA E CERTIFICAÇÃO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Classificação etária e certificação
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Qual a restrição de idade para seu produto, segundo o órgão certificador?
            </Label>
            <Select
              value={certifierAgeRestrictionForSelect(data.certifierAgeRestriction)}
              onValueChange={(val) => onChange("certifierAgeRestriction", val || "")}
            >
              <SelectTrigger className={cn("w-full", projectFieldClass)}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CERTIFIER_AGE_RESTRICTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Indicação</Label>
            <LabelAgeIndicationField
              value={data.ageIndication}
              onChange={(val) => onChange("ageIndication", val)}
              fieldClassName={projectFieldClass}
              idPrefix="model-config-indication"
            />
          </div>
        </div>
      </div>

      {/* LOGÍSTICA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Logística</h4>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Importador</Label>
            <Select
              value={importerSelectValue}
              onValueChange={(val) => void handleImporterSelect(val ?? "")}
              disabled={importersLoading}
            >
              <SelectTrigger className={cn("w-full", projectFieldClass)}>
                <SelectValue
                  placeholder={
                    importersLoading
                      ? "Carregando importadores…"
                      : importerRows.length === 0
                        ? "Cadastre um importador em Importador"
                        : "Selecione…"
                  }
                >
                  {(value) => {
                    if (value == null || value === "") return null
                    if (value === IMPORTER_ORPHAN_VALUE) return orphanImporter
                    const row = importerRows.find((r) => r.id === value)
                    const name = row?.razao_social ?? data.importer.trim()
                    return name || null
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {orphanImporter ? (
                  <SelectItem key="__orphan__" value={IMPORTER_ORPHAN_VALUE}>
                    {orphanImporter}
                  </SelectItem>
                ) : null}
                {importerRows.map((row) => (
                  <SelectItem key={row.id} value={row.id}>
                    {row.razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!importersLoading && importerRows.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">
                Nenhum importador vinculado à sua conta. Use o menu <strong>Importador</strong> para cadastrar.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Origem</Label>
              <Select value={data.origin} onValueChange={(val) => onChange("origin", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      <span className="mr-2">{country.flag}</span>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantidade</Label>
              <Input 
                value={data.quantity} 
                onChange={(e) => onChange("quantity", e.target.value)} 
                className={cn(projectFieldClass)}
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fabricação</Label>
              <Input 
                value={data.manufactureDate} 
                onChange={(e) => {
                  const { formatted, digits } = parseMmYyyyMaskInput(e.target.value)
                  setManufactureDateErrors(monthErrorsForMmYyyy(digits))
                  onChange("manufactureDate", formatted)
                }}
                className={cn(
                  projectFieldClass,
                  "transition-all",
                  manufactureDateErrors.length > 0 &&
                    "border-red-600 bg-red-50 text-red-900 caret-red-900 focus-visible:border-red-600 focus-visible:ring-red-300/60",
                )}
                placeholder="MM/AAAA"
                maxLength={7}
              />
              {manufactureDateErrors.length > 0 && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {manufactureDateErrors.map((err, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold text-red-700 transition-all animate-in fade-in slide-in-from-top-1 duration-200"
                    >
                      {err}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5 focus-within:ring-0">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lote</Label>
              <Input 
                value={data.batch} 
                onChange={(e) => onChange("batch", e.target.value)} 
                className={cn(projectFieldClass)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <LabelPackagingFields data={data} onPatch={onLabelPatch} fieldClassName={projectFieldClass} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data de Validade</Label>
              <Input 
                value={data.expiryDate} 
                onChange={(e) => {
                  const { formatted, digits } = parseMmYyyyMaskInput(e.target.value)
                  const newErrors: string[] = [...monthErrorsForMmYyyy(digits)]
                  if (digits.length === 6) {
                    const year = parseInt(digits.slice(2), 10)
                    if (year < 2026) newErrors.push("O ano deve ser superior a 2025")
                  }
                  setExpiryErrors(newErrors)
                  onChange("expiryDate", formatted)
                }}
                disabled={data.isExpiryIndeterminate}
                className={cn(
                  projectFieldClass,
                  "transition-all",
                  data.isExpiryIndeterminate &&
                    "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-90",
                  !data.isExpiryIndeterminate &&
                    expiryErrors.length > 0 &&
                    "border-red-600 bg-red-50 text-red-900 caret-red-900 focus-visible:border-red-600 focus-visible:ring-red-300/60"
                )}
                placeholder={data.isExpiryIndeterminate ? "Indeterminada" : "MM/AAAA"}
                maxLength={7}
              />
              {expiryErrors.length > 0 && !data.isExpiryIndeterminate && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {expiryErrors.map((err, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-red-700 transition-all animate-in fade-in slide-in-from-top-1 duration-200">
                      {err}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer group/check">
                <input 
                  type="checkbox" 
                  checked={data.isExpiryIndeterminate} 
                  onChange={(e) => onChange("isExpiryIndeterminate", e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover/check:text-foreground transition-colors">Indeterminada</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SEGURANÇA E AVISOS */}
      <div className="space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Segurança e Avisos</h4>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qual a Função?</Label>
            <Select value={data.functionType} onValueChange={(val) => onChange("functionType", val || "")}>
              <SelectTrigger className={cn("w-full", projectFieldClass)}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">MANUAL</SelectItem>
                <SelectItem value="MOTORIZADO">MOTORIZADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilhas e Baterias</Label>
              <Select value={data.hasBatteries} onValueChange={(val) => onChange("hasBatteries", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de Bateria</Label>
              <Select value={data.batteryType} onValueChange={(val) => onChange("batteryType", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantidade de Bateria</Label>
              <Select value={data.batteryQuantity} onValueChange={(val) => onChange("batteryQuantity", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilhas ou Baterias Inclusas</Label>
              <Select value={data.batteriesIncluded} onValueChange={(val) => onChange("batteriesIncluded", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contém fecho metálico na embalagem?</Label>
            <Select value={data.hasMetalFastener} onValueChange={(val) => onChange("hasMetalFastener", val || "")}>
              <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Saco plástico com abertura maior ou igual a 20cm?</Label>
            <Select value={data.hasLargePlasticBag} onValueChange={(val) => onChange("hasLargePlasticBag", val || "")}>
              <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contém bolinhas?</Label>
              <Select value={data.hasSmallBalls} onValueChange={(val) => onChange("hasSmallBalls", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contém corda comprida?</Label>
              <Select value={data.hasLongString} onValueChange={(val) => onChange("hasLongString", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NAO</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Seu produto contém bexiga ou algum balão?
              </Label>
              <Select value={data.hasBalloonOrBall} onValueChange={(val) => onChange("hasBalloonOrBall", val || "")}>
                <SelectTrigger className={cn("w-full", projectFieldClass)}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Seu produto é ou contém projéteis, pistolas com projéteis ou pistola ou lançador de água?
              </Label>
              <Select
                value={data.hasProjectilesOrWaterGun}
                onValueChange={(val) => onChange("hasProjectilesOrWaterGun", val || "")}
              >
                <SelectTrigger className={cn("w-full", projectFieldClass)}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Seu produto contém som, músicas ou ruídos?
            </Label>
            <Select
              value={data.hasSoundMusicNoise}
              onValueChange={(val) => {
                onChange("hasSoundMusicNoise", val || "")
                if (val !== "Sim") onChange("soundDecibels", "")
              }}
            >
              <SelectTrigger className={cn("w-full", projectFieldClass)}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data.hasSoundMusicNoise === "Sim" && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Decibéis (dB)</Label>
              <Input
                value={data.soundDecibels}
                onChange={(e) => onChange("soundDecibels", e.target.value)}
                className={cn(projectFieldClass)}
                placeholder="Ex.: 85"
                inputMode="decimal"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
