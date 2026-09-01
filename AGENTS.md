# AGENTS.md — Meeting Cost CLI

CLI Node.js (`meeting-cost-cli`) que calcula o custo total de mão de obra de uma reunião a partir de três argumentos: participantes, duração em minutos e custo por hora. Sem UI, servidor, banco ou rede.

## Repositório e comandos

```
harness-score-example/
├── .agents/                # rules, skills, workflows
├── .github/workflows/ci.yml
├── AGENTS.md
├── biome.json
├── package.json
├── PROJETO.md
├── src/
│   ├── calculate-meeting-cost.js
│   └── cli.js
├── test/
│   └── calculate-meeting-cost.test.js
└── tsconfig.json
```

- Separe domínio (`calculateMeetingCost`) de I/O (`src/cli.js`). Não duplique validação na CLI.
- Runtime: **Node.js >= 24**; ESM com extensão `.js`; sem dependências de runtime.
- **Comandos:** `npm start`, `npm test`, `npm run lint`, `npm run format`, `npm run typecheck`, `npm run check` (lint + typecheck + test).
- Smoke: `npm start -- 5 60 100` → `Custo total da reunião: 500.00 (5 participante(s), 60 min, 100/h)`.
- Verificação completa: `npm run check` ou workflow em `.agents/workflows/verify.md`.

## Domínio, runtime e segurança

**`calculateMeetingCost(participants, durationMinutes, costPerHour)`** em `src/calculate-meeting-cost.js` é a única fonte de regras de negócio.

- Rejeite valores não finitos → `Todos os valores devem ser números finitos.`
- `participants >= 1` → senão `O número de participantes deve ser pelo menos 1.`
- `durationMinutes > 0` → senão `A duração deve ser maior que zero minutos.`
- `costPerHour >= 0` → senão `O custo por hora não pode ser negativo.`
- Fórmula: `totalCost = participants × (durationMinutes / 60) × costPerHour`
- Retorno: `{ ok: true, totalCost }` ou `{ ok: false, error }` — sem lançar exceção.

**CLI (`src/cli.js`):** exija exatamente 3 args; converta com `Number()`; em falha imprima `Erro: <mensagem>` + uso e `process.exit(1)`; em sucesso use `console.log` com `.toFixed(2)` e resumo dos parâmetros.

**Segurança e limites:** não leia/escreva arquivos fora do escopo; não avalie argumentos como código; não exponha segredos; não faça commit, push ou altere remotes sem pedido. Sem instrução explícita, não altere `PROJETO.md`, `README.md` ou `LICENSE`; não adicione hooks, MCP ou dependências de runtime.

## Checklist de conclusão

- [ ] `calculateMeetingCost` permanece pura, exportada, com contrato `{ ok, totalCost }` / `{ ok, error }` e validações intactas.
- [ ] `npm run check` passa (lint, typecheck, testes).
- [ ] `npm start -- 5 60 100` produz `Custo total da reunião: 500.00 (5 participante(s), 60 min, 100/h)`.
