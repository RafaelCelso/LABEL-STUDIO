/** Blocos independentes na etiqueta (posição e tamanho em % da área útil). */
export type LabelBlockId =
  | "seloUpload"
  | "importerAddress"
  | "origin"
  | "quantity"
  | "manufactureDate"
  | "batch"
  | "sac"
  | "productName"
  | "brand"
  | "barcodeUpload"
  | "attention"
  | "indication"
  | "warning";

/** Formatação de texto aplicável a qualquer bloco. */
export interface LabelBlockFmt {
  textAlign?: "left" | "center" | "right" | "justify";
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
}

export interface LabelBlockRect {
  /** % da largura da área útil (0–100) */
  x: number;
  /** % da altura da área útil (0–100) */
  y: number;
  w: number;
  h: number;
  fmt?: LabelBlockFmt;
}

export type LabelBlockLayouts = Record<LabelBlockId, LabelBlockRect>;

/** Largura do preview no editor (px) — alinhada a page.tsx e LabelBlockCanvas. */
export const LABEL_PREVIEW_DESIGN_W_PX = 672;

/** Formato interno: `cm:larguraxaltura` (centímetros), ex.: `cm:10x4`. */
const CM_PROPORTION_RE = /^cm:([\d.,]+)x([\d.,]+)$/i

function parseCmPart(raw: string): number {
  const n = parseFloat(raw.replace(",", "."))
  return Number.isFinite(n) ? n : NaN
}

/** Lê largura × altura em cm a partir de `cm:WxH` ou retorna `null`. */
export function parseCmDimensions(proportion: string): { wCm: number; hCm: number } | null {
  const m = proportion.trim().match(CM_PROPORTION_RE)
  if (!m) return null
  const wCm = parseCmPart(m[1])
  const hCm = parseCmPart(m[2])
  if (!(wCm > 0) || !(hCm > 0)) return null
  return { wCm, hCm }
}

/** Monta o valor persistido em `LabelData.proportion` a partir de cm. */
export function formatCmProportion(wCm: number, hCm: number): string {
  const w = Math.round(wCm * 1000) / 1000
  const h = Math.round(hCm * 1000) / 1000
  return `cm:${w}x${h}`
}

/** Presets em cm equivalentes aos formatos antigos 5:2 e 1:1. */
export const PROPORTION_PRESET_CM = {
  wide: "cm:10x4",
  square: "cm:8x8",
} as const

/** Etiqueta “quadrada” (layout 1:1 / docx com mais espaço vertical). */
export function labelProportionIsSquare(proportion: string): boolean {
  if (proportion === "1:1 (Quadrado)") return true
  if (proportion === "5:2 (Padrão)") return false
  const d = parseCmDimensions(proportion)
  if (!d) return false
  const r = d.wCm / d.hCm
  return r >= 0.92 && r <= 1.08
}

function use11Layout(proportion: string): boolean {
  return labelProportionIsSquare(proportion)
}

/** Teto padrão da altura do preview no editor (mantém canvas compacto). */
export const LABEL_PREVIEW_MAX_HEIGHT_DEFAULT_PX = 600

/**
 * Altura total da caixa branca no preview (inclui faixa do rodapé fixo).
 * `maxHeightPx` maior (ex.: no modal do wizard) dá mais pixels às caixas dos blocos e reduz overflow.
 */
export function labelPreviewOuterHeightPx(
  proportion: string,
  options?: { maxHeightPx?: number },
): number {
  const cap = options?.maxHeightPx ?? LABEL_PREVIEW_MAX_HEIGHT_DEFAULT_PX
  const d = parseCmDimensions(proportion)
  if (d) {
    return Math.min(cap, LABEL_PREVIEW_DESIGN_W_PX * (d.hCm / d.wCm))
  }
  const raw =
    proportion === "5:2 (Padrão)"
      ? LABEL_PREVIEW_DESIGN_W_PX / 1.25
      : LABEL_PREVIEW_DESIGN_W_PX
  return Math.min(cap, raw)
}

/** Reservado ao rodapé em label-preview (h-[calc(100%-18px)]). */
export const LABEL_PREVIEW_FOOTER_STRIP_PX = 18;

/** Altura em px da área dos blocos Rnd (as % do layout referem-se a isto). */
export function labelBlockCanvasAreaHeightPx(proportion: string): number {
  return Math.max(
    120,
    labelPreviewOuterHeightPx(proportion) - LABEL_PREVIEW_FOOTER_STRIP_PX,
  );
}

