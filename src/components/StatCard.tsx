import React from 'react'

// 統一的統計卡片組件
interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  trend?: {
    value: string
    isPositive: boolean
  }
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  color = 'blue',
  trend
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  }

  const trendClasses = trend?.isPositive 
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`text-2xl font-bold text-gray-900 dark:text-white`}>
              {value}
            </div>
            {trend && (
              <div className={`text-sm font-medium ${trendClasses}`}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </div>
        </div>
        <Icon className={`h-8 w-8 ${colorClasses[color]} flex-shrink-0`} />
      </div>
    </div>
  )
}

export default StatCard