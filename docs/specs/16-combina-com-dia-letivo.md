# Spec: combina com dia letivo

> Status: **implementada** (2026-11-05).

## Objetivo
No tipo de marcação, a pessoa escolhe só se o lançamento **pode ficar junto do dia letivo** ou **substitui a aula**. Os interruptores **Tira o dia letivo** e **Vira aula** saem: os dois ligados se contradizem.

**Quem usa:** quem elabora o calendário.

## Contexto
Hoje cada tipo tem três interruptores. **Tira o dia letivo** e **Vira aula** apontam para o mesmo fato (o dia é aula ou não). O código já trata **Vira aula** como vencedor quando os dois estão ligados (`tiraLetivo && !viraAula`). Isso confunde.

O que a pessoa precisa decidir é um só:

- **Não permite combinar com dia letivo** — o lançamento ocupa o dia; não há aula por baixo (feriado, recesso, férias, exames, recuperação).
- **Permite combinar com dia letivo** — a marca fica junto da aula, se aquele dia já era letivo (Evento num dia da etapa).

**Conta nos totais** continua: só diz se, **quando o dia for aula**, entra nos 200.

## Jornada
1. Em **Tipos de marcação**, abre Feriado: vê **Não permite combinar com dia letivo** e **Conta nos totais** desligado.
2. Abre Evento: vê **Permite combinar com dia letivo** e **Conta nos totais** ligado. Um Evento numa terça da etapa mantém o fundo de aula e ganha a marca.
3. Liga **Permite combinar** em Recuperação. Uma recuperação numa terça da etapa deixa de tirar a aula: fundo letivo + marca. Fora da etapa, o dia continua sem aula (não há letivo com o que combinar).
4. **Criar tipo:** nome, cor, os dois rádios e Conta nos totais. Padrão: permite combinar, conta nos totais.
5. Celular 360 px: rádios e Conta nos totais usáveis, Criar tipo / toques ≥ 44 px.

## Telas
Bloco **Tipos de marcação** e diálogo **Novo tipo de marcação**:

- Dois rádios, um escolhido:
  - Permite combinar com dia letivo
  - Não permite combinar com dia letivo
- Interruptor **Conta nos totais** (como hoje).
- Sem **Tira o dia letivo**. Sem **Vira aula**.

Tipos **Dia letivo — {período}** continuam só com a cor (sem esses campos).

**Reposição** e **Sábado letivo** não mostram os rádios: o papel deles é criar aula onde ainda não havia. Só cor e **Conta nos totais**.

## Regras
Cálculo em `src/dominio`, com testes. Sem React.

**Não permite combinar:** o dia deixa de ser aula (mesmo efeito de `tiraLetivo` hoje, sem `viraAula`). Fundo de feriado/recesso quando for o caso; demais tipos viram marca e o letivo some.

**Permite combinar:** o lançamento não tira aula. Se o dia já era letivo (segunda a sexta na etapa), continua letivo + marca. Se o dia não era letivo, continua sem aula.

**Evento no sábado:** continua aula (regra já existente). O rádio do tipo Evento não desliga isso.

**Reposição** e **Sábado letivo:** sempre criam aula (exceto domingo). Reposição continua recusada em dia que já é letivo, feriado ou recesso.

**Domingo** nunca vira aula.

[CONFIRMAR] Quem hoje liga **Vira aula** em Recuperação (ou num tipo criado) para **inventar** aula fora da etapa ou no sábado perde esse caminho. Com “permite combinar”, só se mantém aula que já existia. Recuperação fora do período (ex.: 11/05/2027 no PDF de Formiga) **não** entra nos 200 só por mudar o rádio.

[CONFIRMAR] **Conta nos totais** permanece. Sem aula no dia, o interruptor não soma.

Padrão dos tipos prontos:

| Tipo | Combina com dia letivo | Conta nos totais |
|---|---|---|
| Feriado, Recesso, Férias, Exames finais, Recuperação, Retirada | não | não |
| Evento | sim | sim |
| Tipo criado | sim | sim |
| Reposição, Sábado letivo | (sem rádio; sempre criam aula) | sim |

## Dados
Formato do rascunho passa para **4**. v3 continua abrindo.

`TipoDia`:
```ts
combinaComLetivo?: boolean
contaNosTotais?: boolean
```

`tiraLetivo` e `viraAula` saem do arquivo novo.

Na leitura do v3 (e anteriores):

- `combinaComLetivo = false` se o tipo **tirava aula** (`tiraLetivo` e sem `viraAula`).
- `combinaComLetivo = true` nos demais (incluindo quem tinha **Vira aula** ligado).
- Reposição e sábado letivo ignoram o rádio; o código continua criando aula.

## Casos de erro
Nenhuma mensagem nova. Tipo novo sem nome continua: “Escreva o nome do tipo.”

## Critérios de aceite
1. Tipos de marcação e Criar tipo: só os rádios Permite / Não permite e Conta nos totais. Sem Tira o dia letivo e sem Vira aula.
2. Feriado numa terça da etapa: não é aula. Evento na mesma terça: continua aula + marca.
3. Recuperação com **Permite combinar** numa terça da etapa: continua aula + marca. A mesma recuperação **fora** da etapa: não é aula e não entra nos 200.
4. Rascunho v3 com `tiraLetivo` / `viraAula` abre; feriado continua sem aula; Evento continua combinando. Arquivo salvo sai v4.
5. Celular 360 px: rádios usáveis, alvos ≥ 44 px, sem rolagem lateral no diálogo.

## Fora do escopo
- Expressão livre (“se cair em terça”).
- Biblioteca de regras IFMG.
- Hospedagem (Fase 7).
- Mudar a regra de Evento no sábado.
