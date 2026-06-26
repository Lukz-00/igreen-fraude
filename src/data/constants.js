// ─── DEMAND TYPES ────────────────────────────────────
export const DEMAND_TYPES = [
  { id: 'reincidencia',      label: 'Reincidência',      sla: 1, priority: 'Crítica', pClass: 'p-crit', tClass: 't-red',   color: '#e84545' },
  { id: 'fraude_compliance', label: 'Fraude Compliance', sla: 2, priority: 'Crítica', pClass: 'p-crit', tClass: 't-red',   color: '#e84545' },
  { id: 'fraude_telecom',    label: 'Fraude Telecom',    sla: 3, priority: 'Alta',    pClass: 'p-high', tClass: 't-amber', color: '#f0a500' },
  { id: 'suspeita_geral',    label: 'Suspeita Geral',    sla: 4, priority: 'Média',   pClass: 'p-norm', tClass: 't-blue',  color: '#3d9cf0' },
  { id: 'fraude_expansao',   label: 'Fraude Expansão',   sla: 5, priority: 'Média',   pClass: 'p-norm', tClass: 't-blue',  color: '#3d9cf0' },
]

// ─── USERS ───────────────────────────────────────────
export const USERS = [
  { id: 1, name: 'Luis Guilherme',   sector: 'Telecom',    role: 'Admin',          avBg: '#1a4070', avFg: '#3d9cf0' },
  { id: 2, name: 'Eliel Dias',       sector: 'Telecom',    role: 'Admin',          avBg: '#1a4070', avFg: '#3d9cf0' },
  { id: 3, name: 'Agnes Angelim',    sector: 'Telecom',    role: 'Admin',          avBg: '#0d2e1a', avFg: '#2ecc72' },
  { id: 4, name: 'Luciana Freire',   sector: 'Expansão',   role: 'Admin',          avBg: '#1a0d2e', avFg: '#9b59b6' },
  { id: 5, name: 'Mateus Keveny',    sector: 'Expansão',   role: 'Gestor',         avBg: '#2e1f00', avFg: '#f0a500' },
  { id: 6, name: 'Luciana Rodrigues',sector: 'Compliance', role: 'Admin',          avBg: '#2e0c0c', avFg: '#e84545' },
  { id: 7, name: 'Mateus José',      sector: 'Compliance', role: 'Gestor',         avBg: '#2e0c0c', avFg: '#e84545' },
  { id: 8, name: 'Rodrigo Almeida',  sector: 'Compliance', role: 'Gestor',         avBg: '#2e0c0c', avFg: '#e84545' },
]

// ─── ROLE PERMISSIONS ────────────────────────────────
export const ROLE_PERMS = {
  'Colaborador':      ['own_tickets'],
  'Analista de Dados':['all_tickets', 'kpi', 'reports', 'reassign'],
  'Gestor':           ['all_tickets', 'kpi', 'reports', 'reassign'],
  'Admin':            ['all_tickets', 'kpi', 'reports', 'reassign', 'config', 'logs'],
}

// ─── OUTCOMES ────────────────────────────────────────
export const OUTCOMES = [
  { id: 'bloqueio_definitivo', label: 'Bloqueio Definitivo',          desc: 'Comprovação de irregularidade grave vinculada ao licenciado.' },
  { id: 'cancelamento',        label: 'Cancelamento da Licença',       desc: 'Violação grave dos termos contratuais, sem possibilidade de reversão.' },
  { id: 'desbloqueio_monit',   label: 'Desbloqueio com Monitoramento', desc: 'Reativação possível com acompanhamento intensificado por período determinado.' },
  { id: 'nao_enquadra',        label: 'Não se enquadra',              desc: 'Investigação concluída sem identificação de irregularidade. Ticket encerrado sem penalidade ao licenciado.' },
]

// ─── SECTOR ROUTING ──────────────────────────────────
// 'self' = atribuir ao próprio abridor do ticket
export const SECTOR_ROUTES = {
  'Telecom':    'self',
  'Expansão':   5,   // Mateus Keveny
  'Compliance': 7,   // Mateus José
}

// ─── LIVE DEMAND TYPES (mutável p/ admin) ─────────────
export const _live = { demandTypes: null }

// ─── STATUS MAP ───────────────────────────────────────
export const STATUS_MAP = {
  aberto:       { label: 'Aberto',          cls: 't-amber' },
  em_analise:   { label: 'Em Análise',      cls: 't-blue' },
  ag_compliance:{ label: 'Ag. Compliance',  cls: 't-amber' },
  ag_telecom:   { label: 'Ag. Telecom',     cls: 't-amber' },
  encerrado:    { label: 'Encerrado',       cls: 't-grey' },
}

// ─── TELECOM INDICATORS ──────────────────────────────
export const TELECOM_INDICATORS = [
  'Múltiplos cadastros com o mesmo CPF em curto período.',
  'Volume atípico de cadastros: muitos registros em pouco tempo, fora do padrão esperado.',
  'Quantidade elevada de novas linhas ativadas sem justificativa comercial aparente.',
  'Alto volume de ativações via eSIM, especialmente combinado com outros indicadores.',
  'Atividade suspeita geral: comportamento fora do padrão identificado pelo atendente ou sistema.',
  'Muitas portabilidades solicitadas sem aprovação — percentual de reprovação elevado.',
  'Concentração de pagamentos via cartão de crédito com BINs variados ou em sequência.',
]

// ─── EVIDENCE CHECKLIST ──────────────────────────────
export const EVIDENCE_FIELDS = [
  'ID do licenciado, nome completo e data de entrada',
  'BINs utilizados em pagamentos via cartão',
  'Tráfego de dados e ligações por linha ativada',
  'Quantidade de cadastros no período suspeito',
  'Portabilidades solicitadas x aprovadas',
  'Novas linhas ativadas (eSIM ou físico)',
  'Formas de pagamento utilizadas',
]

