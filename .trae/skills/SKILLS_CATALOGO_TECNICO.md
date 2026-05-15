---
title: "Catálogo Técnico de Skills (Trae) — Greenlink Hub"
version: "1.0"
language: "pt-BR"
scope: "workspace"
last_updated: "2026-05-14"
skills:
  - dev-squad
  - product-manager
  - tech-lead
  - implementer
  - qa-engineer
---

# Catálogo Técnico de Skills

## Metodologia de categorização

Este documento define um catálogo de skills para execução de tarefas de desenvolvimento de software com baixa ambiguidade, alta rastreabilidade e mínima sobreposição de atribuições.

### Princípios

- **Exclusividade por intenção**: cada tarefa deve ser atribuída à skill que melhor representa a intenção principal (definir o quê/por quê vs decidir como vs codar vs validar).
- **Mensurabilidade**: exemplos de tarefas são formulados como ações verificáveis, com resultado observável (artefato, decisão, alteração de código, checklist, validação).
- **Escalonamento de complexidade**:
  - **Básica**: escopo limitado, baixa incerteza, poucas dependências.
  - **Intermediária**: envolve trade-offs, integrações, múltiplas partes, risco moderado.
  - **Avançada**: envolve arquitetura, refactor amplo, riscos altos, requisitos não funcionais, estratégia de testes/rollout.
- **Independência de implementação**: `product-manager` não define design técnico; `qa-engineer` não implementa; `tech-lead` não executa a maior parte do código; `implementer` não redefine requisitos.

### Regra de roteamento (decisão rápida)

Use a primeira regra que se aplicar:

1. Se a solicitação pede **entrega end-to-end** (planejar + implementar + validar) → `dev-squad`
2. Se a solicitação pede **clarear escopo/requisitos/aceitação** → `product-manager`
3. Se a solicitação pede **decidir abordagem/arquitetura/trade-offs** → `tech-lead`
4. Se a solicitação pede **mudar código/config/refactor** → `implementer`
5. Se a solicitação pede **testar/validar/reproduzir/evitar regressões** → `qa-engineer`

### Índice de busca (palavras‑chave)

- **dev-squad**: orquestração, end-to-end, PM+TL+Dev+QA, entrega, checkpoints
- **product-manager**: requisitos, escopo, critérios de aceitação, user flow, priorização
- **tech-lead**: arquitetura, design, trade-offs, padrões, impacto, segurança, performance
- **implementer**: codar, bugfix, feature, refactor, config, build, integração
- **qa-engineer**: testes, validação, checklist, regressão, reprodução, edge cases

---

# Skills

## Skill: dev-squad

### 1) Identificação

