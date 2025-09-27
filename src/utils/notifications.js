// ブラウザ通知のユーティリティ関数

// 通知許可をリクエスト
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('このブラウザは通知をサポートしていません')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 通知を表示
export const showNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') {
    console.log('通知が許可されていません')
    return null
  }

  try {
    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'todo-notification',
      requireInteraction: false,
      ...options
    }

    console.log('通知を表示:', title, defaultOptions)
    const notification = new Notification(title, defaultOptions)

    // 通知をクリックしたらフォーカス
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // 5秒後に自動で閉じる
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  } catch (error) {
    console.error('通知の表示に失敗:', error)
    return null
  }
}

// 期限が近づいたタスクの通知
export const notifyDeadlineApproaching = (task) => {
  if (!task.dueDateTime) return
  
  const dueDate = new Date(task.dueDateTime)
  const now = new Date()
  const diffHours = Math.ceil((dueDate - now) / (1000 * 60 * 60))
  
  console.log('期限チェック:', task.content, '残り時間:', diffHours, '時間')
  
  let message = ''
  if (diffHours <= 0) {
    message = '期限が過ぎています！'
  } else if (diffHours <= 1) {
    message = '1時間以内に期限です！'
  } else if (diffHours <= 2) {
    message = '2時間以内に期限です！'
  } else if (diffHours <= 24) {
    message = '24時間以内に期限です！'
  }

  if (message) {
    console.log('期限通知を送信:', message)
    showNotification(`⏰ ${message}`, {
      body: `「${task.content}」の期限: ${dueDate.toLocaleString('ja-JP')}`,
      requireInteraction: true
    })
  }
}

// タスク完了の通知
export const notifyTaskCompletion = (task) => {
  console.log('タスク完了通知を送信:', task.content)
  showNotification('🎉 タスク完了！', {
    body: `「${task.content}」が完了しました`,
    icon: '/icon-192x192.png'
  })
}

// チェックポイント完了の通知
export const notifyCheckpointCompletion = (task, checkpoint) => {
  console.log('チェックポイント完了通知を送信:', task.content, checkpoint.text)
  showNotification('✅ チェックポイント完了', {
    body: `「${task.content}」の「${checkpoint.text}」が完了しました`
  })
}

// 日次レポートの通知
export const notifyDailyReport = (completedTasks, upcomingTasks) => {
  let message = ''
  
  if (completedTasks.length > 0) {
    message += `完了: ${completedTasks.length}件`
  }
  
  if (upcomingTasks.length > 0) {
    if (message) message += ' | '
    message += `今日の予定: ${upcomingTasks.length}件`
  }

  if (message) {
    showNotification('📊 今日のレポート', {
      body: message,
      requireInteraction: false
    })
  }
}

// 通知設定をローカルストレージに保存
export const saveNotificationSettings = (settings) => {
  localStorage.setItem('todo-notification-settings', JSON.stringify(settings))
}

// 通知設定をローカルストレージから読み込み
export const loadNotificationSettings = () => {
  const defaultSettings = {
    deadlineNotifications: true,
    completionNotifications: true,
    checkpointNotifications: false,
    dailyReport: true,
    deadlineWarningHours: [24, 2, 1] // 何時間前に通知するか
  }

  try {
    const saved = localStorage.getItem('todo-notification-settings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  } catch {
    return defaultSettings
  }
}
