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
}

export function EntryEditor({ entry, onUpdate }: EntryEditorProps) {
  const [formData, setFormData] = useState(entry)

  const handleChange = (field: keyof SubtitleEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Edit Entry #{entry.index + 1}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Korean Text
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
            Chinese Text
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
            Start Time (seconds)
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
            End Time (seconds)
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

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  )
}
