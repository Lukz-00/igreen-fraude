import { useState, useRef } from 'react'
import { DEMAND_TYPES, OUTCOMES, USERS, SECTOR_ROUTES } from '../data/constants'
import { Avatar, getDT, PrioTag, getInitials } from './Atoms'

const PRIORITY_STYLE = {
  'Crítica': { pClass: 'p-crit', tClass: 't-red',   color: '#e84545' },
  'Alta':    { pClass: 'p-high', tClass: 't-amber',  color: '#f0a500' },
  'Média':   { pClass: 'p-norm', tClass: 't-blue',   color: '#3d9cf0' },
}

function computeAssignee(sector, openerId) {
  const route = SECTOR_ROUTES[sector]
  return (!route || route === 'self') ? openerId : route
}

// ─── NEW TICKET ───────────────────────────────────────
export function NewTicketModal({ currentUser, demandTypes, onDemandTypesChange, onClose, onCreate }) {
  const theTypes = demandTypes || DEMAND_TYPES
  const [form, setForm] = useState({
    title: '', type: 'suspeita_geral', sector: currentUser.sector,
    flow: 'colaborador', licenseeId: '', licenseeName: '', description: '',
    evidenceFiles: [],
    assignedTo: computeAssignee(currentUser.sector, currentUser.id),
  })
  const [showManage, setShowManage] = useState(false)
  const fileRef = useRef()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const dt = theTypes.find(d => d.id === form.type) || theTypes[0]
  const assigneeUser = USERS.find(u => u.id === form.assignedTo)
  const isAdmin = currentUser.role === 'Admin'

  function handleSectorChange(newSector) {
    setForm(p => ({ ...p, sector: newSector, assignedTo: computeAssignee(newSector, currentUser.id) }))
  }

  function handleFiles(files) {
    setForm(p => ({ ...p, evidenceFiles: [...p.evidenceFiles, ...Array.from(files)] }))
  }

  function removeFile(idx) {
    setForm(p => ({ ...p, evidenceFiles: p.evidenceFiles.filter((_, i) => i !== idx) }))
  }

  function submit() {
    if (!form.title.trim() || !form.licenseeId.trim()) return
    const evidence = form.evidenceFiles.map(f => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
    }))
    onCreate({
      id: `FRD-${String(Date.now()).slice(-4)}`,
      title: form.title,
      type: form.type,
      sector: form.sector,
      status: 'aberto',
      flow: form.flow,
      licenseeId: form.licenseeId,
      licenseeName: form.licenseeName,
      description: form.description,
      openedBy: currentUser.id,
      assignedTo: form.assignedTo,
      createdAt: new Date().toISOString(),
      escalated: false,
      outcome: null,
      evidence,
      history: [{ user: currentUser.name, action: 'Ticket aberto.', time: new Date().toISOString(), type: 'open' }],
    })
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ flex: 1 }}>
              <div className="modal-title">📋 Abrir novo ticket de fraude</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
                Todo ticket deve ser autoexplicativo. O responsável não pode precisar de contato adicional.
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Título */}
            <div className="form-group">
              <label className="form-label">Título <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="form-input" maxLength={80} placeholder="Descrição curta e objetiva (máx. 80 chars)" value={form.title} onChange={e => set('title', e.target.value)} />
              <div className="char-count">{form.title.length}/80</div>
            </div>

            {/* Setor — logo após o título, com auto-atribuição */}
            <div className="form-group">
              <label className="form-label">Setor</label>
              <select className="form-input form-select" value={form.sector} onChange={e => handleSectorChange(e.target.value)}>
                {['Telecom', 'Compliance', 'Expansão'].map(s => <option key={s}>{s}</option>)}
              </select>
              {assigneeUser && (
                <div style={{ marginTop: 5, fontSize: 11.5, color: 'var(--muted)' }}>
                  → Será atribuído a: <strong style={{ color: 'var(--txt)' }}>{assigneeUser.name}</strong>
                </div>
              )}
            </div>

            <div className="form-grid">
              {/* Tipo de demanda com botão admin */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Tipo de demanda <span style={{ color: 'var(--red)' }}>*</span></span>
                  {isAdmin && (
                    <button
                      type="button"
                      title="Gerenciar tipos de demanda"
                      onClick={() => setShowManage(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
                    >⚙</button>
                  )}
                </label>
                <select className="form-input form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  {theTypes.map(d => <option key={d.id} value={d.id}>{d.label} — {d.sla}d · {d.priority}</option>)}
                </select>
                <div style={{ marginTop: 5, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <PrioTag type={form.type} />
                  <span className="form-hint">SLA: {dt?.sla ?? '—'} dia(s) útil(eis)</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fluxo de origem</label>
                <select className="form-input form-select" value={form.flow} onChange={e => set('flow', e.target.value)}>
                  <option value="colaborador">Fluxo 1 — Colaborador / Atendente</option>
                  <option value="compliance">Fluxo 2 — Compliance</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ID do Licenciado <span style={{ color: 'var(--red)' }}>*</span></label>
                <input className="form-input" placeholder="Ex: 48291" value={form.licenseeId} onChange={e => set('licenseeId', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Nome do Licenciado</label>
                <input className="form-input" placeholder="Razão social" value={form.licenseeName} onChange={e => set('licenseeName', e.target.value)} />
              </div>
            </div>

            {/* Evidências — upload real */}
            <div className="form-group">
              <label className="form-label">Evidências</label>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,.pdf,.xlsx,.xls,.csv,.txt,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
              />
              <div
                style={{
                  border: '1.5px dashed var(--line2)', borderRadius: 8, padding: '10px 14px',
                  cursor: 'pointer', fontSize: 12, color: 'var(--muted)', textAlign: 'center',
                  background: 'var(--panel)', userSelect: 'none',
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
              >
                📎 Clique ou arraste arquivos aqui (imagens, PDF, planilhas…)
              </div>
              {form.evidenceFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                  {form.evidenceFiles.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'var(--line)', borderRadius: 6, padding: '3px 9px', fontSize: 11.5,
                    }}>
                      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Descrição detalhada</label>
              <textarea className="form-input form-textarea" rows={4} placeholder="Relato completo: o que foi observado, contexto, data/hora, histórico relevante, comportamento do licenciado…" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" disabled={!form.title.trim() || !form.licenseeId.trim()} onClick={submit}>
              Abrir ticket →
            </button>
          </div>
        </div>
      </div>

      {showManage && (
        <ManageDemandTypesModal
          demandTypes={theTypes}
          onUpdate={onDemandTypesChange}
          onClose={() => setShowManage(false)}
        />
      )}
    </>
  )
}

// ─── MANAGE DEMAND TYPES (Admin) ──────────────────────
export function ManageDemandTypesModal({ demandTypes, onUpdate, onClose }) {
  const [newLabel, setNewLabel] = useState('')
  const [newSla, setNewSla]     = useState('4')
  const [newPriority, setNewPriority] = useState('Média')

  function addType() {
    const label = newLabel.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (demandTypes.find(d => d.id === id)) return
    const ps = PRIORITY_STYLE[newPriority] || PRIORITY_STYLE['Média']
    onUpdate([...demandTypes, { id, label, sla: Math.max(1, parseInt(newSla, 10) || 4), priority: newPriority, ...ps }])
    setNewLabel('')
    setNewSla('4')
  }

  function removeType(id) {
    if (demandTypes.length <= 1) return
    onUpdate(demandTypes.filter(d => d.id !== id))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ flex: 1 }}>⚙ Gerenciar tipos de demanda</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {demandTypes.map(d => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 7,
              border: '1px solid var(--line)', marginBottom: 5,
              background: 'var(--panel)',
            }}>
              <span className={`prio ${d.pClass}`}>{d.priority}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>SLA: {d.sla}d úteis</div>
              </div>
              <button
                onClick={() => removeType(d.id)}
                disabled={demandTypes.length <= 1}
                style={{
                  background: 'none', border: 'none', padding: '0 4px', fontSize: 17, lineHeight: 1,
                  cursor: demandTypes.length <= 1 ? 'default' : 'pointer',
                  color: demandTypes.length <= 1 ? 'var(--muted2)' : 'var(--red)',
                }}
              >×</button>
            </div>
          ))}

          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--line2)', background: 'var(--bg)' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>Adicionar tipo</div>
            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome</label>
                <input className="form-input" placeholder="Ex: Fraude Financeira" value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addType()} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">SLA (dias úteis)</label>
                <input className="form-input" type="number" min="1" max="30" value={newSla} onChange={e => setNewSla(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 8, marginBottom: 10 }}>
              <label className="form-label">Prioridade</label>
              <select className="form-input form-select" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                <option>Crítica</option>
                <option>Alta</option>
                <option>Média</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!newLabel.trim()}
              onClick={addType}
            >+ Adicionar tipo</button>
          </div>
        </div>
        <div className="modal-footer">
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

// ─── ESCALATE ────────────────────────────────────────
export function EscalateModal({ ticket, currentUser, onClose, onEscalate }) {
  const admins = USERS.filter(u => u.role === 'Admin' && u.sector === ticket.sector && u.id !== currentUser.id)
  const [selAdmin, setSelAdmin] = useState(admins[0]?.id || null)
  const [reason, setReason] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <div className="modal-title" style={{ color: 'var(--amber)' }}>↑ Escalar para Admin</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
              Admins disponíveis do setor <strong>{ticket.sector}</strong>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '18px 22px' }}>
          <div className="form-group">
            <label className="form-label">Selecionar Admin</label>
            {admins.length === 0
              ? <div className="empty">Nenhum Admin disponível neste setor além de você.</div>
              : admins.map(u => (
                <div key={u.id} className={`admin-opt ${selAdmin === u.id ? 'sel' : ''}`} onClick={() => setSelAdmin(u.id)}>
                  <div className="admin-dot" />
                  <Avatar name={u.name} size={28} bg={u.avBg} fg={u.avFg} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.sector} · {u.role}</div>
                  </div>
                </div>
              ))
            }
          </div>
          <div className="form-group">
            <label className="form-label">Motivo do escalonamento <span style={{ color: 'var(--red)' }}>*</span></label>
            <textarea className="form-input form-textarea" rows={3} placeholder="Descreva o que justifica o escalonamento…" value={reason} onChange={e => setReason(e.target.value)} />
            <div className="form-hint">Campo obrigatório — escalonamentos sem motivo são rejeitados pelo sistema.</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-amber" disabled={!reason.trim() || !selAdmin} onClick={() => onEscalate(selAdmin, reason)}>
            ↑ Escalar agora
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── OUTCOME ─────────────────────────────────────────
export function OutcomeModal({ ticket, onClose, onConfirm }) {
  const [sel, setSel] = useState('bloqueio_definitivo')
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <div className="modal-title">✓ Encerrar — {ticket.id}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
              Selecione o desfecho. Será registrado no histórico e notificado a quem abriu o ticket.
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '18px 22px' }}>
          {OUTCOMES.map(o => (
            <div key={o.id} className={`outcome-opt ${sel === o.id ? 'sel' : ''}`} onClick={() => setSel(o.id)}>
              <div className="outcome-radio" />
              <div>
                <div className="outcome-label">{o.label}</div>
                <div className="outcome-desc">{o.desc}</div>
              </div>
            </div>
          ))}
          <div className="form-hint" style={{ marginTop: 10 }}>
            Em Bloqueio Definitivo ou Cancelamento, o setor jurídico deve ser notificado para providências contratuais.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => onConfirm(sel)}>Confirmar encerramento →</button>
        </div>
      </div>
    </div>
  )
}

// ─── ASSIGN ──────────────────────────────────────────
export function AssignModal({ ticket, onClose, onAssign }) {
  const [sel, setSel] = useState(ticket.assignedTo || null)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ flex: 1 }}>👤 Reatribuir ticket</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {USERS.map(u => (
            <div key={u.id} className={`admin-opt ${sel === u.id ? 'sel' : ''}`} onClick={() => setSel(u.id)}>
              <div className="admin-dot" />
              <Avatar name={u.name} size={28} bg={u.avBg} fg={u.avFg} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.sector} · {u.role}</div>
              </div>
              {ticket.assignedTo === u.id && <span className="tag t-grey" style={{ fontSize: 9 }}>atual</span>}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" disabled={!sel || sel === ticket.assignedTo} onClick={() => onAssign(sel)}>
            Confirmar →
          </button>
        </div>
      </div>
    </div>
  )
}
