import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
// Toast 組件
const ToastComponent = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        // 顯示動畫
        const showTimer = setTimeout(() => setIsVisible(true), 100);
        // 自動隱藏
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration || 5000);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [toast.id, toast.duration, onRemove]);
    // 獲取圖標
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return _jsx(CheckCircleIcon, { className: "h-5 w-5 text-green-500" });
            case 'error':
                return _jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-500" });
            case 'warning':
                return _jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-yellow-500" });
            case 'info':
                return _jsx(InformationCircleIcon, { className: "h-5 w-5 text-blue-500" });
            default:
                return _jsx(InformationCircleIcon, { className: "h-5 w-5 text-gray-500" });
        }
    };
    // 獲取背景色
    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
        }
    };
    return (_jsx("div", { className: `
        ${getBackgroundColor()}
        border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: getIcon() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 dark:text-white", children: toast.title }), toast.message && (_jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-300", children: toast.message })), toast.action && (_jsx("button", { onClick: toast.action.onClick, className: "mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300", children: toast.action.label }))] }), _jsx("button", { onClick: () => onRemove(toast.id), className: "flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors", "aria-label": "\u95DC\u9589\u901A\u77E5", title: "\u95DC\u9589\u901A\u77E5", children: _jsx(XMarkIcon, { className: "h-4 w-4" }) })] }) }));
};
export const ToastContainer = ({ toasts, onRemove }) => {
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 space-y-2 max-w-sm", children: toasts.map((toast) => (_jsx(ToastComponent, { toast: toast, onRemove: onRemove }, toast.id))) }));
};
// Toast Hook
export const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const addToast = (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);
    };
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    const showSuccess = (title, message) => {
        addToast({ type: 'success', title, message });
    };
    const showError = (title, message) => {
        addToast({ type: 'error', title, message });
    };
    const showWarning = (title, message) => {
        addToast({ type: 'warning', title, message });
    };
    const showInfo = (title, message) => {
        addToast({ type: 'info', title, message });
    };
    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};
