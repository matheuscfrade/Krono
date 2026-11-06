# DOMÍNIO: calendário acadêmico

> Linguagem do produto e regras. Fechado na entrevista de 2026-11-05. Exemplos reais e normas oficiais ficam em `docs/referencias/` só nesta máquina (não vão ao GitHub). Viram opções genéricas no produto, nunca regra gravada só para uma instituição.

## Conceitos
- **Calendário:** um documento por público e por ano, por exemplo "Cursos Técnicos 2026". Tem nome, ano e o nome da instituição (texto livre). Uma instituição costuma ter vários no mesmo ano, e cada um é um rascunho separado.
- **Rascunho:** o arquivo `.json` que guarda o calendário inteiro (períodos, tipos de marcação, cores, eventos, interruptores e regras ligadas) e tem número de versão do formato. A pessoa baixa e abre de novo quando quiser. Sem cópia no navegador.
- **Período:** divisão do calendário com início, fim e **nome livre** (1ª Etapa, 1º Semestre, Módulo 1…).
- **Tipo de marcação:** categoria com nome e cor, como "Dia letivo da 1ª etapa", "Feriado", "Recesso", "Férias", "Exames finais", "Reposição de aula de segunda-feira". Pode ser padrão (já vem pronto, como Feriado e Recesso) ou criado pelo usuário.
- **Evento:** uma data ou um intervalo de datas com um tipo e uma descrição. É a única informação que o usuário digita; o resto é derivado. Reposição guarda também a data original (`dataOriginal`).
- **Reposição:** um dia novo de aula no lugar de uma data perdida. O dia novo **é letivo** (sábado inclusive). Nome sugerido: “Reposição de aula de sexta-feira (03/04/2026)”.
- **Retirada de letivo:** um dia que era aula deixa de ser. Fica em branco, sem recesso e sem cor nova. Tipo interno `tipo-retirada-letivo`: não entra no select de Eventos nem na legenda.
- **Conflito:** situação em que duas informações do calendário não combinam. Pode ser **erro** (precisa corrigir) ou **aviso** (o usuário pode aceitar). Evento em feriado, recesso ou férias continua aviso; se a pessoa escolher **Manter neste dia**, o lançamento fica e a marca some do calendário.
- **Regra ligável:** checagem que a pessoa liga ou desliga neste calendário. O Krono avisa; não impede salvar. Nenhuma regra usa nome de instituição.

## O que o exemplo mostra
- Página 1: os 12 meses em uma folha, cada dia pintado pelo tipo, mais a legenda. Legenda do exemplo: Ações de Acolhimento e Planejamento; Conselhos de Classe Finais; Dia Letivo (1ª, 2ª e 3ª Etapa); Eventos Acadêmicos; Exames Finais; Feriado; Férias; Recesso Escolar e Administrativo; Recuperação Parcial de Etapa; Reposição de aula de segunda, terça, quinta e sexta; e um evento próprio (XV JECT).
- Páginas seguintes: tabela por etapa, com colunas Mês, Dia e Evento. O dia aparece como número, intervalo ("5 a 31", "2 a 6") ou lista ("14, 15 e 18", "16 e 18"). O sistema deve juntar datas seguidas em intervalo.
- Reposição: um dia letivo "repõe" uma aula de outro dia da semana (por exemplo, "Dia letivo destinado a reposição de aula de sexta-feira (03/04)"). A reposição fica ligada à data original.
- Um mesmo dia pode ter mais de uma informação (por exemplo, "Recesso" no dia do servidor público e um evento). Ver **Cores no dia**.

