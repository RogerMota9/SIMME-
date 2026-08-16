'use client'

import { EmptyState, PageHeader, Select } from '@/components/simme/ui'
import { cn } from '@/lib/utils'
import { useSimme } from '@/lib/simme-store'
import { Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'

const PERIODOS = [
  { id: '30', label: 'Último mês' },
  { id: '90', label: 'Últimos 3 meses' },
  { id: '180', label: 'Últimos 6 meses' },
  { id: '365', label: 'Último ano' },
  { id: 'todos', label: 'Todo o período' },
] as const

interface LinhaRanking {
  chave: string
  alunoNome: string
  curso: string
  turma: string
  serie: string
  total: number
}

export function RankingView() {
  const { emprestimos } = useSimme()
  const [periodo, setPeriodo] = useState<(typeof PERIODOS)[number]['id']>('30')

  const ranking = useMemo(() => {
    const agora = Date.now()
    const limite =
      periodo === 'todos' ? 0 : agora - Number(periodo) * 86400000

    const mapa = new Map<string, LinhaRanking>()
    for (const e of emprestimos) {
      // Só concorre quem tem resenha confirmada, vinculada à entrega do livro.
      if (e.itemTipo !== 'livro' || !e.resenhaConfirmada) continue
      if (new Date(e.dataEmprestimo).getTime() < limite) continue
      const chave = `${e.alunoNome}||${e.curso}||${e.turma}||${e.serie}`.toLowerCase()
      const atual = mapa.get(chave)
      if (atual) atual.total++
      else
        mapa.set(chave, {
          chave,
          alunoNome: e.alunoNome,
          curso: e.curso,
          turma: e.turma,
          serie: e.serie,
          total: 1,
        })
    }
    return [...mapa.values()].sort((a, b) => b.total - a.total)
  }, [emprestimos, periodo])

  const medalhas = ['text-primary', 'text-muted-foreground', 'text-[var(--chart-4)]']

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leitor Nota 10"
        description="Ranking dos alunos que mais leram livros com resenha confirmada no período."
        action={
          <Select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as typeof periodo)}
            className="w-52"
          >
            {PERIODOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        }
      />

      {ranking.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum leitor classificado"
          description="Para concorrer, o aluno precisa devolver o livro e ter a resenha vinculada ao empréstimo."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Aluno</th>
                <th className="px-4 py-3 font-medium">Curso / Turma</th>
                <th className="px-4 py-3 text-right font-medium">Livros com resenha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ranking.map((linha, i) => (
                <tr key={linha.chave} className="transition-colors hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex size-7 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold',
                        i < 3 ? medalhas[i] : 'text-muted-foreground',
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{linha.alunoNome}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {linha.curso} · {linha.turma} · {linha.serie}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {linha.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
