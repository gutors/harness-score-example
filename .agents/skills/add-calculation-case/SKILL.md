---
name: add-calculation-case
description: >-
  Use when adding or changing a calculation rule, validation guard, or edge
  case in calculateMeetingCost or its CLI integration.
---

# Adicionar ou alterar regra de cálculo

Processo repetível para mudanças em `src/calculate-meeting-cost.js` sem quebrar a arquitetura.

## 1. Localize o ponto de mudança

- Regras de negócio e validação → **somente** `calculateMeetingCost` em `src/calculate-meeting-cost.js`.
- Formato de saída, leitura de args ou mensagem de uso → `src/cli.js`.
- Não crie novos módulos sem necessidade explícita.

## 2. Implemente a regra no domínio

1. Adicione a validação **antes** do cálculo, retornando `{ ok: false, error: '...' }`.
2. Use mensagens em português, específicas e acionáveis.
3. Preserve o contrato `{ ok: true, totalCost }` / `{ ok: false, error }` — sem `throw`.
4. Se a fórmula mudar, atualize apenas a expressão de `totalCost`.

## 3. Casos de borda obrigatórios

Verifique mentalmente (ou manualmente via CLI) estes cenários após cada mudança:

| Entrada | Resultado esperado |
|---|---|
| `NaN`, `Infinity`, `-Infinity` em qualquer arg | Erro de finitude |
| `0` participantes | Erro de participantes |
| `0` ou negativo em duração | Erro de duração |
| Custo por hora negativo | Erro de custo |
| `5 60 100` | `500.00` |
| `1 1 0` | `0.00` (custo zero permitido) |
| Args ausentes ou em excesso na CLI | Mensagem de uso + exit 1 |

## 4. Ajuste a CLI somente se necessário

- Se a mudança afeta apenas validação numérica, **não** altere `cli.js`.
- Se novos argumentos forem exigidos (raro), atualize contagem de args, `USAGE` e `PROJETO.md` somente se solicitado.

## 5. Verificação

Execute o workflow em `.agents/workflows/verify.md`:

```bash
npm start -- 5 60 100
```

Confirme saída:

```
Custo total da reunião: 500.00 (5 participante(s), 60 min, 100/h)
```

Teste manualmente pelo menos um caso de erro representativo (ex.: `npm start -- 0 60 100`).

## 6. Checklist final

- [ ] Validação vive em `calculateMeetingCost`, não duplicada na CLI.
- [ ] Contrato de retorno preservado; sem exceções para entrada inválida.
- [ ] Imports ESM com extensão `.js`.
- [ ] Nenhuma dependência externa adicionada.
- [ ] Exemplo canônico `npm start -- 5 60 100` passa.
