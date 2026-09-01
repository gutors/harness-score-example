#!/usr/bin/env node
import { evaluateShellGate } from './shell-gate.js';

/**
 * @returns {Promise<string>}
 */
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let payload;

  try {
    const input = await readStdin();
    if (input.trim() === '') {
      console.log(JSON.stringify(evaluateShellGate(null)));
      return;
    }
    payload = JSON.parse(input);
  } catch {
    console.log(
      JSON.stringify({
        permission: 'ask',
        user_message: 'Hook não conseguiu interpretar o payload JSON.',
        agent_message: 'JSON inválido em beforeShellExecution.',
      }),
    );
    return;
  }

  console.log(JSON.stringify(evaluateShellGate(payload)));
}

main();
