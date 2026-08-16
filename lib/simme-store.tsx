'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/* ----------------------------- Constantes ----------------------------- */

export const CURSOS = [
  'Enfermagem',
  'Desenvolvimento de Sistemas',
  'Redes de Computadores',
  'Hospedagem',
] as const

export const TURMAS = ['A', 'B', 'C'] as const

export const SERIES = ['1º ano', '2º ano', '3º ano'] as const

export const CATEGORIAS_LIVRO = [
  'Romance',
  'Literatura',
  'Ficção Científica',
  'Fantasia',
  'Didático',
  'História',
  'Poesia',
  'Autoajuda',
  'Infantojuvenil',
  'Outros',
] as const

export const PRAZO_DIAS = 15
export const MULTA_DIA = 0.5

export type ItemTipo = 'livro' | 'instrumento' | 'jogo'

export const TIPO_LABEL: Record<ItemTipo, string> = {
  livro: 'Livro',
  instrumento: 'Instrumento musical',
  jogo: 'Jogo de mesa',
}

/* ------------------------------- Tipos --------------------------------- */

export interface AcervoItem {
  id: string
  tipo: ItemTipo
  titulo: string
  autor?: string
  categoria?: string
  codigo?: string
  descricao?: string
  disponivel: boolean
  criadoEm: string
}

export interface Emprestimo {
  id: string
  itemId: string
  itemTitulo: string
  itemTipo: ItemTipo
  alunoNome: string
  curso: string
  turma: string
  serie: string
  dataEmprestimo: string
  dataDevolucaoPrevista: string | null
  dataDevolucaoReal: string | null
  devolvido: boolean
  leituraConfirmada: boolean
  resenhaConfirmada: boolean
  resenhaId: string | null
}

export interface Resenha {
  id: string
  alunoNome: string
  curso: string
  turma: string
  serie: string
  data: string
  livroTitulo: string
  texto: string
  emprestimoId: string | null
}

interface SimmeData {
  itens: AcervoItem[]
  emprestimos: Emprestimo[]
  resenhas: Resenha[]
  adminSenha: string
}

const STORAGE_KEY = 'simme-data-v1'
const SENHA_PADRAO = 'marly123'

const dadosIniciais: SimmeData = {
  itens: [],
  emprestimos: [],
  resenhas: [],
  adminSenha: SENHA_PADRAO,
}

/* ----------------------------- Utilidades ------------------------------ */

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function addDias(iso: string, dias: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + dias)
  return d.toISOString()
}

function diffDias(a: string, b: string) {
  const ms = new Date(a).setHours(0, 0, 0, 0) - new Date(b).setHours(0, 0, 0, 0)
  return Math.round(ms / 86400000)
}

/** Situação de um empréstimo calculada em tempo real. */
export interface SituacaoEmprestimo {
  diasRestantes: number | null
  diasAtraso: number
  atrasado: boolean
  multa: number
}

export function calcularSituacao(emp: Emprestimo, agora = new Date().toISOString()): SituacaoEmprestimo {
  // Multa e prazo só se aplicam a livros.
  if (emp.itemTipo !== 'livro' || !emp.dataDevolucaoPrevista) {
    return { diasRestantes: null, diasAtraso: 0, atrasado: false, multa: 0 }
  }
  const refFinal = emp.devolvido && emp.dataDevolucaoReal ? emp.dataDevolucaoReal : agora
  const atraso = diffDias(refFinal, emp.dataDevolucaoPrevista) // >0 => atrasado
  const diasAtraso = Math.max(0, atraso)
  const multa = diasAtraso * MULTA_DIA
  const diasRestantes = emp.devolvido ? null : diffDias(emp.dataDevolucaoPrevista, agora)
  return {
    diasRestantes,
    diasAtraso,
    atrasado: !emp.devolvido && diasAtraso > 0,
    multa,
  }
}

/* ------------------------------ Contexto ------------------------------- */

interface SimmeContextValue extends SimmeData {
  pronto: boolean
  isAdmin: boolean
  // acervo
  addItem: (item: Omit<AcervoItem, 'id' | 'criadoEm' | 'disponivel'>) => void
  updateItem: (id: string, patch: Partial<AcervoItem>) => void
  removeItem: (id: string) => void
  // emprestimos
  addEmprestimo: (
    dados: Omit<
      Emprestimo,
      | 'id'
      | 'dataEmprestimo'
      | 'dataDevolucaoPrevista'
      | 'dataDevolucaoReal'
      | 'devolvido'
      | 'leituraConfirmada'
      | 'resenhaConfirmada'
      | 'resenhaId'
      | 'itemTitulo'
      | 'itemTipo'
    >,
  ) => void
  devolverEmprestimo: (id: string) => void
  confirmarLeitura: (id: string) => void
  removeEmprestimo: (id: string) => void
  // resenhas
  addResenha: (dados: Omit<Resenha, 'id' | 'data'> & { data?: string }) => void
  removeResenha: (id: string) => void
  // admin
  login: (senha: string) => boolean
  logout: () => void
  trocarSenha: (atual: string, nova: string) => boolean
  resetarTudo: () => void
}

const SimmeContext = createContext<SimmeContextValue | null>(null)

