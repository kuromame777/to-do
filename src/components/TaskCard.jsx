import React, { useState } from 'react'
import ProgressBar from './ProgressBar'
import { useTasks } from '../contexts/TaskContext'
import { format, isToday, isPast, isAfter, addDays } from 'date-fns'
import { ja } from 'date-fns/locale'

const TaskCard = ({ task }) => {
  const { updateTask, deleteTask, updateCheckpoint, toggleTaskCompletion } = useTasks()
  const [showDetails, setShowDetails] = useState(false)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '高': return 'priority-high'
      case '中': return 'priority-medium'
      case '低': return 'priority-low'
      default: return 'priority-low'
    }
  }

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case '高': return 'bg-red-100 text-red-800'
      case '中': return 'bg-orange-100 text-orange-800'
      case '低': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDueDateTimeColor = (dueDateTime) => {
    if (!dueDateTime) return 'text-gray-500'
    
    const due = new Date(dueDateTime)
    const now = new Date()
    const diffHours = Math.ceil((due - now) / (1000 * 60 * 60))
    
    if (isPast(due)) return 'text-red-600 font-semibold'
    if (diffHours <= 2) return 'text-orange-600 font-semibold'
    if (diffHours <= 24) return 'text-orange-500'
    return 'text-green-600'
  }

  const formatDueDateTime = (dueDateTime) => {
    if (!dueDateTime) return '期限なし'
    
    const due = new Date(dueDateTime)
    const now = new Date()
    const diffHours = Math.ceil((due - now) / (1000 * 60 * 60))
    
    if (isToday(due)) {
      return `今日 ${format(due, 'HH:mm')}`
    }
    if (diffHours === 24) return `明日 ${format(due, 'HH:mm')}`
    if (diffHours === -24) return `昨日 ${format(due, 'HH:mm')}`
    if (isPast(due)) return `${Math.abs(Math.ceil(diffHours / 24))}日前 ${format(due, 'HH:mm')}`
    
    return format(due, 'M月d日(E) HH:mm', { locale: ja })
  }

  const handleCheckpointToggle = async (checkpointIndex) => {
    const checkpoint = task.checkpoints[checkpointIndex]
    await updateCheckpoint(task.id, checkpointIndex, !checkpoint.completed)
  }

  const handleTaskCompletion = async () => {
    await toggleTaskCompletion(task.id)
  }

  const handleDelete = async () => {
    if (window.confirm('このタスクを削除しますか？')) {
      await deleteTask(task.id)
    }
  }

  const completedCheckpoints = task.checkpoints.filter(cp => cp.completed).length
  const totalCheckpoints = task.checkpoints.length
  const progressPercentage = totalCheckpoints > 0 ? (completedCheckpoints / totalCheckpoints) * 100 : 0

  return (
    <div className={`card ${getPriorityColor(task.priority)} transition-all duration-200 hover:shadow-lg`}>
      {/* メインコンテンツ */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleTaskCompletion}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.content}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {/* 期限と時間情報 */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className={getDueDateTimeColor(task.dueDateTime)}>
              📅 {formatDueDateTime(task.dueDateTime)}
            </span>
            {task.estimatedHours && (
              <span>⏱️ 見積: {task.estimatedHours}h</span>
            )}
            {task.actualHours && (
              <span>✅ 実績: {task.actualHours}h</span>
            )}
          </div>

          {/* 進捗バー */}
          {totalCheckpoints > 0 && (
            <div className="mb-3">
              <ProgressBar 
                percentage={progressPercentage} 
                completed={completedCheckpoints}
                total={totalCheckpoints}
              />
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showDetails ? '詳細を閉じる' : '詳細を見る'}
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              削除
            </button>
          </div>
        </div>

        {/* 完了アニメーション */}
        {task.completed && progressPercentage === 100 && (
          <div className="text-2xl animate-bounce-in">
            🎉
          </div>
        )}
      </div>

      {/* 詳細セクション */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-up">
          {/* チェックポイント */}
          {totalCheckpoints > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">チェックポイント</h4>
              <div className="space-y-2">
                {task.checkpoints.map((checkpoint, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkpoint.completed}
                      onChange={() => handleCheckpointToggle(index)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm ${checkpoint.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {checkpoint.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* メモやその他の詳細情報 */}
          {task.memo && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">メモ</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {task.memo}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskCard
