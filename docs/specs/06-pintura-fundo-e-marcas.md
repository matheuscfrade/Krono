# Spec: pintura do dia (fundo e marcas)

> Fase 3. Status: **implementada** (2026-11-05). Pintura de fundo atualizada pela spec 08: feriado; senão **recesso**; senão letivo. Ponto facultativo saiu.
>
> Termos em uma frase: **fundo** = cor que preenche o quadrado do dia (letivo, feriado ou recesso); **marca** = quadradinho de um evento que não é o fundo.

Substitui o quadrado partido da spec 04 na célula do mês. `tiposDoDia` continua listando tudo o que cai no dia.

## Objetivo
O elaborador lê o mês de relance pela cor de fundo (aula, feriado ou recesso) e vê os outros lançamentos como quadradinhos no mesmo dia, cada um com a cor do tipo.

**Quem usa:** quem monta o calendário.

## Jornada
1. Calendário 2026, período 1ª Etapa 02/02–30/04.
2. 02/02 (segunda): fundo azul letivo, sem marca.
3. 16/02 (Carnaval): fundo Recesso, sem letivo, sem marca extra.
4. 01/01: fundo feriado.
5. Lança Evento “Acolhimento” em 10/03: fundo letivo + um quadradinho verde.
6. Lança Sábado letivo 07/03–14/03: 07/03 e 14/03 com fundo azul da etapa + quadradinho de sábado letivo. 06/03 continua só letivo. 08/03 domingo vazio.
7. Recesso 15/06–30/06: fundo laranja (também no sábado e no domingo).
8. Cinco Eventos no mesmo dia letivo: quatro quadradinhos e um **+**. Passar o mouse (computador) mostra todos, cada um com a cor. Tocar o dia abre o painel com a lista completa.

Celular: toque abre o painel; sem depender de hover. Computador: hover mostra a dica colorida; clique abre o painel.

## Telas

**Célula do dia**
- Número em cima; marcas embaixo, da esquerda para a direita.
- Fundo no máximo um: feriado; senão recesso; senão dia letivo do período.
- Cada evento que não é o fundo vira um quadradinho na cor do tipo.
- Até 4 marcas. Se houver mais, o quinto lugar é **+**.
- Texto do número: `corTextoSobre` quando há fundo; cor de texto normal quando o fundo está vazio.
- Dia clicável (botão). Fora do mês: não clicável.

**Dica (hover no computador)**
- Lista fundo e todas as marcas, cada linha com quadradinho da cor + `tipo — descrição` (ou só o nome do tipo, se for letivo sem evento).
- Inclui os que não cabem na célula.
- Teclado: `aria-label` com o mesmo conteúdo em texto.

**Painel do dia**
- Continua listando todos os tipos e eventos do dia, com amostra de cor. Sem mudança de ações (Adicionar evento, Adicionar feriado ou recesso, Fechar).

## Regras
Ver `docs/DOMINIO.md` (Cores no dia). Cálculo em `src/dominio`. JSON do rascunho continua versão **1**.

**Fundo (nessa ordem, o primeiro que existir)**
1. Feriado
2. Recesso
3. Dia letivo do período

Feriado e recesso **não** pintam letivo por baixo. Férias, exames e recuperação tiram o letivo: o fundo fica vazio e esses tipos viram marca.

**Sábado letivo**
- Um **Evento** (tipo Evento) que cobre o sábado já torna o dia aula: fundo da etapa (se estiver no período) + marca do Evento.
- O tipo Sábado letivo continua: no intervalo, só os sábados entram.
- Some se o sábado for feriado, recesso, férias, exames ou recuperação.
- Se o sábado está **dentro do período** e vale (Evento ou tipo Sábado letivo): o dia ganha **fundo de dia letivo daquele período** e **marca** do lançamento.
- Fora de período: sem fundo de etapa, só a marca; o sábado com Evento ainda conta como aula.

**Marcas**
- Um quadradinho por evento, não por tipo. Dois Eventos no mesmo dia = duas marcas, mesmo da mesma cor.
- Evento cujo tipo é o fundo **não** vira marca (o feriado que pintou o fundo não ganha quadradinho extra). Recesso no mesmo dia de feriado **vira** marca (o fundo já é feriado).
- Dia letivo do período não é evento: nunca vira marca.
- Ordem: prioridade do tipo (`DOMINIO.md`), depois ordem de lançamento.
- `haMais` verdadeiro se houver mais de 4 marcas.

**Prioridade dos tipos (marca e lista):** feriado → recesso → férias → exames → reposição → evento → sábado letivo → dia letivo.

## Dados
Sem campo novo no calendário. Função no domínio:

```ts
LIMITE_MARCAS_DIA = 4

pinturaDoDia(calendario, iso): {
  fundo: TipoDia | null
  marcas: { evento: Evento, tipo: TipoDia }[]
  haMais: boolean
}
```

`tiposDoDia` passa a incluir o dia letivo do período no sábado que tem Evento ou sábado letivo (e não tem tipo que tira letivo).

## Casos de erro e mensagens
Nenhum erro novo. Dia sem tipo: célula vazia; painel “Nada lançado neste dia.”

## Critérios de aceite
1. 2026, período 1ª Etapa 02/02–30/04: 16/02 fundo Recesso, `marcas` vazia, `haMais` falso, sem letivo. 02/02 fundo letivo, sem marca. 01/01 fundo feriado. 01/02 domingo sem fundo.
2. 25/12/2026 com período em dezembro: fundo só feriado, sem letivo.
3. Feriado manual em 16/02 (Carnaval já é recesso): fundo Feriado; marca Recesso; sem letivo; `haMais` falso.
4. Evento “Acolhimento” em 10/03/2026: fundo Dia letivo — 1ª Etapa; uma marca Evento / Acolhimento.
5. Dois Eventos no mesmo 10/03: duas marcas (Acolhimento e Palestra); fundo letivo.
6. Recesso 15/06–30/06: 20/06 (sábado) e 16/06 (terça) fundo vazio, uma marca Recesso.
7. Sábado letivo 07/03–14/03: 07/03 e 14/03 fundo Dia letivo — 1ª Etapa e uma marca Sábado letivo. 06/03 só letivo. 08/03 sem fundo. Feriado em 07/03: fundo feriado, sem marca de sábado letivo, sem letivo. Evento em 07/03: mesmo fundo letivo da etapa + marca Evento.
8. Cinco Eventos no mesmo dia letivo: `marcas.length === 5`, `haMais` verdadeiro. A célula mostra 4 quadradinhos e **+**.
9. Hover (computador) lista todas as marcas com a cor. Painel do dia lista o mesmo.
10. `src/dominio` sem React/DOM. `npm test` cobre 1–8. Nenhuma chamada de rede.

## Fora do escopo
- Marca visual de conflito (Fase 4).
- PDF/Excel (usam a mesma lista depois).
- Mudar tamanho mínimo da célula.
- Arraste e formulários de evento (já na spec 05).

## Como testar (depois de programar)
1. `npm test`.
2. `npm run dev`: etapa 02/02–30/04; 16/02 laranja de recesso; 10/03 azul + evento verde; sábado letivo 07/03–14/03 e olhar 07/03 azul + marca.
3. Recesso em junho: células sem azul, com quadradinho laranja.
4. Estreitar a 360 px: marcas visíveis, toque abre o painel.
