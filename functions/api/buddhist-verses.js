/**
 * 蓮花之路（佛教）經文資料庫
 * 來源：~/workspace/godloves/docs/buddhist-content-research.md
 * 原則：AI 只能引用此庫經文原文，不可編造「佛說」
 */

export const BUDDHIST_VERSES = [
  { id: 'buddha_001', verse: '觀自在菩薩，行深般若波羅蜜多時，照見五蘊皆空，度一切苦厄。', ref: '《心經》', themes: ['看透痛苦'], plain: '深入觀照痛苦的本質，就能超越它', verified: true },
  { id: 'buddha_002', verse: '色不異空，空不異色；色即是空，空即是色。', ref: '《心經》', themes: ['放下執著'], plain: '眼前的一切既真實又如幻，不必緊抓不放', verified: true },
  { id: 'buddha_003', verse: '心無罣礙，無罣礙故，無有恐怖，遠離顛倒夢想，究竟涅槃。', ref: '《心經》', themes: ['克服恐懼', '焦慮', '身心疲憊'], plain: '心中沒有牽掛，就沒有恐懼', verified: true },
  { id: 'buddha_004', verse: '一切有為法，如夢幻泡影，如露亦如電，應作如是觀。', ref: '《金剛經》', themes: ['無常', '看透痛苦'], plain: '世間萬象都如夢幻泡影般短暫', verified: true },
  { id: 'buddha_005', verse: '應無所住，而生其心。', ref: '《金剛經》', themes: ['不執著', '渴望平靜'], plain: '心不住在任何一處，才能真正自由', verified: true },
  { id: 'buddha_006', verse: '凡所有相，皆是虛妄。', ref: '《金剛經》', themes: ['看破表象'], plain: '你看到的表象，都不是事情的全貌', verified: true },
  { id: 'buddha_007', verse: '過去心不可得，現在心不可得，未來心不可得。', ref: '《金剛經》', themes: ['活在當下', '渴望平靜'], plain: '別糾結過去，別焦慮未來，回到此刻', verified: true },
  { id: 'buddha_008', verse: '菩提本無樹，明鏡亦非台，本來無一物，何處惹塵埃。', ref: '《六祖壇經》', themes: ['本性清淨', '尋求安慰'], plain: '你的本性本來清淨，煩惱只是暫時的塵', verified: true },
  { id: 'buddha_009', verse: '何期自性，本自清淨；何期自性，本不生滅；何期自性，本自具足；何期自性，本無動搖；何期自性，能生萬法。', ref: '《六祖壇經》', themes: ['內在具足', '重新開始'], plain: '你以為缺少的，其實本來就具足', verified: true },
  { id: 'buddha_010', verse: '心如工畫師，能畫諸世間，五蘊悉從生，無法而不造。', ref: '《華嚴經》', themes: ['心造世界', '迷失方向'], plain: '你的心如何描繪，世界就如何呈現', verified: true },
  { id: 'buddha_011', verse: '應觀法界性，一切唯心造。', ref: '《華嚴經》', themes: ['轉念', '重新開始', '迷失方向'], plain: '轉一個念，境界就轉了', verified: true },
  { id: 'buddha_012', verse: '若菩薩欲得淨土，當淨其心；隨其心淨，則佛土淨。', ref: '《維摩詰經》', themes: ['從心改變', '迷失方向'], plain: '想改變外境，先從清淨內心開始', verified: true },
  { id: 'buddha_013', verse: '諸行無常，是生滅法；生滅滅已，寂滅為樂。', ref: '《大般涅槃經》', themes: ['無常', '無常中的安寧'], plain: '真正接受無常，反而得到安寧', verified: true },
  { id: 'buddha_014', verse: '不觀他人過，不觀作不作，但觀自身行，作也與非作。', ref: '《法句經》', themes: ['不論斷他人', '關係修復'], plain: '別盯著別人的過錯，把目光帶回自己', verified: true },
  { id: 'buddha_015', verse: '諸法意先導，意主意造作。', ref: '《法句經》', themes: ['起心動念'], plain: '一切以心為前導，善念帶來善果', verified: false },
  { id: 'buddha_016', verse: '我如良醫，知病說藥，服與不服，非醫咎也。', ref: '《佛遺教經》', themes: ['自助'], plain: '佛法是藥方，但吃不吃藥在你手上', verified: true },
  { id: 'buddha_017', verse: '佛法大海，信為能入，智為能度。', ref: '《大智度論》', themes: ['信心與智慧', '需要勇氣'], plain: '以信心入門，以智慧渡到彼岸', verified: true },
  { id: 'buddha_018', verse: '眾因緣生法，我說即是空，亦為是假名，亦是中道義。', ref: '《中論》', themes: ['緣起性空'], plain: '萬物因緣和合，沒有固定不變的本質', verified: true },
  { id: 'buddha_019', verse: '是法不可示，言辭相寂滅。', ref: '《法華經》', themes: ['超越言語'], plain: '最深的道理只能親身體會', verified: true },
  { id: 'buddha_020', verse: '眾生度盡，方證菩提；地獄未空，誓不成佛。', ref: '《地藏菩薩本願經》', themes: ['大悲願力', '需要勇氣'], plain: '最深的慈悲是不放棄任何受苦的人', verified: true },
];

// 心情 → 主題對應
export const MOOD_THEME_MAP = {
  '感到沉重': ['看透痛苦', '無常'],
  '迷失方向': ['從心改變', '心造世界'],
  '需要勇氣': ['信心與智慧', '大悲願力'],
  '尋求安慰': ['克服恐懼', '本性清淨'],
  '渴望平靜': ['活在當下', '不執著'],
  '想要感恩': ['迴向'],
  '關係修復': ['不論斷他人'],
  '身心疲憊': ['克服恐懼'],
  '等候途中': ['無常'],
  '重新開始': ['內在具足', '轉念'],
};

export function pickVerseForMood(moodLabel) {
  const themes = MOOD_THEME_MAP[moodLabel] || ['無常'];
  const candidates = BUDDHIST_VERSES.filter(v =>
    v.verified && v.themes.some(t => themes.includes(t))
  );
  const pool = candidates.length ? candidates : BUDDHIST_VERSES.filter(v => v.verified);
  return pool[Math.floor(Math.random() * pool.length)];
}

// 固定祈願文（不可讓 AI 改寫）
export const REPENTANCE_VERSE = '往昔所造諸惡業，皆由無始貪瞋癡，從身語意之所生，一切我今皆懺悔。';
export const DEDICATION_VERSE = '願消三障諸煩惱，願得智慧真明了，普願罪障悉消除，世世常行菩薩道。';
export const DEDICATION_GENERAL = '願以此功德，莊嚴佛淨土，上報四重恩，下濟三途苦；若有見聞者，悉發菩提心，盡此一報身，同生極樂國。';

// 文化禁忌詞（AI 輸出若出現，擋下重試）
export const FORBIDDEN_WORDS = ['業障', '冤親債主', '前世你是', '你前世', '我已證悟', '我開悟'];
export function violatesTaboo(text) {
  return FORBIDDEN_WORDS.some(w => text.includes(w));
}
