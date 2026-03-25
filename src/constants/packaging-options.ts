/** Opções comuns de tipo de embalagem (para seleção no formulário). */
export const PACKAGING_TYPE_OPTIONS = [
  "Caixa de papelão",
  "Envelope de papel / cartolina",
  "Saco plástico",
  "Saco de papel",
  "Embalagem blister (plástico e cartão)",
  "Tetra Pak (cartão para bebidas)",
  "Garrafa PET",
  "Frasco de vidro",
  "Pote plástico",
  "Lata metálica",
  "Balde plástico",
  "Saquinho / sachê (laminado)",
] as const

export type PackagingTypeOption = (typeof PACKAGING_TYPE_OPTIONS)[number]

