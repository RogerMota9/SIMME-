import { NextResponse } from 'next/server'
import { authenticate, errorResponse, setAdminCookie, ApiError } from '@/lib/server/auth'

export async function POST(request: Request) {
  try {
    const { senha } = await request.json()
    if (typeof senha !== 'string') throw new ApiError('Senha é obrigatória.')
    if (!(await authenticate(senha))) throw new ApiError('Senha incorreta.', 401)
    const response = NextResponse.json({ isAdmin: true })
    setAdminCookie(response)
    return response
  } catch (error) { return errorResponse(error) }
}