## Feriados e recessos
- O Krono trata o **calendário acadêmico**. Ponto facultativo (dispensa administrativa) **não** entra como tipo. **Feriado** tem lei. **Recesso** é parada acadêmica (Carnaval, Cinzas, Corpus Christi, recesso escolar): pinta o fundo do dia, como o feriado, e o dia deixa de ser letivo.
- Ao criar o calendário, a pessoa informa o **ano**. O Krono gera os eventos automáticos desse ano, calculados no navegador, sem internet e sem base de dados externa. Cada evento automático é marcado como tal (origem "automático").
- **Feriados nacionais fixos** (lista pequena no código): 1º/1 Confraternização Universal, 21/4 Tiradentes, 1º/5 Dia do Trabalho, 7/9 Independência, 12/10 Nossa Senhora Aparecida, 2/11 Finados, 15/11 Proclamação da República, 20/11 Consciência Negra (nacional desde 2024) e 25/12 Natal. Conferir contra a legislação vigente na spec de feriados; revisão anual no ROADMAP.
- **Feriado móvel:** Sexta-feira Santa (Paixão de Cristo), 2 dias antes da Páscoa.
- **Recessos automáticos** entram na mesma lista dos feriados, tipo Recesso (sem interruptor; editar e apagar cada data):
  - Carnaval (segunda e terça, 48 e 47 dias antes da Páscoa);
  - Quarta-feira de Cinzas (46 dias antes; em geral meio expediente);
  - Corpus Christi (60 dias depois da Páscoa).
- **Páscoa:** calculada por algoritmo conhecido (computus gregoriano). Exemplos para os testes: 2025 = 20/4, 2026 = 5/4, 2027 = 28/3. Com eles: Carnaval 2026 = 16 e 17/2, Sexta-feira Santa 2026 = 3/4, Corpus Christi 2026 = 4/6; Carnaval 2025 = 3 e 4/3; Corpus Christi 2025 = 19/6; Carnaval 2027 = 8 e 9/2; Corpus Christi 2027 = 27/5. O código terá teste com esses anos e outros conferidos em fonte oficial.
- **Feriados estaduais, municipais e do campus:** cadastrados pelo usuário como eventos do tipo Feriado. Sem atalho por UF nesta versão.
- **Troca de ano** (e “salvar como novo ano”): o Krono mostra o que mudaria nos eventos automáticos e pede uma escolha: **manter minhas alterações** ou **voltar aos feriados padrão** do ano novo. Só então refaz os automáticos. O que a pessoa acrescentou à mão é preservado nos dois casos, com a data que ela digitou.
- **Mudança de lei:** a lista fixa tem revisão anual (item no ROADMAP). Recesso extra no ano o usuário cadastra à mão no bloco de feriados e recessos.
- Por que sem API externa: o Krono funcionaria offline, não dependeria de terceiros e manteria a regra de que nada sai do navegador.
- No `.json` do rascunho, cada evento guarda a origem (automático ou manual). O campo `pontosFacultativos` permanece no formato (todos ligados na criação), só para não mudar a versão do arquivo.

## Dias letivos
- **Dia letivo:** dia de efetivo trabalho escolar (aula ou atividade com turma, docente e frequência), dentro ou fora da sala.
- **Mínimo padrão:** 200 dias no **ano** (LDB, art. 47), campo `minimoDiasLetivos`. A pessoa pode mudar o número neste calendário (tela de regras, ainda fora desta spec). O mesmo padrão vale para qualquer tipo de curso; não há mínimo automático diferente por técnico ou graduação.
- **Conta:** o dia é aula (`diaEhLetivo`). Padrão: segunda a sexta no período, sábado com Evento/Sábado letivo e reposição; feriado, recesso, férias, exames, recuperação e retirada tiram a aula. Feriado, Recesso e Férias nunca combinam (sem rádio). Nos demais tipos, a pessoa muda isso no rádio de combinar.
- **Aviso** (não erro) se o total do ano ficar **abaixo** do mínimo. **Aviso** também se ficar **acima** (retirar aula: spec de regras, Fase 4).
- **Aulas a repor:** só se o feriado ou recesso tirou um dia que **seria aula** (segunda a sexta no período, ou sábado com evento/sábado letivo) e o total ainda está **abaixo do mínimo**. Intervalo conta cada dia útil perdido. 1º/1 e Natal fora da etapa não pedem. O botão **Repor** fica na linha em Feriados e recessos. Sem botão Não repor: ao chegar no mínimo, o pedido some.
- Exames finais, no padrão, **não combinam** com dia letivo: não são aula e não entram nos 200. Se a pessoa ligar **Permite combinar**, o dia da etapa continua aula e entra na soma.
- Cursos de natureza especial: a pessoa baixa o mínimo ou desliga o aviso; o Krono não impõe carga horária em horas (horário de aulas está fora do escopo).

