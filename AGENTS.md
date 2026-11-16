<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Language

- 回覆、commit 訊息、UI 文案、錯誤訊息、測試 `describe` / `it` 一律使用**繁體中文**（台灣用語）。不要使用簡體中文。
- 程式識別字（變數、函式、檔名、API 路徑、DB 欄位）維持既有英文。

## Project UI conventions

- **Admin panel primary buttons** (search, submit, import, save on page-level forms): use `Button` with `size="lg"` and `className="rounded-full"`. See `.cursor/rules/admin-ui-buttons.mdc` when editing `src/app/admin/**` or `src/components/admin/**`.
- **Admin form field labels** (spacing and typography above inputs): see `.cursor/rules/admin-ui-form-fields.mdc`.
- **Admin back-to-list navigation** (icon button top-left): see `.cursor/rules/admin-ui-back-navigation.mdc` and use `AdminBackToListLink`.
- **Admin form field errors** (紅框 + 欄位下方紅字): see `.cursor/rules/admin-form-field-errors.mdc`.

## Data, auth, payments

- 改資料庫結構請新增 `supabase/migrations/`，不要只在 Dashboard 手動改。
- 後台 mutation（server actions / admin API）須再驗管理員（`profiles.is_admin` / 既有 `is-admin` 檢查），不要只靠頁面 layout。
- 金流、逾期取消、Notify／Return、繼續付款走既有 `src/lib/payuni/` 與相關 API；郵件走 Resend；cron 走 `src/app/api/cron/`。不要硬編碼金鑰，用環境變數。
- 訂單／儀表板日期與「日曆日」語意用 **Asia/Taipei**（既有 payuni expire 與 dashboard 邏輯）。
- Blog 預設關閉（`BLOG_FEATURE_ENABLED`）。未明確要求時不要接上 `/blog` UI。

## Tests (Jest)

- `npm test` / `test:watch` / `test:coverage`。設定見 `jest.config.ts`（預設 `testEnvironment: "node"`）。
- 測試檔可與原始檔同層（`*.test.ts`）。`describe` / `it` 用繁體中文描述情境與預期（可加 `【成功】` / `【錯誤】`）。
- 純函式直接測輸入輸出。API route 請 mock 下游 service，用假 `Request` 測授權與 status／JSON，不要連真 DB。
- 測 React 元件時在該測試檔加上 `@jest-environment jsdom`，不必改全域 config。
