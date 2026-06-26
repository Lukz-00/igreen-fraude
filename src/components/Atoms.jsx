import { DEMAND_TYPES, STATUS_MAP, OUTCOMES, _live } from '../data/constants'

// ─── HELPERS ─────────────────────────────────────────
export function getDT(id) {
  const list = _live.demandTypes || DEMAND_TYPES
  return list.find(d => d.id === id) || list[3] || list[0]
}
export function getInitials(name) { return name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() }
export function hasPerm(role, perm) {
  const map = {
    'Colaborador':      ['own_tickets'],
    'Analista de Dados':['all_tickets','kpi','reports','reassign'],
    'Gestor':           ['all_tickets','kpi','reports','reassign'],
    'Admin':            ['all_tickets','kpi','reports','reassign','config','logs'],
  }
  return (map[role] || []).includes(perm)
}
export function fmtDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
}
export function slaInfo(ticket) {
  const dt = getDT(ticket.type)
  const elapsed = (Date.now() - new Date(ticket.createdAt)) / 86400000
  const pct = Math.min(100, Math.round((elapsed / dt.sla) * 100))
  const hours = Math.round((dt.sla - elapsed) * 24)
  if (ticket.status === 'encerrado') return { pct: 100, cls: 'sc-ok', label: 'Encerrado', color: '#2ecc72' }
  if (pct >= 100) return { pct: 100, cls: 'sc-over', label: 'VENCIDO',              color: '#e84545' }
  if (pct >= 75)  return { pct, cls: 'sc-crit', label: `${Math.max(hours,0)}h restantes`, color: '#e84545' }
  if (pct >= 50)  return { pct, cls: 'sc-warn', label: `${hours}h restantes`,        color: '#f0a500' }
  return { pct, cls: 'sc-ok', label: `${hours}h restantes`, color: '#2ecc72' }
}
export function getOutcomeLabel(id) { return OUTCOMES.find(o => o.id === id)?.label || id }

// ─── AVATAR ──────────────────────────────────────────
export function Avatar({ name, size = 28, bg = '#1a4070', fg = '#3d9cf0' }) {
  return (
    <div className="av" style={{ width: size, height: size, fontSize: size * 0.33, background: bg, color: fg }}>
      {getInitials(name)}
    </div>
  )
}

// ─── PRIORITY BADGE ───────────────────────────────────
export function PrioTag({ type }) {
  const dt = getDT(type)
  return <span className={`prio ${dt.pClass}`}>{dt.priority}</span>
}

// ─── STATUS TAG ───────────────────────────────────────
export function StatusTag({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 't-grey' }
  return <span className={`tag ${s.cls}`}>{s.label}</span>
}

// ─── SLA CHIP ────────────────────────────────────────
export function SLAChip({ ticket }) {
  const s = slaInfo(ticket)
  return <span className={`sla-chip ${s.cls}`}>⏱ {s.label}</span>
}

// ─── MINI BAR ────────────────────────────────────────
export function MiniBar({ pct, color }) {
  return (
    <div className="mini-bar">
      <div className="mini-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ─── TOAST CONTAINER ─────────────────────────────────
export function ToastContainer({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <div className="toast-progress">
            <div className="toast-bar" style={{ width: '0%', background: t.color }} />
          </div>
          <div className="toast-inner">
            <div className="toast-row">
              <div className="toast-icon" style={{ background: t.iconBg, color: t.color }}>{t.icon}</div>
              <div className="toast-content">
                <div className="toast-cat" style={{ color: t.color }}>{t.cat}</div>
                <div className="toast-title">{t.title}</div>
                {t.desc && <div className="toast-desc">{t.desc}</div>}
              </div>
              <button className="toast-x" onClick={() => remove(t.id)}>×</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
