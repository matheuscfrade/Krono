# Spec: totais são os dias letivos

> Status: **implementada** (2026-11-05).

## Objetivo
Os totais (mês, período, ano e o mínimo de 200) são a quantidade de **dias letivos**. Some o interruptor **Conta nos totais**: aula conta; o que não é aula não conta.

**Quem usa:** quem elabora o calendário.

## Contexto
Depois da spec 16, **Não permite combinar** já tira a aula (feriado, exames, recuperação). **Permite combinar** mantém a aula. **Conta nos totais** só servia para um dia ser aula na pintura e ficar de fora da soma — o mesmo fato duas vezes.

Exames e feriado continuam fora dos 200 porque **não são aula**.

## Jornada
1. Abre Tipos de marcação: Feriado tem só o rádio de combinar (não permite) e a cor. Sem **Conta nos totais**.
2. Liga **Permite combinar** em Recuperação. Uma terça da etapa com recuperação entra nos 200 e pinta fundo de aula.
3. Criar tipo: nome, cor e o rádio. Sem **Conta nos totais**.
4. Celular 360 px: rádios usáveis, Criar tipo ≥ 44 px.

## Telas
Bloco **Tipos de marcação** e **Novo tipo de marcação**: cor + rádio Permite / Não permite combinar. Reposição e Sábado letivo: só a cor.

**Regras deste calendário:** mínimo de dias letivos, aviso de mínimo e **Mostrar totais** (na tabela) continuam. Isso não é o interruptor que some.

## Regras
`diaContaComoLetivo` = `diaEhLetivo`. Cálculo em `src/dominio`, com testes.

## Dados
Formato do rascunho passa para **5**. v4 continua abrindo.

`contaNosTotais` sai do tipo e do arquivo novo. Na leitura, o campo é ignorado.

## Casos de erro
Nenhum novo.

## Critérios de aceite
1. Tipos de marcação e Criar tipo: sem o texto “Conta nos totais”.
2. Terça 10/03/2026 na etapa: entra no total. Feriado nesse dia: sai do total. Evento nesse dia: continua no total.
3. Recuperação com **Permite combinar** na sexta 08/05/2026 (dentro da etapa 11/02–10/05): entra no total. Recuperação em 11/05/2026 (fora): não entra.
4. Rascunho v4 com `contaNosTotais` abre; arquivo salvo sai v5, sem esse campo.
5. Celular 360 px: sem rolagem lateral no diálogo de tipo; alvos ≥ 44 px.

## Fora do escopo
- Mudar o mínimo padrão de 200.
- Biblioteca IFMG.
- Hospedagem.
