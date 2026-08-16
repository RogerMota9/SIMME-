export function formatData(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Data ISO -> valor para <input type="date"> (yyyy-mm-dd). */
export function isoParaInputDate(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}
