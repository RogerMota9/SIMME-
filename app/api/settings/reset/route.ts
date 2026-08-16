import { NextResponse } from 'next/server'
import { errorResponse, requireAdmin } from '@/lib/server/auth'
import { transaction } from '@/lib/server/db'
export async function POST(){try{await requireAdmin();await transaction(async c=>{await c.query('DELETE FROM reviews');await c.query('DELETE FROM loans');await c.query('DELETE FROM materials')});return new NextResponse(null,{status:204})}catch(error){return errorResponse(error)}}
