# Spec: calendário, períodos e tipos de marcação

> Fase 2. Status: **implementada** (2026-11-05).
>
> Termos em uma frase: **período** = fatia do ano com nome, início e fim (etapa, semestre…); **tipo de marcação** = categoria com nome e cor (feriado, letivo…); **dia letivo** = dia de aula, em geral segunda a sexta dentro de um período.

## Objetivo
O elaborador cria um calendário (nome, instituição, ano), define períodos e vê os 12 meses. Dias úteis dentro de um período já aparecem pintados como dia letivo daquele período.

**Quem usa:** a pessoa que monta o calendário da escola.

## Jornada
No computador e no celular:
1. Na Início, toca **Novo calendário**.
2. Preenche nome, instituição e ano. Toca **Criar calendário**.
3. Entra na tela do ano (12 meses). Ainda não há período: os dias ficam sem cor de tipo; um estado vazio pede **Adicionar período**.
4. Informa nome livre, data de início e data de fim. Salva.
5. Segunda a sexta daquele intervalo pintam com a cor do tipo **Dia letivo — {nome}**. Sábado e domingo ficam sem essa cor.
6. Pode adicionar outro período, editar ou apagar. A legenda lista só os tipos que aparecem no ano.
7. **Voltar ao início** pede confirmação: o trabalho ainda não vira arquivo (isso é a Fase 5).

Abrir rascunho continua “Em breve”.

## Telas

**Novo calendário**
- Campos, um por linha, rótulo acima: Nome do calendário, Instituição, Ano (número, quatro dígitos).
- Ano inicial: o ano civil de hoje.
- Ação principal: **Criar calendário**.
- Link ou botão secundário: Voltar (volta à Início sem criar).
- Ainda **não** mostra feriados nem interruptores de ponto facultativo (spec seguinte).

**Calendário (tela principal)**
- Cabeçalho: nome, instituição, ano.
- Ação principal: **Adicionar período** (ou **Adicionar evento**, desabilitado com “Em breve”, se o botão de evento já ocupar o lugar da Fase 3 — nesta fase o principal é o período).
- Os 12 meses, domingo à sábado, largura toda. No celular: um mês por linha. No computador: vários meses por linha, sem espremer o dia abaixo de 32 px.
- Dias de outro mês na grade: visíveis, apagados, sem cor de tipo.
- Painel ou bloco **Períodos**: lista nome + datas; editar e apagar.
- **Legenda:** cor, nome e quantidade de dias de cada tipo **usado**.
- Barra do rascunho: Abrir e Salvar ainda desabilitados, recado “Em breve”.
- Tipos de marcação: lista só leitura nesta fase (padrão + um “Dia letivo” por período). Trocar cor e criar tipo extra ficam na spec de cores / eventos.

**Formulário de período** (painel ou bloco na mesma página, sem trocar de rota se possível)
- Nome (livre), Início, Fim.
- Ação principal: **Salvar período**.
- Apagar só na edição, com confirmação (“Apagar a 1ª Etapa? Os dias letivos desse período saem do calendário.”).

## Regras
Ver `docs/DOMINIO.md`. Cálculo no módulo `src/dominio`, com testes. Telas só mostram o resultado.

- Calendário: nome e instituição com texto (mínimo 1 caractere depois de cortar espaços); ano inteiro de 1900 a 2100.
- Período: nome livre, mínimo 1 caractere; início ≤ fim; as duas datas no ano do calendário.
- Dois períodos **não** podem ter dia em comum (erro ao salvar). Mensagem: “Este período cruza com {nome} ({início} a {fim}). Ajuste as datas.”
- Dia **segunda a sexta** que cai dentro de exatamente um período = tipo letivo daquele período. Sem evento ainda.
- Sábado, domingo e dia fora de qualquer período = sem tipo nesta fase (sem aviso de lacuna ainda; isso é a spec de conflitos).
- Ao criar um período, o sistema cria o tipo `Dia letivo — {nome}`. Ao renomear o período, o nome do tipo muda. Ao apagar o período, o tipo some se não restar dia.
- Tipos padrão, já existentes no calendário novo (mesmo sem aparecer na legenda até haver dia): Feriado, Ponto facultativo, Recesso, Férias, Exames finais, Recuperação, Reposição, Evento. Cores estáveis de `DESIGN.md` (feriado vermelho, recesso laranja, férias verde-azulado, exames roxo, letivo azul — um tom por período). Paleta automática e troca manual de cor: spec seguinte.
- Quadrado dividido, feriados, conflitos, JSON baixado: fora desta spec.

