import React from 'react'

const ProgressBar = ({ percentage, completed, total }) => {
  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-1">
      {/* 進捗バー */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {/* 進捗テキスト */}
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>
          {completed} / {total} 完了
        </span>
        <span className="font-medium">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

export default ProgressBar


