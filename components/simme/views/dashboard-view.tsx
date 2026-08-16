'use client'

import { Badge, PageHeader } from '@/components/simme/ui'
import { formatData, formatMoeda } from '@/lib/format'
import { calcularSituacao, TIPO_LABEL, useSimme } from '@/lib/simme-store'
import {
  ArrowLeftRight,
  BookOpen,
  Clock,
  Library,
  Star,
  TriangleAlert,
} from 'lucide-react'
import { useMemo } from 'react'

export function DashboardView() {
  const { itens, emprestimos, resenhas } = useSimme()

  const stats = useMemo(() => {
    const ativos = emprestimos.filter((e) => !e.devolvido)
    let atrasados = 0
    let multas = 0
    for (const e of ativos) {
      const s = calcularSituacao(e)
      if (s.atrasado) atrasados++
      multas += s.multa
    }
    const porTipo = {
      livro: itens.filter((i) => i.tipo === 'livro').length,
      instrumento: itens.filter((i) => i.tipo === 'instrumento').length,
      jogo: itens.filter((i) => i.tipo === 'jogo').length,
    }
    return {
      totalItens: itens.length,
      ativos: ativos.length,
      atrasados,
      multas,
      resenhas: resenhas.length,
      porTipo,
    }
  }, [itens, emprestimos, resenhas])

  const recentes = useMemo(() => emprestimos.slice(0, 5), [emprestimos])

  const cards = [
    { label: 'Itens no acervo', valor: stats.totalItens, icon: Library },
    { label: 'Empréstimos ativos', valor: stats.ativos, icon: ArrowLeftRight },
    { label: 'Atrasados', valor: stats.atrasados, icon: TriangleAlert, alerta: stats.atrasados > 0 },
    { label: 'Multas em aberto', valor: formatMoeda(stats.multas), icon: Clock },
    { label: 'Resenhas', valor: stats.resenhas, icon: Star },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Visão geral"
        description="Panorama do acervo, empréstimos e atividades da Multimeios."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ label, valor, icon: Icon, alerta }) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <Icon className={alerta ? 'size-4 text-destructive' : 'size-4 text-muted-foreground'} />
            </div>
            <span
              className={
                alerta
                  ? 'text-2xl font-semibold text-destructive'
                  : 'text-2xl font-semibold text-foreground'
              }
            >
              {valor}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground">Composição do acervo</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {(['livro', 'instrumento', 'jogo'] as const).map((tipo) => (
              <li key={tipo} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="size-4" />
                  {TIPO_LABEL[tipo]}
                </span>
                <span className="font-medium text-foreground">{stats.porTipo[tipo]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Empréstimos recentes</h2>
          {recentes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhum empréstimo registrado ainda.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {recentes.map((e) => {
                const s = calcularSituacao(e)
                return (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{e.itemTitulo}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.alunoNome} · {e.curso} {e.turma} · {formatData(e.dataEmprestimo)}
                      </p>
                    </div>
                    {e.devolvido ? (
                      <Badge tone="neutral">Devolvido</Badge>
                    ) : s.atrasado ? (
                      <Badge tone="danger">Atrasado</Badge>
                    ) : (
                      <Badge tone="success">Ativo</Badge>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
