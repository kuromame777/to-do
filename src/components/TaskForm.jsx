import React, { useState } from 'react'
import { useTasks } from '../contexts/TaskContext'
import { format } from 'date-fns'

const TaskForm = ({ onClose, editingTask = null }) => {
  const { saveTask, updateTask } = useTasks()
  const [formData, setFormData] = useState({
    content: editingTask?.content || '',
    priority: editingTask?.priority || '中',
    dueDateTime: editingTask?.dueDateTime ? format(new Date(editingTask.dueDateTime), "yyyy-MM-dd'T'HH:mm") : '',
    estimatedHours: editingTask?.estimatedHours || '',
    actualHours: editingTask?.actualHours || '',
    memo: editingTask?.memo || '',
    checkpoints: editingTask?.checkpoints || [{ text: '', completed: false }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckpointChange = (index, field, value) => {
    const newCheckpoints = [...formData.checkpoints]
    newCheckpoints[index] = {
      ...newCheckpoints[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      checkpoints: newCheckpoints
    }))
  }

  const addCheckpoint = () => {
    setFormData(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, { text: '', completed: false }]
    }))
  }

  const removeCheckpoint = (index) => {
    if (formData.checkpoints.length > 1) {
      const newCheckpoints = formData.checkpoints.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        checkpoints: newCheckpoints
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    setIsSubmitting(true)
    try {
      const taskData = {
        ...formData,
        content: formData.content.trim(),
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        actualHours: formData.actualHours ? parseFloat(formData.actualHours) : null,
        dueDateTime: formData.dueDateTime || null,
        checkpoints: formData.checkpoints.filter(cp => cp.text.trim()),
        completed: false,
        createdAt: editingTask?.createdAt || new Date().toISOString()
      }

      if (editingTask) {
        await updateTask({ ...editingTask, ...taskData })
      } else {
        await saveTask(taskData)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('タスクの保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingTask ? 'タスクを編集' : '新しいタスク'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* タスク内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タスク内容 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="input-field"
              placeholder="タスクの内容を入力してください"
              required
            />
          </div>

          {/* 優先度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              優先度
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="input-field"
            >
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>

          {/* 期限と時間 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                締切日時
              </label>
              <input
                type="datetime-local"
                value={formData.dueDateTime}
                onChange={(e) => handleInputChange('dueDateTime', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                見積時間 (h)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                実績時間 (h)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.actualHours}
                onChange={(e) => handleInputChange('actualHours', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          {/* チェックポイント */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                チェックポイント
              </label>
              <button
                type="button"
                onClick={addCheckpoint}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + 追加
              </button>
            </div>
            <div className="space-y-2">
              {formData.checkpoints.map((checkpoint, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={checkpoint.text}
                    onChange={(e) => handleCheckpointChange(index, 'text', e.target.value)}
                    className="input-field flex-1"
                    placeholder="チェックポイントを入力"
                  />
                  {formData.checkpoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCheckpoint(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              className="input-field"
              rows="3"
              placeholder="追加のメモがあれば入力してください"
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !formData.content.trim()}
            >
              {isSubmitting ? '保存中...' : (editingTask ? '更新' : '作成')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
