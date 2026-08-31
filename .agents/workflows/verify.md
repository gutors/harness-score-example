# Workflow de verificação

Execute após alterações em `src/` ou em regras de cálculo.

## Comandos disponíveis

| Passo | Comando | Critério de sucesso |
|---|---|---|
| 1. Smoke test | `npm start -- 5 60 100` | Exit 0; saída contém `Custo total da reunião: 500.00` |
| 2. Erro de domínio | `npm start -- 0 60 100` | Exit 1; stderr contém `Erro:` e mensagem de uso |
| 3. Args insuficientes | `npm start -- 5 60` | Exit 1; stderr contém mensagem de uso |

## Sensors pendentes

Os seguintes sensores **não existem** neste repositório — **não invente comandos**:

| Sensor | Status | Nota |
|---|---|---|
| Testes (`npm test`) | **Pendente** | Sem diretório de testes ou script de teste |
| Lint (`npm run lint`) | **Pendente** | Sem linter configurado |
| Typecheck (`npm run typecheck`) | **Pendente** | JavaScript puro, sem TypeScript |

Quando esses sensores forem adicionados no futuro, atualize esta tabela e o `package.json` antes de referenciá-los aqui.

## Critério de conclusão

- Todos os comandos da tabela "Comandos disponíveis" passam.
- Nenhum sensor pendente foi simulado ou inventado.
- `calculateMeetingCost` permanece pura com contrato `{ ok, totalCost }` / `{ ok, error }`.
