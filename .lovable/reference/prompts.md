# GreenLink ADM — Prompts exatos para usar no Lovable

Este arquivo reúne os prompts que devem ser usados no Lovable para implementar o GreenLink ADM sem ambiguidade.

## Como usar

- Use os prompts na ordem sugerida.
- Execute um bloco por vez.
- Sempre peça ao Lovable para preservar a estrutura existente e evoluir em cima do projeto atual.
- Sempre reforce que ele não deve inventar novas entidades se elas já estiverem definidas no schema.

---

# Prompt 1 — Alinhar arquitetura do frontend com backend real

```text
Quero que você refatore o frontend atual do GreenLink ADM para prepará-lo para integração com backend real.

Objetivo:
- remover a dependência estrutural de localStorage como fonte principal dos dados
- criar uma camada de serviços/API no frontend
- criar tipos/DTOs consistentes com as entidades do projeto
- preservar o layout atual e a identidade visual já implementada
- não redesenhar as telas sem necessidade

Diretrizes obrigatórias:
- manter a estrutura visual existente
- não quebrar a navegação lateral atual
- não mudar nomes de módulos sem necessidade
- não simplificar entidades diferentes em uma só
- criar uma pasta/estrutura de serviços para consumo de API
- criar tipos para: Customer, Lead, Opportunity, CatalogItem, Quote, CustomerOrder, Contract, Asset, ServiceOrder, SupportTicket, Receivable
- usar dados mock apenas como fallback temporário, organizados por serviço
- preparar o projeto para trocar facilmente mock por API real

Entregáveis:
1. camada de tipos centralizada
2. camada de serviços/api centralizada
3. adaptação das telas atuais para ler dessa camada
4. manter o projeto funcional
```

---

# Prompt 2 — Corrigir a modelagem conceitual do frontend

```text
Quero que você revise a modelagem conceitual do frontend do GreenLink ADM e elimine ambiguidades entre entidades.

Regras obrigatórias:
- Lead é diferente de Opportunity
- Opportunity é diferente de Quote
- Quote é diferente de CustomerOrder
- CustomerOrder é diferente de Contract
- Contract é diferente de Receivable
- CatalogItem é diferente de Asset
- CatalogItem é diferente de estoque físico
- Asset é um equipamento individual rastreável

Ajustes esperados:
- revisar textos, labels e nomenclaturas nas telas
- revisar estados e identificadores visuais
- corrigir qualquer caso onde orçamento apareça como pedido ou pedido apareça como contrato
- corrigir qualquer caso onde contas a receber usem semântica errada

Quero que você preserve o design atual, mas corrija a semântica do sistema inteiro.
```

---

# Prompt 3 — Implementar corretamente o fluxo Lead → Opportunity

```text
Quero implementar corretamente o fluxo comercial inicial do GreenLink ADM.

Escopo desta etapa:
- tela de Leads
- tela de Pipeline
- conversão de Lead em Opportunity
- vínculo opcional com Customer

Regras:
- Lead entra por origem comercial
- Lead pode ser qualificado e convertido
- ao converter, o sistema pode criar Customer e Opportunity
- o Pipeline deve exibir Opportunity, não Lead bruto
- cada Opportunity deve ter: título, cliente, valor estimado, etapa, responsável, observações e data esperada

Entregáveis:
1. revisão da tela de Leads
2. ação de conversão funcional no frontend
3. tela de Pipeline consumindo oportunidades
4. estrutura pronta para integração futura com API real

Preserve o layout atual.
```

---

# Prompt 4 — Implementar o fluxo de Orçamentos corretamente

```text
Quero transformar o módulo de Orçamentos do GreenLink ADM em um fluxo real.

Objetivo:
- sair de uma simples listagem e criar um fluxo completo de orçamento

Implementar:
- listagem de orçamentos
- tela de detalhe do orçamento
- criação de orçamento
- adição e remoção de itens
- cálculo automático de subtotal, desconto e total
- vínculo do orçamento com cliente e oportunidade
- status do orçamento: draft, sent, approved, rejected, expired, cancelled
- ação de enviar orçamento
- ação de aprovar orçamento
- ação de rejeitar orçamento

Regras obrigatórias:
- orçamento deve usar itens do catálogo quando possível
- o item do orçamento precisa armazenar snapshot de descrição, tipo, quantidade e preço
- orçamento aprovado não deve ser apenas renomeado; ele deve poder gerar um pedido real
- preservar a identidade visual atual da tela de orçamentos

Entregáveis:
1. tela de listagem consistente
2. tela de detalhe funcional
3. formulário de criação/edição
4. ações de mudança de status
```

---

# Prompt 5 — Implementar a geração de Pedido a partir do Orçamento

