import { useState } from 'react'
import { USERS } from '../data/constants'
import { Avatar, PrioTag, StatusTag, SLAChip, getDT, slaInfo, fmtDate, hasPerm, getOutcomeLabel, getInitials } from './Atoms'

export function TicketDetail({ ticket, currentUser, onReply, onEscalate, onOutcome, onAssign }) {
  const [tab, setTab] = useState('detalhes')
  const [replyText, setReplyText] = useState('')

  const canAll    = hasPerm(currentUser.role, 'all_tickets')
  const canAssign = hasPerm(currentUser.role, 'reassign')
  const dt = getDT(ticket.type)
  const s  = slaInfo(ticket)
  const opener   = USERS.find(u => u.id === ticket.openedBy)
  const assignee = USERS.find(u => u.id === ticket.assignedTo)

  const avCls = { open:'tl-av-i', assign:'tl-av-f', update:'tl-av-f', escalate:'tl-av-e', close:'tl-av-c', reply:'tl-av-x' }

  function sendReply() {
    if (!replyText.trim()) return
    onReply(ticket.id, replyText)
    setReplyText('')
  }

  return (
    <>
      {/* Header */}
      <div className="modal-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 4 }}>
            {ticket.flow === 'compliance' ? 'Fluxo 2 — Abertura pelo Compliance' : 'Fluxo 1 — Abertura por colaborador / atendente'}
          </div>
          <div className="modal-title">
            <span className="modal-code">{ticket.id}</span>
            <span style={{ wordBreak: 'break-word' }}>{ticket.title}</span>
          </div>
          <div className="modal-badges">
            <PrioTag type={ticket.type} />
            <StatusTag status={ticket.status} />
            <span className={`tag ${dt.tClass}`}>{dt.label}</span>
            {ticket.escalated && <span className="tag t-amber">↑ Escalado</span>}
            {ticket.outcome && <span className="tag t-green">✓ {getOutcomeLabel(ticket.outcome)}</span>}
          </div>
        </div>
      </div>

      {/* SLA strip */}
      <div className="modal-sla">
        <SLAChip ticket={ticket} />
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          SLA: {dt.sla} dia(s) útil(eis) · Aberto em {fmtDate(ticket.createdAt)}
        </div>
        {ticket.status !== 'encerrado' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {canAssign && (
              <button className="btn btn-ghost btn-sm" onClick={() => onAssign(ticket)}>👤 Reatribuir</button>
            )}
            {canAssign && ticket.status !== 'encerrado' && (
              <button className="btn btn-amber btn-sm" onClick={() => onEscalate(ticket)}>↑ Escalar Admin</button>
            )}
            {canAll && (
              <button className="btn btn-danger btn-sm" onClick={() => onOutcome(ticket)}>✓ Encerrar</button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="modal-tabs">
        {['detalhes', 'historico', 'evidencias'].map(t => (
          <button key={t} className={`modal-tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="modal-body">
        <div className="modal-main">

          {/* DETALHES */}
          {tab === 'detalhes' && (
            <>
              <div className="callout" style={{ marginTop: 0, marginBottom: 14 }}>
                {ticket.description || <em style={{ color: 'var(--muted2)' }}>Sem descrição.</em>}
              </div>

              {ticket.status === 'encerrado' && ticket.outcome && (
                <div style={{ background: 'var(--greenSoft)', border: '1px solid var(--greenBorder)', borderRadius: 9, padding: '10px 14px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 700, marginBottom: 3 }}>Desfecho registrado</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{getOutcomeLabel(ticket.outcome)}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="side-block">
                  <div className="side-label">Licenciado</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{ticket.licenseeName}</div>
                  <div style={{ fontFamily: 'Consolas, monospace', fontSize: 11, color: 'var(--blue)', marginTop: 2 }}>
                    ID: {ticket.licenseeId}
                  </div>
                </div>
                <div className="side-block">
                  <div className="side-label">Responsável</div>
                  {assignee
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Avatar name={assignee.name} size={26} bg={assignee.avBg} fg={assignee.avFg} />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{assignee.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{assignee.sector}</div>
                        </div>
                      </div>
                    : <div style={{ fontSize: 12.5, color: 'var(--muted2)', fontStyle: 'italic' }}>Não atribuído</div>
                  }
                </div>
              </div>
            </>
          )}

          {/* HISTÓRICO */}
          {tab === 'historico' && (
            <>
              {ticket.history.map((h, i) => (
                <div key={i} className="tl-item">
                  <div className={`tl-av ${avCls[h.type] || 'tl-av-x'}`}>
                    {getInitials(h.user)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="tl-who">{h.user}</div>
                    <div className="tl-msg">{h.action}</div>
                    <div className="tl-dt">{fmtDate(h.time)}</div>
                  </div>
                </div>
              ))}
              {ticket.status !== 'encerrado' && (
                <div className="tl-compose">
                  <textarea
                    placeholder="Registrar atualização ou resposta…"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <div className="tl-compose-footer">
                    <span className="tl-compose-hint">Como {currentUser.name}</span>
                    <button className="tl-send-btn" disabled={!replyText.trim()} onClick={sendReply}>
                      Enviar →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* EVIDÊNCIAS */}
          {tab === 'evidencias' && (
            <>
              {ticket.evidence.length === 0
                ? <div className="empty">Nenhuma evidência anexada a este ticket.</div>
                : ticket.evidence.map((ev, i) => {
                    const isObj = typeof ev === 'object' && ev !== null
                    const name  = isObj ? ev.name : ev
                    const url   = isObj ? ev.url  : null
                    const isImg = isObj && ev.type?.startsWith('image/')
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)', marginBottom: 6 }}>
                        {isImg
                          ? <img src={url} alt={name} style={{ height: 44, width: 44, objectFit: 'cover', borderRadius: 5, cursor: 'pointer', flexShrink: 0 }} onClick={() => window.open(url, '_blank')} />
                          : <span style={{ flexShrink: 0 }}>📎</span>
                        }
                        <span style={{ fontSize: 12.5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        {url && (
                          <a href={url} download={name} style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none', flexShrink: 0 }}>⬇ baixar</a>
                        )}
                      </div>
                    )
                  })
              }
              <div className="callout" style={{ marginTop: 14, fontSize: 12 }}>
                <strong>Checklist Telecom:</strong> ID + data de entrada · BINs · Tráfego por linha · Qtd cadastros · Portabilidades · Linhas (eSIM/físico) · Formas de pagamento.
              </div>
            </>
          )}
        </div>

        {/* Side */}
        <div className="modal-side">
          <div>
            <div className="side-label">Dados do ticket</div>
            <div className="side-block">
              <div className="field-row"><span className="fl">Setor</span><span className="fv">{ticket.sector}</span></div>
              <div className="field-row"><span className="fl">Tipo</span><span className="fv" style={{ fontSize: 10.5 }}>{dt.label}</span></div>
              <div className="field-row"><span className="fl">SLA</span><span className="fv">{dt.sla}d úteis</span></div>
              <div className="field-row"><span className="fl">Fluxo</span><span className="fv" style={{ fontSize: 10.5 }}>{ticket.flow === 'compliance' ? 'Compliance' : 'Colaborador'}</span></div>
            </div>
          </div>

          {opener && (
            <div>
              <div className="side-label">Aberto por</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Avatar name={opener.name} size={24} bg={opener.avBg} fg={opener.avFg} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{opener.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{opener.sector}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="side-label">Abertura</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(ticket.createdAt)}</div>
          </div>

          <div>
            <div className="side-label">Evidências</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{ticket.evidence.length} arquivo(s)</div>
          </div>

          {ticket.escalated && (
            <div style={{ background: 'var(--amberSoft)', border: '1px solid var(--amberBorder)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>↑ Escalado</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Admin adicionado como acompanhante</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
