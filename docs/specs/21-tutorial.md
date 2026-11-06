# Spec: tutorial em cartões

> Status: **implementada** (2026-11-06).
>
> Termos em uma frase: **tutorial** = popup pequeno com cartões que avançam, dizendo como preencher o calendário, configurar e usar clique e arraste.

## Objetivo
Quem começa um calendário novo vê, em poucos cartões, o que fazer primeiro. Quem já está no ano reabre o mesmo tutorial pelo cabeçalho.

**Quem usa:** quem elabora o calendário, no primeiro uso e quando esquecer um gesto.

## Jornada
1. Na Início, toca **Novo calendário**.
2. Abre o formulário (nome, instituição, ano) e, por cima, um popup pequeno no primeiro cartão.
3. **Próximo** avança; **Anterior** volta; **Pular** ou **Entendi** (último cartão) fecha. Escape também fecha.
4. Preenche o formulário, cria o calendário e trabalha nos 12 meses.
5. No cabeçalho do ano, ao lado de **Regras**, toca **Como usar** e o mesmo tutorial abre do primeiro cartão.
6. Abrir um rascunho `.json` **não** abre o tutorial sozinho; **Como usar** continua no cabeçalho.

Celular: o popup cabe na largura, botões com 44 px, sem rolagem lateral. Computador: igual, centralizado.

## Telas

**Popup (todas as telas em que abre)**
- Diálogo modal pequeno (cartão, não a tela inteira).
- Mostra: progresso “1 de N”, título do cartão, texto curto, pontos de posição, **Anterior**, **Próximo** (ou **Entendi** no último) e **Pular**.
- Ação principal: Próximo / Entendi.
- Fundo escurecido; o clique no fundo não fecha (igual aos outros diálogos).
- Não entra na impressão / PDF.

**Novo calendário**
- O popup abre sozinho ao chegar nesta tela.
- Há **Como usar** no cabeçalho, para reabrir se a pessoa pulou.

**Calendário (ano)**
- **Como usar** no grupo de botões superiores, à esquerda de **Regras**.
- Não abre sozinho ao criar o ano nem ao abrir rascunho.

## Regras
- Texto só descreve o que o app já faz (períodos, clique, arraste, regras, tipos, rascunho). Sem regra nova de domínio.
- Nada vai para servidor. Sem `localStorage` de “já vi o tutorial” (o rascunho continua sendo só o `.json`).
- O formato do rascunho **não** muda.

## Dados
Nenhum campo novo no `.json`. Versão do formato inalterada.

## Casos de erro
Não há validação. Se a pessoa fechar no meio, o calendário continua como estava.

## Critérios de aceite
1. Início → **Novo calendário** → o popup abre no cartão 1, com título e texto.
2. **Próximo** vai ao cartão 2; **Anterior** volta ao 1; no último, o botão principal é **Entendi** e fecha.
3. **Pular** fecha em qualquer cartão.
4. Escape fecha o popup.
5. Depois de fechar, dá para preencher nome, instituição e ano e criar o calendário.
6. No ano, **Como usar** (ao lado de **Regras**) reabre do cartão 1.
7. Abrir rascunho não abre o popup.
8. Os cartões falam de: preencher nome/ano; períodos; clique no dia; clique e arraste; Regras e Tipos de marcação; salvar rascunho.
9. Largura 360 px: popup visível, sem corte horizontal, alvos de 44 px.
10. Teclado: foco visível nos botões do popup.

## Fora do escopo
- Tour apontando para cada botão da tela.
- “Não mostrar de novo” guardado no navegador.
- Vídeo, GIF ou captura animada.
- Tutorial diferente para celular e computador (o texto do arraste menciona os dois).
