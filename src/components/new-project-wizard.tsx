"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Lightbulb, Sparkles, X } from "lucide-react"

import type { LabelData } from "@/types/label"
import { LabelPreview } from "@/components/label-preview"
import { labelPreviewOuterHeightPx, LABEL_PREVIEW_DESIGN_W_PX, parseCmDimensions } from "@/types/label-layout"
import { LabelProportionFields } from "@/components/label-proportion-fields"

import { getImporterById, getImporters, type ImporterListRow } from "@/app/actions/importer"
import { labelAddressFieldsFromImporter, labelSacLineFromImporter } from "@/lib/importer-address-for-label"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { countries } from "@/constants/countries"
import {
  CERTIFIER_AGE_RESTRICTION_OPTIONS,
  certifierAgeRestrictionForSelect,
} from "@/constants/age-options"
import { LabelAgeIndicationField } from "@/components/label-age-indication-field"
import { LabelPackagingFields } from "@/components/label-packaging-fields"

const IMPORTER_ORPHAN_VALUE = "__orphan__"

const PROJECT_NAME_REQUIRED_MSG = "Informe o nome do projeto."

/** Cartão padrão das etapas — vidro leve + sombra suave */
const STEP_CARD =
  "rounded-3xl border border-slate-200/90 bg-white/90 p-8 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-100/80 backdrop-blur-sm"

const projectFieldClass =
  "rounded-xl border border-slate-200 bg-white font-medium text-slate-900 caret-slate-900 shadow-sm placeholder:text-slate-400 transition-[box-shadow,border-color] focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:ring-offset-0"

