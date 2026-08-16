'use client'

import { Button } from '@/components/ui/button'
import { Field, Select, TextArea, TextInput } from '@/components/simme/ui'
import {
  CATEGORIAS_LIVRO as CATEGORIAS,
  CURSOS,
  SERIES,
  TIPO_LABEL,
  TURMAS,
  useSimme,
  type AcervoItem,
} from '@/lib/simme-store'
import { useMemo, useState } from 'react'

/* ---------------------- Formulário de empréstimo ----------------------- */

export function EmprestimoForm({
  initialItemId,
  onDone,
  onCancel,
}: {
  initialItemId?: string
  onDone: () => void
  onCancel: () => void
}) {
  const { itens, addEmprestimo } = useSimme()
  const disponiveis = useMemo(() => itens.filter((i) => i.disponivel), [itens])

  const [itemId, setItemId] = useState(initialItemId ?? '')
  const [alunoNome, setAlunoNome] = useState('')
  const [curso, setCurso] = useState<string>(CURSOS[0])
  const [turma, setTurma] = useState<string>(TURMAS[0])
  const [serie, setSerie] = useState<string>(SERIES[0])

  const item = itens.find((i) => i.id === itemId)
  const valido = itemId && alunoNome.trim()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valido) return
    addEmprestimo({ itemId, alunoNome: alunoNome.trim(), curso, turma, serie })
    onDone()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field
        label="Item do acervo"
        hint={
          item?.tipo === 'livro'
            ? 'Livros têm prazo de 15 dias e multa de R$ 0,50/dia após o vencimento.'
            : item
              ? 'Instrumentos e jogos não têm prazo nem multa.'
              : undefined
        }
      >
        <Select value={itemId} onChange={(e) => setItemId(e.target.value)} required>
          <option value="">Selecione um item disponível…</option>
          {disponiveis.map((i) => (
            <option key={i.id} value={i.id}>
              {TIPO_LABEL[i.tipo]} — {i.titulo}
            </option>
          ))}
        </Select>
      </Field>

      {disponiveis.length === 0 ? (
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Nenhum item disponível no momento. Cadastre itens no Acervo (requer administrador).
        </p>
      ) : null}

      <Field label="Nome do aluno">
        <TextInput
          value={alunoNome}
          onChange={(e) => setAlunoNome(e.target.value)}
          placeholder="Ex.: Maria Silva"
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Curso">
          <Select value={curso} onChange={(e) => setCurso(e.target.value)}>
            {CURSOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Turma">
          <Select value={turma} onChange={(e) => setTurma(e.target.value)}>
            {TURMAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Série">
          <Select value={serie} onChange={(e) => setSerie(e.target.value)}>
            {SERIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!valido}>
          Registrar empréstimo
        </Button>
      </div>
    </form>
  )
}

/* ----------------------- Formulário de item -------------------------- */

export function ItemForm({
  item,
  onDone,
  onCancel,
}: {
  item?: AcervoItem
  onDone: () => void
  onCancel: () => void
}) {
  const { addItem, updateItem } = useSimme()
  const [tipo, setTipo] = useState(item?.tipo ?? 'livro')
  const [titulo, setTitulo] = useState(item?.titulo ?? '')
  const [autor, setAutor] = useState(item?.autor ?? '')
  const [categoria, setCategoria] = useState(item?.categoria ?? CATEGORIAS[0])
  const [codigo, setCodigo] = useState(item?.codigo ?? '')
  const [descricao, setDescricao] = useState(item?.descricao ?? '')

  const valido = titulo.trim().length > 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valido) return
    const dados = {
      tipo,
      titulo: titulo.trim(),
      autor: autor.trim() || undefined,
      categoria: tipo === 'livro' ? categoria : undefined,
      codigo: codigo.trim() || undefined,
      descricao: descricao.trim() || undefined,
    }
    if (item) updateItem(item.id, dados)
    else addItem(dados)
    onDone()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tipo">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as AcervoItem['tipo'])}>
            <option value="livro">Livro</option>
            <option value="instrumento">Instrumento musical</option>
            <option value="jogo">Jogo de mesa</option>
          </Select>
        </Field>
        <Field label="Código / tombo" hint="Opcional">
          <TextInput
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex.: 0001"
          />
        </Field>
      </div>

      <Field label="Título">
        <TextInput
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nome do item"
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={tipo === 'livro' ? 'Autor' : 'Marca / responsável'} hint="Opcional">
          <TextInput value={autor} onChange={(e) => setAutor(e.target.value)} />
        </Field>
        {tipo === 'livro' ? (
          <Field label="Categoria">
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
      </div>

      <Field label="Descrição" hint="Opcional">
        <TextArea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          placeholder="Sinopse, estado de conservação, observações…"
        />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!valido}>
          {item ? 'Salvar alterações' : 'Adicionar ao acervo'}
        </Button>
      </div>
    </form>
  )
}

