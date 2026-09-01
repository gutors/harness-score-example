# Workflow de verificação

Execute após alterações em `src/`, `test/` ou regras de cálculo.

## Verificação completa

```bash
npm run check
```

Executa em sequência: `npm run lint` → `npm run typecheck` → `npm test`.

## Smoke test manual

| Comando | Critério |
|---|---|
| `npm start -- 5 60 100` | Exit 0; saída contém `Custo total da reunião: 500.00` |
| `npm start -- 0 60 100` | Exit 1; stderr contém `Erro:` e mensagem de uso |

## CI

Push em `main` e pull requests executam `.github/workflows/ci.yml`: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`.