- **Nome oficial (ID)**: `dev-squad`
- **Arquivo fonte**: [SKILL.md](file:///c:/Users/eduar/OneDrive/DEVELOP/greenlink-hub/.trae/skills/dev-squad/SKILL.md)

### 2) Propósito e funcionalidade (com cenários)

Orquestra um fluxo colaborativo em etapas **PM → Tech Lead → Implementer → QA Engineer** para entregar uma solicitação de ponta a ponta, reduzindo retrabalho e garantindo validação.

**Cenários de aplicação**

- Implementar uma feature com critérios claros, plano técnico, alteração de código e checklist de validação.
- Corrigir bug que exige reprodução, hipótese, mudança em múltiplos arquivos e validação final.
- Fazer refactor com impacto em várias partes do sistema, garantindo mitigação e verificação.

### 3) Exemplos de tarefas (exclusivas; básicas/intermediárias/avançadas)

**Básicas**

- Entregar uma pequena tela com formulário simples: requisitos → implementação → validação manual mínima.
- Corrigir bug visual isolado com verificação de regressão local.
- Adicionar um endpoint simples (sem regras complexas) com testes/checklist.
- Ajustar uma configuração de build (ex.: Vite) com validação em ambiente local.
- Implementar uma listagem paginada simples com estado de loading e empty state.
- Padronizar mensagens de erro em uma rota específica e validar cenários de falha.

**Intermediárias**

- Implementar feature com integração externa (ex.: OAuth/SDK) com decisões de segurança e checklist.
- Criar fluxo multi-etapas (wizard) com estados, validação e persistência parcial.
- Refatorar um módulo para reduzir duplicação, mantendo compatibilidade e cobrindo casos limite.
- Introduzir cache (cliente/servidor) com estratégia de invalidação e validação.
- Implementar feature com permissões/roles e verificar acessos indevidos.
- Migrar rota ou API sem quebrar consumidores, com plano de rollout e validação.
- Corrigir bug intermitente com instrumentação mínima e confirmação do fix.
- Preparar release pequeno com checklist de verificação e rollback básico.

**Avançadas**

- Redesenhar arquitetura de um domínio (ex.: autenticação/autorização) com decisões registradas e validação ampla.
- Refactor transversal com impacto em múltiplas camadas, com plano incremental e mitigação de regressão.
- Implementar feature com requisitos não funcionais (performance, observabilidade, segurança) e validação direcionada.
- Planejar e executar migração gradual (feature flag) com testes e validação por cohort.
- Consolidar padrões de erro/telemetria em toda a aplicação com validação de ponta a ponta.
- Preparar hardening para exposição pública (túnel/proxy) com checklist de riscos e validação.

### 4) Critérios de validação (alocação correta)

- A solicitação exige **mais de um papel** (ex.: requisitos + design + codar + testar).
- Há necessidade explícita de **checkpoints** e **entregáveis por etapa**.
- O “feito” depende de **implementação + validação** (não apenas decisão ou checklist).

### 5) Interdependências

- Depende conceitualmente de: `product-manager`, `tech-lead`, `implementer`, `qa-engineer`.
- Atua como **orquestrador**: delega sub-tarefas às demais skills e consolida o resultado.

---

## Skill: product-manager

### 1) Identificação

- **Nome oficial (ID)**: `product-manager`
- **Arquivo fonte**: [SKILL.md](file:///c:/Users/eduar/OneDrive/DEVELOP/greenlink-hub/.trae/skills/product-manager/SKILL.md)

### 2) Propósito e funcionalidade (com cenários)

Converte uma solicitação em requisitos claros e testáveis: objetivo, escopo, critérios de aceitação, user flows e riscos. Reduz ambiguidade antes de decisões técnicas.

**Cenários de aplicação**

- Pedido amplo (“quero melhorar X”) precisa virar entregáveis com critérios de aceitação.
- Definição de comportamento esperado para uma feature antes de implementação.
- Priorização e fatiamento (MVP vs incrementos) para reduzir risco de entrega.

### 3) Exemplos de tarefas (exclusivas; básicas/intermediárias/avançadas)

**Básicas**

- Converter uma ideia em **objetivo + checklist de aceitação** (5–10 itens).
- Especificar estados de UI: loading, vazio, erro, sucesso.
- Definir campos obrigatórios/opcionais de um formulário e regras de validação em linguagem de produto.
- Escrever “fora de escopo” para reduzir creep de requisitos.
- Definir nomenclatura e microcópia (textos) de botões/labels para um fluxo simples.
- Definir critérios de “pronto” para uma correção de bug (com passos de reprodução).

**Intermediárias**

- Mapear user flow com caminhos alternativos (feliz + falha + cancelamento).
- Definir políticas de permissão por papel (quem pode ver/editar/excluir) em termos de negócio.
- Criar backlog fatiado (MVP + incrementos) com prioridade e dependências.
- Definir requisitos de auditoria (o que registrar, quando, por quê) em linguagem de produto.
- Especificar comportamentos offline/latência/timeout do ponto de vista do usuário.
- Definir regras de negócio (cálculos, limites, exceções) com exemplos de entrada/saída.
- Criar critérios de aceitação para integrações (o que é considerado sincronizado, erro, retry).
- Preparar FAQ de suporte interno (operações) para a feature, focado em uso e sintomas.

**Avançadas**

- Elaborar especificação de feature com métricas de sucesso (KPIs) e eventos de tracking (sem escolher implementação).
- Planejar rollout por etapas (beta, gradual, GA) com critérios de avanço/retrocesso do ponto de vista de produto.
- Definir estratégia de migração de comportamento (depreciação) e comunicação para usuários.
- Criar matriz de requisitos não funcionais do ponto de vista de produto (SLO percebido, confiabilidade, privacidade).
- Negociar trade-offs de escopo (o que cortar) mantendo valor mínimo e critérios de qualidade.

### 4) Critérios de validação (alocação correta)

- A tarefa tem como saída principal **texto estruturado** (requisitos, critérios, fluxo, escopo).
- O foco é **o que** o sistema deve fazer e **como validar do ponto de vista do usuário**, não como implementar.
- A tarefa reduz incerteza para permitir decisão técnica e implementação.

### 5) Interdependências

- Alimenta: `tech-lead` (insumos para desenho), `implementer` (critérios para codar), `qa-engineer` (cenários e critérios).
- Pode ser acionada antes de `dev-squad` para consolidar requisitos.

---

## Skill: tech-lead

### 1) Identificação

- **Nome oficial (ID)**: `tech-lead`
- **Arquivo fonte**: [SKILL.md](file:///c:/Users/eduar/OneDrive/DEVELOP/greenlink-hub/.trae/skills/tech-lead/SKILL.md)

### 2) Propósito e funcionalidade (com cenários)

Define a abordagem técnica: arquitetura, interfaces, impacto, riscos e trade-offs. Serve para alinhar padrões do repositório e evitar decisões implícitas durante a implementação.

**Cenários de aplicação**

- Há múltiplas abordagens possíveis (ex.: SSR vs CSR, cache, estratégia de estado, banco).
- Mudança com risco (segurança/performance/observabilidade) exige decisão explícita.
- Refactor amplo precisa de plano incremental e critérios de rollback.

### 3) Exemplos de tarefas (exclusivas; básicas/intermediárias/avançadas)

**Básicas**

- Propor abordagem para uma feature pequena (arquivos prováveis, contratos e pontos de validação).
- Definir estrutura de rotas/páginas para uma nova tela seguindo padrões existentes.
- Especificar contrato de API (endpoints, payloads, erros) em nível de types/shape.
- Identificar impactos e dependências técnicas em um módulo específico.
- Definir estratégia simples de tratamento de erros (onde capturar, como mostrar).
- Definir limites de validação (client vs server) e responsabilidades.

**Intermediárias**

- Escolher estratégia de estado (server state vs client state) e justificar trade-offs.
- Definir padrão de integração com API (retry, timeout, backoff) e onde implementar.
- Propor refactor para modularização, reduzindo acoplamento e duplicação.
- Definir padrão de logs/telemetria (eventos, níveis, contexto) sem expor dados sensíveis.
- Definir estratégia de autenticação/autorização (roles, guards) e pontos de enforcement.
- Planejar migração de endpoints/rotas com compatibilidade e versionamento.
- Avaliar impacto de performance (bundle, SSR, caching) e sugerir mitigação.
- Definir abordagem de testes (unit/integration/e2e) adequada ao risco.

**Avançadas**

- Desenhar arquitetura de domínio com boundaries claros e evolução incremental.
- Planejar refactor transversal com estratégia de rollout/feature flag e rollback.
- Definir modelo de segurança (threat model leve) e controles (CSP, headers, validação).
- Propor estratégia de escalabilidade (caching, filas, particionamento) com riscos e métricas.
- Definir estratégia de observabilidade (SLO, tracing, correlação) e validação.
- Decidir padrões de API e compatibilidade para múltiplos consumidores.

### 4) Critérios de validação (alocação correta)

- O resultado esperado é **uma decisão técnica** ou **plano** (não alteração de código como principal).
- Há necessidade de comparar alternativas e registrar trade-offs.
- A tarefa define contratos/padrões que guiam implementação e testes.

### 5) Interdependências

- Recebe insumos de: `product-manager`.
- Orienta: `implementer` (como executar), `qa-engineer` (o que priorizar na validação), `dev-squad` (plano geral).

---

## Skill: implementer

### 1) Identificação

- **Nome oficial (ID)**: `implementer`
- **Arquivo fonte**: [SKILL.md](file:///c:/Users/eduar/OneDrive/DEVELOP/greenlink-hub/.trae/skills/implementer/SKILL.md)

### 2) Propósito e funcionalidade (com cenários)

Executa mudanças de código e configuração seguindo os padrões do repositório, com foco em entregar o comportamento especificado e manter o sistema funcionando (build, lint, runtime).

**Cenários de aplicação**

- Implementar uma feature a partir de requisitos já definidos.
- Corrigir bug com causa identificada e solução objetiva.
- Ajustar config/infra local (ex.: Vite) para suportar um novo ambiente/host.

### 3) Exemplos de tarefas (exclusivas; básicas/intermediárias/avançadas)

**Básicas**

- Corrigir bug de lógica localizado em uma função/componente.
- Ajustar rota, query ou estado de UI para refletir comportamento esperado.
- Adicionar validação simples de formulário (required/min/max) e mensagens.
- Configurar `allowedHosts`/proxy/headers no Vite para um novo hostname.
- Refatorar nomes/estrutura interna em um único arquivo sem mudar comportamento.
- Ajustar estilos/layout em um componente existente mantendo responsividade.

**Intermediárias**

- Implementar integração com API (fetch, error handling, estados) em múltiplos componentes.
- Criar um fluxo completo de CRUD (listar/criar/editar/remover) com feedback ao usuário.
- Implementar controle de acesso em rotas/componentes (guards) conforme regras definidas.
- Otimizar performance local (memoization, split de código) com validação de comportamento.
- Migrar de uma API antiga para uma nova em múltiplos pontos do app.
- Implementar cache (client/server) com invalidação e tratamento de inconsistências.
- Ajustar build/deploy config para compatibilidade com um alvo (ex.: Cloudflare/Vite plugin).
- Remover duplicações criando utilitários/reuso, mantendo compatibilidade.

**Avançadas**

- Refactor transversal guiado por plano do `tech-lead` (múltiplos módulos/camadas).
- Introduzir feature flag e caminho alternativo com fallback e remoção futura planejada.
- Implementar mudanças que envolvam segurança (sanitização, validação, headers) e validação de regressão.
- Reestruturar camadas (domínio/infra/UI) mantendo compatibilidade e build estável.
- Implementar mudanças com migração de dados/config e plano incremental.
- Melhorar observabilidade (erros, rastreio) sem vazamento de PII/segredos.

### 4) Critérios de validação (alocação correta)

- A saída principal é **código/config alterado** (diffs) e comportamento executável.
- A tarefa é melhor resolvida modificando arquivos e validando com execução local.
- Requisitos/aceitação já estão claros o suficiente para codar.

### 5) Interdependências

- Idealmente segue decisões de: `tech-lead`.
- Fornece base para validação de: `qa-engineer`.
- Pode ser acionada dentro de: `dev-squad`.

---

## Skill: qa-engineer

### 1) Identificação

- **Nome oficial (ID)**: `qa-engineer`
- **Arquivo fonte**: [SKILL.md](file:///c:/Users/eduar/OneDrive/DEVELOP/greenlink-hub/.trae/skills/qa-engineer/SKILL.md)

### 2) Propósito e funcionalidade (com cenários)

Define e executa mentalmente/estruturalmente a validação: cenários de teste, edge cases, regressão, passos de reprodução e critérios para aceitar/rejeitar uma mudança.

**Cenários de aplicação**

- Depois de implementar uma feature para garantir que atende critérios de aceitação.
- Para reproduzir bug e definir o que valida a correção.
- Para reduzir risco em refactor ou mudança com impacto de segurança/performance.

### 3) Exemplos de tarefas (exclusivas; básicas/intermediárias/avançadas)

**Básicas**

- Criar checklist de smoke test para uma tela (renderiza, navega, salva, erros).
- Definir passos de reprodução consistentes para um bug reportado.
- Listar edge cases de formulário (vazio, limites, caracteres especiais, múltiplos envios).
- Validar estados de UI: loading, empty, erro, retry.
- Verificar comportamento de navegação (voltar/avançar/refresh) em um fluxo simples.
- Definir critérios de aceitação verificáveis para “bugfix concluído”.

**Intermediárias**

- Criar matriz de testes por permissões (roles) e ações (view/edit/delete).
- Definir cenários de integração com API: timeout, 401/403, 5xx, dados inconsistentes.
- Planejar regressão focada para refactor em um módulo crítico.
- Definir casos de teste para cache/invalidação (stale, re-fetch, concorrência).
- Criar roteiro de testes cross-browser básico e responsividade.
- Validar impactos de performance percebida (TTI, loading progressivo) com checklist.
- Sugerir quais cenários devem virar testes automatizados (unit/integration/e2e).
- Definir critérios de rollback (sinais de falha) para um release pequeno.

**Avançadas**

- Definir estratégia de testes para rollout gradual/feature flag (ambos caminhos ativos).
- Criar plano de testes para migração (compatibilidade, dados antigos, fallback).
- Elaborar validação de segurança focada (inputs maliciosos, headers, permissões) com critérios.
- Planejar validação de observabilidade (eventos/erros) sem PII.
- Definir testes de concorrência e consistência (multi‑aba, requests simultâneas).
- Criar checklist operacional para pós-deploy (métricas, logs, alertas, smoke externo).

### 4) Critérios de validação (alocação correta)

- A entrega principal é **plano de teste/checklist/validação** (não código).
- O objetivo é confirmar qualidade, evitar regressões e documentar passos verificáveis.
- Há risco de falhas em bordas, permissões, integração, rede ou estados inesperados.

### 5) Interdependências

- Usa critérios de: `product-manager` (aceitação e fluxos).
- Prioriza validações guiadas por: `tech-lead` (riscos e arquitetura).
- Valida mudanças feitas por: `implementer`.
- Pode ser acionada dentro de: `dev-squad`.

---

# Seção final: validação de consistência do catálogo

## Checklist de consistência

- Cada skill possui **ID único** e referência ao arquivo fonte.
- Cada skill contém as seções exigidas: (1) identificação, (2) propósito/cenários, (3) exemplos por nível, (4) critérios de validação, (5) interdependências.
- Exemplos de tarefas evitam sobreposição por intenção:
  - `product-manager`: define requisitos/aceitação/fluxo; não decide implementação.
  - `tech-lead`: decide abordagem e trade-offs; não executa o grosso do código.
  - `implementer`: altera código/config; não redefine escopo.
  - `qa-engineer`: valida; não implementa.
  - `dev-squad`: orquestra quando há múltiplas necessidades.
- Índice de palavras-chave existe para busca e roteamento rápido.

## Regras para manutenção

- Ao adicionar nova skill, atualizar:
  - Frontmatter (`skills:`) e índice de palavras‑chave
  - Seção “Skills” com o mesmo template
  - Validação final, garantindo exclusividade por intenção
