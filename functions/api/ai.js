/**
* Cloudflare Pages Function - AI 代理（聖所 Sanctuary）
* 路徑: POST /api/ai
*
* 請求: { system: string, user: string}
* 回傳: { text: string}（模型原始回覆文字；要求 JSON 時即為 JSON 字串）
*
* 文字走 pollinations.ai 免費文字 API（https://text.pollinations.ai/openai），
* 無需任何 key、無需環境變數。圖片由前端直接打 pollinations.ai 圖床，同樣免 key。
*/

const TEXT_API = 'https://text.pollinations.ai/openai';
const MODEL = 'openai'; // pollinations 預設主力模型

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

export async function onRequestPost(context) {
const { request} = context;

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
let lastErr = 'unknown';

// 最多試 2 次（免費共享服務偶爾超時）
for (let attempt = 0; attempt < 2; attempt++) {
try {
const r = await fetchWithTimeout(TEXT_API, {
method: 'POST',
headers: { 'Content-Type': 'application/json'},
body: JSON.stringify({
model: MODEL,
messages: [
{ role: 'system', content: sysContent},
{ role: 'user', content: user},
],
temperature: 0.9,
}),
}, 55000);
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
JSON.stringify({ text, model: (d && d.model) || MODEL}),
{ status: 200, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
} catch (e) {
lastErr = e.name === 'AbortError'? 'timeout': (e.message || String(e));
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
