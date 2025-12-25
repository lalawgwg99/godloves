# 聖所 | Sanctuary

> 一個溫柔的心靈聖所,結合聖經智慧與 AI 陪伴

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特色功能

- 🙏 **智慧經文推薦** - 根據心情與處境,AI 推薦合適的聖經經文
- 🎨 **意境圖像生成** - 為每段經文生成專屬的視覺意境
- 🔊 **溫柔語音朗讀** - 以慈愛的聲音朗讀經文與應許
- 💬 **個人化禱告** - AI 生成專屬的禱告文
- 🌙 **極簡美學設計** - 沉浸式的黑暗模式界面

## 🚀 快速開始

### 1. 取得 Gemini API Key

前往 [Google AI Studio](https://aistudio.google.com/app/apikey) 取得免費的 API Key

### 2. 設定 API Key

在 `聖所index.jsx` 第 17 行填入您的 API Key:

```javascript
const apiKey = "YOUR_API_KEY_HERE";
```

### 3. 本地運行

```bash
# 使用 npx (無需安裝)
npx serve -s . -p 3000

# 或安裝後運行
npm install
npm run dev
```

開啟瀏覽器訪問 `http://localhost:3000`

## 📦 部署到 Cloudflare Pages

### 方法一:透過 GitHub (推薦)

1. 推送程式碼到 GitHub
2. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 進入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. 選擇您的儲存庫
5. 建置設定:
   - **Build command**: (留空)
   - **Build output directory**: `/`
   - **Root directory**: `/`
6. 點擊 **Save and Deploy**

### 方法二:直接上傳

```bash
# 安裝 Wrangler CLI
npm install -g wrangler

# 登入 Cloudflare
wrangler login

# 部署
wrangler pages deploy . --project-name=sanctuary-bible
```

## 🛠️ 技術架構

- **前端框架**: React 18 (CDN)
- **UI 樣式**: Tailwind CSS
- **AI 模型**:
  - 文字生成: `gemini-2.5-flash-preview-09-2025`
  - 圖像生成: `imagen-4.0-generate-001`
  - 語音合成: `gemini-2.5-flash-preview-tts`
- **部署**: Cloudflare Pages

## 📁 專案結構

```text
聖所聖經/
├── index.html          # HTML 入口
├── 聖所index.jsx       # React 主組件
├── package.json        # 專案配置
├── .gitignore         # Git 忽略檔案
├── .env.example       # 環境變數範例
└── README.md          # 說明文件
```

## 🎨 自訂設定

### 修改視覺風格

在 `聖所index.jsx` 第 28 行修改 `STYLE_ANCHOR`:

```javascript
const STYLE_ANCHOR = "style: soft sacred minimalism, chiaroscuro lighting...";
```

### 修改語音聲音

在第 192 行修改 `voiceName`:

```javascript
prebuiltVoiceConfig: { voiceName: "Charon" } // 或 "Aoede" (女聲)
```

## 🔒 隱私與安全

- ✅ 所有 API 呼叫直接連接 Google,無第三方伺服器
- ✅ 不儲存任何使用者輸入
- ✅ API Key 僅在瀏覽器本地使用
- ⚠️ 請勿將含有 API Key 的程式碼推送到公開儲存庫

## 📝 授權

MIT License - 自由使用與修改

## 🙏 致謝

感謝 Google Gemini API 提供強大的 AI 能力

---

### 願這個聖所成為你心靈的避風港 ✨