/** Dimensões de referência (mm) da etiqueta física total (defaults / DOCX). */
export function getLabelRefMm(proportion: string): { w: number; h: number } {
  const d = parseCmDimensions(proportion)
  if (d) {
    return { w: d.wCm * 10, h: d.hCm * 10 }
  }
  if (proportion === "1:1 (Quadrado)") return { w: 80, h: 80 };
  return { w: 100, h: 40 };
}

/**
 * Referência mm da **área útil** dos blocos (proporção do rodapé descontada),
 * para minPx/toPx usarem a mesma escala vertical que o contentor em px.
 */
export function getBlockCanvasRefMm(proportion: string): {
  w: number;
  h: number;
} {
  const ref = getLabelRefMm(proportion);
  const outerPx = labelPreviewOuterHeightPx(proportion);
  const innerPx = labelBlockCanvasAreaHeightPx(proportion);
  const innerH_mm = ref.h * (innerPx / outerPx);
  return { w: ref.w, h: innerH_mm };
}

/**
 * Largura/altura mínimas por bloco (mm).
 */
export const LABEL_BLOCK_MIN_MM: Record<
  LabelBlockId,
  { w: number; h: number }
> = {
  seloUpload: { w: 22, h: 11 },
  importerAddress: { w: 38, h: 16 },
  origin: { w: 16, h: 5 },
  quantity: { w: 20, h: 5 },
  manufactureDate: { w: 24, h: 5 },
  batch: { w: 38, h: 6 },
  sac: { w: 42, h: 7 },
  productName: { w: 44, h: 9 },
  brand: { w: 28, h: 7 },
  barcodeUpload: { w: 20, h: 11 },
  attention: { w: 48, h: 24 },
  indication: { w: 44, h: 10 },
  warning: { w: 48, h: 26 },
};

const BLOCK_IDS = [
  "seloUpload",
  "importerAddress",
  "origin",
  "quantity",
  "manufactureDate",
  "batch",
  "sac",
  "productName",
  "brand",
  "barcodeUpload",
  "attention",
  "indication",
  "warning",
] as const satisfies readonly LabelBlockId[];

/** Ordem de renderização no canvas. */
export const LABEL_BLOCK_ORDER = BLOCK_IDS as readonly LabelBlockId[];

// ─── Sistema de Zonas (moldes) ────────────────────────────────────────────────

export interface LabelZone {
  id: LabelBlockId;
  /** % da área útil do canvas */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  column: "left" | "right";
}

/** Zonas para proporção 5:2 (Padrão). Gap de ~6.5% entre colunas; 1% entre linhas. */
export const LABEL_ZONES_5_2: readonly LabelZone[] = [
  {
    id: "seloUpload",
    x: 0,
    y: 0,
    w: 47,
    h: 16,
    label: "Selo / Certificação",
    column: "left",
  },
  {
    id: "importerAddress",
    x: 0,
    y: 18,
    w: 47,
    h: 18,
    label: "Importador",
    column: "left",
  },
  { id: "origin", x: 0, y: 38, w: 47, h: 4, label: "Origem", column: "left" },
  {
    id: "quantity",
    x: 0,
    y: 44,
    w: 47,
    h: 4,
    label: "Quantidade",
    column: "left",
  },
  {
    id: "manufactureDate",
    x: 0,
    y: 50,
    w: 47,
    h: 4,
    label: "Data de Fabricação",
    column: "left",
  },
  {
    id: "batch",
    x: 0,
    y: 56,
    w: 47,
    h: 4,
    label: "Lote / Validade",
    column: "left",
  },
  { id: "sac", x: 0, y: 62, w: 47, h: 6, label: "SAC", column: "left" },
  {
    id: "productName",
    x: 0,
    y: 70,
    w: 47,
    h: 8,
    label: "Nome do Produto",
    column: "left",
  },
  { id: "brand", x: 0, y: 80, w: 47, h: 6, label: "Marca", column: "left" },
  {
    id: "barcodeUpload",
    x: 0,
    y: 88,
    w: 47,
    h: 12,
    label: "Código de Barras",
    column: "left",
  },
  {
    id: "attention",
    x: 53.5,
    y: 0,
    w: 47,
    h: 28,
    label: "Atenção",
    column: "right",
  },
  {
    id: "indication",
    x: 53.5,
    y: 30,
    w: 47,
    h: 14,
    label: "Indicação",
    column: "right",
  },
  {
    id: "warning",
    x: 53.5,
    y: 46,
    w: 47,
    h: 54,
    label: "Advertência",
    column: "right",
  },
];

