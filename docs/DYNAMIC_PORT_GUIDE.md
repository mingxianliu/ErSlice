# 動態端口分配系統使用指南

ErSlice 現在支持動態端口分配，自動解決開發環境中的端口衝突問題。

## 🚀 快速開始

### 使用動態端口啟動開發服務器（推薦）

```bash
npm run dev:auto
# 或
npm run tauri:dev:auto
```

這個命令會：
- 🔍 自動尋找可用端口（從 28888 開始）
- 🔄 動態更新 Tauri 配置  
- 📝 生成端口配置文件
- 🦀 啟動完整的 Tauri + React 開發環境

### 傳統固定端口模式

如果你需要使用固定端口：

```bash
# 使用默認端口 28888（如果可用）
npm run dev:local

# 或指定特定端口
PORT=3000 npm run dev:port
```

## 📋 可用命令

| 命令 | 描述 | 端口行為 |
|------|------|----------|
| `npm run dev:auto` | 動態端口 Vite 開發服務器 | 自動尋找可用端口 |
| `npm run tauri:dev:auto` | 動態端口 Tauri 開發環境 | 自動尋找可用端口 + Tauri |
| `npm run dev` | 標準 Vite 開發服務器 | Vite 默認行為 |
| `npm run dev:local` | 固定端口開發服務器 | 固定使用 28888 |
| `npm run dev:port` | 環境變量端口服務器 | 使用 `PORT` 環境變量 |

## 🛠️ 技術細節

### 端口檢測邏輯

系統按以下優先級檢測端口：

1. **環境變量**: `PORT=3000 npm run dev:auto`
2. **自動檢測**: 從 28888 開始尋找可用端口
3. **默認端口**: 28888

### 自動生成的配置

動態端口系統會自動生成 `src/config/dev-server.js`：

```javascript
export const DEV_SERVER_CONFIG = {
  port: 28889,
  baseUrl: 'http://127.0.0.1:28889',
  timestamp: '2025-08-19T13:44:51.643Z'
}
```

### 前端端口檢測

使用提供的工具函數在前端代碼中檢測當前端口：

```typescript
import { getDevServerPort, getDevServerBaseUrl } from '@/utils/portDetection'

// 獲取當前開發服務器端口
const port = getDevServerPort()
console.log('開發服務器端口:', port)

// 獲取完整的基礎 URL
const baseUrl = getDevServerBaseUrl()
console.log('基礎 URL:', baseUrl)
```

### React Hook 用法

```tsx
import { usePortConfig } from '@/utils/portDetection'

function MyComponent() {
  const { port, baseUrl, isDevelopment } = usePortConfig()
  
  return (
    <div>
      {isDevelopment && (
        <p>開發服務器運行在: {baseUrl}</p>
      )}
    </div>
  )
}
```

## 🔧 配置選項

### 環境變量

- `PORT`: 指定起始端口號
- `NODE_ENV`: 環境模式（development/production）

### Vite 配置

`vite.config.ts` 已配置支持動態端口：

```typescript
server: {
  port: process.env.PORT ? parseInt(process.env.PORT) : 28888,
  host: '127.0.0.1',
  strictPort: false // 允許自動尋找可用端口
}
```

## 🐛 故障排除

### 常見問題

**Q: 為什麼 Tauri 無法連接到前端？**
A: 確保使用 `npm run tauri:dev:auto` 而不是 `npm run tauri:dev`，自動腳本會處理端口配置。

**Q: 如何查看當前使用的端口？**
A: 查看控制台輸出或檢查自動生成的 `src/config/dev-server.js` 文件。

**Q: 可以強制使用特定端口嗎？**
A: 使用 `PORT=<端口號> npm run dev:auto` 或使用固定端口命令。

### 日志輸出說明

```
🎯 ErSlice 動態端口開發服務器啟動中...
🚀 啟動 Vite 開發服務器...
✅ Vite 服務器已啟動，端口: 28889
✅ 已更新 Tauri 配置: devUrl = http://127.0.0.1:28889
✅ 已創建端口配置文件: src/config/dev-server.js
🦀 啟動 Tauri 開發環境...
🎉 開發環境已啟動
```

## 🔄 從固定端口遷移

如果你之前使用固定端口，建議：

1. **更新開發命令**: 將 `npm run tauri:dev` 改為 `npm run tauri:dev:auto`
2. **檢查硬編碼端口**: 搜索代碼中的 `28888` 並使用動態檢測函數替換
3. **更新構建腳本**: 如有必要，更新 CI/CD 腳本使用新命令

## 💡 最佳實踐

1. **使用動態端口**: 開發時優先使用 `dev:auto` 命令
2. **端口檢測**: 在前端代碼中使用提供的工具函數而非硬編碼
3. **環境隔離**: 不同項目使用不同的起始端口範圍
4. **文檔同步**: 團隊成員都使用相同的開發命令

## 📚 相關文件

- `scripts/dev-server.js` - 動態端口分配腳本
- `src/utils/portDetection.ts` - 前端端口檢測工具
- `vite.config.ts` - Vite 配置
- `src-tauri/tauri.conf.json` - Tauri 配置（自動更新）
- `src/config/dev-server.js` - 自動生成的端口配置

## 🎯 總結

動態端口分配系統解決了多項目開發中的端口衝突問題，提供了：

- ✅ **自動端口檢測** - 無需手動處理端口衝突
- ✅ **配置自動同步** - Tauri 配置自動更新
- ✅ **開發體驗優化** - 一個命令啟動完整環境  
- ✅ **向後兼容** - 保留原有的固定端口選項
- ✅ **前端工具支持** - 提供完整的端口檢測 API

推薦所有開發者使用 `npm run dev:auto` 作為主要的開發命令！