// ─── SEED TICKETS ────────────────────────────────────
const now = Date.now()
const d = (n) => new Date(now - n * 86400000).toISOString()

export const SEED_TICKETS = [
  {
    id: 'FRD-001',
    title: 'Volume atípico de cadastros — ID 48291',
    type: 'fraude_telecom',
    sector: 'Telecom',
    status: 'em_analise',
    openedBy: 1,
    assignedTo: 3,
    flow: 'colaborador',
    createdAt: d(2),
    licenseeId: '48291',
    licenseeName: 'Distribuidora Alpha LTDA',
    description: 'Licenciado realizou 47 cadastros em 6 horas, padrão fora do esperado. Identificado durante monitoramento de rotina. Nenhuma campanha comercial ativa no período.',
    evidence: ['print_sistema.png', 'log_atendimento.txt'],
    escalated: false,
    outcome: null,
    history: [
      { user: 'Luis Guilherme', action: 'Ticket aberto.', time: d(2), type: 'open' },
      { user: 'Agnes Angelim',  action: 'Análise iniciada — levantando dados do licenciado junto ao banco de dados Telecom.', time: d(1.5), type: 'assign' },
    ],
  },
  {
    id: 'FRD-002',
    title: 'Reincidência confirmada — ID 77412',
    type: 'reincidencia',
    sector: 'Telecom',
    status: 'ag_compliance',
    openedBy: 6,
    assignedTo: 3,
    flow: 'compliance',
    createdAt: d(0.4),
    licenseeId: '77412',
    licenseeName: 'Conecta Sul ME',
    description: 'Segundo registro de comportamento suspeito em menos de 30 dias. Múltiplos BINs de cartão detectados. Análise Telecom concluída — aguardando desfecho do Compliance.',
    evidence: ['relatorio_bins.xlsx', 'historico_licenciado.pdf'],
    escalated: true,
    outcome: null,
    history: [
      { user: 'Luciana Rodrigues', action: 'Ticket aberto pelo Compliance — reincidência suspeita identificada.', time: d(0.4), type: 'open' },
      { user: 'Agnes Angelim',     action: 'Bloqueio preventivo aplicado. Levantamento de evidências concluído. Devolvido ao Compliance com resumo da análise.', time: d(0.2), type: 'update' },
      { user: 'Luciana Rodrigues', action: 'Escalado para Admin — histórico de reincidência exige decisão de nível superior.', time: d(0.1), type: 'escalate' },
    ],
  },
  {
    id: 'FRD-003',
    title: 'Alto volume de eSIM sem justificativa — ID 91033',
    type: 'fraude_expansao',
    sector: 'Expansão',
    status: 'aberto',
    openedBy: 5,
    assignedTo: null,
    flow: 'colaborador',
    createdAt: d(4.5),
    licenseeId: '91033',
    licenseeName: 'Tech Vendas Norte',
    description: '89 eSIMs ativados em 2 dias sem campanha ou justificativa comercial registrada. Padrão atípico detectado pelo sistema de monitoramento de Expansão.',
    evidence: [],
    escalated: false,
    outcome: null,
    history: [
      { user: 'Mateus Keveny', action: 'Ticket aberto — padrão atípico de ativação de eSIM detectado pelo sistema.', time: d(4.5), type: 'open' },
    ],
  },
  {
    id: 'FRD-004',
    title: 'Portabilidades irregulares — ID 33210',
    type: 'suspeita_geral',
    sector: 'Compliance',
    status: 'encerrado',
    openedBy: 7,
    assignedTo: 3,
    flow: 'compliance',
    createdAt: d(10),
    licenseeId: '33210',
    licenseeName: 'Plena Telecom EIRELI',
    description: '82% das portabilidades reprovadas. Padrão indica tentativas sistemáticas de ativação indevida de linhas.',
    evidence: ['portabilidades_export.csv'],
    escalated: false,
    outcome: 'bloqueio_definitivo',
    history: [
      { user: 'Mateus José',       action: 'Ticket aberto pelo Compliance — alto índice de reprovação de portabilidades.', time: d(10), type: 'open' },
      { user: 'Agnes Angelim',     action: 'Análise Telecom concluída — fraude confirmada com base nos dados de portabilidade e cadastro.', time: d(8), type: 'update' },
      { user: 'Luciana Rodrigues', action: 'Desfecho registrado: Bloqueio Definitivo. Jurídico notificado conforme protocolo.', time: d(6), type: 'close' },
    ],
  },
  {
    id: 'FRD-005',
    title: 'BINs variados em sequência — ID 20917',
    type: 'fraude_compliance',
    sector: 'Compliance',
    status: 'em_analise',
    openedBy: 6,
    assignedTo: 3,
    flow: 'compliance',
    createdAt: d(1),
    licenseeId: '20917',
    licenseeName: 'Global Connect SP',
    description: 'Concentração de pagamentos via cartão de crédito com 14 BINs diferentes em 48h. Padrão indica uso de cartões de terceiros ou cartões clonados.',
    evidence: ['extrato_bins.xlsx'],
    escalated: false,
    outcome: null,
    history: [
      { user: 'Luciana Rodrigues', action: 'Ticket aberto — concentração anormal de BINs identificada pelo sistema antifraude.', time: d(1), type: 'open' },
      { user: 'Agnes Angelim',     action: 'Bloqueio preventivo aplicado. Iniciando levantamento de tráfego e BINs por linha.', time: d(0.8), type: 'assign' },
    ],
  },
]
