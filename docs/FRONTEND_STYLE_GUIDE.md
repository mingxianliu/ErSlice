# ErSlice 前端規範（摘要）

本檔為 `src-tauri/ai-docs/frontend-style-guide.md` 的摘要版，並對應到實作：
- `src/index.css`：字體階層、表格、列表、分頁、樹狀
- `src/components/ui/Button.tsx`：按鈕變體與尺寸

請在頁面中套用以下類別：
- 標題/文字：`.heading-2`、`.subtitle`、`.text-body`、`.text-caption`
- 表格：`.ui-table`
- 列表列：`.ui-list-row`
- 分頁：`.ui-pagination`、`.ui-page-btn`
- 樹狀：`.ui-tree-row`、`.ui-tree-depth-*`
- 按鈕層級：`<Button size="lg|md|sm" variant="primary|secondary|ghost|icon">`

對話框操作統一右下角：「取消」「儲存」。
