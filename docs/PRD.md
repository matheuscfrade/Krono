# PRD: Krono

> Visão de produto, sem tecnologia. Fechado na entrevista de 2026-11-05 (versão sem login).

## Problema
Quem elabora o calendário acadêmico de uma escola ou instituto hoje faz à mão, em planilha ou editor de texto. Pintar os meses, conferir se uma data bateu com feriado ou recesso, contar dias letivos e montar a tabela de eventos dá trabalho e é fácil errar. Cada alteração obriga a refazer tudo. No IFMG, o calendário pronto é cadastrado depois no SUAP, mas a elaboração acontece fora dele.

## Para quem
- **Elaborador:** pessoa que monta o calendário de uma escola, instituto ou universidade, de qualquer instituição. Uma instituição costuma ter vários calendários por ano (Técnicos, Graduação, Pós e outros); cada um é um rascunho separado.
- **Quem só consulta:** recebe o PDF pronto.

## Proposta de valor
Abrir o site, sem criar conta, cadastrar as datas uma vez e receber o calendário colorido, a tabela de detalhamento, os avisos de conflito e o PDF e o Excel prontos, sem retrabalho.

## Escopo do MVP
1. Uso direto no navegador, sem conta e sem login. Nada é enviado a servidor. (ADR 001 aceito em 2026-11-05.)
2. Rascunho em arquivo `.json`: salvar (baixar) e abrir de novo. Sem cópia automática no navegador.
3. Calendário com nome, ano e instituição (texto livre). Vários calendários por ano = vários arquivos.
   - Sempre começa **vazio** (nome, instituição e ano). Não há modelo pronto de instituição.
   - Com o ano, o Krono já traz os **feriados nacionais** e os **recessos** nacionais (Carnaval, Quarta-feira de Cinzas, Corpus Christi) na mesma lista. Dá para editar ou apagar cada data. Feriado e recesso são tipos diferentes, com cores e legenda próprias. Ponto facultativo (administrativo) não entra.
   - Feriados estaduais, municipais e do campus são cadastrados pelo próprio usuário, do mesmo jeito. Atalho por UF fica para uma fase seguinte.
   - O usuário pode editar ou apagar qualquer feriado trazido automaticamente.
   - **Troca de ano** e **salvar como novo ano** (abrir rascunho antigo e gerar o ano seguinte) entram no MVP: o Krono avisa e a pessoa escolhe manter as alterações ou voltar aos feriados padrão do ano novo.
4. Períodos com início e fim; o **nome é livre** (etapa, semestre, módulo…).
5. Tipos de marcação (letivo, feriado, recesso, férias, exames, reposição, evento e outros) com cor gerada automaticamente e editável, e legenda automática.
6. Lançamento de eventos em uma data ou em um intervalo, com tipo e descrição.
7. Visão anual com os 12 meses coloridos. Fundo do dia: letivo, feriado ou recesso. Os demais eventos aparecem como quadradinhos na célula (até 4, depois um **+**).
8. Tratamento de conflitos, mostrado no dia afetado (ver `docs/DOMINIO.md`).
9. Tabela de detalhamento por período (mês, dia ou intervalo, evento), com totais de dias letivos por mês, por período e no ano.
10. Exportação em PDF (meses coloridos mais tabela) e em planilha Excel.
11. **Regras ligáveis:** o mínimo padrão de dias letivos é **200 no ano** (LDB), editável. Exames finais ficam de fora dessa conta por padrão. Há uma lista de conferência de itens do calendário e sugestão das semanas temáticas da legislação nacional. Tudo liga e desliga; nada é gravado só para o IFMG. Detalhe em `docs/DOMINIO.md`.

## Fora do escopo (por enquanto)
- Contas, login, compartilhamento por link, edição em equipe e armazenamento na nuvem.
- Integração automática com o SUAP ou outro sistema (o cadastro lá continua manual).
- Aplicativo de celular nativo (o site funciona bem no celular).
- Agenda pessoal, convites e notificações.
- Horário de aulas, carga horária em horas e controle de frequência.
- Atalho de feriados estaduais por UF (estadual se lança como o municipal).
- Modelo pronto de calendário (o caminho é o rascunho antigo).

## Sucesso
- Refazer o calendário 2026 dos Cursos Técnicos do campus Formiga (`docs/referencias/`) e chegar a um PDF equivalente ao original.
- Um elaborador monta um calendário novo sem planilha de apoio, começando vazio ou a partir de um rascunho baixado.
- Nenhum conflito fica sem aviso.
- Meta de tempo de elaboração: definir na Fase 7 (publicação).

## Decisões fechadas (2026-11-05)
- Feriados nacionais vêm a partir do ano; estaduais, municipais e do campus ficam com o usuário.
- Recessos (Carnaval, Cinzas, Corpus Christi) entram na lista como os feriados: editar e apagar, sem interruptor. Ponto facultativo (administrativo) não entra.
- Mínimo padrão: 200 dias letivos no ano, número editável; o aviso olha o ano; exames finais fora da conta por padrão.
- Primeiro calendário sempre vazio; aproveitar o anterior é abrir o arquivo `.json` e “salvar como novo ano”.
- Nome, domínio, licença do código, se o produto é gratuito, ferramenta usada hoje na elaboração e meta de tempo: Fase 7.
- Conferir a lista de feriados nacionais com a lei na spec de feriados, e revisá-la uma vez por ano (ROADMAP).
