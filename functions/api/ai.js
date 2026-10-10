/**
* Cloudflare Pages Function - AI 代理（聖所 Sanctuary）
* 路徑: POST /api/ai
*
* 請求: { system: string, user: string}
* 回傳: { text: string}（模型原始回覆文字；要求 JSON 時即為 JSON 字串）
*
* 設計原則：快比全重要。總時限 42 秒，超時直接回 AI_BUSY 讓前端顯示備援文案，
* 絕不在後端空轉好幾分鐘。
*
* 第一順位：pollinations.ai 免費文字 API（免 key，失敗乾脆：不是秒回就是秒掛）
* 第二順位：OpenRouter 免費模型（:free only，絕不動帳戶餘額），key 在環境變數
* OPENROUTER_API_KEY。只用實測可用的模型，死掉的 ID 不放進來。
* 圖片由前端直接打 pollinations.ai 圖床（免 key）。
*/

import { pickVerseForMood, violatesTaboo, REPENTANCE_VERSE, DEDICATION_VERSE } from './buddhist-verses.js';

const OR_MODELS = [
'nvidia/nemotron-3.5-lightning:free',
'nvidia/nemotron-3-super-120b-a12b:free',
];
const OR_API = 'https://openrouter.ai/api/v1/chat/completions';
const PL_API = 'https://text.pollinations.ai/openai';

// 後端總時限：超過就收手，前端會顯示備援文案
const TOTAL_BUDGET_MS = 75000;

const GUARD_ZH = '\n【輸出規範—非常重要】全程使用繁體中文（台灣用語）。絕對禁止簡體字：你们→你們、发→發、为→為、让→讓、过→過、时→時、来→來、国→國、学→學、对→對，一律寫繁體。只回傳要求的內容，不要加任何前言後語。';
const GUARD_EN = '\n[OUTPUT RULES - VERY IMPORTANT] Respond entirely in English. Do not use Chinese characters. Return only the requested content, no preamble or explanations.';

// 超時覆蓋「等 headers + 讀 body」全程：abort 會中斷 r.json() 的 body 讀取，
// 避免 response 卡在半路上無限等待（之前 r.json 在保護之外是 bug）。
async function fetchJson(url, opts, ms) {
const ctl = new AbortController();
const t = setTimeout(() => ctl.abort(), ms);
try {
const r = await fetch(url, {...opts, signal: ctl.signal});
const data = await r.json();
return {ok: r.ok, status: r.status, data};
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
// 視為失敗，交給呼叫方換下一個重試。
function stripThinking(text) {
if (!text) return '';
return String(text).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}
function looksLikeThinkingLeak(text) {
const head = String(text).slice(0, 600).toLowerCase();
return /here'?s (a|my) thinking|thinking process|analyze (the)?user request/.test(head);
}
// 簡體字偵測：繁體中文裡絕不出現的字。若出現 2 個以上視為簡體輸出，
// 退回讓呼叫方換下一個模型重試（備援文案本身是繁體，不會有問題）。
const SIMPLIFIED_RE = /[们发为让过时来国学对门问经头点电话车无万与专东丝丢两严丽义乌乐乔习书买乱争亲华从仓仪优会传伤伦伟发变实宁审写宽宝寿将尔尘尽层届属岁岂岛岩岭岳岸峡峰岗昼风飞马麦黄黑齐龙龟]/;
function looksSimplified(text) {
// 清單裡的字在繁體中絕不出現，出現 1 個就是簡體輸出
return SIMPLIFIED_RE.test(String(text));
}
function cleanModelText(raw, isEN, isBuddhist) {
const text = stripThinking(raw);
if (!text || looksLikeThinkingLeak(text)) return null;
if (!isEN && looksSimplified(text)) return null;
if (isBuddhist && violatesTaboo(text)) return null;
return text;
}

function msgs(sysContent, user) {
return [
{ role: 'system', content: sysContent},
{ role: 'user', content: user},
];
}

// 第一順位：pollinations（單次嘗試，超時 ms）
async function tryPollinations(sysContent, user, ms, isEN, isBuddhist) {
try {
const {ok, data} = await fetchJson(PL_API, {
method: 'POST',
headers: { 'Content-Type': 'application/json'},
body: JSON.stringify({ model: 'openai', messages: msgs(sysContent, user), temperature: 0.9}),
}, ms);
if (!ok) return null;
const text = cleanModelText(extractText(data), isEN, isBuddhist);
if (text) return { text, model: (data && data.model) || 'pollinations'};
} catch (e) { /* 超時或斷線 */}
return null;
}

// 第二順位：OpenRouter 免費模型（逐個試，各自超時 ms）
async function tryOpenRouter(apiKey, sysContent, user, msPerModel, timeLeft, isEN, isBuddhist) {
for (const model of OR_MODELS) {
if (timeLeft() < 8000) break; // 時間不夠就別再試了
try {
const {ok, data} = await fetchJson(OR_API, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${apiKey}`,
'HTTP-Referer': 'https://godloves.pages.dev',
'X-Title': 'Sanctuary',
},
body: JSON.stringify({
model,
messages: msgs(sysContent, user),
temperature: 0.9,
max_tokens: 2500,
}),
}, Math.min(msPerModel, timeLeft()));
if (!ok) continue;
const text = cleanModelText(extractText(data), isEN, isBuddhist);
if (text) return { text, model};
} catch (e) { /* 換下一個模型 */}
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

const started = Date.now();
const timeLeft = () => TOTAL_BUDGET_MS - (Date.now() - started);

try {
const { system, user, lang, faith, mood} = await request.json();
if (!user || typeof user!== 'string') {
return new Response(
JSON.stringify({ error: '缺少 user 訊息'}),
{ status: 400, headers: {...corsHeaders, 'Content-Type': 'application/json'}}
);
}
const isEN = lang === 'en';
const isBuddhist = faith === 'buddhist';
let buddhistVerse = null;
if (isBuddhist && mood) {
  buddhistVerse = pickVerseForMood(mood);
}
let sysContent = (system || (isEN ? 'You are the spiritual companion of Sanctuary.' : '你是聖所 Sanctuary 的靈性陪伴者。')) + (isEN ? GUARD_EN : GUARD_ZH);
// 佛教：指定經文＋禁忌 guardrail
if (isBuddhist) {
  sysContent += '\n【佛教守則】你是人間佛教的陪伴者（星雲大師淺白＋聖嚴法師溫柔堅定）。絕對禁止：斷言因果（業障、冤親債主、前世）、自稱開悟、編造佛經、把佛菩薩當許願機器。用白話、比喻、短句，多用「你」。';
  if (buddhistVerse) {
    sysContent += `\n【指定經文】本回合必須引用這段經文原文（不可改寫）：「${buddhistVerse.verse}」——${buddhistVerse.ref}。`;
  }
}

// 1. OpenRouter 主攻（健康時 5~10 秒；每模型 25 秒）
let result = null;
if (timeLeft() > 8000 && env.OPENROUTER_API_KEY) {
result = await tryOpenRouter(env.OPENROUTER_API_KEY, sysContent, user, 25000, timeLeft, isEN, isBuddhist);
}
// 2. pollinations 備援（長文生成約 20~30 秒，給 35 秒）
if (!result && timeLeft() > 10000) {
result = await tryPollinations(sysContent, user, Math.min(35000, timeLeft()), isEN, isBuddhist);
}

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
