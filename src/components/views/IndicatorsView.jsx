import { TELECOM_INDICATORS, EVIDENCE_FIELDS } from '../../data/constants'

export function IndicatorsView() {
  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Indicadores de Suspeita — Telecom</div>
        <div className="page-sub">
          Qualquer um desses padrões já justifica a abertura de ticket. Não aguarde confirmação de fraude.
        </div>
      </div>

      <div className="alert-bar amber">
        <span className="ab-icon">⚠️</span>
        <span className="ab-text">
          A identificação de qualquer um desses padrões já é suficiente para abrir um ticket imediatamente.
        </span>
      </div>

      {TELECOM_INDICATORS.map((ind, i) => (
        <div key={i} className="indicator-item">
          <div className="ind-num">{i + 1}</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>{ind}</div>
        </div>
      ))}

      <hr className="divider" />

      <div className="page-header" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Evidências a levantar (Análise Telecom)</div>
        <div className="page-sub">Antes de direcionar ao Compliance, Agnes deve levantar e anexar ao ticket:</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {EVIDENCE_FIELDS.map(ef => (
          <span key={ef} className="evidence-chip">✓ {ef}</span>
        ))}
      </div>

      <div className="callout" style={{ marginTop: 20 }}>
        <strong>Bloqueio preventivo:</strong> ao confirmar suspeita, o ID do licenciado é bloqueado imediatamente
        como medida de proteção — não é punição. O desbloqueio pode ocorrer após análise concluída.
      </div>

      <hr className="divider" />

      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Fluxos de abertura</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <h4>🔷 Fluxo 1 — Colaborador / Atendente</h4>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>
            1. Colaborador identifica padrão suspeito durante atendimento<br />
            2. Abre ticket com título claro, tipo, evidências e descrição completa<br />
            3. Ticket vai para Agnes Angelim (Telecom)<br />
            4. Agnes analisa: se não é suspeita → encerra com explicação<br />
            5. Se confirmada → bloqueio preventivo + levantamento de dados<br />
            6. Direciona ao Compliance com resumo e evidências<br />
            7. Compliance registra desfecho formalmente
          </div>
        </div>
        <div className="card">
          <h4>🔶 Fluxo 2 — Compliance</h4>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>
            1. Compliance identifica inconformidade (auditoria, monitoramento ou denúncia)<br />
            2. Abre ticket com ID do licenciado e evidências disponíveis<br />
            3. Ticket direcionado à Agnes Angelim (Telecom)<br />
            4. Agnes realiza análise interna completa<br />
            5. Devolve ao Compliance com conclusão técnica e recomendação<br />
            6. Compliance registra desfecho: Bloqueio, Cancelamento ou Monitoramento
          </div>
        </div>
      </div>
    </div>
  )
}
