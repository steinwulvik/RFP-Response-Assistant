// Model calls for Anthropic and OpenAI, using built-in fetch (Node 18+). No SDKs, no dependencies.
'use strict';

// Streams the answer (server-sent events), so long answers are not cut off by connection timeouts.
async function callAnthropic({ model, apiKey, system, user, maxTokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 500)}`);
  }
  let text = '';
  let stop = null;
  const usage = { input: 0, output: 0 };
  const decoder = new TextDecoder();
  let buf = '';
  for await (const chunk of res.body) {
    buf += decoder.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const event = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const line = event.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const d = JSON.parse(line.slice(6));
      if (d.type === 'message_start') usage.input = d.message?.usage?.input_tokens ?? 0;
      else if (d.type === 'content_block_delta' && d.delta?.type === 'text_delta') text += d.delta.text;
      else if (d.type === 'message_delta') { stop = d.delta?.stop_reason ?? stop; usage.output = d.usage?.output_tokens ?? usage.output; }
      else if (d.type === 'error') throw new Error(`Anthropic stream error: ${JSON.stringify(d.error)}`);
    }
  }
  return { text, stop: stop === 'max_tokens' ? 'length' : stop, usage };
}

async function callOpenAI({ model, apiKey, system, user, maxTokens }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_completion_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${JSON.stringify(body.error || body)}`);
  const text = body.choices?.[0]?.message?.content ?? '';
  return { text, stop: body.choices?.[0]?.finish_reason, usage: { input: body.usage?.prompt_tokens ?? 0, output: body.usage?.completion_tokens ?? 0 } };
}

function makeProvider(modelCfg, env) {
  if (modelCfg.provider === 'mock') return null;
  const apiKey = env[modelCfg.key];
  if (!apiKey) throw new Error(`Missing ${modelCfg.key} in the .env file.`);
  const fn = modelCfg.provider === 'anthropic' ? callAnthropic : callOpenAI;
  return (args) => fn({ ...args, model: modelCfg.model, apiKey });
}

module.exports = { makeProvider };
