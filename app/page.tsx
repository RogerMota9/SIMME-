'use client'

import { AdminGateProvider } from '@/components/simme/admin-gate'
import { Sidebar, type ViewId } from '@/components/simme/sidebar'
import { AcervoView } from '@/components/simme/views/acervo-view'
import { ConfigView } from '@/components/simme/views/config-view'
import { DashboardView } from '@/components/simme/views/dashboard-view'
import { EmprestimosView } from '@/components/simme/views/emprestimos-view'
import { RankingView } from '@/components/simme/views/ranking-view'
import { ResenhasView } from '@/components/simme/views/resenhas-view'
import { SimmeProvider, useSimme } from '@/lib/simme-store'
import { useState } from 'react'

export default function Page() {
  return (
    <SimmeProvider>
      <AdminGateProvider>
        <Shell />
      </AdminGateProvider>
    </SimmeProvider>
  )
}

function Shell() {
  const { pronto } = useSimme()
  const [view, setView] = useState<ViewId>('dashboard')

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar view={view} onChange={setView} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {pronto ? <ViewRouter view={view} /> : null}
        </div>
      </main>
    </div>
  )
}

function ViewRouter({ view }: { view: ViewId }) {
  switch (view) {
    case 'dashboard':
      return <DashboardView />
    case 'acervo':
      return <AcervoView />
    case 'emprestimos':
      return <EmprestimosView />
    case 'resenhas':
      return <ResenhasView />
    case 'ranking':
      return <RankingView />
    case 'config':
      return <ConfigView />
  }
}