## Regras da pessoa
Calendário **novo** nasce **sem** lista da IN e **sem** semanas temáticas. A pessoa cria o que precisa:

- **Precisa existir:** aviso (ou erro) se o ano não tiver evento daquele tipo, ou com aquela palavra no nome.
- **Prazo mínimo:** da origem até o destino. Origem e destino: **início de cada período**, **fim de cada período** e os tipos com **Pode ser origem ou destino de prazo** ligado (padrão: só **Exames finais**; os demais vêm desligados). Unidade: **dias corridos**, **dias úteis** (segunda a sexta sem feriado/recesso) ou **dias letivos**. Se a distância for menor que N, aviso ou erro. Destino ausente no ano: o prazo não dispara. Exemplo (Resolução 01/2026 Art. 129 § 1º): fim do período → exames finais, 2 dias úteis.

Cada regra tem nome, interruptor ligada/desligada e gravidade.

## Parâmetros do tipo de marcação
Um rádio **Permite / Não permite combinar com dia letivo** e o interruptor **Pode ser origem ou destino de prazo**:

| Tipo | Combina com dia letivo | Origem ou destino de prazo |
|---|---|---|
| Feriado, Recesso, Férias | (sem rádio; nunca combinam) | não |
| Recuperação, Retirada | não | não |
| Exames finais | não | sim |
| Evento, tipo criado pela pessoa | sim | não |
| Reposição, Sábado letivo | (sem rádio; sempre criam aula) | não |

**Não permite combinar:** o dia deixa de ser aula. **Permite combinar:** se o dia já era aula, continua aula + marca; se não era, continua sem aula. Evento no sábado continua aula. Domingo nunca vira aula. Feriado, Recesso e Férias nunca combinam. Reposição e sábado letivo criam aula onde ainda não havia.

Os totais (mês, período, ano e o mínimo de 200) são a quantidade de dias letivos. Não há interruptor separado “conta nos totais”.

Feriado, Recesso, Reposição e Evento são do motor e não se apagam. Férias, Exames finais, Recuperação e Sábado letivo podem sair do calendário se não houver lançamento nem regra. Dia letivo de período some com o período.

## Totais
A tabela e o Excel mostram dias letivos **por mês**, **por período** e **no ano**, quando a opção “mostrar totais” está ligada (padrão: ligada).

## Conflitos tratados
| # | Situação | Gravidade |
|---|---|---|
| 1 | Evento acadêmico em dia de feriado, recesso ou férias | Aviso (pode manter o evento no dia; aí some a marca no calendário) |
| 2 | Dois eventos que não podem acontecer no mesmo dia (marcados como exclusivos) | Erro |
| 3 | Períodos que se sobrepõem | Erro |
| 4 | Dias do ano sem período nem tipo definido (lacuna) | Aviso |
| 5 | Reposição em dia que já é letivo (marcação, sem somar) | Aviso |
| 6 | Reposição de uma aula da segunda caindo numa segunda (mesmo dia da semana) | Aviso |
| 7 | Total de dias letivos do ano abaixo do mínimo configurado | Aviso |
| 8 | Data fora do ano do calendário | Erro |
| 9 | Fim de semana marcado como letivo sem evento nem sábado letivo | Aviso |
| 10 | Regra da pessoa (precisa existir ausente, ou prazo menor que N) | Aviso ou erro, conforme a regra |
| 12 | Total de dias letivos do ano acima do mínimo | Aviso |

Cada conflito mostra o dia (ou o calendário, se for total/item faltando), a explicação em linguagem simples e como resolver. Cada regra tem teste automático com exemplo de datas.

