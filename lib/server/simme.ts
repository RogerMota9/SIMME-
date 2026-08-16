import { randomUUID } from 'node:crypto'
import type { DatabaseClient } from './db'
import { ApiError } from './auth'

export const PRAZO_DIAS = 15
export const MULTA_DIA = 0.5

export function uuid() { return randomUUID() }
export function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) throw new ApiError(`Campo obrigatório: ${field}.`)
  return value.trim()
}
export function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
export function materialType(value: unknown) {
  if (value !== 'livro' && value !== 'instrumento' && value !== 'jogo') throw new ApiError('Tipo de material inválido.')
  return value
}

export async function getLoan(client: DatabaseClient, id: string) {
  const result = await client.query<{ id: string; material_id: string; type: string; returned: boolean; review_confirmed: boolean }>(
    'SELECT l.id, l.material_id, m.type, l.returned, l.review_confirmed FROM loans l JOIN materials m ON m.id = l.material_id WHERE l.id = $1 FOR UPDATE', [id],
  )
  if (!result.rowCount) throw new ApiError('Empréstimo não encontrado.', 404)
  return result.rows[0]
}

export const loanSelect = `
 SELECT l.id, l.material_id AS "itemId", m.title AS "itemTitulo", m.type AS "itemTipo",
        l.student_name AS "alunoNome", l.course AS curso, l.class_group AS turma, l.school_year AS serie,
        l.loaned_at AS "dataEmprestimo", l.due_at AS "dataDevolucaoPrevista", l.returned_at AS "dataDevolucaoReal",
        l.returned AS devolvido, l.reading_confirmed AS "leituraConfirmada", l.review_confirmed AS "resenhaConfirmada",
        r.id AS "resenhaId",
        CASE WHEN m.type = 'livro' THEN GREATEST(0, TIMESTAMPDIFF(DAY, l.due_at, COALESCE(l.returned_at, NOW()))) ELSE 0 END AS diasAtraso,
        CASE WHEN m.type = 'livro' THEN GREATEST(0, TIMESTAMPDIFF(DAY, NOW(), l.due_at)) ELSE NULL END AS diasRestantes,
        CASE WHEN m.type = 'livro' THEN ROUND(GREATEST(0, TIMESTAMPDIFF(DAY, l.due_at, COALESCE(l.returned_at, NOW()))) * 0.5, 2) ELSE 0 END AS multa
 FROM loans l JOIN materials m ON m.id = l.material_id LEFT JOIN reviews r ON r.loan_id = l.id`

export const materialSelect = `SELECT id, type AS tipo, title AS titulo, author AS autor, category AS categoria, code AS codigo, description AS descricao, available AS disponivel, created_at AS "criadoEm" FROM materials`
