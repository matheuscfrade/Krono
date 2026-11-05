# Spec: cores e quadrado dividido

> Fase 2. Status: **implementada** (2026-11-05). Célula do mês: spec 06 + spec 08 (fundo feriado/recesso/letivo). Esta spec ficou no histórico do quadrado partido. A **célula do mês** passou a fundo + marcas na spec `06-pintura-fundo-e-marcas.md`. Paleta, troca de cor e `tiposDoDia` desta spec continuam valendo.
>
> Termos em uma frase: **tipo de marcação** = categoria com nome e cor; **quadrado dividido** = o dia partido ao meio quando há duas coisas; **paleta** = conjunto de cores que o Krono sugere.

## Objetivo
O elaborador vê no mês a cor de cada tipo, troca a cor se quiser, e quando um dia tem duas informações o quadrado parte ao meio (as duas cores). Se tiver mais, duas cores + um marcadinho.

**Quem usa:** quem monta o calendário.

Feriado e ponto facultativo **não** são dia letivo: o quadrado fica só na cor do feriado ou do ponto. O letivo não aparece por baixo. O quadrado partido vale quando dois **eventos** caem no mesmo dia (ex.: feriado e ponto facultativo).

## Jornada
1. Abre um calendário 2026 com período 02/02–30/04. 16/02 (Carnaval) é **só** ponto facultativo, sem azul letivo. 02/02 é só letivo. 01/01 é só feriado.
2. Abre **Tipos de marcação**. Vê cada tipo com a cor. Toca a cor, escolhe outra no seletor do navegador. A grade e a legenda mudam na hora.
3. Toca (ou Enter) num dia partido: um painel lista todos os tipos daquele dia, com nome e cor. Fecha com **Fechar**.
4. Dia com 3 tipos (ex.: feriado manual no mesmo dia de ponto + recesso): duas metades das duas prioridades maiores + ponto no canto (“há mais”). O painel lista os três. Sem letivo nesse dia.

Celular: o painel do dia ocupa a largura, botão Fechar ≥ 44 px. Computador: o mesmo painel abaixo do cabeçalho ou sobre o mês, sem ir para outra rota.

## Telas

**Calendário (muda o quadrado do dia)**
- 1 tipo: fundo inteiro na cor; número do dia com `corTextoSobre`.
- 2 tipos: duas metades **verticais**; esquerda = maior prioridade (`DOMINIO.md`). Número no centro; cor do texto pela metade esquerda.
- 3+: iguais às duas primeiras + marcadinho no canto superior direito (círculo 6 px, cor de texto). `title` e o painel listam todos.
- Dias clicáveis (botão): Enter/Espaço abre o painel. Fora do mês: não clicável.

**Painel do dia**
- Título: `{dia} de {mês} de {ano}`.
- Lista: amostra de cor + nome do tipo (+ “automático”/descrição do evento se houver).
- Ação principal: **Fechar**.
- Sem lançar evento ainda (Fase 3).

**Tipos de marcação**
- Bloco na tela do calendário, depois da legenda (ou antes dos meses, se a legenda já estiver embaixo).
- Cada tipo usado **ou padrão** (mesmo sem dia): nome, amostra, campo `input type="color"` + valor hex só leitura ao lado.
- Ação: mudar a cor. Sem apagar tipo padrão. Sem criar tipo extra (isso é eventos).
- Botão discreto **Voltar à cor sugerida** em tipo que a pessoa já trocou.

Uma ação principal da tela continua **Adicionar período** (ou Salvar período, se o form estiver aberto). Trocar cor não compete com isso.

## Regras
Ver `docs/DOMINIO.md` (Cores e Cores no dia). Cálculo em `src/dominio`.

**Prioridade (esquerda primeiro):** feriado → ponto facultativo → recesso → férias → exames → reposição → evento → dia letivo.

**O que conta num dia, nesta fase**
- Evento cujo intervalo cobre o dia (feriado, ponto, e no futuro os outros).
- Dia letivo de período (segunda a sexta), **só se** o dia não tiver feriado nem ponto facultativo.
- Sábado/domingo: só os eventos (feriado no sábado pinta; sem letivo).

