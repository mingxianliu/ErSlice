# ErSlice v1.0 - 前端切版說明包生成器

**設計資產管理** | **切版說明包生成** | **AI 自動切版** | **ErAI 生態整合**

> 🌟 **專注使命**: 生成 AI 可依循的前端切版說明包，建立前端開發標準化流程

## 🎯 ErSlice 核心定位

**ErSlice = 前端切版說明包生成器 (基於 design-assets 模式)**

ErSlice 是 ErAI 生態系統中的前端開發標準化工具，專注於：
- 📁 **設計資產管理**: 組織和管理前端模組的設計資源
- **切版說明包生成**: 自動生成標準化的 HTML/CSS 模板
- **AI 切版說明**: 為每個模組生成 AI 可依循的切版指南
- **規範標準化**: 建立統一的前端開發規範

### 🌟 核心特性
- ✅ **標準化設計資產結構** - 基於 design-assets 模式的模組化組織
- ✅ **自動化模板生成** - 從設計稿自動生成 HTML/CSS 模板
- ✅ **AI 切版說明系統** - 生成詳細的切版規格和開發指南
- ✅ **與 ErForge/ErTidy 整合** - 技術棧一致，未來無縫融合

## 🏗️ 專案架構

### 技術棧 (與 ErForge/ErTidy 一致)
- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Rust (Tauri)
- **狀態管理**: Zustand
- **UI 組件**: Radix UI
- **建置工具**: Vite + Vitest

### 目錄結構
```
ErSlice/
├── design-assets/           # 設計資產目錄
│   ├── order-management/    # 訂單管理模組
│   ├── user-management/     # 用戶管理模組
│   ├── product-management/  # 產品管理模組
│   └── system-settings/     # 系統設定模組
├── src/
│   ├── components/          # React 組件
│   ├── pages/              # 頁面組件
│   ├── stores/             # Zustand 狀態管理
│   ├── utils/              # 工具函數
│   └── types/              # TypeScript 類型定義
├── src-tauri/              # Rust 後端
└── templates/               # 模板生成器
```

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev          # 前端開發
npm run tauri:dev    # Tauri 開發
```

### 建置專案
```bash
npm run build        # 前端建置
npm run tauri:build  # Tauri 建置
npm run build:all    # 完整建置
```

## 🚢 釋出流程（Release）

- 本地檢查：
  - `npm run release` 會依序執行：Lint → Format 檢查 → Type Check（生產配置）→ 前端 + Tauri 建置。
  - 在本地確認一切通過後再進行標記（tag）。

- 建立版本與推送標籤：
  - 使用 npm 版號命令（會自動建立 git tag）：
    ```bash
    npm version patch   # 或 minor / major
    git push --follow-tags
    ```
  - 推上以 `v*` 開頭的 tag（例如 `v1.0.1`）後，GitHub Actions 會觸發 `.github/workflows/release.yml`，進行跨平台（Linux / macOS / Windows）Tauri 打包並建立 GitHub Release。
  - 釋出說明（Release Notes）會自動生成：
    - 來源：`package.json` 與 `src-tauri/tauri.conf.json` 的名稱/版本資訊
    - 變更摘要：預設列出與前一個 `v*` 標籤相比的 commit 訊息（無則顯示預設說明）
    - 可選分類（Conventional Commits）：在 Repository → Settings → Variables 設定 `CONVENTIONAL_COMMITS=true` 後，會按 `feat`/`fix`/`refactor`/`docs`/`perf`/`test`/`build`/`ci`/`chore`/`revert` 分類彙整，其餘歸入 `other`

- 簽章（可選）：
  - 若需對安裝包簽章，請在 GitHub 專案的 Secrets 中設定：
    - `TAURI_PRIVATE_KEY`
    - `TAURI_KEY_PASSWORD`
  - 未設定時會以未簽章方式產出測試用安裝包。

### macOS 簽章與公證（可選）

- 在 GitHub 專案 Secrets 設定：
  - `APPLE_CERTIFICATE`（以 base64 編碼的 .p12 / .pfx 憑證）
  - `APPLE_CERTIFICATE_PASSWORD`
  - `APPLE_ID`、`APPLE_PASSWORD`、`APPLE_TEAM_ID`
- Workflow 會在 macOS runner 自動匯入憑證並交由 Tauri Action 進行簽章/公證。若未提供 secrets，步驟會自動略過。

## 🧪 CI 檢查（Checks）

- PR 與推送至 `main` 會觸發 `.github/workflows/checks.yml`：
  - Lint、Format 檢查、`type-check:build`
  - Build（Vite）：驗證前端可成功建置
  - Web 測試（Vitest）與 Tauri 測試（Rust）
- 可透過 Repository → Settings → Variables 設定 `SKIP_TAURI_TESTS=true` 以在 CI 中跳過 Tauri 測試（例如 runner 環境不完整時）。

## 切版說明包結構

每個模組生成的切版說明包包含：

```
module-name/
├── README.md               # 模組規格說明
├── screenshots/            # Figma 截圖 (.png)
├── html/                   # HTML 結構檔案
├── css/                    # CSS 樣式檔案
└── ai-spec.md             # AI 切版規格
```

## 與 ErAI 生態系統的整合

### 發展路徑
1. **ErSlice** - 前端開發標準化工具
2. **ErTidy** - 檔案管理系統
3. **ErForge** - AI 測試與部署系統
4. **未來整合** - ErSlice 融合進 ErForge 生態

### 技術一致性
- 與 ErForge/ErTidy 採用相同的技術棧
- 便於未來的模組整合和功能協作
- 建立統一的 ErAI 開發標準

## 📋 開發狀態

- [x] 專案架構設計
- [x] 基礎配置檔案
- [ ] 核心功能開發
- [ ] 設計資產管理系統
- [ ] 切版說明包生成器
- [ ] AI 切版說明系統
- [ ] 與 ErForge 整合

## 🤝 貢獻指南

歡迎參與 ErSlice 的開發！請遵循：
- 使用 Traditional Chinese (繁體中文) 註解
- 遵循現有的程式碼風格
- 確保與 ErForge/ErTidy 架構一致

## 授權

MIT License - 詳見 [LICENSE](./LICENSE) 檔案

---

**ErSlice Team** - 建立前端開發的標準化未來
