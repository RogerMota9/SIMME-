'use client'

import { cn } from '@/lib/utils'
import { useSimme } from '@/lib/simme-store'
import {
  ArrowLeftRight,
  Library,
  LayoutDashboard,
  Lock,
  LogOut,
  Settings,
  Star,
  Trophy,
} from 'lucide-react'

export type ViewId =
  | 'dashboard'
  | 'acervo'
  | 'emprestimos'
  | 'resenhas'
  | 'ranking'
  | 'config'

const NAV: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'acervo', label: 'Acervo', icon: Library },
  { id: 'emprestimos', label: 'Empréstimos', icon: ArrowLeftRight },
  { id: 'resenhas', label: 'Resenhas', icon: Star },
  { id: 'ranking', label: 'Leitor Nota 10', icon: Trophy },
  { id: 'config', label: 'Configurações', icon: Settings },
]

export function Sidebar({
  view,
  onChange,
}: {
  view: ViewId
  onChange: (v: ViewId) => void
}) {
  const { isAdmin, logout } = useSimme()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Espaço reservado para a logo (a definir) */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-sidebar-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          aria-label="Espaço reservado para a logo"
        >
          logo
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">SIMME</p>
          <p className="truncate text-xs text-muted-foreground">Multimeios</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        {isAdmin ? (
          <div className="flex items-center justify-between gap-2 rounded-md bg-sidebar-accent/50 px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-medium text-[var(--success)]">
              <span className="size-2 rounded-full bg-[var(--success)]" />
              Modo administrador
            </span>
            <button
              onClick={logout}
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Sair do modo administrador"
              title="Sair"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Modo consulta
          </div>
        )}
      </div>
    </aside>
  )
}
