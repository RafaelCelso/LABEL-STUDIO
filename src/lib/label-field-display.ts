import type { LabelData } from "@/types/label"

/** Bloco nome do produto na etiqueta: `CÓDIGO - NOME` (apenas o que estiver preenchido). */
export function labelProductTitleLine(
  data: Pick<LabelData, "code" | "productName">,
): string {
  const code = data.code.trim()
  const name = data.productName.trim()
  if (code && name) return `${code} - ${name}`
  if (code) return code
  return name
}

/** Texto após o rótulo "Lote:" (lote + data de validade), sem placeholders no lote. */
export function labelLoteValidadeLine(
  data: Pick<LabelData, "batch" | "expiryDate" | "isExpiryIndeterminate">,
): string {
  const lot = data.batch.trim()
  const vd = data.isExpiryIndeterminate
    ? "Indeterminado"
    : data.expiryDate.trim()
  const rest = `Data de validade: ${vd}`
  return lot ? `${lot} / ${rest}` : rest
}
