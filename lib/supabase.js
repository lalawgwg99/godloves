// lib/supabase.js
// 雲端聖殿連線初始化

const { createClient } = window.supabase;

const SUPABASE_URL = "https://twtfdaglknppkdgihjfe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RQL4WxJyav143AUD0jvyFw_6RX4l-fj";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const checkConnection = async () => {
    try {
        const { data, error } = await supabase.from('journals').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log("✅ Supabase Connected!");
        return true;
    } catch (e) {
        console.error("❌ Supabase Connection Failed:", e.message);
        return false;
    }
};
