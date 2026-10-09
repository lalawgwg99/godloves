/**
* Cloudflare Pages Function - AI 代理（聖所 Sanctuary）
* 路徑: POST /api/ai
*
* 請求: { system: string, user: string}
* 回傳: { text: string}（模型原始回覆文字；要求 JSON 時即為 JSON 字串）
*
* 文字走 OpenRouter 免費模型（:free only，不動帳戶餘額），key 放在
* Pages 環境變數 OPENROUTER_API_KEY。模型按序備援，429/錯誤自動換下一個。
* 圖片另外由前端直接打 pollinations.ai（免 key），不經過這裡。
*/

const MODELS = [
'nvidia/nemotron-3.5-lightning:free',
'google/gemma-4-26b-a4b-it:free',
'meta-llama/llama-3.3-70b-instruct:free',
];

const GUARD = '\n全程使用繁體中文（台灣用語），絕對不可出現簡體字。只回傳要求的內容，不要加任何前言後語。';

export async function onRequestPost(context) {
const { request, env} = context;

const corsHeaders = {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'POST, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type',
};
if (request.method === 'OPTIONS') {
return new Response(null, { headers: corsHeaders});
}

try {
const apiKey = env.OPENROUTER_API_KEY;
if (!apiKey) {
return new Response(
JSON.stringify({ error: 'AI_KEY_MISSING', message: '主機未設定 OPENROUTER_API_KEY'}),
{ status: 500, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
}

const { system, user} = await request.json();
if (!user || typeof user!== 'string') {
return new Response(
JSON.stringify({ error: '缺少 user 訊息'}),
{ status: 400, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
}

const sysContent = (system || '你是聖所 Sanctuary 的靈性陪伴者。') + GUARD;
let lastErr = 'unknown';

for (const model of MODELS) {
try {
const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${apiKey}`,
'HTTP-Referer': 'https://godloves.pages.dev',
'X-Title': 'Sanctuary',
},
body: JSON.stringify({
model,
messages: [
{ role: 'system', content: sysContent},
{ role: 'user', content: user},
],
response_format: { type: 'json_object'},
temperature: 0.9,
max_tokens: 2500,
}),
});
const d = await r.json();
if (!r.ok) {
lastErr = (d && d.error && d.error.message) || `HTTP ${r.status}`;
continue;
}
const text = d && d.choices && d.choices[0] && d.choices[0].message
? d.choices[0].message.content: '';
if (!text) {
lastErr = 'empty response';
continue;
}
return new Response(
JSON.stringify({ text, model}),
{ status: 200, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
} catch (e) {
lastErr = e.message || String(e);
}
}

return new Response(
JSON.stringify({ error: 'AI_BUSY', message: '聖域暫時靜默，請稍後再試。', detail: lastErr}),
{ status: 502, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
} catch (error) {
return new Response(
JSON.stringify({ error: error.message}),
{ status: 500, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
}
}
