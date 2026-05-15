# Plano — Banco real, Auth e remoção total de mocks

## Estado atual

- Schema Postgres (Supabase) já criado em sprint anterior: 22 tabelas (`profiles`, `user_roles`, `customers`, `customer_contacts`, `customer_addresses`, `leads`, `opportunities`, `catalog_items`, `quotes`, `quote_items`, `customer_orders`, `order_items`, `contracts`, `contract_items`, `assets`, `service_orders`, `service_order_tasks`, `support_tickets`, `ticket_messages`, `stock_balances`, `stock_movements`, `receivables`, `payables`).
- RLS habilitado em todas as tabelas (leitura para autenticados, mutações para `admin/manager`). `has_role()`, `is_staff()`, `handle_new_user()` em vigor.
- Cliente Supabase (browser/admin/middleware) gerado. Auth não está integrada na UI: `/login` faz `navigate("/dashboard")` sem credenciais.
- Todos os 12 services em `src/services/*` ainda chamam `useAppStore.getState()` (mock localStorage).
- `__root.tsx` não tem `_authenticated` layout nem listener `onAuthStateChange`.

## Escopo desta entrega

### 1. Modelo de dados (gaps a corrigir)

A maioria das relações já existe via colunas `*_id`, mas faltam **foreign keys explícitas** (tabela "No foreign keys" em todas). Migration única adicionando FKs para integridade referencial:

- `customer_contacts.customer_id`, `customer_addresses.customer_id` → `customers(id) ON DELETE CASCADE`
- `opportunities.customer_id`, `opportunities.lead_id` → respectivas (`SET NULL`)
- `quotes.customer_id`, `quotes.opportunity_id`, `quote_items.quote_id`, `quote_items.catalog_item_id`
- `customer_orders.customer_id`, `customer_orders.quote_id`, `order_items.order_id`, `order_items.catalog_item_id`
- `contracts.customer_id`, `contracts.order_id`, `contract_items.contract_id`, `contract_items.catalog_item_id`
- `assets.customer_id`, `assets.contract_id`, `assets.catalog_item_id`, `assets.address_id`
- `service_orders.customer_id`, `.contract_id`, `.asset_id`, `.order_id`, `.ticket_id`
- `service_order_tasks.service_order_id` (CASCADE)
- `support_tickets.customer_id`, `.contract_id`, `.asset_id`
- `ticket_messages.ticket_id` (CASCADE)
- `stock_balances.catalog_item_id` (PK composto warehouse+item), `stock_movements.catalog_item_id`
- `receivables.customer_id`, `.contract_id`, `.order_id`; `payables.supplier_id`
- Triggers `touch_updated_at` em todas tabelas que tem `updated_at`
- Constraint UNIQUE em campos de número (`quote_number`, `order_number`, `contract_number`, `os_number`, `ticket_number`, `asset_tag`, `item_code`)
- Sequências SQL para gerar números (`gen_quote_number()`, etc.) — funções SECURITY DEFINER

### 2. Auth real

- `src/contexts/AuthContext.tsx`: provê `user`, `session`, `profile`, `roles`, `loading`, `signIn`, `signUp`, `signOut`, `resetPassword`. Ouve `onAuthStateChange`.
- `__root.tsx`: monta `<AuthProvider>` e listener que invalida queryClient.
- `src/routes/login.tsx`: form real (email/senha) + tab cadastro + link "Esqueci senha".
- `src/routes/signup.tsx`, `src/routes/reset-password.tsx`: novos.
- `src/routes/_authenticated.tsx`: layout pathless com `beforeLoad` redirecionando para `/login` se não autenticado.
- Mover todas as rotas autenticadas para sob `_authenticated/` (renomear: `_authenticated.dashboard.tsx` etc.) — ou usar guard simples no `RootComponent` baseado no contexto. **Decisão: usar guard no RootComponent** (menos churn de arquivos, sem mover 22 rotas).
- Logout no header.

### 3. Migração de services para Supabase

Reescrever todos os 12 services para usar `supabase.from(...)` em vez de `useAppStore`:

- `customers.ts`, `leads.ts`, `opportunities.ts`, `catalog.ts`, `quotes.ts` (+items), `orders.ts` (+items), `contracts.ts` (+items), `assets.ts`, `serviceOrders.ts` (+tasks), `tickets.ts` (+messages), `inventory.ts` (movements + balances), `finance.ts` (receivables/payables).
- Manter as mesmas assinaturas para não quebrar os hooks `useXxx` em `src/hooks/domain/*`.
- Mapear nomes camelCase ↔ snake_case (Supabase retorna snake_case). Criar helpers `toCamel`/`toSnake` em `src/services/http.ts`.

### 4. Remoção de mocks

- Deletar `src/lib/mock/store.ts` e `src/lib/mock/types.ts`.
- Remover imports `useAppStore` em todas as rotas (~22 arquivos). Substituir por hooks `useXxx` já existentes ou queries Supabase diretas.
- Atualizar componentes que usam tipos do `mock/types.ts` (`OrcamentoStatus`, etc.) para usar tipos canônicos em `src/types/*`.
- `/configuracoes`: remover botão "limpar dados demo".

### 5. Componentes de feedback

- `src/components/feedback/{LoadingState,EmptyState,ErrorState}.tsx` aplicados em listagens.

### 6. Seed mínimo (opcional, idempotente)

- Após auth funcionando, inserir 3 customers, 5 catalog_items, 2 leads via `supabase--insert` para o app não nascer vazio.

### 7. Documentação

- `docs/DATABASE.md`: lista de tabelas + colunas + relações + RLS.
- `docs/AUTH.md`: fluxos de signup/login/reset, papéis, RLS.

### 8. Testes

- `src/services/__tests__/*.test.ts` smoke tests com Supabase mockado (vitest).
- Validação manual: criar conta, login, criar customer, ver no Postgres via `read_query`.

## Observações

- **Tamanho real:** ~40 arquivos editados/criados, ~15 deletados. É uma sprint completa.
- **Risco:** quebrar visual das 22 rotas durante a migração. Mitigação: manter assinatura dos hooks `useXxx` idêntica.
- **Google OAuth:** incluído por padrão (`supabase--configure_social_auth`).
- **Auto-confirm email:** desabilitado (usuário valida email).
- **Fora de escopo:** motor de recorrência de contratos, edge functions, dashboards executivos com agregações reais (próximas sprints).

## Sequência de execução (commits lógicos)

1. Migration com FKs + UNIQUE + sequências de numeração.
2. AuthContext + login real + signup + reset-password + guard.
3. Services Supabase (12 arquivos) + helpers camelCase.
4. Limpeza: deletar `lib/mock/*`, remover imports `useAppStore` das 22 rotas.
5. Componentes de feedback nas listagens principais.
6. Seed inicial.
7. `docs/DATABASE.md` + `docs/AUTH.md`.
8. Smoke tests + validação via `read_query`.

Confirma que sigo nessa ordem? É uma entrega grande (~1h de execução com várias migrations e edits). Posso quebrar em duas mensagens — (A) Auth + Migration de FKs + 4 services principais (Customers/Leads/Catalog/Quotes) ou (B) sprint completa de uma vez.
