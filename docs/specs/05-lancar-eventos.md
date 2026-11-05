# Spec: lançar eventos (data e intervalo)

> Fase 3. Status: **implementada** (2026-11-05).
>
> Termos em uma frase: **evento** = uma data ou um intervalo com tipo e nome (recesso, férias, exames…); **arrastar** = clicar num dia, manter pressionado e soltar noutro para marcar vários dias de uma vez.

## Objetivo
O elaborador lança recesso, férias, exames, recuperação e eventos acadêmicos no calendário, num dia ou em vários, sem repetir a data. Dá para fazer pela lista ou pelo próprio mês (clique e arraste).

**Quem usa:** quem monta o calendário.

Sábado letivo entra como tipo de evento. Reposição de aula (ligar a um dia da semana original) fica para a spec de conflitos. Tabela, PDF, Excel e avisos de conflito visual ficam para fases seguintes.

## Jornada
1. Calendário 2026, período 02/02–30/04 já existe. Abre o bloco **Eventos**. **Adicionar evento**: tipo Recesso, nome “Recesso escolar”, 15/06 a 30/06. Junho pinta laranja nesses dias (sábado e domingo inclusive). Dias letivos do período **não** aparecem por baixo do recesso.
2. Clica em 10/03 (terça letiva): o painel do dia lista o letivo. **Adicionar neste dia**: tipo Evento, nome “Semana de acolhimento”. O 10/03 parte ao meio (evento | letivo) se o evento convive com aula. Fecha.
3. No computador, clica em 01/07, arrasta até 31/07, solta. O formulário abre com início 01/07 e fim 31/07. Tipo Férias, nome “Férias docentes”. Julho pinta férias.
4. No celular: toca um dia, usa **Adicionar neste dia**; para vários dias, preenche início e fim no formulário (sem arrastar).
5. Na lista **Eventos**: editar nome ou datas; apagar com confirmação. A grade e a legenda acompanham.

## Telas

**Bloco Eventos** (colapsável, como Períodos; depois de Feriados)
- Resumo fechado: “Nenhum evento ainda” ou os nomes (ex.: “Recesso escolar, Férias docentes”).
- Lista: data ou intervalo em DD/MM/AAAA, nome, tipo. **Editar** e **Apagar**.
- **Adicionar evento** dentro do bloco (some enquanto o form está aberto). Ação principal do form: **Salvar evento**.
- Feriados e recessos continuam no bloco deles. Este bloco não lista feriado nem recesso.

**Formulário (o mesmo no bloco, no painel do dia e ao soltar o arraste)**
- Tipo: Férias, Exames finais, Recuperação, Sábado letivo, Evento. Sem Dia letivo de segunda a sexta (isso vem do período). Sem Feriado/Recesso (bloco de feriados e recessos, spec 08). Sem Reposição nesta fase.
- Nome (descrição).
- Início e Fim, formato DD/MM/AAAA + mini calendário. Fim vazio = só o início (um dia).
- **Salvar evento** / **Cancelar**. Na edição, também **Apagar**.

**Clique no dia**
- Clique sem arrastar: painel do dia (como hoje), com a lista, **Adicionar evento** e **Adicionar feriado ou recesso**.
- **Fechar** continua a ação principal do painel de leitura.

**Arrastar (computador)**
- Pressiona um dia do ano (não o “fora do mês”), move para outro dia, solta.
- Enquanto arrasta: os dias do intervalo (do menor ISO ao maior, inclusive) ganham borda da cor da marca. Pode atravessar meses se o ponteiro passar por eles.
- Soltar abre a escolha: **Adicionar evento** ou **Adicionar feriado ou recesso**, com início e fim preenchidos. Esc ou soltar no mesmo ponto sem movimento cancela o arraste e vira clique (abre o painel).
- Distinguir clique de arraste: movimento maior que uns 4 px.
- Celular: arraste **desligado**. Intervalo só pelo form.

Uma ação principal da tela do ano continua **Adicionar período** quando o bloco Períodos está aberto; no bloco Eventos, **Adicionar evento** / **Salvar evento**.

## Regras
Ver `docs/DOMINIO.md`. Cálculo em `src/dominio`, com testes. Sem React/DOM nesse módulo. Sem internet.

