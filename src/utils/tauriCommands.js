// ErSlice Tauri 命令調用工具
import { invoke } from '@tauri-apps/api/core';
import { handleTauriError, getUserFriendlyMessage } from './errorHandler';
// 列出資產
export async function listAssets(moduleName) {
    try {
        const result = await invoke('list_assets', { moduleName });
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 刪除資產
export async function deleteDesignAsset(moduleName, assetType, fileName) {
    try {
        return await invoke('delete_design_asset', { moduleName, assetType, fileName });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 封存模組
export async function archiveDesignModule(moduleName) {
    try {
        return await invoke('archive_design_module', { moduleName });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 刪除模組
export async function deleteDesignModule(moduleName) {
    try {
        return await invoke('delete_design_module', { moduleName });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 還原封存模組
export async function unarchiveDesignModule(moduleName) {
    try {
        return await invoke('unarchive_design_module', { moduleName });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 創建設計模組
export async function createDesignModule(name, description) {
    try {
        const result = await invoke('create_design_module', {
            name,
            description
        });
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 獲取設計模組列表
export async function getDesignModules() {
    try {
        const result = await invoke('get_design_modules');
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 獲取封存的設計模組列表
export async function getArchivedDesignModules() {
    try {
        const result = await invoke('get_archived_design_modules');
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 上傳設計資產
export async function uploadDesignAsset(moduleName, assetType, filePath) {
    try {
        const result = await invoke('upload_design_asset', {
            moduleName,
            assetType,
            filePath
        });
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 生成切版說明包
export async function generateSlicePackage(moduleName, options) {
    try {
        const result = await invoke('generate_slice_package', {
            moduleName,
            includeHtml: options.includeHtml,
            includeCss: options.includeCss,
            includeResponsive: options.includeResponsive
        });
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function generateAllSlicePackages(options) {
    try {
        const result = await invoke('generate_all_slice_packages', {
            includeHtml: options.includeHtml,
            includeCss: options.includeCss,
            includeResponsive: options.includeResponsive,
            overwriteStrategy: options.overwriteStrategy ?? 'overwrite'
        });
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function generateSelectedSlicePackages(params) {
    try {
        const result = await invoke('generate_selected_slice_packages', {
            modules: params.modules,
            includeHtml: params.includeHtml,
            includeCss: params.includeCss,
            includeResponsive: params.includeResponsive,
            overwriteStrategy: params.overwriteStrategy ?? 'overwrite'
        });
        return result;
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
// 檢查 Tauri 是否可用
let __tauriAvailableCache = null;
export async function checkTauriAvailable() {
    if (typeof __tauriAvailableCache === 'boolean')
        return __tauriAvailableCache;
    try {
        // 嘗試調用一個簡單的命令來檢查 Tauri 是否可用
        await invoke('get_design_modules');
        __tauriAvailableCache = true;
        return true;
    }
    catch (error) {
        console.warn('Tauri 不可用:', error);
        __tauriAvailableCache = false;
        return false;
    }
}
// 批量操作工具
export class BatchOperationManager {
    constructor() {
        Object.defineProperty(this, "operations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "results", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    // 添加操作
    addOperation(operation) {
        this.operations.push(operation);
    }
    // 執行所有操作
    async executeAll() {
        this.results = [];
        for (const operation of this.operations) {
            try {
                await operation();
                this.results.push({ success: true });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : '未知錯誤';
                this.results.push({ success: false, error: errorMessage });
            }
        }
        return this.results;
    }
    // 獲取成功和失敗的數量
    getSummary() {
        const total = this.results.length;
        const success = this.results.filter(r => r.success).length;
        const failed = total - success;
        return { total, success, failed };
    }
    // 清除操作列表
    clear() {
        this.operations = [];
        this.results = [];
    }
}
// 導出批量操作管理器
export const batchOperationManager = new BatchOperationManager();
export async function generateProjectMermaid() {
    try {
        return await invoke('generate_project_mermaid');
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function generateProjectMermaidHtml() {
    try {
        return await invoke('generate_project_mermaid_html');
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function generateModuleMermaidHtml(module) {
    try {
        return await invoke('generate_module_mermaid_html', { module });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function generateModuleCrudMermaidHtml(module) {
    try {
        return await invoke('generate_module_crud_mermaid_html', { module });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function generatePageMermaidHtml(module, page) {
    try {
        return await invoke('generate_page_mermaid_html', { module, page });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function generateUnifiedSlicePackage(params) {
    try {
        const res = await invoke('generate_unified_slice_package', {
            externalDesignAssetsRoot: params.externalDesignAssetsRoot,
            aiDocFrontendInstructions: params.aiDocFrontendInstructions,
            aiDocUiFriendly: params.aiDocUiFriendly,
            includeHtml: params.includeHtml,
            includeCss: params.includeCss,
            includeResponsive: params.includeResponsive,
            includeSpecs: params.includePageSpecs ?? false,
            overwriteStrategy: params.overwriteStrategy ?? 'overwrite',
            makeZip: params.makeZip ?? true,
        });
        return {
            outputDir: res.output_dir,
            zipPath: res.zip_path ?? null,
            modulesCount: res.modules_count,
        };
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function getDefaultProject() {
    try {
        return await invoke('get_or_init_default_project');
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function updateDefaultProject(cfg) {
    try {
        return await invoke('update_default_project', { config: cfg });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function getModulePages(moduleName) {
    try {
        return await invoke('get_module_pages', { moduleName });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function getModuleTree(moduleName) {
    try {
        return await invoke('get_module_tree', { moduleName });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function setPageOrder(moduleName, order) {
    try {
        return await invoke('set_page_order', { moduleName, order });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function setSubpageOrder(moduleName, parentSlug, order) {
    try {
        return await invoke('set_subpage_order', { moduleName, parentSlug, order });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function createModulePage(moduleName, slug) {
    try {
        return await invoke('create_module_page', { moduleName, slug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function deleteModulePage(moduleName, slug) {
    try {
        return await invoke('delete_module_page', { moduleName, slug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function renameModulePage(moduleName, fromSlug, toSlug) {
    try {
        return await invoke('rename_module_page', { moduleName, fromSlug, toSlug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function createSubpage(moduleName, parentSlug, slug) {
    try {
        return await invoke('create_subpage', { moduleName, parentSlug, slug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function deleteSubpage(moduleName, parentSlug, slug) {
    try {
        return await invoke('delete_subpage', { moduleName, parentSlug, slug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function renameSubpage(moduleName, parentSlug, fromSlug, toSlug) {
    try {
        return await invoke('rename_subpage', { moduleName, parentSlug, fromSlug, toSlug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function applyCrudSubpages(moduleName, parentSlug) {
    try {
        return await invoke('apply_crud_subpages', { moduleName, parentSlug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function listProjects() {
    try {
        return await invoke('list_projects');
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function createProject(slug, name) {
    try {
        return await invoke('create_project', { slug, name });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function deleteProject(slug) {
    try {
        return await invoke('delete_project', { slug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function switchProject(slug) {
    try {
        return await invoke('switch_project', { slug });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function updatePageMeta(moduleName, slug, meta) {
    try {
        return await invoke('update_page_meta', { moduleName, slug, meta });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
export async function updateSubpageMeta(moduleName, parentSlug, slug, meta) {
    try {
        return await invoke('update_subpage_meta', { moduleName, parentSlug, slug, meta });
    }
    catch (error) {
        const ersliceError = handleTauriError(error);
        throw new Error(getUserFriendlyMessage(ersliceError));
    }
}
