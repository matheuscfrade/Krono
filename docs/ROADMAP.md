# ROADMAP

> Lista viva. Atualize ao final de cada sessão. Em sessão nova, leia este arquivo primeiro; o prompt pode ser só "continue".
> Última atualização: 2026-11-06 (Férias, Feriado e Recesso sem combinar)

## Em andamento
- [ ] Fase 7: publicação (hospedagem, domínio, licença)

## A fazer
### Fase 0: Definição
- [x] Fechar o PRD
- [x] Fechar o DOMÍNIO
- [x] Aprovar o ADR 001 (aplicativo estático no navegador)

### Fase 1: Base
- [x] Spec: estrutura do aplicativo, escolha do framework e do módulo de regras
- [x] Projeto TypeScript (Vite + React 19), layout base com os tokens e componentes de `DESIGN.md`, tela Início

### Fase 2: Calendário e tipos de marcação
- [x] Spec: calendário, períodos e tipos de marcação
- [x] Tela de novo calendário, 12 meses, períodos e tipos letivos (segunda a sexta)
- [x] Spec: feriados nacionais e pontos facultativos a partir do ano (cálculo da Páscoa, lista fixa, origem automático/manual, interruptores por ponto, troca de ano com escolha), com testes de 2025 a 2027
- [x] Geração automática de cores e legenda (com troca manual); célula com fundo (letivo/feriado/recesso) e marcas dos outros eventos (spec 06 + 08)

### Fase 3: Eventos e visão anual
- [x] Spec: lançar eventos (data e intervalo)
- [x] Os 12 meses coloridos
- [x] Ajuda de pintura no cadastro (spec 07)
- [x] Spec 09: reposição e retirada de letivo

### Fase 4: Conflitos e regras ligáveis
- [x] Spec 10: reposição só em aula perdida e só abaixo do mínimo; Repor na lista de feriados
- [x] Spec 11: conflitos (DOMINIO) com testes e marca no dia
- [x] Spec 11: mínimo, exames, conferência e semanas temáticas ligáveis

### Fase 5: Rascunho
- [x] Spec 12: formato do `.json` com versão e migração das regras
- [x] Salvar (baixar) e abrir rascunho `.json`; aviso de mudanças não baixadas
- [x] Troca de ano (manter alterações ou feriados padrão)

### Fase 6: Tabela e exportação
- [x] Tabela de detalhamento por período; totais por mês, período e ano
- [x] PDF (imprimir A4 paisagem) e Excel, gerados no navegador

### Fase 7: Publicação
- [x] Hospedagem inicial no GitHub Pages (`https://matheuscfrade.github.io/Krono/`)
- [ ] Domínio, nome final, licença e texto de privacidade simples (nada é enviado a servidor)
- [ ] Decidir se o produto é gratuito; meta de tempo de elaboração; ferramenta usada hoje (só para o texto de apresentação)
- [ ] Teste no celular e em navegadores comuns

## Esperando o Matheus
- [x] Spec 20 (`docs/specs/20-tipo-entra-no-prazo.md`): interruptor Entra no prazo mínimo em cada tipo
- [x] Spec 19 (`docs/specs/19-lista-do-prazo.md`): prazo só com âncoras de período e tipos de marco (sem feriado/evento/reposição)
- [x] Spec 18 (`docs/specs/18-reposicao-em-dia-letivo.md`): reposição em dia já letivo (marcação, sem somar; aviso para repor em dia ainda não letivo)
- [x] Spec 17 (`docs/specs/17-totais-sao-dias-letivos.md`): totais = dias letivos; some Conta nos totais
- [x] Spec 16 (`docs/specs/16-combina-com-dia-letivo.md`): um rádio Permite / Não permite combinar com dia letivo no lugar de Tira letivo e Vira aula
- [x] Spec 15 (`docs/specs/15-prazo-ancoras-e-dias-uteis.md`): origem/destino com início e fim de período; prazo em dias corridos, úteis ou letivos (Art. 129 § 1º da Resolução 01/2026)
- [x] Spec 14 (`docs/specs/14-regras-parametrizaveis.md`): regras da pessoa, sem lista da IN; prazo fim do período → exames; tipo X conta como letivo
- [x] `git init` e primeiro commit no GitHub
- [ ] Cor da marca `#1F5F8B` (ou outra) na Fase 1
- [ ] Nome final, domínio e licença
- [x] Hospedagem inicial (GitHub Pages)
- [ ] Conferir a lista inicial de feriados nacionais com a lei e revisá-la uma vez por ano

