# Spec: recesso no lugar de ponto facultativo

> Fase 3. Status: **implementada** (2026-11-05).
>
> Termos em uma frase: o Krono trata só o **acadêmico**; **ponto facultativo** (administrativo) some; **recesso** passa a ser lançado e pintado como o ponto era.

## Objetivo
Carnaval, Cinzas, Corpus Christi e os recessos escolares pintam o **fundo** do dia e saem da lista de eventos. Feriado continua feriado.

**Quem usa:** quem monta o calendário.

## Jornada
1. Novo calendário 2026: 16/02 e 17/02 Carnaval, 18/02 Cinzas e 04/06 Corpus Christi já estão na lista **Feriados e recessos**, tipo Recesso, fundo laranja, sem letivo.
2. **Adicionar feriado ou recesso**: tipo Recesso, “Recesso escolar”, 15/06 a 30/06. Junho pinta fundo de Recesso nesses dias (sábado e domingo inclusive).
3. **Adicionar evento** não oferece Recesso. Tipos: Férias, Exames finais, Recuperação, Sábado letivo, Evento.
4. Feriado no mesmo dia de recesso (ex.: Padroeira em 16/02): fundo Feriado, recesso vira marca.

## Telas
- Bloco **Feriados e recessos** (antes “Feriados e pontos facultativos”).
- Botões **Adicionar feriado ou recesso**. Formulário: tipo Feriado | Recesso.
- Painel do dia e arraste: mesma escolha, sem a palavra “ponto”.

## Regras
Ver `docs/DOMINIO.md`. Pintura spec 06, com fundo = feriado; senão **recesso**; senão letivo.

- Carnaval, Cinzas e Corpus: `tipo-recesso`, origem automática (como o ponto era).
- Recesso **não** está em `TIPOS_EVENTO`. Lançar pelo bloco de feriados/recessos (`adicionarFeriadoManual` com `tipo: 'recesso'`).
- Dois recessos que se cruzam: erro de cruzamento (igual ao ponto).
- Tipo `tipo-ponto-facultativo` some dos tipos padrão. Cor estável de Recesso continua `#dd6b20`.
- Formato do rascunho continua **1**. Campo `pontosFacultativos` permanece no JSON (ligado na criação) para não mudar a versão; a tela segue sem interruptor.

## Critérios de aceite
1. 16/02/2026 com etapa: fundo Recesso, sem letivo, sem marca.
2. Recesso manual 15/06–30/06: 16/06 e 20/06 fundo Recesso.
3. `adicionarEvento` com `tipo-recesso` recusa (“Escolha o tipo do evento.”).
4. Dois recessos que se cruzam recusam.
5. Feriado manual em 16/02: fundo Feriado, marca Recesso (Carnaval).
6. Tipos padrão **não** incluem Ponto facultativo.
7. `npm test` cobre 1–6. Nenhuma chamada de rede.

## Fora do escopo
- Spec 07 (ajuda no cadastro), ainda esperando.
- Reposição, 200 dias, `.json` baixar/abrir.

## Como testar
1. `npm test`.
2. `npm run dev`: calendário 2026, 16/02 laranja de recesso. Adicionar recesso em junho pelo bloco de feriados. Evento sem opção Recesso.
