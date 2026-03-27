/** Opções do select “restrição de idade (órgão certificador)”. */
export const CERTIFIER_AGE_RESTRICTION_OPTIONS = ["0-3", "0-18m", "0-6m"] as const

export type CertifierAgeRestrictionOption =
  (typeof CERTIFIER_AGE_RESTRICTION_OPTIONS)[number]

/**
 * Valor controlado para o `Select` (evita mudar de não-controlado → controlado).
 * Projetos antigos com valor fora da lista exibem placeholder até o usuário escolher.
 */
export function certifierAgeRestrictionForSelect(
  stored: string,
): string {
  return (CERTIFIER_AGE_RESTRICTION_OPTIONS as readonly string[]).includes(stored)
    ? stored
    : ""
}

/** Unidade do campo Indicação (valor persistido: `Nm+` / `Na+` / legado `N+`). */
export type AgeIndicationUnit = "months" | "years"

/**
 * Interpreta `ageIndication`: `6m+` = meses, `3a+` = anos, `3+` = anos (legado).
 */
export function parseAgeIndication(value: string): { n: number; unit: AgeIndicationUnit } | null {
  const v = value.trim()
  if (!v) return null
  if (v === "0+") return { n: 0, unit: "years" }
  const mes = /^(\d+)m\+$/i.exec(v)
  if (mes) return { n: parseInt(mes[1], 10), unit: "months" }
  const anos = /^(\d+)a\+$/i.exec(v)
  if (anos) return { n: parseInt(anos[1], 10), unit: "years" }
  const leg = /^(\d+)\+$/.exec(v)
  if (leg) return { n: parseInt(leg[1], 10), unit: "years" }
  return null
}

/** Serializa indicação para `LabelData.ageIndication`. */
export function formatAgeIndication(n: number, unit: AgeIndicationUnit): string {
  if (unit === "years" && n === 0) return "0+"
  if (unit === "months") return `${n}m+`
  return `${n}a+`
}

/** Texto de indicação na etiqueta / exportação a partir do select de idade. */
export function indicationBodyFromAgeSelect(value: string): string {
  const v = value.trim()
  if (!v) return "ESTE PRODUTO É INDICADO PARA CRIANÇAS A PARTIR DE 3 ANOS."
  if (v === "0+") return "LIVRE PARA TODAS AS IDADES."

  const mes = /^(\d+)m\+$/i.exec(v)
  if (mes) {
    const n = mes[1]
    return n === "1"
      ? "ESTE PRODUTO É INDICADO PARA CRIANÇAS A PARTIR DE 1 MÊS."
      : `ESTE PRODUTO É INDICADO PARA CRIANÇAS A PARTIR DE ${n} MESES.`
  }

  const anos = /^(\d+)a\+$/i.exec(v)
  if (anos) {
    return `ESTE PRODUTO É INDICADO PARA CRIANÇAS A PARTIR DE ${anos[1]} ANOS.`
  }

  const legacy = /^(\d+)\+$/.exec(v)
  if (legacy) return `ESTE PRODUTO É INDICADO PARA CRIANÇAS A PARTIR DE ${legacy[1]} ANOS.`
  return `INDICAÇÃO ETÁRIA: ${v}.`
}
