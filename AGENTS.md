# AGENTS.md — Orientações para Agentes de Código

Este documento descreve, de forma deliberadamente detalhada, como um agente de código deve compreender, modificar e operar o repositório **Meeting Cost CLI** (`meeting-cost-cli`). Leia-o integralmente antes de qualquer alteração. As orientações aqui refletem exclusivamente o estado atual do código-fonte e dos arquivos presentes no repositório.

## Visão Geral do Produto

O **Meeting Cost CLI** é uma aplicação de linha de comando escrita em Node.js que calcula o **custo total de mão de obra** de uma reunião. O produto recebe três argumentos posicionais pela linha de comando — número de participantes, duração em minutos e custo por hora — e produz um valor monetário agregado que representa quanto a reunião custa em termos de tempo remunerado dos participantes.

Em termos funcionais, o produto existe para responder a uma pergunta simples: *quanto custa esta reunião?* A resposta é derivada multiplicando o número de participantes pela fração de hora correspondente à duração e pelo custo horário informado. Não há interface gráfica, servidor HTTP, banco de dados ou qualquer outro componente além da CLI e da função de domínio pura.

O ponto de entrada da aplicação é `src/cli.js`, que delega o cálculo propriamente dito à função exportada `calculateMeetingCost` em `src/calculate-meeting-cost.js`. Essa separação é intencional: a lógica de negócio permanece testável e isolada da leitura de `process.argv` e da escrita em `stdout`/`stderr`.

## Estrutura Real do Repositório

O repositório é propositalmente mínimo. A árvore de arquivos relevantes para o agente é a seguinte:

```
harness-score-example/
├── AGENTS.md                        # Este arquivo (orientações para agentes)
├── .gitignore                       # Ignora node_modules/
├── package.json                     # Metadados, type: module, script start
├── pnpm-lock.yaml                   # Lockfile presente no repositório
├── PROJETO.md                       # Descrição curta e exemplo de uso
└── src/
    ├── calculate-meeting-cost.js    # Função de domínio pura (exportada)
    └── cli.js                       # Ponto de entrada da CLI
```

Não existem, neste momento, diretórios de testes (`test/`, `__tests__/`), configuração de CI (`.github/`), linter, formatter, TypeScript, ou arquivos de configuração MCP. O diretório `node_modules/` pode existir localmente mas está listado em `.gitignore` e não faz parte do código-fonte versionado de interesse.

O `package.json` declara `"type": "module"`, exigindo sintaxe ESM em todos os arquivos `.js`. Os imports entre módulos locais utilizam extensão explícita `.js` (por exemplo, `import { calculateMeetingCost } from './calculate-meeting-cost.js'`).

## Comandos Disponíveis Hoje

O repositório expõe **um único script npm** definido em `package.json`:

| Comando | Ação real |
|---|---|
| `npm start` | Executa `node src/cli.js` |

Para passar argumentos à CLI, utilize o separador `--`:

```bash
npm start -- <participantes> <duracao-minutos> <custo-por-hora>
```

Exemplo documentado em `PROJETO.md`:

```bash
npm start -- 5 60 100
```

Saída esperada para esse exemplo:

```
Custo total da reunião: 500.00 (5 participante(s), 60 min, 100/h)
```

**Não existem** outros scripts npm (`test`, `build`, `lint`, `dev`, etc.). Não invente comandos que não constem em `package.json`. A execução direta via `node src/cli.js` também funciona, mas o caminho canônico documentado é `npm start`.

O runtime exigido é **Node.js >= 24**, conforme o campo `engines` em `package.json`.

## Invariantes de Domínio

A função `calculateMeetingCost(participants, durationMinutes, costPerHour)` em `src/calculate-meeting-cost.js` é a **única fonte de verdade** para as regras de negócio. Todo agente deve preservar os seguintes invariantes, derivados diretamente do código:

1. **Finitude numérica**: os três parâmetros devem ser números finitos (`Number.isFinite`). Valores como `NaN`, `Infinity` e `-Infinity` são rejeitados com a mensagem: `Todos os valores devem ser números finitos.`

2. **Participantes mínimos**: `participants` deve ser **pelo menos 1** (`participants < 1` é inválido). Zero participantes, valores negativos e frações abaixo de 1 são rejeitados.

3. **Duração positiva**: `durationMinutes` deve ser **estritamente maior que zero** (`durationMinutes <= 0` é inválido). Duração zero ou negativa é rejeitada.

4. **Custo por hora não negativo**: `costPerHour` deve ser **maior ou igual a zero** (`costPerHour < 0` é inválido). Custo zero é permitido.

5. **Fórmula de cálculo**: quando todas as validações passam, o custo total é:

   ```
   totalCost = participants × (durationMinutes / 60) × costPerHour
   ```

6. **Contrato de retorno**: a função retorna um objeto discriminado:
   - Sucesso: `{ ok: true, totalCost: number }`
   - Falha: `{ ok: false, error: string }`

   A função **não lança exceções** para entradas inválidas; ela retorna o objeto de erro. Isso é um invariante arquitetural que deve ser mantido.

Repetindo para ênfase: qualquer alteração na lógica de validação ou na fórmula deve ocorrer **somente** em `calculateMeetingCost`, nunca espalhada pela CLI ou por outros módulos inexistentes.

## Módulos ESM e Restrições de Dependências

Este projeto utiliza **ECMAScript Modules (ESM)** nativos do Node.js. As restrições são:

