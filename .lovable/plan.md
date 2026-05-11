
# GreenLink ADM — Fase 1: Shell + CRM/Comercial

Construir a base do GreenLink ADM com layout completo responsivo (desktop e mobile) e o primeiro módulo funcional (CRM e Comercial), usando dados mockados em memória. Backend (Lovable Cloud) fica para fase posterior, quando a UX estiver validada.

## Identidade visual

- Logo GreenLink (uploads enviados) em `src/assets/`.
- Paleta verde da marca como cor primária, neutros claros, suporte a dark mode.
- Fontes: display + body distintas (não Inter/Poppins). Headings com peso forte; body legível.
- Tokens semânticos em `src/styles.css` (oklch): `--primary` (verde GreenLink), `--success`, `--warning`, `--destructive`, gradientes e sombras.
- Densidade administrativa: tabelas compactas, cards informativos, hierarquia clara.

## Layout responsivo

Desktop (≥768px):
- Sidebar colapsável (shadcn `Sidebar`, `collapsible="icon"`) com logo no topo e grupos de navegação por macrodomínio.
- Header com `SidebarTrigger`, busca global, troca de tema, menu do usuário.

Mobile (<768px):
- Sidebar vira `offcanvas` (drawer).
- Bottom navigation fixa com os 5 atalhos mais usados (Dashboard, Clientes, Pipeline, Orçamentos, Mais).
- Header compacto com logo, busca e menu.

```text
desktop                          mobile
┌──────┬───────────────────┐     ┌─────────────────┐
│ side │ header            │     │ header          │
│ bar  ├───────────────────┤     ├─────────────────┤
│      │                   │     │                 │
│      │ conteúdo          │     │ conteúdo        │
│      │                   │     │                 │
└──────┴───────────────────┘     ├─────────────────┤
                                 │ bottom nav      │
                                 └─────────────────┘
```

## Estrutura de rotas (TanStack Router)

```text
src/routes/
  __root.tsx              layout (sidebar + header + bottom nav)
  index.tsx               redirect → /dashboard
  login.tsx               tela de login (mock)
  dashboard.tsx           visão geral
  clientes.tsx            lista
  clientes.$id.tsx        detalhe (abas: dados, contatos, oportunidades, histórico)
  leads.tsx               lista de leads
  pipeline.tsx            kanban de oportunidades
  orcamentos.tsx          lista
  orcamentos.novo.tsx     criação
  orcamentos.$id.tsx      detalhe / aprovação
  pedidos.tsx             lista (placeholder funcional)
  pedidos.$id.tsx         detalhe (placeholder)
  catalogo.tsx            produtos/serviços/kits (placeholder lista)
  configuracoes.tsx       perfil, tema, permissões (mock)
```

Itens de menu dos demais macrodomínios (Contratos, OS, Estoque, Financeiro, Suporte) ficam visíveis na sidebar como "Em breve" para sinalizar o roadmap, sem rota navegável ainda.

## Módulo CRM/Comercial — funcionalidades nesta fase

Dados em memória via Zustand (com persistência em `localStorage` para sobreviver a reload). Seed inicial com clientes/leads/orçamentos de exemplo.

- **Dashboard**: KPIs (leads novos, oportunidades em aberto, orçamentos pendentes, ticket médio), gráfico de funil, lista de OS/orçamentos recentes (placeholders ligados aos mocks existentes).
- **Leads**: CRUD, origem, status, conversão em oportunidade.
- **Clientes / Contatos**: CRUD com PJ/PF, múltiplos contatos, endereço, observações.
- **Pipeline (Kanban)**: colunas por estágio (Novo, Qualificado, Proposta, Negociação, Ganho, Perdido), drag-and-drop entre colunas (`@dnd-kit/core`), card com valor e cliente.
- **Orçamentos**: criação a partir de cliente + itens do catálogo (mock), snapshot de preço, descontos, total, status (rascunho, enviado, aprovado, recusado), conversão em pedido (gera registro no mock de pedidos).
- **Catálogo**: lista simples de produtos/serviços/kits para alimentar orçamento.
- **Pedidos**: lista somente leitura nesta fase, alimentada por orçamentos aprovados.

## Detalhes técnicos

- Stack atual: TanStack Start + React 19 + Vite + Tailwind v4 + shadcn (mantido).
- Estado: `zustand` + `zustand/middleware` (persist) — nova dependência.
- Drag & drop kanban: `@dnd-kit/core` + `@dnd-kit/sortable` — novas dependências.
- Datas: `date-fns` (já no projeto via shadcn).
- Validação de formulários: `react-hook-form` + `zod` (já presentes).
- Tabelas: shadcn `Table` + filtros locais; sem dependência extra.
- Tema (light/dark): provider próprio + token toggle.
- SEO: `head()` por rota com title/description em PT-BR.
- Mock layer isolado em `src/lib/mock/` (stores Zustand por entidade) para troca futura por chamadas Cloud sem refactor de UI.

## Fora desta fase (próximos passos)

- Lovable Cloud (auth real, RLS, persistência), módulos Contratos/Locação, OS/Agenda, Ativos, Estoque, Produção, Financeiro, Suporte. Já mapeados na sidebar como "Em breve".

## Critérios de aceite

- Layout funcional em 360px, 768px e 1280px sem quebras.
- Sidebar colapsável no desktop; drawer + bottom nav no mobile.
- Logo GreenLink visível no header/sidebar e no login.
- Fluxo demonstrável: criar lead → converter em oportunidade → mover no pipeline → gerar orçamento → aprovar → ver pedido criado.
- Dados persistem entre reloads via localStorage.
- Tema claro/escuro funcionando.
