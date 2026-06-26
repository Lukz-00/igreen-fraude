import { useState } from 'react'
import { DEMAND_TYPES, USERS, OUTCOMES } from '../../data/constants'
import { getDT, slaInfo, PrioTag, StatusTag, SLAChip, MiniBar, hasPerm } from '../Atoms'
import { TicketDetail } from '../TicketDetail'
import { EscalateModal, OutcomeModal, AssignModal } from '../Modals'

export function TicketsView({ tickets, currentUser, selectedTicket, setSelectedTicket, onMutate, onAddHistory, toast }) {
  const [seg, setSeg]         = useState('all')
  const [filterType, setFT]   = useState('all')
  const [search, setSearch]   = useState('')
  const [showEscalate, setShowEscalate] = useState(false)
  const [showOutcome, setShowOutcome]   = useState(false)
  const [showAssign, setShowAssign]     = useState(false)

  const canAll    = hasPerm(currentUser.role, 'all_tickets')

  const visible = tickets.filter(t => {
    if (!canAll && t.openedBy !== currentUser.id && t.assignedTo !== currentUser.id) return false
    if (seg === 'critico'  && getDT(t.type).priority !== 'Crítica') return false
    if (seg === 'escalado' && !t.escalated) return false
    if (seg === 'aberto'   && t.status === 'encerrado') return false
    if (seg === 'encerrado'&& t.status !== 'encerrado') return false
    if (filterType !== 'all' && t.type !== filterType) return false
    const q = search.toLowerCase()
    if (q && !t.title.toLowerCase().includes(q) && !t.id.includes(q) && !t.licenseeId.includes(q) && !t.licenseeName.toLowerCase().includes(q)) return false
    return true
  })

  const counts = {
    all:       tickets.length,
    aberto:    tickets.filter(t => t.status !== 'encerrado').length,
    critico:   tickets.filter(t => getDT(t.type).priority === 'Crítica').length,
    escalado:  tickets.filter(t => t.escalated).length,
    encerrado: tickets.filter(t => t.status === 'encerrado').length,
  }

  function syncSelected(id, patch) {
    onMutate(id, patch)
    if (selectedTicket?.id === id) setSelectedTicket(prev => ({ ...prev, ...patch }))
  }
  function syncHistory(id, entry) {
    onAddHistory(id, entry)
    if (selectedTicket?.id === id) setSelectedTicket(prev => ({ ...prev, history: [...prev.history, entry] }))
  }

  function handleReply(id, text) {
    syncHistory(id, { user: currentUser.name, action: text, time: new Date().toISOString(), type: 'reply' })
    toast('success', 'Resposta registrada no histórico.')
  }

  function handleEscalate(adminId, reason) {
    const u = USERS.find(u => u.id === adminId)
    syncHistory(selectedTicket.id, { user: currentUser.name, action: `Escalonado para ${u.name} — Motivo: ${reason}`, time: new Date().toISOString(), type: 'escalate' })
    syncSelected(selectedTicket.id, { escalated: true })
    setShowEscalate(false)
    toast('warn', `Admin ${u.name} notificado sobre o escalonamento.`)
  }

  function handleOutcome(outcomeId) {
    const o = OUTCOMES.find(x => x.id === outcomeId)
    syncHistory(selectedTicket.id, { user: currentUser.name, action: `Ticket encerrado — Desfecho: ${o.label}`, time: new Date().toISOString(), type: 'close' })
    syncSelected(selectedTicket.id, { status: 'encerrado', outcome: outcomeId })
    setShowOutcome(false)
    toast('success', `Encerrado — ${o.label}`)
  }

  function handleAssign(userId) {
    const u = USERS.find(u => u.id === userId)
    syncHistory(selectedTicket.id, { user: currentUser.name, action: `Ticket reatribuído para ${u.name}`, time: new Date().toISOString(), type: 'assign' })
    syncSelected(selectedTicket.id, { assignedTo: userId, status: selectedTicket.status === 'aberto' ? 'em_analise' : selectedTicket.status })
    setShowAssign(false)
    toast('success', `Atribuído para ${u.name}`)
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* List panel */}
      <div className="ticket-list-panel">
        <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Tickets</span>
            <span className="tag t-blue">{visible.length}</span>
          </div>
          <div className="search-box" style={{ marginLeft: 0, minWidth: 'unset' }}>
            🔎<input placeholder="ID, título, licenciado…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>
          <div className="seg" style={{ gap: 1 }}>
            {[
              { k: 'all',       l: 'Todos',    n: counts.all },
              { k: 'aberto',    l: 'Abertos',  n: counts.aberto },
              { k: 'critico',   l: '🔴',       n: counts.critico },
              { k: 'escalado',  l: '↑ Escal.', n: counts.escalado },
              { k: 'encerrado', l: '✓ Enc.',   n: counts.encerrado },
            ].map(s => (
              <button key={s.k} className={`seg-btn ${seg === s.k ? 'on' : ''}`} onClick={() => setSeg(s.k)}>
                {s.l} <span className="cnt">{s.n}</span>
              </button>
            ))}
          </div>
          <select
            className="form-input form-select"
            style={{ marginTop: 6, fontSize: 11.5 }}
            value={filterType}
            onChange={e => setFT(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            {DEMAND_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {visible.length === 0 && <div className="empty" style={{ margin: 12 }}>Nenhum ticket encontrado.</div>}
          {visible.map(t => {
            const dt = getDT(t.type)
            const s  = slaInfo(t)
            const isOver = s.pct >= 100 && t.status !== 'encerrado'
            const isSel  = selectedTicket?.id === t.id
            return (
              <div
                key={t.id}
                className={`ticket-list-item ${isSel ? 'active' : isOver ? 'item-crit' : s.pct >= 75 ? 'item-warn' : ''}`}
                onClick={() => setSelectedTicket(t)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Consolas,monospace', fontSize: 10.5, color: 'var(--blue)' }}>{t.id}</span>
                      {t.escalated && <span className="tag t-amber" style={{ fontSize: 9, padding: '1px 5px' }}>↑</span>}
                      <StatusTag status={t.status} />
                    </div>
                    <div className="ttype" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{dt.label} · {t.licenseeName}</div>
                  </div>
                  <PrioTag type={t.type} />
                </div>
                {t.status !== 'encerrado' && <MiniBar pct={s.pct} color={s.color} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="detail-panel">
        {!selectedTicket
          ? <div className="detail-empty">
              <div style={{ fontSize: 40 }}>🎫</div>
              <div style={{ fontSize: 13 }}>Selecione um ticket para visualizar</div>
            </div>
          : <TicketDetail
              ticket={selectedTicket}
              currentUser={currentUser}
              onReply={handleReply}
              onEscalate={() => setShowEscalate(true)}
              onOutcome={() => setShowOutcome(true)}
              onAssign={() => setShowAssign(true)}
            />
        }
      </div>

      {showEscalate && selectedTicket && (
        <EscalateModal
          ticket={selectedTicket}
          currentUser={currentUser}
          onClose={() => setShowEscalate(false)}
          onEscalate={handleEscalate}
        />
      )}
      {showOutcome && selectedTicket && (
        <OutcomeModal
          ticket={selectedTicket}
          onClose={() => setShowOutcome(false)}
          onConfirm={handleOutcome}
        />
      )}
      {showAssign && selectedTicket && (
        <AssignModal
          ticket={selectedTicket}
          onClose={() => setShowAssign(false)}
          onAssign={handleAssign}
        />
      )}
    </div>
  )
}
