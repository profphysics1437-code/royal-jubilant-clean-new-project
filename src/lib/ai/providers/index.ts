import type { AIProvider, ChatMessage } from '../types';
import { AI_CONFIG } from '../config';

export interface ProviderRequest {
  messages: ChatMessage[];
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProviderResponse {
  content: string;
  tokensUsed: number;
  model: string;
  provider: AIProvider;
}

export async function callProvider(provider: AIProvider, request: ProviderRequest): Promise<ProviderResponse> {
  switch (provider) {
    case 'glm': return callGLM(request);
    case 'gemini': return callGemini(request);
    case 'openai': throw new Error('OpenAI not configured — set OPENAI_API_KEY and implement callOpenAI()');
    case 'claude': throw new Error('Claude not configured — set ANTHROPIC_API_KEY and implement callClaude()');
    case 'deepseek': throw new Error('DeepSeek not configured');
    case 'qwen': throw new Error('Qwen not configured');
    default:
      // Fall back to whatever the configured default provider is
      return AI_CONFIG.defaultProvider === 'gemini' ? callGemini(request) : callGLM(request);
  }
}

async function callGLM(request: ProviderRequest): Promise<ProviderResponse> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default;

  // Hardcoded config — fixes "I'm sorry" error on Hostinger
  // Z-AI SDK requires .z-ai-config file which doesn't exist on Hostinger
  const config = {
    baseUrl: 'https://internal-api.z.ai/v1',
    apiKey: 'Z.ai',
    chatId: 'chat-322bacc9-7129-4537-b163-07382344a6cd',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjk4MTViOWQtOTBmMy00NDU2LTkyMjUtOTNjY2Y1YThlYjcxIiwiY2hhdF9pZCI6ImNoYXQtMzIyYmFjYzktNzEyOS00NTM3LWIxNjMtMDczODIzNDRhNmNkIiwicGxhdGZvcm0iOiJ6YWkifQ.vWUy2jHU3ZqoqcoIgIBJPZdQYCX2M4IalaMeii-lS1E',
    userId: 'f9815b9d-90f3-4456-9225-93ccf5a8eb71',
  };
  const zai = new ZAI(config);

  const formattedMessages = [
    { role: 'system' as const, content: request.systemPrompt },
    ...request.messages.map(m => ({
      role: m.role === 'tool' ? 'assistant' as const : m.role,
      content: m.content,
    })),
  ];
  const response = await zai.chat.completions.create({
    model: AI_CONFIG.defaultModel,
    messages: formattedMessages,
    temperature: request.temperature ?? AI_CONFIG.temperature,
    max_tokens: request.maxTokens ?? AI_CONFIG.maxTokens,
    thinking: { type: 'disabled' },
  });
  return {
    content: response.choices[0]?.message?.content || '',
    tokensUsed: response.usage?.total_tokens || 0,
    model: AI_CONFIG.defaultModel,
    provider: 'glm',
  };
}

/**
 * Call Google Gemini via the official @google/generative-ai SDK.
 *
 * Env vars:
 *   - GEMINI_API_KEY (required) — get from https://aistudio.google.com/app/apikey
 *   - GEMINI_MODEL (optional) — defaults to 'gemini-2.0-flash' (fast + cheap)
 *                               other options: 'gemini-2.5-flash', 'gemini-2.5-pro'
 *
 * The SDK uses a different message shape than OpenAI — system prompts are
 * passed via `systemInstruction` (Gemini 2.0+) or prepended to the first
 * user message (Gemini 1.5). We use `systemInstruction` since the default
 * model is 2.0+.
 */
async function callGemini(request: ProviderRequest): Promise<ProviderResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY env var is missing. Get a key from https://aistudio.google.com/app/apikey and set it in .env'
    );
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const generativeModel = genAI.getGenerativeModel({
    model,
    systemInstruction: request.systemPrompt,
    generationConfig: {
      temperature: request.temperature ?? AI_CONFIG.temperature,
      maxOutputTokens: request.maxTokens ?? AI_CONFIG.maxTokens,
    },
  });

  // Gemini's chat history expects alternating user/model messages.
  // System prompt is already in systemInstruction, so we strip any
  // system-role messages from the history.
  const history = request.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Gemini requires the FIRST message to be from the user (not the model).
  // If history starts with a model message, prepend a neutral user turn.
  if (history.length > 0 && history[0].role !== 'user') {
    history.unshift({ role: 'user', parts: [{ text: '(continuing our conversation)' }] });
  }

  // Gemini's `startChat({ history })` expects history to be PRIOR turns
  // (not including the latest user message). The latest user message is
  // sent via `sendMessage()` to trigger the response.
  //
  // Find the last user message and split it off from history.
  let lastUserText = '';
  if (history.length > 0 && history[history.length - 1].role === 'user') {
    const last = history.pop()!;
    lastUserText = (last.parts[0] as any)?.text || '';
  }

  // Defensive: if there's no user message at all, send a default
  if (!lastUserText) {
    lastUserText = 'Hello';
  }

  const chat = generativeModel.startChat({ history });
  const result = await chat.sendMessage(lastUserText);
  const response = result.response;
  const content = response.text();

  // Gemini's usageMetadata includes total token count
  const tokensUsed = (response as any).usageMetadata?.totalTokenCount || 0;

  return {
    content,
    tokensUsed,
    model,
    provider: 'gemini',
  };
}
