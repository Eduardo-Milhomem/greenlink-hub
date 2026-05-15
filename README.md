# GreenLink Hub

Sistema de gestão integrada para provedores de internet (ISPs) e empresas de telecomunicações.

## Stack Tecnológica

- **Frontend**: React 19, Vite, Tailwind CSS 4, Shadcn UI
- **Roteamento**: TanStack Router
- **Gerenciamento de Estado**: TanStack Query
- **Backend/Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (Email/Senha e Google OAuth)
- **Hospedagem**: Cloudflare Workers (SSR via TanStack Start)

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com as credenciais do seu projeto Supabase:
     - `VITE_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (Apenas para scripts administrativos)

## Banco de Dados e Migrations

O projeto utiliza o Supabase como backend. As migrations SQL estão localizadas em `supabase/migrations/`.

Para aplicar as migrations em um novo projeto Supabase:

1. Acesse o painel do Supabase > SQL Editor
2. Execute os scripts na ordem cronológica
3. Certifique-se de que as políticas de RLS (Row Level Security) foram aplicadas corretamente.

### Políticas de Acesso (RLS)

O sistema utiliza um modelo de acesso **Operacional**:

- **Leitura**: Todos os usuários autenticados podem ler os dados operacionais.
- **Escrita**: Apenas usuários com as roles `admin` ou `manager` podem inserir, atualizar ou excluir registros.
- **Perfis e Roles**: Usuários podem editar apenas o próprio perfil. Apenas `admin` pode gerenciar roles de outros usuários.

## Autenticação e Usuário Administrador

A autenticação é gerenciada nativamente pelo Supabase Auth.

Para criar o usuário administrador inicial:

1. Certifique-se de que a variável `SUPABASE_SERVICE_ROLE_KEY` está configurada no `.env`.
2. Execute o script de seed:
   ```bash
   npm run seed:admin
   ```
   Isso criará o usuário `Greennetantenas@gmail.com` com a senha `Green@2030` e atribuirá a role `admin`.

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run preview`: Visualiza o build de produção localmente
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código
- `npm run test`: Executa os testes
- `npm run seed:admin`: Cria o usuário administrador inicial

## Deploy

O projeto está configurado para ser feito o deploy no Cloudflare Workers via `@cloudflare/vite-plugin`.

1. Autentique-se no Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Faça o deploy:
   ```bash
   npx wrangler deploy
   ```
