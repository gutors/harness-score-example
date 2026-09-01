import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { evaluateShellGate } from '../.cursor/hooks/shell-gate.js';

describe('shell gate', () => {
  test('permite comandos comuns', () => {
    const cases = [
      'npm test',
      'npm run check',
      'npm start -- 5 60 100',
      'git status',
      'node --test',
    ];

    for (const command of cases) {
      const decision = evaluateShellGate({ command, cwd: process.cwd() });
      assert.equal(decision.permission, 'allow', command);
    }
  });

  test('nega comandos destrutivos', () => {
    const cases = [
      'npm publish',
      'git push --force origin main',
      'git push -f origin main',
      'git reset --hard HEAD~1',
      'rm -rf /',
      'rm -rf ~',
      'Remove-Item -Recurse -Force /',
    ];

    for (const command of cases) {
      const decision = evaluateShellGate({ command, cwd: process.cwd() });
      assert.equal(decision.permission, 'deny', command);
      assert.ok(decision.user_message);
      assert.ok(decision.agent_message);
    }
  });

  test('retorna ask para payload malformado', () => {
    const cases = [null, {}, { command: '' }, { cwd: '/tmp' }];

    for (const payload of cases) {
      const decision = evaluateShellGate(payload);
      assert.equal(decision.permission, 'ask');
      assert.ok(decision.user_message);
      assert.ok(decision.agent_message);
    }
  });
});
