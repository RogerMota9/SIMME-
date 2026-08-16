import { createHash, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { query } from './db'

const scrypt = promisify(scryptCallback)
const COOKIE = 'simme_admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'troque-esta-chave-em-producao'

async function hashPassword(password: string, salt = randomUUID()) {
  const digest = (await scrypt(password, salt, 64)) as Buffer
  return `${salt}:${digest.toString('hex')}`
}

async function verifyPassword(password: string, saved: string) {
  const [salt, expected] = saved.split(':')
  if (!salt || !expected) return false
  const actual = (await scrypt(password, salt, 64)) as Buffer
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'))
}

export async function ensureSettings() {
  const settings = await query<{ admin_password_hash: string }>(
    'SELECT admin_password_hash FROM system_settings WHERE id = 1',
  )
  if (settings.rowCount) return settings.rows[0]
  const hash = await hashPassword(process.env.ADMIN_INITIAL_PASSWORD || 'marly123')
  await query(
    'INSERT IGNORE INTO system_settings (id, admin_password_hash) VALUES (1, $1)',
    [hash],
  )
  return (await query<{ admin_password_hash: string }>('SELECT admin_password_hash FROM system_settings WHERE id = 1')).rows[0]
}

export async function authenticate(password: string) {
  const settings = await ensureSettings()
  return verifyPassword(password, settings.admin_password_hash)
}

export async function changePassword(current: string, next: string) {
  if (!next.trim() || !(await authenticate(current))) return false
  await query('UPDATE system_settings SET admin_password_hash = $1, updated_at = NOW() WHERE id = 1', [await hashPassword(next)])
  return true
}

function token() {
  return createHash('sha256').update(`${SESSION_SECRET}:admin`).digest('hex')
}

export async function isAdmin() {
  return (await cookies()).get(COOKIE)?.value === token()
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new ApiError('Acesso de administrador necessário.', 401)
}

export function setAdminCookie(response: NextResponse) {
  response.cookies.set(COOKIE, token(), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 })
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export function errorResponse(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500
  const message = error instanceof Error ? error.message : 'Erro interno do servidor.'
  return NextResponse.json({ error: message }, { status })
}
