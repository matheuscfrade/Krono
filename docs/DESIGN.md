# DESIGN: guia visual do Krono

> Fonte única do visual. Toda tela usa só o arquivo de tokens (`tokens.css`) e o de componentes base (`base.css`). Nunca coloque cor, tamanho ou espaçamento solto dentro de uma tela. A marca do Krono é própria e neutra, não a de nenhuma instituição.

## Sensação
Ferramenta de trabalho limpa e calma, que deixa o calendário colorido ser o destaque. Interface em cinzas e uma cor de marca; as cores fortes ficam para os tipos de marcação.

## Tokens (definir em `tokens.css` como variáveis CSS)
- Cor da marca: azul-petróleo. Ponto de partida `#1F5F8B` (a confirmar com o Matheus na Fase 1). Hover 10% mais escuro.
- Neutros: fundo `#F7F8F9`, cartão `#FFFFFF`, borda `#E3E6E8`, texto `#1B1F23`, texto secundário `#5F6B76`.
- Alertas: erro `#C53030`, aviso `#B7791F`, sucesso `#2F855A`, informação `#2B6CB0`. Sempre cor mais texto e ícone.
- Fonte: Inter (ou a do sistema). Tamanhos 14, 16 (base), 20, 24, 32. Títulos 600, texto 400.
- Espaçamento em múltiplos de 4: 4, 8, 12, 16, 24, 32, 48.
- Borda arredondada de 8 px nos cartões e campos, 999 px nas etiquetas. Uma única sombra, bem suave.

## Cores dos tipos de marcação
- O sistema gera uma paleta com o espaçamento de matiz distribuído entre os tipos usados, variando também o brilho para distinguir em preto e branco.
- Cores padrão estáveis para tipos comuns: feriado (vermelho), recesso (laranja), férias (verde-azulado), exames (roxo), dia letivo (tons de azul, um por período).
- A cor do texto sobre cada cor é escolhida automaticamente (claro ou escuro) para ter contraste mínimo AA.
- Toda cor pode ser trocada pelo usuário; a legenda se atualiza sozinha.
- A cor nunca é a única informação: legenda e tabela trazem o nome, e dias especiais podem ter uma marca (ponto, borda).

## Componentes (um só jeito de fazer cada um)
- **Botão principal:** um por tela, cor da marca cheia, altura mínima 44 px. Secundário: contorno. Perigoso: vermelho.
- **Cartão:** fundo branco, borda fina, 16 a 24 px de respiro.
- **Mês do calendário:** grade de 7 colunas (Dom a Sáb), dias com a cor do tipo, hoje e dias com conflito com marca visível.
- **Dia:** fundo inteiro na cor de feriado, recesso ou dia letivo (nessa ordem). Os demais eventos são quadradinhos (marcas) na base da célula, até 4; o restante vira **+**. Hover no computador mostra todas as marcas com a cor. O toque ou o teclado abre a lista completa do dia. Marca de conflito (quando existir) continua visível.
- **Marca de conflito:** `!` no canto do dia e anel interno (filete claro + cor), para contrastar no fundo colorido. Erro usa vermelho (`--cor-erro`); aviso usa âmbar (`--cor-aviso`). A mesma gravidade aparece na aba **Avisos e conflitos**, com borda e rótulo Erro/Aviso. A aba mostra a quantidade.
- **Legenda:** cor, nome e quantidade de dias de cada tipo. Um dia com fundo e marcas conta 1 para cada tipo presente.
- **Lista de lançamentos:** o mesmo quadradinho de cor da legenda fica à frente do texto em feriados, eventos, painel do dia, escolha de intervalo e coluna Lançamento da tabela. Trocar a cor do tipo atualiza o ícone.
- **Barra do rascunho:** botões "Abrir rascunho" e "Salvar rascunho" sempre visíveis (arquivo `.json`), com aviso discreto quando há mudanças ainda não baixadas.
- **Início:** box quadrado Começar no centro da tela; grade de células animada cobre o fundo inteiro.
- **Interruptor:** liga/desliga com rótulo à esquerda, alvo de 44 px. O mesmo padrão nas regras ligáveis.
- **Formulário:** um campo por linha no celular, rótulo acima, erro logo abaixo do campo dizendo o que corrigir. Cadastro e edição de período, feriado, evento e retirada abrem num diálogo (mesmo padrão do painel do dia), com rolagem se o conteúdo passar da tela.
- **Tutorial:** popup pequeno (cartão, no máximo ~22 rem) com um cartão por vez, progresso “1 de N”, pontos de posição, Anterior / Próximo (Entendi no último) e Pular. Fundo igual aos outros diálogos. Cores só dos tokens.
- **Bloco de cadastro:** um só cartão colapsável **Cadastro** com abas (Períodos, Feriados e recessos, Eventos, Avisos e conflitos, Tabela de detalhamento). Cada aba lista os itens já lançados, Editar e Apagar, e o botão de adicionar. O formulário não fica dentro do bloco. Calendário e Legenda ficam sempre visíveis. Tipos de marcação abre em diálogo, pelo cabeçalho.
- **Abas:** empilham com quebra de linha no celular; cada aba tem altura mínima de 44 px. A aba ativa usa a cor da marca.
- **Tabela:** no computador é tabela; no celular vira cartões.
- **Estado vazio:** uma frase e o botão da próxima ação.

## Layout
- Largura máxima de conteúdo de 1200 px; o calendário usa a largura toda disponível.
- No celular, os meses se empilham (1 por linha) e a lista de conflitos vem logo abaixo do mês.
- Alvos de toque de pelo menos 44 px.
- Impressão e PDF: A4 paisagem, cores preservadas, legenda sempre visível.

## Regras de ouro
1. Uma ação principal por tela.
2. Conflito sempre visível no dia afetado.
3. Legenda sempre confere com as cores.
4. Contraste mínimo AA e foco visível.
5. Antes de entregar uma tela, passar na skill `revisar-ux-da-tela`.
