# GreenLink ADM — Rotas de API para anexar no Lovable

Este arquivo documenta a estrutura inicial de API do GreenLink ADM para orientar a integração entre frontend e backend.

## Objetivo

Use este arquivo para:

- estruturar a camada de serviços do frontend
- definir contratos de integração sem ambiguidade
- alinhar telas com endpoints reais
- evitar persistência local como fonte principal de dados
- organizar os módulos por domínio de negócio

## Diretrizes importantes para o Lovable

- O frontend deve consumir uma camada de API e não depender de `localStorage` como fonte principal.
- Os módulos devem seguir separação de domínio.
- Não misturar fluxo comercial com fluxo financeiro por nomenclatura errada.
- `Quote` não é `Order`.
- `Order` não é `Contract`.
- `Receivable` não deve reaproveitar nome visual de orçamento.
- Os detalhes de cada entidade devem ser carregados por rotas específicas.

---

```yaml
openapi: 3.1.0
info:
  title: GreenLink ADM API
  version: 0.1.0
  summary: API inicial para integrar o frontend do Lovable ao backend transacional do GreenLink ADM.
servers:
  - url: https://api.greenlink.local

tags:
  - name: auth
  - name: dashboard
  - name: customers
  - name: leads
  - name: opportunities
  - name: catalog
  - name: quotes
  - name: orders
  - name: contracts
  - name: assets
  - name: service-orders
  - name: tickets
  - name: inventory
  - name: finance

paths:
  /auth/me:
    get:
      tags: [auth]
      summary: Retorna usuário autenticado e permissões.
      responses:
        '200':
          description: OK

  /dashboard/summary:
    get:
      tags: [dashboard]
      summary: Resumo executivo para a dashboard.
      parameters:
        - in: query
          name: period
          schema: { type: string, enum: [today, 7d, 30d, month] }
      responses:
        '200':
          description: OK

  /customers:
    get:
      tags: [customers]
      summary: Lista clientes.
      parameters:
        - in: query
          name: search
          schema: { type: string }
        - in: query
          name: type
          schema: { type: string, enum: [pf, pj] }
        - in: query
          name: status
          schema: { type: string }
      responses:
        '200': { description: OK }
    post:
      tags: [customers]
      summary: Cria cliente.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CustomerCreateInput'
      responses:
        '201': { description: Criado }

  /customers/{id}:
    get:
      tags: [customers]
      summary: Detalhe 360 do cliente.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [customers]
      summary: Atualiza cliente.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /customers/{id}/timeline:
    get:
      tags: [customers]
      summary: Timeline consolidada de eventos do cliente.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }

  /leads:
    get:
      tags: [leads]
      summary: Lista leads.
      parameters:
        - in: query
          name: status
          schema: { type: string }
        - in: query
          name: source
          schema: { type: string }
      responses:
        '200': { description: OK }
    post:
      tags: [leads]
      summary: Cria lead.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LeadCreateInput'
      responses:
        '201': { description: Criado }

  /leads/{id}:
    get:
      tags: [leads]
      summary: Detalhe do lead.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [leads]
      summary: Atualiza lead.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /leads/{id}/convert:
    post:
      tags: [leads]
      summary: Converte lead em cliente e/ou oportunidade.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                createCustomer:
                  type: boolean
                createOpportunity:
                  type: boolean
                customerId:
                  type: string
                  format: uuid
      responses:
        '200': { description: Convertido }

  /opportunities:
    get:
      tags: [opportunities]
      summary: Lista oportunidades.
      parameters:
        - in: query
          name: stage
          schema: { type: string }
      responses:
        '200': { description: OK }
    post:
      tags: [opportunities]
      summary: Cria oportunidade.
      responses:
        '201': { description: Criado }

  /opportunities/{id}:
    get:
      tags: [opportunities]
      summary: Detalhe da oportunidade.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [opportunities]
      summary: Atualiza oportunidade.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /opportunities/{id}/stage:
    post:
      tags: [opportunities]
      summary: Move a oportunidade entre etapas do pipeline.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [stage]
              properties:
                stage:
                  type: string
      responses:
        '200': { description: Etapa atualizada }

  /catalog/items:
    get:
      tags: [catalog]
      summary: Lista itens de catálogo.
      parameters:
        - in: query
          name: type
          schema: { type: string }
        - in: query
          name: active
          schema: { type: boolean }
      responses:
        '200': { description: OK }
    post:
      tags: [catalog]
      summary: Cria item de catálogo.
      responses:
        '201': { description: Criado }

  /catalog/items/{id}:
    get:
      tags: [catalog]
      summary: Detalhe do item de catálogo.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [catalog]
      summary: Atualiza item de catálogo.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /quotes:
    get:
      tags: [quotes]
      summary: Lista orçamentos.
      parameters:
        - in: query
          name: status
          schema: { type: string }
      responses:
        '200': { description: OK }
    post:
      tags: [quotes]
      summary: Cria orçamento.
      responses:
        '201': { description: Criado }

  /quotes/{id}:
    get:
      tags: [quotes]
      summary: Detalhe do orçamento com itens.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [quotes]
      summary: Atualiza orçamento.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /quotes/{id}/items:
    post:
      tags: [quotes]
      summary: Adiciona item ao orçamento.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Criado }

  /quotes/{id}/send:
    post:
      tags: [quotes]
      summary: Marca orçamento como enviado.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Enviado }

  /quotes/{id}/approve:
    post:
      tags: [quotes]
      summary: Aprova orçamento.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Aprovado }

  /quotes/{id}/reject:
    post:
      tags: [quotes]
      summary: Rejeita orçamento.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Rejeitado }

  /quotes/{id}/generate-order:
    post:
      tags: [quotes]
      summary: Gera pedido a partir de orçamento aprovado.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Pedido gerado }

  /orders:
    get:
      tags: [orders]
      summary: Lista pedidos.
      parameters:
        - in: query
          name: status
          schema: { type: string }
      responses:
        '200': { description: OK }

  /orders/{id}:
    get:
      tags: [orders]
      summary: Detalhe do pedido.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [orders]
      summary: Atualiza pedido.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /orders/{id}/status:
    post:
      tags: [orders]
      summary: Atualiza status do pedido.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Status atualizado }

  /orders/{id}/generate-contract:
    post:
      tags: [orders]
      summary: Gera contrato a partir do pedido.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Contrato gerado }

  /contracts:
    get:
      tags: [contracts]
      summary: Lista contratos.
      parameters:
        - in: query
          name: status
          schema: { type: string }
      responses:
        '200': { description: OK }
    post:
      tags: [contracts]
      summary: Cria contrato manualmente.
      responses:
        '201': { description: Criado }

  /contracts/{id}:
    get:
      tags: [contracts]
      summary: Detalhe do contrato.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [contracts]
      summary: Atualiza contrato.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /contracts/{id}/billing-cycles:
    get:
      tags: [contracts]
      summary: Lista ciclos de cobrança do contrato.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }

  /contracts/{id}/renew:
    post:
      tags: [contracts]
      summary: Renova contrato.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Renovado }

  /assets:
    get:
      tags: [assets]
      summary: Lista ativos.
      parameters:
        - in: query
          name: customerId
          schema: { type: string, format: uuid }
        - in: query
          name: status
          schema: { type: string }
      responses:
        '200': { description: OK }
    post:
      tags: [assets]
      summary: Cria ativo.
      responses:
        '201': { description: Criado }

  /assets/{id}:
    get:
      tags: [assets]
      summary: Detalhe do ativo.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [assets]
      summary: Atualiza ativo.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /assets/{id}/events:
    get:
      tags: [assets]
      summary: Histórico do ativo.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    post:
      tags: [assets]
      summary: Adiciona evento ao ativo.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Criado }

  /service-orders:
    get:
      tags: [service-orders]
      summary: Lista ordens de serviço.
      parameters:
        - in: query
          name: status
          schema: { type: string }
        - in: query
          name: assignedTo
          schema: { type: string, format: uuid }
      responses:
        '200': { description: OK }
    post:
      tags: [service-orders]
      summary: Cria ordem de serviço.
      responses:
        '201': { description: Criado }

  /service-orders/{id}:
    get:
      tags: [service-orders]
      summary: Detalhe da OS.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [service-orders]
      summary: Atualiza OS.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /service-orders/{id}/status:
    post:
      tags: [service-orders]
      summary: Atualiza status da OS.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Status atualizado }

  /service-orders/{id}/tasks:
    get:
      tags: [service-orders]
      summary: Lista tarefas da OS.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    post:
      tags: [service-orders]
      summary: Adiciona tarefa à OS.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Criado }

  /service-orders/{id}/material-usage:
    get:
      tags: [service-orders]
      summary: Lista consumo de materiais da OS.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    post:
      tags: [service-orders]
      summary: Registra consumo de material na OS.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Criado }

  /tickets:
    get:
      tags: [tickets]
      summary: Lista tickets.
      parameters:
        - in: query
          name: status
          schema: { type: string }
        - in: query
          name: priority
          schema: { type: string }
      responses:
        '200': { description: OK }
    post:
      tags: [tickets]
      summary: Cria ticket.
      responses:
        '201': { description: Criado }

  /tickets/{id}:
    get:
      tags: [tickets]
      summary: Detalhe do ticket.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    patch:
      tags: [tickets]
      summary: Atualiza ticket.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: Atualizado }

  /tickets/{id}/comments:
    get:
      tags: [tickets]
      summary: Lista comentários do ticket.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '200': { description: OK }
    post:
      tags: [tickets]
      summary: Adiciona comentário ao ticket.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Criado }

  /tickets/{id}/generate-service-order:
    post:
      tags: [tickets]
      summary: Gera OS a partir do ticket.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: OS gerada }

  /inventory/balances:
    get:
      tags: [inventory]
      summary: Lista saldos de estoque.
      parameters:
        - in: query
          name: warehouseId
          schema: { type: string, format: uuid }
      responses:
        '200': { description: OK }

  /inventory/movements:
    get:
      tags: [inventory]
      summary: Lista movimentações de estoque.
      responses:
        '200': { description: OK }
    post:
      tags: [inventory]
      summary: Cria movimentação de estoque.
      responses:
        '201': { description: Criado }

  /finance/receivables:
    get:
      tags: [finance]
      summary: Lista contas a receber.
      parameters:
        - in: query
          name: status
          schema: { type: string }
        - in: query
          name: dueFrom
          schema: { type: string, format: date }
        - in: query
          name: dueTo
          schema: { type: string, format: date }
      responses:
        '200': { description: OK }
    post:
      tags: [finance]
      summary: Cria conta a receber.
      responses:
        '201': { description: Criado }

  /finance/receivables/{id}/payments:
    post:
      tags: [finance]
      summary: Registra recebimento.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Pagamento registrado }

  /finance/payables:
    get:
      tags: [finance]
      summary: Lista contas a pagar.
      responses:
        '200': { description: OK }
    post:
      tags: [finance]
      summary: Cria conta a pagar.
      responses:
        '201': { description: Criado }

  /finance/payables/{id}/payments:
    post:
      tags: [finance]
      summary: Registra pagamento de conta a pagar.
      parameters:
        - $ref: '#/components/parameters/IdPath'
      responses:
        '201': { description: Pagamento registrado }

  /finance/summary:
    get:
      tags: [finance]
      summary: Resumo financeiro para dashboard do módulo.
      parameters:
        - in: query
          name: period
          schema: { type: string, enum: [7d, 30d, month] }
      responses:
        '200': { description: OK }

components:
  parameters:
    IdPath:
      in: path
      name: id
      required: true
      schema:
        type: string
        format: uuid

  schemas:
    CustomerCreateInput:
      type: object
      required: [customerType, legalName]
      properties:
        customerType:
          type: string
          enum: [pf, pj]
        legalName:
          type: string
        tradeName:
          type: string
        documentNumber:
          type: string
        email:
          type: string
        phone:
          type: string
        city:
          type: string
        state:
          type: string
    LeadCreateInput:
      type: object
      required: [name]
      properties:
        name:
          type: string
        companyName:
          type: string
        email:
          type: string
        phone:
          type: string
        source:
          type: string
        assignedTo:
          type: string
          format: uuid
```
