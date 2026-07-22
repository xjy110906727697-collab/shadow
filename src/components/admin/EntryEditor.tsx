'use client'

import { useState } from 'react'

interface SubtitleEntry {
  id: string
  index: number
  startTime: number
  endTime: number
  ko: string
  zh: string
}

interface EntryEditorProps {
  entry: SubtitleEntry
  onUpdate: (entry: SubtitleEntry) => void
  onClose?: () => void
}

export function EntryEditor({ entry, onUpdate, onClose }: EntryEditorProps) {
  const [formData, setFormData] = useState(entry)

  const handleChange = (field: keyof SubtitleEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onUpdate(formData)
    onClose?.()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">编辑条目 #{entry.index + 1}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            韩语文本
          </label>
          <textarea
            value={formData.ko}
            onChange={e => handleChange('ko', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            中文文本
          </label>
          <textarea
            value={formData.zh}
            onChange={e => handleChange('zh', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            开始时间（秒）
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.startTime}
            onChange={e => handleChange('startTime', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            结束时间（秒）
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.endTime}
            onChange={e => handleChange('endTime', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          保存修改
        </button>
        <button
          onClick={onClose}
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
        >
          取消
        </button>
      </div>
    </div>
  )
}
