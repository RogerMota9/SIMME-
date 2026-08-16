import { NextResponse } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/server/auth'
import { materialSelect, materialType, optionalString, requiredString, uuid } from '@/lib/server/simme'
import { query } from '@/lib/server/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const values: unknown[] = []; const where: string[] = []
    if (searchParams.get('tipo')) { values.push(searchParams.get('tipo')); where.push(`type = $${values.length}`) }
    if (searchParams.get('categoria')) { values.push(searchParams.get('categoria')); where.push(`category = $${values.length}`) }
    if (searchParams.get('q')) { values.push(`%${searchParams.get('q')}%`); where.push(`(title LIKE $${values.length} OR COALESCE(author, '') LIKE $${values.length} OR COALESCE(code, '') LIKE $${values.length})`) }
    const result = await query(`${materialSelect} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`, values)
    return NextResponse.json(result.rows)
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(); const body = await request.json(); const tipo = materialType(body.tipo)
    const titulo = requiredString(body.titulo, 'título'); const categoria = tipo === 'livro' ? requiredString(body.categoria, 'categoria') : null
    const id = uuid()
    await query('INSERT INTO materials (id, type, title, author, category, code, description) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, tipo, titulo, optionalString(body.autor), categoria, optionalString(body.codigo), optionalString(body.descricao)])
    const inserted = await query(`${materialSelect} WHERE id = $1`, [id])
    return NextResponse.json(inserted.rows[0], { status: 201 })
  } catch (error) { return errorResponse(error) }
}
