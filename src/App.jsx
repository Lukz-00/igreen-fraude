import { useState } from 'react'
import { USERS, DEMAND_TYPES, _live } from './data/constants'
import { useToast } from './hooks/useToast'
import { useTickets } from './hooks/useTickets'
import { hasPerm, ToastContainer } from './components/Atoms'
import { NewTicketModal } from './components/Modals'
import { DashboardView }  from './components/views/DashboardView'
import { TicketsView }    from './components/views/TicketsView'
import { IndicatorsView } from './components/views/IndicatorsView'
import { UsersView }      from './components/views/UsersView'

export default function App() {
  const [currentUser, setCurrentUser] = useState(USERS[0])
  const [page, setPage]               = useState('dashboard')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showNew, setShowNew]         = useState(false)
  const [demandTypes, setDemandTypes] = useState(DEMAND_TYPES)

  function handleDemandTypesChange(types) {
    setDemandTypes(types)
    _live.demandTypes = types
  }

  const { tickets, mutate, addHistory, createTicket } = useTickets()
  const { toasts, toast, remove } = useToast()

  const openCount  = tickets.filter(t => t.status !== 'encerrado').length
  const critCount  = tickets.filter(t => {
    const dt = DEMAND_TYPES.find(d => d.id === t.type)
    return dt?.priority === 'Crítica' && t.status !== 'encerrado'
  }).length
  const escalCount = tickets.filter(t => t.escalated).length
  const canAll     = hasPerm(currentUser.role, 'all_tickets')

  function nav(p) {
    setPage(p)
    if (p !== 'tickets') setSelectedTicket(null)
  }

  function handleCreate(data) {
    createTicket(data)
    setShowNew(false)
    setSelectedTicket(data)
    setPage('tickets')
    toast('success', `Ticket ${data.id} aberto com sucesso.`)
  }

  return (
    <>
      <div className="app">
        {/* Topbar */}
        <div className="topbar">
          <a className="brand" href="#">
            <div className="brand-dot">⚡</div>iGreen
          </a>
          <div className="role-tabs">
            <button className="role-tab active">🔐 Anti-Fraude</button>
          </div>
          <div className="topbar-right">
            <div className="tb-user">
              <select
                style={{ background: 'transparent', border: '1px solid var(--line2)', borderRadius: 7, color: 'var(--txt)', padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
                value={currentUser.id}
                onChange={e => setCurrentUser(USERS.find(u => u.id === parseInt(e.target.value)))}
              >
                {USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <div
                className="av av-sm"
                style={{ background: currentUser.avBg, color: currentUser.avFg }}
              >
                {currentUser.name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="layout-sidebar">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-section">Principal</div>
            <button className={`nav-item ${page === 'dashboard'  ? 'active' : ''}`} onClick={() => nav('dashboard')}>
              <span className="ni-icon">🖥️</span>Dashboard
            </button>
            <button className={`nav-item ${page === 'tickets'    ? 'active' : ''}`} onClick={() => nav('tickets')}>
              <span className="ni-icon">🎫</span>Tickets
              {openCount > 0 && <span className="nav-badge">{openCount}</span>}
            </button>
            <button className={`nav-item ${page === 'indicators' ? 'active' : ''}`} onClick={() => nav('indicators')}>
              <span className="ni-icon">⚠️</span>Indicadores
            </button>
            {canAll && (
              <button className={`nav-item ${page === 'users' ? 'active' : ''}`} onClick={() => nav('users')}>
                <span className="ni-icon">👥</span>Usuários
              </button>
            )}

            <div className="sidebar-section">Ações rápidas</div>
            <button className="nav-item" onClick={() => setShowNew(true)}>
              <span className="ni-icon">➕</span>Abrir ticket
            </button>

            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {critCount > 0 && (
                <div className="sb-stat" style={{ cursor: 'pointer' }} onClick={() => nav('tickets')}>
                  <div className="sb-stat-label" style={{ color: 'var(--red)' }}>🔴 Críticos ativos</div>
                  <div className="sb-stat-n" style={{ color: 'var(--red)' }}>{critCount}</div>
                </div>
              )}
              {escalCount > 0 && (
                <div className="sb-stat amber" style={{ cursor: 'pointer' }} onClick={() => nav('tickets')}>
                  <div className="sb-stat-label" style={{ color: 'var(--amber)' }}>↑ Escalados</div>
                  <div className="sb-stat-n" style={{ color: 'var(--amber)' }}>{escalCount}</div>
                </div>
              )}
            </div>
          </aside>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {page === 'dashboard'  && <DashboardView tickets={tickets} setPage={setPage} setSelectedTicket={setSelectedTicket} />}
            {page === 'tickets'    && (
              <TicketsView
                tickets={tickets}
                currentUser={currentUser}
                selectedTicket={selectedTicket}
                setSelectedTicket={setSelectedTicket}
                onMutate={mutate}
                onAddHistory={addHistory}
                toast={toast}
              />
            )}
            {page === 'indicators' && <IndicatorsView />}
            {page === 'users'      && <UsersView currentUser={currentUser} />}
          </div>
        </div>
      </div>

      {showNew && (
        <NewTicketModal
          currentUser={currentUser}
          demandTypes={demandTypes}
          onDemandTypesChange={handleDemandTypesChange}
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}

      <ToastContainer toasts={toasts} remove={remove} />
    </>
  )
}