function parseMmYyyyMaskInput(raw: string): { formatted: string; digits: string } {
  const digits = raw.replace(/\D/g, "").slice(0, 6)
  let formatted = digits
  if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
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

type WizardSectionId = "instructions" | "proportion" | "identity" | "age" | "logistics" | "safety" | "preview"

type WizardSection = {
  id: WizardSectionId
  title: string
  subtitle?: string
}

const SECTIONS: WizardSection[] = [
  {
    id: "instructions",
    title: "Vamos montar seu novo projeto",
    subtitle: "Responda algumas perguntas rápidas. Com isso, vamos gerar uma etiqueta completa e pronta para você ajustar no editor.",
  },
  { id: "proportion", title: "Proporção", subtitle: "Escolha o tamanho em centímetros ou um preset. Em Personalizado, informe a largura e altura." },
  { id: "identity", title: "Identidade do Produto", subtitle: "Informações essenciais do produto." },
  { id: "age", title: "Classificação etária e certificação", subtitle: "Defina restrições e indicações de idade." },
  { id: "logistics", title: "Logística", subtitle: "Dados de importador, origem e lote/validade." },
  { id: "safety", title: "Segurança e Avisos", subtitle: "Respostas que influenciam o conteúdo de avisos." },
  { id: "preview", title: "Pré-visualização", subtitle: "Confira a etiqueta gerada com os dados informados." },
]

export type NewProjectWizardResult = { labelTitle: string; data: LabelData }

type Props = {
  initialLabelTitle: string
  initialData: LabelData
  onCancel: () => void
  onFinish: (result: NewProjectWizardResult) => void
}

export function NewProjectWizard({ initialLabelTitle, initialData, onCancel, onFinish }: Props) {
  const [labelTitle, setLabelTitle] = useState(initialLabelTitle)
  const [data, setData] = useState<LabelData>(initialData)

  const [sectionIdx, setSectionIdx] = useState(0)

  const section = SECTIONS[sectionIdx]
  const stepsCount = SECTIONS.length
  const progress = useMemo(() => {
    if (stepsCount <= 1) return 0
    return Math.round((sectionIdx / (stepsCount - 1)) * 100)
  }, [sectionIdx, stepsCount])

  const [expiryErrors, setExpiryErrors] = useState<string[]>([])
  const [manufactureDateErrors, setManufactureDateErrors] = useState<string[]>([])
  const [projectNameError, setProjectNameError] = useState("")

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
    [importerRows],
  )

  const orphanImporter =
    data.importer.trim() !== "" && !importerNamesInDb.has(data.importer) ? data.importer : null

  const importerSelectValue =
    data.importerId || (orphanImporter ? IMPORTER_ORPHAN_VALUE : "")

  const patch = (p: Partial<LabelData>) => setData((prev) => ({ ...prev, ...p }))
  const change = <K extends keyof LabelData>(field: K, value: LabelData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const updateLabelTitle = (value: string) => {
    setLabelTitle(value)
    if (projectNameError) setProjectNameError("")
  }

  const handleImporterSelect = async (val: string) => {
    if (!val) {
      patch({
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
    patch({
      importerId: val,
      importer: full.razao_social,
      ...labelAddressFieldsFromImporter(full),
      importerSacLine: labelSacLineFromImporter(full),
    })
  }

  const canGoBack = sectionIdx > 0
  const isLast = section?.id === "preview"

  const goBack = () => {
    if (!canGoBack) return
    setSectionIdx((i) => Math.max(0, i - 1))
  }
  const goNext = () => {
    if (isLast) return
    if (section?.id === "instructions" && !labelTitle.trim()) {
      setProjectNameError(PROJECT_NAME_REQUIRED_MSG)
      return
    }
    if (section?.id === "proportion") {
      const p = data.proportion
      const ok =
        p === "5:2 (Padrão)" ||
        p === "1:1 (Quadrado)" ||
        parseCmDimensions(p) !== null
      if (!ok) return
    }
    setSectionIdx((i) => Math.min(SECTIONS.length - 1, i + 1))
  }

  const finish = () => {
    const trimmed = labelTitle.trim()
    if (!trimmed) {
      setProjectNameError(PROJECT_NAME_REQUIRED_MSG)
      return
    }
    onFinish({ labelTitle: trimmed, data })
  }

  return (
    <div
      className="h-dvh w-full overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(59,130,246,0.14),transparent),linear-gradient(to_bottom,#f8fafc_0%,#ffffff_45%,#f1f5f9_100%)] text-slate-900"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center px-5 py-3.5 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-6 sm:pt-10">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {section.title}
          </h1>
          {section.subtitle ? (
            <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              {section.subtitle}
            </p>
          ) : null}
        </div>

        {section.id === "instructions" ? (
          <div className={STEP_CARD}>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-2 pt-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">
                      O que vai acontecer
                    </p>
                    <p className="text-[15px] leading-relaxed text-slate-700">
                      Responda às perguntas do formulário em etapas simples. Ao final, você terá uma pré-visualização completa da etiqueta e poderá utilizar o editor para ajustes finos antes de salvar.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-50 via-white to-indigo-50/80 p-6 shadow-inner shadow-blue-500/5">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-800">
                    <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
                    Dica
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    Se você ainda não cadastrou um importador, dá pra fazer isso no menu{" "}
                    <strong className="font-semibold text-slate-900">Importador</strong>. Aqui no wizard você pode
                    selecionar um importador existente.
                  </p>
                  <div className="mt-6">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Nome do projeto
                    </Label>
                    <Input
                      id="wizard-project-name"
                      value={labelTitle}
                      onChange={(e) => updateLabelTitle(e.target.value)}
                      required
                      aria-invalid={Boolean(projectNameError)}
                      aria-describedby={projectNameError ? "wizard-project-name-error" : undefined}
                      className={cn(
                        "mt-2 h-11",
                        projectFieldClass,
                        projectNameError &&
                          "border-red-500 bg-red-50/80 focus-visible:border-red-500 focus-visible:ring-red-200/50",
                      )}
                      placeholder="Ex.: Brinquedo X - Linha Y"
                    />
                    {projectNameError ? (
                      <p id="wizard-project-name-error" className="mt-2 text-xs font-medium text-red-600">
                        {projectNameError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {section.id === "proportion" ? (
          <div className={STEP_CARD}>
            <LabelProportionFields data={data} onChange={change} fieldClassName={projectFieldClass} />
          </div>
        ) : null}

        {section.id === "identity" ? (
          <div className={STEP_CARD}>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Nome do Produto
                </Label>
                <Input
                  value={data.productName}
                  onChange={(e) => change("productName", e.target.value)}
                  className={cn(projectFieldClass)}
                />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Código
                  </Label>
                  <Input value={data.code} onChange={(e) => change("code", e.target.value)} className={cn(projectFieldClass)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Marca
                  </Label>
                  <Input value={data.brand} onChange={(e) => change("brand", e.target.value)} className={cn(projectFieldClass)} />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {section.id === "age" ? (
          <div className={STEP_CARD}>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Qual a restrição de idade para seu produto, segundo o órgão certificador?
                </Label>
                <Select
                  value={certifierAgeRestrictionForSelect(data.certifierAgeRestriction)}
                  onValueChange={(val) => change("certifierAgeRestriction", val || "")}
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

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Indicação
                </Label>
                <LabelAgeIndicationField
                  value={data.ageIndication}
                  onChange={(val) => change("ageIndication", val)}
                  fieldClassName={projectFieldClass}
                  idPrefix="wizard-indication"
                />
              </div>
            </div>
          </div>
        ) : null}

        {section.id === "logistics" ? (
          <div className={STEP_CARD}>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Importador
                </Label>
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
                  <p className="text-[10px] text-slate-500">
                    Nenhum importador vinculado à sua conta. Use o menu <strong>Importador</strong> para cadastrar.
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Origem
                  </Label>
                  <Select value={data.origin} onValueChange={(val) => change("origin", (val || "") as any)}>
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Quantidade
                  </Label>
                  <Input value={data.quantity} onChange={(e) => change("quantity", e.target.value)} className={cn(projectFieldClass)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Fabricação
                  </Label>
                  <Input
                    value={data.manufactureDate}
                    onChange={(e) => {
                      const { formatted, digits } = parseMmYyyyMaskInput(e.target.value)
                      setManufactureDateErrors(monthErrorsForMmYyyy(digits))
                      change("manufactureDate", formatted)
                    }}
                    className={cn(
                      projectFieldClass,
                      manufactureDateErrors.length > 0 &&
                        "border-red-600 bg-red-50 text-red-900 caret-red-900 focus-visible:border-red-600 focus-visible:ring-red-300/60",
                    )}
                    placeholder="MM/AAAA"
                    maxLength={7}
                  />
                  {manufactureDateErrors.length > 0 ? (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {manufactureDateErrors.map((err, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-red-700">
                          {err}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Lote
                  </Label>
                  <Input value={data.batch} onChange={(e) => change("batch", e.target.value)} className={cn(projectFieldClass)} />
                </div>
              </div>

              <div className="space-y-4">
                <LabelPackagingFields data={data} onPatch={patch} fieldClassName={projectFieldClass} />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Data de Validade
                  </Label>
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
                      change("expiryDate", formatted)
                    }}
                    disabled={data.isExpiryIndeterminate}
                    className={cn(
                      projectFieldClass,
                      data.isExpiryIndeterminate &&
                        "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-600 opacity-90",
                      !data.isExpiryIndeterminate &&
                        expiryErrors.length > 0 &&
                        "border-red-600 bg-red-50 text-red-900 caret-red-900 focus-visible:border-red-600 focus-visible:ring-red-300/60",
                    )}
                    placeholder={data.isExpiryIndeterminate ? "Indeterminada" : "MM/AAAA"}
                    maxLength={7}
                  />
                  {expiryErrors.length > 0 && !data.isExpiryIndeterminate ? (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {expiryErrors.map((err, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-red-700">
                          {err}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.isExpiryIndeterminate}
                      onChange={(e) => change("isExpiryIndeterminate", e.target.checked as any)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Indeterminada
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {section.id === "safety" ? (
          <div className={STEP_CARD}>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Qual a Função?
                </Label>
                <Select value={data.functionType} onValueChange={(val) => change("functionType", (val || "") as any)}>
                  <SelectTrigger className={cn("w-full", projectFieldClass)}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">MANUAL</SelectItem>
                    <SelectItem value="MOTORIZADO">MOTORIZADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Pilhas e Baterias
                  </Label>
                  <Select value={data.hasBatteries} onValueChange={(val) => change("hasBatteries", (val || "") as any)}>
                    <SelectTrigger className={cn("w-full", projectFieldClass)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NAO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Tipo de Bateria
                  </Label>
                  <Select value={data.batteryType} onValueChange={(val) => change("batteryType", (val || "") as any)}>
                    <SelectTrigger className={cn("w-full", projectFieldClass)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NAO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Quantidade de Bateria
                  </Label>
                  <Select value={data.batteryQuantity} onValueChange={(val) => change("batteryQuantity", (val || "") as any)}>
                    <SelectTrigger className={cn("w-full", projectFieldClass)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NAO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Pilhas ou Baterias Inclusas
                  </Label>
                  <Select value={data.batteriesIncluded} onValueChange={(val) => change("batteriesIncluded", (val || "") as any)}>
                    <SelectTrigger className={cn("w-full", projectFieldClass)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NAO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Contém fecho metálico na embalagem?
                </Label>
                <Select value={data.hasMetalFastener} onValueChange={(val) => change("hasMetalFastener", (val || "") as any)}>
                  <SelectTrigger className={cn("w-full", projectFieldClass)}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIM">SIM</SelectItem>
                    <SelectItem value="NAO">NAO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Saco plástico com abertura maior ou igual a 20cm?
                </Label>
                <Select value={data.hasLargePlasticBag} onValueChange={(val) => change("hasLargePlasticBag", (val || "") as any)}>
                  <SelectTrigger className={cn("w-full", projectFieldClass)}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIM">SIM</SelectItem>
                    <SelectItem value="NAO">NAO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Contém bolinhas?
                  </Label>
                  <Select value={data.hasSmallBalls} onValueChange={(val) => change("hasSmallBalls", (val || "") as any)}>
                    <SelectTrigger className={cn("w-full", projectFieldClass)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NAO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Contém corda comprida?
                  </Label>
                  <Select value={data.hasLongString} onValueChange={(val) => change("hasLongString", (val || "") as any)}>
                    <SelectTrigger className={cn("w-full", projectFieldClass)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIM">SIM</SelectItem>
                      <SelectItem value="NAO">NAO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Seu produto contém bexiga ou algum balão?
                  </Label>
                  <Select value={data.hasBalloonOrBall} onValueChange={(val) => change("hasBalloonOrBall", (val || "") as any)}>
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Seu produto é ou contém projéteis, pistolas com projéteis ou pistola ou lançador de água?
                  </Label>
                  <Select
                    value={data.hasProjectilesOrWaterGun}
                    onValueChange={(val) => change("hasProjectilesOrWaterGun", (val || "") as any)}
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Seu produto contém som, músicas ou ruídos?
                </Label>
                <Select
                  value={data.hasSoundMusicNoise}
                  onValueChange={(val) => {
                    change("hasSoundMusicNoise", (val || "") as any)
                    if (val !== "Sim") change("soundDecibels", "" as any)
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
              {data.hasSoundMusicNoise === "Sim" ? (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Decibéis (dB)
                  </Label>
                  <Input
                    value={data.soundDecibels}
                    onChange={(e) => change("soundDecibels", e.target.value)}
                    className={cn(projectFieldClass)}
                    placeholder="Ex.: 85"
                    inputMode="decimal"
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {section.id === "preview" ? (
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <div className={STEP_CARD}>
              <div className="space-y-5">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Nome do projeto
                  </Label>
                  <Input
                    value={labelTitle}
                    onChange={(e) => updateLabelTitle(e.target.value)}
                    required
                    aria-invalid={Boolean(projectNameError)}
                    aria-describedby={projectNameError ? "wizard-project-name-preview-error" : undefined}
                    className={cn(
                      "mt-2 h-11",
                      projectFieldClass,
                      projectNameError &&
                        "border-red-500 bg-red-50/80 focus-visible:border-red-500 focus-visible:ring-red-200/50",
                    )}
                    placeholder="Ex.: Brinquedo X - Linha Y"
                  />
                  {projectNameError ? (
                    <p id="wizard-project-name-preview-error" className="mt-2 text-xs font-medium text-red-600">
                      {projectNameError}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3 text-sm leading-relaxed text-slate-600">
                  Se estiver tudo certo, clique em <strong className="text-slate-900">Continuar/Editrar</strong> para abrir o editor completo.
                </div>
              </div>
            </div>

            <div
              className={cn(
                STEP_CARD,
                "p-4 ring-1 ring-slate-100/90",
              )}
            >
              <div
                className="mx-auto overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/60"
                style={{
                  width: LABEL_PREVIEW_DESIGN_W_PX,
                  height: labelPreviewOuterHeightPx(data.proportion),
                }}
              >
                <LabelPreview data={data} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-12 rounded-2xl border border-slate-200/90 bg-white/70 p-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.1)] backdrop-blur-sm sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 justify-start">
              <Button
                variant="outline"
                size="lg"
                onClick={goBack}
                disabled={!canGoBack}
                className="gap-2 rounded-xl border-slate-200 bg-white font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200/80 [&_svg]:text-slate-700 [&_svg]:transition-colors hover:[&_svg]:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tabular-nums text-slate-700 ring-1 ring-slate-200/80">
              {sectionIdx + 1}/{SECTIONS.length}
            </span>

            <div className="flex min-w-0 flex-1 justify-end">
              {!isLast ? (
                <Button
                  size="lg"
                  onClick={goNext}
                  className="gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700"
                >
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={finish}
                  className="gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4" />
                  Continuar/Editrar
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 w-full border-t border-slate-200/80 pt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Progresso
              </span>
              <span className="text-xs font-semibold tabular-nums text-slate-600">{progress}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90 p-[3px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

