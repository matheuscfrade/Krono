# Spec: tipo entra no prazo mínimo

> Status: **implementada** (2026-11-05).

## Objetivo
Cada tipo decide se aparece como origem ou destino de **prazo mínimo**. A lista fixa da spec 19 vira o **padrão** do interruptor, não uma trava.

**Quem usa:** quem elabora o calendário.

## Jornada
1. Tipos de marcação → Feriado: **Pode ser origem ou destino de prazo** desligado. Exames finais: ligado. Férias e Recuperação: desligado.
2. Liga o interruptor em Feriado. Em Prazo mínimo, origem e destino passam a listar Feriado.
3. Criar tipo: o interruptor vem desligado (tipo novo não entra no prazo até ligar).
4. Celular 360 px: interruptor ≥ 44 px.

## Telas
Em cada tipo que não é letivo da etapa: interruptor **Pode ser origem ou destino de prazo** (além do rádio de combinar, quando houver).

Criar tipo: o mesmo interruptor, desligado no padrão.

## Regras
`entraNoPrazo` no tipo. Padrão:

| Tipo | Entra no prazo |
|---|---|
| Exames finais | sim |
| Feriado, Recesso, Férias, Recuperação, Evento, Reposição, Sábado letivo, Retirada, tipo criado | não |

`tiposParaPrazo` usa esse interruptor. Âncoras de período continuam sempre. Tipo letivo da etapa nunca entra.

Formato **5**. Campo ausente = padrão da tabela.

## Casos de erro
Nenhum novo.

## Critérios de aceite
1. Lista do prazo, no padrão: Início/Fim de período e Exames finais. Sem Férias, Recuperação, Feriado.
2. Ligar **Pode ser origem ou destino de prazo** em Feriado: Feriado aparece na origem e no destino.
3. Desligar em Exames: Exames some da lista.
4. Tipo criado não entra na lista até ligar o interruptor.
5. Celular 360 px: interruptor usável, ≥ 44 px.

## Fora do escopo
- Escolher um lançamento específico.
- Hospedagem.
