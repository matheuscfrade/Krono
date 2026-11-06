# UX: princípios e jornadas

> Fechado na entrevista de 2026-11-05 (versão sem login).

## Princípios
1. **Abrir e usar.** Sem conta, sem tela de entrada. A primeira tela já permite começar um calendário vazio ou abrir um rascunho.
2. **O calendário é a tela principal.** O elaborador trabalha olhando o ano pintado, não formulários. Os blocos de cadastro (períodos, feriados, eventos) mostram só a lista e os botões; cadastro e edição abrem em diálogo.
3. **Conflito no dia afetado.** O aviso ou o erro aparece no próprio dia (`!` e anel), com explicação ao tocar, e de novo na aba **Avisos e conflitos**, com a gravidade visível. Evento em feriado, recesso ou férias pode ser mantido no dia: o aviso continua até a pessoa escolher **Manter neste dia**.
4. **Cadastrar uma vez.** Quem lança uma data não digita de novo na tabela, no PDF ou no Excel.
5. **Rascunho sempre seguro.** "Salvar rascunho" e "Abrir rascunho" ficam à mão (arquivo `.json`), e a tela avisa quando há mudanças ainda não baixadas.
6. **Cores por conta do sistema, controle do usuário.** Sugerir sempre, deixar trocar fácil, mostrar a legenda ao lado.
7. **Celular para consultar, computador para elaborar.** Montar um ano inteiro é melhor em tela grande; ver o calendário e os conflitos precisa funcionar no celular.
8. **Menos telas.** Lançar evento em painel lateral ou no lugar, sem trocar de página.
9. **Linguagem simples e acessível.** Contraste, foco visível, teclado.
10. **Regras à vista, nunca escondidas em instituição.** Interruptores com nome genérico; o padrão serve a qualquer escola.

## Telas principais (a detalhar em specs)
- **Início:** título Krono, um box quadrado **Começar** no centro (**Novo calendário** e **Abrir rascunho** em arquivo `.json`) e a grade animada no fundo da tela. Sempre começa vazio; não há cartão de “modelo” nem lista de rascunhos no navegador.
- **Novo calendário:** pede nome, instituição e **ano**. Feriados e recessos aparecem no calendário depois de criar. Ajuste fino (mínimo de 200, avisos, regras da pessoa) fica em **Regras deste calendário**, para não alongar o primeiro passo.
- **Calendário:** os 12 meses coloridos (fundo de letivo/feriado/recesso e marcas dos outros eventos), a **Legenda** e um bloco colapsável **Cadastro** com abas: Períodos, Feriados e recessos, Eventos, Avisos e conflitos, Tabela de detalhamento. O bloco começa aberto só se ainda não houver período. **Repor** fica na aba de feriados, só nos dias que perderam aula enquanto o total está abaixo do mínimo. No cabeçalho, **Regras** e **Tipos de marcação** abrem diálogo. Clique no dia abre o cadastro já lançado (Editar no feriado/evento). Ao salvar ou cancelar o diálogo, volta a tela de antes (dia, intervalo ou a mesma aba); o cadastro de trás não troca de aba. O período **não** se edita pelo calendário: o letivo vem do período, e o dia só deixa de ser aula se virar feriado, recesso ou outro lançamento. Um **Evento no sábado** já torna aquele sábado letivo. Arrastar um intervalo lista feriados e eventos que cruzam esses dias, cada um com Editar. Apagar um dia (ou um pedaço) de um intervalo tira só esses dias; o restante continua. Reposição não cai em feriado, recesso nem domingo. Em dia já letivo marca (fundo + quadradinho) sem somar, com aviso para repor em dia ainda sem aula. Em dia sem aula, soma 1.
- **Tipos de marcação e cores:** botão no cabeçalho, ao lado de **Regras**. Diálogo com a lista em ordem alfabética (pt-BR): primeiro os tipos padrão (e os dias letivos dos períodos), depois os criados pela pessoa, também em ordem alfabética. Cor, rádio Permite / Não permite combinar com dia letivo e **Pode ser origem ou destino de prazo**, com **?** no fim de cada opção. No padrão, só **Exames finais** vem com o interruptor de prazo ligado. Férias, Feriado e Recesso não mostram o rádio (nunca combinam; o dia deixa de ser aula). Reposição e Sábado letivo também não (sempre criam aula). **Criar tipo** com nome, cor, o rádio e o interruptor de prazo (desligado no padrão). **Apagar** existe nos tipos criados e também em Férias, Exames finais, Recuperação e Sábado letivo, se não houver lançamento nem regra usando o tipo. Feriado, Recesso, Reposição, Evento e dia letivo da etapa não se apagam. Totais = dias letivos.
- **Eventos e tabela:** nas listas de feriados e eventos, no painel do dia e na tabela, cada lançamento mostra o quadradinho da cor do tipo à frente do texto. A tabela de detalhamento por período, com totais de dias letivos (mês, período, ano) quando a opção estiver ligada.
- **Regras deste calendário:** mínimo de dias letivos, aviso de mínimo, mostrar totais, lista vazia de regras da pessoa e **Adicionar regra** (precisa existir ou prazo mínimo). No prazo, origem e destino: início/fim de período e os tipos com **Pode ser origem ou destino de prazo** ligado. Unidade corridos, úteis ou letivos. Sem lista da IN.
- **Troca de ano / salvar como novo ano:** resumo do que acontece com os feriados automáticos e duas ações: manter minhas alterações, ou voltar aos feriados padrão.
- **Exportar:** escolher PDF ou Excel e ver a prévia.

## Jornadas
- **Elaborador, do zero:** abre o site → Novo calendário → nome, instituição, ano → (opcional) regras → define períodos → lança municipais, recessos (pelo bloco de feriados), férias e eventos → resolve conflitos no calendário → confere a tabela → exporta PDF e Excel → baixa o rascunho.
- **Elaborador, a partir do ano passado:** Início → Abrir rascunho (arquivo `.json`) → Salvar como novo ano → escolhe manter alterações ou feriados padrão → segue a jornada acima.
- **Quem consulta:** abre o PDF e entende o dia sem procurar.

## O que evitar
- Formulário longo com a mesma data digitada em vários lugares.
- Conflito que só aparece na hora de exportar.
- Legenda que não confere com as cores do calendário.
- Perder o trabalho sem aviso ao fechar a página.
- Modelo “de uma instituição” que faça o resto do país se sentir fora do lugar.
- Primeira tela pedindo dezenas de regras antes de ver o ano.