```text
Quero implementar corretamente a entidade Pedido no GreenLink ADM.

Objetivo:
- fazer com que um orçamento aprovado gere um pedido real

Regras obrigatórias:
- Pedido é uma entidade própria
- Pedido deve ter número próprio
- Pedido deve ter status próprio
- Pedido deve manter vínculo com o orçamento de origem
- Pedido deve copiar os itens aprovados do orçamento
- Pedido não pode reutilizar a mesma identidade visual/lógica do orçamento

Implementar:
- ação “Gerar pedido” no orçamento aprovado
- tela de listagem de pedidos
- tela de detalhe do pedido
- status do pedido: open, approved, invoiced, partially_fulfilled, fulfilled, cancelled
- vínculo do pedido com cliente
- exibição correta no dashboard

Também quero que você corrija qualquer ambiguidade visual existente entre ORC e PED.

Preserve o layout atual e evolua a tela já existente.
```

---

# Prompt 6 — Implementar Contratos corretamente

```text
Quero transformar o módulo de Contratos do GreenLink ADM em um módulo real e conectado ao restante do sistema.

Implementar:
- listagem de contratos
- tela de detalhe do contrato
- itens contratuais
- datas de início e fim
- tipo de contrato
- frequência de cobrança
- valor mensal
- indexador
- status do contrato
- vínculo com customer
- vínculo com pedido quando houver

Tipos de contrato mínimos:
- sale_installation
- rental
- subscription
- support
- mixed

Regras obrigatórias:
- contrato não é pedido
- contrato pode nascer de pedido, mas continua sendo entidade própria
- contrato pode gerar ciclos de cobrança/recebíveis
- contrato pode estar vinculado a ativos

Preserve a tabela atual de contratos, mas crie profundidade funcional.
```

---

# Prompt 7 — Implementar Financeiro com semântica correta

```text
Quero corrigir e aprofundar o módulo Financeiro do GreenLink ADM.

Objetivo:
- separar corretamente contas a receber, contas a pagar e fluxo de caixa
- corrigir a semântica e ações do módulo

Ajustes obrigatórios:
- em contas a receber, o botão não pode ser “Pagar”; deve ser “Receber”, “Baixar” ou “Registrar recebimento”
- em contas a pagar, o botão pode ser “Pagar”
- separar claramente as abas de receber, pagar e fluxo de caixa
- exibir status corretos: open, partial, paid, overdue, cancelled

Implementar:
- listagem de contas a receber
- listagem de contas a pagar
- detalhe do título financeiro
- registro de recebimento
- registro de pagamento
- cards de resumo financeiro coerentes

Regras obrigatórias:
- não usar nomenclatura de orçamento dentro do financeiro quando o correto for pedido, contrato ou recebível
- não misturar entidades comerciais com entidades financeiras
- preservar a tela atual e sua identidade visual
```

---

# Prompt 8 — Implementar página Cliente 360

```text
Quero criar a página Cliente 360 do GreenLink ADM.

Objetivo:
- ao abrir um cliente, visualizar a operação completa relacionada a ele

A tela deve conter seções para:
- dados cadastrais
- contatos
- endereços
- oportunidades
- orçamentos
- pedidos
- contratos
- ativos
- ordens de serviço
- tickets
- resumo financeiro
- timeline de eventos

Regras obrigatórias:
- não criar uma tela genérica; ela deve consolidar os relacionamentos reais do sistema
- preservar o estilo visual atual do projeto
- usar tabs, cards ou seções organizadas, desde que a leitura fique clara
- essa tela deve virar o principal ponto de consulta operacional por cliente
```

---

# Prompt 9 — Implementar detalhe de Ativo

```text
Quero aprofundar o módulo de Ativos do GreenLink ADM.

Implementar:
- tela de detalhe do ativo
- dados principais: tag, modelo, tipo, cliente, contrato, local, status, última leitura
- histórico de eventos do ativo
- vínculo com ordens de serviço
- vínculo com tickets
- exibição clara do lifecycle do ativo

Regras:
- ativo é um equipamento individual rastreável
- ativo não é catálogo
- ativo não é simplesmente saldo de estoque
- manter coerência com os módulos de contratos, OS e suporte

Preserve a tabela atual e crie profundidade funcional.
```

---

# Prompt 10 — Implementar detalhe de Ordem de Serviço

```text
Quero aprofundar o módulo de Ordens de Serviço do GreenLink ADM.

Implementar:
- tela de detalhe da OS
- dados principais da OS
- vínculo com cliente, contrato, ativo, ticket e pedido quando aplicável
- tarefas/checklist da OS
- status operacional real
- responsável técnico
- datas e horários
- consumo de materiais
- campo para observações técnicas

Status mínimos:
- open
- scheduled
- in_route
- in_progress
- waiting_parts
- done
- cancelled
- return_required

Regras obrigatórias:
- preservar a visualização atual em cards
- manter o filtro por técnico
- criar profundidade operacional sem redesenhar o módulo do zero
```

