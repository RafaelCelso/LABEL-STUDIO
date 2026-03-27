/** Opções principais do select “tipo de embalagem do produto”. */
export const PACKAGING_MAIN_OPTIONS = [
  "Blister",
  "Color Box",
  "Display",
  "Tag",
  "Cinta",
  "Solapa",
  "Tie Card",
  "OPP Bag",
  "Sticker",
  "Outro",
] as const

export type PackagingMainOption = (typeof PACKAGING_MAIN_OPTIONS)[number]

/** Variante quando o tipo principal é Color Box. */
export const PACKAGING_COLOR_BOX_VARIANTS = ["Caixa", "Windowbox"] as const

export type PackagingColorBoxVariant = (typeof PACKAGING_COLOR_BOX_VARIANTS)[number]

/** Texto legal exibido ao escolher Color Box → Caixa. */
export const PACKAGING_COLOR_BOX_CAIXA_NOTICE =
  "O símbolo de restrição precisa estar em uma das faces mais visíveis da embalagem, ou seja, se as informações estiverem na parte debaixo da caixa, o símbolo de restrição precisa aparecer também na frente da caixa. Para mais detalhes, consultar a seção 5.9.2.4 da Portaria 302."

export function packagingMainForSelect(stored: string): string {
  return (PACKAGING_MAIN_OPTIONS as readonly string[]).includes(stored) ? stored : ""
}

export function packagingColorBoxVariantForSelect(stored: string): string {
  return (PACKAGING_COLOR_BOX_VARIANTS as readonly string[]).includes(stored) ? stored : ""
}

/** Texto consolidado para exibição (etiqueta, relatórios). */
export function formatPackagingDisplay(fields: {
  packagingType: string
  packagingColorBoxVariant: string
  packagingOther: string
}): string {
  const main = fields.packagingType.trim()
  if (main === "Color Box") {
    const v = fields.packagingColorBoxVariant.trim()
    if (v === "Caixa" || v === "Windowbox") return `Color Box (${v})`
    return "Color Box"
  }
  if (main === "Outro") {
    const o = fields.packagingOther.trim()
    return o || "Outro"
  }
  return main
}
