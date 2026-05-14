## Contexto

A análise crítica é clara: o app já tem identidade visual e taxonomia corretas, mas opera sobre `localStorage` (`greenlink-adm-v3`), com várias telas em loading infinito e sem auth. Antes de qualquer nova feature, é preciso resolver a **coluna vertebral**: dados reais, auth, e estados padronizados (loading/vazio/erro/sucesso).

Esta é a **Etapa 1 da Opção A** ("infraestrutura real de dados e auth"). As próximas (fluxo comercial, contrato/ativo/OS, financeiro, suporte, dashboard executivo) virão em sprints seguintes, sobre a base que esta sprint instala.

## Objetivo da Sprint 1

Substituir o mock store por persistência real no Supabase (via Lovable Cloud), com autenticação obrigatória, sem reescrever a UI. A camada `services/` + `hooks/domain/` já existente continua sendo o contrato — só a implementação por dentro muda.

## Escopo

### 1. Habilitar Lovable Cloud

Provisiona Supabase gerenciado (Postgres + Auth + Storage). Sem mencionar Supabase ao usuário final; tratar como "Lovable Cloud".

### 2. Schema inicial no Postgres (migrations)

Criar tabelas alinhadas aos `src/types/*` já em inglês. Sprint 1 cobre apenas o núcleo necessário para destravar Sprint 2:

- `profiles` (1:1 com `auth.users`, `full_name`, `avatar_url`)
- `user_roles` (enum `app_role: admin | manager | operator | viewer`) + função `has_role()` SECURITY DEFINER
- `customers` (+ `customer_contacts`, `customer_addresses`)
- `leads`
- `catalog_items`
- `opportunities`
- `quotes` (+ `quote_items`)
- `customer_orders` (+ `order_items`)
- `contracts` (+ `contract_items`) — estrutura, sem motor de recorrência ainda
- `assets`
- `service_orders`
- `support_tickets`
- `stock_movements`, `stock_balances`
- `receivables`, `payables`

Todas com `id uuid pk`, `created_at`, `updated_at`, trigger `update_updated_at`. RLS habilitado em todas. Políticas iniciais: usuários autenticados leem; mutações exigem role `admin` ou `manager` via `has_role(auth.uid(), ...)`. Refinamento de policies por owner vem na Sprint 2.

Trigger `handle_new_user` cria `profiles` row + atribui role `viewer` no primeiro signup (primeiro usuário pode ser promovido a admin via SQL).

### 3. Autenticação

- Rota `/login` real (já existe arquivo) com email/senha + Google (broker Lovable).
- Rota `/signup` (ou aba no login).
- Layout pathless `_authenticated` envolvendo todas as rotas operacionais; `beforeLoad` redireciona para `/login` se sem sessão.
- `__root.tsx` registra `onAuthStateChange` que invalida o `queryClient`.
- `AuthProvider` expõe `user`, `profile`, `roles`, `hasRole()` via contexto do router.
- Logout no header.

### 4. Camada de serviços real

Substituir cada arquivo em `src/services/*.ts` para usar `supabase` (browser client) em vez de `useAppStore`. Os hooks em `src/hooks/domain/*` não mudam (já usam TanStack Query). Sem `createServerFn` nesta sprint — queries respeitam RLS direto do client é suficiente e mais simples.

`src/services/http.ts` é removido (não usado).

### 5. Padronização de estados de tela

Criar 3 componentes reutilizáveis em `src/components/feedback/`:
- `<LoadingState />` (skeleton consistente por tipo de view)
- `<EmptyState icon title description action />`
- `<ErrorState error onRetry />`

Aplicar nas rotas que hoje ficam em loading infinito: `/dashboard`, `/leads`, `/clientes`, `/orcamentos`, `/pedidos`, `/contratos`, `/suporte`. Cada `useQuery` passa por `isLoading → isError → data?.length === 0 → conteúdo`.

### 6. Seed mínimo

Migration de seed com 3 customers, 5 catalog_items, 2 leads, 1 quote, 1 order de exemplo (apenas para o primeiro admin ter algo na tela). Idempotente via `ON CONFLICT DO NOTHING`.

### 7. Limpeza

- Remover `src/lib/mock/store.ts`, `src/lib/mock/types.ts`, persistência `greenlink-adm-v3` do localStorage.
- Tela `/configuracoes` deixa de mostrar aviso de "dados em localStorage"; passa a expor: perfil do usuário, troca de senha, lista de usuários (admin only) com atribuição de roles.

## Fora de escopo (próximas sprints)

- Motor de recorrência de contratos → Sprint 3
- Conversão lead→cliente→orçamento→pedido com workflow visual completo → Sprint 2
- OS/ativos/estoque com movimento real → Sprint 3
- Dashboard executivo com queries agregadas → Sprint 4
- SLA de suporte, automações, notificações, portal do cliente → backlog futuro
- Edge functions / server-side webhooks → quando aparecer integração externa

## Critérios de aceitação

- Lovable Cloud habilitado; tabelas criadas; RLS ativo em todas; `has_role()` funcional.
- App não funciona sem login; logout retorna a `/login`.
- Recarregar o navegador mantém a sessão e os dados (não há mais `greenlink-adm-v3` em uso).
- Nenhuma rota fica em loading infinito: cada uma resolve para uma das 4 telas (loading/vazio/erro/sucesso) com componentes reutilizáveis.
- Criar um lead, customer, item de catálogo via UI persiste no Postgres e aparece em outro navegador após login.
- Build verde; testes existentes em `src/lib/search.test.ts` ajustados.

## Detalhes técnicos

- Cliente Supabase: usar `@/integrations/supabase/client` em services. Service-role só se uma operação realmente exigir (não nesta sprint).
- Tipos do Postgres gerados em `src/integrations/supabase/types.ts` (auto pelo Lovable Cloud). Mapeamento PT↔EN fica nos services, igual ao padrão atual de `customerService`.
- Roles **nunca** ficam em `profiles` — sempre em `user_roles` (regra de segurança crítica).
- `has_role()` é `SECURITY DEFINER` com `search_path = public` para evitar recursão de RLS.
- Migrations versionadas em `supabase/migrations/<timestamp>_*.sql`.
- Após habilitar Cloud, primeiro usuário criado precisa ser promovido a `admin` via SQL manual (documentado no README).