- Evento tem `inicio` e `fim` (ISO). Um dia: `inicio === fim`.
- `inicio` ≤ `fim`. As duas datas no ano do calendário.
- Origem `manual`.
- Intervalo pinta **todos** os dias de início a fim, inclusive sábado e domingo, **exceto Sábado letivo**: início e fim precisam ser sábado; no intervalo, só os sábados ganham a cor.
- **Não são letivos** (como feriado): Recesso, Férias, Exames finais, Recuperação. Se o dia está num período, o azul letivo **não** entra na pintura nem na lista do dia.
- **Sábado letivo** só pode ser lançado em sábado (início e fim). Conta como dia de aula. Some se o sábado for feriado, recesso, férias, exames ou recuperação. Pintura: spec 06 (fundo letivo da etapa + marca). No formulário, o tipo some da lista se as datas preenchidas não forem sábado.
- **Evento** (tipo Evento) pode coexistir com letivo: fundo letivo + marca do Evento (spec 06). Se o Evento cobre um **sábado**, aquele sábado **vira aula** (conta e pinta como letivo), sem precisar do tipo Sábado letivo. Domingo com Evento ganha marca e **não** vira aula. Férias, exames e recuperação no sábado não viram aula.
- Prioridade dos tipos: feriado → recesso → férias → exames → reposição → evento → sábado letivo → dia letivo.
- Recesso (pelo bloco de feriados), férias, exames, recuperação e sábado letivo: dois do **mesmo tipo** que se cruzam dão erro. Tipo **Evento** pode repetir no mesmo dia (vários nomes). Tipos diferentes no mesmo dia: permitido (marcas na célula, spec 06).
- Apagar: confirmação “Apagar {nome} ({datas})?”
- Formato do rascunho continua **1**. O campo `eventos` já existe.

Funções novas no domínio:

```ts
adicionarEvento(calendario, { tipoId, descricao, inicio, fim })
atualizarEvento(calendario, id, { tipoId, descricao, inicio, fim })
```

`apagarEvento` já existe. `tiposDoDia` / `pinturaDoDia` passam a omitir letivo também quando o dia tem recesso, férias, exames ou recuperação.

## Dados
Sem campo novo no calendário. Evento: `{ id, tipoId, inicio, fim, descricao, origem }`.

Tipos usáveis nesta spec (já cadastrados no calendário novo): `tipo-ferias`, `tipo-exames`, `tipo-recuperacao`, `tipo-sabado-letivo`, `tipo-evento`. Recesso sai deste bloco (spec 08).

## Casos de erro e mensagens
| Situação | Mensagem |
|---|---|
| Nome vazio | “Escreva o nome do evento.” |
| Início vazio | “Informe o início.” |
| Fim antes do início | “O fim não pode ser antes do início.” |
| Data fora do ano | “Use uma data de {ano}.” |
| Tipo não permitido | “Escolha o tipo do evento.” |
| Cruza outro evento do mesmo tipo | “Este intervalo cruza com {nome} ({início} a {fim}). Ajuste as datas.” |
| Sábado letivo em dia que não é sábado | “Sábado letivo só pode cair em sábado.” |

Datas nas mensagens em DD/MM/AAAA.

## Critérios de aceite
1. 2026, período 02/02–30/04: recesso 15/06–30/06 (bloco de feriados, spec 08) cobre esses dias (incluindo 20/06 sábado e 21/06 domingo). `pinturaDoDia` em 20/06: fundo Recesso.
2. Feriado manual em 16/02 (Carnaval já é recesso): fundo Feriado, marca Recesso; **sem** letivo.
3. Evento “Acolhimento” em 10/03/2026 (terça no período): fundo Dia letivo — 1ª Etapa, marca Evento.
4. Férias 01/07–31/07: 01/07 só Férias; letivo não entra.
5. Dois recessos que se cruzam: recusa com a mensagem de cruzamento.
6. Arrastar 01/07 a 03/07 no computador abre o form com essas datas; salvar férias pinta os três dias.
7. Clique sem arrastar abre o painel do dia, não o form.
8. Celular 360 px: sem depender de arraste; Adicionar neste dia e campos de data ≥ 44 px; sem rolagem lateral.
9. `src/dominio` sem React/DOM. `npm test` cobre os itens 1–5 e 11.
10. Nenhuma chamada de rede.
11. Sábado letivo 07/03–14/03/2026: 07/03 e 14/03 fundo letivo da etapa + marca Sábado letivo; 06/03 continua letivo de sexta; 08/03 domingo vazio. Feriado no sábado some o sábado letivo. Terça 10/03 ou intervalo 01/03–15/03 recusam com “Sábado letivo só pode cair em sábado.”
12. Evento “Sábado de acolhimento” em 07/03/2026: fundo letivo da etapa + marca Evento; o dia conta como aula. Evento 06/03–08/03: sexta e sábado letivos, domingo só marca.

## Fora do escopo
- Reposição ligada a uma data original.
- Exclusivo sim/não e borda de conflito (Fase 4).
- Conta dos 200 dias e itens de conferência.
- Tabela, PDF, Excel, `.json` baixar/abrir.
- Criar tipo de marcação novo além dos padrão.
- Arraste no celular.

## Como testar (depois de programar)
1. `npm test`.
2. `npm run dev`: período 02/02–30/04; adicionar recesso 15/06–30/06 pelo bloco; ver junho.
3. Clicar 10/03 → Adicionar neste dia → Evento; ver fundo letivo + marca verde.
4. No computador, arrastar três dias em julho → Férias → conferir as datas no form.
5. Estreitar a 360 px e lançar um evento de um dia pelo painel.
