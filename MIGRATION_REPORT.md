# Relatório de Migração: Integração com Supabase

Este documento resume as alterações realizadas durante a migração completa do projeto GreenLink Hub para utilizar o Supabase como backend, banco de dados e sistema de autenticação.

## 1. Configuração Inicial do Supabase
- Variáveis de ambiente configuradas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Arquivo `.env.example` criado e `.env` adicionado ao `.gitignore` para evitar vazamento de credenciais.
- Clientes do Supabase configurados:
  - `src/integrations/supabase/client.ts`: Cliente para o browser (com persistência de sessão).
  - `src/integrations/supabase/client.server.ts`: Cliente admin para operações server-side (bypassa RLS).

## 2. Migração do Banco de Dados
- O esquema do banco de dados foi mapeado e as migrations SQL foram criadas em `supabase/migrations/`.
- Tabelas criadas: `profiles`, `user_roles`, `customers`, `leads`, `opportunities`, `quotes`, `customer_orders`, `contracts`, `assets`, `service_orders`, `support_tickets`, `stock_movements`, `receivables`, `payables`, etc.
- **Políticas de Acesso (RLS)**:
  - Modelo **Operacional** implementado: leitura liberada para todos os usuários autenticados; escrita (INSERT, UPDATE, DELETE) restrita a usuários com role `admin` ou `manager`.
  - Políticas específicas para `profiles` e `user_roles` (apenas admins podem gerenciar roles).

## 3. Implementação da Autenticação
- O broker OAuth do Lovable (`@lovable.dev/cloud-auth-js`) foi removido.
- Implementado login social nativo do Supabase (Google) e login por email/senha.
- Fluxos de cadastro, login e recuperação de senha refatorados para usar os métodos nativos do Supabase (`signInWithPassword`, `signInWithOAuth`, `signUp`, `resetPasswordForEmail`).
- **Usuário Administrador**:
  - Criado script idempotente (`scripts/seed-admin.mjs`) para provisionar o usuário administrador inicial (`Greennetantenas@gmail.com`) e atribuir a role `admin`.
- **Gestão de Usuários**:
  - Adicionada tela administrativa (`/admin/usuarios`) para listar usuários e permitir que admins promovam outros usuários (alteração de roles).

## 4. Atualização da Camada de Código
- O mock store local (`src/lib/mock/store.ts` e `src/lib/mock/types.ts`) foi completamente removido.
- Todos os serviços em `src/services/*.ts` foram refatorados para realizar chamadas reais ao Supabase via `supabase.from(...)`.
- Hooks do React Query (`src/hooks/domain/*.ts`) foram atualizados para consumir os novos serviços.
- Componentes e páginas foram ajustados para lidar com os dados reais e estados de carregamento (`isLoading`).
- Utilitários de formatação (`formatBRL`, `formatDate`) foram movidos para `src/lib/formatters.ts`.

## 5. Testes e Validação
- A aplicação foi testada localmente para garantir que as listagens, criações, atualizações e exclusões estão funcionando corretamente com o Supabase.
- O fluxo de autenticação foi validado (login, logout, persistência de sessão).
- As políticas de RLS foram testadas indiretamente através da interface (usuários sem permissão não conseguem realizar ações restritas).

## 6. Passos para Manutenção Futura
- **Novas Tabelas**: Sempre que criar uma nova tabela, lembre-se de habilitar o RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) e criar as políticas adequadas.
- **Data API**: Se novas tabelas não aparecerem na API REST, verifique as configurações de "Data API" no painel do Supabase e certifique-se de que as roles `anon` e `authenticated` têm permissão de acesso.
- **Deploy**: O projeto está configurado para deploy no Cloudflare Workers. Certifique-se de configurar as variáveis de ambiente no painel do Cloudflare antes do deploy.
