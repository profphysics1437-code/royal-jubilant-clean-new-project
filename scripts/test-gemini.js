#!/usr/bin/env node
/**
 * Quick smoke test for the Gemini API key.
 * Sends a tiny "Hello" prompt and prints the response.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY env var is not set');
  process.exit(1);
}

console.log('Key length:', apiKey.length);
console.log('Key prefix:', apiKey.slice(0, 8) + '...');
console.log('');

async function main() {
  const genAI = new GoogleGenerativeAI(apiKey);

  // Try multiple models — some have free tier quota, some don't
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
  ];

  for (const modelName of modelsToTry) {
    console.log(`\n--- Trying model: ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: 'You are a helpful Dubai real estate assistant. Reply concisely.',
      });
      const chat = model.startChat({ history: [] });
      const result = await chat.sendMessage('Say "Gemini working" and nothing else.');
      const text = result.response.text();
      console.log('Response:', text);
      console.log('Usage:', JSON.stringify(result.response.usageMetadata, null, 2));
      console.log(`✓ ${modelName} WORKS!`);
      console.log('\n=== RECOMMENDATION ===');
      console.log(`Set GEMINI_MODEL=${modelName} in .env`);
      return;
    } catch (err) {
      const msg = err.message.split('\n')[0];
      console.error(`✗ ${modelName} failed: ${msg}`);
    }
  }

  console.error('\n=== ALL MODELS FAILED ===');
  console.error('None of the Gemini models have available quota with this key.');
  console.error('Possible causes:');
  console.error('  1. Free tier quota exhausted for today (resets at midnight PT)');
  console.error('  2. Billing not enabled on the Google Cloud project');
  console.error('  3. Region restriction (some regions have no free tier)');
  console.error('');
  console.error('Fix options:');
  console.error('  A. Enable billing at https://console.cloud.google.com/billing');
  console.error('     (you get $300 free credit + paid tier access)');
  console.error('  B. Wait for quota reset (if free tier just exhausted today)');
  console.error('  C. Create a new API key at https://aistudio.google.com/app/apikey');
  console.error('     from a different Google account');
  process.exit(1);
}

main();
