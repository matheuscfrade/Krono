# Krono

Elaboração de calendários acadêmicos no navegador: sem login e sem servidor. Você cadastra as datas uma vez; o Krono pinta o ano, avisa conflitos e gera PDF e Excel. O rascunho é um arquivo `.json` que você baixa e abre de novo.

Nada é enviado a servidor. Os dados ficam no seu computador.

Uso: [matheuscfrade.github.io/Krono](https://matheuscfrade.github.io/Krono/)

Status: primeira versão usável (fases 1–6). Veja `docs/ROADMAP.md`.

Developed by Matheus Costa Frade.

## Como rodar

Node.js 20.19+ ou 22.12+.

```powershell
npm install
npm run dev
```

Abra `http://localhost:5173/`.

```powershell
npm test          # testes do módulo de regras
npm run build     # gera a pasta dist/ (site estático)
npm run preview   # serve o dist/ localmente
```

## O que não entra no GitHub

- Calendários e normas de instituições (`*.pdf` e `docs/referencias/`, só consulta local)
- Rascunhos `.json` da pessoa
- `node_modules/`, `dist/`, `.env`

Não há senhas, tokens nem rastreadores no código.

## Bibliotecas (licença MIT)

- Vite
- React e React DOM
- Vitest
- TypeScript
- @vitejs/plugin-react
- oxlint
