'use client'

import { Button } from '@/components/ui/button'
import { useAdminGate } from '@/components/simme/admin-gate'
import { EmprestimoForm, ItemForm } from '@/components/simme/forms'
import { Badge, EmptyState, Modal, PageHeader, Select, TextInput } from '@/components/simme/ui'
import { cn } from '@/lib/utils'
import {
  CATEGORIAS_LIVRO,
  TIPO_LABEL,
  useSimme,
  type AcervoItem,
  type ItemTipo,
} from '@/lib/simme-store'
import { ArrowLeftRight, Library, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

type TipoFiltro = 'todos' | ItemTipo

export function AcervoView() {
  const { itens, removeItem } = useSimme()
  const { ensureAdmin } = useAdminGate()

  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todos')
  const [categoria, setCategoria] = useState('todas')

  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState<AcervoItem | undefined>()
  const [emprestarItem, setEmprestarItem] = useState<AcervoItem | undefined>()

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return itens.filter((i) => {
      if (tipoFiltro !== 'todos' && i.tipo !== tipoFiltro) return false
      if (tipoFiltro === 'livro' && categoria !== 'todas' && i.categoria !== categoria) return false
      if (!q) return true
      return (
        i.titulo.toLowerCase().includes(q) ||
        (i.autor ?? '').toLowerCase().includes(q) ||
        (i.codigo ?? '').toLowerCase().includes(q)
      )
    })
  }, [itens, busca, tipoFiltro, categoria])

  function novoItem() {
    ensureAdmin(() => {
      setEditando(undefined)
      setFormOpen(true)
    })
  }

  function editarItem(item: AcervoItem) {
    ensureAdmin(() => {
      setEditando(item)
      setFormOpen(true)
    })
  }

  function excluirItem(item: AcervoItem) {
    ensureAdmin(() => {
      if (confirm(`Excluir "${item.titulo}" do acervo? Esta ação não pode ser desfeita.`)) {
        removeItem(item.id)
      }
    })
  }

  const filtros: { id: TipoFiltro; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'livro', label: 'Livros' },
    { id: 'instrumento', label: 'Instrumentos' },
    { id: 'jogo', label: 'Jogos' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Acervo"
        description="Catálogo de livros, instrumentos musicais e jogos de mesa."
        action={
          <Button onClick={novoItem}>
            <Plus className="size-4" />
            Adicionar item
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              onClick={() => setTipoFiltro(f.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                tipoFiltro === f.id
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, autor ou código…"
              className="pl-9"
            />
          </div>
          {tipoFiltro === 'livro' ? (
            <Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-56"
            >
              <option value="todas">Todas as categorias</option>
              {CATEGORIAS_LIVRO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={Library}
          title={itens.length === 0 ? 'Acervo vazio' : 'Nenhum item encontrado'}
          description={
            itens.length === 0
              ? 'Comece adicionando livros, instrumentos ou jogos ao acervo.'
              : 'Ajuste os filtros ou o termo de busca.'
          }
          action={
            itens.length === 0 ? (
              <Button onClick={novoItem} variant="secondary">
                <Plus className="size-4" />
                Adicionar item
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <Badge tone="neutral">{TIPO_LABEL[item.tipo]}</Badge>
                {item.disponivel ? (
                  <Badge tone="success">Disponível</Badge>
                ) : (
                  <Badge tone="warning">Emprestado</Badge>
                )}
              </div>

              <div className="min-h-10">
                <h3 className="font-medium text-foreground text-pretty">{item.titulo}</h3>
                {item.autor ? (
                  <p className="text-sm text-muted-foreground">{item.autor}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                {item.categoria ? <Badge tone="accent">{item.categoria}</Badge> : null}
                {item.codigo ? <span className="font-mono">#{item.codigo}</span> : null}
              </div>

              {item.descricao ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.descricao}</p>
              ) : null}

              <div className="mt-auto flex items-center gap-1 border-t border-border pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!item.disponivel}
                  onClick={() => setEmprestarItem(item)}
                >
                  <ArrowLeftRight className="size-3.5" />
                  Emprestar
                </Button>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Editar item"
                    onClick={() => editarItem(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Excluir item"
                    onClick={() => excluirItem(item)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editando ? 'Editar item' : 'Adicionar item ao acervo'}
      >
        <ItemForm
          item={editando}
          onDone={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={!!emprestarItem}
        onClose={() => setEmprestarItem(undefined)}
        title="Registrar empréstimo"
        description={emprestarItem ? emprestarItem.titulo : undefined}
      >
        {emprestarItem ? (
          <EmprestimoForm
            initialItemId={emprestarItem.id}
            onDone={() => setEmprestarItem(undefined)}
            onCancel={() => setEmprestarItem(undefined)}
          />
        ) : null}
      </Modal>
    </div>
  )
}
