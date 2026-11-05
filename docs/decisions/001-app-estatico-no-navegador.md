# 001: Aplicativo estático, no navegador, sem login

- **Status:** aceito
- **Data:** 2026-11-05
- **Aprovado por:** Matheus, entrevista de planejamento

## Contexto
O Krono é aberto para qualquer instituição e será mantido por uma pessoa, com ajuda de IA. A primeira ideia era um sistema com login e calendários salvos num servidor. O Matheus propôs algo mais simples: a pessoa abre o site, monta o calendário, baixa o PDF e o Excel, e guarda o rascunho em um arquivo `.json`. A parte difícil do produto é a regra (conflitos, cores, dias letivos), não guardar contas.

## Decisão
Aplicativo web estático em TypeScript que roda inteiro no navegador: sem servidor, sem banco de dados e sem login. O rascunho é um arquivo `.json` com versão do formato, que a pessoa baixa e abre de novo; há também salvamento automático no próprio navegador (até 5 rascunhos recentes), com aviso de que pode ser apagado. PDF e Excel são gerados no navegador. O framework e as bibliotecas de PDF e Excel serão escolhidos na spec da Fase 1 (framework) e na spec de exportação, com a documentação atual consultada pelo Context7 e a licença conferida. A hospedagem é de site estático.

## Alternativas
- Django com login e banco (proposta anterior): permite compartilhar por link e editar em equipe, mas exige servidor, contas, dados pessoais (LGPD) e manutenção contínua.
- Aplicativo instalado no computador: dificulta a distribuição para outras instituições.

## Consequências
- Sem dados pessoais e sem custo de servidor; publicar fica simples.
- Não há compartilhamento por link, edição em equipe nem histórico na nuvem. Se um dia fizerem falta, o formato `.json` serve de base para acrescentar contas, sem refazer as regras.
- Quem limpar os dados do navegador perde o salvamento automático; o arquivo `.json` baixado é a cópia segura.

## Atualização (2026-11-05)
O salvamento automático no navegador (até 5 rascunhos) saiu. O rascunho é só o arquivo `.json` que a pessoa baixa e abre.
- O formato do `.json` precisa de versão e de migração, porque arquivos antigos têm de continuar abrindo.
- As regras ficam em módulos puros, o que facilita testar e trocar a interface depois.
