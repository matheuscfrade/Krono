# AGENTS.md: Krono

Aplicação web, sem login e sem servidor, para elaborar calendários acadêmicos: o usuário cadastra as datas uma vez, o sistema pinta os meses com cores automáticas (editáveis), avisa os conflitos e gera a tabela de eventos em PDF e Excel. Tudo roda no navegador. O rascunho é um arquivo `.json` que a pessoa baixa e abre de novo. Aberto para qualquer instituição.

## Leia nesta ordem
1. `docs/ROADMAP.md` (onde paramos e o próximo passo)
2. `docs/PRD.md`, `docs/DOMINIO.md`, `docs/UX.md` e `docs/DESIGN.md` (antes de qualquer tela)
3. A spec da funcionalidade em `docs/specs/`

## Regras
- Sem spec, sem código. Para uma funcionalidade nova, use primeiro a skill `escrever-spec`.
- Tecnologia: aplicativo web estático em TypeScript, tudo no navegador (ver `docs/decisions/001-app-estatico-no-navegador.md`). Sem servidor, sem banco de dados, sem login. O framework é escolhido na primeira spec, com a documentação atual consultada pelo Context7.
- As regras de conflito, de cor e de contagem de dias letivos ficam em um módulo separado das telas, sem depender de nada do navegador, com testes automáticos. Nunca dentro de componente de tela.
- O rascunho é um `.json` com número de versão do formato. Todo arquivo de versão antiga precisa continuar abrindo (migração). Mudou o formato, atualize `docs/DOMINIO.md`.
- Nada é enviado a servidor, e não há rastreadores. O rascunho é só o arquivo `.json` que a pessoa baixa e abre de novo. Sem cópia automática no navegador.
- PDF e Excel são gerados no navegador, a partir da mesma lista de eventos do calendário e da tabela. Nunca digitar a mesma informação duas vezes.
- Antes de adicionar uma biblioteca, confira a licença e a necessidade; prefira poucas e conhecidas.
- Celular e computador: tela clara, uma ação principal por tela. Ao terminar uma tela, use `revisar-ux-da-tela`.
- Mudanças pequenas e testadas. Decisão grande vira ADR.
- Ao terminar, atualize `docs/ROADMAP.md`. Em sessão nova, leia-o primeiro.
- `docs/referencias/` guarda calendários reais só para consulta; não copie o conteúdo para o código.

## Skills globais (já existem no computador do Matheus)
`frontend-ux-engineer`, `tdd-test-engineer`, `security-audit`, `git-github-flow`, `architecture-review`.

## Skills do projeto
`escrever-spec`, `revisar-ux-da-tela` (em `.grok/skills/`).
