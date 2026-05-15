# GreenLink ADM — Modelo de Dados

Banco PostgreSQL gerenciado via Lovable Cloud (Supabase). 22 tabelas com RLS ativo.

## Domínios

| Domínio | Tabelas |
|---|---|
| Identidade & RBAC | `profiles`, `user_roles` (enum `app_role`: admin, manager, operator, viewer) |
| CRM | `customers`, `customer_contacts`, `customer_addresses`, `leads`, `opportunities` |
| Comercial | `catalog_items`, `quotes`, `quote_items`, `customer_orders`, `order_items` |
| Contratos | `contracts`, `contract_items` |
| Operação | `assets`, `service_orders`, `service_order_tasks` |
| Suporte | `support_tickets`, `ticket_messages` |
| Estoque | `stock_balances` (PK warehouse+item), `stock_movements` |
| Financeiro | `receivables`, `payables` |

## Integridade referencial

Todas as relações têm FK explícita: CASCADE em filhos transacionais (`*_items`, `service_order_tasks`, `ticket_messages`, `customer_contacts`, `customer_addresses`); SET NULL em referências cruzadas opcionais; RESTRICT em `customer_id` de documentos transacionais.

## Unicidade

`item_code`, `quote_number`, `order_number`, `contract_number`, `os_number`, `ticket_number`, `asset_tag`.

## Numeração

Sequências `seq_quote_number`, `seq_order_number`, `seq_contract_number`, `seq_os_number`, `seq_ticket_number`, `seq_asset_tag` consumidas via `next_doc_number(prefix, seq_name)` (SECURITY DEFINER, restrita a `service_role`).

## RLS

- **SELECT**: qualquer usuário autenticado.
- **INSERT/UPDATE/DELETE**: apenas `admin` ou `manager` via `has_role(auth.uid(), 'admin'|'manager')`.
- `profiles`: usuário atualiza o próprio; admin gerencia todos.
- `user_roles`: leitura para autenticados; gerência apenas admin.

## Funções

- `has_role(user_id, role)` — STABLE SECURITY DEFINER.
- `is_staff(user_id)` — admin/manager/operator.
- `handle_new_user()` — trigger em `auth.users` cria `profiles` + role `viewer`.
- `touch_updated_at()` — trigger genérico em 14 tabelas.