/**
* Cloudflare Pages Function - AI 串流代理（聖所 Sanctuary）
* 路徑: POST /api/ai-stream
*
* 請求: { system: string, user: string, format: 'blessing' | 'prayer'}
* 回傳: Server-Sent Events (text/event-stream)
* - data: {"token": "文字片段"}... 持續推送
* - data: {"done": true, "model": "模型名"} 結束
* - data: {"error": "錯誤訊息"} 失敗
*
* 策略：OpenRouter 串流為主（首字約 3~5 秒），失敗則退回 pollinations
* （非串流，一次回傳）。全程繁體中文 guard。
*/

const OR_MODELS = [
'nvidia/nemotron-3-super-120b-a12b:free',
'nvidia/nemotron-3.5-lightning:free',
];
const OR_API = 'https://openrouter.ai/api/v1/chat/completions';
const PL_API = 'https://text.pollinations.ai/openai';

const GUARD_ZH = '\n【輸出規範—非常重要】全程使用繁體中文（台灣用語）。絕對禁止簡體字：你们→你們、发→發、为→為、让→讓、过→過、时→時、来→來、国→國、学→學、对→對，一律寫繁體。只回傳要求的內容，不要加任何前言後語。';
const GUARD_EN = '\n[OUTPUT RULES - VERY IMPORTANT] Respond entirely in English. Do not use Chinese characters. Return only the requested content, no preamble or explanations.';

const SIMPLIFIED_RE = /[们发为让过时来国学对门问经头点电话车无万与专东丝丢两严丽义乌乐乔习书买乱争亲华从仓仪优会传伤伦伟发变实宁审写宽宝寿将尔尘尽层届属岁岂岛岩岭岳岸峡峰岗昼风飞马麦黄黑齐龙龟]/;

function sse(data) {
return `data: ${JSON.stringify(data)}\n\n`;
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

let system = '', user = '', format = 'prayer', lang = 'zh', faith = 'christian', mood = '';
try {
const body = await request.json();
system = body.system || '';
user = body.user || '';
format = body.format || 'prayer';
lang = body.lang || 'zh';
faith = body.faith || 'christian';
mood = body.mood || '';
} catch (e) {}
const isEN = lang === 'en';
const isBuddhist = faith === 'buddhist';
if (!user) {
return new Response(sse({ error: '缺少 user 訊息'}), {
headers: {...corsHeaders, 'Content-Type': 'text/event-stream'},
});
}

let sysContent = (system || (isEN ? 'You are the spiritual companion of Sanctuary.' : '你是聖所 Sanctuary 的靈性陪伴者。')) + (isEN ? GUARD_EN : GUARD_ZH);
if (isBuddhist) {
sysContent += '\n【佛教守則】你是人間佛教的陪伴者（星雲大師淺白＋聖嚴法師溫柔堅定）。絕對禁止：斷言因果（業障、冤親債主、前世）、自稱開悟、編造佛經、把佛菩薩當許願機器。用白話、比喻、短句，多用「你」。';
}
// 祝福用分隔格式，方便前端串流時逐段解析顯示（不用等 JSON 收完）
if (format === 'blessing') {
sysContent += isEN
? '\n[FORMAT] Do NOT use JSON. Output in this delimited format:\nVERSE:(verse)\nREF:(reference)\nPART1:(part 1, 200-250 words)\nPART2:(part 2, 200-250 words)\nPART3:(part 3, 150-200 words)\nIMAGE:(image prompt in English)'
: '\n【格式要求】不要用 JSON，用以下分隔格式逐段輸出：\nVERSE:（經文內容）\nREF:（出處）\nPART1:（第一段 200-250 字）\nPART2:（第二段 200-250 字）\nPART3:（第三段 150-200 字）\nIMAGE:（圖片提示詞，用英文）';
}
const messages = [
{ role: 'system', content: sysContent},
{ role: 'user', content: user},
];

const isBlessing = format === 'blessing';
const stream = new ReadableStream({
async start(controller) {
const enc = new TextEncoder();
const send = (obj) => controller.enqueue(enc.encode(sse(obj)));
let fullText = '';
let ok = false;
let usedModel = '';

// 1. OpenRouter 串流
if (env.OPENROUTER_API_KEY) {
for (const model of OR_MODELS) {
try {
const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), 60000);
const r = await fetch(OR_API, {
method: 'POST',
signal: ctl.signal,
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
'HTTP-Referer': 'https://godloves.pages.dev',
'X-Title': 'Sanctuary',
},
body: JSON.stringify({ model, messages, temperature: 0.9, max_tokens: 2500, stream: true}),
});
if (!r.ok ||!r.body) { clearTimeout(timer); continue;}

const reader = r.body.getReader();
const dec = new TextDecoder();
let buf = '';
let gotToken = false;
try {
while (true) {
const { done, value} = await reader.read();
if (done) break;
buf += dec.decode(value, { stream: true});
const lines = buf.split('\n');
buf = lines.pop();
for (const line of lines) {
const t = line.trim();
if (!t.startsWith('data: ')) continue;
const payload = t.slice(6);
if (payload === '[DONE]') continue;
try {
const d = JSON.parse(payload);
const tok = d.choices && d.choices[0] && d.choices[0].delta
? (d.choices[0].delta.content || ''): '';
if (tok) {
gotToken = true;
fullText += tok;
send({ token: tok});
}
} catch (e) {}
}
}
} finally {
clearTimeout(timer);
try { reader.releaseLock();} catch (e) {}
}
if (gotToken) { ok = true; usedModel = model; break;}
} catch (e) { /* 換下一個模型 */}
}
}

// 2. 備援：pollinations（非串流，一次回傳）
if (!ok) {
try {
const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), 40000);
const r = await fetch(PL_API, {
method: 'POST',
signal: ctl.signal,
headers: { 'Content-Type': 'application/json'},
body: JSON.stringify({ model: 'openai', messages, temperature: 0.9}),
});
clearTimeout(timer);
const d = await r.json();
const text = d && d.choices && d.choices[0] && d.choices[0].message
? d.choices[0].message.content: '';
if (r.ok && text && (isEN ||!SIMPLIFIED_RE.test(text))) {
fullText = text;
// 模擬逐字推送，讓前端體驗一致
const chars = text.match(/[\s\S]{1,8}/g) || [];
for (const c of chars) send({ token: c});
ok = true;
usedModel = (d && d.model) || 'pollinations';
}
} catch (e) {}
}

if (!ok) {
send({ error: '聖域暫時靜默，請稍後再試。'});
} else {
send({ done: true, model: usedModel});
}
controller.close();
},
});

return new Response(stream, {
headers: {
...corsHeaders,
'Content-Type': 'text/event-stream',
'Cache-Control': 'no-cache',
'X-Accel-Buffering': 'no',
},
});
}
