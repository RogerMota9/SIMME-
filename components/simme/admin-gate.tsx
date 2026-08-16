'use client'

import { Button } from '@/components/ui/button'
import { Field, Modal, TextInput } from '@/components/simme/ui'
import { useSimme } from '@/lib/simme-store'
import { Lock } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface AdminGateValue {
  /** Executa a ação se já for admin; caso contrário, pede a senha. */
  ensureAdmin: (action: () => void) => void
  /** Abre o modal de login sem ação pendente. */
  promptLogin: () => void
}

const AdminGateContext = createContext<AdminGateValue | null>(null)

export function AdminGateProvider({ children }: { children: ReactNode }) {
  const { isAdmin, login } = useSimme()
  const [open, setOpen] = useState(false)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)
  const pending = useRef<(() => void) | null>(null)

  const ensureAdmin = useCallback(
    (action: () => void) => {
      if (isAdmin) {
        action()
        return
      }
      pending.current = action
      setSenha('')
      setErro(false)
      setOpen(true)
    },
    [isAdmin],
  )

  const promptLogin = useCallback(() => {
    pending.current = null
    setSenha('')
    setErro(false)
    setOpen(true)
  }, [])

  function tentar(e: React.FormEvent) {
    e.preventDefault()
    if (login(senha)) {
      setOpen(false)
      const action = pending.current
      pending.current = null
      action?.()
    } else {
      setErro(true)
    }
  }

  return (
    <AdminGateContext.Provider value={{ ensureAdmin, promptLogin }}>
      {children}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Acesso do administrador"
        description="Cadastrar, editar e excluir materiais exige senha de administrador."
      >
        <form onSubmit={tentar} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            Informe a senha para continuar.
          </div>
          <Field label="Senha">
            <TextInput
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                setErro(false)
              }}
              placeholder="••••••••"
              autoFocus
            />
          </Field>
          {erro ? <p className="text-sm text-destructive">Senha incorreta. Tente novamente.</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Entrar</Button>
          </div>
        </form>
      </Modal>
    </AdminGateContext.Provider>
  )
}

export function useAdminGate() {
  const ctx = useContext(AdminGateContext)
  if (!ctx) throw new Error('useAdminGate deve ser usado dentro de AdminGateProvider')
  return ctx
}
