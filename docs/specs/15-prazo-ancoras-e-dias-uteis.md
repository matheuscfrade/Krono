# Spec: âncoras de período e dias úteis no prazo

> Status: **implementada** (2026-11-05).

## Objetivo
A pessoa consegue montar, no próprio calendário, as regras de prazo e de “precisa existir” que a **IN 2/2025** (Art. 10) e a **Resolução CONSUP 01/2026** pedem no calendário. O Krono continua sem lista pronta do IFMG: o elaborador cria a regra, com o N e a unidade que a norma usar.

**Quem usa:** quem elabora o calendário.

## Contexto
Hoje o prazo só mede **dias corridos** e o destino é só um **tipo de evento**. Origem já tem “Fim de cada período”.

Isso **não** expressa o Art. 129, § 1º da Resolução 01/2026:

> O exame final deverá ser previsto no Calendário Acadêmico, respeitando o intervalo de **2 (dois) dias úteis** entre a sua realização e o encerramento do período letivo.

Faltam: destino “Fim de cada período”, origem “Início de cada período”, e contar **dias úteis** (e, se a norma pedir, **dias letivos**).

Consulta (não vai para o código): `SEI_2605056_Resolucao_do_Conselho_Superior_1.pdf`, `docs/referencias/SEI_2189302_Instrucao_Normativa_2.pdf`.

## O que a norma pede e o que o Krono já cobre

**Já dá (Precisa existir + tipos + mínimo 200):**
- IN Art. 10 I, II, III, X, XI: períodos, dias letivos, feriados/recesso, totais, sábado letivo.
- IN Art. 10 IV, IX e XII–XIX: criar regra “Precisa existir” (Férias, Recesso, Exames, Recuperação, matrícula, colação, semanas temáticas…).
- Resolução Art. 13 *caput*: mínimo 200; exames fora da conta (interruptor **Conta nos totais** do tipo Exames, desligado no padrão).
- Resolução Art. 129 *caput* + “previsto no calendário”: Precisa existir / Exames finais.

**Ainda não dá:**
- Art. 129 § 1º: intervalo de **2 dias úteis** entre exame e **fim do período**.
- Art. 75: até **5 dias letivos após o início** do período (matrícula extemporânea) — só entra se a pessoa quiser marcar esse prazo no calendário; origem precisa ser **início do período** e unidade **dias letivos**.
- Qualquer prazo “do início/fim da etapa até um evento” ou “de um evento até o fim da etapa”.

Fora do calendário (não vira regra do Krono): lançar nota no sistema em 15 dias úteis (Art. 120), revisão de prova, PEI, frequência 75%, etc.

## Jornada
1. Regras → Adicionar regra → **Prazo mínimo**.
2. Origem: **Fim de cada período**. Destino: **Exames finais**. Unidade: **Dias úteis**. Mínimo: 2. Salva.
3. Etapa termina numa sexta; exames na segunda seguinte → 1 dia útil → aviso. Exames na terça → 2 dias úteis → sem esse aviso.
4. Quem precisar do inverso (exames **antes** do fechamento): origem Exames finais, destino **Fim de cada período**, mesma unidade.

## Telas
Formulário da regra **Prazo mínimo**:
- Origem e destino, **a mesma lista:** Início de cada período; Fim de cada período; cada tipo de marcação (exceto letivo da etapa).
- Unidade: **Dias corridos** (padrão, igual hoje) | **Dias úteis** | **Dias letivos**.
- Mínimo (número ≥ 1).
- Gravidade aviso/erro.

Placeholder “Escolha…” só no destino, se ainda vazio.

## Regras
Cálculo em `src/dominio`, com testes. Sem React.

**Âncora:**
- Início de cada período → `periodo.inicio`.
- Fim de cada período → `periodo.fim`.
- Tipo → origem usa `evento.fim`; destino usa o primeiro evento daquele tipo com `inicio >= âncora da origem`.

Para cada origem, achar o destino **na mesma direção de hoje** (destino não anterior à origem). Distância `< N` → conflito 10. Destino ausente no ano: não dispara (Precisa existir cuida).

**Unidade** (do dia seguinte à origem até o dia do destino, inclusive o destino):
- **Corridos:** todos os dias no calendário (hoje: 15/12 → 16/12 = 1).
- **Úteis:** segunda a sexta **sem** feriado nem recesso neste calendário. Sábado e domingo não entram.
- **Letivos:** dias em que `diaEhLetivo` é verdadeiro.

[CONFIRMAR] Art. 129 § 1º: origem **Fim de cada período**, destino **Exames finais**, 2 úteis. O § 2º manda divulgar quem está em exame até o último dia do período, então o exame fica **depois** do fechamento. Se a leitura for “dois úteis **antes** do fim”, a pessoa inverte origem e destino.

[CONFIRMAR] Dia útil ignora feriado **e** recesso lançados no calendário.

Exemplo de aceite (2026, 18/12 é sexta):
- Período termina **2026-12-18**. Sem feriado no meio.
- Exames **2026-12-21** (segunda) → 1 dia útil → aviso se N = 2.
- Exames **2026-12-22** (terça) → 2 dias úteis → sem esse aviso.

## Dados
Formato do rascunho passa para **3**. v2 continua abrindo: prazo antigo vira `unidade: 'corridos'`.

Campo novo na regra prazo: `unidade: 'corridos' | 'uteis' | 'letivos'`. Origem/destino passam a aceitar `'inicio-periodo' | 'fim-periodo' | tipoId`.

## Casos de erro
| Situação | Mensagem |
|---|---|
| Prazo sem destino ou N < 1 | “Informe o destino e um número de dias maior que zero.” |
| Prazo descumprido | “Entre {origem} ({data}) e {destino} ({data}) há {n} {unidade}. A regra pede pelo menos {N}.” |
| Precisa existir, ausente | “Este calendário não tem {nome da regra}.” |

Unidade no texto: “dia(s) corrido(s)” / “dia(s) útil(eis)” / “dia(s) letivo(s)”.

## Critérios de aceite
1. Origem e destino mostram **Início de cada período**, **Fim de cada período** e os tipos. Listas iguais (destino tem o placeholder vazio a mais).
2. Art. 129 § 1º: período fim 18/12/2026, exames 21/12 → aviso (1 útil, N = 2). Exames 22/12 → some.
3. Prazo antigo (formato 2, só corridos) abre e continua medindo em corridos.
4. `npm test` cobre 2–3. Sem React/DOM no domínio. Sem lista da IN em calendário novo.
5. Celular 360 px: unidade e os dois selects usáveis, Salvar ≥ 44 px.

## Fora do escopo
- Biblioteca de regras “IFMG pronta” (a pessoa monta).
- Expressões livres (“se feriado cair em terça”).
- Hospedagem (Fase 7).
- Prazos de lançamento de nota no sistema (Art. 120), revisão de prova, frequência.
