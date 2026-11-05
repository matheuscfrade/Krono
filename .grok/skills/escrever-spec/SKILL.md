---
name: escrever-spec
description: Use quando o Matheus pedir para começar uma funcionalidade nova ou uma tela nova, ou quando for preciso código e ainda não existe spec em docs/specs/. Escreve a spec e espera aprovação antes de qualquer código. Não use para correção pequena de bug.
---

# Escrever a spec de uma funcionalidade

1. Leia `docs/ROADMAP.md`, `docs/PRD.md`, `docs/DOMINIO.md` e `docs/UX.md`. Veja se já existe spec parecida em `docs/specs/`.
2. Faça ao Matheus poucas perguntas, uma de cada vez, só sobre o que faltar (quem usa, em que momento, o que acontece de errado).
3. Crie `docs/specs/<nome-curto>.md` com:
   - **Objetivo** (1 a 2 frases) e **quem usa**;
   - **Jornada** passo a passo, no celular e no computador;
   - **Telas** (o que mostra, qual é a ação principal);
   - **Regras** (com link para `DOMINIO.md`; itens `[CONFIRMAR]` ficam explícitos);
   - **Dados** novos ou alterados e o que muda no rascunho `.json` (com a versão do formato e a migração);
   - **Casos de erro** e mensagens;
   - **Critérios de aceite** (lista que dá para testar, com exemplos de datas);
   - **Fora do escopo**.
4. Mostre a spec e espere o "aprovado" do Matheus. Só depois proponha o plano de implementação, em passos pequenos.
5. Atualize o `docs/ROADMAP.md` (a spec fica "esperando o Matheus" até a aprovação).
