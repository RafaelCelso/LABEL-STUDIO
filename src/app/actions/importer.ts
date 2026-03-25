"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/server"
import { sql } from "@/lib/db"

async function getUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession()
  return session?.user?.id ?? null
}

export type ImporterListRow = {
  id: string
  razao_social: string
  cnpj: string
  cidade: string
  estado: string
}

export type ImporterFullRow = {
  id: string
  razao_social: string
  cnpj: string
  pais: string
  cep: string
  estado: string
  cidade: string
  bairro: string
  logradouro: string
  numero: string
  complemento: string | null
  email: string
  tel_capitais: string | null
  tel_demais: string | null
}

export async function getImporterById(id: string): Promise<ImporterFullRow | null> {
  const userId = await getUserId()
  if (!userId) return null

  try {
    const rows = await sql`
      SELECT
        id,
        razao_social,
        cnpj,
        pais,
        cep,
        estado,
        cidade,
        bairro,
        logradouro,
        numero,
        complemento,
        email,
        tel_capitais,
        tel_demais
      FROM importers
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `
    const row = rows[0] as ImporterFullRow | undefined
    return row ?? null
  } catch (error) {
    console.error("Erro ao carregar importador:", error)
    return null
  }
}

export async function getImporters(): Promise<ImporterListRow[]> {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const rows = await sql`
      SELECT id, razao_social, cnpj, cidade, estado
      FROM importers
      WHERE user_id = ${userId}::uuid
      ORDER BY razao_social ASC
    `
    return rows as ImporterListRow[]
  } catch (error) {
    console.error("Erro ao carregar importadores:", error)
    return []
  }
}

export type CreateImporterInput = {
  razao_social: string
  cnpj: string
  pais: string
  cep: string
  estado: string
  cidade: string
  bairro: string
  logradouro: string
  numero: string
  complemento: string | null
  email: string
  tel_capitais: string | null
  tel_demais: string | null
}

function isUniqueViolation(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    return (err as { code: string }).code === "23505"
  }
  return false
}

export async function createImporter(
  data: CreateImporterInput
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId()
  if (!userId) return { success: false, error: "Não autorizado" }

  try {
    await sql`
      INSERT INTO importers (
        user_id,
        razao_social,
        cnpj,
        pais,
        cep,
        estado,
        cidade,
        bairro,
        logradouro,
        numero,
        complemento,
        email,
        tel_capitais,
        tel_demais
      )
      VALUES (
        ${userId}::uuid,
        ${data.razao_social},
        ${data.cnpj},
        ${data.pais},
        ${data.cep},
        ${data.estado},
        ${data.cidade},
        ${data.bairro},
        ${data.logradouro},
        ${data.numero},
        ${data.complemento},
        ${data.email},
        ${data.tel_capitais},
        ${data.tel_demais}
      )
    `
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Erro ao criar importador:", error)
    if (isUniqueViolation(error)) {
      return { success: false, error: "Já existe um importador com este CNPJ." }
    }
    return { success: false, error: "Não foi possível salvar o importador." }
  }
}

export async function updateImporter(
  id: string,
  data: CreateImporterInput
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId()
  if (!userId) return { success: false, error: "Não autorizado" }

  try {
    const updated = await sql`
      UPDATE importers
      SET
        razao_social = ${data.razao_social},
        cnpj = ${data.cnpj},
        pais = ${data.pais},
        cep = ${data.cep},
        estado = ${data.estado},
        cidade = ${data.cidade},
        bairro = ${data.bairro},
        logradouro = ${data.logradouro},
        numero = ${data.numero},
        complemento = ${data.complemento},
        email = ${data.email},
        tel_capitais = ${data.tel_capitais},
        tel_demais = ${data.tel_demais},
        updated_at = now()
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      RETURNING id
    `
    if (!updated.length) {
      return { success: false, error: "Importador não encontrado." }
    }
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar importador:", error)
    if (isUniqueViolation(error)) {
      return { success: false, error: "Já existe um importador com este CNPJ." }
    }
    return { success: false, error: "Não foi possível atualizar o importador." }
  }
}

export async function deleteImporter(id: string): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId()
  if (!userId) return { success: false, error: "Não autorizado" }

  try {
    const removed = await sql`
      DELETE FROM importers
      WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      RETURNING id
    `
    if (!removed.length) {
      return { success: false, error: "Importador não encontrado." }
    }
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir importador:", error)
    return { success: false, error: "Não foi possível excluir o importador." }
  }
}
