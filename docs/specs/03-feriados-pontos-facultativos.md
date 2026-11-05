# Spec: feriados nacionais e pontos facultativos

> Fase 2. Status: **implementada** (2026-11-05). **Spec 08:** Carnaval, Cinzas e Corpus Christi passaram a ser Recesso; Ponto facultativo saiu da tela. O campo `pontosFacultativos` no JSON permanece. Carnaval 2027 = 08 e 09/02 (Páscoa 28/03 menos 48 e 47 dias).
>
> Termos em uma frase: **feriado** = data com lei; **ponto facultativo** = data em que a escola decide se dispensa; **automático** = o Krono colocou a partir do ano; **computus** = conta que acha o domingo de Páscoa.

## Objetivo
Ao informar o ano, o Krono preenche os feriados nacionais e os pontos facultativos no calendário, no próprio navegador. Carnaval, Cinzas e Corpus Christi entram na mesma lista dos feriados: dá para editar ou apagar cada data. Na troca de ano a pessoa escolhe se mantém as alterações.

**Quem usa:** quem elabora o calendário.

## Jornada
1. Novo calendário: preenche nome, instituição e ano. Sem lista de feriados nesta tela.
2. Criar calendário: esses dias já aparecem pintados nos 12 meses (feriado vermelho; ponto facultativo vermelho mais claro).
3. Se houver período, dia útil que também é feriado ou ponto facultativo pinta **só** com essa cor (não fica letivo). Quadrado dividido é a spec de cores.
4. Na tela do ano, bloco **Feriados e pontos facultativos**: lista com **Editar** e **Apagar** em cada data, e **Adicionar feriado**. Sem interruptores.
5. Apagar um ponto facultativo (ex.: um dia de Carnaval) tira só aquela data, como um feriado. “Voltar aos feriados padrão” na troca de ano recoloca os automáticos.
6. Mudar o ano (campo no cabeçalho): diálogo com o que muda e duas ações — **Manter minhas alterações** ou **Voltar aos feriados padrão**.
7. **Adicionar feriado** (manual): data no ano, nome, tipo Feriado ou Ponto facultativo. Fica origem manual. Municipal/estadual/campus entram por aqui.

Celular e computador: mesma sequência; lista empilha.

## Telas

**Novo calendário**
- Nome, instituição e ano. Sem lista de feriados nesta tela (eles aparecem no calendário depois de criar).
- Ação principal continua **Criar calendário**.

**Calendário**
- Cabeçalho ganha campo **Ano** (além de nome e instituição).
- Bloco **Feriados e pontos facultativos**: lista data, nome, tipo, origem (Automático / Manual); ações Editar e Apagar em cada um. Sem interruptores.
- **Adicionar feriado**: nome, data, tipo (Feriado | Ponto facultativo). Ação **Salvar**.
- Legenda passa a listar Feriado e Ponto facultativo quando houver dia.

**Diálogo trocar ano**
- Texto: “O ano passa de {atual} para {novo}. Os feriados automáticos serão recalculados.”
- Se houver edição ou exclusão de automático, listar em uma frase curta (ex.: “Você apagou o Natal; editou a Sexta-feira Santa.”).
- Botão principal: **Manter minhas alterações**. Secundário: **Voltar aos feriados padrão**. Terceiro: **Cancelar** (ano não muda).

## Regras
Ver `docs/DOMINIO.md`. Tudo no módulo `src/dominio`, com testes. Sem internet.

**Páscoa (computus gregoriano).** Testes obrigatórios:

| Ano | Páscoa | Carnaval (seg e ter) | Sexta-feira Santa | Corpus Christi |
|-----|--------|----------------------|-------------------|----------------|
| 2025 | 20/04 | 03/03 e 04/03 | 18/04 | 19/06 |
| 2026 | 05/04 | 16/02 e 17/02 | 03/04 | 04/06 |
| 2027 | 28/03 | 08/02 e 09/02 | 26/03 | 27/05 |

Carnaval = 48 e 47 dias antes da Páscoa; Cinzas = 46 dias antes; Sexta-feira Santa = 2 dias antes; Corpus Christi = 60 dias depois.

**Feriados nacionais fixos (todo ano do calendário):**
- 01/01 Confraternização Universal
- 21/04 Tiradentes
- 01/05 Dia do Trabalho
- 07/09 Independência
- 12/10 Nossa Senhora Aparecida
- 02/11 Finados
- 15/11 Proclamação da República
- 25/12 Natal

**Só a partir de 2024:** 20/11 Dia da Consciência Negra (lei nacional). Anos 1900–2023: não incluir.

**Pontos facultativos (entram na lista como os feriados, todos incluídos):**
- Carnaval (segunda e terça)
- Quarta-feira de Cinzas (descrição: “meio expediente”)
- Corpus Christi

Cada evento automático tem `chave` estável (`nacional:natal`, `nacional:consciencia-negra`, `movel:sexta-santa`, `facultativo:carnaval-segunda`, `facultativo:carnaval-terca`, `facultativo:cinzas`, `facultativo:corpus-christi`) para sobreviver à troca de ano.

**Sobreposição com período:** feriado e ponto facultativo vencem o dia letivo. Um dia = uma cor nesta spec.

