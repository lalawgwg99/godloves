/**
* Cloudflare Pages Function - AI 代理（聖所 Sanctuary）
* 路徑: POST /api/ai
*
* 請求: { system: string, user: string}
* 回傳: { text: string}（模型原始回覆文字；要求 JSON 時即為 JSON 字串）
*
* 第一順位：OpenRouter 免費模型（:free only，絕不動帳戶餘額），
* key 放在 Pages 環境變數 OPENROUTER_API_KEY，三個免費模型依序備援。
* 第二順位：pollinations.ai 免費文字 API（免 key），當前者全滅時頂上。
* 圖片由前端直接打 pollinations.ai 圖床（免 key）。
*/

const OR_MODELS = [
'nvidia/nemotron-3.5-lightning:free',
'google/gemma-4-26b-a4b-it:free',
'meta-llama/llama-3.3-70b-instruct:free',
];
const OR_API = 'https://openrouter.ai/api/v1/chat/completions';
const PL_API = 'https://text.pollinations.ai/openai';

const GUARD = '\n全程使用繁體中文（台灣用語），絕對不可出現簡體字。只回傳要求的內容，不要加任何前言後語。';

async function fetchWithTimeout(url, opts, ms) {
const ctl = new AbortController();
const t = setTimeout(() => ctl.abort(), ms);
try {
return await fetch(url, {...opts, signal: ctl.signal});
} finally {
clearTimeout(t);
}
}

function extractText(d) {
return d && d.choices && d.choices[0] && d.choices[0].message
? d.choices[0].message.content: '';
}

// 清掉模型洩漏的內部思考：<think> 區塊移除；
// 若開頭仍是英文思考痕跡（Here's a thinking process / Analyze User Request…），
// 視為失敗，交給呼叫方換下一個模型重試。
function stripThinking(text) {
if (!text) return '';
return String(text).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}
function looksLikeThinkingLeak(text) {
const head = String(text).slice(0, 600).toLowerCase();
return /here'?s (a|my) thinking|thinking process|analyze (the )?user request/.test(head);
}
function cleanModelText(raw) {
const text = stripThinking(raw);
if (!text || looksLikeThinkingLeak(text)) return null;
return text;
}

// 第一順位：OpenRouter 免費模型
async function callOpenRouter(apiKey, sysContent, user) {
for (const model of OR_MODELS) {
try {
const r = await fetchWithTimeout(OR_API, {
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
temperature: 0.9,
max_tokens: 2500,
}),
}, 45000);
const d = await r.json();
if (!r.ok) continue;
const text = cleanModelText(extractText(d));
if (text) return { text, model };
} catch (e) { /* 換下一個模型 */}
}
return null;
}

// 第二順位：pollinations 免費 API（免 key）
async function callPollinations(sysContent, user) {
const waits = [2000, 6000];
for (let attempt = 0; attempt < 3; attempt++) {
if (attempt > 0) await new Promise(r => setTimeout(r, waits[attempt - 1]));
try {
const r = await fetchWithTimeout(PL_API, {
method: 'POST',
headers: { 'Content-Type': 'application/json'},
body: JSON.stringify({
model: 'openai',
messages: [
{ role: 'system', content: sysContent},
{ role: 'user', content: user},
],
temperature: 0.9,
}),
}, 55000);
const d = await r.json();
if (!r.ok) continue;
const text = cleanModelText(extractText(d));
if (text) return { text, model: (d && d.model) || 'pollinations' };
} catch (e) { /* 重試 */}
}
return null;
}

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
const { system, user} = await request.json();
if (!user || typeof user!== 'string') {
return new Response(
JSON.stringify({ error: '缺少 user 訊息'}),
{ status: 400, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
}
const sysContent = (system || '你是聖所 Sanctuary 的靈性陪伴者。') + GUARD;

let result = null;
const apiKey = env.OPENROUTER_API_KEY;
if (apiKey) result = await callOpenRouter(apiKey, sysContent, user);
if (!result) result = await callPollinations(sysContent, user);

if (!result) {
return new Response(
JSON.stringify({ error: 'AI_BUSY', message: '聖域暫時靜默，請稍後再試。'}),
{ status: 502, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
}
return new Response(
JSON.stringify({ text: result.text, model: result.model}),
{ status: 200, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
} catch (error) {
return new Response(
JSON.stringify({ error: error.message}),
{ status: 500, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
}
}
