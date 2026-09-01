/**
 * @typedef {Record<string, unknown>} ShellGatePayload
 * @typedef {{ permission: 'allow' | 'deny' | 'ask', user_message?: string, agent_message?: string }} ShellGateDecision
 */

/** @type {Array<{ pattern: RegExp, user_message: string, agent_message: string }>} */
const DENY_PATTERNS = [
  {
    pattern: /\bnpm\s+publish\b/i,
    user_message: 'Publicação npm bloqueada por política do repositório.',
    agent_message: 'npm publish não é permitido neste projeto.',
  },
  {
    pattern: /\bgit\s+push\b[^\n|;&]*(?:--force\b|-f\b)/i,
    user_message: 'Force push bloqueado por política do repositório.',
    agent_message: 'git push --force (ou -f) não é permitido.',
  },
  {
    pattern: /\bgit\s+reset\b[^\n|;&]*--hard\b/i,
    user_message: 'git reset --hard bloqueado por política do repositório.',
    agent_message: 'git reset --hard não é permitido.',
  },
  {
    pattern: /\brm\b(?:\s+-[^\s]+)*\s+(?:\/\s*$|\/\*|~(?:\/|\s*$)|\$HOME|\$\{HOME\})/i,
    user_message: 'Remoção recursiva de raiz ou home bloqueada.',
    agent_message: 'Comandos rm contra /, ~ ou $HOME são proibidos.',
  },
  {
    pattern: /(?:^|[\s|;])(?:remove-item|ri)\b[^\n|;&]*(?:-recurse\b|-r\b)[^\n|;&]*(?:\/\s*$|~(?:\/|\s*$)|\$HOME|\$\{HOME\}|\\?\s*$)/i,
    user_message: 'Remove-Item recursivo destrutivo bloqueado.',
    agent_message: 'Padrões destrutivos do Remove-Item contra raiz ou home são proibidos.',
  },
];

/**
 * @param {unknown} payload
 * @returns {ShellGateDecision}
 */
export function evaluateShellGate(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      permission: 'ask',
      user_message: 'Hook não conseguiu interpretar o payload do comando.',
      agent_message: 'Payload inválido ou ausente em beforeShellExecution.',
    };
  }

  const command = /** @type {ShellGatePayload} */ (payload).command;
  if (typeof command !== 'string' || command.trim() === '') {
    return {
      permission: 'ask',
      user_message: 'Hook não conseguiu interpretar o comando shell.',
      agent_message: 'Campo command ausente ou inválido no payload.',
    };
  }

  for (const rule of DENY_PATTERNS) {
    if (rule.pattern.test(command)) {
      return {
        permission: 'deny',
        user_message: rule.user_message,
        agent_message: rule.agent_message,
      };
    }
  }

  return { permission: 'allow' };
}
