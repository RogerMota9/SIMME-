import { NextResponse } from 'next/server'
import { errorResponse, requireAdmin, ApiError } from '@/lib/server/auth'
import { materialType, optionalString, requiredString, materialSelect } from '@/lib/server/simme'
import { query } from '@/lib/server/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
 try { await requireAdmin(); const { id } = await params; const body = await request.json(); const tipo = materialType(body.tipo); const titulo = requiredString(body.titulo, 'título'); const categoria = tipo === 'livro' ? requiredString(body.categoria, 'categoria') : null
  const result = await query(`UPDATE materials SET type=$2,title=$3,author=$4,category=$5,code=$6,description=$7 WHERE id=$1`, [id,tipo,titulo,optionalString(body.autor),categoria,optionalString(body.codigo),optionalString(body.descricao)])
  if (!result.rowCount) throw new ApiError('Item não encontrado.',404)
  return NextResponse.json((await query(`${materialSelect} WHERE id=$1`, [id])).rows[0])
 } catch (error) { return errorResponse(error) }
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { await requireAdmin(); const { id } = await params; const result = await query('DELETE FROM materials WHERE id=$1', [id]); if (!result.rowCount) throw new ApiError('Item não encontrado.',404); return new NextResponse(null,{status:204}) } catch(error) { return errorResponse(error) } }