## Cores
- Cada tipo de marcação recebe uma cor gerada automaticamente: paleta com bom contraste do texto sobre a cor e que continue distinguível em preto e branco (variando também o brilho).
- Tipos comuns têm cor padrão estável (feriado, recesso e férias sempre parecidos entre calendários).
- O usuário pode trocar qualquer cor (`corManual`). **Voltar à cor sugerida** recoloca o padrão ou a cor gerada. A legenda é gerada pelo sistema e só lista os tipos usados. Um dia com fundo e marcas conta 1 para cada tipo presente.
- Cor nunca é a única pista: a tabela e a legenda também trazem o nome.

## Cores no dia (fundo e marcas)
Ordem estável dos tipos (da mais “institucional” para a mais corrente): feriado → recesso → férias → exames → reposição → evento → sábado letivo → dia letivo.

- **Fundo** (no máximo um): feriado; senão recesso; senão dia letivo do período. Férias, exames, recuperação e Evento **não** pintam fundo: viram marca.
- **Não são letivos** no padrão: feriado, recesso, férias, exames finais, recuperação e **retirada** (não combinam com dia letivo). Se a pessoa ligar **Permite combinar** (ex.: Recuperação numa terça da etapa), o letivo permanece e o tipo vira marca. Fora da etapa, isso **não** inventa aula. Retirada deixa a célula em branco, sem marca.
- **Reposição:** tipo lançável. Um dia só, com data original. **Não** em feriado, recesso nem domingo. Em dia **já letivo** salva: fundo da etapa + marca, aviso (não soma). Em dia ainda sem aula: fundo da etapa + marca e **soma** 1.
- **Sábado letivo:** um **Evento** lançado num sábado já torna aquele dia aula (conta nos 200, fundo da etapa se o sábado estiver no período, marca do Evento). O tipo **Sábado letivo** continua existindo para rascunhos antigos e para quem quiser o rótulo explícito: início e fim precisam ser sábado; no intervalo, só os sábados pintam. Férias, exames e recuperação no sábado **não** viram aula. Some se o sábado for feriado, recesso, férias, exames, recuperação ou retirada. Domingo nunca vira aula por um Evento.
- **Marca:** um quadradinho por evento que não é o fundo, na cor do tipo. Dois Eventos no mesmo dia = duas marcas. Feriado no fundo não ganha marca extra; recesso no mesmo dia de feriado vira marca.
- Até **4** marcas na célula; se houver mais, um **+**. A dica (hover) e o painel do dia listam todos, cada um com a cor.
- Marca de conflito continua visível no dia (Fase 4).

## Saídas
- **PDF** em A4 paisagem: folha dos 12 meses coloridos com legenda, depois a tabela de detalhamento por período (só marcações; dia só letivo não entra).
- **Excel**: aba com os meses coloridos, aba com a tabela de eventos (só marcações) e aba com o resumo (dias letivos por mês, por período e no ano).
- Calendário, tabela, PDF e Excel nascem da mesma lista de eventos.
- Tudo é gerado no navegador; nada sai do computador da pessoa.

## Rascunho (.json)
- Conteúdo: versão do formato (**5**); dados do calendário; períodos; tipos de marcação (cores, `combinaComLetivo`, `entraNoPrazo`); eventos (incluindo `aceitosEmFeriado` quando a pessoa mantém o evento no feriado); `pontosFacultativos` (legado); mínimo de dias letivos; regras (`mostrarTotais`, `avisoMinimo`, `regrasUsuario` com `unidade` no prazo).
- Arquivo de versão antiga precisa continuar abrindo: formato **1** migra itens de conferência; formato **2** preenche `unidade: corridos` nos prazos; formato **3** troca `tiraLetivo`/`viraAula` por `combinaComLetivo`; formato **4** descarta `contaNosTotais`. O arquivo salvo sai como v5.
- Detalhes do formato serão definidos na spec do rascunho e documentados aqui.

## Fora do domínio (não vira regra do Krono)
Processo interno de instituição: aprovação em conselho, férias de técnicos administrativos, otimização de três turnos, 1000 horas anuais, nomes de setores. A pessoa organiza isso fora do app.
