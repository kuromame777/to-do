import React, { useState } from 'react'
import NotificationSettings from './NotificationSettings'

const Navbar = ({ currentView, onViewChange, onAddTask }) => {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">
              📝 Todo Manager
            </h1>
          </div>

          {/* ビュー切り替えボタン */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewChange('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 リスト
            </button>
            <button
              onClick={() => onViewChange('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentView === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📅 カレンダー
            </button>
          </div>

          {/* ボタン群 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotificationSettings(true)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="通知設定"
            >
              🔔
            </button>
            <button
              onClick={onAddTask}
              className="btn-primary flex items-center space-x-2"
            >
              <span>+</span>
              <span>タスク追加</span>
            </button>
          </div>
        </div>
      </div>

      {/* 通知設定モーダル */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </nav>
  )
}

export default Navbar
