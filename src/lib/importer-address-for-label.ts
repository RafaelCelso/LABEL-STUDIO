import type { ImporterFullRow } from "@/app/actions/importer"

function maskCNPJ(raw: string): string {
  const v = raw.replace(/\D/g, "")
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18)
}

function maskCEP(raw: string): string {
  const v = raw.replace(/\D/g, "")
  return v.replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9)
}

/** Monta as três linhas de endereço exibidas no bloco Importador da etiqueta e na exportação DOCX. */
export function labelAddressFieldsFromImporter(full: ImporterFullRow): {
  importerAddressStreet: string
  importerAddressCityState: string
  importerAddressPostal: string
} {
  const log = full.logradouro.trim()
  const num = full.numero.trim()
  const comp = (full.complemento ?? "").trim()
  const bai = full.bairro.trim()

  let importerAddressStreet = ""
  if (log) {
    importerAddressStreet = log
    if (num) importerAddressStreet += `, nº ${num}`
    if (comp) importerAddressStreet += `, ${comp}`
    if (bai) importerAddressStreet += ` - ${bai}`
  } else {
    importerAddressStreet = [num && `nº ${num}`, comp, bai].filter(Boolean).join(", ")
  }

  const cidade = full.cidade.trim()
  const uf = full.estado.trim()
  const importerAddressCityState =
    cidade && uf ? `${cidade} - ${uf}` : cidade || uf

  const cepFmt = maskCEP(full.cep)
  const cnpjFmt = maskCNPJ(full.cnpj)

  return {
    importerAddressStreet,
    importerAddressCityState,
    importerAddressPostal: `CEP: ${cepFmt || "—"} / CNPJ: ${cnpjFmt || "—"}`,
  }
}

/** Texto do bloco SAC (e-mail e telefones do cadastro do importador). */
export function labelSacLineFromImporter(full: ImporterFullRow): string {
  const email = full.email.trim()
  const cap = (full.tel_capitais ?? "").trim()
  const dem = (full.tel_demais ?? "").trim()
  const parts: string[] = []
  if (email) parts.push(email)
  if (cap) parts.push(`${cap} - Capitais e grandes cidades`)
  if (dem) parts.push(`${dem} - Demais regiões`)
  return parts.join(" - ")
}
