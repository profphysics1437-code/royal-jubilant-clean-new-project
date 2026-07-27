import type { AIProvider, AIRole } from './types';

/**
 * Default AI provider is controlled by the AI_PROVIDER env var so it can
 * be swapped at deploy time without code changes.
 *
 * Supported values: 'gemini' | 'glm' | 'openai' | 'claude' | 'deepseek' | 'qwen'
 * Default: 'gemini' (Google Gemini — set GEMINI_API_KEY in .env)
 *
 * Fallback to 'glm' if the env var is missing AND no GEMINI_API_KEY is set,
 * preserving backward compatibility with existing Hostinger deployments.
 */
function pickDefaultProvider(): AIProvider {
  const env = (process.env.AI_PROVIDER || '').toLowerCase();
  if (env === 'gemini' || env === 'glm' || env === 'openai' || env === 'claude' || env === 'deepseek' || env === 'qwen') {
    return env as AIProvider;
  }
  // Auto-detect: if GEMINI_API_KEY is set, use Gemini. Otherwise fall back
  // to GLM (legacy default).
  return process.env.GEMINI_API_KEY ? 'gemini' : 'glm';
}

export const AI_CONFIG = {
  defaultProvider: pickDefaultProvider(),
  // Default model per provider — used when caller doesn't specify one.
  defaultModel: process.env.GEMINI_API_KEY
    ? (process.env.GEMINI_MODEL || 'gemini-2.0-flash')
    : 'glm-4.6',
  maxTokens: 2000,
  temperature: 0.7,
  maxHistoryMessages: 20,
  maxTokensPerSession: 100000,
  rateLimitPerMinute: 30,
  rateLimitPerHour: 500,
} as const;

export const PROVIDER_CONFIG: Record<AIProvider, { enabled: boolean; models: string[]; apiBase?: string; }> = {
  glm: { enabled: true, models: ['glm-4.6', 'glm-4.5', 'glm-4-flash'] },
  openai: { enabled: false, models: ['gpt-4o', 'gpt-4o-mini'], apiBase: 'https://api.openai.com/v1' },
  claude: { enabled: false, models: ['claude-3-5-sonnet-20241022'], apiBase: 'https://api.anthropic.com/v1' },
  // Gemini — enabled by default. Set GEMINI_API_KEY in .env to activate.
  // Models: gemini-2.0-flash (fast/cheap), gemini-2.5-flash, gemini-2.5-pro (highest quality)
  gemini: {
    enabled: true,
    models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    apiBase: 'https://generativelanguage.googleapis.com/v1',
  },
  deepseek: { enabled: false, models: ['deepseek-chat'], apiBase: 'https://api.deepseek.com/v1' },
  qwen: { enabled: false, models: ['qwen-max'], apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
};

export const ROLE_PERMISSIONS: Record<AIRole, string[]> = {
  customer: ['property.search', 'property.details', 'valuation.estimate', 'lead.create', 'content.blog.read', 'content.faq.read'],
  agent: ['property.search', 'property.details', 'property.create', 'property.update', 'lead.read', 'lead.update', 'analytics.agent'],
  admin: ['*'],
  marketing: ['content.blog.create', 'content.blog.update', 'analytics.marketing', 'content.faq.create'],
};
