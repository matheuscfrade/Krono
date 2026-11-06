# Spec: conflitos e regras ligáveis

> Fase 4. Status: **implementada** (2026-11-05).

## Objetivo
Mostrar avisos no dia afetado e no calendário. Regras ligáveis (mínimo, exames, conferência, semanas temáticas, totais).

## Regras
Ver `docs/DOMINIO.md`. Cada conflito tem mensagem e como resolver. Marca `!` no dia.

Aviso 1 (evento em feriado, recesso ou férias): o lançamento é permitido. O aviso aparece no dia e na aba **Avisos e conflitos**, com o botão **Manter neste dia**. Se a pessoa confirmar, o evento permanece e aquele aviso some (sem `!` no calendário). Outros avisos do mesmo evento em outros dias continuam. O aceite fica no rascunho (`aceitosEmFeriado` no evento). Se as datas mudarem, o aviso volta.

## Fora do escopo
Hospedagem e licença (Fase 7).
