import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  loadNotificationSettings, 
  notifyDeadlineApproaching, 
  notifyTaskCompletion, 
  notifyCheckpointCompletion 
} from '../utils/notifications'

const TaskContext = createContext()

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

export const TaskProvider = ({ children, db }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: false,
    error: null
  })

  // タスクをIndexedDBから読み込み
  const loadTasks = async () => {
    if (!db) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const tasks = await db.getAll('tasks')
      dispatch({ type: 'SET_TASKS', payload: tasks })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // タスクをIndexedDBに保存
  const saveTask = async (task) => {
    if (!db) return
    
    try {
      const id = await db.add('tasks', task)
      const newTask = { ...task, id }
      dispatch({ type: 'ADD_TASK', payload: newTask })
      return newTask
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  // タスクを更新
  const updateTask = async (task) => {
    if (!db) return
    
    try {
      await db.put('tasks', task)
      dispatch({ type: 'UPDATE_TASK', payload: task })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  // タスクを削除
  const deleteTask = async (taskId) => {
    if (!db) return
    
    try {
      await db.delete('tasks', taskId)
      dispatch({ type: 'DELETE_TASK', payload: taskId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  // チェックポイントを更新
  const updateCheckpoint = async (taskId, checkpointIndex, completed) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedCheckpoints = task.checkpoints.map((cp, index) =>
      index === checkpointIndex ? { ...cp, completed } : cp
    )

    const updatedTask = {
      ...task,
      checkpoints: updatedCheckpoints,
      completed: updatedCheckpoints.every(cp => cp.completed)
    }

    await updateTask(updatedTask)

    // チェックポイント完了通知
    if (completed) {
      const settings = loadNotificationSettings()
      if (settings.checkpointNotifications) {
        const checkpoint = updatedCheckpoints[checkpointIndex]
        notifyCheckpointCompletion(updatedTask, checkpoint)
      }
    }
  }

  // タスクの完了状態を切り替え
  const toggleTaskCompletion = async (taskId) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return

    const wasCompleted = task.completed
    const updatedTask = {
      ...task,
      completed: !task.completed,
      checkpoints: task.checkpoints.map(cp => ({ ...cp, completed: !task.completed }))
    }

    await updateTask(updatedTask)

    // タスク完了通知
    if (!wasCompleted && updatedTask.completed) {
      const settings = loadNotificationSettings()
      if (settings.completionNotifications) {
        notifyTaskCompletion(updatedTask)
      }
    }
  }

  // 期限通知の定期チェック
  useEffect(() => {
    if (!state.tasks || state.tasks.length === 0) return

    const checkDeadlines = () => {
      const settings = loadNotificationSettings()
      if (!settings.deadlineNotifications) {
        console.log('期限通知が無効です')
        return
      }

      console.log('期限チェックを実行中...', state.tasks.length, '件のタスク')
      state.tasks.forEach(task => {
        if (task.dueDateTime && !task.completed) {
          notifyDeadlineApproaching(task)
        }
      })
    }

    // 初回チェック（5秒後）
    setTimeout(checkDeadlines, 5000)

    // 10分ごとにチェック（テスト用）
    const interval = setInterval(checkDeadlines, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [state.tasks])

  useEffect(() => {
    if (db) {
      loadTasks()
    }
  }, [db])

  const value = {
    ...state,
    loadTasks,
    saveTask,
    updateTask,
    deleteTask,
    updateCheckpoint,
    toggleTaskCompletion
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}
