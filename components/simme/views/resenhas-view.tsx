'use client'

import { Button } from '@/components/ui/button'
import { useAdminGate } from '@/components/simme/admin-gate'
import { ResenhaForm } from '@/components/simme/forms'
import { Badge, EmptyState, Modal, PageHeader } from '@/components/simme/ui'
import { formatData } from '@/lib/format'
import { useSimme } from '@/lib/simme-store'
import { Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function ResenhasView() {
  const { resenhas, removeResenha } = useSimme()
  const { ensureAdmin } = useAdminGate()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resenhas"
        description="Experiências e resenhas dos alunos. Resenhas vinculadas a um empréstimo habilitam o Leitor Nota 10."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nova resenha
          </Button>
        }
      />

      {resenhas.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nenhuma resenha ainda"
          description="Os monitores podem registrar aqui as resenhas dos alunos."
          action={
            <Button variant="secondary" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Nova resenha
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {resenhas.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground text-pretty">{r.livroTitulo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {r.alunoNome} · {r.curso} {r.turma} · {r.serie}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Excluir resenha"
                  onClick={() =>
                    ensureAdmin(() => {
                      if (confirm('Excluir esta resenha?')) removeResenha(r.id)
                    })
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>

              <p className="text-sm text-foreground/90 text-pretty">{r.texto}</p>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{formatData(r.data)}</span>
                {r.emprestimoId ? (
                  <Badge tone="accent">
                    <Star className="size-3" />
                    Conta no ranking
                  </Badge>
                ) : (
                  <Badge tone="neutral">Sem vínculo</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova resenha">
        <ResenhaForm onDone={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
