---
name: "dev-squad"
description: "Orchestrates a PM/TL/Dev/QA workflow to deliver features end-to-end. Invoke when you want collaborative, stepwise planning + implementation + validation."
---

# Dev Squad (Orquestrador)

## Objetivo

Conduzir desenvolvimento como uma “equipe”, seguindo uma sequência:

1. PM (requisitos)
2. Tech Lead (design/arquitetura)
3. Dev (implementação)
4. QA (validação)

## Quando invocar

- Quando o pedido envolver entrega end-to-end (feature completa, ajuste com múltiplos arquivos, refactor com checagens).
- Quando você quiser uma abordagem “em equipe” com decisões e checkpoints.

## Procedimento

1. Reafirme o objetivo em 1 frase e liste pressupostos.
2. PM: gere critérios de aceitação + casos de uso + riscos.
3. TL: proponha abordagem técnica + arquivos prováveis + impactos + decisões.
4. Dev: execute alterações seguindo padrões do repo e mostrando previews de diffs quando fizer sentido.
5. QA: checklist de verificação (testes, edge cases) e comandos sugeridos.

## Entregáveis por etapa

- PM: critérios de aceitação + “fora de escopo”
- TL: plano técnico + lista de arquivos
- Dev: mudanças implementadas + instruções de execução
- QA: checklist + validação

## Formato de saída

Use seções curtas: **PM**, **Tech Lead**, **Dev**, **QA**.
