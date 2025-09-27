import React, { useState, useMemo } from 'react'
import TaskCard from './TaskCard'
import { useTasks } from '../contexts/TaskContext'
import { format, isToday, isThisWeek, isPast, isAfter } from 'date-fns'
import { ja } from 'date-fns/locale'

const TaskList = () => {
  const { tasks, loading, error } = useTasks()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  // フィルタリング
  const filteredTasks = useMemo(() => {
    if (!tasks) return []

    const now = new Date()
    
    switch (filter) {
      case 'today':
        return tasks.filter(task => 
          task.dueDateTime && isToday(new Date(task.dueDateTime))
        )
      case 'thisWeek':
        return tasks.filter(task => 
          task.dueDateTime && isThisWeek(new Date(task.dueDateTime))
        )
      case 'overdue':
        return tasks.filter(task => 
          task.dueDateTime && isPast(new Date(task.dueDateTime)) && !task.completed
        )
      case 'incomplete':
        return tasks.filter(task => !task.completed)
      default:
        return tasks
    }
  }, [tasks, filter])

  // ソート
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks]
    
    switch (sortBy) {
      case 'dueDate':
        return sorted.sort((a, b) => {
          if (!a.dueDateTime && !b.dueDateTime) return 0
          if (!a.dueDateTime) return 1
          if (!b.dueDateTime) return -1
          return new Date(a.dueDateTime) - new Date(b.dueDateTime)
        })
      case 'priority':
        const priorityOrder = { '高': 3, '中': 2, '低': 1 }
        return sorted.sort((a, b) => 
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        )
      case 'created':
        return sorted.sort((a, b) => b.id - a.id)
      default:
        return sorted
    }
  }, [filteredTasks, sortBy])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">エラーが発生しました: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* フィルタ・ソートコントロール */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* フィルタ */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">フィルタ:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">すべて</option>
              <option value="today">今日</option>
              <option value="thisWeek">今週</option>
              <option value="overdue">期限切れ</option>
              <option value="incomplete">未完了</option>
            </select>
          </div>

          {/* ソート */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">ソート:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field text-sm"
            >
              <option value="dueDate">期限順</option>
              <option value="priority">優先度順</option>
              <option value="created">作成日順</option>
            </select>
          </div>

          {/* タスク数表示 */}
          <div className="text-sm text-gray-500">
            {sortedTasks.length}件のタスク
          </div>
        </div>
      </div>

      {/* タスク一覧 */}
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              タスクがありません
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? '新しいタスクを追加してみましょう！'
                : 'この条件に合うタスクはありません'
              }
            </p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}

export default TaskList
