# Services layer

Esta camada padroniza o acesso a dados por domínio.

- Hoje, todos os services delegam ao mock store em `src/lib/mock/store.ts`.
- Para plugar uma API real, basta substituir a implementação interna de cada
  service mantendo a mesma assinatura. Os componentes de UI consomem apenas os
  hooks em `src/hooks/domain/` e nunca tocam o store diretamente.
- Domínios cobertos: customers, leads, opportunities, catalog, quotes, orders,
  contracts, assets, serviceOrders, tickets, inventory, finance, dashboard.