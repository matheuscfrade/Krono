# Spec: reposição e retirada de letivo

> Fase 3/4. Status: **implementada** (2026-11-05). O bloco **Dias letivos** e o critério de aulas a repor na tela passam à spec 10.
>
> Termos em uma frase: **reposição** = um dia novo de aula no lugar de uma data perdida; **retirada** = um dia deixa de ser aula quando o ano passa do mínimo; o Krono avisa os dois.

## Objetivo
Quem monta o calendário (1) devolve a aula de um feriado em dia útil e (2) tira aula quando o ano passa de 200 (ou do mínimo deste calendário). O dia retirado **só perde o letivo**: fica em branco, sem virar recesso e sem cor nova.

**Quem usa:** quem elabora o calendário.

## Jornada
1. Calendário 2026, etapa 02/02–30/04. 03/04 é Sexta-feira Santa (feriado, sexta).
2. Bloco **Dias letivos**: em **Aulas a repor**, “Sexta-feira 03/04/2026 — Sexta-feira Santa”. **Repor**.
3. Form: tipo Reposição; data original 03/04 já preenchida; nome “Reposição de aula de sexta-feira (03/04/2026)”. A pessoa põe o dia novo, ex. sábado 11/04. Amostra: fundo da etapa + quadradinho de reposição.
4. 11/04 pinta fundo letivo da etapa + marca Reposição; conta como aula. O aviso de 03/04 some.
5. Se o ano passar do mínimo: no mesmo bloco, **Há N dias letivos a mais** (mínimo 200, hoje X). **Retirar dia**. A pessoa escolhe um dia que hoje é aula. Esse dia fica em branco e sai da conta. A lista **Dias retirados** permite desfazer (Apagar).
6. Pelo bloco Eventos dá para lançar Reposição sem passar pelo aviso.

Celular: o bloco Dias letivos fica acima dos meses. Computador: igual.

## Telas

**Bloco Dias letivos** (colapsável; aberto se houver repor, excesso ou dia retirado)
- **Aulas a repor:** dia da semana + data original + nome do feriado/recesso. **Repor**.
- **Excesso:** se `totalLetivos > minimo`, texto “Há N dias letivos a mais (mínimo {minimo}, hoje {total})”. **Retirar dia**.
- **Dias retirados:** data. **Apagar** (o letivo volta se o dia estiver no período ou tiver reposição/sábado letivo).
- Sem item: o bloco some.

**Repor** abre o form de evento, tipo Reposição, data original preenchida; início vazio.

**Retirar dia** abre um form curto: uma data (DD/MM/AAAA + mini calendário). Ação principal **Retirar**. Ajuda: “Tira o fundo de aula. O dia fica em branco.” Sem tipo Recesso, sem marca.

**Formulário de evento** (tipo Reposição)
- Tipo Reposição na lista do Adicionar evento.
- **Data da aula original** (obrigatória).
- Nome preenchido sozinho; a pessoa pode editar.
- Início e fim: **um dia só**.
- Ajuda (spec 07): fundo da etapa + quadradinho de Reposição. O dia vira aula. Só em dia que ainda não é letivo e não é feriado nem recesso.

**Painel do dia / arraste:** Reposição no Adicionar evento, com o campo extra. Retirada só pelo bloco (um dia que já é aula).

## Regras
Ver `docs/DOMINIO.md` (reposição ligada à data original; conflitos 5, 6 e 7). Cálculo em `src/dominio`. Sem React/DOM. Sem internet.

### Reposição
- Tipo `tipo-reposicao` lançável (`TIPOS_EVENTO`). Cor `#d69e2e`.
- Um lançamento = **um dia novo** + **uma data original**.
- Nome sugerido: `Reposição de aula de {sexta-feira} ({03/04/2026})`.
- O dia novo **é letivo** (sábado inclusive), sem sábado letivo à parte.
- Feriado, recesso e domingo recusam. Dia já letivo: spec 18 (salva com aviso, não soma).
- Pintura: fundo da etapa (do dia novo ou da aula original) + marca Reposição. Some se o dia for feriado, recesso, férias, exames, recuperação ou **retirada**.
- **Erro:** dia novo já letivo; feriado/recesso/férias/exames/recuperação/retirada/domingo; sem data original; fim ≠ início; original fora do ano.
- **Aviso** ao salvar: dia novo no mesmo dia da semana da original.
- Duas reposições no mesmo dia novo recusam. Duas da mesma original recusam.

### Aulas a repor (aviso)
- Feriado em segunda a sexta ainda sem reposição dessa data.
- Recesso de **um dia só** em segunda a sexta (Cinzas, Corpus, cada dia de Carnaval).
- Recesso ou férias em intervalo **não** entram dia a dia.
- Aviso: dá para seguir sem repor.

### Retirada de letivo
- O dia **deixa de ser letivo** e **não ganha tipo visível**: fundo vazio, sem marca, sem recesso.
- Só em dia que hoje **é** letivo (segunda a sexta no período, sábado letivo ou reposição).
- **Erro** se o dia já não é letivo, se é domingo, ou se já está retirado.
- Um dia só por lançamento.
- Entra em `TIPOS_SEM_LETIVO` (tira o azul e o sábado letivo/reposição da pintura).
- Não entra na legenda de cores (não há cor).
- No painel do dia: texto “Letivo retirado”, ação Apagar.

