## Contexto

Os 3 arquivos enviados (prompts oficiais, OpenAPI e Prisma schema) definem o padrão real do GreenLink ADM. O frontend atual já tem as telas, mas usa modelos simplificados (`Orcamento`, `Pedido`, `OS` em PT, sem separação clara entre `Lead/Opportunity`, `Quote/Order`, `Order/Contract`, `Catalog/Stock/Asset`) e depende totalmente de `localStorage` como fonte primária. Esta etapa alinha o projeto ao padrão definitivo, **preservando o layout e identidade visual atuais**.

Vou seguir a sequência reduzida recomendada pelo próprio PRD (Prompts 1, 2, 4, 5, 6, 7) + Prompt 14 (camada de serviços) que é pré-requisito de tudo.

## Etapa A — Arquitetura de tipos e serviços (Prompts 1, 2, 14)

Criar a base que o restante consome:

```text
src/
  types/
    common.ts        (ID, Status enums compartilhados)
    customer.ts      Customer, Contact, Address
    lead.ts          Lead, LeadStatus
    opportunity.ts   Opportunity, OpportunityStage
    catalog.ts       CatalogItem, CatalogItemType
    quote.ts         Quote, QuoteItem, QuoteStatus
    order.ts         CustomerOrder, OrderStatus
    contract.ts      Contract, ContractItem, ContractType, BillingFrequency
    asset.ts         Asset, AssetStatus, AssetOwnerType
    serviceOrder.ts  ServiceOrder, ServiceOrderTask, ServiceStatus
    ticket.ts        SupportTicket, TicketMessage, TicketStatus
    inventory.ts     StockBalance, StockMovement, StockMovementType
    finance.ts       Receivable, Payable, FinanceStatus
  services/
    http.ts          fetch wrapper (placeholder p/ baseURL futura)
    mock/            seeds + repositórios em memória persistidos
    customers.ts ... (1 service por domínio listado acima)
  hooks/
    useCustomers.ts ... (TanStack Query wrappers por domínio)
```

Regras:
- Componentes de UI **não** chamam `useAppStore` direto; consomem hooks por domínio.
- Hoje os services delegam ao mock store; trocar mock por API real será só editar `services/*`.
- Nomenclatura em **inglês** nos types/services (alinhado ao OpenAPI/Prisma); UI continua em PT-BR.
- Migrar gradualmente: criar a nova camada em paralelo; trocar imports tela a tela; deletar o store antigo no final da etapa.

## Etapa B — Correção semântica (Prompt 2)

Renomeações nas telas/labels/badges/rotas:
- `Orçamento` permanece como label PT, mas tipo passa a ser `Quote` com status `draft | sent | approved | rejected | expired | cancelled` (não mais `convertido`).
- `Pedido` = `CustomerOrder` com status `open | approved | invoiced | partially_fulfilled | fulfilled | cancelled`.
- `Contrato` ganha `type` e `billingFrequency` (hoje só tem `valorMensal` + `indexador`).
- Financeiro: `Lancamento` é separado em `Receivable` e `Payable`. Botão de Contas a Receber passa de "Pagar" → **"Registrar recebimento"**; Contas a Pagar mantém "Pagar".
- `Ativo` deixa de aparecer como saldo de estoque; estoque usa `StockBalance` por item de catálogo.
- Rota `/os/$id` ganha vínculo com `ticketId` e `contractId` (já existe `pedidoId`).

## Etapa C — Quote (Prompt 4)

- Status novo: `draft | sent | approved | rejected | expired | cancelled` (substitui `convertido`).
- Snapshot dos itens: ao adicionar item do catálogo, copiar `description`, `type`, `unit` no item da quote (já parcialmente feito).
- Ações no detalhe: **Enviar**, **Aprovar**, **Rejeitar**, **Gerar pedido** (visível só se `approved`).
- Validação: aprovação exige cliente + ≥1 item.

## Etapa D — CustomerOrder (Prompt 5)

- Entidade própria: número `PED-…`, status `open | approved | invoiced | partially_fulfilled | fulfilled | cancelled`.
- Mantém `quoteId` de origem; copia itens aprovados (snapshot).
- Detalhe ganha: ações de status, link para quote de origem, link para criar Contrato/OS.
- Diferenciação visual de Quote: badge azul (Quote) vs verde (Order); ícone próprio.

## Etapa E — Contract (Prompt 6)

- Adicionar campos: `type` (sale_installation | rental | subscription | support | mixed), `billingFrequency` (one_time | monthly | quarterly | semiannual | annual), `items[]` (snapshot do que está sob contrato).
- Vínculo opcional com `orderId` e com `assetIds[]`.
- Geração de Receivables respeita `billingFrequency` (hoje gera 12 meses fixos).
- Listagem mostra "próximo reajuste" (já planejado, ainda pendente).

## Etapa F — Finance (Prompt 7)

- Separar `Lancamento` em `Receivable` (origem: contract|order|manual, sempre liga a customer) e `Payable` (fornecedor textual).
- Status: `open | partial | paid | overdue | cancelled` (adiciona `partial`, remove `vencido` — derivar `overdue` do vencimento).
- Aba "Contas a Receber": botão **"Registrar recebimento"** abre dialog com data + valor.
- Aba "Contas a Pagar": botão **"Pagar"**.
- KPIs revistos com período explícito ("a receber 30 dias", "vencidos hoje", etc.).
- Fluxo de caixa lê de ambos.

## Etapa G — Dashboard alinhado (Prompt 13, leve)

Apenas reconectar os widgets aos novos hooks/types e adicionar período visível em cada card. Sem redesenho.

## Detalhes técnicos

- Persistência: nova chave `greenlink-adm-v3` (migração: descartar v2, gerar seeds novos coerentes com os novos enums).
- TanStack Query já estava no projeto via shadcn? Se não, instalar `@tanstack/react-query` + `QueryClientProvider` em `__root.tsx`. Hooks usam `queryKey` por domínio; mutations invalidam.
- Validação: `react-hook-form` + `zod` (já presentes) — schemas movidos para `src/types/<domain>.ts` ao lado dos types.
- Mantenho i18n PT-BR em todos os labels/UI; só types/services/enums vão em inglês.
- Reference docs salvos em `.lovable/reference/` para consulta futura (prompts, OpenAPI, Prisma).

## Fora de escopo nesta etapa

- Backend real / Lovable Cloud (a camada de services fica pronta para plugar depois).
- Cliente 360 completo (Prompt 8), Asset detail completo (Prompt 9), profundidade extra de OS/Ticket (10/11), Estoque (12) — entram numa próxima fase, depois que o coração transacional (Quote→Order→Contract→Receivable) estiver consistente.
- Auth/RBAC, multi-tenant, NF-e, Stripe.

## Critérios de aceitação

- Todas as rotas existentes continuam navegáveis com o mesmo visual.
- Nenhuma chamada direta a `useAppStore` em componentes de página — tudo via hooks de domínio.
- Quote aprovada gera Order via botão dedicado; Order não compartilha número/visual com Quote.
- Contas a Receber não exibe mais o botão "Pagar".
- Seeds demonstram: lead → opportunity → quote (approved) → order → contract → 3 receivables (1 paid, 1 open, 1 overdue).
- Build verde; testes existentes (`src/lib/search.test.ts`) atualizados se necessário.
