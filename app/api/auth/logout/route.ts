import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/server/auth'
export async function POST() { const response = NextResponse.json({ isAdmin: false }); clearAdminCookie(response); return response }