/** Zonas para proporção 1:1 (Quadrado). Gap de ~6.5% entre colunas; 1% entre linhas. */
export const LABEL_ZONES_1_1: readonly LabelZone[] = [
  {
    id: "seloUpload",
    x: 0,
    y: 0,
    w: 47,
    h: 14,
    label: "Selo / Certificação",
    column: "left",
  },
  {
    id: "importerAddress",
    x: 0,
    y: 16,
    w: 47,
    h: 16,
    label: "Importador",
    column: "left",
  },
  { id: "origin", x: 0, y: 34, w: 47, h: 4, label: "Origem", column: "left" },
  {
    id: "quantity",
    x: 0,
    y: 40,
    w: 47,
    h: 4,
    label: "Quantidade",
    column: "left",
  },
  {
    id: "manufactureDate",
    x: 0,
    y: 46,
    w: 47,
    h: 4,
    label: "Data de Fabricação",
    column: "left",
  },
  {
    id: "batch",
    x: 0,
    y: 52,
    w: 47,
    h: 4,
    label: "Lote / Validade",
    column: "left",
  },
  { id: "sac", x: 0, y: 58, w: 47, h: 5, label: "SAC", column: "left" },
  {
    id: "productName",
    x: 0,
    y: 65,
    w: 47,
    h: 8,
    label: "Nome do Produto",
    column: "left",
  },
  { id: "brand", x: 0, y: 75, w: 47, h: 6, label: "Marca", column: "left" },
  {
    id: "barcodeUpload",
    x: 0,
    y: 83,
    w: 47,
    h: 17,
    label: "Código de Barras",
    column: "left",
  },
  {
    id: "attention",
    x: 53.5,
    y: 0,
    w: 47,
    h: 26,
    label: "Atenção",
    column: "right",
  },
  {
    id: "indication",
    x: 53.5,
    y: 28,
    w: 47,
    h: 12,
    label: "Indicação",
    column: "right",
  },
  {
    id: "warning",
    x: 53.5,
    y: 42,
    w: 47,
    h: 58,
    label: "Advertência",
    column: "right",
  },
];

export function getLabelZones(proportion: string): readonly LabelZone[] {
  return use11Layout(proportion) ? LABEL_ZONES_1_1 : LABEL_ZONES_5_2;
}

/** Tolerância em % para considerar que um bloco está "dentro" de uma zona. */
const ZONE_SNAP_TOL = 3;

/**
 * Encaixa o bloco arrastado na zona mais próxima do centro do drop.
 * Se a zona alvo já estiver ocupada por outro bloco, os dois são trocados.
 * O tamanho (w/h) de cada bloco é preservado para que a zona visual se ajuste
 * ao elemento atualmente posicionado nela.
 */
export function snapBlockToZone(
  movedId: LabelBlockId,
  dropCenterX: number,
  dropCenterY: number,
  layouts: LabelBlockLayouts,
  zones: readonly LabelZone[],
): LabelBlockLayouts {
  if (zones.length === 0) return layouts;

  let targetZone: LabelZone | null = null;
  let minDist = Infinity;
  for (const zone of zones) {
    const cx = zone.x + zone.w / 2;
    const cy = zone.y + zone.h / 2;
    const d = Math.hypot(dropCenterX - cx, dropCenterY - cy);
    if (d < minDist) {
      minDist = d;
      targetZone = zone;
    }
  }
  if (!targetZone) return layouts;

  const movedRect = layouts[movedId];
  const alignZoneX = (zone: LabelZone, blockW: number) =>
    zone.column === "right" ? zone.x + zone.w - blockW : zone.x;

  const currentZone =
    zones.find(
      (z) =>
        Math.abs(alignZoneX(z, movedRect.w) - movedRect.x) <= ZONE_SNAP_TOL &&
        Math.abs(z.y - movedRect.y) <= ZONE_SNAP_TOL,
    ) ?? null;

  if (currentZone && currentZone.id === targetZone.id) return layouts;

  const result = { ...layouts } as LabelBlockLayouts;

  for (const bid of Object.keys(layouts) as LabelBlockId[]) {
    if (bid === movedId) continue;
    const rect = layouts[bid];
    if (
      Math.abs(alignZoneX(targetZone, rect.w) - rect.x) <= ZONE_SNAP_TOL &&
      Math.abs(rect.y - targetZone.y) <= ZONE_SNAP_TOL
    ) {
      result[bid] = {
        ...rect,
        x: currentZone ? alignZoneX(currentZone, rect.w) : rect.x,
        y: currentZone ? currentZone.y : rect.y,
      };
      break;
    }
  }

  result[movedId] = {
    ...movedRect,
    x: alignZoneX(targetZone, movedRect.w),
    y: targetZone.y,
  };
  return result;
}

