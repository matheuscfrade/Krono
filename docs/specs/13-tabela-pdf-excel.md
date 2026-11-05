# Spec: tabela, PDF e Excel

> Fase 6. Status: **implementada** (2026-11-05). Atualizada: tabela só com marcações; PDF e Excel com meses coloridos.

## Objetivo
Tabela de detalhamento por período (dias seguidos viram intervalo). Totais se a regra estiver ligada. Imprimir / PDF (A4 paisagem) com os 12 meses coloridos. Excel gerado no navegador, com aba do calendário colorido.

## Tabela
- Só entram **marcações**: feriado, recesso, férias, exames, recuperação, reposição, evento, sábado letivo explícito.
- Dia que é **só letivo** (segunda a sexta do período, sem outro lançamento) **não** aparece na tabela do app, do PDF nem do Excel. O azul do letivo fica no calendário.
- Se o dia tem letivo + evento, a linha mostra só a marcação (`Evento — Acolhimento`), sem “Dia letivo — …”.
- Dias seguidos com o mesmo texto viram intervalo.

## PDF (Imprimir)
- A4 paisagem, cores preservadas (`print-color-adjust: exact`).
- Primeira folha: nome, instituição, ano, 12 meses coloridos (fundo + marcas) e legenda.
- Folha seguinte: tabela de detalhamento (só marcações) e totais, se ligados.

## Excel
- Aba **Calendário**: 12 meses coloridos (4 por linha), número do dia no fundo da cor.
- Aba **Eventos**: a mesma tabela de marcações do app.
- Aba **Resumo**: dias letivos por mês, período e ano.

