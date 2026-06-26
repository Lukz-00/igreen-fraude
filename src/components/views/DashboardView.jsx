import { DEMAND_TYPES, USERS } from '../../data/constants'
import { getDT, slaInfo, MiniBar, PrioTag, StatusTag, SLAChip, Avatar, fmtDate } from '../Atoms'

export function DashboardView({ tickets, setPage, setSelectedTicket }) {
  const open    = tickets.filter(t => t.status !== 'encerrado')
  const crit    = open.filter(t => getDT(t.type).priority === 'Crítica')
  const overdue = open.filter(t => slaInfo(t).pct >= 100)
  const alerts  = open.filter(t => { const p = slaInfo(t).pct; return p >= 75 && p < 100 })

  function goTicket(t) { setSelectedTicket(t); setPage('tickets') }

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Visão geral — tickets de fraude ativos e histórico</div>
      </div>

      {/* KPIs */}
      <div className="kpi-row g4">
        <div className="kpi-card">
          <div className="kpi-n" style={{ color: '#3d9cf0' }}>{tickets.length}</div>
          <div className="kpi-l">Total de tickets</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-n" style={{ color: open.length ? '#f0a500' : '#2ecc72' }}>{open.length}</div>
          <div className="kpi-l">Em aberto</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-n" style={{ color: crit.length ? '#e84545' : '#2ecc72' }}>{crit.length}</div>
          <div className="kpi-l">Críticos ativos</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-n" style={{ color: overdue.length ? '#e84545' : '#2ecc72' }}>{overdue.length}</div>
          <div className="kpi-l">SLA vencido</div>
        </div>
      </div>

      {/* Alerts */}
      {overdue.length > 0 && (
        <div className="alert-bar red">
          <span className="ab-icon">🔥</span>
          <span className="ab-text">{overdue.length} ticket(s) com SLA vencido — ação imediata necessária</span>
          <span className="ab-badge t-red">Escalonamento necessário</span>
        </div>
      )}
      {alerts.length > 0 && !overdue.length && (
        <div className="alert-bar amber">
          <span className="ab-icon">⚠️</span>
          <span className="ab-text">{alerts.length} ticket(s) com SLA próximo do vencimento (≥75%)</span>
          <span className="ab-badge t-amber">Atenção</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* Open tickets list */}
        <div className="card">
          <h4>Tickets em aberto</h4>
          {open.length === 0 && <div className="empty">Nenhum ticket em aberto. ✓</div>}
          {open.slice(0, 7).map(t => {
            const dt = getDT(t.type); const s = slaInfo(t)
            return (
              <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid #1a305025', cursor: 'pointer' }} onClick={() => goTicket(t)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Consolas,monospace', fontSize: 11, color: '#3d9cf0' }}>{t.id}</span>
                      <PrioTag type={t.type} />
                      <StatusTag status={t.status} />
                      {t.escalated && <span className="tag t-amber">↑</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{t.licenseeName} · {dt.label}</div>
                  </div>
                  <SLAChip ticket={t} />
                </div>
                <MiniBar pct={s.pct} color={s.color} />
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* By type */}
          <div className="card">
            <h4>Por tipo de demanda</h4>
            {DEMAND_TYPES.map(dt => {
              const count = tickets.filter(t => t.type === dt.id).length
              const pct = Math.round((count / Math.max(tickets.length, 1)) * 100)
              return (
                <div key={dt.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{dt.label}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'Consolas,monospace' }}>{count}</span>
                  </div>
                  <MiniBar pct={pct} color={dt.color} />
                </div>
              )
            })}
          </div>

          {/* Admins by sector */}
          <div className="card">
            <h4>Admins por setor</h4>
            {['Telecom', 'Compliance', 'Expansão'].map(sec => {
              const admins = USERS.filter(u => u.sector === sec && u.role === 'Admin')
              return (
                <div key={sec} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 700, marginBottom: 4 }}>{sec}</div>
                  {admins.map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <Avatar name={u.name} size={22} bg={u.avBg} fg={u.avFg} />
                      <span style={{ fontSize: 12 }}>{u.name}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* SLA alerts */}
          {(overdue.length > 0 || alerts.length > 0) && (
            <div className="card">
              <h4>⚠ Alertas SLA</h4>
              {[...overdue, ...alerts].slice(0, 4).map(t => {
                const p = slaInfo(t).pct; const isOver = p >= 100
                return (
                  <div key={t.id} className={`dash-alert ${isOver ? 'red' : 'amber'}`} onClick={() => goTicket(t)}>
                    <span style={{ fontSize: 14 }}>{isOver ? '🔴' : '🟠'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: isOver ? 'var(--red)' : 'var(--amber)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{t.id} · {isOver ? 'VENCIDO' : `SLA ${p}%`}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