## Feito
- [x] 2026-11-06: Férias, Feriado e Recesso sem rádio de combinar com dia letivo (nunca combinam; rascunho antigo com combina ligado é ignorado)
- [x] 2026-11-06: amostra de pintura acompanha Permite/Não permite combinar e a cor do tipo (tipos, criar tipo e lançar evento)
- [x] 2026-11-06: após cadastro no diálogo, volta o dia/intervalo de origem; a aba de Cadastro não muda (nem ao surgir aula a repor)
- [x] 2026-11-06: aviso de evento em feriado/recesso/férias continua; **Manter neste dia** tira a marca do calendário e guarda o aceite no rascunho
- [x] 2026-11-05: repositório público sem PDFs/normas locais; GitHub Pages
- [x] 2026-11-05: quadradinho da cor do tipo à frente do texto em feriados, eventos, intervalo, painel do dia e tabela
- [x] 2026-11-05: rótulo **Tipos de marcação** (antes Tipos de dia) no cabeçalho, diálogo e docs de produto
- [x] 2026-11-05: Férias, Exames finais, Recuperação e Sábado letivo podem ser apagados (sem lançamento/regra); Feriado, Recesso, Reposição e Evento continuam fixos
- [x] 2026-11-05: **Pode ser origem ou destino de prazo** ligado só em Exames finais no padrão; demais tipos e tipos criados vêm desligados
- [x] 2026-11-05: tipos de dia em ordem alfabética (pt-BR); padrão e dias letivos primeiro, criados pela pessoa depois, no mesmo critério
- [x] 2026-11-05: erros e avisos mais visíveis no dia (`!` + anel branco+cor) e na aba Avisos e conflitos (borda, rótulo, contagem); períodos cruzados marcam o primeiro dia da sobreposição
- [x] 2026-11-05: tela do ano mais curta — um bloco **Cadastro** com abas (Períodos, Feriados e recessos, Eventos, Avisos e conflitos, Tabela); calendário e legenda visíveis; **Tipos de marcação** no cabeçalho ao lado de Regras
- [x] 2026-11-05: estrutura de documentos e regras para agentes criada
- [x] 2026-11-05: decisão de seguir sem login, tudo no navegador (rascunho em `.json`)
- [x] 2026-11-05: decisão: usuário informa o ano e o Krono traz feriados nacionais (cálculo local); pontos facultativos separados, um interruptor cada, ligados por padrão; municipais e estaduais com o usuário
- [x] 2026-11-05: entrevista de planejamento; PRD, UX, DOMÍNIO e ADR 001 fechados
- [x] 2026-11-05: IN 2/2025 do IFMG lida; regras viram opções genéricas (não hardcode de instituição)
- [x] 2026-11-05: Fase 1 — Vite + React + Vitest, tokens, tela Início, `FORMATO_RASCUNHO_ATUAL = 1`
- [x] 2026-11-05: Fase 2 (calendário/períodos/tipos) — 12 meses, período pinta dias úteis, testes de domínio
- [x] 2026-11-05: Feriados nacionais e pontos facultativos (Páscoa 2025–2027, interruptores, troca de ano)
- [x] 2026-11-05: Cores e quadrado dividido — `pinturaDoDia`, troca de cor, 5º período gera cor nova
- [x] 2026-11-05: Feriado e ponto facultativo não pintam letivo por baixo (quadrado único)
- [x] 2026-11-05: Carnaval, Cinzas e Corpus Christi na lista, sem interruptor (editar/apagar como feriado)
- [x] 2026-11-05: Lançar eventos (bloco, clique no dia, arraste no computador)
- [x] 2026-11-05: Sábado letivo como tipo de evento (pinta só sábados do intervalo)
- [x] 2026-11-05: Pintura fundo + marcas — letivo/feriado/ponto no fundo; demais eventos em quadradinhos (até 4 +); sábado letivo = fundo da etapa + marca
- [x] 2026-11-05: Sábado letivo só aceita sábado no início e no fim
- [x] 2026-11-05: Spec 08 — ponto facultativo sai; Recesso pinta fundo como o ponto pintava; Recesso sai de eventos
- [x] 2026-11-05: Spec 07 — ajuda de pintura no cadastro (texto + amostra de célula no período, feriado/recesso e evento)
- [x] 2026-11-05: Spec 09 — reposição (dia vira aula, ligada à data original) e retirada de letivo (célula em branco); bloco Dias letivos com aulas a repor e excesso acima do mínimo
- [x] 2026-11-05: Blocos de cadastro só com lista e botões; formulários de período, feriado, evento e retirada em diálogo
- [x] 2026-11-05: Spec 10 — Repor na lista de feriados; só aula perdida no período e só se o total < mínimo; bloco Dias letivos sai
- [x] 2026-11-05: Clique no dia e arraste no intervalo igual ao cadastro abrem Editar (período, feriado, evento)
- [x] 2026-11-05: Spec 14 — regras da pessoa (precisa existir e prazo em dias corridos), parâmetros do tipo (tira letivo / conta / vira aula), criar tipo, rascunho formato 2 com migração do v1; sem lista da IN em calendário novo
- [x] 2026-11-05: Arraste lista todos os lançamentos que cruzam o intervalo, não só o de datas iguais
- [x] 2026-11-05: Apagar no dia (ou num trecho do arraste) fura o intervalo; o restante fica
- [x] 2026-11-05: Reposição só em dia ainda não letivo e sem feriado/recesso; fundo letivo + marca
- [x] 2026-11-05: Clique no calendário não edita período; o dia só deixa de ser letivo se virar feriado, recesso ou outro lançamento
- [x] 2026-11-05: Conflitos, regras ligáveis, rascunho JSON, tabela, PDF e Excel
- [x] 2026-11-05: Tela inicial com animação e rodapé Developed by Matheus Costa Frade
- [x] 2026-11-05: Início sem rascunhos no navegador; box Começar quadrado no centro; grade animada no fundo inteiro
- [x] 2026-11-05: Spec 15 — prazo com início/fim de período e dias úteis ou letivos (Art. 129 § 1º)
- [x] 2026-11-05: Spec 16 — rádio Permite / Não permite combinar com dia letivo; rascunho formato 4
- [x] 2026-11-05: Spec 17 — totais são os dias letivos; some Conta nos totais; rascunho formato 5
- [x] 2026-11-05: Spec 18 — reposição em dia já letivo (marcação + aviso, sem somar)
- [x] 2026-11-05: Spec 19 — lista do prazo sem feriado, recesso, evento, reposição, sábado letivo e retirada
- [x] 2026-11-05: Tipo criado pela pessoa tem Apagar (não apaga tipo padrão nem tipo em uso)
- [x] 2026-11-05: Spec 20 — Entra no prazo mínimo configurável no tipo
- [x] 2026-11-05: Evento no sábado já torna o dia letivo (tipo Sábado letivo continua para rascunhos antigos)
- [x] 2026-11-05: PDF e Excel com meses coloridos; tabela só com marcações (sem dia só letivo)
