import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import TaskList from './components/TaskList'
import CalendarView from './components/CalendarView'
import TaskForm from './components/TaskForm'
import { TaskProvider } from './contexts/TaskContext'
import { openDB } from 'idb'
import { requestNotificationPermission } from './utils/notifications'

function App() {
  const [currentView, setCurrentView] = useState('list')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [db, setDb] = useState(null)

  useEffect(() => {
    // IndexedDBの初期化
    const initDB = async () => {
      try {
        const database = await openDB('TodoAppDB', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('tasks')) {
              const store = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true })
              store.createIndex('dueDateTime', 'dueDateTime')
              store.createIndex('priority', 'priority')
              store.createIndex('completed', 'completed')
            }
          },
        })
        setDb(database)
      } catch (error) {
        console.error('IndexedDB initialization failed:', error)
      }
    }

    // 通知許可をリクエスト
    const initNotifications = async () => {
      await requestNotificationPermission()
    }

    initDB()
    initNotifications()
  }, [])

  if (!db) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <TaskProvider db={db}>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onAddTask={() => setShowTaskForm(true)}
        />
        
        <main className="container mx-auto px-4 py-6">
          {currentView === 'list' ? (
            <TaskList />
          ) : (
            <CalendarView />
          )}
        </main>

        {showTaskForm && (
          <TaskForm onClose={() => setShowTaskForm(false)} />
        )}
      </div>
    </TaskProvider>
  )
}

export default App
