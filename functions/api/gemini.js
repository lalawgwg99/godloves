/**
 * Cloudflare Pages Function - Gemini API 代理
 * 路徑: /api/gemini
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS 設定
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 處理 OPTIONS 請求 (CORS preflight)
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // 從環境變數取得 API Key
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: '伺服器未設定 API Key' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // 解析請求
        const { url, body } = await request.json();

        if (!url || !body) {
            return new Response(
                JSON.stringify({ error: '缺少必要參數' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // 將 API Key 加入 URL
        const apiUrl = `${url}${url.includes('?') ? '&' : '?'}key=${apiKey}`;

        // 轉發請求到 Gemini API
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await geminiResponse.json();

        // 回傳結果
        return new Response(
            JSON.stringify(data),
            {
                status: geminiResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
}
