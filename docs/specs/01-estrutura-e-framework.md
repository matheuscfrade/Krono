# Spec: estrutura do app e escolha do framework

> Fase 1. Status: **implementada** (2026-11-05). Código da tela inicial, tokens e módulo de regras (versão do formato) no repositório.
>
> Termos em uma frase: **framework** = kit para montar o site; **módulo de regras** = pasta de cálculos (conflitos, feriados, dias letivos) separada das telas; **Vite** = ferramenta que empacota o site em arquivos estáticos; **React** = biblioteca para desenhar as telas; **Vitest** = ferramenta que roda testes automáticos; **token de visual** = variável de cor/espaço definida uma vez só.

## Objetivo
Deixar o Krono existindo como site estático em TypeScript, com o visual base de `docs/DESIGN.md` e uma pasta de regras testável, sem ainda montar o calendário completo.

**Quem usa nesta fase:** o Matheus (e a IA) para desenvolver; o elaborador só vê uma tela inicial simples, para confirmar que o site abre no computador e no celular.

## Abordagens consideradas
1. **Vite + React + TypeScript + Vitest (recomendada).** O `create-vite` oficial já gera um site só de arquivos (`dist/`), sem servidor. Documentação consultada no Context7 em 2026-11-05: modelo `react-ts` com React 19, `vite build` para hospedagem estática, Vitest lendo o mesmo `vite.config`. Licenças MIT (Vite, React, Vitest). Combina com o ADR 001 e com as skills de interface já no computador.
2. Vite + TypeScript puro (sem React). Menos biblioteca, mais trabalho em cada tela depois.
3. Next.js exportando site estático. O React oficial hoje empurra servidor; o Krono não tem servidor. Fica maior e mais fácil de escorregar para login/API.

**Escolha desta spec:** abordagem 1. Node.js 20.19+ ou 22.12+ (exigência atual do Vite). Sem Tailwind nesta fase: só `tokens.css` e `base.css`, como o DESIGN manda. Sem biblioteca de componentes de terceiros.

## Jornada (o que dá para fazer no fim desta fase)
No celular e no computador:
1. Abrir o site (endereço local de desenvolvimento, depois `dist/` no preview).
2. Ver o nome Krono, uma frase do que o app faz, e dois caminhos: **Novo calendário** e **Abrir rascunho**.
3. Se não houver rascunho no navegador, ver o estado vazio (“Nenhum rascunho neste navegador”) e o botão principal **Novo calendário**.
4. Clicar nos dois botões **não** abre o fluxo real ainda: mostra um recado curto “Em breve — ainda estamos montando esta parte.” (sem perder o layout).
5. Rodar os testes do módulo de regras (`npm test`) e o empacotamento (`npm run build`) no computador do desenvolvedor.

## Telas
**Início (única tela desta fase)**
- Mostra: título Krono, uma linha de proposta de valor, botão principal **Novo calendário**, botão secundário **Abrir rascunho**, área “Rascunhos neste navegador” no estado vazio (frase + sem lista; os 5 rascunhos de verdade são a spec da Fase 5).
- Ação principal: Novo calendário.
- Barra do rascunho: os dois botões visíveis, desabilitados com o mesmo recado “Em breve”, para o lugar deles já existir.
- Sem formulário de nome/ano ainda (isso é a spec de calendário).
- Sem rastreadores, sem pedido de conta, sem chamada de rede.

## Regras
- Nada do navegador (localStorage, DOM, React) entra no módulo de regras. Ver `docs/DOMINIO.md` e `AGENTS.md`.
- Nesta fase o módulo só precisa existir e ter **um teste real**, para a engrenagem de testes já rodar. Sugestão: constante `FORMATO_RASCUNHO_ATUAL = 1` e teste de que o número é 1. Regras de feriado, conflito e dias letivos **não** são implementadas aqui.
- Nenhuma regra da IN 2/2025 / IFMG no código; quando chegarem, serão ligáveis e genéricas (`DOMINIO.md`).

## Dados
- Ainda **não** há arquivo `.json` de rascunho nesta fase.
- Quando existir, a versão do formato começa em **1** (já prevista no módulo). Sem migração ainda.

## Estrutura de pastas (proposta)
```
src/
  dominio/          regras puras + testes (*.test.ts)
  ui/
    tokens.css
    base.css
  telas/
    Inicio.tsx
  App.tsx
  main.tsx
```
`src/dominio` não importa nada de `ui` nem de `telas`. O contrário pode importar funções do domínio.

Visual: só variáveis de `tokens.css` (marca `#1F5F8B` até o Matheus confirmar). Componentes base em `base.css` (botão, cartão, estado vazio). Fonte Inter se a licença Open Font License estiver ok; senão, fonte do sistema.

## Casos de erro e mensagens
- JavaScript desligado no navegador: mensagem no HTML estático: “O Krono precisa do JavaScript ligado neste navegador.”
- Teste ou build falhou no desenvolvimento: o trabalho desta fase não está aceito.
- Os botões “Em breve” usam `aria-disabled` e o recado visível; não fingem que salvaram nada.

## Critérios de aceite
1. O projeto nasce do modelo oficial Vite `react-ts` (`npm create vite@latest` com template `react-ts`), em TypeScript.
2. `npm test` (Vitest) passa, incluindo pelo menos um teste em `src/dominio`.
3. `npm run build` gera pasta `dist/` com HTML, CSS e JS estáticos, sem servidor.
4. Abrir o app no navegador mostra a tela Início com Krono, **Novo calendário** e **Abrir rascunho**, no computador e em largura de celular (375 px).
5. Não há login, cookie de rastreio, analytics nem pedido de rede ao usar a tela.
6. Cores, espaços e fonte da tela vêm só de `tokens.css` / `base.css` (nenhum hex solto no componente, salvo conteúdo de token).
7. Licenças das bibliotecas desta fase conferidas e anotadas no README (MIT).
8. README explica, em português, como rodar `npm install`, `npm run dev`, `npm test` e `npm run build` no Windows (PowerShell).

## Fora do escopo
- Criar calendário, feriados, períodos, eventos, conflitos, PDF, Excel, abrir/salvar `.json`, os 5 rascunhos de verdade, troca de ano, regras ligáveis.
- Next.js, backend, banco, login.
- Biblioteca de PDF/Excel (Fase 6).
- `git init` (continua com o Matheus).
- Nome final, domínio, hospedagem, licença do **código do Krono** (Fase 7). A licença das bibliotecas usadas, sim, entra aqui.

## Como testar (depois de programar)
1. No PowerShell, na pasta do projeto: `npm test` e `npm run build`.
2. `npm run dev` e abrir no navegador: clicar os botões e ver o recado “Em breve”.
3. Estreitar a janela (celular) e conferir um botão por vez, alvos grandes, texto legível.
4. No DevTools, aba rede: nenhuma chamada para fora ao carregar a Início.

## Consulta de documentação (Context7, 2026-11-05)
- Vite `/vitejs/vite`: `npm create vite@latest`; template React+TS; `vite build` → `dist/` para hospedagem estática; Node 20.19+ ou 22.12+.
- React `/reactjs/react.dev`: app React com Vite e TypeScript (`--template react-ts`); não usar fluxo de servidor.
- Vitest `/vitest-dev/vitest`: script `"test": "vitest"`; configuração no `vite.config` (propriedade `test`) ou `vitest.config.ts`.
