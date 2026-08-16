import { NextResponse } from 'next/server'
import { changePassword, errorResponse, requireAdmin, ApiError } from '@/lib/server/auth'
export async function PATCH(request: Request) { try { await requireAdmin(); const { atual, nova } = await request.json(); if (typeof atual !== 'string' || typeof nova !== 'string') throw new ApiError('Informe as senhas atual e nova.'); if (!(await changePassword(atual, nova))) throw new ApiError('Senha atual incorreta ou nova senha inválida.', 400); return NextResponse.json({ ok: true }) } catch (error) { return errorResponse(error) } }
