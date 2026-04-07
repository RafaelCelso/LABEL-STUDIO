"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Lightbulb,
  Sparkles,
  X,
} from "lucide-react";

import type { LabelData } from "@/types/label";
import { stripWizardDraft } from "@/types/label";
import { saveProject, updateProject } from "@/app/actions/project";
import { toast } from "sonner";
import { LabelPreview } from "@/components/label-preview";
import {
  labelPreviewOuterHeightPx,
  LABEL_PREVIEW_DESIGN_W_PX,
  parseCmDimensions,
} from "@/types/label-layout";
import { LabelProportionFields } from "@/components/label-proportion-fields";

import {
  getImporterById,
  getImporters,
  type ImporterListRow,
} from "@/app/actions/importer";
import {
  labelAddressFieldsFromImporter,
  labelSacLineFromImporter,
} from "@/lib/importer-address-for-label";

import { AppGradientLayer } from "@/components/app-gradient-layer";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { countries } from "@/constants/countries";
import {
  CERTIFIER_AGE_RESTRICTION_OPTIONS,
  certifierAgeRestrictionForSelect,
} from "@/constants/age-options";
import { LabelAgeIndicationField } from "@/components/label-age-indication-field";
import { LabelPackagingFields } from "@/components/label-packaging-fields";

const IMPORTER_ORPHAN_VALUE = "__orphan__";

const PROJECT_NAME_REQUIRED_MSG = "Informe o nome do projeto.";

/** Cartão das etapas — alinhado ao vidro das telas de auth */
const STEP_CARD = "auth-frost-panel p-5 sm:p-8 md:p-10";

const projectFieldClass =
  "rounded-xl border border-input bg-background font-medium text-foreground caret-foreground shadow-sm placeholder:text-muted-foreground transition-[box-shadow,border-color] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0";

function parseMmYyyyMaskInput(raw: string): {
  formatted: string;
  digits: string;
} {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  let formatted = digits;
  if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return { formatted, digits };
}

function monthErrorsForMmYyyy(digits: string): string[] {
  const errors: string[] = [];
  if (digits.length >= 2) {
    const month = parseInt(digits.slice(0, 2), 10);
    if (month > 12) errors.push("Mês inválido (máx. 12)");
    else if (month === 0) errors.push("Mês inválido (00)");
  }
  return errors;
}

type WizardSectionId =
  | "instructions"
  | "proportion"
  | "identity"
  | "age"
  | "logistics"
  | "safety"
  | "preview";

type WizardSection = {
  id: WizardSectionId;
  title: string;
  subtitle?: string;
};

const SECTIONS: WizardSection[] = [
  {
    id: "instructions",
    title: "Vamos montar seu novo projeto",
    subtitle:
      "Responda algumas perguntas rápidas. Com isso, vamos gerar uma etiqueta completa e pronta para você ajustar no editor.",
  },
  {
    id: "proportion",
    title: "Proporção",
    subtitle:
      "Escolha o tamanho em centímetros ou um preset. Em Personalizado, informe a largura e altura.",
  },
  {
    id: "identity",
    title: "Identidade do Produto",
    subtitle: "Informações essenciais do produto.",
  },
  {
    id: "age",
    title: "Classificação etária e certificação",
    subtitle: "Defina restrições e indicações de idade.",
  },
  {
    id: "logistics",
    title: "Logística",
    subtitle: "Dados de importador, origem e lote/validade.",
  },
  {
    id: "safety",
    title: "Segurança e Avisos",
    subtitle: "Respostas que influenciam o conteúdo de avisos.",
  },
  {
    id: "preview",
    title: "Pré-visualização",
    subtitle: "Confira a etiqueta gerada com os dados informados.",
  },
];

export const WIZARD_SECTION_COUNT = SECTIONS.length;

export type NewProjectWizardResult = {
  labelTitle: string;
  data: LabelData;
  projectId: string | null;
};

