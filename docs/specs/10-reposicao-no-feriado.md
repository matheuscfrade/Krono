# Spec: reposição no feriado e no recesso

> Fase 4. Status: **implementada** (2026-11-05).
>
> Substitui o bloco **Dias letivos** da spec 09 na tela. Reposição como tipo, pintura e `retirarLetivo` no domínio **continuam**.
>
> Termos em uma frase: **aula perdida** = dia que seria aula e feriado ou recesso tirou; **Repor** só aparece se o ano ainda não chegou ao mínimo de letivos.

## Objetivo
O Krono pede reposição só quando o feriado ou o recesso **tirou aula de verdade** e o calendário **ainda não fecha o mínimo** (200, ou o número deste calendário). O pedido vive na lista de **Feriados e recessos**, não num bloco à parte.

**Quem usa:** quem elabora o calendário.

## Jornada
1. Calendário 2026, etapa 02/02–30/04 (total de letivos bem abaixo de 200).
2. Bloco **Feriados e recessos**: 01/01 (Confraternização) **sem** Repor (fora do período). Sexta-feira Santa 03/04 **com** Repor (sexta no período).
3. **Repor** na linha da Sexta-feira Santa. Diálogo de evento, tipo Reposição, data original 03/04, nome sugerido. A pessoa põe 11/04. Salva.
4. 11/04 pinta fundo da etapa + marca Reposição e conta como aula. Na linha da Sexta-feira Santa o Repor some (aquela original já foi reposta).
5. Recesso 15/06–30/06: sem período em junho → sem Repor. Se houver etapa cobrindo junho e o total ainda for &lt; 200, a linha do recesso ganha Repor; cada toque usa o **próximo** dia útil perdido ainda sem reposição.
6. Quando o total chega ao mínimo (mais períodos, sábados letivos ou reposições), **nenhuma** linha mostra Repor, mesmo com feriado no período sem reposição.
7. Continua dando para lançar Reposição pelo bloco Eventos.

Celular e computador: a mesma lista; Repor ao lado de Editar e Apagar.

## Telas

**Some o bloco Dias letivos** (aulas a repor, excesso, retirar dia, dias retirados). Excesso e retirada voltam na spec de regras (Fase 4). `retirarLetivo` permanece no domínio, sem botão nesta spec.

**Bloco Feriados e recessos** (já existe)
- Lista igual: data ou intervalo, nome, tipo, origem; **Editar** e **Apagar**.
- **Adicionar feriado ou recesso** continua.
- Se `aulasARepor` tiver item daquele evento e `totalDiasLetivos < minimo`: botão **Repor** na linha (44 px).
- Intervalo com vários dias perdidos: um **Repor** só. Abre o form com a primeira `dataOriginal` pendente (ordem cronológica). Depois de salvar, se ainda faltar letivo e ainda houver original daquele evento, o botão permanece.
- Resumo do bloco: além da conta de datas, “N aulas a repor” quando houver pendência.
- Se houver aula a repor, o bloco abre (como o antigo Dias letivos). Senão, fica como o usuário deixou (padrão fechado).

**Diálogo Repor** = o form de evento tipo Reposição da spec 09 (data original preenchida, nome sugerido, um dia só, ajuda de pintura). Esc e Cancelar fecham.

Sem botão **Não repor**.

## Regras
Ver `docs/DOMINIO.md`. Cálculo em `src/dominio`. Sem React/DOM. Sem internet.

### Aula perdida
Um ISO `D` é aula perdida quando:
1. Sem o feriado/recesso, **seria dia de aula**: segunda a sexta dentro de um período, ou sábado coberto por Evento ou sábado letivo;
2. Há feriado ou recesso cobrindo `D`;
3. Não há férias, exames, recuperação nem retirada em `D` (esses já tiram a aula por outro motivo);
4. Ainda não existe reposição com `dataOriginal === D`.

Vale **um dia ou intervalo**. Cada dia do intervalo entra sozinho. Domingo nunca. Feriado em sábado sem Evento nem sábado letivo: não era aula, não pede.

### Quando mostrar Repor
- Só se `totalDiasLetivos(calendario) < (minimoDiasLetivos ?? 200)`.
- Só nas linhas cujo evento tem pelo menos uma aula perdida ainda sem reposição.
- Se o total já é ≥ mínimo: `aulasARepor` devolve lista vazia. 01/01 fora do período nunca entra.

Aviso, não erro: dá para seguir sem repor. O aviso de “faltam N no ano” continua sendo a spec de regras (conflito 7).

### O que não muda (spec 09)
- Tipo Reposição, um dia novo + uma original, nome sugerido, pintura, erros e aviso de mesmo dia da semana.
- Duas reposições da mesma original recusam; duas no mesmo dia novo recusam.
- `minimoDiasLetivos` padrão 200; exames fora da conta no total.
- JSON versão **1**. Nenhum campo novo.

### O que sai da tela
- Bloco Dias letivos.
- Botão Retirar dia e lista Dias retirados.
- Pedido de reposição para feriado em dia útil **fora** do período.

## Dados
```ts
aulasARepor(calendario): { dataOriginal: string; descricao: string; eventoId: string }[]
// vazio se total >= minimo
// senão, aulas perdidas ainda sem reposição, uma entrada por ISO, ordem cronológica
```

Na UI, agrupa por `eventoId`: a linha do evento mostra Repor se existir alguma entrada daquele id.

## Casos de erro e mensagens
Os da spec 09 no diálogo de reposição. Nada novo.

## Critérios de aceite
1. 2026, etapa 02/02–30/04: `aulasARepor` contém 03/04 (Sexta-feira Santa) e **não** contém 01/01. Recesso 15/06–30/06 **não** entra (fora do período).
2. Mesmo calendário + etapa 01/06–31/07: o recesso 15/06–30/06 entra **cada dia útil** do intervalo que cai no período (15/06/2026 é segunda → entra; 20/06/2026 sábado sem sábado letivo → não entra; 21/06 domingo → não entra).
3. Com `minimoDiasLetivos: 10` e só a etapa 02/02–30/04 (total &gt; 10): `aulasARepor` é `[]`, inclusive 03/04.
4. Repor 03/04 em 11/04: 03/04 sai de `aulasARepor`; 11/04 entra no total. Se ainda `total < minimo` e o evento tiver outra original, Repor permanece nesse evento.
5. Sem período: `aulasARepor` é `[]` (nada seria aula).
6. Feriado em sábado 04/04/2026 sem Evento nem sábado letivo: não entra. Com Evento ou sábado letivo cobrindo 04/04: entra, se total &lt; mínimo.
7. A tela não tem o bloco “Dias letivos”. A linha da Sexta-feira Santa tem Repor; a de 01/01 não. 360 px: Repor, Editar, Apagar e Salvar ≥ 44 px.
8. `npm test` cobre 1–6. Nenhuma chamada de rede. `src/dominio` sem React/DOM.

## Fora do escopo
- Botão Não repor.
- Escolher sozinho o sábado da reposição.
- Tela para editar o mínimo; excesso e retirar dia (spec de regras).
- Uma cor por dia da semana na reposição.
- Marca de conflito no quadradinho do feriado.
- Desequilíbrio por dia da semana.

## Como testar (depois de programar)
1. `npm test`.
2. `npm run dev`: 2026, etapa 02/02–30/04. Em Feriados e recessos, Repor só em datas do período (Sexta Santa, Carnaval, Cinzas, Tiradentes…). 01/01 e Natal sem Repor. Repor 03/04 em 11/04.
3. Estreitar a 360 px.