- `"type": "module"` em `package.json` — CommonJS (`require`) **não** é suportado.
- Imports locais devem incluir a extensão `.js` no caminho relativo.
- Apenas APIs nativas do Node.js são utilizadas (`process.argv`, `process.exit`, `console.log`, `console.error`, `Number`).
- **Não há dependências de produção ou de desenvolvimento** declaradas em `package.json` (nenhum campo `dependencies` ou `devDependencies`).
- Um arquivo `pnpm-lock.yaml` existe no repositório, mas o `package.json` atual não lista pacotes externos. Agentes não devem adicionar dependências sem instrução explícita do usuário.

A arquitetura ESM reforça a separação entre domínio (`calculate-meeting-cost.js`) e entrada (`cli.js`). Ao criar novos módulos, siga o mesmo padrão de export nomeado e import com extensão `.js`.

## Validação e Tratamento de Erros

A validação ocorre em **dois níveis**, e ambos devem ser respeitados:

### Nível 1 — CLI (`src/cli.js`)

- Exige **exatamente 3 argumentos** posicionais (`args.length !== 3`).
- Converte cada argumento com `Number()` antes de chamar a função de domínio.
- Em caso de argumentos insuficientes ou excessivos, imprime a mensagem de uso em `stderr` e encerra com `process.exit(1)`:
  ```
  Uso: npm start -- <participantes> <duracao-minutos> <custo-por-hora>
  ```

### Nível 2 — Domínio (`calculateMeetingCost`)

- Aplica as regras de finitude, participantes, duração e custo descritas na seção de invariantes.
- Retorna `{ ok: false, error: '...' }` com mensagens em português, acionáveis e específicas.

### Comportamento de saída

- **Entrada válida**: `console.log` com o custo formatado via `.toFixed(2)`, seguido de um resumo entre parênteses com os três parâmetros.
- **Entrada inválida**: `console.error` com prefixo `Erro: ` + mensagem do domínio, seguido novamente da mensagem de uso, e `process.exit(1)`.

Agentes devem manter mensagens de erro **acionáveis** (dizendo o que está errado) e **repetir o uso** em falhas, conforme o padrão existente. Não silencie erros nem altere códigos de saída sem necessidade explícita.

## Limites de Segurança

Por ser uma CLI local sem rede, banco de dados ou autenticação, a superfície de ataque é reduzida, mas agentes devem observar:

- **Não ler nem escrever arquivos** além do escopo da tarefa solicitada. A CLI atual não acessa o sistema de arquivos.
- **Não executar código arbitrário** recebido via argumentos; os argumentos são convertidos para `Number` e validados, nunca avaliados.
- **Não introduzir dependências externas** que ampliem a superfície de ataque (HTTP clients, eval, child_process) sem autorização.
- **Não expor segredos** em código, commits ou logs. O projeto não utiliza variáveis de ambiente ou credenciais.
- **Não fazer push, force push ou alterar remotes** sem instrução explícita do usuário.
- **Não criar commits** sem solicitação explícita do usuário.

Esses limites se aplicam mesmo que o agente considere que uma ação seria "útil" ou "preventiva". Na dúvida, pergunte ao usuário.

## Ações que um Agente Não Pode Executar

Sem instrução explícita do usuário, o agente **não deve**:

1. Modificar `PROJETO.md`, `README.md`, `LICENSE` ou `package.json` (a menos que a tarefa peça especificamente).
2. Criar arquivos de configuração de testes, linter, formatter, typecheck, CI, hooks, rules, skills, workflows ou MCP.
3. Instalar dependências (`npm install`, `pnpm install`, etc.) ou gerar/atualizar lockfiles.
4. Adicionar dependências ao `package.json`.
5. Criar ou modificar `.gitignore` (já existe e cobre `node_modules/`).
6. Fazer `git commit`, `git push`, `git rebase`, `git reset --hard` ou qualquer operação destrutiva no histórico.
7. Inventar novos comandos npm, endpoints, serviços ou arquivos que não existam no repositório.
8. Mover a lógica de validação para fora de `calculateMeetingCost` ou duplicá-la em múltiplos lugares.
9. Converter o projeto para CommonJS ou TypeScript.
10. Criar testes automatizados (não há infraestrutura de testes nesta etapa do projeto).

Reforço: o repositório está em uma fase intencionalmente enxuta. Resista à tentação de "melhorar" adicionando camadas, abstrações ou ferramentas não solicitadas.

## Checklist de Conclusão

Antes de considerar uma tarefa concluída, verifique cada item:

- [ ] A função `calculateMeetingCost` permanece pura, exportada e com o contrato `{ ok, totalCost }` / `{ ok, error }`.
- [ ] As validações de finitude, participantes >= 1, duração > 0 e custo >= 0 estão intactas em `calculate-meeting-cost.js`.
- [ ] A CLI em `src/cli.js` continua exigindo exatamente 3 argumentos e imprimindo mensagens de erro acionáveis com `process.exit(1)`.
- [ ] O único script npm continua sendo `start` → `node src/cli.js`.
- [ ] Nenhuma dependência externa foi adicionada ao `package.json`.
- [ ] Os imports ESM usam extensão `.js`.
- [ ] `PROJETO.md`, `README.md`, `LICENSE` e `package.json` não foram alterados (salvo se a tarefa exigir).
- [ ] Nenhum arquivo extra de configuração (CI, linter, testes, MCP) foi criado.
- [ ] Nenhum commit foi feito sem solicitação explícita.
- [ ] O exemplo `npm start -- 5 60 100` produz `Custo total da reunião: 500.00 (5 participante(s), 60 min, 100/h)`.

Se todos os itens estiverem marcados, a tarefa está alinhada com o estado e as expectativas deste repositório.