type Props = {
  initialLabelTitle: string;
  initialData: LabelData;
  /** Etapa inicial (retomada de rascunho salvo no projeto). */
  initialSectionIdx?: number;
  /** ID do projeto já criado no banco ao salvar rascunho entre etapas. */
  draftProjectId: string | null;
  /** Persiste rascunho ao avançar (create ou update). */
  onSaveProgress: (args: {
    labelTitle: string;
    data: LabelData;
    existingProjectId: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  onFinish: (result: NewProjectWizardResult) => void;
};

export function NewProjectWizard({
  initialLabelTitle,
  initialData,
  initialSectionIdx = 0,
  draftProjectId,
  onSaveProgress,
  onCancel,
  onFinish,
}: Props) {
  const [labelTitle, setLabelTitle] = useState(initialLabelTitle);
  const [data, setData] = useState<LabelData>(initialData);

  const [sectionIdx, setSectionIdx] = useState(() =>
    Math.min(Math.max(0, initialSectionIdx), SECTIONS.length - 1),
  );
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const section = SECTIONS[sectionIdx];
  const stepsCount = SECTIONS.length;
  const progress = useMemo(() => {
    if (stepsCount <= 1) return 0;
    return Math.round((sectionIdx / (stepsCount - 1)) * 100);
  }, [sectionIdx, stepsCount]);

  const [expiryErrors, setExpiryErrors] = useState<string[]>([]);
  const [manufactureDateErrors, setManufactureDateErrors] = useState<string[]>(
    [],
  );
  const [projectNameError, setProjectNameError] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalMaxOuterPx, setPreviewModalMaxOuterPx] = useState(820);
  const previewDialogRef = useRef<HTMLDivElement>(null);

  const [importerRows, setImporterRows] = useState<ImporterListRow[]>([]);
  const [importersLoading, setImportersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setImportersLoading(true);
      const rows = await getImporters();
      if (!cancelled) {
        setImporterRows(rows);
        setImportersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!previewModalOpen) return;
    const applyOuterCap = () => {
      setPreviewModalMaxOuterPx(
        Math.max(560, Math.min(960, Math.floor(window.innerHeight * 0.82))),
      );
    };
    applyOuterCap();
    window.addEventListener("resize", applyOuterCap);
    return () => window.removeEventListener("resize", applyOuterCap);
  }, [previewModalOpen]);

  useEffect(() => {
    if (!previewModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewModalOpen]);

  useEffect(() => {
    if (!previewModalOpen) return;
    const id = requestAnimationFrame(() => {
      previewDialogRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [previewModalOpen]);

  /** Um pouco acima da proporção para textos longos, sem ocupar quase a tela inteira. */
  const modalPreviewOuterHeightPx = useMemo(() => {
    const cap = previewModalMaxOuterPx;
    const fromProportion = labelPreviewOuterHeightPx(data.proportion, {
      maxHeightPx: cap,
    });
    const boosted = Math.floor(fromProportion * 1.18);
    return Math.min(cap, Math.max(fromProportion, boosted));
  }, [data.proportion, previewModalMaxOuterPx]);

  const importerNamesInDb = useMemo(
    () => new Set(importerRows.map((r) => r.razao_social)),
    [importerRows],
  );

  const orphanImporter =
    data.importer.trim() !== "" && !importerNamesInDb.has(data.importer)
      ? data.importer
      : null;

  const importerSelectValue =
    data.importerId || (orphanImporter ? IMPORTER_ORPHAN_VALUE : "");

  const patch = (p: Partial<LabelData>) =>
    setData((prev) => ({ ...prev, ...p }));
  const change = <K extends keyof LabelData>(field: K, value: LabelData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const updateLabelTitle = (value: string) => {
    setLabelTitle(value);
    if (projectNameError) setProjectNameError("");
  };

  const handleImporterSelect = async (val: string) => {
    if (!val) {
      patch({
        importerId: "",
        importer: "",
        importerAddressStreet: "",
        importerAddressCityState: "",
        importerAddressPostal: "",
        importerSacLine: "",
      });
      return;
    }
    if (val === IMPORTER_ORPHAN_VALUE) return;
    const full = await getImporterById(val);
    if (!full) return;
    patch({
      importerId: val,
      importer: full.razao_social,
      ...labelAddressFieldsFromImporter(full),
      importerSacLine: labelSacLineFromImporter(full),
    });
  };

  const canGoBack = sectionIdx > 0;
  const isLast = section?.id === "preview";

  const goBack = () => {
    if (!canGoBack) return;
    setSectionIdx((i) => Math.max(0, i - 1));
  };
  const goNext = async () => {
    if (isLast) return;
    if (section?.id === "instructions" && !labelTitle.trim()) {
      setProjectNameError(PROJECT_NAME_REQUIRED_MSG);
      return;
    }
    if (section?.id === "proportion") {
      const p = data.proportion;
      const ok =
        p === "5:2 (Padrão)" ||
        p === "1:1 (Quadrado)" ||
        parseCmDimensions(p) !== null;
      if (!ok) return;
    }
    const nextIdx = Math.min(SECTIONS.length - 1, sectionIdx + 1);
    const titleForSave = labelTitle.trim() || "Rascunho";
    const dataToSave: LabelData = {
      ...data,
      wizardDraft: { sectionIdx: nextIdx },
    };
    setIsSavingProgress(true);
    const result = await onSaveProgress({
      labelTitle: titleForSave,
      data: dataToSave,
      existingProjectId: draftProjectId,
    });
    setIsSavingProgress(false);
    if (!result.success) {
      toast.error(
        result.error ?? "Não foi possível salvar o rascunho. Tente de novo.",
      );
      return;
    }
    setData(dataToSave);
    setSectionIdx(nextIdx);
  };

  const finish = async () => {
    const trimmed = labelTitle.trim();
    if (!trimmed) {
      setProjectNameError(PROJECT_NAME_REQUIRED_MSG);
      return;
    }
    const clean = stripWizardDraft(data);
    setIsSavingProgress(true);
    try {
      if (draftProjectId) {
        const r = await updateProject(draftProjectId, trimmed, clean);
        if (!r.success) {
          toast.error(
            r.error ?? "Não foi possível concluir o projeto. Tente de novo.",
          );
          return;
        }
        onFinish({
          labelTitle: trimmed,
          data: clean,
          projectId: draftProjectId,
        });
      } else {
        const r = await saveProject(trimmed, clean);
        if (!r.success) {
          toast.error(
            r.error ?? "Não foi possível salvar o projeto. Tente de novo.",
          );
          return;
        }
        const id =
          r.project && typeof (r.project as { id?: string }).id === "string"
            ? (r.project as { id: string }).id
            : null;
        onFinish({ labelTitle: trimmed, data: clean, projectId: id });
      }
    } finally {
      setIsSavingProgress(false);
    }
  };

  return (
    <div
      className="relative h-dvh w-full overflow-x-hidden overflow-y-auto bg-card text-foreground"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <AppGradientLayer idPrefix="wizard" fixed />
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-border bg-background/80 font-semibold text-foreground shadow-sm hover:bg-muted hover:text-foreground"
            onClick={() => setPreviewModalOpen(true)}
          >
            <Eye className="h-4 w-4" aria-hidden />
            Pré-visualizar
          </Button>
        </div>
      </header>

      {previewModalOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[300]" role="presentation">
              <button
                type="button"
                className="absolute inset-0 z-0 cursor-default border-0 bg-black/45 p-0 backdrop-blur-sm"
                aria-label="Fechar pré-visualização"
                onClick={() => setPreviewModalOpen(false)}
              />
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                <div
                  ref={previewDialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="wizard-label-preview-title"
                  aria-describedby="wizard-label-preview-desc"
                  tabIndex={-1}
                  className={cn(
                    "pointer-events-auto flex max-h-[min(88svh,1020px)] w-[min(100vw-1.5rem,54rem)] flex-col overflow-y-auto rounded-2xl border border-border",
                    "bg-card text-card-foreground shadow-2xl",
                  )}
                >
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
                    <h2
                      id="wizard-label-preview-title"
                      className="text-base font-semibold sm:text-lg"
                    >
                      Pré-visualização da etiqueta
                    </h2>
                    <button
                      type="button"
                      className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Fechar pré-visualização"
                      onClick={() => setPreviewModalOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p id="wizard-label-preview-desc" className="sr-only">
                    Visualização da etiqueta com os dados informados até o
                    momento.
                  </p>
                  <div className="px-4 pb-10 pt-6 sm:px-8 sm:pb-12">
                    <div
                      className="mx-auto overflow-visible rounded-2xl bg-card shadow-lg ring-1 ring-border/60"
                      style={{
                        width: LABEL_PREVIEW_DESIGN_W_PX,
                        height: modalPreviewOuterHeightPx,
                      }}
                    >
                      <LabelPreview data={data} staticPreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-balance font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {section.title}
          </h1>
          {section.subtitle ? (
            <p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              {section.subtitle}
            </p>
          ) : null}
        </div>

        {section.id === "instructions" ? (
          <div className={STEP_CARD}>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-3 text-primary-foreground shadow-md auth-cta-glow">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-2 pt-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                      O que vai acontecer
                    </p>
                    <p className="text-[15px] leading-relaxed text-foreground/90">
                      Responda às perguntas do formulário em etapas simples. Ao
                      final, você terá uma pré-visualização completa da etiqueta
                      e poderá utilizar o editor para ajustes finos antes de
                      salvar.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-chart-3/10 p-6 shadow-inner">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
                    <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
                    Dica
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Se você ainda não cadastrou um importador, dá pra fazer isso
                    no menu{" "}
                    <strong className="font-semibold text-foreground">
                      Importador
                    </strong>
                    . Aqui no wizard você pode selecionar um importador
                    existente.
                  </p>
                  <div className="mt-6">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Nome do projeto
                    </Label>
                    <Input
                      id="wizard-project-name"
                      value={labelTitle}
                      onChange={(e) => updateLabelTitle(e.target.value)}
                      required
                      aria-invalid={Boolean(projectNameError)}
                      aria-describedby={
                        projectNameError
                          ? "wizard-project-name-error"
                          : undefined
                      }
                      className={cn(
                        "mt-2 h-11",
                        projectFieldClass,
                        projectNameError &&
                          "border-red-500 bg-red-50/80 focus-visible:border-red-500 focus-visible:ring-red-200/50",
                      )}
                      placeholder="Ex.: Brinquedo X - Linha Y"
                    />
                    {projectNameError ? (
                      <p
                        id="wizard-project-name-error"
                        className="mt-2 text-xs font-medium text-red-600"
                      >
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
            <LabelProportionFields
              data={data}
              onChange={change}
              fieldClassName={projectFieldClass}
            />
          </div>
        ) : null}

        {section.id === "identity" ? (
          <div className={STEP_CARD}>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Código
                  </Label>
                  <Input
                    value={data.code}
                    onChange={(e) => change("code", e.target.value)}
                    className={cn(projectFieldClass)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Marca
                  </Label>
                  <Input
                    value={data.brand}
                    onChange={(e) => change("brand", e.target.value)}
                    className={cn(projectFieldClass)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {section.id === "age" ? (
          <div className={STEP_CARD}>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Qual a restrição de idade para seu produto, segundo o órgão
                  certificador?
                </Label>
                <Select
                  value={certifierAgeRestrictionForSelect(
                    data.certifierAgeRestriction,
                  )}
                  onValueChange={(val) =>
                    change("certifierAgeRestriction", val || "")
                  }
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                        if (value == null || value === "") return null;
                        if (value === IMPORTER_ORPHAN_VALUE)
                          return orphanImporter;
                        const row = importerRows.find((r) => r.id === value);
                        const name = row?.razao_social ?? data.importer.trim();
                        return name || null;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {orphanImporter ? (
                      <SelectItem
                        key="__orphan__"
                        value={IMPORTER_ORPHAN_VALUE}
                      >
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
                    Nenhum importador vinculado à sua conta. Use o menu{" "}
                    <strong>Importador</strong> para cadastrar.
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Origem
                  </Label>
                  <Select
                    value={data.origin}
                    onValueChange={(val) =>
                      change("origin", (val || "") as any)
                    }
                  >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quantidade
                  </Label>
                  <Input
                    value={data.quantity}
                    onChange={(e) => change("quantity", e.target.value)}
                    className={cn(projectFieldClass)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fabricação
                  </Label>
                  <Input
                    value={data.manufactureDate}
                    onChange={(e) => {
                      const { formatted, digits } = parseMmYyyyMaskInput(
                        e.target.value,
                      );
                      setManufactureDateErrors(monthErrorsForMmYyyy(digits));
                      change("manufactureDate", formatted);
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
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-red-700"
                        >
                          {err}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Lote
                  </Label>
                  <Input
                    value={data.batch}
                    onChange={(e) => change("batch", e.target.value)}
                    className={cn(projectFieldClass)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <LabelPackagingFields
                  data={data}
                  onPatch={patch}
                  fieldClassName={projectFieldClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Data de Validade
                  </Label>
                  <Input
                    value={data.expiryDate}
                    onChange={(e) => {
                      const { formatted, digits } = parseMmYyyyMaskInput(
                        e.target.value,
                      );
                      const newErrors: string[] = [
                        ...monthErrorsForMmYyyy(digits),
                      ];
                      if (digits.length === 6) {
                        const year = parseInt(digits.slice(2), 10);
                        if (year < 2026)
                          newErrors.push("O ano deve ser superior a 2025");
                      }
                      setExpiryErrors(newErrors);
                      change("expiryDate", formatted);
                    }}
                    disabled={data.isExpiryIndeterminate}
                    className={cn(
                      projectFieldClass,
                      data.isExpiryIndeterminate &&
                        "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-90",
                      !data.isExpiryIndeterminate &&
                        expiryErrors.length > 0 &&
                        "border-red-600 bg-red-50 text-red-900 caret-red-900 focus-visible:border-red-600 focus-visible:ring-red-300/60",
                    )}
                    placeholder={
                      data.isExpiryIndeterminate ? "Indeterminada" : "MM/AAAA"
                    }
                    maxLength={7}
                  />
                  {expiryErrors.length > 0 && !data.isExpiryIndeterminate ? (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {expiryErrors.map((err, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-red-700"
                        >
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
                      onChange={(e) =>
                        change("isExpiryIndeterminate", e.target.checked as any)
                      }
                      className="h-4 w-4 cursor-pointer rounded border-border text-primary accent-primary focus:ring-primary"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Qual a Função?
                </Label>
                <Select
                  value={data.functionType}
                  onValueChange={(val) =>
                    change("functionType", (val || "") as any)
                  }
                >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pilhas e Baterias
                  </Label>
                  <Select
                    value={data.hasBatteries}
                    onValueChange={(val) =>
                      change("hasBatteries", (val || "") as any)
                    }
                  >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tipo de Bateria
                  </Label>
                  <Select
                    value={data.batteryType}
                    onValueChange={(val) =>
                      change("batteryType", (val || "") as any)
                    }
                  >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quantidade de Bateria
                  </Label>
                  <Select
                    value={data.batteryQuantity}
                    onValueChange={(val) =>
                      change("batteryQuantity", (val || "") as any)
                    }
                  >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pilhas ou Baterias Inclusas
                  </Label>
                  <Select
                    value={data.batteriesIncluded}
                    onValueChange={(val) =>
                      change("batteriesIncluded", (val || "") as any)
                    }
                  >
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Contém fecho metálico na embalagem?
                </Label>
                <Select
                  value={data.hasMetalFastener}
                  onValueChange={(val) =>
                    change("hasMetalFastener", (val || "") as any)
                  }
                >
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Saco plástico com abertura maior ou igual a 20cm?
                </Label>
                <Select
                  value={data.hasLargePlasticBag}
                  onValueChange={(val) =>
                    change("hasLargePlasticBag", (val || "") as any)
                  }
                >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Contém bolinhas?
                  </Label>
                  <Select
                    value={data.hasSmallBalls}
                    onValueChange={(val) =>
                      change("hasSmallBalls", (val || "") as any)
                    }
                  >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Contém corda comprida?
                  </Label>
                  <Select
                    value={data.hasLongString}
                    onValueChange={(val) =>
                      change("hasLongString", (val || "") as any)
                    }
                  >
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Seu produto contém bexiga ou algum balão?
                  </Label>
                  <Select
                    value={data.hasBalloonOrBall}
                    onValueChange={(val) =>
                      change("hasBalloonOrBall", (val || "") as any)
                    }
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

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Seu produto é ou contém projéteis, pistolas com projéteis ou
                    pistola ou lançador de água?
                  </Label>
                  <Select
                    value={data.hasProjectilesOrWaterGun}
                    onValueChange={(val) =>
                      change("hasProjectilesOrWaterGun", (val || "") as any)
                    }
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
                    change("hasSoundMusicNoise", (val || "") as any);
                    if (val !== "Sim") change("soundDecibels", "" as any);
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
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
          <div className="flex flex-col gap-6">
            <div className={STEP_CARD}>
              <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Nome do projeto
                  </Label>
                  <Input
                    value={labelTitle}
                    onChange={(e) => updateLabelTitle(e.target.value)}
                    required
                    aria-invalid={Boolean(projectNameError)}
                    aria-describedby={
                      projectNameError
                        ? "wizard-project-name-preview-error"
                        : undefined
                    }
                    className={cn(
                      "mt-2 h-11",
                      projectFieldClass,
                      projectNameError &&
                        "border-red-500 bg-red-50/80 focus-visible:border-red-500 focus-visible:ring-red-200/50",
                    )}
                    placeholder="Ex.: Brinquedo X - Linha Y"
                  />
                  {projectNameError ? (
                    <p
                      id="wizard-project-name-preview-error"
                      className="mt-2 text-xs font-medium text-red-600"
                    >
                      {projectNameError}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  Se estiver tudo certo, clique em{" "}
                  <strong className="text-foreground">Continuar/Editar</strong>{" "}
                  para abrir o editor completo.
                </div>
              </div>
            </div>

            <div className={cn(STEP_CARD, "p-4 ring-1 ring-border/50")}>
              <div
                className="mx-auto overflow-visible rounded-2xl bg-card shadow-lg ring-1 ring-border/60"
                style={{
                  width: LABEL_PREVIEW_DESIGN_W_PX,
                  height: labelPreviewOuterHeightPx(data.proportion, {
                    maxHeightPx: 960,
                  }),
                }}
              >
                <LabelPreview data={data} staticPreview />
              </div>
            </div>
          </div>
        ) : null}

        <div className="auth-frost-panel mt-12 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 justify-start">
              <Button
                variant="outline"
                size="lg"
                onClick={goBack}
                disabled={!canGoBack}
                className="gap-2 rounded-xl border border-border bg-background/80 font-semibold text-foreground shadow-sm transition-colors hover:border-border hover:bg-muted hover:text-foreground active:bg-muted/80 [&_svg]:text-muted-foreground [&_svg]:transition-colors hover:[&_svg]:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>

            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-bold tabular-nums text-foreground ring-1 ring-border/60">
              {sectionIdx + 1}/{SECTIONS.length}
            </span>

            <div className="flex min-w-0 flex-1 justify-end">
              {!isLast ? (
                <Button
                  size="lg"
                  onClick={() => void goNext()}
                  disabled={isSavingProgress}
                  className="auth-cta-glow gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  {isSavingProgress ? (
                    <>
                      <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Salvando…
                    </>
                  ) : (
                    <>
                      Avançar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => void finish()}
                  disabled={isSavingProgress}
                  className="auth-cta-glow gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  {isSavingProgress ? (
                    <>
                      <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Salvando…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Continuar/Editrar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 w-full border-t border-border/60 pt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Progresso
              </span>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                {progress}%
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted p-[3px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
