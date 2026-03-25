/** Opções de faixa etária (certificação / indicação). */
export const AGE_SELECT_OPTIONS = [
  "0+",
  "3+",
  "6+",
  "8+",
  "10+",
  "12+",
  "14+",
  "16+",
  "18+",
] as const

export type AgeSelectValue = (typeof AGE_SELECT_OPTIONS)[number]

/** Texto de indicação na etiqueta / exportação a partir do select de idade. */
export function indicationBodyFromAgeSelect(value: string): string {
  const v = value.trim()
  if (!v) return "ESTE PRODUTO É INDICADO PARA CRIANÇAS A PARTIR DE 3 ANOS."
  if (v === "0+") return "LIVRE PARA TODAS AS IDADES."
  const m = /^(\d+)\+$/.exec(v)
  if (m) return `ESTE PRODUTO É INDICADO PARA CRIANÇAS A PARTIR DE ${m[1]} ANOS.`
  return `INDICAÇÃO ETÁRIA: ${v}.`
}
