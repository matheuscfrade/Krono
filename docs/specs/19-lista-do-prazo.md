# Spec: lista restrita do prazo mínimo

> Status: **implementada** (2026-11-05).

## Objetivo
No prazo mínimo, origem e destino são só **início/fim de cada período** e tipos de marco do calendário (férias, exames, recuperação, tipo criado). Feriado, recesso, evento, reposição, sábado letivo e retirada **não** entram na lista — se repetem no ano e fariam a regra disparar em todo lançamento.

**Quem usa:** quem elabora o calendário.

## Contexto
A regra vale para **cada** origem daquele tipo até o **primeiro** destino depois dela. Com Evento ou Feriado na origem, cada feriado pediria espaço até o Y. Art. 129 continua: Fim de cada período → Exames finais.

**Precisa existir** continua com a lista completa de tipos.

## Jornada
1. Regras → Adicionar regra → Prazo mínimo.
2. Origem e destino: Início de cada período, Fim de cada período, Férias, Exames finais, Recuperação (e tipos criados). Sem Feriado, Recesso, Evento, Reposição, Sábado letivo, Retirada.
3. Salva Fim de cada período → Exames finais, 2 úteis. Igual ao Art. 129.
4. Celular 360 px: os dois selects usáveis; Salvar ≥ 44 px.

## Telas
Formulário **Prazo mínimo**: a lista filtrada nos dois selects. Destino continua com “Escolha…”.

## Regras
`tiposParaPrazo` em `src/dominio`. A lista passou a ser o interruptor **Pode ser origem ou destino de prazo** (spec 20). Padrão atual: só **Exames finais** ligado; Férias, Recuperação e tipo criado vêm desligados. Feriado, Recesso, Evento, Reposição, Sábado letivo, Retirada e tipo letivo da etapa também desligados.

Rascunho antigo com origem Feriado **continua valendo** até a pessoa editar. Ao editar, esse valor ainda aparece se já estiver salvo.

Formato do rascunho **permanece 5**.

## Casos de erro
Nenhum novo.

## Critérios de aceite
1. Origem/destino do prazo: Início e Fim de cada período, Férias, Exames finais, Recuperação. Sem Feriado, Recesso, Evento, Reposição, Sábado letivo, Retirada.
2. Precisa existir ainda lista Feriado e Evento.
3. Tipo criado pela pessoa entra no prazo.
4. Celular 360 px: selects usáveis, Salvar ≥ 44 px.

## Fora do escopo
- Escolher um lançamento específico (esta etapa, estes exames).
- Hospedagem.
