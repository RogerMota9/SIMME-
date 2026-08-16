'use client'

import { Button } from '@/components/ui/button'
import { useAdminGate } from '@/components/simme/admin-gate'
import { Field, PageHeader, TextInput } from '@/components/simme/ui'
import { useSimme } from '@/lib/simme-store'
import { Info, Lock, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

export function ConfigView() {
  const { isAdmin, logout, trocarSenha, resetarTudo } = useSimme()
  const { promptLogin } = useAdminGate()

  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  function salvarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (trocarSenha(atual, nova)) {
      setMsg({ ok: true, texto: 'Senha atualizada com sucesso.' })
      setAtual('')
      setNova('')
    } else {
      setMsg({ ok: false, texto: 'Senha atual incorreta ou nova senha inválida.' })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Gerenciamento administrativo do sistema."
      />

      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="text-muted-foreground">
          <p>
            Senha padrão de administrador:{' '}
            <span className="font-mono text-foreground">marly123</span> (exemplo — altere abaixo).
          </p>
          <p className="mt-1">
            Os dados ficam salvos apenas neste dispositivo (armazenamento local do navegador).
          </p>
        </div>
      </div>

      {!isAdmin ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-foreground">
            <Lock className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">Você está no modo consulta</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Entre como administrador para cadastrar, editar e excluir materiais, além de alterar a
            senha.
          </p>
          <Button onClick={promptLogin}>Entrar como administrador</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-[var(--success)]">
              <ShieldCheck className="size-5" />
              <h2 className="font-semibold">Modo administrador ativo</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Você tem acesso completo às funções de gerenciamento.
            </p>
            <Button variant="secondary" className="mt-4" onClick={logout}>
              Sair do modo administrador
            </Button>
          </div>

          <form onSubmit={salvarSenha} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">Alterar senha</h2>
            <Field label="Senha atual">
              <TextInput
                type="password"
                value={atual}
                onChange={(e) => {
                  setAtual(e.target.value)
                  setMsg(null)
                }}
              />
            </Field>
            <Field label="Nova senha">
              <TextInput
                type="password"
                value={nova}
                onChange={(e) => {
                  setNova(e.target.value)
                  setMsg(null)
                }}
              />
            </Field>
            {msg ? (
              <p className={msg.ok ? 'text-sm text-[var(--success)]' : 'text-sm text-destructive'}>
                {msg.texto}
              </p>
            ) : null}
            <div>
              <Button type="submit" disabled={!atual || !nova}>
                Salvar nova senha
              </Button>
            </div>
          </form>

          <div className="rounded-xl border border-destructive/40 bg-card p-6 lg:col-span-2">
            <div className="flex items-center gap-2 text-destructive">
              <RotateCcw className="size-5" />
              <h2 className="font-semibold">Zerar dados</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Remove todo o acervo, empréstimos e resenhas deste dispositivo. A senha é mantida.
              Esta ação não pode ser desfeita.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => {
                if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação é irreversível.'))
                  resetarTudo()
              }}
            >
              Zerar todos os dados
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
