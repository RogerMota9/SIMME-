'use client'

import { Button } from '@/components/ui/button'
import { useAdminGate } from '@/components/simme/admin-gate'
import { EmprestimoForm } from '@/components/simme/forms'
import { Badge, EmptyState, Modal, PageHeader } from '@/components/simme/ui'
import { cn } from '@/lib/utils'
import { formatData, formatMoeda } from '@/lib/format'
import {
  calcularSituacao,
  TIPO_LABEL,
  useSimme,
  type Emprestimo,
} from '@/lib/simme-store'
import { ArrowLeftRight, BookOpen, CheckCircle2, Plus, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

type Filtro = 'ativos' | 'atrasados' | 'devolvidos' | 'todos'

export function EmprestimosView() {
  const { emprestimos, devolverEmprestimo, confirmarLeitura, removeEmprestimo } = useSimme()
  const { ensureAdmin } = useAdminGate()

  const [filtro, setFiltro] = useState<Filtro>('ativos')
  const [novoOpen, setNovoOpen] = useState(false)

  const lista = useMemo(() => {
    return emprestimos.filter((e) => {
      const s = calcularSituacao(e)
      if (filtro === 'ativos') return !e.devolvido
      if (filtro === 'atrasados') return s.atrasado
      if (filtro === 'devolvidos') return e.devolvido
      return true
    })
  }, [emprestimos, filtro])

  const filtros: { id: Filtro; label: string }[] = [
    { id: 'ativos', label: 'Ativos' },
    { id: 'atrasados', label: 'Atrasados' },
    { id: 'devolvidos', label: 'Devolvidos' },
    { id: 'todos', label: 'Todos' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empréstimos"
        description="Controle de empréstimos e devoluções. Livros têm prazo de 15 dias e multa de R$ 0,50/dia."
        action={
          <Button onClick={() => setNovoOpen(true)}>
            <Plus className="size-4" />
            Novo empréstimo
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              filtro === f.id
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Nenhum empréstimo"
          description={
            emprestimos.length === 0
              ? 'Registre um novo empréstimo para começar o controle.'
              : 'Não há empréstimos com este filtro.'
          }
          action={
            emprestimos.length === 0 ? (
              <Button variant="secondary" onClick={() => setNovoOpen(true)}>
                <Plus className="size-4" />
                Novo empréstimo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((e) => (
            <EmprestimoCard
              key={e.id}
              emprestimo={e}
              onDevolver={() => devolverEmprestimo(e.id)}
              onConfirmarLeitura={() => confirmarLeitura(e.id)}
              onExcluir={() =>
                ensureAdmin(() => {
                  if (confirm('Excluir este registro de empréstimo?')) removeEmprestimo(e.id)
                })
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Registrar empréstimo"
      >
        <EmprestimoForm onDone={() => setNovoOpen(false)} onCancel={() => setNovoOpen(false)} />
      </Modal>
    </div>
  )
}

function EmprestimoCard({
  emprestimo: e,
  onDevolver,
  onConfirmarLeitura,
  onExcluir,
}: {
  emprestimo: Emprestimo
  onDevolver: () => void
  onConfirmarLeitura: () => void
  onExcluir: () => void
}) {
  const s = calcularSituacao(e)
  const isLivro = e.itemTipo === 'livro'

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-foreground">{e.itemTitulo}</h3>
          <Badge tone="neutral">{TIPO_LABEL[e.itemTipo]}</Badge>
          {e.devolvido ? (
            <Badge tone="neutral">Devolvido</Badge>
          ) : s.atrasado ? (
            <Badge tone="danger">Atrasado</Badge>
          ) : (
            <Badge tone="success">Ativo</Badge>
          )}
          {e.resenhaConfirmada ? (
            <Badge tone="accent">
              <Star className="size-3" />
              Resenha
            </Badge>
          ) : null}
          {e.leituraConfirmada ? (
            <Badge tone="accent">
              <BookOpen className="size-3" />
              Leitura
            </Badge>
          ) : null}
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {e.alunoNome} · {e.curso} · Turma {e.turma} · {e.serie}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>Empréstimo: {formatData(e.dataEmprestimo)}</span>
          {isLivro ? <span>Vencimento: {formatData(e.dataDevolucaoPrevista)}</span> : null}
          {e.devolvido ? <span>Devolução: {formatData(e.dataDevolucaoReal)}</span> : null}
          {isLivro && !e.devolvido && s.diasRestantes !== null ? (
            <span className={s.diasRestantes < 0 ? 'text-destructive' : ''}>
              {s.diasRestantes >= 0
                ? `${s.diasRestantes} dia(s) restante(s)`
                : `${Math.abs(s.diasRestantes)} dia(s) em atraso`}
            </span>
          ) : null}
          {isLivro && s.multa > 0 ? (
            <span className="font-medium text-destructive">
              Multa: {formatMoeda(s.multa)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!e.devolvido ? (
          <>
            {isLivro && !e.leituraConfirmada ? (
              <Button size="sm" variant="ghost" onClick={onConfirmarLeitura}>
                <CheckCircle2 className="size-4" />
                Confirmar leitura
              </Button>
            ) : null}
            <Button size="sm" variant="secondary" onClick={onDevolver}>
              Registrar devolução
            </Button>
          </>
        ) : null}
        <Button size="icon" variant="ghost" aria-label="Excluir empréstimo" onClick={onExcluir}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </li>
  )
}
