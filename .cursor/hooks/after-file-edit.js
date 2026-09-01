#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BIOME_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'biome');
const SUPPORTED_EXTENSIONS = /\.(?:js|mjs|cjs|json)$/i;

/**
 * @param {unknown} payload
 * @returns {void}
 */
export function formatEditedFile(payload) {
  if (!payload || typeof payload !== 'object') {
    return;
  }

  const filePath = /** @type {{ file_path?: unknown }} */ (payload).file_path;
  if (typeof filePath !== 'string' || !SUPPORTED_EXTENSIONS.test(filePath)) {
    return;
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);

  spawnSync(BIOME_BIN, ['format', '--write', absolutePath], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

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
  try {
    const input = await readStdin();
    if (input.trim() === '') {
      return;
    }
    formatEditedFile(JSON.parse(input));
  } catch {
    // afterFileEdit é orientação local; falhas de parse não bloqueiam a edição.
  }
}

main();