/** Layout inicial 5:2 — alinhado com LABEL_ZONES_5_2. */
const DEFAULT_5_2: LabelBlockLayouts = {
  seloUpload: { x: 0, y: 0, w: 47, h: 16 },
  importerAddress: { x: 0, y: 18, w: 47, h: 18 },
  origin: { x: 0, y: 38, w: 47, h: 4 },
  quantity: { x: 0, y: 44, w: 47, h: 4 },
  manufactureDate: { x: 0, y: 50, w: 47, h: 4 },
  batch: { x: 0, y: 56, w: 47, h: 4 },
  sac: { x: 0, y: 62, w: 47, h: 6 },
  productName: { x: 0, y: 70, w: 47, h: 8 },
  brand: { x: 0, y: 80, w: 47, h: 6 },
  barcodeUpload: { x: 0, y: 88, w: 47, h: 12 },
  attention: { x: 53.5, y: 0, w: 47, h: 28 },
  indication: { x: 53.5, y: 30, w: 47, h: 14 },
  warning: { x: 53.5, y: 46, w: 47, h: 54 },
};

/** Layout inicial 1:1 — alinhado com LABEL_ZONES_1_1. */
const DEFAULT_1_1: LabelBlockLayouts = {
  seloUpload: { x: 0, y: 0, w: 47, h: 14 },
  importerAddress: { x: 0, y: 16, w: 47, h: 16 },
  origin: { x: 0, y: 34, w: 47, h: 4 },
  quantity: { x: 0, y: 40, w: 47, h: 4 },
  manufactureDate: { x: 0, y: 46, w: 47, h: 4 },
  batch: { x: 0, y: 52, w: 47, h: 4 },
  sac: { x: 0, y: 58, w: 47, h: 5 },
  productName: { x: 0, y: 65, w: 47, h: 8 },
  brand: { x: 0, y: 75, w: 47, h: 6 },
  barcodeUpload: { x: 0, y: 83, w: 47, h: 17 },
  attention: { x: 53.5, y: 0, w: 47, h: 26 },
  indication: { x: 53.5, y: 28, w: 47, h: 12 },
  warning: { x: 53.5, y: 42, w: 47, h: 58 },
};

export function getDefaultLabelBlockLayouts(
  proportion: string,
): LabelBlockLayouts {
  return use11Layout(proportion)
    ? { ...DEFAULT_1_1 }
    : { ...DEFAULT_5_2 };
}

/**
 * Combina layout guardado com os defaults da proporção.
 * Blocos que não estejam alinhados a uma zona (posições do sistema antigo) são descartados
 * e substituídos pelo default — assim projectos criados antes do sistema de zonas
 * migram automaticamente na primeira abertura.
 */
export function mergeLabelBlockLayouts(
  proportion: string,
  stored: LabelBlockLayouts | null | undefined,
): LabelBlockLayouts {
  const base = getDefaultLabelBlockLayouts(proportion);
  if (!stored) return base;

  const next = { ...base };
  for (const id of BLOCK_IDS) {
    const r = stored[id];
    if (
      r &&
      typeof r.x === "number" &&
      typeof r.y === "number" &&
      typeof r.w === "number" &&
      typeof r.h === "number"
    ) {
      // Como agora temos posicionamento livre, aceitamos qualquer posição (x,y)
      // e mantemos a formatação (fmt).
      // Se não houver formatação salva, mescla com a base se existir.
      next[id] = { ...r, fmt: r.fmt ?? base[id].fmt };
    }
  }
  return next;
}
