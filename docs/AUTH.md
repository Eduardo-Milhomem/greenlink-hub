# Autenticação

Stack: Supabase Auth via Lovable Cloud, com broker `@lovable.dev/cloud-auth-js` para Google OAuth.

## Métodos habilitados
- Email/senha (com verificação contra HIBP)
- Google (OAuth via broker Lovable)
- Auto-confirm de e-mail: ativado (dev). Desativar em Cloud → Auth Settings para produção.

## Fluxos

| Rota | Função |
|---|---|
| `/login` | Email+senha ou Google. Redireciona para `/dashboard`. |
| `/signup` | Cria conta. Trigger `handle_new_user` cria `profiles` + role `viewer`. |
| `/reset-password` | Envia link OU (com `#type=recovery`) define nova senha. |

## Estado no app

`AuthProvider` (`src/contexts/AuthContext.tsx`) escuta `onAuthStateChange` e expõe `user`, `session`, `profile`, `roles`, `loading`, `hasRole`, `isStaff`, `signIn`, `signUp`, `signOut`, `resetPassword`.

## Guard

`AuthGuard` no `__root.tsx` redireciona não autenticados para `/login`. Públicas: `/login`, `/signup`, `/reset-password`.

## Roles

`admin` (gerência total), `manager` (CRUD operacional), `operator` (leitura + execução), `viewer` (somente leitura, padrão).

Promover usuário a admin:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin');
```

## Pendências (próxima sprint)

Os 12 services em `src/services/*` e ~22 rotas ainda leem do mock store local (`src/lib/mock/store.ts`, 1005 linhas, 116 referências). Sequência:
1. Reescrever `src/services/*` para `supabase.from(...)` mantendo assinatura.
2. Substituir `useAppStore` pelos hooks `useXxx` em `src/hooks/domain/`.
3. Deletar `src/lib/mock/`.
4. Componentes `LoadingState`/`EmptyState`/`ErrorState` em `src/components/feedback/`.
5. Seed inicial idempotente.