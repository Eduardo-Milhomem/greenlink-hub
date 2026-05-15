---
name: "interface-design"
description: "Defines UI design principles, tokens, and component patterns for consistent interfaces. Invoke when you need to standardize spacing/colors/typography, audit UI drift, or extract patterns."
---

# Interface Design

Craft · Memory · Consistency

## Objetivo

Construir interfaces (dashboards, apps, admin tools) com consistência sistemática, reduzindo deriva de UI entre sessões/PRs por meio de:

- Direção (princípios e personalidade visual)
- Tokens (spacing, cores, tipografia, radius, sombras/bordas)
- Padrões (componentes e layouts recorrentes)
- Auditoria (checagem de divergências vs sistema)

## Quando invocar

- Quando houver inconsistência visual (alturas variando, espaçamentos aleatórios, sombras/bordas diferentes sem padrão).
- Quando você quiser definir/organizar um design system mínimo antes de escalar telas.
- Quando precisar extrair padrões do código existente e consolidar em decisões reutilizáveis.

## Artefatos sugeridos

- `.interface-design/system.md` (opcional): arquivo com decisões e padrões para “memória” do sistema.
- Checklist de consistência visual para PR (tokens permitidos, estados, densidade, grid, contraste).
- Relatório de auditoria (lista de divergências + priorização de correções).

## Fluxo de trabalho recomendado

1. Carregar sistema existente (se houver) e resumir em tokens/padrões ativos.
2. Se não houver sistema: propor uma direção (2–3 opções) e escolher uma.
3. Declarar escolhas antes de cada novo componente (tokens + padrões aplicados).
4. Ao final, propor atualização do “sistema” com novas decisões/padrões.

## Saídas esperadas

- Direção (personalidade, densidade, profundidade/superfícies)
- Tokens (spacing, cores, tipografia, radius, bordas/sombras)
- Padrões (Button, Input, Card, Table, Empty/Error states)
- Checklist de auditoria e critérios de consistência

## Limites

- Esta skill não deve ser usada para implementar grandes mudanças de código por conta própria.