**Editar automático:** a pessoa pode mudar nome e/ou data. Origem continua automática; marca `editado`. Na troca de ano com “manter”, o nome editado vai para a nova data daquela `chave`; se a **data** foi editada, o evento vira manual na data que a pessoa escolheu e o automático da `chave` no ano novo também é criado (padrão), a menos que ela tenha apagado a chave.

Regra mais simples, alinhada à entrevista (aviso e escolha):
- **Manter minhas alterações:** para cada `chave`, se apagou, continua sem esse automático; se só mudou o nome, o nome novo vai para a data nova do ano; se mudou a data, o item fica manual na data digitada **e** o automático da chave **não** é recriado (a pessoa já “desviou” aquele feriado).
- **Voltar aos feriados padrão:** descarta edições e exclusões de automáticos daquele conjunto; recria a lista padrão do ano novo; **eventos manuais** (municipais etc.) permanecem nas datas que a pessoa digitou.

**Apagar:** pede confirmação. Automático apagado entra numa lista de chaves excluídas (usada só em “manter”).

**Sem interruptor na tela.** Para não usar Carnaval, Cinzas ou Corpus Christi, a pessoa apaga a data na lista (confirmação igual à de feriado). O domínio ainda guarda `pontosFacultativos` no rascunho (todos `true` na criação) para não mudar o formato.

## Dados
Ainda sem arquivo `.json` baixado (Fase 5). Na memória da sessão, o calendário ganha:

- `pontosFacultativos`: `{ carnaval, cinzas, corpusChristi }` booleanos, padrão `true`
- `chavesExcluidas`: lista de `chave`
- `eventos`: `{ id, tipoId, inicio, fim, descricao, origem: 'automatico' | 'manual', chave?: string, editado?: boolean }`

`eventos` deixa de ser lista vazia fixa. Versão do formato continua **1** (ainda não há arquivo antigo no mundo). Sem migração.

## Casos de erro e mensagens
| Situação | Mensagem |
|---|---|
| Adicionar feriado sem nome | “Escreva o nome do feriado.” |
| Sem data | “Informe a data.” |
| Data fora do ano | “Use uma data de {ano}.” |
| Dois manuais no mesmo tipo e mesma data | “Já existe {nome} neste dia.” (aviso no formulário; não grava o segundo) |
| Apagar | “Apagar {nome} em {data}?” |
| Troca de ano cancelada | Nada muda |

Não há erro se feriado cair no sábado: o dia pinta feriado mesmo assim.

## Critérios de aceite
1. Calendário 2026, sem período: 01/01, 21/04, 01/05, 07/09, 12/10, 02/11, 15/11, 20/11, 25/12 e 03/04 (Sexta-feira Santa) são Feriado; 16/02 e 17/02 Carnaval, 18/02 Cinzas, 04/06 Corpus Christi são Ponto facultativo.
2. Testes de domínio: Páscoa e derivados 2025, 2026 e 2027 iguais à tabela.
3. 2023 **não** tem 20/11 automático; 2024 tem.
4. Apagar os dois dias de Carnaval tira 16/02 e 17/02 de 2026; os outros automáticos ficam. Sem interruptor na tela.
5. Período 02/02–30/04/2026: 16/02 pinta ponto facultativo, não letivo; 02/02 continua letivo.
6. Apagar Natal em 2026, mudar ano para 2027, **Manter minhas alterações**: 2027 sem 25/12 automático. **Voltar aos feriados padrão**: 25/12/2027 volta.
7. Feriado manual “Padroeira” em 15/08/2026 sobrevive à troca de ano nas duas opções, na data 15/08 (2027 se a pessoa não mudou o dia — data digitada permanece; se 15/08/2026 e o ano vira 2027, o manual **fica em 15/08/2026** fora do ano e some da grade 2027, com aviso “Há 1 feriado manual fora de 2027.”). Alternativa mais útil: ao mudar o ano, manuais com o mesmo dia/mês passam para o ano novo (15/08/2027). **Escolha desta spec:** manuais acompanham o **dia e o mês** para o ano novo (15/08/2026 → 15/08/2027). Se a data não existir (29/02), o evento some e o diálogo avisa.
8. Novo calendário: só nome, instituição e ano; feriados aparecem depois de criar.
9. `src/dominio` calcula Páscoa e lista sem React/DOM. `npm test` cobre a tabela 2025–2027.
10. Nenhuma chamada de rede.

## Fora do escopo
- Atalho de feriados estaduais por UF.
- Quadrado dividido, paleta automática, troca manual de cor.
- Eventos genéricos (recesso, férias, reposição) — só feriado/ponto nesta spec.
- Salvar `.json`, PDF, Excel, conflitos de mínimo de 200.
- Decreto extra de ponto facultativo (a pessoa usa Adicionar feriado).

## Como testar (depois de programar)
1. `npm test` (Páscoa 2025–2027).
2. `npm run dev`: novo calendário 2026 → criar → ver janeiro 1º vermelho e fevereiro 16/17 ponto facultativo.
3. Apagar Corpus Christi; 04/06 some.
4. Mudar para 2027, as duas opções do diálogo.
5. Celular 360 px: lista e botões Editar/Apagar usáveis.
