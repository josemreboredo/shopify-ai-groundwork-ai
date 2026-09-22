/**
 * @file llm.js
 * @description Thin wrapper over the Anthropic Messages API for structured
 * JSON extraction (ADR 0007). One place for model choice, fallbacks, caching
 * and stop-reason handling. Raw model output is never logged or included in
 * error messages.
 *
 * @module engine/llm
 */

import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_MODEL = 'claude-opus-5';

export class LlmError extends Error {
  /**
   * @param {string} message
   * @param {string} code  refusal | truncated | invalid_json | no_output | context_exceeded
   */
  constructor(message, code) {
    super(message);
    this.name = 'LlmError';
    this.code = code;
  }
}

/**
 * @typedef {Object} StructuredCall
 * @property {string} system     Static instructions (cached)
 * @property {string} user       Per-request content
 * @property {object} schema     JSON schema for output_config.format
 * @property {number} [maxTokens]
 */

/**
 * @typedef {Object} StructuredResult
 * @property {any}    data
 * @property {string} model
 * @property {object} usage
 */

/**
 * SDK client options from the environment. Organisation-level API keys that
 * are not scoped to a workspace need the workspace id on every request
 * (ANTHROPIC_WORKSPACE_ID, e.g. "wrkspc_…").
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ defaultHeaders?: Record<string, string> }}
 */
export function clientOptions(env = process.env) {
  const workspaceId = env.ANTHROPIC_WORKSPACE_ID?.trim();
  return workspaceId ? { defaultHeaders: { 'anthropic-workspace-id': workspaceId } } : {};
}

/**
 * Create the production LLM adapter. Tests inject their own object with the
 * same `callStructured` method instead.
 *
 * @param {{ client?: Anthropic, model?: string }} [options]
 * @returns {{ model: string, callStructured: (call: StructuredCall) => Promise<StructuredResult> }}
 */
export function createLlm({ client, model } = {}) {
  const resolvedModel = model ?? process.env.DISCOVERY_MODEL ?? DEFAULT_MODEL;
  const anthropic = client ?? new Anthropic(clientOptions());

  return {
    model: resolvedModel,

    async callStructured({ system, user, schema, maxTokens = 64000 }) {
      const stream = anthropic.beta.messages.stream({
        model: resolvedModel,
        max_tokens: maxTokens,
        // Server-side refusal fallback (routes by refusal category).
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: user }],
        output_config: { format: { type: 'json_schema', schema } },
      });
      const message = await stream.finalMessage();
      return { data: parseStructured(message), model: message.model, usage: message.usage };
    },
  };
}

/**
 * Turn SDK and engine errors into an actionable message for consultants.
 * Never includes request content or model output.
 *
 * @param {unknown} err
 * @returns {string}
 */
export function explainError(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'The Anthropic API rejected the credentials (401). Check ANTHROPIC_API_KEY in .env.';
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return `The API key cannot use this model or feature (403): ${err.message}`;
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limited by the Anthropic API (429) after retries — wait a minute and run again.';
  }
  if (err instanceof Anthropic.BadRequestError) {
    if (/anthropic-workspace-id/.test(err.message)) {
      return [
        'This API key is not scoped to a workspace.',
        '  Add the workspace id to .env (Console → Settings → Workspaces, starts with "wrkspc_"):',
        '    ANTHROPIC_WORKSPACE_ID=wrkspc_…',
        '  or create an API key inside a workspace instead.',
      ].join('\n');
    }
    return `The Anthropic API rejected the request (400): ${err.message}`;
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the Anthropic API — check the network connection or proxy.';
  }
  if (err instanceof Anthropic.APIError && /credit balance is too low/i.test(err.message)) {
    return 'The Anthropic account has no credit left. Add credits in Console → Plans & Billing, then run again.';
  }
  if (err instanceof Anthropic.APIError) {
    return `Anthropic API error${err.status ? ` (${err.status})` : ''}: ${err.message}`;
  }
  if (err instanceof Error && /Could not resolve authentication method/.test(err.message)) {
    return [
      'No Anthropic API credentials found.',
      '  Add this line to .env in the project root (never commit it):',
      '    ANTHROPIC_API_KEY=<your key from console.anthropic.com>',
      '  or export ANTHROPIC_API_KEY in your shell, then run the command again.',
    ].join('\n');
  }
  return err instanceof Error ? err.message : String(err);
}

/**
 * Validate the stop reason and parse the JSON text of a structured response.
 *
 * @param {{ stop_reason: string|null, stop_details?: any, content: any[] }} message
 * @returns {any}
 */
export function parseStructured(message) {
  switch (message.stop_reason) {
    case 'refusal':
      throw new LlmError(`Model declined the request (category: ${message.stop_details?.category ?? 'unknown'}).`, 'refusal');
    case 'max_tokens':
      throw new LlmError('Model output was truncated (max_tokens) — nothing was written.', 'truncated');
    case 'model_context_window_exceeded':
      throw new LlmError('Input exceeds the model context window.', 'context_exceeded');
    default:
      break;
  }

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  if (!text.trim()) throw new LlmError('Model returned no structured output.', 'no_output');
  try {
    return JSON.parse(text);
  } catch {
    throw new LlmError('Model output was not valid JSON.', 'invalid_json');
  }
}
