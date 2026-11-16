# MyShop

以 Next.js 打造的電商前台與後台：商品瀏覽、購物車結帳、會員中心，以及訂單／商品／內容管理。金流走 PAYUNi，資料與登入由 Supabase 提供。

## 技術棧

- **框架**：Next.js 16（App Router）、React 19、TypeScript
- **樣式**：Tailwind CSS 4、shadcn/ui
- **後端**：Supabase（Auth、Postgres、Storage、RLS）
- **金流**：PAYUNi UPP（台灣）
- **郵件**：Resend（選用）
- **部署**：Vercel（含排程 cron）

## 功能一覽

### 前台

| 功能 | 說明 |
|------|------|
| 首頁 | Hero、精選商品、產品畫廊、品牌理念、購物須知（後台可編輯） |
| 商品 | 列表搜尋／分類／價格篩選／排序；詳情含圖庫、庫存、相關商品 |
| 購物車／願望清單 | 瀏覽器 `localStorage`（未同步到帳號） |
| 結帳 | **需登入**；宅配或超商取貨；建立訂單後導向 PAYUNi 付款 |
| 會員中心 | 訂單查詢、繼續付款、個人資料與預設收件地址 |
| 客服／靜態頁 | 依 slug 顯示後台維護的內容頁；頁尾快速連結 |

### 後台（`/admin`）

| 功能 | 說明 |
|------|------|
| 儀表板 | 會員數、今日訂單、本月營收與近 7 日圖表 |
| 會員管理 | 搜尋篩選、詳情、管理員備註、停用帳號、管理員權限 |
| 訂單管理 | 狀態與備註、出貨／取貨完成、PAYUNi 金流與物流查詢 |
| 商品管理 | CRUD、分類、多圖上傳與排序、富文字說明、上下架／售完 |
| 系統設定 | 站台資訊、首頁各區塊、客服頁與頁尾連結 |

### 整合與自動化

- **PAYUNi**：信用卡／ATM／超商／LINE Pay 等；Notify／Return 回調；逾期未付自動取消並還庫存
- **Resend**：付款成功、出貨／可取貨通知（未設定則略過）
- **Vercel Cron**：取消過期待付款訂單；同步宅配已配達狀態

## 啟動步驟

### 1. 環境需求

- Node.js 20+（建議）
- [Supabase](https://supabase.com) 專案
- （選用）PAYUNi 商家、Resend、Vercel

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境變數

專案根目錄建立 `.env.local`：

```bash
# 必填：Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 站台網址（OAuth 回調、金流／郵件連結）
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 金流 PAYUNi（本機可暫不設；結帳需設定）
PAYUNI_MER_ID=
PAYUNI_HASH_KEY=
PAYUNI_HASH_IV=
PAYUNI_SANDBOX=true

# 郵件 Resend（選用）
RESEND_API_KEY=
RESEND_FROM=
ADMIN_NOTIFICATION_EMAIL=

# Cron（正式環境建議設定）
CRON_SECRET=
```

資料庫請套用 `supabase/migrations/` 內的 migration（Supabase CLI 或 Dashboard SQL）。

### 4. 啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)。

| 路徑 | 用途 |
|------|------|
| `/` | 前台首頁 |
| `/login` | 會員登入／註冊 |
| `/admin/login` | 後台登入（需 `profiles.is_admin = true`） |

### 5. 其他指令

```bash
npm run build   # 正式建置
npm run start   # 以建置結果啟動
npm run lint    # ESLint
```

## 注意事項

- 結帳需登入，目前無訪客結帳。
- 購物車與願望清單僅存於本機瀏覽器。
- Blog 路由已實作但預設關閉（feature flag）。
- 正式金流、webhook、cron 需設定 `SUPABASE_SERVICE_ROLE_KEY`、PAYUNi 與 `CRON_SECRET`。
- AI／Agent 開發約定見 [`AGENTS.md`](./AGENTS.md)。
