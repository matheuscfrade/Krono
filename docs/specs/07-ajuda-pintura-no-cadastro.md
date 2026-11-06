# Spec: ajuda de pintura no cadastro

> Fase 3. Status: **implementada** (2026-11-05).
>
> Termos em uma frase: **ajuda de pintura** = texto curto + amostra da célula, no formulário, dizendo se o tipo pinta o **fundo** do dia ou só um **quadradinho**.

## Objetivo
Na hora de lançar período, feriado ou evento, a pessoa vê o que vai aparecer no mês, antes de salvar.

**Quem usa:** quem monta o calendário.

## Jornada
1. Abre **Adicionar período**. Abaixo das datas, lê: o período pinta o fundo de segunda a sexta na cor da etapa. Vê uma célula de amostra azul com o número 12.
2. Abre **Adicionar feriado ou recesso**. Escolhe Feriado: amostra com fundo vermelho. Troca para Recesso: amostra com fundo laranja. O texto diz que o dia deixa de ser letivo.
3. Abre **Adicionar evento**. O tipo começa em Evento. Amostra: célula azul (letivo) + quadradinho verde. O texto lembra que, no sábado, o Evento já torna o dia aula. Troca para Férias: célula sem fundo e um quadradinho. Troca para Sábado letivo: célula azul + quadradinho do sábado letivo, e o texto lembra que só vale sábado.

Celular: a ajuda fica abaixo do tipo (ou das datas, no período), sem esconder o botão Salvar. Computador: igual.

## Telas

**Amostra**
- Mini célula (mesmo desenho do mês: número em cima, marcas embaixo), só ilustração, não clicável.
- `aria-hidden` na amostra; o texto ao lado é o que o leitor de tela lê.

**Novo período / Editar período**
Texto fixo, abaixo do campo Fim:

> Pinta o **fundo** de segunda a sexta na cor desta etapa. Sábado vira aula se você lançar um evento nesse dia. Domingo fica sem fundo.

Amostra: fundo na cor do letivo da etapa (se já existir; no período novo, a próxima cor que o sistema vai gerar — a mesma lógica de `adicionarPeriodo`).

**Adicionar feriado ou recesso**
Abaixo do campo Tipo, atualiza ao trocar:

| Tipo | Texto | Amostra |
|---|---|---|
| Feriado | Pinta o **fundo** do dia. Esse dia deixa de ser letivo. | Fundo na cor de Feriado |
| Recesso | Pinta o **fundo** do dia (cor do recesso). Esse dia deixa de ser letivo. | Fundo na cor de Recesso |

**Novo evento / Editar evento**
Abaixo do campo Tipo, atualiza ao trocar:

| Tipo | Texto | Amostra |
|---|---|---|
| Férias | Não pinta o fundo. Aparece um **quadradinho** no dia. Se o dia era letivo, deixa de ser. | Fundo vazio + marca Férias |
| Exames finais | Não pinta o fundo. Aparece um **quadradinho** no dia. Se o dia era letivo, deixa de ser. | Fundo vazio + marca Exames |
| Recuperação | Não pinta o fundo. Aparece um **quadradinho** no dia. Se o dia era letivo, deixa de ser. | Fundo vazio + marca Recuperação |
| Sábado letivo | Só em **sábado**. Fundo da etapa (se o sábado estiver no período) e um **quadradinho**. | Fundo letivo + marca Sábado letivo |
| Evento | Aparece um **quadradinho**. Em dia letivo o fundo azul **continua**. Em **sábado**, o dia vira aula (fundo da etapa, se estiver no período). | Fundo letivo + marca Evento |

Cores da amostra: as cores atuais do calendário (`tiposDia`), não um desenho inventado.

## Regras
Pintura: `docs/DOMINIO.md` e spec 06. Esta spec **não** muda `pinturaDoDia`. Só explica.

O select de tipo no evento e no feriado passa a ser controlado o bastante para a ajuda acompanhar a escolha (valor inicial = o `defaultValue` de hoje).

Textos em `src/dominio` (função pura, com testes), para a tela só mostrar. Sem React no domínio.

JSON do rascunho continua versão **1**.

## Dados
Nenhum campo novo no calendário.

```ts
ajudaPintura(tipoId: string): { texto: string; fundo: 'letivo' | 'feriado' | 'recesso' | null; marca: boolean }
```

`fundo` diz qual cor usar na amostra (`null` = célula vazia). `marca` diz se desenha o quadradinho na cor do tipo.

A amostra segue o rádio **Permite / Não permite combinar com dia letivo** do tipo (e a cor atual). Em **Tipos de marcação** e em **Criar tipo**, a célula muda na hora. Feriado e recesso continuam pintando o próprio fundo.

Período não usa `tipoId` de evento: texto e amostra de letivo ficam na tela, com a cor do tipo letivo daquele período.

## Casos de erro e mensagens
Nenhum erro novo. Tipo desconhecido: sem ajuda (não acontece nos formulários atuais).

## Critérios de aceite
1. Formulário de período 2026 mostra o texto de segunda a sexta e uma amostra com fundo azul (primeira cor letivo).
2. Formulário de feriado: tipo Feriado → texto de fundo + amostra `#c53030`. Trocar para Recesso → texto de recesso + amostra `#dd6b20`.
3. Formulário de evento: Evento → fundo letivo + marca `#38a169` e texto de sábado. Férias → texto de quadradinho que tira letivo + amostra sem fundo e marca `#319795`. Sábado letivo → texto “só em sábado” + fundo letivo + marca `#0e7490`.
4. `ajudaPintura('tipo-recesso').fundo === 'recesso'` e `.marca === false`. `ajudaPintura('tipo-evento').fundo === 'letivo'`. `ajudaPintura('tipo-feriado').fundo === 'feriado'` e `.marca === false`.
5. Celular 360 px: ajuda visível, Salvar ≥ 44 px, sem rolagem lateral.
6. `src/dominio` sem React/DOM. `npm test` cobre o item 4.

## Fora do escopo
- Mudar a pintura do mês.
- Reposição (ainda não lança).
- Tutorial, modal ou página de ajuda.
- Preview ao vivo do intervalo inteiro no ano (só a célula-exemplo).

## Como testar (depois de programar)
1. `npm test`.
2. `npm run dev`: Novo período — ler a ajuda. Novo evento — trocar o tipo e ver texto e amostra mudarem. Feriado vs recesso.
3. Estreitar a 360 px.
