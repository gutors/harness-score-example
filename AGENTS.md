# AGENTS.md — Meeting Cost CLI

CLI Node.js (`meeting-cost-cli`) que calcula o custo total de mão de obra de uma reunião a partir de três argumentos: participantes, duração em minutos e custo por hora. Sem UI, servidor, banco ou rede.

## Repositório e comandos

```
harness-score-example/
├── AGENTS.md
├── .gitignore              # ignora node_modules/
├── package.json            # type: module; script start
├── pnpm-lock.yaml
├── PROJETO.md
└── src/
    ├── calculate-meeting-cost.js   # domínio puro, exportado
    └── cli.js                      # entrada: argv + stdout/stderr
```

- Separe domínio (`calculateMeetingCost`) de I/O (`src/cli.js`). Não duplique validação na CLI.
- Sem testes, CI, linter, formatter, TypeScript ou MCP neste repositório.
- Runtime: **Node.js >= 24**.
- Único script npm: `npm start` → `node src/cli.js`.
- Argumentos: `npm start -- <participantes> <duracao-minutos> <custo-por-hora>`.
- Exemplo (`PROJETO.md`): `npm start -- 5 60 100` → `Custo total da reunião: 500.00 (5 participante(s), 60 min, 100/h)`.
- Não invente outros scripts npm.

## Domínio, runtime e segurança

**`calculateMeetingCost(participants, durationMinutes, costPerHour)`** em `src/calculate-meeting-cost.js` é a única fonte de regras de negócio.

- Rejeite valores não finitos → `Todos os valores devem ser números finitos.`
- `participants >= 1` → senão `O número de participantes deve ser pelo menos 1.`
- `durationMinutes > 0` → senão `A duração deve ser maior que zero minutos.`
- `costPerHour >= 0` → senão `O custo por hora não pode ser negativo.`
- Fórmula: `totalCost = participants × (durationMinutes / 60) × costPerHour`
- Retorno: `{ ok: true, totalCost }` ou `{ ok: false, error }` — sem lançar exceção.

**CLI (`src/cli.js`):** exija exatamente 3 args; converta com `Number()`; em falha imprima `Erro: <mensagem>` + uso (`Uso: npm start -- <participantes> <duracao-minutos> <custo-por-hora>`) e `process.exit(1)`; em sucesso use `console.log` com `.toFixed(2)` e resumo dos parâmetros.

**Runtime:** ESM (`"type": "module"`); imports locais com extensão `.js`; só APIs nativas do Node. Sem `dependencies`/`devDependencies` em `package.json` — não instale pacotes nem atualize lockfiles sem instrução explícita.

**Segurança e limites:** não leia/escreva arquivos fora do escopo; não avalie argumentos como código; não adicione deps (HTTP, eval, child_process); não exponha segredos; não faça commit, push ou altere remotes sem pedido. Sem instrução explícita, não altere `PROJETO.md`, `README.md`, `LICENSE` ou `package.json`; não crie testes, linter, CI, hooks, rules ou MCP; não converta para CommonJS/TypeScript; não modifique `.gitignore`.

## Checklist de conclusão

- [ ] `calculateMeetingCost` permanece pura, exportada, com contrato `{ ok, totalCost }` / `{ ok, error }` e validações intactas.
- [ ] `src/cli.js` exige 3 args, erros acionáveis em português, `process.exit(1)` em falha.
- [ ] Apenas `npm start` existe; imports ESM com `.js`; sem deps externas adicionadas.
- [ ] Arquivos protegidos e configs extras não criados; sem commit não solicitado.
- [ ] `npm start -- 5 60 100` produz `Custo total da reunião: 500.00 (5 participante(s), 60 min, 100/h)`.
