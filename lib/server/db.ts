import mysql, { type ExecuteValues, type PoolConnection } from 'mysql2/promise'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não configurada. Consulte .env.example.')
}

const globalDb = globalThis as unknown as { simmePool?: mysql.Pool }

export const db = globalDb.simmePool ?? mysql.createPool(connectionString)
if (process.env.NODE_ENV !== 'production') globalDb.simmePool = db

export type QueryResult<T> = { rows: T[]; rowCount: number }
export type DatabaseClient = Pick<PoolConnection, 'execute'> & { query<T>(text: string, values?: unknown[]): Promise<QueryResult<T>> }

function mysqlPlaceholders(text: string) { return text.replace(/\$\d+/g, '?') }

async function run<T>(client: Pick<PoolConnection, 'execute'>, text: string, values: unknown[] = []): Promise<QueryResult<T>> {
  const [result] = await client.execute(mysqlPlaceholders(text), values as ExecuteValues)
  if (Array.isArray(result)) return { rows: result as T[], rowCount: result.length }
  return { rows: [], rowCount: result.affectedRows }
}

export function query<T>(text: string, values: unknown[] = []) {
  return run<T>(db, text, values)
}

export async function transaction<T>(fn: (client: DatabaseClient) => Promise<T>) {
  const client = await db.getConnection()
  try {
    await client.beginTransaction()
    const wrappedClient: DatabaseClient = { execute: client.execute.bind(client), query: (text, values = []) => run(client, text, values) }
    const result = await fn(wrappedClient)
    await client.commit()
    return result
  } catch (error) {
    await client.rollback()
    throw error
  } finally {
    client.release()
  }
}
