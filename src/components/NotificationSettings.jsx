import React, { useState, useEffect } from 'react'
import { 
  loadNotificationSettings, 
  saveNotificationSettings,
  requestNotificationPermission 
} from '../utils/notifications'

const NotificationSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState(loadNotificationSettings())
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermissionGranted(granted)
  }

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveNotificationSettings(newSettings)
  }

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermissionGranted(granted)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              通知設定
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* 通知許可状況 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">通知許可</h4>
                <p className="text-sm text-gray-600">
                  {permissionGranted ? '✅ 許可済み' : '❌ 未許可'}
                </p>
              </div>
              {!permissionGranted && (
                <button
                  onClick={handleRequestPermission}
                  className="btn-primary text-sm"
                >
                  許可をリクエスト
                </button>
              )}
            </div>
          </div>

          {/* 通知設定 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">期限通知</h4>
                <p className="text-sm text-gray-600">
                  タスクの期限が近づいたら通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deadlineNotifications}
                  onChange={(e) => handleSettingChange('deadlineNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">完了通知</h4>
                <p className="text-sm text-gray-600">
                  タスクが完了したら通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.completionNotifications}
                  onChange={(e) => handleSettingChange('completionNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">チェックポイント通知</h4>
                <p className="text-sm text-gray-600">
                  チェックポイントが完了したら通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.checkpointNotifications}
                  onChange={(e) => handleSettingChange('checkpointNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">日次レポート</h4>
                <p className="text-sm text-gray-600">
                  毎日朝にレポートを通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyReport}
                  onChange={(e) => handleSettingChange('dailyReport', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
            <button
              onClick={async () => {
                const { showNotification } = await import('../utils/notifications')
                showNotification('🔔 テスト通知', {
                  body: '通知機能が正常に動作しています！'
                })
              }}
              className="w-full btn-secondary"
            >
              テスト通知を送信
            </button>
            <button
              onClick={onClose}
              className="w-full btn-primary"
            >
              設定を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
