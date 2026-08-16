import { NextResponse } from 'next/server'
import { errorResponse, requireAdmin, ApiError } from '@/lib/server/auth'
import { transaction } from '@/lib/server/db'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(); const { id } = await params
    await transaction(async c => { const review=await c.query<{loan_id:string|null}>('SELECT loan_id FROM reviews WHERE id=$1 FOR UPDATE',[id]); if(!review.rowCount)throw new ApiError('Resenha não encontrada.',404); await c.query('DELETE FROM reviews WHERE id=$1',[id]); if(review.rows[0].loan_id)await c.query('UPDATE loans SET review_confirmed=false WHERE id=$1',[review.rows[0].loan_id]) })
    return new NextResponse(null,{status:204})
  } catch(error) { return errorResponse(error) }
}
