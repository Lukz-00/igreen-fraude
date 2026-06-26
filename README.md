# iGreen Anti-Fraude — Sistema de Tickets

Sistema de gestão de tickets de fraude para o time BKO/Telecom da iGreen.
Design baseado no iGreen_Tela_Nova.html (design system interno).

## Como rodar no VS Code

### Pré-requisitos
- Node.js 18+ instalado (`node -v` para verificar)
- npm ou pnpm

### Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev
```

Abra http://localhost:5173 no navegador.

### Build para produção

```bash
npm run build
npm run preview
```

---

## Estrutura do projeto

```
igreen-fraude/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                    # Entry point
    ├── App.jsx                     # Root — layout, roteamento, estado global
    ├── styles/
    │   ├── design-system.css       # Tokens e classes do iGreen Design System
    │   └── app.css                 # Estilos específicos da aplicação
    ├── data/
    │   └── constants.js            # DEMAND_TYPES, USERS, OUTCOMES, SEED_TICKETS
    ├── hooks/
    │   ├── useTickets.js           # Estado e mutações dos tickets
    │   └── useToast.js             # Sistema de toasts
    └── components/
        ├── Atoms.jsx               # Avatar, PrioTag, StatusTag, SLAChip, MiniBar, Toast
        ├── Modals.jsx              # NewTicket, Escalate, Outcome, Assign
        ├── TicketDetail.jsx        # Painel de detalhe (tabs: detalhes/histórico/evidências)
        └── views/
            ├── DashboardView.jsx   # KPIs, tickets em aberto, alertas SLA
            ├── TicketsView.jsx     # Lista + detalhe de tickets
            ├── IndicatorsView.jsx  # Indicadores de suspeita + fluxos
            └── UsersView.jsx       # Usuários e perfis de acesso
```

---

## Funcionalidades

### Tickets
- 5 tipos de demanda com SLA automático (1 a 5 dias úteis)
- Fluxo 1: abertura por colaborador/atendente
- Fluxo 2: abertura pelo Compliance
- Histórico imutável por ticket
- Reatribuição entre colaboradores
- Escalonamento para Admin com motivo obrigatório
- 3 desfechos de encerramento

### Dashboard
- KPIs: total, abertos, críticos, SLA vencido
- Lista de tickets em aberto com barra de SLA
- Distribuição por tipo de demanda
- Alertas de SLA vencido/próximo

### Indicadores
- 7 indicadores de suspeita Telecom
- Checklist de evidências para análise
- Descrição dos dois fluxos de abertura

### Usuários
- 8 usuários com setores e perfis reais
- 4 perfis de acesso com permissões distintas

### Perfis de acesso
| Perfil | Permissões |
|--------|-----------|
| Colaborador | Apenas próprios tickets |
| Analista de Dados | Todos os tickets + KPIs + reatribuição |
| Gestor | Todos os tickets + KPIs + reatribuição |
| Admin | Acesso irrestrito |

---

## Trocar de usuário

Use o seletor na topbar (canto superior direito) para simular diferentes perfis.
O sistema aplica as permissões correspondentes automaticamente.

---

## Design System

Tokens em `src/styles/design-system.css`:

```css
--bg: #080f18       /* fundo principal */
--green: #2ecc72    /* accent / ações primárias */
--amber: #f0a500    /* atenção / warning */
--red: #e84545      /* crítico / erro */
--blue: #3d9cf0     /* informativo / link */
```

Baseado no arquivo `iGreen_Tela_Nova.html` — sistema interno de chamados iGreen.