### Conta e excesso
- `totalDiasLetivos`: dias do ano em que há aula (segunda a sexta no período, ou sábado com Evento/sábado letivo, ou reposição), menos feriado, recesso, férias, exames, recuperação e retirada. Exames fora da conta **já nesta spec** (regra padrão do DOMÍNIO, ligada).
- `minimoDiasLetivos` no calendário, padrão **200**. Sem tela de editar o número nesta spec.
- Se `total > minimo`: aviso de excesso com N = total − minimo. **Retirar dia** até N chegar a 0 (ou a pessoa ignora).
- Aviso, não erro.

JSON versão **1**. Campos novos opcionais: `Evento.dataOriginal`; `Evento` de retirada (`tipo-retirada-letivo`); `Calendario.minimoDiasLetivos` (se faltar, 200). Arquivo antigo abre.

## Dados
```ts
Calendario.minimoDiasLetivos: number  // padrão 200
Evento.dataOriginal?: string          // ISO, só reposição
Evento.tipoId === 'tipo-retirada-letivo'

adicionarEvento(..., { tipoId: 'tipo-reposicao', dataOriginal, inicio, fim, descricao })
retirarLetivo(calendario, iso): Resultado<Calendario>
aulasARepor(calendario): { dataOriginal: string; descricao: string }[]
totalDiasLetivos(calendario): number
excessoDiasLetivos(calendario): number  // max(0, total − minimo)
```

`tipo-retirada-letivo` **não** entra em `TIPOS_EVENTO` (não aparece no select de Evento).

## Casos de erro e mensagens
| Situação | Mensagem |
|---|---|
| Sem data original | “Informe a data da aula original.” |
| Data original fora do ano | “Use uma data de {ano}.” |
| Dia novo / retirada vazia | “Informe o início.” |
| Fim ≠ início | “Reposição é um dia só.” / “Retire um dia só.” |
| Domingo (reposição ou retirada) | “Reposição não pode cair no domingo.” / “Escolha um dia de aula.” |
| Dia novo já letivo | “Reposição só pode cair em dia que ainda não é letivo.” |
| Dia novo feriado ou recesso | “Reposição não pode cair em feriado ou recesso.” |
| Já existe reposição neste dia | “Reposição só pode cair em dia que ainda não é letivo.” |
| Original já reposta | “Esta aula original já foi reposta em {data}.” |
| Mesmo dia da semana (aviso) | “Esta reposição cai no mesmo dia da semana da aula original.” |
| Retirada em dia que não é aula | “Este dia já não é letivo.” |
| Dia já retirado | “Este dia já foi retirado.” |

Datas em DD/MM/AAAA.

## Critérios de aceite
1. 2026, etapa 02/02–30/04: 03/04 em aulas a repor (“Sexta-feira Santa”). 01/01 também (feriado em dia útil). Recesso 15/06–30/06 **não** lista cada dia.
2. Repor 03/04 em 11/04/2026 (sábado): fundo Dia letivo — 1ª Etapa + marca Reposição; 03/04 sai da lista a repor; 11/04 entra em `totalDiasLetivos`.
3. Reposição sem `dataOriginal` recusa. Domingo 12/04 recusa. Feriado 21/04 recusa.
4. Reposição de 03/04 em 10/04/2026 (sexta, já letivo) recusa. Em 08/05/2026 (sexta fora do período): salva, aviso de mesmo dia da semana, fundo da etapa + marca.
5. Segunda reposição da original 03/04 recusa. Segunda no dia 11/04 recusa.
6. `ajudaPintura('tipo-reposicao').fundo === 'letivo'` e `.marca === true`.
7. Calendário com `minimoDiasLetivos: 10` e etapa que gera mais de 10 letivos: `excessoDiasLetivos > 0`. `retirarLetivo` num dia útil da etapa: `pinturaDoDia` fundo vazio, sem marca; total cai 1; excesso cai 1.
8. `retirarLetivo` em 01/01/2026 (feriado) recusa. Apagar a retirada devolve o azul da etapa.
9. `npm test` cobre 1–8. Nenhuma chamada de rede. `src/dominio` sem React/DOM.

## Fora do escopo
- Escolher sozinho o sábado da reposição ou o dia a retirar.
- Uma cor por dia da semana na reposição.
- Tipo “Sem aula” ou recesso no lugar da retirada.
- Tela para editar o mínimo e o interruptor de exames (spec de regras); o padrão 200 e exames fora da conta já valem no cálculo.
- Desequilíbrio por dia da semana (mais sextas que segundas).
- Marca de conflito no quadradinho do feriado (resto da Fase 4).
- `.json` baixar/abrir além dos campos novos opcionais.

## Como testar (depois de programar)
1. `npm test`.
2. `npm run dev`: 2026, etapa 02/02–30/04; repor 03/04 em 11/04. Para ver excesso, só com mínimo baixo nos testes (a tela ainda não edita 200).
3. Estreitar a 360 px: bloco, Repor, Retirar e Salvar ≥ 44 px.
