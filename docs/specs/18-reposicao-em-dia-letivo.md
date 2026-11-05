# Spec: reposição em dia já letivo

> Status: **implementada** (2026-11-05).

## Objetivo
Dá para lançar uma reposição **num dia que já é aula** (terça da etapa, por exemplo). O fundo de dia letivo **permanece**; entra a **marca** de reposição da aula original. A soma dos 200 **não aumenta**. O Krono avisa e recomenda repor em dia que ainda não é letivo, se a pessoa quiser somar.

**Quem usa:** quem elabora o calendário.

## Contexto
Hoje a reposição **recusa** dia já letivo. Isso impede marcar no calendário “esta terça é reposição da sexta 03/04”, mesmo quando a instituição só quer o rótulo no dia (o total já estava contado).

Feriado e recesso continuam recusando. Domingo continua recusando.

## Jornada
1. Calendário 2026, etapa 02/02–30/04. 03/04 é Sexta-feira Santa.
2. **Adicionar evento** → Reposição. Data original 03/04. Dia novo: **terça 14/04** (já é aula da etapa).
3. Salva. Aviso: este dia já é aula; a marcação não aumenta o total; para somar, reponha num dia que ainda não é letivo.
4. 14/04: fundo de dia letivo da etapa + marca de Reposição. Continua 1 dia letivo. A tabela mostra a reposição.
5. Outra reposição da mesma original em sábado 11/04: recusa (original já reposta). Outra reposição em 14/04: recusa (dia já tem reposição).
6. Reposição em sábado 18/04 ainda **sem** aula: fundo da etapa + marca, **soma** 1 no total (como hoje). Sem aquele aviso de “já é aula”.
7. Celular 360 px: o aviso cabe na lista; Salvar ≥ 44 px.

## Telas
Formulário de Reposição (Eventos ou **Repor** no feriado): igual, sem campo novo.

**Avisos e conflitos** e o painel do dia: o aviso da reposição em dia já letivo, com como resolver.

Ajuda de pintura da reposição: “O dia fica marcado como reposição da aula original. Se o dia já era aula, o total não aumenta.”

## Regras
Cálculo em `src/dominio`, com testes. Sem React.

- Feriado, recesso, férias/exames/recuperação/retirada que **não combinam**, e domingo: **erro** (como hoje).
- Dia **já letivo**: **salva**. Aviso, não erro.
- Total: o dia já era aula → continua 1. Não vira 2.
- Pintura: **fundo de dia letivo** + **marca de Reposição** (o dia continua aula). Igual no dia que já era letivo e no que passou a ser aula.
- Duas reposições no mesmo dia novo: erro. Duas da mesma original: erro.
- Aviso de mesmo dia da semana: continua.

## Dados
Formato do rascunho **permanece 5**. Nenhum campo novo. Arquivo antigo abre.

## Casos de erro
| Situação | Mensagem |
|---|---|
| Dia já letivo (aviso) | “Este dia já é aula. A reposição marca o calendário e não aumenta o total de dias letivos. Para somar um dia, reponha num sábado ou em outro dia que ainda não seja letivo.” |
| Como resolver | “Mantenha a marcação, ou apague e lance a reposição num dia que ainda não é aula.” |
| Feriado/recesso | “Reposição não pode cair em feriado ou recesso.” (igual) |
| Já letivo — some | (não é mais erro) |

## Critérios de aceite
1. Reposição em 14/04/2026 (terça na etapa 02/02–30/04), original 03/04: salva. `diaEhLetivo` true. Total do ano igual ao de antes de lançar. Aviso com o texto acima. Pintura: fundo da etapa + marca Reposição.
2. Reposição em 11/04/2026 (sábado sem aula), original 03/04: salva, total **aumenta** 1, fundo da etapa + marca. Sem o aviso de “já é aula”.
3. Segunda reposição da mesma original, ou no mesmo 14/04: recusa (mensagens de hoje).
4. Feriado e domingo: recusam.
5. Celular 360 px: aviso visível; Salvar ≥ 44 px.

## Fora do escopo
- Permitir duas reposições da mesma original.
- Reposição em feriado.
- Mudar quando o botão **Repor** aparece na lista de feriados (spec 10).
- Hospedagem.