---

# Prompt 11 — Implementar detalhe de Ticket e geração de OS

```text
Quero aprofundar o módulo de Suporte do GreenLink ADM.

Implementar:
- tela de detalhe do ticket
- comentários do ticket
- responsável
- SLA
- vínculo com cliente, contrato e ativo
- mudança de status
- ação para gerar OS a partir do ticket

Status mínimos:
- new
- in_progress
- waiting_customer
- resolved
- cancelled

Regras obrigatórias:
- ticket é diferente de OS
- ticket pode gerar OS, mas não deve ser confundido com ela
- preservar a tela atual em cards para listagem
- criar profundidade funcional no detalhe
```

---

# Prompt 12 — Implementar Estoque corretamente

```text
Quero corrigir e aprofundar o módulo de Estoque do GreenLink ADM.

Objetivo:
- separar corretamente catálogo, estoque e ativo

Implementar:
- tela de saldos de estoque
- tela de movimentações
- movimentação de entrada
- movimentação de saída
- ajuste de estoque
- reserva de estoque
- vínculo futuro com pedido e OS
- campo de estoque mínimo
- destaque visual para item crítico

Regras obrigatórias:
- catálogo é a lista mestre do que a empresa vende/presta/aluga
- estoque é saldo físico por item e almoxarifado
- ativo é equipamento individual rastreável
- não misturar esses conceitos na UI nem na lógica

Preserve o layout existente.
```

---

# Prompt 13 — Ajustar Dashboard para refletir dados reais

```text
Quero refatorar o Dashboard do GreenLink ADM para refletir corretamente os dados reais do sistema.

Implementar:
- cards conectados às entidades corretas
- resumo comercial, operacional e financeiro consistente
- funil de oportunidades baseado em Opportunity
- indicadores de OS baseados em ServiceOrder
- indicadores financeiros baseados em Receivable e Payable
- indicador de estoque crítico baseado em inventory_balance
- links de drill-down para cada módulo

Regras obrigatórias:
- remover ambiguidades conceituais
- deixar claro o período de cada indicador
- preservar o layout atual, que está muito bom
- melhorar precisão sem redesenhar desnecessariamente
```

---

# Prompt 14 — Criar camada padrão de tipos e serviços

```text
Quero padronizar o frontend do GreenLink ADM com uma arquitetura consistente de tipos e serviços.

Implemente:
- pasta de types por domínio
- pasta de services/api por domínio
- adapters ou mappers se necessário
- hooks de consulta por módulo
- separação clara entre UI, estado e acesso a dados

Domínios mínimos:
- auth
- dashboard
- customers
- leads
- opportunities
- catalog
- quotes
- orders
- contracts
- assets
- serviceOrders
- tickets
- inventory
- finance

Regras obrigatórias:
- não deixar chamadas de dados espalhadas nos componentes de UI
- não manter dados críticos somente em localStorage
- preparar o projeto para backend real
- preservar o funcionamento visual atual
```

---

# Prompt 15 — Revisão final de consistência do sistema

```text
Quero que você faça uma revisão estrutural final do frontend do GreenLink ADM para garantir consistência entre todos os módulos.

Revise e corrija:
- nomenclaturas inconsistentes
- status inconsistentes
- entidades misturadas indevidamente
- rótulos incorretos em botões e telas
- fluxos quebrados ou incompletos
- divergências entre dashboard e módulos internos

Regras obrigatórias:
- preservar design, layout e identidade visual
- corrigir a lógica conceitual do sistema
- produzir um resultado pronto para integração com backend real
- não criar novas ambigüidades
```

---

# Ordem recomendada de execução no Lovable

1. Prompt 1 — arquitetura do frontend
2. Prompt 2 — correção conceitual
3. Prompt 3 — leads e opportunities
4. Prompt 4 — orçamentos
5. Prompt 5 — pedidos
6. Prompt 6 — contratos
7. Prompt 7 — financeiro
8. Prompt 8 — cliente 360
9. Prompt 9 — ativos
10. Prompt 10 — ordens de serviço
11. Prompt 11 — tickets
12. Prompt 12 — estoque
13. Prompt 13 — dashboard
14. Prompt 14 — tipos e serviços padronizados
15. Prompt 15 — revisão final

---

# Recomendação prática

Se você quiser começar do jeito mais eficiente, execute primeiro esta sequência reduzida:

1. Prompt 1
2. Prompt 2
3. Prompt 4
4. Prompt 5
5. Prompt 6
6. Prompt 7

Essa sequência resolve primeiro o coração transacional do sistema: orçamento, pedido, contrato e financeiro.
