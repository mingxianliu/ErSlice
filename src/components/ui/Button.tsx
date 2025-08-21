import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// 按鈕變體定義
const buttonVariants = cva(
  // 基礎樣式
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      // 尺寸變體
      size: {
        sm: "px-3 py-2 text-sm rounded-lg",           // 小按鈕
        md: "px-4 py-2 text-sm rounded-lg",           // 中按鈕
        lg: "px-6 py-3 text-base rounded-xl",         // 大按鈕
      },
      // 變體樣式
      variant: {
        // 主要按鈕 - 進一步柔和的藍色漸變
        primary: "bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-400 dark:to-blue-500 text-white border border-blue-200 dark:border-blue-400 hover:from-blue-300 hover:to-blue-400 dark:hover:from-blue-500 dark:hover:to-blue-600 hover:border-blue-300 dark:hover:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-200 shadow-sm hover:shadow-md",
        
        // 次要按鈕 - 更柔和的灰色漸變
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-500 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-500 dark:hover:to-gray-600 hover:border-gray-400 dark:hover:border-gray-400 focus:ring-gray-200 dark:focus:ring-gray-300 shadow-sm hover:shadow-md",
        
        // 成功按鈕 - 更柔和的綠色漸變
        success: "bg-gradient-to-r from-emerald-300 to-emerald-400 dark:from-emerald-400 dark:to-emerald-500 text-white border border-emerald-300 dark:border-emerald-400 hover:from-emerald-400 hover:to-emerald-500 dark:hover:from-emerald-500 dark:hover:to-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-300 shadow-sm hover:shadow-md",
        
        // 警告按鈕 - 更柔和的琥珀色漸變
        warning: "bg-gradient-to-r from-amber-300 to-amber-400 dark:from-amber-400 dark:to-amber-500 text-white border border-amber-300 dark:border-amber-400 hover:from-amber-400 hover:to-amber-500 dark:hover:from-amber-500 dark:hover:to-amber-600 hover:border-amber-400 dark:hover:border-amber-500 focus:ring-amber-200 dark:focus:ring-amber-300 shadow-sm hover:shadow-md",
        
        // 危險按鈕 - 更柔和的紅色漸變
        danger: "bg-gradient-to-r from-rose-300 to-rose-400 dark:from-rose-400 dark:to-rose-500 text-white border border-rose-300 dark:border-rose-400 hover:from-rose-400 hover:to-rose-500 dark:hover:from-rose-500 dark:hover:to-rose-600 hover:border-rose-400 dark:hover:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-300 shadow-sm hover:shadow-md",
        
        // 資訊按鈕 - 最柔和的中性色偏藍（保持淺）
        info: "bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-500 hover:from-slate-100 hover:to-gray-200 dark:hover:from-slate-700/40 dark:hover:to-gray-700/40 hover:border-slate-300 dark:hover:border-slate-400 focus:ring-slate-200 dark:focus:ring-slate-300 shadow-sm hover:shadow-md",
        
        // 輕量按鈕 - 無背景，只有邊框（更淡）
        ghost: "bg-transparent text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-gray-200 dark:focus:ring-gray-300",
        
        // 圖標按鈕 - 圓形，適合圖標（更淡）
        icon: "p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 focus:ring-gray-200 dark:focus:ring-gray-300",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "secondary",
    },
  }
)

// 按鈕組件 Props 介面
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// 按鈕組件
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ size, variant, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