**Cores estáveis (padrão, já usadas):**
- Feriado `#c53030`
- Ponto facultativo `#e53e3e`
- Recesso `#dd6b20`
- Férias `#319795`
- Exames finais `#6b46c1`
- Recuperação `#805ad5`
- Reposição `#d69e2e`
- Evento `#38a169`
- Letivos: ciclo `#2b6cb0`, `#2c5282`, `#3182ce`, `#2a4365`; do 5º período em diante, o módulo **gera** cor nova (matiz espaçado, brilho alternado) que não copie hex já usado.

**Cor gerada:** HSL, saturação ~55–65%, luminosidade alterna ~38% e ~52% para distinguir em cinza. Texto sobre a cor continua `corTextoSobre` (contraste AA).

**Troca manual:** grava `cor` no tipo e `corManual: true`. Geração posterior não sobrescreve. **Voltar à cor sugerida** tira `corManual` e recoloca o padrão ou a gerada.

Legenda: um item por tipo **que aparece em pelo menos um dia**, com quantidade de dias em que aquele tipo entra (um dia partido conta 1 para cada tipo presente).

## Dados
No tipo de marcação: `corManual?: boolean`. Versão do formato ainda **1**. Sem arquivo `.json`. Sem migração.

Função nova no domínio, com testes:

```ts
tiposDoDia(calendario, iso): TipoDia[]  // ordem de prioridade
pinturaDoDia(calendario, iso): { esq: TipoDia | null, dir: TipoDia | null, haMais: boolean }
```

`tipoDoDia` (um só) é o primeiro de `tiposDoDia`. Carnaval ou feriado em dia de período pinta **uma** cor (ponto ou feriado), sem letivo.

## Casos de erro e mensagens
| Situação | Mensagem |
|---|---|
| Hex inválido no futuro (se alguém colar) | “Use uma cor no formato #RRGGBB.” Nesta fase o seletor nativo evita o caso. |
| Dia sem tipo | painel: “Nada lançado neste dia.” |

Sem erro ao partir o quadrado.

## Critérios de aceite
1. 2026, período 1ª Etapa 02/02–30/04: `pinturaDoDia` em 16/02/2026 tem só Ponto facultativo (sem letivo), `haMais` falso. 02/02 só letivo. 01/01 só feriado. 01/02 (domingo) sem letivo; se não for evento, sem cor.
2. 25/12/2026 (sexta, Natal) com período que cubra dezembro: só feriado, sem letivo.
3. Três tipos no mesmo dia (teste de domínio com eventos manuais): `haMais` verdadeiro; esquerda e direita = os dois de maior prioridade.
4. Trocar a cor de Feriado no seletor atualiza janeiro/1 e a legenda, sem recarregar a página.
5. **Voltar à cor sugerida** devolve `#c53030` ao feriado.
6. 5º período letivo recebe cor gerada diferente das quatro azuis fixas (teste de domínio).
7. Dia é botão; Enter abre o painel com os nomes; Fechar devolve o foco ao dia.
8. Celular 360 px: meses empilhados, sem rolagem lateral; seletor de cor e Fechar ≥ 44 px de altura de alvo.
9. `src/dominio` sem React/DOM. `npm test` cobre os itens 1, 2, 3 e 6.
10. Nenhuma chamada de rede.

## Fora do escopo
- Lançar recesso, férias, exames, eventos genéricos (Fase 3) — o domínio já ordena esses tipos para quando existirem.
- Conflitos visuais (borda de erro).
- PDF/Excel, `.json`.
- Paleta nomeada além do hex. Daltonismo avançado (só brilho + legenda).

## Como testar (depois de programar)
1. `npm test`.
2. `npm run dev`: calendário 2026, etapa 02/02–30/04, olhar 16/02 só ponto facultativo e 1º/01 inteiro vermelho.
3. Tipos de marcação → mudar feriado para outra cor → ver 1º/01.
4. Clicar 16/02, ler só Carnaval (ponto facultativo), Fechar.
5. Estreitar a 360 px.