## Dados
Ainda **não** baixa `.json`. O calendário vive na memória da sessão (React). Recarregar a página perde o trabalho; o Voltar avisa isso.

Formato interno alinhado ao futuro rascunho versão **1** (`FORMATO_RASCUNHO_ATUAL`):

- `calendario`: `{ nome, instituicao, ano }`
- `periodos`: `{ id, nome, inicio, fim }` (datas `YYYY-MM-DD`)
- `tiposDia`: `{ id, nome, cor, padrao: sim/não }`
- `eventos`: lista vazia nesta fase

Sem migração.

## Casos de erro e mensagens
| Situação | Mensagem |
|---|---|
| Nome ou instituição vazios | “Escreva o nome do calendário.” / “Escreva o nome da instituição.” |
| Ano fora de 1900–2100 ou não numérico | “Informe um ano com quatro números, entre 1900 e 2100.” |
| Nome do período vazio | “Escreva o nome do período.” |
| Data vazia | “Informe o início.” / “Informe o fim.” |
| Fim antes do início | “A data final precisa ser no mesmo dia ou depois da inicial.” |
| Data fora do ano | “Use uma data de {ano}.” |
| Períodos cruzados | “Este período cruza com {nome} ({início} a {fim}). Ajuste as datas.” |
| Voltar com calendário criado | “Este calendário ainda não foi baixado. Se voltar, o trabalho some. Voltar mesmo assim?” |

## Critérios de aceite
1. Início: **Novo calendário** abre o formulário (some o recado “Em breve” desse botão).
2. Criar “Cursos Técnicos”, “IFMG”, ano **2026** abre a tela dos 12 meses de 2026.
3. Sem período, janeiro/2026 mostra os dias do mês e nenhum dia letivo na legenda.
4. Período “1ª Etapa”, 02/02/2026 a 30/04/2026: 02/02/2026 (segunda) pinta como Dia letivo — 1ª Etapa; 01/02/2026 (domingo) não; 01/05/2026 fica fora.
5. Segundo período “2ª Etapa” 02/02/2026–10/02/2026 recusa com a mensagem de cruzamento.
6. Período 01/01/2027 no calendário 2026 recusa: “Use uma data de 2026.”
7. Apagar a 1ª Etapa tira a cor letiva daqueles dias e o tipo da legenda (se não restar).
8. Celular ~360 px: meses empilhados, sem rolagem lateral, botões ≥ 44 px.
9. `npm test` cobre: datas no ano, início ≤ fim, cruzamento, segunda-feira dentro do período é letivo, sábado dentro do período não é letivo (nesta fase).
10. `src/dominio` não importa React, DOM nem CSS.
11. Nenhuma chamada de rede ao criar calendário ou período.

## Fora do escopo
- Feriados nacionais, Páscoa, interruptores de ponto facultativo, troca de ano.
- Lançar eventos, reposição ligada a outra data, quadrado dividido.
- Conflitos (lacuna, mínimo de 200, itens de conferência).
- Editar cor, criar tipo extra, tabela, PDF, Excel.
- Salvar/abrir `.json` e os 5 rascunhos no navegador.
- Regras ligáveis da IN / LDB.

## Como testar (depois de programar)
1. `npm test` e `npm run build`.
2. `npm run dev`: Novo calendário → 2026 → adicionar 1ª Etapa 02/02 a 30/04 → ver fevereiro pintado em dias úteis.
3. Tentar período cruzado e data de 2027; ler as mensagens.
4. Estreitar a janela a 360 px.
