import React, { useState, useMemo } from 'react'
import Calendar from 'react-calendar'
import { useTasks } from '../contexts/TaskContext'
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import 'react-calendar/dist/Calendar.css'

const CalendarView = () => {
  const { tasks } = useTasks()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState(null)

  // カレンダーに表示するタスクを日付ごとにグループ化
  const tasksByDate = useMemo(() => {
    const grouped = {}
    
    tasks.forEach(task => {
      if (task.dueDateTime) {
        const dateKey = format(new Date(task.dueDateTime), 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(task)
      }
    })
    
    return grouped
  }, [tasks])

  // タイルコンテンツのレンダリング
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayTasks = tasksByDate[dateKey] || []
    
    if (dayTasks.length === 0) return null
    
    return (
      <div className="mt-1">
        {dayTasks.slice(0, 3).map((task, index) => (
          <div
            key={task.id}
            className={`text-xs p-1 rounded mb-1 cursor-pointer truncate ${
              task.completed 
                ? 'bg-gray-200 text-gray-500' 
                : getPriorityColor(task.priority)
            }`}
            onClick={() => setSelectedTask(task)}
            title={task.content}
          >
            {task.content}
          </div>
        ))}
        {dayTasks.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{dayTasks.length - 3}件
          </div>
        )}
      </div>
    )
  }

  // タイルのスタイルを設定（予定がある日を薄青色に）
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null
    
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayTasks = tasksByDate[dateKey] || []
    
    if (dayTasks.length > 0) {
      return 'bg-blue-50 border-blue-200'
    }
    return null
  }

  // 優先度に応じた色を取得
  const getPriorityColor = (priority) => {
    switch (priority) {
      case '高': return 'bg-red-100 text-red-800'
      case '中': return 'bg-orange-100 text-orange-800'
      case '低': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 選択された日付のタスクを取得
  const selectedDateTasks = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate[dateKey] || []
  }, [selectedDate, tasksByDate])

  // カレンダーのスタイルをカスタマイズ
  const calendarStyles = `
    .react-calendar {
      width: 100%;
      border: none;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .react-calendar__tile {
      height: 100px;
      padding: 4px;
      position: relative;
    }
    
    .react-calendar__tile--active {
      background: #3b82f6;
      color: white;
    }
    
    .react-calendar__tile--now {
      background: #fef3c7;
    }
    
    .react-calendar__tile--hasActive {
      background: #dbeafe;
    }
    
    .react-calendar__month-view__days__day--weekend {
      color: #dc2626;
    }
    
    .react-calendar__month-view__days__day--neighboringMonth {
      color: #9ca3af;
    }
    
    /* 予定がある日の薄青色スタイル */
    .react-calendar__tile.bg-blue-50 {
      background-color: #eff6ff !important;
      border: 1px solid #dbeafe !important;
    }
    
    .react-calendar__tile.bg-blue-50:hover {
      background-color: #dbeafe !important;
    }
  `

  return (
    <div className="space-y-6">
      {/* カレンダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <style>{calendarStyles}</style>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          locale="ja-JP"
          calendarType="US"
        />
      </div>

      {/* 選択日付のタスク一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {format(selectedDate, 'M月d日(E)', { locale: ja })} のタスク
        </h3>
        
        {selectedDateTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>この日にはタスクがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateTasks.map(task => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                  task.completed 
                    ? 'bg-gray-50 border-gray-300' 
                    : getPriorityColor(task.priority).replace('100', '50').replace('800', '700')
                }`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.content}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  {task.completed && (
                    <div className="text-green-600 text-xl">✅</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* タスク詳細モーダル */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  タスク詳細
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">内容</h4>
                  <p className="text-gray-900">{selectedTask.content}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">優先度</h4>
                    <span className={`px-2 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>
                
                {selectedTask.dueDateTime && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">締切日時</h4>
                    <p className="text-gray-900">
                      {format(new Date(selectedTask.dueDateTime), 'yyyy年M月d日(E) HH:mm', { locale: ja })}
                    </p>
                  </div>
                )}
                
                {(selectedTask.estimatedHours || selectedTask.actualHours) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTask.estimatedHours && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">見積時間</h4>
                        <p className="text-gray-900">{selectedTask.estimatedHours}h</p>
                      </div>
                    )}
                    {selectedTask.actualHours && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">実績時間</h4>
                        <p className="text-gray-900">{selectedTask.actualHours}h</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedTask.checkpoints && selectedTask.checkpoints.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">チェックポイント</h4>
                    <div className="space-y-1">
                      {selectedTask.checkpoints.map((checkpoint, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className={checkpoint.completed ? 'text-green-600' : 'text-gray-400'}>
                            {checkpoint.completed ? '✅' : '⭕'}
                          </span>
                          <span className={`text-sm ${checkpoint.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {checkpoint.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTask.memo && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">メモ</h4>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">
                      {selectedTask.memo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
