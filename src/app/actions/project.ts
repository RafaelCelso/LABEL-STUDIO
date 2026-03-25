"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/server"
import { sql } from "@/lib/db"
import { LabelData } from "@/types/label"

async function getUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession()
  return session?.user?.id ?? null
}

export async function saveProject(name: string, data: LabelData) {
  const userId = await getUserId()
  if (!userId) throw new Error("Não autorizado")

  try {
    const result = await sql`
      INSERT INTO projects (user_id, name, label_data)
      VALUES (${userId}::uuid, ${name}, ${JSON.stringify(data)})
      RETURNING *
    `
    revalidatePath("/")
    return { success: true, project: result[0] }
  } catch (error) {
    console.error("Erro ao salvar projeto:", error)
    return { success: false, project: undefined, error: "Erro ao salvar no banco de dados" }
  }
}

export async function updateProject(projectId: string, name: string, data: LabelData) {
  const userId = await getUserId()
  if (!userId) throw new Error("Não autorizado")

  try {
    const result = await sql`
      UPDATE projects 
      SET name = ${name}, label_data = ${JSON.stringify(data)}, updated_at = now()
      WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
      RETURNING *
    `
    revalidatePath("/")
    return { success: true, project: result[0] }
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    return { success: false, project: undefined, error: "Erro ao atualizar no banco de dados" }
  }
}

export async function getProjects() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const projects = await sql`
      SELECT * FROM projects 
      WHERE user_id = ${userId}::uuid
      ORDER BY updated_at DESC
    `
    return projects
  } catch (error) {
    console.error("Erro ao carregar projetos:", error)
    return []
  }
}

export async function deleteProject(projectId: string) {
  const userId = await getUserId()
  if (!userId) throw new Error("Não autorizado")

  try {
    await sql`
      DELETE FROM projects 
      WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
    `
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar projeto:", error)
    return { success: false }
  }
}
