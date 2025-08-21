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
      // 變體樣式 - 純色設計，專業簡潔
      variant: {
        // 主要按鈕 - 純藍色
        primary: "bg-blue-600 dark:bg-blue-500 text-white border border-blue-600 dark:border-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 hover:border-blue-700 dark:hover:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-200 shadow-sm hover:shadow-md",
        
        // 次要按鈕 - 純灰色
        secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-400 focus:ring-gray-200 dark:focus:ring-gray-300 shadow-sm hover:shadow-md",
        
        // 成功按鈕 - 純綠色
        success: "bg-green-600 dark:bg-green-500 text-white border border-green-600 dark:border-green-500 hover:bg-green-700 dark:hover:bg-green-600 hover:border-green-700 dark:hover:border-green-600 focus:ring-green-200 dark:focus:ring-green-300 shadow-sm hover:shadow-md",
        
        // 警告按鈕 - 純琥珀色
        warning: "bg-amber-600 dark:bg-amber-500 text-white border border-amber-600 dark:border-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 hover:border-amber-700 dark:hover:border-amber-600 focus:ring-amber-200 dark:focus:ring-amber-300 shadow-sm hover:shadow-md",
        
        // 危險按鈕 - 純紅色
        danger: "bg-red-600 dark:bg-red-500 text-white border border-red-600 dark:border-red-500 hover:bg-red-700 dark:hover:bg-red-600 hover:border-red-700 dark:hover:border-red-600 focus:ring-red-200 dark:focus:ring-red-300 shadow-sm hover:shadow-md",
        
        // 資訊按鈕 - 純藍灰色
        info: "bg-slate-600 dark:bg-slate-500 text-white border border-slate-600 dark:border-slate-500 hover:bg-slate-700 dark:hover:bg-slate-600 hover:border-slate-700 dark:hover:border-slate-600 focus:ring-slate-200 dark:focus:ring-slate-300 shadow-sm hover:shadow-md",
        
        // 輕量按鈕 - 無背景，只有邊框
        ghost: "bg-transparent text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-gray-200 dark:focus:ring-gray-300",
        
        // 圖標按鈕 - 圓形，適合圖標
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