export function SimmeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SimmeData>(dadosIniciais)
  const [pronto, setPronto] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SimmeData
        setData({ ...dadosIniciais, ...parsed })
      }
    } catch {
      // ignora dados corrompidos
    }
    setPronto(true)
  }, [])

  useEffect(() => {
    if (pronto) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data, pronto])

  const addItem: SimmeContextValue['addItem'] = useCallback((item) => {
    setData((d) => ({
      ...d,
      itens: [
        { ...item, id: uid(), disponivel: true, criadoEm: new Date().toISOString() },
        ...d.itens,
      ],
    }))
  }, [])

  const updateItem: SimmeContextValue['updateItem'] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      itens: d.itens.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }))
  }, [])

  const removeItem: SimmeContextValue['removeItem'] = useCallback((id) => {
    setData((d) => ({
      ...d,
      itens: d.itens.filter((i) => i.id !== id),
      emprestimos: d.emprestimos.filter((e) => e.itemId !== id),
    }))
  }, [])

  const addEmprestimo: SimmeContextValue['addEmprestimo'] = useCallback((dados) => {
    setData((d) => {
      const item = d.itens.find((i) => i.id === dados.itemId)
      if (!item) return d
      const agora = new Date().toISOString()
      const novo: Emprestimo = {
        ...dados,
        id: uid(),
        itemTitulo: item.titulo,
        itemTipo: item.tipo,
        dataEmprestimo: agora,
        dataDevolucaoPrevista: item.tipo === 'livro' ? addDias(agora, PRAZO_DIAS) : null,
        dataDevolucaoReal: null,
        devolvido: false,
        leituraConfirmada: false,
        resenhaConfirmada: false,
        resenhaId: null,
      }
      return {
        ...d,
        emprestimos: [novo, ...d.emprestimos],
        itens: d.itens.map((i) => (i.id === item.id ? { ...i, disponivel: false } : i)),
      }
    })
  }, [])

  const devolverEmprestimo: SimmeContextValue['devolverEmprestimo'] = useCallback((id) => {
    setData((d) => {
      const emp = d.emprestimos.find((e) => e.id === id)
      if (!emp) return d
      return {
        ...d,
        emprestimos: d.emprestimos.map((e) =>
          e.id === id ? { ...e, devolvido: true, dataDevolucaoReal: new Date().toISOString() } : e,
        ),
        itens: d.itens.map((i) => (i.id === emp.itemId ? { ...i, disponivel: true } : i)),
      }
    })
  }, [])

  const confirmarLeitura: SimmeContextValue['confirmarLeitura'] = useCallback((id) => {
    setData((d) => ({
      ...d,
      emprestimos: d.emprestimos.map((e) => (e.id === id ? { ...e, leituraConfirmada: true } : e)),
    }))
  }, [])

  const removeEmprestimo: SimmeContextValue['removeEmprestimo'] = useCallback((id) => {
    setData((d) => {
      const emp = d.emprestimos.find((e) => e.id === id)
      return {
        ...d,
        emprestimos: d.emprestimos.filter((e) => e.id !== id),
        itens:
          emp && !emp.devolvido
            ? d.itens.map((i) => (i.id === emp.itemId ? { ...i, disponivel: true } : i))
            : d.itens,
      }
    })
  }, [])

  const addResenha: SimmeContextValue['addResenha'] = useCallback((dados) => {
    setData((d) => {
      const id = uid()
      const resenha: Resenha = {
        alunoNome: dados.alunoNome,
        curso: dados.curso,
        turma: dados.turma,
        serie: dados.serie,
        livroTitulo: dados.livroTitulo,
        texto: dados.texto,
        emprestimoId: dados.emprestimoId ?? null,
        id,
        data: dados.data ?? new Date().toISOString(),
      }
      return {
        ...d,
        resenhas: [resenha, ...d.resenhas],
        // Ao vincular a um empréstimo, confirma a resenha (habilita o Leitor Nota 10).
        emprestimos: resenha.emprestimoId
          ? d.emprestimos.map((e) =>
              e.id === resenha.emprestimoId
                ? { ...e, resenhaConfirmada: true, resenhaId: id }
                : e,
            )
          : d.emprestimos,
      }
    })
  }, [])

  const removeResenha: SimmeContextValue['removeResenha'] = useCallback((id) => {
    setData((d) => ({
      ...d,
      resenhas: d.resenhas.filter((r) => r.id !== id),
      emprestimos: d.emprestimos.map((e) =>
        e.resenhaId === id ? { ...e, resenhaConfirmada: false, resenhaId: null } : e,
      ),
    }))
  }, [])

  const login: SimmeContextValue['login'] = useCallback(
    (senha) => {
      if (senha === data.adminSenha) {
        setIsAdmin(true)
        return true
      }
      return false
    },
    [data.adminSenha],
  )

  const logout = useCallback(() => setIsAdmin(false), [])

  const trocarSenha: SimmeContextValue['trocarSenha'] = useCallback(
    (atual, nova) => {
      if (atual !== data.adminSenha || !nova.trim()) return false
      setData((d) => ({ ...d, adminSenha: nova }))
      return true
    },
    [data.adminSenha],
  )

  const resetarTudo = useCallback(() => {
    setData((d) => ({ ...dadosIniciais, adminSenha: d.adminSenha }))
  }, [])

  const value = useMemo<SimmeContextValue>(
    () => ({
      ...data,
      pronto,
      isAdmin,
      addItem,
      updateItem,
      removeItem,
      addEmprestimo,
      devolverEmprestimo,
      confirmarLeitura,
      removeEmprestimo,
      addResenha,
      removeResenha,
      login,
      logout,
      trocarSenha,
      resetarTudo,
    }),
    [
      data,
      pronto,
      isAdmin,
      addItem,
      updateItem,
      removeItem,
      addEmprestimo,
      devolverEmprestimo,
      confirmarLeitura,
      removeEmprestimo,
      addResenha,
      removeResenha,
      login,
      logout,
      trocarSenha,
      resetarTudo,
    ],
  )

  return <SimmeContext.Provider value={value}>{children}</SimmeContext.Provider>
}

export function useSimme() {
  const ctx = useContext(SimmeContext)
  if (!ctx) throw new Error('useSimme deve ser usado dentro de SimmeProvider')
  return ctx
}