/* ---------------------- Formulário de resenha ------------------------ */

export function ResenhaForm({
  onDone,
  onCancel,
}: {
  onDone: () => void
  onCancel: () => void
}) {
  const { emprestimos, addResenha } = useSimme()
  // Empréstimos de livros que ainda não têm resenha vinculada.
  const vinculaveis = useMemo(
    () => emprestimos.filter((e) => e.itemTipo === 'livro' && !e.resenhaConfirmada),
    [emprestimos],
  )

  const [emprestimoId, setEmprestimoId] = useState('')
  const [alunoNome, setAlunoNome] = useState('')
  const [curso, setCurso] = useState<string>(CURSOS[0])
  const [turma, setTurma] = useState<string>(TURMAS[0])
  const [serie, setSerie] = useState<string>(SERIES[0])
  const [livroTitulo, setLivroTitulo] = useState('')
  const [texto, setTexto] = useState('')

  function selecionarEmprestimo(id: string) {
    setEmprestimoId(id)
    const emp = emprestimos.find((e) => e.id === id)
    if (emp) {
      setAlunoNome(emp.alunoNome)
      setCurso(emp.curso)
      setTurma(emp.turma)
      setSerie(emp.serie)
      setLivroTitulo(emp.itemTitulo)
    }
  }

  const valido = alunoNome.trim() && livroTitulo.trim() && texto.trim()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valido) return
    addResenha({
      alunoNome: alunoNome.trim(),
      curso,
      turma,
      serie,
      livroTitulo: livroTitulo.trim(),
      texto: texto.trim(),
      emprestimoId: emprestimoId || null,
    })
    onDone()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field
        label="Vincular a um empréstimo"
        hint="Ao vincular, a resenha é confirmada e o aluno passa a concorrer ao Leitor Nota 10."
      >
        <Select value={emprestimoId} onChange={(e) => selecionarEmprestimo(e.target.value)}>
          <option value="">Sem vínculo (não conta para o ranking)</option>
          {vinculaveis.map((e) => (
            <option key={e.id} value={e.id}>
              {e.alunoNome} — {e.itemTitulo}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome do aluno">
          <TextInput
            value={alunoNome}
            onChange={(e) => setAlunoNome(e.target.value)}
            required
            disabled={!!emprestimoId}
          />
        </Field>
        <Field label="Livro">
          <TextInput
            value={livroTitulo}
            onChange={(e) => setLivroTitulo(e.target.value)}
            required
            disabled={!!emprestimoId}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Curso">
          <Select
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            disabled={!!emprestimoId}
          >
            {CURSOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Turma">
          <Select
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            disabled={!!emprestimoId}
          >
            {TURMAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Série">
          <Select
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            disabled={!!emprestimoId}
          >
            {SERIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Resenha / experiência do aluno">
        <TextArea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          placeholder="O que o aluno achou da leitura?"
          required
        />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!valido}>
          Salvar resenha
        </Button>
      </div>
    </form>
  )
}
